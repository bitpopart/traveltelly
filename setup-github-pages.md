# GitHub Pages Setup Instructions

## Manual Setup (Recommended First Step)

Before the GitHub Actions workflow can deploy successfully, you need to enable GitHub Pages manually:

### 1. Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/chadcurtis/traveltelly
2. Click on **Settings** tab
3. In the left sidebar, click on **Pages**
4. Under **Build and deployment**, change the **Source** to **GitHub Actions**
5. Click **Save**

### 2. Alternative: Enable via GitHub CLI

If you have GitHub CLI installed, you can run:

```bash
gh pages enable --source github-actions --repo chadcurtis/traveltelly
```

### 3. Verify Pages is Enabled

After enabling, you should see:
- A green checkmark next to "GitHub Actions" in the Pages settings
- The workflow should now run successfully

### 4. Trigger Deployment

Once Pages is enabled, you can trigger a deployment by:

1. **Pushing a new commit:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **Or manually triggering the workflow:**
   - Go to the **Actions** tab in your repository
   - Click on **Deploy to GitHub Pages** workflow
   - Click **Run workflow** → **Run workflow**

### 5. Access Your Site

After successful deployment, your site will be available at:
```
https://chadcurtis.github.io/traveltelly/
```

## Troubleshooting

### If you still get "Not Found" errors:

1. **Wait a few minutes** after enabling Pages
2. **Check repository permissions** - make sure you have admin access
3. **Verify the repository name** is exactly `chadcurtis/traveltelly`
4. **Check GitHub Pages settings** again to ensure it's set to GitHub Actions

### If the workflow fails:

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Check the error logs for specific issues
4. Common issues include:
   - Pages not enabled yet (wait 5-10 minutes after enabling)
   - Repository name mismatch
   - Permission issues

## What the Workflow Does

The updated workflow:
1. **Builds** your React app with correct base path
2. **Enables Pages** automatically (if possible)
3. **Configures Pages** with error handling
4. **Deploys** the built files to GitHub Pages

The build step creates a `dist` folder with all your assets correctly prefixed with `/traveltelly/` to work with GitHub Pages subdirectory hosting.