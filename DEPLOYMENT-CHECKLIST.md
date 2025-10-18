# Deployment Checklist

Use this checklist before deploying to Netlify to ensure everything works correctly.

## Pre-Deployment Checklist

### 1. Files to Commit

Make sure these files are present and committed:

- [ ] `netlify.toml` - Netlify configuration (fixes MIME types)
- [ ] `_headers` - Additional header configuration
- [ ] `.gitignore` - Prevents committing sensitive files
- [ ] `config.js` - With empty API key for security

### 2. Verify File Structure

```bash
# Check that all necessary files exist
ls -la netlify.toml _headers config.js
ls -la src/core/
ls -la src/tools/
ls -la tutorials/projectile-motion/
ls -la tutorials/2d-graphs/
```

### 3. Test Locally

Before deploying, test everything works locally:

- [ ] Start local server: `python3 -m http.server 8080`
- [ ] Test homepage: http://localhost:8080
- [ ] Test Projectile Motion tutorial
- [ ] Test 2D Graphs tutorial
- [ ] Test all visualizations work
- [ ] Test on mobile responsive view
- [ ] Check browser console for errors

### 4. Security Check

- [ ] Remove actual API key from `config.js` (should be empty string)
- [ ] Verify `.env` or any secret files are in `.gitignore`
- [ ] Check no sensitive data is committed

### 5. Git Preparation

```bash
# Check git status
git status

# Add all necessary files
git add netlify.toml _headers config.js

# Commit with descriptive message
git commit -m "Add Netlify configuration for deployment"

# Push to GitHub
git push origin master
```

## Deployment Steps

### 1. Initial Deploy

Follow steps in `DEPLOYMENT.md`:
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect Netlify to GitHub
- [ ] Configure build settings
- [ ] Deploy site

### 2. Post-Deployment Verification

After deployment, check:

- [ ] Site loads at Netlify URL
- [ ] No console errors (press F12)
- [ ] Homepage displays correctly
- [ ] Navigation works
- [ ] Projectile Motion tutorial loads
- [ ] 2D Graphs tutorial loads
- [ ] Visualizations render correctly
- [ ] Plot Point button works
- [ ] Example visualizations work
- [ ] Animation controls work
- [ ] Mobile view is responsive

### 3. Test on Different Browsers

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browser

### 4. API Key Setup Test

Test the API key configuration:

```javascript
// In browser console
localStorage.setItem('GEMINI_API_KEY', 'test-key')
location.reload()
```

- [ ] Chat section acknowledges API key
- [ ] Descriptive questions can be submitted
- [ ] Error handling works if key is invalid

## Common Issues and Quick Fixes

### Visualizations Not Showing

**Quick Check:**
1. Open browser console (F12)
2. Look for MIME type errors
3. If found: Clear Netlify cache and redeploy

**Fix:**
```bash
# In Netlify Dashboard
Site Settings → Build & deploy → Clear cache and deploy site
```

### 404 Errors

**Quick Check:**
- Verify `netlify.toml` has redirect rules
- Check file paths are correct (case-sensitive!)

### Broken Imports

**Quick Check:**
```bash
# Verify all imports have .js extension
grep -r "import.*from" tutorials/ src/ | grep -v ".js['\"]"
```

## Performance Check

After deployment, test performance:

- [ ] PageSpeed Insights: https://pagespeed.web.dev/
- [ ] Lighthouse audit in Chrome DevTools
- [ ] Mobile performance check

Target scores:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

## Final Checks

- [ ] All links work
- [ ] All images load
- [ ] No broken resources in console
- [ ] HTTPS is enabled
- [ ] Site is accessible
- [ ] Share the URL with a friend to test

## Continuous Deployment

After initial deployment, any `git push` will automatically deploy:

```bash
# Make changes
git add .
git commit -m "Description of changes"
git push

# Netlify automatically builds and deploys (watch the dashboard)
```

---

## Rollback Plan

If deployment breaks something:

### Option 1: Revert in Netlify
1. Go to **Deploys** tab in Netlify dashboard
2. Find a working deployment
3. Click **"Publish deploy"**

### Option 2: Git Revert
```bash
# Revert last commit
git revert HEAD
git push

# Or reset to previous commit (use carefully!)
git reset --hard HEAD~1
git push --force
```

---

## Success Criteria

Your deployment is successful when:

✅ Site loads without errors
✅ All visualizations work
✅ Mobile responsiveness verified
✅ Performance scores are good
✅ No console errors
✅ API key setup works for users

---

**You're ready to deploy! 🚀**

If you encounter any issues not covered here, check `DEPLOYMENT.md` for detailed troubleshooting.
