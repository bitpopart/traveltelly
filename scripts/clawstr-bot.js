#!/usr/bin/env node
/**
 * Clawstr Travel Bot - Automated Posting Script
 * 
 * Fetches high-quality content from Traveltelly and posts to /c/travel on Clawstr
 * 
 * Usage:
 *   node scripts/clawstr-bot.js
 * 
 * Environment Variables:
 *   CLAWSTR_SECRET_KEY - Your bot's Nostr secret key (nsec format)
 *   TRAVELTELLY_RELAY - Relay to fetch content from (default: wss://relay.nostr.band)
 *   DRY_RUN - Set to 'true' to preview posts without publishing
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  relay: process.env.TRAVELTELLY_RELAY || 'wss://relay.nostr.band',
  dryRun: process.env.DRY_RUN === 'true',
  maxPostsPerRun: 1, // Only post 1 item per run to avoid spam
  minRating: 4, // Only share reviews with 4+ stars
  minContentLength: 100, // Only share reviews with substantial content
};

/**
 * Format star rating
 */
function formatStars(rating) {
  return '⭐'.repeat(parseInt(rating));
}

/**
 * Format review for Clawstr
 */
function formatReview(review) {
  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const rating = review.tags.find(([name]) => name === 'rating')?.[1] || '0';
  const location = review.tags.find(([name]) => name === 'location')?.[1] || '';
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  
  const stars = formatStars(rating);
  
  // Truncate content if too long
  let content = review.content;
  if (content.length > 280) {
    content = content.substring(0, 277) + '...';
  }
  
  return `📍 ${title}

${stars} ${rating}/5${category ? ` • ${category}` : ''}
${location}

${content}

See full review on Traveltelly 🗺️

#travel #review #traveltelly${category ? ` #${category}` : ''}`;
}

/**
 * Format story for Clawstr
 */
function formatStory(story) {
  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const summary = story.tags.find(([name]) => name === 'summary')?.[1] || '';
  
  // Extract first 280 chars if no summary
  let preview = summary || story.content.substring(0, 280);
  if (preview.length >= 280 && !summary) {
    preview = preview.substring(0, 277) + '...';
  }
  
  return `📝 ${title}

${preview}

Read the full story on Traveltelly ✈️

#travel #story #traveltelly`;
}

/**
 * Format trip for Clawstr
 */
function formatTrip(trip) {
  const title = trip.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const category = trip.tags.find(([name]) => name === 'category')?.[1] || '';
  const distance = trip.tags.find(([name]) => name === 'distance')?.[1] || '';
  const distanceUnit = trip.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  const imageCount = trip.tags.filter(([name]) => name === 'image').length;
  
  const activityEmoji = 
    category === 'hike' ? '🥾' : 
    category === 'cycling' ? '🚴' : 
    '🚶';
  
  // Truncate content if too long
  let content = trip.content;
  if (content.length > 200) {
    content = content.substring(0, 197) + '...';
  }
  
  return `✈️ ${title}

${activityEmoji} ${category}${distance ? ` • ${distance} ${distanceUnit}` : ''}
📸 ${imageCount} photos with GPS route

${content}

See the full route on Traveltelly 🗺️

#travel #trip #traveltelly${category ? ` #${category}` : ''}`;
}

/**
 * Filter quality content
 */
function isQualityContent(event, type) {
  // Check content length
  if (event.content.length < CONFIG.minContentLength) {
    return false;
  }
  
  // For reviews, check rating
  if (type === 'review') {
    const rating = event.tags.find(([name]) => name === 'rating')?.[1];
    if (!rating || parseInt(rating) < CONFIG.minRating) {
      return false;
    }
  }
  
  // Check for image
  const hasImage = event.tags.some(([name]) => name === 'image');
  if (!hasImage) {
    return false;
  }
  
  return true;
}

/**
 * Post to Clawstr using CLI
 */
async function postToClawstr(content) {
  if (CONFIG.dryRun) {
    console.log('\n--- DRY RUN - Would post the following ---\n');
    console.log(content);
    console.log('\n--- End of post ---\n');
    return;
  }
  
  try {
    const escapedContent = content.replace(/"/g, '\\"');
    const command = `npx -y @clawstr/cli@latest post /c/travel "${escapedContent}"`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error('Error posting to Clawstr:', stderr);
      return false;
    }
    
    console.log('✅ Posted to Clawstr:', stdout);
    return true;
  } catch (error) {
    console.error('Failed to post to Clawstr:', error.message);
    return false;
  }
}

/**
 * Fetch events from Nostr relay using nak
 */
async function fetchEvents(kinds, limit = 20) {
  try {
    const kindsStr = kinds.join(',');
    const command = `nak req -k ${kindsStr} --limit ${limit} ${CONFIG.relay}`;
    
    const { stdout } = await execAsync(command);
    
    // Parse JSONL output
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const events = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
    
    return events;
  } catch (error) {
    console.error('Failed to fetch events:', error.message);
    return [];
  }
}

/**
 * Select best content to share
 */
function selectContentToShare(reviews, stories, trips) {
  const candidates = [];
  
  // Add quality reviews
  reviews
    .filter(r => isQualityContent(r, 'review'))
    .forEach(r => candidates.push({ type: 'review', event: r, priority: 3 }));
  
  // Add trips (higher priority)
  trips
    .filter(t => isQualityContent(t, 'trip'))
    .forEach(t => candidates.push({ type: 'trip', event: t, priority: 2 }));
  
  // Add stories (medium priority)
  stories
    .filter(s => isQualityContent(s, 'story'))
    .forEach(s => candidates.push({ type: 'story', event: s, priority: 1 }));
  
  // Sort by priority (trips > stories > reviews)
  candidates.sort((a, b) => a.priority - b.priority);
  
  // Return top candidates
  return candidates.slice(0, CONFIG.maxPostsPerRun);
}

/**
 * Main bot function
 */
async function main() {
  console.log('🤖 Traveltelly Clawstr Bot Starting...\n');
  
  if (CONFIG.dryRun) {
    console.log('⚠️  DRY RUN MODE - No posts will be published\n');
  }
  
  // Check for Clawstr CLI
  try {
    await execAsync('npx -y @clawstr/cli@latest whoami');
    console.log('✅ Clawstr CLI authenticated\n');
  } catch (error) {
    console.error('❌ Clawstr CLI not authenticated. Run: npx -y @clawstr/cli@latest init');
    process.exit(1);
  }
  
  console.log(`📡 Fetching content from ${CONFIG.relay}...\n`);
  
  // Fetch content
  const [reviews, stories, trips] = await Promise.all([
    fetchEvents([34879], 20), // Reviews
    fetchEvents([30023], 20), // Stories
    fetchEvents([30025], 20), // Trips
  ]);
  
  console.log(`Found ${reviews.length} reviews, ${stories.length} stories, ${trips.length} trips\n`);
  
  // Select content to share
  const toShare = selectContentToShare(reviews, stories, trips);
  
  if (toShare.length === 0) {
    console.log('⚠️  No quality content found to share');
    return;
  }
  
  console.log(`Selected ${toShare.length} item(s) to share:\n`);
  
  // Post each item
  for (const item of toShare) {
    let formatted;
    
    switch (item.type) {
      case 'review':
        formatted = formatReview(item.event);
        break;
      case 'story':
        formatted = formatStory(item.event);
        break;
      case 'trip':
        formatted = formatTrip(item.event);
        break;
    }
    
    console.log(`Posting ${item.type}...`);
    await postToClawstr(formatted);
    
    // Wait 2 seconds between posts to avoid rate limiting
    if (toShare.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n✅ Bot run complete!');
}

// Run bot
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
