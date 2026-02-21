import { useSeoMeta } from '@unhead/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageCircle, HelpCircle, ExternalLink, Compass, Zap, Camera } from 'lucide-react';

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
  location?: string;
}

const COMMUNITY_KIND = 30079;

export default function Community() {
  const { nostr } = useNostr();

  useSeoMeta({
    title: 'Community - TravelTelly',
    description: 'Join the Travel, Nostr and Mobile Photo/Videography community. Resources, discussions, and helpful links.',
  });

  // Fetch community data from Nostr
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Default fallback data
  const defaultFaqs = [
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

  const defaultTravelLinks = [
    { title: 'Lonely Planet', url: 'https://www.lonelyplanet.com/', description: 'Travel guides and tips' },
    { title: 'Atlas Obscura', url: 'https://www.atlasobscura.com/', description: 'Unusual destinations worldwide' },
    { title: 'Nomadic Matt', url: 'https://www.nomadicmatt.com/', description: 'Budget travel advice' },
    { title: 'The Points Guy', url: 'https://thepointsguy.com/', description: 'Travel rewards and deals' },
    { title: 'Rome2Rio', url: 'https://www.rome2rio.com/', description: 'Travel planning and routes' },
    { title: 'WikiTravel', url: 'https://wikitravel.org/', description: 'Collaborative travel guide' },
  ];

  const defaultNostrLinks = [
    { title: 'Nostr.com', url: 'https://nostr.com/', description: 'Learn about Nostr protocol' },
    { title: 'Nostr.band', url: 'https://nostr.band/', description: 'Nostr network explorer' },
    { title: 'Primal', url: 'https://primal.net/', description: 'Nostr web client' },
    { title: 'Damus', url: 'https://damus.io/', description: 'Nostr iOS client' },
    { title: 'Amethyst', url: 'https://github.com/vitorpamplona/amethyst', description: 'Nostr Android client' },
    { title: 'nos2x', url: 'https://github.com/fiatjaf/nos2x', description: 'Nostr browser extension' },
    { title: 'Alby', url: 'https://getalby.com/', description: 'Lightning wallet extension' },
    { title: 'Nostr Resources', url: 'https://nostr-resources.com/', description: 'Comprehensive Nostr guide' },
  ];

  const defaultPhoneographyLinks = [
    { title: 'Moment', url: 'https://www.shopmoment.com/', description: 'Mobile photography gear' },
    { title: 'VSCO', url: 'https://www.vsco.co/', description: 'Photo editing app' },
    { title: 'Snapseed', url: 'https://snapseed.online/', description: 'Professional photo editor' },
    { title: 'Halide', url: 'https://halide.cam/', description: 'Pro camera app for iPhone' },
    { title: 'ProCamera', url: 'https://www.procamera-app.com/', description: 'Advanced iOS camera' },
    { title: 'Mobile Photography Tips', url: 'https://www.adorama.com/alc/category/mobile-photography', description: 'Photography tutorials' },
    { title: 'Smartphone Photography', url: 'https://www.reddit.com/r/mobilephotography/', description: 'Reddit community' },
  ];

  // Use Nostr data if available, otherwise use defaults
  const faqs = communityData?.faqs || defaultFaqs;
  const forumText = communityData?.forumText || 'TravelTelly is built on the Nostr protocol, which means discussions happen across the decentralized Nostr network. Connect with travelers, photographers, and creators using these hashtags:';
  const forumHashtags = communityData?.forumHashtags || ['#traveltelly', '#travel', '#photography', '#mobilephotography', '#travelnostr'];
  const travelLinks = communityData?.usefulLinks?.filter(l => l.category === 'travel') || defaultTravelLinks;
  const nostrLinks = communityData?.usefulLinks?.filter(l => l.category === 'nostr') || defaultNostrLinks;
  const phoneographyLinks = communityData?.usefulLinks?.filter(l => l.category === 'phoneography') || defaultPhoneographyLinks;
  
  const ctaTitle = communityData?.ctaTitle || 'Join the TravelTelly Community';
  const ctaDescription = communityData?.ctaDescription || 'Share your travel experiences, connect with photographers, and be part of the decentralized travel revolution on Nostr.';
  const ctaBadges = communityData?.ctaBadges || ['🌍 88+ Countries', '📸 Travel Photography', '⚡ Lightning Network', '🔓 Decentralized'];
  const location = communityData?.location || ''; // Empty by default - only shown if admin sets it

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 pt-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="p-4 rounded-full w-fit mx-auto mb-6" style={{ backgroundColor: '#9333ea20' }}>
              <Users className="w-16 h-16 mx-auto" style={{ color: '#9333ea' }} />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Community
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-3">
              The Travel, Nostr and Mobile Photo/Videography community.
            </p>
            {location && (
              <p className="text-lg text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <span className="text-2xl">📍</span>
                <span>{location}</span>
              </p>
            )}
          </div>

          {/* FAQ Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <HelpCircle className="w-6 h-6" style={{ color: '#9333ea' }} />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Common questions about TravelTelly and how it works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {faqs.map((faq, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                      {index < faqs.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* Forum Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageCircle className="w-6 h-6" style={{ color: '#9333ea' }} />
                Forum & Discussions
              </CardTitle>
              <CardDescription>
                Connect with other travelers on Nostr
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-300 dark:border-purple-700">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                  Join the Conversation on Nostr
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {forumText}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {forumHashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">{tag}</Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Post on any Nostr client (Primal, Damus, Amethyst) with these hashtags to connect with the community.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <a 
                  href="https://primal.net/explore/trending" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Primal</h4>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Explore trending content and discussions on Nostr
                  </p>
                </a>

                <a 
                  href="https://nostr.band/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Nostr.band</h4>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Search and explore the Nostr network
                  </p>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Useful Links Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ExternalLink className="w-6 h-6" style={{ color: '#9333ea' }} />
                Useful Links
              </CardTitle>
              <CardDescription>
                Resources for travel, Nostr, and mobile photography
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Travel Links */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Travel Resources</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {travelLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{link.title}</h4>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Nostr Links */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Nostr Resources</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {nostrLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{link.title}</h4>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Phoneography Links */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-pink-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Mobile Photo/Videography</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {phoneographyLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{link.title}</h4>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-colors" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{link.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-300 dark:border-purple-700">
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#9333ea' }} />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {ctaTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              {ctaDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {ctaBadges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
