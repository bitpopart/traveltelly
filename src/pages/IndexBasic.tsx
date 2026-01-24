import React from 'react';

const IndexBasic = () => {
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#f4f4f5' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌍 Traveltelly - Basic Version
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          This is a basic version to test if the page loads correctly.
        </p>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Status Check</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              React is working
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Routing is working
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Tailwind CSS is working
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Available Routes:</h3>
          <ul className="space-y-1">
            <li><a href="/safe" className="text-blue-600 hover:underline">/safe - Safe version with error handling</a></li>
            <li><a href="/minimal" className="text-blue-600 hover:underline">/minimal - Minimal version</a></li>
            <li><a href="/photo-upload-demo" className="text-blue-600 hover:underline">/photo-upload-demo - Photo upload demo</a></li>
            <li><a href="/gps-correction-demo" className="text-blue-600 hover:underline">/gps-correction-demo - GPS correction demo</a></li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debugging Steps:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open browser developer tools (F12)</li>
            <li>Check the Console tab for any error messages</li>
            <li>Check the Network tab for failed requests</li>
            <li>Try the different routes above to isolate the issue</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default IndexBasic;