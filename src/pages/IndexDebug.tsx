import React from 'react';

const IndexDebug = () => {
  console.log('IndexDebug component rendering...');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Debug Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>System Check:</h2>
        <ul>
          <li>✅ React rendering</li>
          <li>✅ Basic routing</li>
          <li>✅ JavaScript execution</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>Check browser console for errors</li>
          <li>Try other routes: <a href="/minimal">/minimal</a></li>
          <li>Check network tab for failed requests</li>
        </ol>
      </div>
    </div>
  );
};

export default IndexDebug;