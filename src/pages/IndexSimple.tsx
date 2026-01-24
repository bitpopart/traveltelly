import React from 'react';
import { Link } from 'react-router-dom';

const IndexSimple = () => {
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🌍 Traveltelly
            </h1>
            <div className="mb-8">
              <Link to="/what-is-nostr" className="inline-block hover:opacity-80 transition-opacity">
                <img 
                  src="/traveltelly-slogan.png" 
                  alt="Nostr Powered Travel Community" 
                  className="h-8 w-auto mx-auto"
                />
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