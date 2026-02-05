import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
  HELP_BOT_NPUB, 
  BOT_INFO, 
  HELP_TOPICS, 
  FAQ_RESPONSES, 
  QUICK_ACTIONS,
  getBotDMLink,
  getBotProfileLink,
} from '@/lib/botConfig';

export function HelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { user } = useCurrentUser();

  // Check if bot is configured (not using placeholder npub)
  const isBotConfigured = HELP_BOT_NPUB !== 'npub1traveltellybot...';

  const handleChatWithBot = () => {
    if (!isBotConfigured) {
      alert('Bot setup required! See SETUP_BOT_NOW.md to create your bot in 5 minutes.');
      return;
    }
    
    if (!user) {
      alert('Please login with Nostr to chat with the bot, or view the FAQ below.');
      return;
    }
    
    // Open DM to bot in user's Nostr client
    window.open(getBotDMLink(), '_blank');
  };

  const filteredFAQs = selectedTopic
    ? Object.entries(FAQ_RESPONSES).filter(([key]) => {
        const topic = HELP_TOPICS.find(t => t.id === selectedTopic);
        return topic?.keywords.some(keyword => key.includes(keyword));
      })
    : Object.entries(FAQ_RESPONSES);

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="icon"
        aria-label="Get help"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      {/* Help Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
              {BOT_INFO.name}
            </DialogTitle>
            <DialogDescription>
              {BOT_INFO.about}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Chat with Bot Section */}
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with the Bot
                </CardTitle>
                <CardDescription>
                  Get personalized help via Nostr DM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isBotConfigured ? (
                  <>
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        🚨 Bot Setup Required
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        The help bot hasn't been configured yet. To enable bot chat:
                      </p>
                      <ol className="text-xs text-amber-700 dark:text-amber-300 space-y-1 ml-4 list-decimal">
                        <li>Run: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">npx -y @clawstr/cli@latest init</code></li>
                        <li>Copy the generated npub</li>
                        <li>Update <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">src/lib/botConfig.ts</code></li>
                        <li>Rebuild the site</li>
                      </ol>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        See <strong>SETUP_BOT_NOW.md</strong> for a quick 5-minute guide.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Meanwhile, browse the FAQ below for help →
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Send a direct message to the bot for personalized assistance with any Traveltelly feature.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleChatWithBot}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(getBotProfileLink(), '_blank')}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                    {!user && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ Login with Nostr to chat with the bot
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div>
              <h3 className="font-semibold mb-3">Quick Help Topics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const topic = HELP_TOPICS.find(t => t.id === action.topic);
                  return (
                    <Button
                      key={action.topic}
                      variant={selectedTopic === action.topic ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTopic(
                        selectedTopic === action.topic ? null : action.topic
                      )}
                      className="justify-start"
                    >
                      {topic?.icon} {action.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Help Topics Grid */}
            <div>
              <h3 className="font-semibold mb-3">All Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {HELP_TOPICS.map((topic) => (
                  <Card
                    key={topic.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTopic === topic.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                        : ''
                    }`}
                    onClick={() => setSelectedTopic(
                      selectedTopic === topic.id ? null : topic.id
                    )}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-2xl">{topic.icon}</span>
                        {topic.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {topic.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Frequently Asked Questions</h3>
                {selectedTopic && (
                  <Badge variant="outline" onClick={() => setSelectedTopic(null)} className="cursor-pointer">
                    Show All
                  </Badge>
                )}
              </div>
              
              {filteredFAQs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No FAQs for this topic. Chat with the bot for help!
                </p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFAQs.map(([key, faq]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            {/* Additional Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Here are more ways to get help:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/admin" target="_blank">
                      <HelpCircle className="mr-2 h-3 w-3" />
                      Admin Support
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://github.com/bitpopart/traveltelly/issues" target="_blank">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Report Issue
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/what-is-nostr" target="_blank">
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Learn About Nostr
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bot Info Footer */}
            <div className="text-xs text-center text-muted-foreground pt-4 border-t">
              <p>
                Bot powered by{' '}
                <a 
                  href="https://clawstr.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  Clawstr
                </a>
                {' '}• Running on Nostr • Available 24/7
              </p>
              <p className="mt-1 text-xs">
                Bot NPub: <code className="text-xs bg-muted px-1 py-0.5 rounded">{HELP_BOT_NPUB}</code>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
