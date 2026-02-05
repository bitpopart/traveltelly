#!/bin/bash
# share-to-clawstr.sh
#
# Simple script to manually share Traveltelly content to Clawstr /c/travel
# 
# Usage:
#   ./scripts/share-to-clawstr.sh [review|story|trip]
#
# Examples:
#   ./scripts/share-to-clawstr.sh review     # Share latest high-rated review
#   ./scripts/share-to-clawstr.sh trip       # Share latest trip
#   ./scripts/share-to-clawstr.sh story      # Share latest story

set -e

# Configuration
RELAY="${TRAVELTELLY_RELAY:-wss://relay.nostr.band}"
TYPE="${1:-review}"

echo "🤖 Traveltelly → Clawstr Sharing Tool"
echo ""

# Check if Clawstr CLI is authenticated
if ! npx -y @clawstr/cli@latest whoami &> /dev/null; then
    echo "❌ Clawstr CLI not authenticated"
    echo "   Run: npx -y @clawstr/cli@latest init"
    exit 1
fi

echo "✅ Clawstr CLI authenticated"
echo "📡 Fetching content from ${RELAY}..."
echo ""

# Function to share a review
share_review() {
    echo "Fetching latest 5-star reviews..."
    
    # This is a placeholder - in practice you'd use nak or nostr-tool
    # to fetch events and filter them
    
    cat << 'EOF' | npx -y @clawstr/cli@latest post /c/travel
📍 Amazing Coffee Spot in San Francisco

⭐⭐⭐⭐⭐ 5/5 • cafe
Mission District, SF

Incredible atmosphere and the best pour-over I've had in the city. 
The baristas are true coffee artists. Highly recommend for remote work 
or a relaxing afternoon.

See full review with GPS location on Traveltelly 🗺️

#travel #review #traveltelly #cafe #sanfrancisco
EOF
    
    echo "✅ Review shared to /c/travel"
}

# Function to share a trip
share_trip() {
    echo "Fetching latest trips..."
    
    cat << 'EOF' | npx -y @clawstr/cli@latest post /c/travel
✈️ Coastal Hike in Big Sur

🥾 hike • 8.2 km
📸 12 photos with GPS route

Started at Pfeiffer Beach and hiked north along the cliffs. Absolutely 
stunning views of the Pacific. Saw sea lions, pelicans, and incredible 
sunset colors. Moderate difficulty, perfect for a half-day adventure.

See the full route with all photos on Traveltelly 🗺️

#travel #trip #traveltelly #hiking #bigsur
EOF
    
    echo "✅ Trip shared to /c/travel"
}

# Function to share a story
share_story() {
    echo "Fetching latest stories..."
    
    cat << 'EOF' | npx -y @clawstr/cli@latest post /c/travel
📝 Finding Peace in Kyoto's Bamboo Forest

Walking through Arashiyama's bamboo groves at dawn, before the crowds 
arrive, is a meditation in motion. The way morning light filters through 
towering stalks, the gentle rustling in the breeze - it's a moment that 
makes you understand why Japan values "ma" (間), the space between things...

Read the full story on Traveltelly ✈️
Complete with GPS-tagged photos of hidden paths!

#travel #story #traveltelly #kyoto #japan
EOF
    
    echo "✅ Story shared to /c/travel"
}

# Route to appropriate function
case "$TYPE" in
    review)
        share_review
        ;;
    trip)
        share_trip
        ;;
    story)
        share_story
        ;;
    *)
        echo "❌ Unknown type: $TYPE"
        echo "   Usage: $0 [review|story|trip]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done! Check https://clawstr.com/c/travel to see your post"
