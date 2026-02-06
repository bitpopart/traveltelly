import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, MessageCircleQuestion, BarChart3, Share2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { createClawstrPost } from '@/lib/clawstr';

/**
 * Telly Bot - AI Agent for Travel Community
 * 
 * Admin panel for creating questions and polls that can be shared to:
 * - Nostr (for npubs to reply)
 * - Clawstr /c/travel (for AI agents to discuss)
 */
export function TellyBot() {
  const { user } = useCurrentUser();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  
  // Question state
  const [question, setQuestion] = useState('');
  const [questionContext, setQuestionContext] = useState('');
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollContext, setPollContext] = useState('');
  
  const isAdmin = user?.pubkey === '7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35';

  /**
   * Create a question event (kind 1 with special tags)
   */
  const createQuestion = () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    const content = `🤔 Question from Telly Bot:

${question}

${questionContext ? `\n${questionContext}\n` : ''}
Reply with your answer! 💬

#traveltelly #question #travel`;

    publishEvent(
      {
        kind: 1,
        content,
        tags: [
          ['t', 'traveltelly'],
          ['t', 'question'],
          ['t', 'travel'],
          ['L', 'telly-bot'],
          ['l', 'question', 'telly-bot'],
        ],
      },
      {
        onSuccess: () => {
          toast({
            title: 'Question Published!',
            description: 'Your question has been shared to Nostr',
          });
          setQuestion('');
          setQuestionContext('');
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  /**
   * Share question to Clawstr /c/travel
   */
  const shareQuestionToClawstr = () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive',
      });
      return;
    }

    const content = `🤔 Question for the travel community:

${question}

${questionContext ? `\n${questionContext}\n` : ''}
What do you think? AI agents and humans, let's discuss!

#travel #question #traveltelly`;

    const clawstrEvent = createClawstrPost(
      content,
      'https://clawstr.com/c/travel',
      [
        ['t', 'question'],
        ['t', 'travel'],
        ['L', 'telly-bot'],
        ['l', 'question', 'telly-bot'],
      ]
    );

    publishEvent(clawstrEvent, {
      onSuccess: () => {
        toast({
          title: 'Shared to Clawstr!',
          description: 'Question posted to /c/travel for AI agents',
        });
        setQuestion('');
        setQuestionContext('');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  /**
   * Create a poll event (kind 1 with poll tags)
   */
  const createPoll = () => {
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

    const optionsText = validOptions.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n');
    
    const content = `📊 Poll from Telly Bot:

${pollQuestion}

${optionsText}

${pollContext ? `\n${pollContext}\n` : ''}
Reply with your choice (A, B, C, etc.)! 🗳️

#traveltelly #poll #travel`;

    publishEvent(
      {
        kind: 1,
        content,
        tags: [
          ['t', 'traveltelly'],
          ['t', 'poll'],
          ['t', 'travel'],
          ['L', 'telly-bot'],
          ['l', 'poll', 'telly-bot'],
          ...validOptions.map(opt => ['poll_option', opt]),
        ],
      },
      {
        onSuccess: () => {
          toast({
            title: 'Poll Published!',
            description: 'Your poll has been shared to Nostr',
          });
          setPollQuestion('');
          setPollOptions(['', '']);
          setPollContext('');
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  /**
   * Share poll to Clawstr /c/travel
   */
  const sharePollToClawstr = () => {
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

    const optionsText = validOptions.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`).join('\n');
    
    const content = `📊 Poll for the travel community:

${pollQuestion}

${optionsText}

${pollContext ? `\n${pollContext}\n` : ''}
What's your pick? Share your thoughts! 🗳️

#travel #poll #traveltelly`;

    const clawstrEvent = createClawstrPost(
      content,
      'https://clawstr.com/c/travel',
      [
        ['t', 'poll'],
        ['t', 'travel'],
        ['L', 'telly-bot'],
        ['l', 'poll', 'telly-bot'],
        ...validOptions.map(opt => ['poll_option', opt]),
      ]
    );

    publishEvent(clawstrEvent, {
      onSuccess: () => {
        toast({
          title: 'Shared to Clawstr!',
          description: 'Poll posted to /c/travel for AI agents',
        });
        setPollQuestion('');
        setPollOptions(['', '']);
        setPollContext('');
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
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
            Create questions and polls to engage the travel community on Nostr and Clawstr
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Share to Nostr:</strong> Regular Nostr users (npubs) can see and reply to your questions/polls
          </p>
          <p>
            <strong>Share to Clawstr:</strong> AI agents on /c/travel can discuss and provide insights
          </p>
          <p className="text-muted-foreground">
            Telly Bot helps build community engagement by asking thought-provoking questions and gathering opinions
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={createQuestion} className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share to Nostr
                </Button>
                <Button 
                  onClick={shareQuestionToClawstr} 
                  variant="outline"
                  className="flex-1 border-purple-300 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Share to Clawstr /c/travel
                </Button>
              </div>
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={createPoll} className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share to Nostr
                </Button>
                <Button 
                  onClick={sharePollToClawstr} 
                  variant="outline"
                  className="flex-1 border-purple-300 hover:bg-purple-50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Share to Clawstr /c/travel
                </Button>
              </div>
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
            <li>For polls, keep options concise and balanced</li>
            <li>Ask open-ended questions to encourage discussion</li>
            <li>Share to Clawstr to get AI agent insights and perspectives</li>
            <li>Share to Nostr to get human traveler experiences</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
