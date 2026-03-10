# 🚀 Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Code pushed to GitHub
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Firebase, OpenWeather, and Gemini API keys

## Quick Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `kisan-connect` repository
4. Vercel will auto-detect it as a Vite project

### 2. Configure Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:



### 3. Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. Get your live URL: `https://your-app-name.vercel.app`

## Build Configuration

The app is configured with:

- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x (recommended)

## Domain Setup (Optional)

### Custom Domain:
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as shown
4. SSL certificate is automatic

## Performance Optimizations

### Included Optimizations:
- **Code Splitting**: Vendor, Firebase, and UI chunks
- **Asset Caching**: 1-year cache for static assets
- **Bundle Analysis**: Optimized imports
- **Tree Shaking**: Unused code removal

### Build Size:
- **Vendor Chunk**: ~150KB (React, React-DOM)
- **Firebase Chunk**: ~100KB (Auth, Firestore)
- **UI Chunk**: ~80KB (Radix UI components)
- **App Code**: ~200KB (your application)

## Monitoring & Analytics

### Built-in Vercel Analytics:
- **Performance**: Core Web Vitals
- **Usage**: Page views, unique visitors
- **Errors**: Runtime error tracking
- **Speed**: Load time metrics

### Enable Analytics:
1. Go to **Analytics** tab in Vercel dashboard
2. Enable Web Analytics
3. View real-time metrics

## Troubleshooting

### Common Issues:

**Build Failures:**
- Check environment variables are set
- Verify all dependencies in package.json
- Check build logs for specific errors

**Runtime Errors:**
- Check browser console for errors
- Verify Firebase configuration
- Test API keys are valid

**Performance Issues:**
- Enable Vercel Analytics
- Check bundle size in build logs
- Optimize images and assets

## Automatic Deployments

### Git Integration:
- **Main Branch**: Auto-deploys to production
- **Feature Branches**: Creates preview deployments
- **Pull Requests**: Automatic preview links

### Deployment Workflow:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys
```

## Environment-Specific Builds

### Production:
- Minified code
- No source maps
- Optimized assets
- Error boundaries

### Preview (Branches):
- Development mode
- Source maps enabled
- Debug information
- Testing features

## Security

### Included Security:
- **HTTPS**: Automatic SSL certificates
- **Headers**: Security headers configured
- **Environment**: Variables encrypted
- **Firebase**: Security rules active

### Best Practices:
- Keep API keys in environment variables
- Use Firebase security rules
- Enable authentication
- Monitor usage and errors

## Cost

### Vercel Pricing:
- **Hobby Plan**: Free (perfect for personal projects)
  - 100GB bandwidth
  - 1000 serverless function invocations
  - Unlimited static deployments

- **Pro Plan**: $20/month (for production apps)
  - 1TB bandwidth
  - Unlimited function invocations
  - Advanced analytics

## Support

### Resources:
- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **Firebase Docs**: https://firebase.google.com/docs

### Community:
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Issues**: Create issues in your repo
- **Stack Overflow**: Tag with `vercel` and `vite`