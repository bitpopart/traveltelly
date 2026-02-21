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
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  ctaTitle?: string;
  ctaDescription?: string;
  ctaBadges?: string[];
  location?: string; // e.g., "Amsterdam, Netherlands" or "88+ Countries"
}

// Kind 30079 - Community Page Content (replaceable)
const COMMUNITY_KIND = 30079;

export function AdminCommunityManager() {
  const { nostr } = useNostr();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  
  const [forumText, setForumText] = useState('');
  const [forumHashtags, setForumHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');

  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>([]);
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '', category: 'travel' as const });

  const [ctaTitle, setCtaTitle] = useState('');
  const [ctaDescription, setCtaDescription] = useState('');
  const [ctaBadges, setCtaBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState('');
  const [location, setLocation] = useState('');

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

  // Default data (same as Community.tsx)
  const defaultFaqs: FAQ[] = [
    {
      question: 'What is TravelTelly?',
      answer: 'TravelTelly is a decentralized travel platform built on Nostr that combines travel reviews, stories, trip reports, and a stock media marketplace with Bitcoin Lightning payments.',
    },
    {
      question: 'Do I need a Nostr account?',
      answer: 'You can browse content without an account, but you need a Nostr account to create reviews, stories, trips, or sell media. You can also purchase stock media as a guest with just an email.',
    },
    {
      question: 'How do Lightning payments work?',
      answer: 'Lightning payments are instant Bitcoin micropayments. You need a Lightning wallet and a Lightning address in your Nostr profile to receive payments. Buyers can pay with Lightning wallets or WebLN browser extensions.',
    },
    {
      question: 'What kind of content can I share?',
      answer: 'You can share travel reviews with GPS coordinates, long-form travel stories, multi-photo trip reports with routes, and sell your travel photography in the stock media marketplace.',
    },
    {
      question: 'How is my data stored?',
      answer: 'All your content is stored on decentralized Nostr relays. You own your data and it can be accessed by any Nostr client. There is no central database or platform that controls your content.',
    },
  ];

  const defaultForumText = 'TravelTelly is built on the Nostr protocol, which means discussions happen across the decentralized Nostr network. Connect with travelers, photographers, and creators using these hashtags:';
  const defaultForumHashtags = ['#traveltelly', '#travel', '#photography', '#mobilephotography', '#travelnostr'];

  const defaultTravelLinks: UsefulLink[] = [
    { title: 'Lonely Planet', url: 'https://www.lonelyplanet.com/', description: 'Travel guides and tips', category: 'travel' },
    { title: 'Atlas Obscura', url: 'https://www.atlasobscura.com/', description: 'Unusual destinations worldwide', category: 'travel' },
    { title: 'Nomadic Matt', url: 'https://www.nomadicmatt.com/', description: 'Budget travel advice', category: 'travel' },
    { title: 'The Points Guy', url: 'https://thepointsguy.com/', description: 'Travel rewards and deals', category: 'travel' },
    { title: 'Rome2Rio', url: 'https://www.rome2rio.com/', description: 'Travel planning and routes', category: 'travel' },
    { title: 'WikiTravel', url: 'https://wikitravel.org/', description: 'Collaborative travel guide', category: 'travel' },
  ];

  const defaultNostrLinks: UsefulLink[] = [
    { title: 'Nostr.com', url: 'https://nostr.com/', description: 'Learn about Nostr protocol', category: 'nostr' },
    { title: 'Nostr.band', url: 'https://nostr.band/', description: 'Nostr network explorer', category: 'nostr' },
    { title: 'Primal', url: 'https://primal.net/', description: 'Nostr web client', category: 'nostr' },
    { title: 'Damus', url: 'https://damus.io/', description: 'Nostr iOS client', category: 'nostr' },
    { title: 'Amethyst', url: 'https://github.com/vitorpamplona/amethyst', description: 'Nostr Android client', category: 'nostr' },
    { title: 'nos2x', url: 'https://github.com/fiatjaf/nos2x', description: 'Nostr browser extension', category: 'nostr' },
    { title: 'Alby', url: 'https://getalby.com/', description: 'Lightning wallet extension', category: 'nostr' },
    { title: 'Nostr Resources', url: 'https://nostr-resources.com/', description: 'Comprehensive Nostr guide', category: 'nostr' },
  ];

  const defaultPhoneographyLinks: UsefulLink[] = [
    { title: 'Moment', url: 'https://www.shopmoment.com/', description: 'Mobile photography gear', category: 'phoneography' },
    { title: 'VSCO', url: 'https://www.vsco.co/', description: 'Photo editing app', category: 'phoneography' },
    { title: 'Snapseed', url: 'https://snapseed.online/', description: 'Professional photo editor', category: 'phoneography' },
    { title: 'Halide', url: 'https://halide.cam/', description: 'Pro camera app for iPhone', category: 'phoneography' },
    { title: 'ProCamera', url: 'https://www.procamera-app.com/', description: 'Advanced iOS camera', category: 'phoneography' },
    { title: 'Mobile Photography Tips', url: 'https://www.adorama.com/alc/category/mobile-photography', description: 'Photography tutorials', category: 'phoneography' },
    { title: 'Smartphone Photography', url: 'https://www.reddit.com/r/mobilephotography/', description: 'Reddit community', category: 'phoneography' },
  ];

  const defaultUsefulLinks = [...defaultTravelLinks, ...defaultNostrLinks, ...defaultPhoneographyLinks];
  
  const defaultCtaTitle = 'Join the TravelTelly Community';
  const defaultCtaDescription = 'Share your travel experiences, connect with photographers, and be part of the decentralized travel revolution on Nostr.';
  const defaultCtaBadges = ['🌍 88+ Countries', '📸 Travel Photography', '⚡ Lightning Network', '🔓 Decentralized'];
  const defaultLocation = ''; // Empty by default - admin can set if desired

  // Load data when fetched, otherwise use defaults
  useEffect(() => {
    if (communityData) {
      setFaqs(communityData.faqs || defaultFaqs);
      setForumText(communityData.forumText || defaultForumText);
      setForumHashtags(communityData.forumHashtags || defaultForumHashtags);
      setUsefulLinks(communityData.usefulLinks || defaultUsefulLinks);
      setCtaTitle(communityData.ctaTitle || defaultCtaTitle);
      setCtaDescription(communityData.ctaDescription || defaultCtaDescription);
      setCtaBadges(communityData.ctaBadges || defaultCtaBadges);
      setLocation(communityData.location || defaultLocation);
    } else if (!isLoading) {
      // If no data exists on Nostr, load defaults
      setFaqs(defaultFaqs);
      setForumText(defaultForumText);
      setForumHashtags(defaultForumHashtags);
      setUsefulLinks(defaultUsefulLinks);
      setCtaTitle(defaultCtaTitle);
      setCtaDescription(defaultCtaDescription);
      setCtaBadges(defaultCtaBadges);
      setLocation(defaultLocation);
    }
  }, [communityData, isLoading]);

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please provide both question and answer.',
        variant: 'destructive',
      });
      return;
    }

    const newFaq = { question: newFaqQuestion, answer: newFaqAnswer };
    console.log('➕ Adding FAQ:', newFaq);
    console.log('📋 Current FAQs before:', faqs.length);
    
    setFaqs([...faqs, newFaq]);
    console.log('📋 FAQs after (should be +1):', faqs.length + 1);
    
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    
    toast({
      title: 'FAQ Added ✅',
      description: 'Item added to list. Click "Save All Changes" to publish to Nostr.',
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const handleAddHashtag = () => {
    if (!newHashtag.trim()) return;
    const tag = newHashtag.startsWith('#') ? newHashtag : `#${newHashtag}`;
    
    console.log('➕ Adding hashtag:', tag);
    console.log('🏷️ Current hashtags before:', forumHashtags.length);
    
    setForumHashtags([...forumHashtags, tag]);
    console.log('🏷️ Hashtags after (should be +1):', forumHashtags.length + 1);
    
    setNewHashtag('');
    
    toast({
      title: 'Hashtag Added ✅',
      description: 'Item added to list. Click "Save All Changes" to publish to Nostr.',
    });
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

    console.log('➕ Adding link:', newLink);
    console.log('🔗 Current links before:', usefulLinks.length);
    
    setUsefulLinks([...usefulLinks, newLink]);
    console.log('🔗 Links after (should be +1):', usefulLinks.length + 1);
    
    setNewLink({ title: '', url: '', description: '', category: 'travel' });
    
    toast({
      title: 'Link Added ✅',
      description: 'Item added to list. Click "Save All Changes" to publish to Nostr.',
    });
  };

  const handleRemoveLink = (index: number) => {
    setUsefulLinks(usefulLinks.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, field: keyof UsefulLink, value: string) => {
    const updated = [...usefulLinks];
    updated[index] = { ...updated[index], [field]: value };
    setUsefulLinks(updated);
  };

  const handleAddBadge = () => {
    if (!newBadge.trim()) return;
    
    console.log('➕ Adding badge:', newBadge);
    console.log('🏅 Current badges before:', ctaBadges.length);
    
    setCtaBadges([...ctaBadges, newBadge]);
    console.log('🏅 Badges after (should be +1):', ctaBadges.length + 1);
    
    setNewBadge('');
    
    toast({
      title: 'Badge Added ✅',
      description: 'Item added to list. Click "Save All Changes" to publish to Nostr.',
    });
  };

  const handleRemoveBadge = (index: number) => {
    setCtaBadges(ctaBadges.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const data: CommunityData = {
        faqs,
        forumText,
        forumHashtags,
        usefulLinks,
        ctaTitle,
        ctaDescription,
        ctaBadges,
        location,
      };

      console.log('💾 Saving community data to Nostr:', data);

      // Use Promise to wait for the event to be published
      await new Promise<void>((resolve, reject) => {
        publishEvent(
          {
            kind: COMMUNITY_KIND,
            content: JSON.stringify(data, null, 2),
            tags: [
              ['d', 'community-page'],
              ['title', 'TravelTelly Community Page Content'],
              ['alt', 'Community page configuration for TravelTelly'],
            ],
          },
          {
            onSuccess: () => {
              console.log('✅ Community data published successfully');
              resolve();
            },
            onError: (error) => {
              console.error('❌ Failed to publish community data:', error);
              reject(error);
            },
          }
        );
      });

      // Invalidate the query to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['community-data'] });
      
      console.log('🔄 Query cache invalidated, data should refresh');

      toast({
        title: 'Community Page Updated! 🎉',
        description: 'Changes have been published to Nostr and will be visible on the community page.',
      });
    } catch (error) {
      console.error('Failed to save community data:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save community page data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-muted-foreground">Loading community data...</p>
        </CardContent>
      </Card>
    );
  }

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
              {communityData ? (
                <>
                  <strong>Editing published data.</strong> Changes will update the <strong>/community</strong> page visible to all users.
                </>
              ) : (
                <>
                  <strong>Using default data.</strong> No community data has been published to Nostr yet. Click "Save All Changes" to publish the current defaults.
                </>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium">
              <span className="text-blue-600 dark:text-blue-400">{faqs.length} FAQs</span>
              {' • '}
              <span className="text-purple-600 dark:text-purple-400">{forumHashtags.length} Hashtags</span>
              {' • '}
              <span className="text-pink-600 dark:text-pink-400">{usefulLinks.length} Links</span>
              {' • '}
              <span className="text-green-600 dark:text-green-400">{ctaBadges.length} Badges</span>
            </div>
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
            {faqs.length === 0 ? (
              <p className="text-sm text-gray-500 italic text-center py-4">No FAQs added yet</p>
            ) : (
              faqs.map((faq, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500">Question</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                          className="font-semibold"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Answer</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFaq(index)}
                      className="ml-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))
            )}
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
                <div className="space-y-3">
                  {categoryLinks.map((link, index) => {
                    const globalIndex = usefulLinks.indexOf(link);
                    return (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={link.title}
                              onChange={(e) => handleUpdateLink(globalIndex, 'title', e.target.value)}
                              className="font-semibold text-sm h-8"
                              placeholder="Link title"
                            />
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveLink(globalIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <Input
                          value={link.url}
                          onChange={(e) => handleUpdateLink(globalIndex, 'url', e.target.value)}
                          className="text-xs mb-2 h-8"
                          placeholder="https://..."
                        />
                        <Input
                          value={link.description}
                          onChange={(e) => handleUpdateLink(globalIndex, 'description', e.target.value)}
                          className="text-xs h-8"
                          placeholder="Description"
                        />
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

      {/* Location & Call-to-Action Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Location & Call-to-Action
          </CardTitle>
          <CardDescription>
            Edit the location and bottom CTA section of the community page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div>
            <Label>Location/Place (Optional)</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Amsterdam, Netherlands or 88+ Countries"
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your location or coverage area (e.g., city, country, or global reach). Leave empty to hide.
            </p>
          </div>

          <Separator />

          {/* CTA Title */}
          <div>
            <Label>Call-to-Action Title</Label>
            <Input
              value={ctaTitle}
              onChange={(e) => setCtaTitle(e.target.value)}
              placeholder="Join the TravelTelly Community"
              className="max-w-lg"
            />
          </div>

          {/* CTA Description */}
          <div>
            <Label>Call-to-Action Description</Label>
            <Textarea
              value={ctaDescription}
              onChange={(e) => setCtaDescription(e.target.value)}
              placeholder="Describe why users should join..."
              rows={3}
            />
          </div>

          {/* CTA Badges */}
          <div className="space-y-3">
            <Label>Call-to-Action Badges</Label>
            <p className="text-xs text-muted-foreground">
              Small highlighted features or stats shown as badges (e.g., "🌍 88+ Countries")
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {ctaBadges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                  {badge}
                  <button
                    onClick={() => handleRemoveBadge(index)}
                    className="ml-2 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="e.g., 🌍 88+ Countries or 📸 Travel Photography"
                onKeyDown={(e) => e.key === 'Enter' && handleAddBadge()}
              />
              <Button onClick={handleAddBadge} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Badge
              </Button>
            </div>
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
