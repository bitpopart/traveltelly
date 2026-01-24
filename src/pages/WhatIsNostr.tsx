import { useSeoMeta } from '@unhead/react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { 
  Zap, 
  Key, 
  Globe, 
  Users, 
  Lock, 
  ArrowRight,
  Shield,
  Wallet,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WhatIsNostr() {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'What is Nostr? - Traveltelly',
    description: 'Learn about Nostr, the decentralized social protocol powering Traveltelly. Discover how to join and start sharing your travel experiences.',
  });

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#e8e8e8' }}>
      <Navigation />
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              What is Nostr?
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              The decentralized protocol powering Traveltelly
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-6 md:mb-8">
            <CardContent className="p-6 md:p-8">
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                <strong>Nostr</strong> (Notes and Other Stuff Transmitted by Relays) is a simple, open protocol 
                that enables truly decentralized social media. Unlike traditional platforms, Nostr gives you 
                complete ownership of your identity and content.
              </p>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                On Traveltelly, Nostr means your travel reviews, stories, and photos are yours forever—no company 
                can delete them, and you can access them from any Nostr-compatible app.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Why Nostr?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Key className="w-5 h-5" style={{ color: '#393636' }} />
                    </div>
                    You Own Your Identity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Your identity is a cryptographic key pair that you control. No company can ban 
                    you or take away your account.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    Truly Decentralized
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    No central server controls Nostr. Your data is distributed across many independent 
                    relays that anyone can run.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    Built-in Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Lightning Network integration lets you send instant Bitcoin tips to content creators 
                    and earn from your contributions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    Interoperable Apps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    Your Nostr identity works across all Nostr apps. Post on Traveltelly, view on 
                    other clients—it's all connected.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How to Join */}
          <Card className="mb-8 md:mb-12 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center">
                How to Join Nostr
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: '#393636' }}>
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Get a Nostr Account
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3">
                      You have several options to create your Nostr identity:
                    </p>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#393636' }} />
                        <div>
                          <strong>Browser Extension:</strong> Install{' '}
                          <a 
                            href="https://getalby.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: '#393636' }}
                          >
                            Alby
                          </a>,{' '}
                          <a 
                            href="https://www.getflamingo.org" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: '#393636' }}
                          >
                            Flamingo
                          </a>, or{' '}
                          <a 
                            href="https://github.com/fiatjaf/nos2x" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: '#393636' }}
                          >
                            nos2x
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#393636' }} />
                        <div>
                          <strong>Mobile App:</strong> Download{' '}
                          <a 
                            href="https://damus.io" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: '#393636' }}
                          >
                            Damus
                          </a>{' '}
                          (iOS) or{' '}
                          <a 
                            href="https://github.com/vitorpamplona/amethyst" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                            style={{ color: '#393636' }}
                          >
                            Amethyst
                          </a>{' '}
                          (Android)
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: '#393636' }} />
                        <div>
                          <strong>Quick Start:</strong> Create an account directly on Traveltelly using the login button
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: '#393636' }}>
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Log In to Traveltelly
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3">
                      Click the login button and connect with your Nostr identity. Your reviews and 
                      content will be linked to your Nostr account.
                    </p>
                    {!user && (
                      <div className="flex justify-start">
                        <LoginArea className="max-w-60" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: '#393636' }}>
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Start Sharing
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Create reviews, share travel stories, and upload photos. Your content is published 
                      to the Nostr network and can be viewed by anyone, anywhere.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="mb-8 md:mb-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                What Makes Nostr Special?
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                <div className="flex gap-3">
                  <Lock className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Censorship Resistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No single entity can silence you. Your content lives on multiple relays.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Privacy Focused</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No tracking, no data harvesting. You control what you share.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Wallet className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Monetization Built-In</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive Bitcoin tips directly through Lightning Network integration.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MessageSquare className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Portable Identity</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Take your followers and content to any Nostr app. No lock-in.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learn More */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-center">
                Learn More About Nostr
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-4">
                <a 
                  href="https://nostr.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full rounded-full justify-between group">
                    <span>Official Nostr Website</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a 
                  href="https://nostr.how" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full rounded-full justify-between group">
                    <span>Nostr How-To Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a 
                  href="https://github.com/nostr-protocol/nostr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full rounded-full justify-between group">
                    <span>Nostr Protocol on GitHub</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6">
                  Join Traveltelly and start sharing your travel experiences on the Nostr network
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {!user ? (
                    <>
                      <LoginArea className="max-w-60 mx-auto" />
                      <Link to="/">
                        <Button variant="outline" className="rounded-full">
                          Back to Home
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/create-review">
                        <Button className="rounded-full text-white" style={{ backgroundColor: '#393636' }}>
                          Create Your First Review
                        </Button>
                      </Link>
                      <Link to="/">
                        <Button variant="outline" className="rounded-full">
                          Back to Home
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-600 dark:text-gray-400 mt-12">
            <p className="text-sm">
              Vibed with{' '}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
                style={{ color: '#393636' }}
              >
                MKStack
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
