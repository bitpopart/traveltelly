import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { useSocialScheduledPosts } from '@/hooks/useSocialScheduledPosts';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ArrowLeft,
  Shield,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Link2,
  Hash,
  Star,
  BookOpen,
  MapPin,
  Camera,
  Edit,
  Play,
  Loader2,
  Wand2,
  Twitter,
  Instagram,
  Facebook,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow, format } from 'date-fns';
import { TwitterSync } from '@/components/TwitterSync';

interface ScheduledPost {
  id: string;
  type: 'review' | 'story' | 'trip' | 'stock-media' | 'custom';
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  hashtags: string;
  scheduledTime: number; // Unix timestamp
  status: 'pending' | 'published' | 'failed';
  createdAt: number;
}

const POST_TYPE_ICONS = {
  review: Star,
  story: BookOpen,
  trip: MapPin,
  'stock-media': Camera,
  custom: Link2,
};

const POST_TYPE_LABELS = {
  review: 'Review',
  story: 'Story',
  trip: 'Trip',
  'stock-media': 'Stock Media',
  custom: 'Custom Post',
};

export default function ShareScheduler() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { nostr } = useNostr();
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  const { scheduledPosts, addScheduledPost, removeScheduledPost, updatePostStatus } = useScheduledPosts();

  const [formData, setFormData] = useState({
    type: 'review' as ScheduledPost['type'],
    url: '',
    title: '',
    description: '',
    imageUrl: '',
    hashtags: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFetchingContent, setIsFetchingContent] = useState(false);

  const autoFillFromUrl = async () => {
    if (!formData.url) {
      toast({
        title: 'Enter URL first',
        description: 'Please enter a TravelTelly URL to auto-fill',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsFetchingContent(true);

      // Extract naddr from URL
      const urlMatch = formData.url.match(/\/(review|story|trip|video|media\/preview)\/(naddr1[a-z0-9]+)/);
      if (!urlMatch) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid TravelTelly content URL',
          variant: 'destructive',
        });
        return;
      }

      const [, contentType, naddr] = urlMatch;
      
      // Decode naddr
      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') {
        throw new Error('Invalid naddr');
      }

      const { kind, pubkey, identifier } = decoded.data;

      // Fetch the event
      const signal = AbortSignal.timeout(5000);
      const events = await nostr.query([{
        kinds: [kind],
        authors: [pubkey],
        '#d': [identifier],
      }], { signal });

      if (events.length === 0) {
        toast({
          title: 'Content not found',
          description: 'Could not fetch content from relay',
          variant: 'destructive',
        });
        return;
      }

      const event = events[0];

      // Extract metadata based on content type
      const title = event.tags.find(([name]) => name === 'title')?.[1] || '';
      const summary = event.tags.find(([name]) => name === 'summary')?.[1] || event.content || '';
      const description = event.tags.find(([name]) => name === 'description')?.[1] || '';
      
      // Get image URL
      let imageUrl = '';
      
      // For videos, check imeta tag first
      if (kind === 34235 || kind === 34236) {
        const imetaTag = event.tags.find(([name]) => name === 'imeta');
        if (imetaTag) {
          for (let i = 1; i < imetaTag.length; i++) {
            if (imetaTag[i].startsWith('image ')) {
              imageUrl = imetaTag[i].substring(6);
              break;
            }
          }
        }
        // Fallback to thumb tag
        if (!imageUrl) {
          imageUrl = event.tags.find(([name]) => name === 'thumb')?.[1] || '';
        }
      } else {
        // For other content types, use image tag
        imageUrl = event.tags.find(([name]) => name === 'image')?.[1] || '';
      }

      // Get hashtags
      const tags = event.tags
        .filter(([name]) => name === 't')
        .map(([, value]) => value)
        .filter(tag => tag && !['travel', 'traveltelly'].includes(tag))
        .join(', ');

      // Determine type
      let postType: ScheduledPost['type'] = 'custom';
      if (kind === 34879) postType = 'review';
      else if (kind === 30023) postType = 'story';
      else if (kind === 30024) postType = 'trip';
      else if (kind === 30403) postType = 'stock-media';
      else if (kind === 34235 || kind === 34236) postType = 'story'; // Videos are stories

      // Update form
      setFormData({
        ...formData,
        type: postType,
        title: title || 'Untitled',
        description: description || summary || '',
        imageUrl: imageUrl || '',
        hashtags: tags || '',
      });

      toast({
        title: 'Content loaded!',
        description: 'Form auto-filled with content details',
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Failed to fetch content',
        description: 'Could not load content details from URL',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingContent(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url || !formData.title || !formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: 'Missing required fields',
        description: 'URL, title, date, and time are required',
        variant: 'destructive',
      });
      return;
    }

    // Combine date and time into timestamp
    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const scheduledTimestamp = Math.floor(scheduledDateTime.getTime() / 1000);

    // Check if time is in the future
    if (scheduledTimestamp <= Math.floor(Date.now() / 1000)) {
      toast({
        title: 'Invalid time',
        description: 'Scheduled time must be in the future',
        variant: 'destructive',
      });
      return;
    }

    const newPost: ScheduledPost = {
      id: editingId || `post-${Date.now()}`,
      type: formData.type,
      url: formData.url,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      hashtags: formData.hashtags,
      scheduledTime: scheduledTimestamp,
      status: 'pending',
      createdAt: Date.now(),
    };

    addScheduledPost(newPost);

    toast({
      title: editingId ? 'Post updated!' : 'Post scheduled!',
      description: `Will be published on ${format(scheduledDateTime, 'PPpp')}`,
    });

    // Reset form
    setFormData({
      type: 'review',
      url: '',
      title: '',
      description: '',
      imageUrl: '',
      hashtags: '',
      scheduledDate: '',
      scheduledTime: '',
    });
    setEditingId(null);
  };

  const handleEdit = (post: ScheduledPost) => {
    const scheduledDate = new Date(post.scheduledTime * 1000);
    setFormData({
      type: post.type,
      url: post.url,
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      hashtags: post.hashtags,
      scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
      scheduledTime: format(scheduledDate, 'HH:mm'),
    });
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (postId: string) => {
    removeScheduledPost(postId);
    toast({
      title: 'Post deleted',
      description: 'Scheduled post has been removed',
    });
  };

  const pendingPosts = scheduledPosts.filter(p => p.status === 'pending').sort((a, b) => a.scheduledTime - b.scheduledTime);
  const publishedPosts = scheduledPosts.filter(p => p.status === 'published').sort((a, b) => b.scheduledTime - a.scheduledTime);
  const failedPosts = scheduledPosts.filter(p => p.status === 'failed').sort((a, b) => b.scheduledTime - a.scheduledTime);

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Checking permissions...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-6">
                  Only the Traveltelly admin can access the Share Scheduler.
                </p>
                <Link to="/admin">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Panel
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold">Social Media</h1>
            </div>
            <p className="text-muted-foreground">
              Automate posts, sync X/Instagram to Nostr, and manage your social presence
            </p>
          </div>

          {/* Platform Tabs */}
          <Tabs defaultValue="nostr" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="nostr" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Nostr
              </TabsTrigger>
              <TabsTrigger value="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="facebook" className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </TabsTrigger>
            </TabsList>

            {/* Nostr Tab */}
            <TabsContent value="nostr">
              <div className="grid lg:grid-cols-2 gap-6">
            {/* Schedule Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {editingId ? 'Edit Scheduled Post' : 'Schedule New Post'}
                  </CardTitle>
                  <CardDescription>
                    Create automated Nostr posts for your content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Post Type */}
                    <div>
                      <Label htmlFor="type">Post Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as ScheduledPost['type'] })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Review
                            </div>
                          </SelectItem>
                          <SelectItem value="story">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Story
                            </div>
                          </SelectItem>
                          <SelectItem value="trip">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Trip
                            </div>
                          </SelectItem>
                          <SelectItem value="stock-media">
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4" />
                              Stock Media
                            </div>
                          </SelectItem>
                          <SelectItem value="custom">
                            <div className="flex items-center gap-2">
                              <Link2 className="w-4 h-4" />
                              Custom Post
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="url" className="flex items-center gap-2">
                          <Link2 className="w-4 h-4" />
                          URL <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={autoFillFromUrl}
                          disabled={!formData.url || isFetchingContent}
                          className="text-xs h-7"
                        >
                          {isFetchingContent ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3 mr-1" />
                              Auto-Fill
                            </>
                          )}
                        </Button>
                      </div>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://traveltelly.com/review/naddr1..."
                        className="mt-1.5"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste a TravelTelly URL and click Auto-Fill to scrape content details
                      </p>
                    </div>

                    {/* Title */}
                    <div>
                      <Label htmlFor="title">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Amazing sunset in Bali"
                        className="mt-1.5"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Share details about your experience..."
                        className="mt-1.5 min-h-[100px]"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <Label htmlFor="imageUrl" className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image URL <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://image.nostr.build/..."
                        className="mt-1.5"
                        required
                      />
                      {formData.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={formData.imageUrl} 
                            alt="Preview" 
                            className="max-w-xs rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Hashtags */}
                    <div>
                      <Label htmlFor="hashtags" className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Hashtags
                      </Label>
                      <Input
                        id="hashtags"
                        value={formData.hashtags}
                        onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                        placeholder="travel, photography, bali (comma-separated)"
                        className="mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Separate with commas. #travel and #traveltelly are added automatically.
                      </p>
                    </div>

                    {/* Scheduled Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                          className="mt-1.5"
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduledTime" className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                          className="mt-1.5"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {editingId ? 'Update Schedule' : 'Schedule Post'}
                      </Button>
                      {editingId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setFormData({
                              type: 'review',
                              url: '',
                              title: '',
                              description: '',
                              imageUrl: '',
                              hashtags: '',
                              scheduledDate: '',
                              scheduledTime: '',
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Add from Content */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Schedule from Content</CardTitle>
                  <CardDescription>
                    Navigate to any review, story, trip, or stock media and copy its URL here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/reviews">
                      <Button variant="outline" className="w-full" size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        Browse Reviews
                      </Button>
                    </Link>
                    <Link to="/stories">
                      <Button variant="outline" className="w-full" size="sm">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Browse Stories
                      </Button>
                    </Link>
                    <Link to="/trips">
                      <Button variant="outline" className="w-full" size="sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        Browse Trips
                      </Button>
                    </Link>
                    <Link to="/marketplace">
                      <Button variant="outline" className="w-full" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Browse Media
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scheduled Posts Overview */}
            <div>
              {/* Pending Posts */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Pending ({pendingPosts.length})
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Posts scheduled to be published
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingPosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No scheduled posts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingPosts.map((post) => {
                        const Icon = POST_TYPE_ICONS[post.type];
                        const scheduledDate = new Date(post.scheduledTime * 1000);
                        const isPast = post.scheduledTime < Math.floor(Date.now() / 1000);

                        return (
                          <div
                            key={post.id}
                            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-20 h-20 object-cover rounded flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <Badge variant="outline" className="text-xs">
                                      {POST_TYPE_LABELS[post.type]}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(post)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(post.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                <h4 className="font-semibold text-sm mb-1 truncate">{post.title}</h4>
                                {post.description && (
                                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                    {post.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span className={isPast ? 'text-orange-600 font-medium' : ''}>
                                    {isPast ? 'Publishing soon...' : formatDistanceToNow(scheduledDate, { addSuffix: true })}
                                  </span>
                                  <span>•</span>
                                  <span>{format(scheduledDate, 'PPp')}</span>
                                </div>
                                {post.hashtags && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {post.hashtags.split(',').slice(0, 3).map((tag, idx) => (
                                      <span key={idx} className="text-xs text-purple-600">
                                        #{tag.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Published Posts */}
              {publishedPosts.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Published ({publishedPosts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {publishedPosts.slice(0, 5).map((post) => {
                        const Icon = POST_TYPE_ICONS[post.type];
                        return (
                          <div
                            key={post.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-green-50/50"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{post.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(post.scheduledTime * 1000), 'PPp')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Failed Posts */}
              {failedPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Failed ({failedPosts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {failedPosts.slice(0, 5).map((post) => {
                        const Icon = POST_TYPE_ICONS[post.type];
                        return (
                          <div
                            key={post.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-red-50/50"
                          >
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{post.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(post.scheduledTime * 1000), 'PPp')}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">How it works</p>
              <p className="text-xs text-muted-foreground">
                The scheduler checks every minute for pending posts. When the scheduled time arrives,
                it automatically publishes a kind 1 note to Nostr with your content, image, hashtags, and clickable URL.
                Make sure to keep this browser tab open or the app running for scheduled posts to publish.
              </p>
            </AlertDescription>
          </Alert>
        </TabsContent>

            {/* Twitter Tab */}
            <TabsContent value="twitter">
              <div className="space-y-6">
                {/* Nostr.Band Twitter Sync (xNostr-style) */}
                <TwitterSync />
                
                <Separator className="my-8" />
                
                {/* Original Manual Scheduler */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Manual Post Scheduler
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Schedule individual posts manually (for advanced control)
                  </p>
                  <SocialMediaScheduler platform="twitter" />
                </div>
              </div>
            </TabsContent>

            {/* Instagram Tab */}
            <TabsContent value="instagram">
              <SocialMediaScheduler platform="instagram" />
            </TabsContent>

            {/* Facebook Tab */}
            <TabsContent value="facebook">
              <SocialMediaScheduler platform="facebook" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Social Media Scheduler Component
interface SocialMediaSchedulerProps {
  platform: SocialPlatform;
}

function SocialMediaScheduler({ platform }: SocialMediaSchedulerProps) {
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { toast } = useToast();
  const { socialScheduledPosts, addSocialScheduledPost, removeSocialScheduledPost, updateSocialPostStatus, markAsReady, markAsPosted } = useSocialScheduledPosts();

  const [formData, setFormData] = useState({
    type: 'review' as ScheduledPost['type'],
    url: '',
    title: '',
    description: '',
    imageUrl: '',
    hashtags: '',
    scheduledDate: '',
    scheduledTime: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFetchingContent, setIsFetchingContent] = useState(false);
  
  // xNostr-style sync state
  const [syncConfig, setSyncConfig] = useState({
    autoSync: false,
    syncInterval: 60, // minutes
    bulkSyncEnabled: false,
    autoPostToNostr: false,
    blossomUpload: false,
  });

  const platformIcons = {
    twitter: Twitter,
    instagram: Instagram,
    facebook: Facebook,
  };

  const platformColors = {
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    facebook: '#1877F2',
  };

  const platformNames = {
    twitter: 'Twitter/X',
    instagram: 'Instagram',
    facebook: 'Facebook',
  };

  const platformCharLimits = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
  };

  const Icon = platformIcons[platform];
  const color = platformColors[platform];
  const platformName = platformNames[platform];
  const charLimit = platformCharLimits[platform];

  const autoFillFromUrl = async () => {
    if (!formData.url) {
      toast({
        title: 'Enter URL first',
        description: 'Please enter a TravelTelly URL to auto-fill',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsFetchingContent(true);

      const urlMatch = formData.url.match(/\/(review|story|trip|video|media\/preview)\/(naddr1[a-z0-9]+)/);
      if (!urlMatch) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid TravelTelly content URL',
          variant: 'destructive',
        });
        return;
      }

      const [, contentType, naddr] = urlMatch;
      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') throw new Error('Invalid naddr');

      const { kind, pubkey, identifier } = decoded.data;
      const signal = AbortSignal.timeout(5000);
      const events = await nostr.query([{
        kinds: [kind],
        authors: [pubkey],
        '#d': [identifier],
      }], { signal });

      if (events.length === 0) {
        toast({
          title: 'Content not found',
          description: 'Could not fetch content from relay',
          variant: 'destructive',
        });
        return;
      }

      const event = events[0];
      const title = event.tags.find(([name]) => name === 'title')?.[1] || '';
      const summary = event.tags.find(([name]) => name === 'summary')?.[1] || event.content || '';
      const description = event.tags.find(([name]) => name === 'description')?.[1] || '';
      
      let imageUrl = '';
      if (kind === 34235 || kind === 34236) {
        const imetaTag = event.tags.find(([name]) => name === 'imeta');
        if (imetaTag) {
          for (let i = 1; i < imetaTag.length; i++) {
            if (imetaTag[i].startsWith('image ')) {
              imageUrl = imetaTag[i].substring(6);
              break;
            }
          }
        }
        if (!imageUrl) imageUrl = event.tags.find(([name]) => name === 'thumb')?.[1] || '';
      } else {
        imageUrl = event.tags.find(([name]) => name === 'image')?.[1] || '';
      }

      const tags = event.tags
        .filter(([name]) => name === 't')
        .map(([, value]) => value)
        .filter(tag => tag && !['travel', 'traveltelly'].includes(tag))
        .join(', ');

      let postType: ScheduledPost['type'] = 'custom';
      if (kind === 34879) postType = 'review';
      else if (kind === 30023) postType = 'story';
      else if (kind === 30024) postType = 'trip';
      else if (kind === 30403) postType = 'stock-media';
      else if (kind === 34235 || kind === 34236) postType = 'story';

      setFormData({
        ...formData,
        type: postType,
        title: title || 'Untitled',
        description: description || summary || '',
        imageUrl: imageUrl || '',
        hashtags: tags || '',
      });

      toast({
        title: 'Content loaded!',
        description: 'Form auto-filled with content details',
      });
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: 'Failed to fetch content',
        description: 'Could not load content details from URL',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingContent(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url || !formData.title || !formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: 'Missing required fields',
        description: 'URL, title, date, and time are required',
        variant: 'destructive',
      });
      return;
    }

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const scheduledTimestamp = Math.floor(scheduledDateTime.getTime() / 1000);

    if (scheduledTimestamp <= Math.floor(Date.now() / 1000)) {
      toast({
        title: 'Invalid time',
        description: 'Scheduled time must be in the future',
        variant: 'destructive',
      });
      return;
    }

    const newPost: SocialScheduledPost = {
      id: editingId || `${platform}-${Date.now()}`,
      platform,
      type: formData.type,
      url: formData.url,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl,
      hashtags: formData.hashtags,
      scheduledTime: scheduledTimestamp,
      status: 'pending',
      createdAt: Date.now(),
    };

    addSocialScheduledPost(newPost);

    toast({
      title: editingId ? 'Post updated!' : 'Post scheduled!',
      description: `Will be ready on ${format(scheduledDateTime, 'PPpp')}`,
    });

    setFormData({
      type: 'review',
      url: '',
      title: '',
      description: '',
      imageUrl: '',
      hashtags: '',
      scheduledDate: '',
      scheduledTime: '',
    });
    setEditingId(null);
  };

  const handleEdit = (post: SocialScheduledPost) => {
    const scheduledDate = new Date(post.scheduledTime * 1000);
    setFormData({
      type: post.type,
      url: post.url,
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      hashtags: post.hashtags,
      scheduledDate: format(scheduledDate, 'yyyy-MM-dd'),
      scheduledTime: format(scheduledDate, 'HH:mm'),
    });
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (postId: string) => {
    removeSocialScheduledPost(postId);
    toast({
      title: 'Post deleted',
      description: 'Scheduled post has been removed',
    });
  };

  const platformPosts = socialScheduledPosts.filter(p => p.platform === platform);
  const pendingPosts = platformPosts.filter(p => p.status === 'pending').sort((a, b) => a.scheduledTime - b.scheduledTime);
  const readyPosts = platformPosts.filter(p => p.status === 'ready').sort((a, b) => a.scheduledTime - b.scheduledTime);
  const postedPosts = platformPosts.filter(p => p.status === 'posted-manually').sort((a, b) => b.scheduledTime - a.scheduledTime);

  const currentCharCount = formData.title.length + formData.description.length + formData.hashtags.length + formData.url.length + 10;

  return (
    <div className="space-y-6">
      {/* xNostr-style Sync Card (Full Width) */}
      {(platform === 'twitter' || platform === 'instagram') && (
        <Card className="border-2" style={{ borderColor: color }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Sync {platformName} to Nostr
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      xNostr-Style
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Automatically sync your {platformName} content to Nostr in real-time
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Bulk Import</div>
                    <div className="text-xs text-muted-foreground">
                      Import all your existing {platformName} posts to Nostr in one go
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Auto-Sync</div>
                    <div className="text-xs text-muted-foreground">
                      Automatically sync new posts every {syncConfig.syncInterval} minutes
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Auto-Post to Nostr</div>
                    <div className="text-xs text-muted-foreground">
                      Automatically publish synced content to Nostr (NIP-46 signing)
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm mb-1">Blossom Upload</div>
                    <div className="text-xs text-muted-foreground">
                      Upload media to Blossom servers (decentralized storage)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold">Connect {platformName} Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Link your account to enable automatic syncing
                  </p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    toast({
                      title: 'Coming Soon!',
                      description: `${platformName} sync integration is under development. Subscribe to our newsletter for updates!`,
                    });
                  }}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  Connect {platformName}
                </Button>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Premium Feature</AlertTitle>
                <AlertDescription className="text-amber-800 text-sm">
                  <div className="space-y-2 mt-2">
                    <p>Similar to xNostr, this feature syncs your {platformName} content to Nostr automatically.</p>
                    <div className="space-y-1">
                      <div className="font-medium">Plans (Coming Soon):</div>
                      <div className="text-xs space-y-0.5">
                        <div>• Standard: $25/mo - 2 accounts, auto-sync, unlimited posts</div>
                        <div>• Professional: $40/mo - 5 accounts, faster sync (5-30 min)</div>
                        <div>• Business: $60/mo - 10 accounts, dedicated support</div>
                      </div>
                    </div>
                    <p className="text-xs pt-2">
                      💡 Payment via Lightning ⚡ • Instant activation • Secure signing
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Demo Configuration (UI Preview) */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-semibold">Sync Configuration (Preview)</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Bulk Import Existing Posts</span>
                    </div>
                    <Button size="sm" variant="outline" disabled>
                      Import All
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Auto-Sync Interval</span>
                    </div>
                    <Select value={String(syncConfig.syncInterval)} onValueChange={(v) => setSyncConfig({ ...syncConfig, syncInterval: parseInt(v) })} disabled>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="360">6 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Auto-Post to Nostr (NIP-46)</span>
                    </div>
                    <Badge variant="outline" className="bg-gray-100">
                      {syncConfig.autoPostToNostr ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Blossom Media Upload</span>
                    </div>
                    <Badge variant="outline" className="bg-gray-100">
                      {syncConfig.blossomUpload ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    💡 <strong>How it works:</strong> Connect your {platformName} account, and we'll automatically sync new posts to Nostr. 
                    Your private keys stay secure with NIP-46 remote signing. Media is uploaded to Blossom for decentralization.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Learn More */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-sm">Inspired by xNostr</div>
                  <div className="text-xs text-muted-foreground">
                    Check out xNostr.com for a similar X/Instagram → Nostr sync service
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://xnostr.com/', '_blank')}
              >
                Visit xNostr
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid for Manual Scheduler (original functionality) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Schedule Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="w-5 h-5" style={{ color }} />
                {editingId ? `Edit ${platformName} Post` : `Schedule ${platformName} Post`}
              </CardTitle>
              <CardDescription>
                Manually schedule content to post on {platformName}
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Post Type */}
              <div>
                <Label htmlFor={`type-${platform}`}>Content Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as ScheduledPost['type'] })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Review
                      </div>
                    </SelectItem>
                    <SelectItem value="story">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Story
                      </div>
                    </SelectItem>
                    <SelectItem value="trip">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Trip
                      </div>
                    </SelectItem>
                    <SelectItem value="stock-media">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Stock Media
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Custom Post
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* URL with Auto-Fill */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor={`url-${platform}`} className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    URL <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoFillFromUrl}
                    disabled={!formData.url || isFetchingContent}
                    className="text-xs h-7"
                  >
                    {isFetchingContent ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 mr-1" />
                        Auto-Fill
                      </>
                    )}
                  </Button>
                </div>
                <Input
                  id={`url-${platform}`}
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://traveltelly.com/review/naddr1..."
                  className="mt-1.5"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a TravelTelly URL and click Auto-Fill to scrape content details
                </p>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor={`title-${platform}`}>
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`title-${platform}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Amazing sunset in Bali"
                  className="mt-1.5"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor={`description-${platform}`}>Description</Label>
                <Textarea
                  id={`description-${platform}`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Share details about your experience..."
                  className="mt-1.5 min-h-[100px]"
                  maxLength={charLimit}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {currentCharCount} / {charLimit} characters
                </p>
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor={`imageUrl-${platform}`} className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`imageUrl-${platform}`}
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://image.nostr.build/..."
                  className="mt-1.5"
                  required
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="max-w-xs rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <Label htmlFor={`hashtags-${platform}`} className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags
                </Label>
                <Input
                  id={`hashtags-${platform}`}
                  value={formData.hashtags}
                  onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                  placeholder="travel, photography, bali (comma-separated)"
                  className="mt-1.5"
                />
              </div>

              {/* Scheduled Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`scheduledDate-${platform}`} className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`scheduledDate-${platform}`}
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="mt-1.5"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`scheduledTime-${platform}`} className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`scheduledTime-${platform}`}
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1 text-white"
                  style={{ backgroundColor: color }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Schedule' : 'Schedule Post'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        type: 'review',
                        url: '',
                        title: '',
                        description: '',
                        imageUrl: '',
                        hashtags: '',
                        scheduledDate: '',
                        scheduledTime: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Posts Overview */}
      <div>
        {/* Pending/Ready Posts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" style={{ color }} />
                Scheduled ({pendingPosts.length + readyPosts.length})
              </span>
            </CardTitle>
            <CardDescription>
              Posts scheduled for {platformName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPosts.length === 0 && readyPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No scheduled posts for {platformName}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...readyPosts, ...pendingPosts].map((post) => {
                  const PostIcon = POST_TYPE_ICONS[post.type];
                  const scheduledDate = new Date(post.scheduledTime * 1000);
                  const isReady = post.scheduledTime <= Math.floor(Date.now() / 1000);

                  return (
                    <div
                      key={post.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        isReady ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-20 h-20 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <PostIcon className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">
                                {POST_TYPE_LABELS[post.type]}
                              </Badge>
                              {isReady && (
                                <Badge className="text-xs bg-green-600">
                                  Ready to Post!
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {isReady && post.status === 'pending' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => markAsReady(post.id)}
                                  className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Mark Ready
                                </Button>
                              )}
                              {post.status === 'ready' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => markAsPosted(post.id)}
                                  className="h-8 text-xs"
                                  style={{ backgroundColor: color }}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Mark Posted
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(post)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(post.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-semibold text-sm mb-1 truncate">{post.title}</h4>
                          {post.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {post.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span className={isReady ? 'text-green-600 font-medium' : ''}>
                              {isReady ? 'Ready now!' : formatDistanceToNow(scheduledDate, { addSuffix: true })}
                            </span>
                            <span>•</span>
                            <span>{format(scheduledDate, 'PPp')}</span>
                          </div>
                          {post.hashtags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.hashtags.split(',').slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-xs" style={{ color }}>
                                  #{tag.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posted History */}
        {postedPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Posted ({postedPosts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {postedPosts.slice(0, 5).map((post) => {
                  const PostIcon = POST_TYPE_ICONS[post.type];
                  return (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-green-50/50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <PostIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(post.scheduledTime * 1000), 'PPp')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Platform-specific Info */}
      <div className="lg:col-span-2">
        <Alert>
          <Icon className="h-4 w-4" style={{ color }} />
          <AlertTitle>{platformName} Scheduler</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1 space-y-2">
            <p>
              When the scheduled time arrives, posts will be marked as <strong>"Ready to Post"</strong>.
              You'll need to manually post them to {platformName} as this is a browser-based tool without API access.
            </p>
            <div className="bg-white dark:bg-gray-900 p-3 rounded border mt-2">
              <p className="font-medium mb-2">How to use:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Schedule posts with content from TravelTelly (use Auto-Fill!)</li>
                <li>When time arrives, post will be marked "Ready to Post"</li>
                <li>Copy the content and image, then manually post to {platformName}</li>
                <li>Click "Mark Posted" to track completion</li>
              </ol>
            </div>
            {platform === 'twitter' && (
              <p className="mt-2">
                <strong>Twitter Tips:</strong> Keep posts under 280 characters. Use images to boost engagement. Tweet during peak hours.
              </p>
            )}
            {platform === 'instagram' && (
              <p className="mt-2">
                <strong>Instagram Tips:</strong> High-quality images are essential. Use 5-10 relevant hashtags. Post stories for behind-the-scenes content.
              </p>
            )}
            {platform === 'facebook' && (
              <p className="mt-2">
                <strong>Facebook Tips:</strong> Longer descriptions work well. Include links in comments for better reach. Use Facebook's native scheduler.
              </p>
            )}
          </AlertDescription>
        </Alert>
      </div>
      </div>
    </div>
  );
}
