import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Users, HelpCircle, MessageCircle, ExternalLink, Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface UsefulLink {
  title: string;
  url: string;
  description: string;
  category: 'travel' | 'nostr' | 'phoneography';
}

interface CommunityData {
  faqs: FAQ[];
  forumText: string;
  forumHashtags: string[];
  usefulLinks: UsefulLink[];
}

// Kind 30079 - Community Page Content (replaceable)
const COMMUNITY_KIND = 30079;

export function AdminCommunityManager() {
  const { nostr } = useNostr();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  
  const [forumText, setForumText] = useState('');
  const [forumHashtags, setForumHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');

  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '', category: 'travel' as const });

  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing community data
  const { data: communityData, isLoading } = useQuery({
    queryKey: ['community-data'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const events = await nostr.query([{
        kinds: [COMMUNITY_KIND],
        limit: 1,
      }], { signal });

      if (events.length > 0) {
        try {
          const data = JSON.parse(events[0].content) as CommunityData;
          return data;
        } catch {
          return null;
        }
      }
      return null;
    },
  });

  // Load data when fetched
  useEffect(() => {
    if (communityData) {
      setFaqs(communityData.faqs || []);
      setForumText(communityData.forumText || '');
      setForumHashtags(communityData.forumHashtags || []);
      setUsefulLinks(communityData.usefulLinks || []);
    }
  }, [communityData]);

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both question and answer.',
        variant: 'destructive',
      });
      return;
    }

    setFaqs([...faqs, { question: newFaqQuestion, answer: newFaqAnswer }]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleAddHashtag = () => {
    if (!newHashtag.trim()) return;
    const tag = newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`;
    setForumHashtags([...forumHashtags, tag]);
    setNewHashtag('');
  };

  const handleRemoveHashtag = (index: number) => {
    setForumHashtags(forumHashtags.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim() || !newLink.description.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all link fields.',
        variant: 'destructive',
      });
      return;
    }

    setUsefulLinks([...usefulLinks, newLink]);
    setNewLink({ title: '', url: '', description: '', category: 'travel' });
  };

  const handleRemoveLink = (index: number) => {
    setUsefulLinks(usefulLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data: CommunityData = {
        faqs,
        forumText,
        forumHashtags,
        usefulLinks,
      };

      publishEvent({
        kind: COMMUNITY_KIND,
        content: JSON.stringify(data, null, 2),
        tags: [
          ['d', 'community-page'],
          ['title', 'TravelTelly Community Page Content'],
          ['alt', 'Community page configuration for TravelTelly'],
        ],
      });

      toast({
        title: 'Community Page Updated! 🎉',
        description: 'Changes will be visible on the community page.',
      });
    } catch (error) {
      console.error('Failed to save community data:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save community page data.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Community Page Management
          </CardTitle>
          <CardDescription>
            Edit FAQ, Forum info, and Useful Links for the community page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Changes made here will update the <strong>/community</strong> page visible to all users.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            FAQ Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing FAQs */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFaq(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Add New FAQ */}
          <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
            <h4 className="font-semibold text-sm">Add New FAQ</h4>
            <div className="space-y-3">
              <div>
                <Label>Question</Label>
                <Input
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Enter question..."
                />
              </div>
              <div>
                <Label>Answer</Label>
                <Textarea
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Enter answer..."
                  rows={3}
                />
              </div>
              <Button onClick={handleAddFaq} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forum Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Forum Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Forum Description Text</Label>
            <Textarea
              value={forumText}
              onChange={(e) => setForumText(e.target.value)}
              placeholder="Describe how users can participate in forum discussions..."
              rows={4}
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <Label>Community Hashtags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {forumHashtags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {tag}
                  <button
                    onClick={() => handleRemoveHashtag(index)}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="Enter hashtag (with or without #)"
                onKeyDown={(e) => e.key === 'Enter' && handleAddHashtag()}
              />
              <Button onClick={handleAddHashtag} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Useful Links Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-pink-600" />
            Useful Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Links by Category */}
          {(['travel', 'nostr', 'phoneography'] as const).map((category) => {
            const categoryLinks = usefulLinks.filter(link => link.category === category);
            const categoryLabels = {
              travel: '🧭 Travel Resources',
              nostr: '⚡ Nostr Resources',
              phoneography: '📸 Mobile Photo/Videography',
            };

            return (
              <div key={category}>
                <h4 className="font-semibold mb-3">{categoryLabels[category]}</h4>
                <div className="space-y-2">
                  {categoryLinks.map((link, index) => {
                    const globalIndex = usefulLinks.indexOf(link);
                    return (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-sm">{link.title}</h5>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{link.description}</p>
                          <p className="text-xs text-gray-400 truncate">{link.url}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLink(globalIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                  {categoryLinks.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No links in this category yet</p>
                  )}
                </div>
                {category !== 'phoneography' && <Separator className="my-4" />}
              </div>
            );
          })}

          {/* Add New Link */}
          <div className="space-y-4 p-4 border-2 border-dashed rounded-lg">
            <h4 className="font-semibold text-sm">Add New Link</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="travel">🧭 Travel</option>
                  <option value="nostr">⚡ Nostr</option>
                  <option value="phoneography">📸 Phoneography</option>
                </select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Resource name..."
                />
              </div>
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={newLink.url}
                onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={newLink.description}
                onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description..."
              />
            </div>
            <Button onClick={handleAddLink} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing to Nostr...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes to Nostr
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
