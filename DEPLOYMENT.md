# Deploying to Netlify

This guide will walk you through deploying your Physics Visualization Platform to Netlify.

## Prerequisites

- A [GitHub](https://github.com) account
- A [Netlify](https://www.netlify.com) account (free tier works fine)
- Git installed on your computer

---

## Step 1: Prepare Your Project

### 1.1 Create a `.gitignore` file (if not already present)

Create a file named `.gitignore` in your project root with the following content:

```
# Dependencies
node_modules/

# Environment variables
.env
.env.local

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Temporary files
*.tmp
*.temp
```

### 1.2 Secure Your API Key

**IMPORTANT**: Never commit your Gemini API key to a public repository!

1. Open `config.js`
2. Replace your actual API key with an empty string:
   ```javascript
   export const config = {
     GEMINI_API_KEY: '' // Leave this empty for production
   };
   ```

3. Your users will need to add their own API keys. The tutorials will show a message prompting them to configure their key.

---

## Step 2: Initialize Git Repository

If you haven't already initialized a git repository:

```bash
cd /Users/mahbubkousar/Projects/visualization
git init
git add .
git commit -m "Initial commit: Physics Visualization Platform"
```

---

## Step 3: Create a GitHub Repository

### 3.1 Create Repository on GitHub

1. Go to [GitHub](https://github.com)
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Enter repository details:
   - **Repository name**: `physics-visualization-platform` (or your preferred name)
   - **Description**: "Interactive physics tutorials with visualizations"
   - **Visibility**: Choose **Public** or **Private**
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### 3.2 Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Run these in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/physics-visualization-platform.git
git branch -M master
git push -u origin master
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 4: Deploy to Netlify

### Method A: Using Netlify Dashboard (Recommended)

#### 4.1 Connect GitHub to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Log in or sign up (you can use your GitHub account)
3. Click **"Add new site"** → **"Import an existing project"**

#### 4.2 Configure Deployment

1. Click **"Deploy with GitHub"**
2. Authorize Netlify to access your GitHub account (if prompted)
3. Select your repository: `physics-visualization-platform`
4. Configure build settings:
   - **Branch to deploy**: `master`
   - **Build command**: Leave empty (static site, no build needed)
   - **Publish directory**: `.` (dot - means root directory)

5. Click **"Deploy site"**

#### 4.3 Wait for Deployment

- Netlify will deploy your site (usually takes 30-60 seconds)
- You'll see a randomly generated URL like: `https://random-name-12345.netlify.app`

---

### Method B: Using Netlify CLI (Alternative)

If you prefer using the command line:

#### 4.1 Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 4.2 Login to Netlify

```bash
netlify login
```

This will open a browser window for authentication.

#### 4.3 Initialize and Deploy

```bash
cd /Users/mahbubkousar/Projects/visualization
netlify init
```

Follow the prompts:
- **Create & configure a new site**
- Choose your team
- Enter a site name (or leave blank for random name)
- **Build command**: Leave empty
- **Publish directory**: `.` (dot)

Then deploy:

```bash
netlify deploy --prod
```

---

## Step 5: Configure Your Site

### 5.1 Custom Domain (Optional)

1. In Netlify dashboard, go to **"Site settings"** → **"Domain management"**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow the instructions to configure DNS

### 5.2 Change Site Name

1. Go to **"Site settings"** → **"General"** → **"Site details"**
2. Click **"Change site name"**
3. Enter a memorable name like: `physics-viz` or `learn-physics`
4. Your URL will become: `https://physics-viz.netlify.app`

### 5.3 Enable HTTPS

Netlify automatically provides free HTTPS certificates. Ensure it's enabled:

1. Go to **"Site settings"** → **"Domain management"** → **"HTTPS"**
2. HTTPS should be enabled by default
3. Enable **"Force HTTPS"** to redirect all HTTP traffic to HTTPS

---

## Step 6: Configure Headers (Optional but Recommended)

Create a `netlify.toml` file in your project root for better caching:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/src/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/tutorials/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

Commit and push this file:

```bash
git add netlify.toml
git commit -m "Add Netlify configuration"
git push
```

Netlify will automatically redeploy with the new configuration.

---

## Step 7: Update API Key Instructions

### 7.1 Create API Key Setup Guide

Add instructions for users to set up their own Gemini API key. You can add this to your homepage or create a dedicated page.

Example text to add to your site:

```markdown
### Setting Up Your API Key

To use the AI-powered features (chat and descriptive question evaluation):

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Open your browser's console (F12)
3. Run: `localStorage.setItem('GEMINI_API_KEY', 'YOUR_API_KEY_HERE')`
4. Reload the page

Your API key is stored locally and never sent to our servers.
```

---

## Step 8: Test Your Deployed Site

### 8.1 Check All Pages

Visit your Netlify URL and test:

- ✅ Homepage loads correctly
- ✅ Navigation works
- ✅ Projectile Motion tutorial loads and visualizations work
- ✅ 2D Graphs tutorial loads and visualizations work
- ✅ All examples and interactive features work
- ✅ Mobile responsiveness

### 8.2 Test API Key Setup

1. Open browser console
2. Set API key: `localStorage.setItem('GEMINI_API_KEY', 'your-test-key')`
3. Reload page
4. Try using chat or descriptive questions
5. Verify API key is being used

---

## Step 9: Continuous Deployment

Now that your site is connected to GitHub, any changes you push will automatically trigger a new deployment:

```bash
# Make changes to your files
git add .
git commit -m "Description of changes"
git push
```

Netlify will automatically:
1. Detect the push to GitHub
2. Start a new build
3. Deploy the changes
4. Update your live site (usually within 1 minute)

---

## Troubleshooting

### Issue: Visualizations Not Showing (MIME Type Error)

**Symptoms**: Console shows errors like:
- `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/plain"`
- Visualizations work on localhost but not on Netlify

**Solution**: This is fixed by the `netlify.toml` and `_headers` files already included. Make sure they are committed:

```bash
git add netlify.toml _headers
git commit -m "Fix MIME type for ES6 modules"
git push
```

After pushing, Netlify will automatically redeploy with the correct headers.

**If still not working**:
1. Clear Netlify cache: Go to **Site settings** → **Build & deploy** → **Clear cache and deploy site**
2. Hard refresh your browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. Check browser console for specific error messages

### Issue: 404 Page Not Found

**Solution**: This should be handled by the netlify.toml redirects. If you still see 404s:

1. Verify `netlify.toml` has the redirect rule:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
```

2. Commit and push if missing

### Issue: Module Import Errors

**Possible causes**:
1. **Case sensitivity**: Netlify servers are case-sensitive. Ensure import paths match exact file names
2. **Missing .js extension**: All imports must include `.js` extension
3. **Wrong relative paths**: Double-check `../../` paths

**How to check**:
```bash
# Verify all import statements have .js extensions
grep -r "import.*from.*['\"].*[^.js]['\"]" tutorials/
```

If any imports are missing `.js`, add them.

### Issue: API Key Not Working

**Solution**:
1. Ensure users have set their API key in localStorage
2. Check browser console for API errors
3. Verify CORS is not blocking requests (should work with Gemini API)

### Issue: Build Failed

**Solution**:
1. Check Netlify build logs for specific errors
2. Ensure all files are committed to GitHub
3. Verify there are no syntax errors in your code

---

## Performance Optimization (Optional)

### Enable Asset Optimization

In Netlify dashboard:
1. Go to **"Site settings"** → **"Build & deploy"** → **"Post processing"**
2. Enable:
   - **Bundle CSS**
   - **Minify CSS**
   - **Minify JS**
   - **Compress images**
   - **Pretty URLs** (removes .html from URLs)

---

## Monitoring and Analytics

### Netlify Analytics (Paid)

- Go to **"Site settings"** → **"Analytics"**
- Enable Netlify Analytics for $9/month (optional)
- Provides server-side analytics (no cookies, privacy-friendly)

### Google Analytics (Free Alternative)

Add Google Analytics to your site by including the tracking code in your HTML files.

---

## Your Site is Now Live! 🎉

Your Physics Visualization Platform is now deployed and accessible at:
- `https://your-site-name.netlify.app`

Share this URL with students, teachers, and anyone interested in learning physics interactively!

---

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community Forum](https://answers.netlify.com)
- [GitHub Documentation](https://docs.github.com)

---

## Support

If you encounter any issues during deployment, feel free to:
- Check Netlify's status page: https://www.netlifystatus.com
- Visit Netlify support: https://www.netlify.com/support
- Check deployment logs in Netlify dashboard

---

**Last Updated**: 2025-01-18
