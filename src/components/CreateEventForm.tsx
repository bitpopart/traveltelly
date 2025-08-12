import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { CalendarIcon, ClockIcon, PlusIcon, XIcon } from 'lucide-react';
import { LoginArea } from '@/components/auth/LoginArea';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().optional(),
  content: z.string().optional(),
  isAllDay: z.boolean(),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().optional(),
  endDate: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

export function CreateEventForm() {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending } = useNostrPublish();
  const { toast } = useToast();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      isAllDay: false,
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      image: '',
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = form;
  const isAllDay = watch('isAllDay');

  const addHashtag = () => {
    const tag = newHashtag.trim().toLowerCase().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (data: EventFormData) => {
    if (!user) return;

    try {
      // Generate unique identifier
      const d = Math.random().toString(36).substring(2, 15);

      // Build tags array
      const tags: string[][] = [
        ['d', d],
        ['title', data.title],
      ];

      if (data.summary) {
        tags.push(['summary', data.summary]);
      }

      if (data.image) {
        tags.push(['image', data.image]);
      }

      if (data.location) {
        tags.push(['location', data.location]);
      }

      // Add hashtags
      hashtags.forEach(tag => {
        tags.push(['t', tag]);
      });

      let kind: number;
      let startValue: string;

      if (data.isAllDay) {
        // Date-based event (kind 31922)
        kind = 31922;
        startValue = data.startDate;

        if (data.endDate && data.endDate !== data.startDate) {
          tags.push(['end', data.endDate]);
        }
      } else {
        // Time-based event (kind 31923)
        kind = 31923;

        // Combine date and time for start timestamp
        const startDateTime = new Date(`${data.startDate}T${data.startTime || '00:00'}`);
        startValue = Math.floor(startDateTime.getTime() / 1000).toString();

        // Add end timestamp if provided
        if (data.endDate && data.endTime) {
          const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
          const endValue = Math.floor(endDateTime.getTime() / 1000).toString();
          tags.push(['end', endValue]);
        } else if (data.endTime && !data.endDate) {
          // Same day, different time
          const endDateTime = new Date(`${data.startDate}T${data.endTime}`);
          const endValue = Math.floor(endDateTime.getTime() / 1000).toString();
          tags.push(['end', endValue]);
        }
      }

      tags.push(['start', startValue]);

      createEvent({
        kind,
        content: data.content || '',
        tags,
      });

      toast({
        title: 'Event created',
        description: 'Your calendar event has been published successfully.',
      });

      // Reset form
      form.reset();
      setHashtags([]);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Calendar Event</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You must be logged in to create events.
            </p>
            <LoginArea className="max-w-60 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Create Calendar Event</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Event title"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                {...register('summary')}
                placeholder="Brief description"
              />
            </div>

            <div>
              <Label htmlFor="content">Description</Label>
              <Textarea
                id="content"
                {...register('content')}
                placeholder="Detailed event description"
                rows={3}
              />
            </div>
          </div>

          {/* Event Type */}
          <div className="flex items-center space-x-2">
            <Switch
              id="isAllDay"
              {...register('isAllDay')}
            />
            <Label htmlFor="isAllDay" className="flex items-center space-x-2">
              {isAllDay ? (
                <CalendarIcon className="h-4 w-4" />
              ) : (
                <ClockIcon className="h-4 w-4" />
              )}
              <span>{isAllDay ? 'All-day event' : 'Timed event'}</span>
            </Label>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
              )}
            </div>

            {!isAllDay && (
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                />
              </div>
            )}

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
            </div>

            {!isAllDay && (
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register('endTime')}
                />
              </div>
            )}
          </div>

          {/* Location and Image */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Event location or meeting link"
              />
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                {...register('image')}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-sm text-destructive mt-1">{errors.image.message}</p>
              )}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <Label>Hashtags</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="Add hashtag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHashtag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addHashtag}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating Event...' : 'Create Event'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}