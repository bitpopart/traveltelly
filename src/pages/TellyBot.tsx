import { useState, useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useMarketplaceProducts, type MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, MessageCircleQuestion, BarChart3, Share2, Plus, Trash2, Upload, Image as ImageIcon, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { createClawstrPost } from '@/lib/clawstr';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Telly Bot - AI Agent for Travel Community
 * 
 * Admin panel for creating questions and polls that can be shared to:
 * - Nostr (for npubs to reply)
 * - Clawstr /c/travel (for AI agents to discuss)
 * 
 * Enhanced with photo upload/selection
 */
export function TellyBot() {
  const { user } = useCurrentUser();
  const { mutate: publishEvent } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();
  
  // Question state
  const [question, setQuestion] = useState('');
  const [questionContext, setQuestionContext] = useState('');
  const [questionHashtags, setQuestionHashtags] = useState('');
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollContext, setPollContext] = useState('');
  const [pollHashtags, setPollHashtags] = useState('');
  
  // Photo state
  const [photoUrl, setPhotoUrl] = useState('');
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  
  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  
  const isAdmin = user?.pubkey === '7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35';

  // Load stock media for selection
  const { data: stockMedia = [], isLoading: isLoadingMedia } = useMarketplaceProducts();
  
  // Filter media based on search - memoized to prevent re-renders
  const filteredMedia = useMemo(() => {
    if (!mediaSearchQuery) return stockMedia;
    const query = mediaSearchQuery.toLowerCase();
    return stockMedia.filter((product) => 
      product.title.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query)
    );
  }, [stockMedia, mediaSearchQuery]);

  /**
   * Handle photo upload
   */
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = '';

    try {
      const tags = await uploadFile(file);
      const url = tags[0]?.[1];
      if (url) {
        setPhotoUrl(url);
        toast({
          title: 'Photo Uploaded!',
          description: 'Photo ready to share',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
    }
  };

  /**
   * Select existing media
   */
  const selectMedia = (product: MarketplaceProduct) => {
    const imageUrl = product.images[0];
    if (imageUrl) {
      setPhotoUrl(imageUrl);
      setIsMediaDialogOpen(false);
      toast({
        title: 'Photo Selected!',
        description: 'Photo ready to share',
      });
    }
  };

  /**
   * Create and share content to both Nostr and Clawstr
   */
  const shareContent = async (type: 'question' | 'poll') => {
    // Validate input
    if (type === 'question' && !question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    if (type === 'poll') {
      if (!pollQuestion.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter a poll question',
          variant: 'destructive',
        });
        return;
      }

      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast({
          title: 'Error',
          description: 'Please provide at least 2 options',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsPublishing(true);

    try {
      // Create content based on type
      let nostrContent: string;
      let clawstrContent: string;
      let baseTags: string[][];

      if (type === 'question') {
        // Parse custom hashtags
        const customHashtags = questionHashtags
          .split(/[\s,]+/)
          .map(tag => tag.replace(/^#/, '').trim())
          .filter(Boolean);
        
        const hashtagsText = ['traveltelly', 'question', 'travel', ...customHashtags]
          .map(tag => `#${tag}`)
          .join(' ');

        // Include photo URL in content for kind 1 events (Nostr standard)
        const photoLine = photoUrl ? `\n${photoUrl}\n` : '';

        nostrContent = `🤔 Question from Telly Bot:

${question}
${photoLine}
${questionContext ? `${questionContext}\n\n` : ''}Comment down below 👇

${hashtagsText}`;

        clawstrContent = `🤔 Question for the travel community:

${question}
${photoLine}
${questionContext ? `${questionContext}\n\n` : ''}Comment on this note 👇

${hashtagsText}`;

        baseTags = [
          ['t', 'traveltelly'],
          ['t', 'question'],
          ['t', 'travel'],
          ['L', 'telly-bot'],
          ['l', 'question', 'telly-bot'],
          ...customHashtags.map(tag => ['t', tag] as [string, string]),
        ];
      } else {
        const validOptions = pollOptions.filter(opt => opt.trim());
        const optionsText = validOptions.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n');

        // Parse custom hashtags
        const customHashtags = pollHashtags
          .split(/[\s,]+/)
          .map(tag => tag.replace(/^#/, '').trim())
          .filter(Boolean);
        
        const hashtagsText = ['traveltelly', 'poll', 'travel', ...customHashtags]
          .map(tag => `#${tag}`)
          .join(' ');

        // Include photo URL in content for kind 1 events (Nostr standard)
        const photoLine = photoUrl ? `\n${photoUrl}\n` : '';

        nostrContent = `📊 Poll from Telly Bot:

${pollQuestion}

${optionsText}
${photoLine}
${pollContext ? `${pollContext}\n\n` : ''}Comment down below with your choice (A, B, C, etc.) 👇🗳️

${hashtagsText}`;

        clawstrContent = `📊 Poll for the travel community:

${pollQuestion}

${optionsText}
${photoLine}
${pollContext ? `${pollContext}\n\n` : ''}Comment on this note with your pick 👇🗳️

${hashtagsText}`;

        baseTags = [
          ['t', 'traveltelly'],
          ['t', 'poll'],
          ['t', 'travel'],
          ['L', 'telly-bot'],
          ['l', 'poll', 'telly-bot'],
          ...validOptions.map(opt => ['poll_option', opt] as [string, string]),
          ...customHashtags.map(tag => ['t', tag] as [string, string]),
        ];
      }

      // Add photo tags if present (both image tag and imeta for NIP-92)
      const photoTags: string[][] = photoUrl ? [
        ['image', photoUrl],
        ['imeta', `url ${photoUrl}`],
      ] : [];
      const allBaseTags = [...baseTags, ...photoTags];

      // Publish to Nostr (kind 1)
      const nostrEvent = {
        kind: 1,
        content: nostrContent,
        tags: allBaseTags,
      };

      // Publish to Clawstr (kind 1111)
      const clawstrEvent = createClawstrPost(
        clawstrContent,
        'https://clawstr.com/c/travel',
        [...allBaseTags]
      );

      // Publish both events
      await Promise.all([
        new Promise<void>((resolve, reject) => {
          publishEvent(nostrEvent, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        }),
        new Promise<void>((resolve, reject) => {
          publishEvent(clawstrEvent, {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          });
        }),
      ]);

      // Success!
      toast({
        title: '🎉 Shared Successfully!',
        description: `${type === 'question' ? 'Question' : 'Poll'} posted to Nostr AND Clawstr /c/travel`,
      });

      // Clear form
      if (type === 'question') {
        setQuestion('');
        setQuestionContext('');
        setQuestionHashtags('');
      } else {
        setPollQuestion('');
        setPollOptions(['', '']);
        setPollContext('');
        setPollHashtags('');
      }
      setPhotoUrl('');

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  /**
   * Add poll option
   */
  const addPollOption = () => {
    if (pollOptions.length < 10) {
      setPollOptions([...pollOptions, '']);
    }
  };

  /**
   * Remove poll option
   */
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  /**
   * Update poll option
   */
  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  /**
   * Photo selection UI
   */
  const PhotoSelector = () => (
    <div className="space-y-3">
      <Label>Photo (Optional)</Label>
      
      {photoUrl ? (
        <div className="relative">
          <img 
            src={photoUrl} 
            alt="Selected" 
            className="w-full h-48 object-cover rounded-lg"
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setPhotoUrl('')}
            className="absolute top-2 right-2"
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* Upload new photo */}
          <div>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label htmlFor="photo-upload" className="cursor-pointer block">
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors text-center">
                {isUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload Photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to browse</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Select from existing media */}
          <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
            <DialogTrigger asChild>
              <div className="border-2 border-dashed rounded-lg p-4 hover:border-primary transition-colors text-center cursor-pointer">
                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Browse Media</p>
                <p className="text-xs text-muted-foreground mt-1">Select existing</p>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select from Traveltelly Media</DialogTitle>
                <DialogDescription>
                  Choose a photo from your uploaded stock media
                </DialogDescription>
              </DialogHeader>
              
              {/* Search */}
              <div className="space-y-4">
                <Input
                  placeholder="Search media..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="w-full"
                />

                {/* Media grid */}
                {isLoadingMedia ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredMedia.length === 0 ? (
                      <div className="col-span-3 text-center py-8 text-muted-foreground">
                        {mediaSearchQuery ? 'No media found' : 'No media uploaded yet'}
                      </div>
                    ) : (
                      filteredMedia.slice(0, 30).map((product) => {
                        const imageUrl = product.images[0];
                        
                        if (!imageUrl) return null;

                        return (
                          <div
                            key={product.id}
                            onClick={() => selectMedia(product)}
                            className="cursor-pointer group"
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                              <img
                                src={imageUrl}
                                alt={product.title || 'Media'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-white" />
                              </div>
                            </div>
                            <p className="text-xs mt-1 truncate text-muted-foreground">
                              {product.title}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Please login with Nostr to access Telly Bot
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            Telly Bot is currently admin-only. Contact the site admin for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Telly Bot</h1>
            <p className="text-muted-foreground">AI Agent for Travel Community</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            About Telly Bot
          </CardTitle>
          <CardDescription>
            Create questions and polls with photos to engage the travel community on Nostr and Clawstr
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Share to Both Platforms:</strong> Your questions/polls are shared to Nostr (for humans) 
            AND Clawstr /c/travel (for AI agents) simultaneously
          </p>
          <p>
            <strong>Add Photos:</strong> Upload new photos or select from your Traveltelly media library
          </p>
          <p className="text-muted-foreground">
            Telly Bot helps build community engagement by asking thought-provoking questions with visual context
          </p>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="question" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="question" className="flex items-center gap-2">
            <MessageCircleQuestion className="h-4 w-4" />
            Question
          </TabsTrigger>
          <TabsTrigger value="poll" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Poll
          </TabsTrigger>
        </TabsList>

        {/* Question Tab */}
        <TabsContent value="question" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a Question</CardTitle>
              <CardDescription>
                Ask the community about their favorite destinations, travel tips, or experiences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="What is your favorite travel destination?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-context">
                  Context / Additional Info (Optional)
                </Label>
                <Textarea
                  id="question-context"
                  placeholder="Add any background or context to help people answer..."
                  value={questionContext}
                  onChange={(e) => setQuestionContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="question-hashtags">
                  Additional Hashtags (Optional)
                </Label>
                <Input
                  id="question-hashtags"
                  placeholder="beach, sunset, photography (comma or space separated)"
                  value={questionHashtags}
                  onChange={(e) => setQuestionHashtags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Always included: #traveltelly #question #travel
                </p>
              </div>

              <PhotoSelector />

              <Button 
                onClick={() => shareContent('question')} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isPublishing || isUploading}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share to Nostr & Clawstr
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Example Question</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">What is your favorite travel destination?</p>
              <p className="text-muted-foreground">
                Context: I'm looking for recommendations for my next trip. Interested in both 
                popular destinations and hidden gems!
              </p>
              <p className="text-muted-foreground">
                Hashtags: beach, adventure, europe
              </p>
              <p className="text-muted-foreground">
                Photo: Beautiful landscape or city photo to inspire responses
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Poll Tab */}
        <TabsContent value="poll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a Poll</CardTitle>
              <CardDescription>
                Get the community's opinion on destinations, activities, or travel topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poll-question">Poll Question</Label>
                <Input
                  id="poll-question"
                  placeholder="My next destination:"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Poll Options</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removePollOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 10 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPollOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="poll-context">
                  Context / Additional Info (Optional)
                </Label>
                <Textarea
                  id="poll-context"
                  placeholder="Add any background or context..."
                  value={pollContext}
                  onChange={(e) => setPollContext(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poll-hashtags">
                  Additional Hashtags (Optional)
                </Label>
                <Input
                  id="poll-hashtags"
                  placeholder="japan, spain, usa, europe, asia (comma or space separated)"
                  value={pollHashtags}
                  onChange={(e) => setPollHashtags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Always included: #traveltelly #poll #travel
                </p>
              </div>

              <PhotoSelector />

              <Button 
                onClick={() => shareContent('poll')} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isPublishing || isUploading}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share to Nostr & Clawstr
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Example */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Example Poll</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-medium">My next destination:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>A) Japan</li>
                <li>B) Spain</li>
                <li>C) USA</li>
              </ul>
              <p className="text-muted-foreground pt-2">
                Context: Planning a 2-week trip in the fall. Looking for a mix of culture, 
                food, and scenic views!
              </p>
              <p className="text-muted-foreground">
                Hashtags: japan, spain, usa, europe, asia
              </p>
              <p className="text-muted-foreground">
                Photo: Collage of destination photos to visualize options
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tips for Great Questions & Polls</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Be specific and clear in your questions</li>
            <li>Provide context to help people give better answers</li>
            <li>Add photos to provide visual context and inspire responses</li>
            <li>Add relevant hashtags to improve discoverability</li>
            <li>For polls, keep options concise and balanced</li>
            <li>Ask open-ended questions to encourage discussion</li>
            <li>Posts are shared to BOTH Nostr (humans) AND Clawstr (AI agents)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
