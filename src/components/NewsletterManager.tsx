import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Trash2, Check, X, Send, Sparkles, Loader2, UserPlus, RefreshCw, ExternalLink } from 'lucide-react';
import { useNewsletterSubscribers, useUnsubscribeFromNewsletter } from '@/hooks/useNewsletter';
import { useLatestReviews, useLatestStories, useLatestTrips, useLatestStockMediaItems } from '@/hooks/useLatestItems';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { createClawstrPost } from '@/lib/clawstr';
import { format } from 'date-fns';
import { nip19 } from 'nostr-tools';

interface NewsletterItem {
  id: string;
  type: 'review' | 'story' | 'trip' | 'media';
  title: string;
  content: string;
  naddr: string;
  image?: string;
}

export function NewsletterManager() {
  const [selectedItems, setSelectedItems] = useState<NewsletterItem[]>([]);
  const [customText, setCustomText] = useState('');
  const [customLinks, setCustomLinks] = useState<{ title: string; url: string }[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  const { data: subscribers = [], isLoading: loadingSubscribers } = useNewsletterSubscribers();
  const { data: reviews = [] } = useLatestReviews();
  const { data: stories = [] } = useLatestStories();
  const { data: trips = [] } = useLatestTrips();
  const { data: stockMedia = [] } = useLatestStockMediaItems();
  const { mutate: unsubscribe } = useUnsubscribeFromNewsletter();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();

  const activeSubscribers = subscribers.filter(sub => sub.status === 'active');

  // Auto-generate newsletter on mount
  useEffect(() => {
    if (reviews.length > 0 || stories.length > 0 || trips.length > 0 || stockMedia.length > 0) {
      generateNewsletter();
    }
  }, [reviews, stories, trips, stockMedia]);

  const generateNewsletter = () => {
    const items: NewsletterItem[] = [];
    
    // Add latest reviews
    reviews.slice(0, 3).forEach(review => {
      const rating = review.event.tags.find(([name]) => name === 'rating')?.[1] || '0';
      const location = review.event.tags.find(([name]) => name === 'location')?.[1] || '';
      const category = review.event.tags.find(([name]) => name === 'category')?.[1] || '';
      
      items.push({
        id: review.event.id,
        type: 'review',
        title: review.title,
        content: `⭐ ${rating}/5 • ${category}${location ? `\n📍 ${location}` : ''}\n\n${review.event.content}`,
        naddr: review.naddr,
        image: review.image,
      });
    });
    
    // Add latest stories
    stories.slice(0, 3).forEach(story => {
      const summary = story.event.tags.find(([name]) => name === 'summary')?.[1] || story.event.content.substring(0, 200);
      
      items.push({
        id: story.event.id,
        type: 'story',
        title: story.title,
        content: summary,
        naddr: story.naddr,
        image: story.image,
      });
    });
    
    // Add latest trips
    trips.slice(0, 3).forEach(trip => {
      const category = trip.event.tags.find(([name]) => name === 'category')?.[1] || '';
      const distance = trip.event.tags.find(([name]) => name === 'distance')?.[1] || '';
      const distanceUnit = trip.event.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
      const photoCount = trip.event.tags.filter(([name]) => name === 'image').length;
      
      items.push({
        id: trip.event.id,
        type: 'trip',
        title: trip.title,
        content: `${category}${distance ? ` • ${distance} ${distanceUnit}` : ''}\n📸 ${photoCount} photos with GPS route\n\n${trip.event.content}`,
        naddr: trip.naddr,
        image: trip.image,
      });
    });
    
    // Add latest stock media
    stockMedia.slice(0, 3).forEach(media => {
      const price = media.event.tags.find(([name]) => name === 'price');
      const priceText = price ? `💰 ${price[1]} ${price[2]}` : '';
      const summary = media.event.tags.find(([name]) => name === 'summary')?.[1] || '';
      
      items.push({
        id: media.event.id,
        type: 'media',
        title: media.title,
        content: `${summary}\n${priceText}`,
        naddr: media.naddr,
        image: media.image,
      });
    });
    
    setSelectedItems(items);
    
    toast({
      title: 'Newsletter generated!',
      description: `Loaded ${items.length} items from latest content.`,
    });
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const addLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    
    setCustomLinks(prev => [...prev, { title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const removeLink = (index: number) => {
    setCustomLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveSubscriber = (email: string) => {
    if (confirm(`Remove ${email} from newsletter?`)) {
      unsubscribe(email, {
        onSuccess: () => {
          toast({
            title: 'Subscriber removed',
            description: `${email} has been unsubscribed.`,
          });
        },
      });
    }
  };

  const generateEmailHTML = () => {
    const reviewItems = selectedItems.filter(i => i.type === 'review');
    const storyItems = selectedItems.filter(i => i.type === 'story');
    const tripItems = selectedItems.filter(i => i.type === 'trip');
    const mediaItems = selectedItems.filter(i => i.type === 'media');
    
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Traveltelly Newsletter</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 28px;">🌍 Traveltelly Newsletter</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">Latest travel content from around the world</p>
  </div>
  
  <div style="background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none;">
`;

    if (customText) {
      html += `
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <p style="margin: 0; white-space: pre-wrap;">${customText}</p>
    </div>
`;
    }

    // Reviews section
    if (reviewItems.length > 0) {
      html += `
    <h2 style="color: #27b0ff; border-bottom: 2px solid #27b0ff; padding-bottom: 10px; margin-top: 0;">📍 Latest Reviews</h2>
`;
      reviewItems.forEach(item => {
        html += `
    <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
      ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
      <h3 style="margin: 0 0 10px; color: #1f2937;"><a href="https://traveltelly.com/review/${item.naddr}" style="color: #27b0ff; text-decoration: none;">${item.title}</a></h3>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #6b7280;">${item.content}</p>
    </div>
`;
      });
    }

    // Stories section
    if (storyItems.length > 0) {
      html += `
    <h2 style="color: #b2d235; border-bottom: 2px solid #b2d235; padding-bottom: 10px; margin-top: 30px;">📝 Latest Stories</h2>
`;
      storyItems.forEach(item => {
        html += `
    <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
      ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
      <h3 style="margin: 0 0 10px; color: #1f2937;"><a href="https://traveltelly.com/story/${item.naddr}" style="color: #b2d235; text-decoration: none;">${item.title}</a></h3>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #6b7280;">${item.content}</p>
    </div>
`;
      });
    }

    // Trips section
    if (tripItems.length > 0) {
      html += `
    <h2 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 10px; margin-top: 30px;">✈️ Latest Trips</h2>
`;
      tripItems.forEach(item => {
        html += `
    <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
      ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
      <h3 style="margin: 0 0 10px; color: #1f2937;"><a href="https://traveltelly.com/trip/${item.naddr}" style="color: #ffcc00; text-decoration: none;">${item.title}</a></h3>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #6b7280;">${item.content}</p>
    </div>
`;
      });
    }

    // Stock Media section
    if (mediaItems.length > 0) {
      html += `
    <h2 style="color: #ec1a58; border-bottom: 2px solid #ec1a58; padding-bottom: 10px; margin-top: 30px;">📸 New Stock Media</h2>
`;
      mediaItems.forEach(item => {
        html += `
    <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
      ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 10px;">` : ''}
      <h3 style="margin: 0 0 10px; color: #1f2937;"><a href="https://traveltelly.com/media/preview/${item.naddr}" style="color: #ec1a58; text-decoration: none;">${item.title}</a></h3>
      <p style="margin: 0; white-space: pre-wrap; font-size: 14px; color: #6b7280;">${item.content}</p>
    </div>
`;
      });
    }

    // Custom links
    if (customLinks.length > 0) {
      html += `
    <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 15px; color: #92400e;">🔗 Featured Links</h3>
`;
      customLinks.forEach(link => {
        html += `
      <div style="margin: 10px 0;">
        <a href="${link.url}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${link.title} →</a>
      </div>
`;
      });
      html += `
    </div>
`;
    }

    html += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>You're receiving this because you subscribed to Traveltelly newsletter.</p>
      <p style="margin: 10px 0;">
        <a href="https://traveltelly.com" style="color: #667eea; text-decoration: none;">Visit Traveltelly</a> • 
        <a href="mailto:unsubscribe@traveltelly.com" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
      </p>
      <p style="margin: 10px 0 0;">🌍 Travel the world, share your experiences, own your data ✈️📸</p>
    </div>
  </div>
</body>
</html>
`;
    
    return html;
  };

  const generateNostrContent = () => {
    const reviewItems = selectedItems.filter(i => i.type === 'review');
    const storyItems = selectedItems.filter(i => i.type === 'story');
    const tripItems = selectedItems.filter(i => i.type === 'trip');
    const mediaItems = selectedItems.filter(i => i.type === 'media');
    
    let content = `📬 Traveltelly Newsletter - ${format(new Date(), 'MMMM d, yyyy')}\n\n`;
    
    if (customText) {
      content += `${customText}\n\n`;
    }
    
    if (reviewItems.length > 0) {
      content += `📍 LATEST REVIEWS\n`;
      reviewItems.forEach((item, i) => {
        content += `${i + 1}. ${item.title}\n`;
      });
      content += `\n`;
    }
    
    if (storyItems.length > 0) {
      content += `📝 LATEST STORIES\n`;
      storyItems.forEach((item, i) => {
        content += `${i + 1}. ${item.title}\n`;
      });
      content += `\n`;
    }
    
    if (tripItems.length > 0) {
      content += `✈️ LATEST TRIPS\n`;
      tripItems.forEach((item, i) => {
        content += `${i + 1}. ${item.title}\n`;
      });
      content += `\n`;
    }
    
    if (mediaItems.length > 0) {
      content += `📸 NEW STOCK MEDIA\n`;
      mediaItems.forEach((item, i) => {
        content += `${i + 1}. ${item.title}\n`;
      });
      content += `\n`;
    }
    
    if (customLinks.length > 0) {
      content += `🔗 FEATURED LINKS\n`;
      customLinks.forEach(link => {
        content += `• ${link.title}: ${link.url}\n`;
      });
      content += `\n`;
    }
    
    content += `\n🌍 Visit Traveltelly: https://traveltelly.com\n\n#traveltelly #newsletter #travel`;
    
    return content;
  };

  const handleSendNewsletter = async () => {
    if (activeSubscribers.length === 0) {
      toast({
        title: 'No subscribers',
        description: 'Add subscribers before sending newsletter.',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedItems.length === 0) {
      toast({
        title: 'No content selected',
        description: 'Generate newsletter or add content first.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      // In a real app, this would send emails via backend
      // For now, we'll just publish to Nostr and Clawstr
      
      const emailHTML = generateEmailHTML();
      const nostrContent = generateNostrContent();
      
      // Log email list and HTML for manual sending
      console.log('📧 Newsletter Recipients:', activeSubscribers.map(s => s.email));
      console.log('📧 Email HTML:', emailHTML);
      
      // Publish to Nostr
      publishEvent({
        kind: 1,
        content: nostrContent,
        tags: [
          ['t', 'newsletter'],
          ['t', 'traveltelly'],
          ['subject', `Traveltelly Newsletter - ${format(new Date(), 'MMMM d, yyyy')}`],
        ],
      });
      
      // Share to Clawstr
      const clawstrContent = `📬 Traveltelly Newsletter - ${format(new Date(), 'MMM d, yyyy')}

Latest travel content:
${reviewItems.length > 0 ? `📍 ${reviewItems.length} Reviews` : ''}
${storyItems.length > 0 ? `📝 ${storyItems.length} Stories` : ''}
${tripItems.length > 0 ? `✈️ ${tripItems.length} Trips` : ''}
${mediaItems.length > 0 ? `📸 ${mediaItems.length} Stock Media` : ''}

${customText || 'Discover amazing travel experiences!'}

Full newsletter: https://traveltelly.com

#traveltelly #newsletter #travel`;

      const clawstrEvent = createClawstrPost(
        clawstrContent,
        'https://clawstr.com/c/travel',
        [
          ['t', 'newsletter'],
          ['t', 'traveltelly'],
          ['t', 'travel'],
        ]
      );

      publishEvent(clawstrEvent);
      
      toast({
        title: 'Newsletter published!',
        description: `Published to Nostr and Clawstr. Email HTML copied to console for manual sending.`,
      });
      
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: 'Failed to publish',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyEmailHTML = () => {
    const html = generateEmailHTML();
    navigator.clipboard.writeText(html);
    toast({
      title: 'HTML copied!',
      description: 'Email HTML copied to clipboard. Paste into your email service.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Manager</h2>
          <p className="text-sm text-muted-foreground">
            Generate and send newsletters to {activeSubscribers.length} subscribers
          </p>
        </div>
        <Button onClick={generateNewsletter} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose Newsletter</TabsTrigger>
          <TabsTrigger value="subscribers">
            Subscribers ({activeSubscribers.length})
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-6">
          {/* Custom Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Introduction Text</CardTitle>
              <CardDescription>Add custom text at the top of the newsletter</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add a personal message or announcement..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Custom Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Links</CardTitle>
              <CardDescription>Add important links to feature in the newsletter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {customLinks.length > 0 && (
                <div className="space-y-2">
                  {customLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Link title"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                  />
                  <Input
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                  />
                </div>
                <Button onClick={addLink} disabled={!newLinkTitle || !newLinkUrl}>
                  Add Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Newsletter Content</CardTitle>
              <CardDescription>
                {selectedItems.length} items selected • Click X to remove items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Click "Generate" or "Regenerate" to load latest content
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {['review', 'story', 'trip', 'media'].map(type => {
                    const items = selectedItems.filter(i => i.type === type);
                    if (items.length === 0) return null;
                    
                    const sectionTitle = {
                      review: '📍 Reviews',
                      story: '📝 Stories',
                      trip: '✈️ Trips',
                      media: '📸 Stock Media',
                    }[type];
                    
                    const sectionColor = {
                      review: '#27b0ff',
                      story: '#b2d235',
                      trip: '#ffcc00',
                      media: '#ec1a58',
                    }[type];
                    
                    return (
                      <div key={type}>
                        <h3 className="font-semibold mb-3" style={{ color: sectionColor }}>
                          {sectionTitle}
                        </h3>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {item.content}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Newsletter
              </CardTitle>
              <CardDescription>
                Will send to {activeSubscribers.length} active subscribers and publish to Nostr + Clawstr
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sendSuccess && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600 dark:text-green-400">
                    ✅ Newsletter published to Nostr and Clawstr! Email HTML is in browser console.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSendNewsletter}
                  disabled={isSending || selectedItems.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Newsletter
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={copyEmailHTML}
                  variant="outline"
                  disabled={selectedItems.length === 0}
                >
                  📋 Copy Email HTML
                </Button>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> Email sending requires a backend service. For now, the newsletter will be:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Published as a Nostr note (kind 1)</li>
                    <li>Shared to Clawstr /c/travel</li>
                    <li>Email HTML copied to console (for manual sending)</li>
                  </ul>
                  See console for email HTML to paste into Mailchimp, SendGrid, etc.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Active Subscribers ({activeSubscribers.length})</span>
                {loadingSubscribers && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </CardTitle>
              <CardDescription>
                Manage newsletter subscribers • Stored as Nostr kind 30080 events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeSubscribers.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No subscribers yet. Add a newsletter subscription form to your site to collect emails.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {activeSubscribers.map(sub => (
                    <div key={sub.email} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{sub.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {sub.name && (
                            <span className="text-xs text-muted-foreground">{sub.name}</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(sub.subscribedAt * 1000), 'MMM d, yyyy')}
                          </Badge>
                          {sub.source && (
                            <Badge variant="secondary" className="text-xs">
                              {sub.source}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubscriber(sub.email)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
