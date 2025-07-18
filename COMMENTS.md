# Comment System for Reviews

This application implements a comment system for reviews using NIP-22 (Comment) from the Nostr protocol.

## Features

- **Comment on Reviews**: Users can comment on any review using kind 1111 events
- **Threaded Comments**: Comments properly reference the parent review using NIP-22 tags
- **Real-time Updates**: Comments are fetched and displayed in real-time
- **Comment Counts**: Review cards show comment counts when comments exist
- **Login Required**: Users must be logged in to post comments

## Implementation

### Components

- **CommentSection**: Main component that combines comment form and list
- **CommentForm**: Form for posting new comments (requires login)
- **CommentList**: Displays all comments for a review
- **useReviewComments**: Hook for fetching comments for a specific review

### NIP-22 Compliance

Comments follow the NIP-22 specification:

```json
{
  "kind": 1111,
  "content": "Great review! I had a similar experience there.",
  "tags": [
    ["A", "34879:pubkey:review-id"],  // Root scope (review)
    ["K", "34879"],                   // Root kind
    ["P", "review-author-pubkey"],    // Root author
    ["a", "34879:pubkey:review-id"],  // Parent scope (same as root for top-level)
    ["e", "review-event-id"],         // Parent event ID
    ["k", "34879"],                   // Parent kind
    ["p", "review-author-pubkey"],    // Parent author
    ["alt", "Comment on review: Place Name"]
  ]
}
```

### Usage

1. Navigate to any review detail page
2. Scroll down to see the comment section
3. Log in to post comments
4. Comments appear in chronological order (oldest first)
5. Comment counts are shown on review cards in the feed

### Query Pattern

Comments are queried using the review's naddr (NIP-19 addressable event identifier):

```javascript
const events = await nostr.query([{
  kinds: [1111],
  '#A': [reviewNaddr],
  limit: 100,
}], { signal });
```

This ensures comments are properly associated with their parent reviews and can be efficiently retrieved by relays.