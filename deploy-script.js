const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting deployment process...');

// Build the project
console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Check if dist folder exists
if (!fs.existsSync('dist')) {
  console.error('dist folder does not exist after build');
  process.exit(1);
}

// Create .nojekyll file to prevent GitHub Pages from treating it as a Jekyll site
fs.writeFileSync(path.join('dist', '.nojekyll'), '');

console.log('Deployment files ready in dist folder');
console.log('Please deploy the contents of the dist folder to your gh-pages branch');
console.log('You can do this by running:');
console.log('git add dist && git commit -m "Deploy to GitHub Pages" && git subtree push --prefix dist origin gh-pages');