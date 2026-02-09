# Video Sharing Fixes

## Issues Fixed

### 1. **React Error #310 (Maximum Update Depth Exceeded)**

**Problem**: When a video story was shared to Nostr as a kind 1 note, clicking on it caused a React error because the code tried to create an `naddr` (Nostr address) without an identifier. Kind 1 notes don't have `d` tags (identifiers), only addressable events (kinds 30000-39999) have them.

**Fix**: Updated `VideoPlayerDialog.tsx` to:
- Check if the event is actually a video event (kind 34235 or 34236) with an identifier before creating an naddr
- Hide the "Share to devine" and "Full Page" buttons for kind 1 notes, since they're just shared notes, not actual video events
- Show proper error message if user tries to share a non-video event to devine.video

**Files Changed**:
- `/src/components/VideoPlayerDialog.tsx`

### 2. **Video Not Actually Trimmed**

**Problem**: The video trimming feature only stored metadata about the trim range (in the `duration` field of the `imeta` tag), but the full video file was uploaded. This meant:
- Users uploaded full-length videos even when they wanted 6-second clips
- Wasted bandwidth and storage
- devine.video received the full video instead of the trimmed version

**Fix**: Updated `CreateVideoStoryForm.tsx` to:
- Actually trim the video during processing, not just store trim metadata
- Process video when either trimming OR muting is needed (previously only processed for muting)
- The video is now properly trimmed to the specified range before upload

**Files Changed**:
- `/src/components/CreateVideoStoryForm.tsx` (line 348-377)

### 3. **Duplicate Thumbnail in Shared Notes**

**Problem**: When sharing a video to Nostr as a kind 1 note, the code added:
1. The thumbnail URL as a separate line in the content
2. The video URL
3. The thumbnail again in the `imeta` tag

This caused the thumbnail to display twice in Nostr clients.

**Fix**: Removed the separate thumbnail URL from the note content. Now the note content includes:
- Title
- Summary/description
- Video URL only

The thumbnail is still properly attached via the `imeta` tag, which Nostr clients use to display video previews.

**Files Changed**:
- `/src/components/CreateVideoStoryForm.tsx` (line 635-654)

## Technical Details

### Kind 1 Notes vs Video Events

- **Kind 1 notes**: Regular Nostr notes, no `d` tag, can't create `naddr`
- **Kind 34235/34236**: Video events (NIP-71), have `d` tag, can create `naddr`
- **Issue**: When sharing a video story, a kind 1 note is created, but some code assumed all video-related events had identifiers

### Video Processing

The video processing now handles both trimming AND muting:

```typescript
const needsTrimming = trimStart > 0.1 || trimEnd < videoDuration - 0.1;
const needsMuting = formData.muteAudio;

// Process video if either is true
if (needsTrimming || needsMuting) {
  // ... process video
}
```

Previously, it would skip processing if only trimming was needed.

### Shared Note Format

**Before**:
```
🎥 Video Title

Description text

https://example.com/thumbnail.jpg

https://example.com/video.mp4

#hashtag #travel
```

**After**:
```
🎥 Video Title

Description text

https://example.com/video.mp4

#hashtag #travel
```

The thumbnail is still available via the `imeta` tag in the event's tags array.

## Testing

To verify these fixes work:

1. **Create a video story** with trimming enabled
   - Upload a >6 second video
   - Trim it to 6 seconds or less
   - Enable "Share on Nostr"
   - Submit
   - ✅ Verify the uploaded video is actually trimmed (check file size and duration)

2. **View a shared video note** on Nostr
   - Look for the kind 1 note in your Nostr client
   - ✅ Verify there's only one thumbnail (not duplicated)
   - ✅ Verify clicking it doesn't cause a React error

3. **Open VideoPlayerDialog** with a kind 1 note
   - Click on a shared video note
   - ✅ Verify the dialog opens without errors
   - ✅ Verify the "Share to devine" button is hidden (since it's not a video event)

## Related Files

- `/src/components/CreateVideoStoryForm.tsx` - Video creation and sharing
- `/src/components/VideoPlayerDialog.tsx` - Video playback dialog
- `/src/pages/VideoDetail.tsx` - Full-page video view
- `/src/pages/Stories.tsx` - Stories feed with video cards

## Future Improvements

Consider:
1. Adding a visual indicator during video processing to show trim progress
2. Allowing users to preview the trimmed video before upload
3. Adding support for more video processing options (filters, speed adjustment, etc.)
