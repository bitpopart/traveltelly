import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { nip19 } from 'nostr-tools';
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
  Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow, format } from 'date-fns';

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
              <h1 className="text-3xl font-bold">Share Scheduler</h1>
            </div>
            <p className="text-muted-foreground">
              Automate your Nostr posts - schedule reviews, stories, trips, and stock media to share at specific times
            </p>
          </div>

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
                      <Label htmlFor="url" className="flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        URL <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="url"
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://traveltelly.com/review/naddr1..."
                        className="mt-1.5"
                        required
                      />
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
        </div>
      </div>
    </div>
  );
}
