import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  User, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  Settings,
  Coins,
  Brain
} from 'lucide-react';

/**
 * ClawChat - NowClaw-style AI Chat Interface
 * 
 * Provides an AI chat interface similar to NowClaw with:
 * - Claude Opus 4.6 (latest model)
 * - Credit system setup
 * - Chat history
 * - Model selection
 * - No server/security requirements (as per user request)
 * 
 * Note: This is a UI mockup. Actual AI integration would require:
 * - Clawstr AI provider setup
 * - API keys configuration
 * - Credit system integration
 */

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  costPerMessage: number; // in credits
  featured?: boolean;
}

const AI_MODELS: AIModel[] = [
  {
    id: 'claude-opus-4.6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    description: 'Latest and most capable Claude model. Best for complex reasoning and analysis.',
    costPerMessage: 5,
    featured: true,
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    description: 'Balanced performance and speed. Great for most tasks.',
    costPerMessage: 3,
  },
  {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'Anthropic',
    description: 'Fast and efficient. Best for simple queries.',
    costPerMessage: 1,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Advanced reasoning with vision capabilities.',
    costPerMessage: 4,
  },
];

const SAMPLE_PROMPTS = [
  "Help me write a travel review for a cafe I visited",
  "Suggest destinations for photography enthusiasts",
  "How do I create an engaging trip report?",
  "Best practices for travel blogging",
  "Ideas for travel-themed social media posts",
];

export function ClawChat() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Welcome to Traveltelly AI Assistant! I can help you with travel content, photography tips, destination recommendations, and more. Ask me anything!',
      timestamp: Date.now(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('claude-opus-4.6');
  const [credits, setCredits] = useState<number>(100); // Demo credits
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const model = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send message to AI (mock implementation)
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Check credits
    if (credits < model.costPerMessage) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${model.costPerMessage} credits to use ${model.name}. Please purchase more credits.`,
        variant: 'destructive',
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI response
      const aiResponse: Message = {
        role: 'assistant',
        content: getMockResponse(inputMessage),
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setCredits(prev => prev - model.costPerMessage);
      
      toast({
        title: 'Message Sent',
        description: `Used ${model.costPerMessage} credits`,
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mock AI responses (replace with actual AI integration)
   */
  const getMockResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('review')) {
      return `Great! I'd be happy to help you write a travel review. Here's a structure I recommend:

**Title**: Make it catchy and include the place name

**Introduction**: Start with what drew you to this location

**Atmosphere & Ambiance**: Describe the vibe, decor, and overall feel

**Experience**: Share specific details about your visit

**Highlights**: What stood out? Food, service, view, etc.

**Photos**: Upload photos with GPS data for automatic location tagging

**Rating**: Give an honest 1-5 star rating

**Recommendation**: Who would enjoy this place?

Would you like me to help you draft a specific section?`;
    }
    
    if (lowerPrompt.includes('destination') || lowerPrompt.includes('photography')) {
      return `For photography enthusiasts, here are some incredible destinations:

**1. Iceland** 🇮🇸
- Northern lights, waterfalls, glaciers
- Best time: September-March (aurora), June-August (midnight sun)

**2. Japan** 🇯🇵
- Cherry blossoms, temples, neon streets
- Best time: March-April (sakura), October-November (fall colors)

**3. Patagonia** 🏔️
- Mountains, glaciers, wildlife
- Best time: November-March

**4. Santorini, Greece** 🇬🇷
- White buildings, blue domes, sunsets
- Best time: April-October

**5. New Zealand** 🇳🇿
- Diverse landscapes, mountains, fjords
- Best time: October-April

Which destination interests you most?`;
    }
    
    if (lowerPrompt.includes('trip report')) {
      return `Creating an engaging trip report is all about storytelling! Here's how:

**Structure**:
1. **Introduction**: Where, when, and why
2. **Day-by-day or Highlights**: Break it into digestible sections
3. **Photos**: Use photos to tell the story visually
4. **GPS Routes**: Show your journey on a map
5. **Tips & Recommendations**: Share what you learned
6. **Conclusion**: Reflect on the experience

**Best Practices**:
- Upload photos chronologically for automatic route mapping
- Include GPS data in photos (EXIF metadata)
- Mix wide shots and detail shots
- Add captions to explain context
- Share practical tips (costs, logistics, timing)

**On Traveltelly**:
- Use the Trips feature for multi-photo journeys
- GPS coordinates auto-extracted from photos
- Route visualization on interactive map
- Share to Nostr for global reach

Want help with a specific trip?`;
    }
    
    // Default response
    return `I'd be happy to help with that! As your Traveltelly AI Assistant, I can assist with:

✈️ **Travel Content**
- Review writing
- Story creation
- Trip reports
- Photography tips

📸 **Stock Media**
- Photo selection
- Licensing advice
- Marketplace strategy

🗺️ **Traveltelly Features**
- GPS extraction
- Map navigation
- Nostr integration
- Guest checkout

What would you like to explore?`;
  };

  /**
   * Use sample prompt
   */
  const useSamplePrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  /**
   * Clear chat
   */
  const handleClearChat = () => {
    setMessages([{
      role: 'system',
      content: 'Chat cleared. How can I help you today?',
      timestamp: Date.now(),
    }]);
    toast({
      title: 'Chat Cleared',
      description: 'Started a new conversation',
    });
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Chat Assistant
          </CardTitle>
          <CardDescription>
            Login with Nostr to access AI-powered travel assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please login to use the AI chat assistant
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Model Selection & Credits */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  AI Chat Assistant
                  <Badge variant="outline" className="bg-purple-100">
                    {model.name}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Powered by {model.provider} • {model.costPerMessage} credits per message
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Credits Display */}
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border shadow-sm">
                <Coins className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-xs text-muted-foreground">Credits</div>
                  <div className="text-lg font-bold">{credits}</div>
                </div>
              </div>
              
              {/* Settings Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Model Selection
            </CardTitle>
            <CardDescription>
              Choose the AI model that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between gap-8">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {model.name}
                            {model.featured && (
                              <Badge variant="secondary" className="text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Latest
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {model.description}
                          </div>
                        </div>
                        <Badge variant="outline">{model.costPerMessage} credits</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>About Credits</AlertTitle>
              <AlertDescription className="text-sm space-y-2">
                <p>Credits are used to access AI models. Different models have different costs:</p>
                <ul className="list-disc list-inside space-y-1 text-xs ml-2">
                  <li>Claude Opus 4.6: 5 credits (best quality)</li>
                  <li>Claude Sonnet 4.5: 3 credits (balanced)</li>
                  <li>Claude Haiku 4: 1 credit (fast & efficient)</li>
                  <li>GPT-4 Turbo: 4 credits (vision capable)</li>
                </ul>
                <p className="pt-2 font-medium">
                  💡 Demo mode: You have 100 free credits to try out the AI assistant!
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={handleClearChat}>
                Clear Chat
              </Button>
              <Button onClick={() => setShowSettings(false)}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Area */}
      <Card className="h-[500px] flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                  {message.role === 'system' ? (
                    <Info className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : message.role === 'system'
                    ? 'bg-gray-100 text-gray-700 border border-gray-200'
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-purple-700" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        <Separator />

        {/* Sample Prompts (show when chat is new) */}
        {messages.length <= 1 && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="text-xs font-medium text-gray-600 mb-2">Try these prompts:</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => useSamplePrompt(prompt)}
                  className="text-xs h-auto py-2"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about travel, photography, or Traveltelly features..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || credits < model.costPerMessage}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          
          {credits < model.costPerMessage && (
            <Alert className="mt-3">
              <Zap className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Insufficient credits. You need {model.costPerMessage} credits to use {model.name}.
                <Button variant="link" className="h-auto p-0 ml-2 text-xs">
                  Purchase Credits →
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            About AI Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong>Current Model:</strong> {model.name} - {model.description}
          </p>
          <p>
            <strong>Cost:</strong> {model.costPerMessage} credits per message
          </p>
          <p>
            <strong>Features:</strong> Travel advice, content creation help, destination recommendations, 
            photo tips, and Traveltelly feature guidance
          </p>
          <p className="text-xs pt-2">
            💡 <strong>Demo Mode:</strong> This is a demo interface showing the chat UI. 
            In production, this would connect to Clawstr AI or another AI provider with 
            proper credit system integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
