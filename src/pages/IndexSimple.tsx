import React from 'react';

const IndexSimple = () => {
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#def5ff' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              📍 Reviewstr
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Share your experiences and discover amazing places on Nostr
            </p>
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