NIP-Reviewstr
=============

Location-Based Reviews
----------------------

`draft` `optional`

This NIP defines `kind:34879`: an addressable event for location-based reviews that allow users to share their experiences and provide feedback on places they've visited.

## Review Events

Review events are addressable events that contain structured metadata about a location review including ratings, categories, location data, and optional Lightning payment preferences.

### Content

The `.content` field should contain the review text/comment in Markdown format. This field is required but can be an empty string if only a rating is provided.

### Author

The `.pubkey` field represents the reviewer who created the review.

### Required Tags

- `d` (required) - unique identifier for the review, typically a random string
- `title` (required) - title/name of the place being reviewed
- `rating` (required) - star rating from 1-5 as a string
- `category` (required) - category of the place (see categories below)

### Optional Tags

- `description` (optional) - brief description/summary of the place
- `location` (optional) - human-readable location string
- `g` (optional) - geohash for precise location coordinates
- `image` (optional) - URL to uploaded photo of the place
- `lightning` (optional) - "yes" or "no" to indicate if Lightning tips are accepted
- `published_at` (optional) - unix timestamp when first published
- `t` (optional, repeated) - hashtags for additional categorization

### Categories

The `category` tag should use one of these standardized values:

**🛍️ Shops & Stores**
- `grocery-store`
- `clothing-store` 
- `electronics-store`
- `convenience-store`

**🍽️ Food & Drink**
- `restaurant`
- `cafe`
- `fast-food`
- `bar-pub`

**🏨 Places**
- `hotel`
- `motel`
- `hostel`
- `landmarks`

**🧰 Services**
- `bank`
- `salon-spa`
- `car-repair`
- `laundry`

**🏥 Health**
- `hospital`
- `clinic`
- `pharmacy`
- `dentist`

**🏞️ Outdoor & Fun**
- `park`
- `beach`
- `playground`
- `hiking-trail`
- `cycling-trail`

**🎭 Entertainment**
- `museum`
- `movie-theater`
- `zoo`
- `music-venue`

**🏫 Education & Public**
- `school`
- `library`
- `post-office`
- `police-station`

**🚗 Transport**
- `gas-station`
- `bus-stop`
- `train-station`
- `parking-lot`

**🛐 Religious**
- `church`
- `mosque`
- `temple`
- `synagogue`
- `shrine`

## Example Event

```json
{
  "kind": 34879,
  "created_at": 1675642635,
  "content": "Great coffee and friendly staff! The atmosphere is perfect for working or meeting friends. Highly recommend the cappuccino.",
  "tags": [
    ["d", "cafe-review-abc123"],
    ["title", "Blue Bottle Coffee"],
    ["rating", "5"],
    ["category", "cafe"],
    ["description", "Specialty coffee shop in downtown"],
    ["location", "123 Main St, San Francisco, CA"],
    ["g", "9q8yy"],
    ["image", "https://example.com/photo.jpg"],
    ["lightning", "yes"],
    ["published_at", "1675642635"],
    ["t", "coffee"],
    ["t", "downtown"],
    ["alt", "Review of Blue Bottle Coffee - 5 stars"]
  ],
  "pubkey": "...",
  "id": "..."
}
```

## Lightning Zaps

Reviews can be zapped using NIP-57 Lightning Zaps. When `lightning` tag is set to "yes", the review indicates the reviewer accepts Lightning tips for their review.

## Querying Reviews

To query reviews for a specific category:
```
["REQ", "reviews", {"kinds": [34879], "#t": ["cafe"], "limit": 50}]
```

To query reviews by location (using geohash):
```
["REQ", "local-reviews", {"kinds": [34879], "#g": ["9q8yy"], "limit": 50}]
```

To query reviews by a specific author:
```
["REQ", "user-reviews", {"kinds": [34879], "authors": ["pubkey..."], "limit": 50}]
```