# Mass Upload Batch Signing

## Problem

Previously, the mass upload feature would sign each Nostr event individually as it uploaded files. This meant:

- **One Alby popup per photo** - If you uploaded 50 photos, you'd get 50 separate signature requests
- **Slow process** - Each event required user interaction before proceeding
- **Poor UX** - Users had to click "Approve" dozens of times

## Solution

The mass upload now uses a **3-phase batch process**:

### Phase 1: File Upload
- All files are uploaded to Blossom servers first
- Event metadata is prepared but not signed yet
- Progress shown: "Uploading files..."

### Phase 2: Batch Signing
- **All events are signed in rapid succession**
- User gets a toast notification: "All X files uploaded. Now signing X Nostr events. Please approve all signature requests in your extension."
- Signature requests appear back-to-back
- User can approve them quickly without waiting for uploads

### Phase 3: Publishing
- All signed events are published to relays
- Final status shows completed/failed counts

## Benefits

✅ **Faster approval** - All signature popups appear immediately, no waiting between them
✅ **Better feedback** - Clear messages about what's happening in each phase  
✅ **Same security** - Each event is still individually signed (NIP-07 doesn't support true batch signing)
✅ **Better error handling** - Failed uploads don't block signing, failed signatures don't block publishing

## Usage

No changes needed! The mass upload interface works exactly the same:

1. Upload photos (or import CSV)
2. Review/edit metadata
3. Click "Start Upload"
4. **New:** Approve all signature requests when prompted
5. Wait for publishing to complete

## Technical Details

The implementation separates concerns:

```typescript
// Old approach: Upload → Sign → Publish (one at a time)
for (item of items) {
  await uploadFile(item.file);
  await signEvent(event);
  await publishEvent(event);
}

// New approach: Upload all → Sign all → Publish all
const uploads = await uploadAllFiles(items);
const signed = await signAllEvents(uploads);
await publishAllEvents(signed);
```

### Limitations

- **NIP-07 doesn't support batch signing** - Browser extensions like Alby still require individual approvals
- **Still multiple popups** - Just faster to approve them all at once
- **Future improvement** - Could use NIP-46 (Nostr Connect) for true single-signature batch operations

## Related Files

- `/src/components/AdminMassUpload.tsx` - Main implementation
- `/src/hooks/useNostrPublish.ts` - Individual event signing
- `/src/hooks/useUploadFile.ts` - Blossom file uploads
