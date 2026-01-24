import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const IndexSimple = () => {
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🌍 Traveltelly
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Link to="/what-is-nostr">
                <Button 
                  className="rounded-full font-semibold text-white hover:opacity-90 transition-opacity text-xs md:text-sm px-4 md:px-6 py-2 md:py-3 h-auto"
                  style={{ backgroundColor: '#b700d7' }}
                >
                  NOSTR POWERED TRAVEL COMMUNITY
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <p>Simple test page - if you see this, the basic routing works!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexSimple;