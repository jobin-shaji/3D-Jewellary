# 🚀 Production Hosting Guide for 3D Marketplace Backend

## ✅ What Was Fixed

### 1. **CORS Configuration** (Critical for Production)
- ❌ **Before**: Hardcoded localhost origins only
- ✅ **After**: Environment-based CORS with production support
  - Automatically uses `FRONTEND_URL` in production
  - Maintains localhost origins for development
  - Properly validates and blocks unauthorized origins
  - Includes warning logs for blocked requests

### 2. **Security Headers** (Production Only)
Added essential security headers for production:
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection` - Enables browser XSS protection
- `Strict-Transport-Security` - Enforces HTTPS
- `trust proxy` enabled for load balancers

### 3. **Error Handling**
- Production: Hides sensitive error details
- Development: Shows full error stack traces
- 404 handler for invalid routes
- Global error handler for uncaught exceptions

### 4. **Health Check Endpoint**
Added `/health` endpoint for:
- Load balancer health checks
- Uptime monitoring
- Database connection status
- Server status verification

### 5. **Graceful Shutdown**
- Properly closes MongoDB connections
- Handles SIGTERM and SIGINT signals
- Safe for container deployments (Docker, Kubernetes)

---

## 📋 Pre-Deployment Checklist

### 1. **Update Environment Variables**

Create production `.env` file with these values:

```bash
# MUST CHANGE THESE:
NODE_ENV=production
FRONTEND_URL=https://your-actual-frontend-domain.com
JWT_SECRET=generate-a-strong-random-32-character-minimum-secret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/production-db

# UPDATE THESE FOR PRODUCTION:
RAZORPAY_KEY_ID=rzp_live_XXXXXXXX  # Use LIVE keys, not test
RAZORPAY_KEY_SECRET=your_live_secret

# VERIFY THESE ARE CORRECT:
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
metalprice_api_key2=your-api-key
```

### 2. **Update Google OAuth**
Go to [Google Cloud Console](https://console.cloud.google.com):
1. Add production URLs to Authorized JavaScript origins:
   - `https://your-frontend-domain.com`
2. Add production URLs to Authorized redirect URIs:
   - `https://your-frontend-domain.com/auth/google/callback`

### 3. **MongoDB Atlas Configuration**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Network Access → Add your hosting provider's IP addresses
3. Or allow all IPs (0.0.0.0/0) for dynamic IPs
4. Database Access → Verify user has read/write permissions

### 4. **Razorpay Production Keys**
1. Switch from test mode to live mode in Razorpay dashboard
2. Update webhooks to use production URL
3. Update payment callback URLs

---

## 🌐 Deployment Platforms

### **Option 1: Render.com** (Recommended - Easy)

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select backend folder

2. **Configure Build & Start**
   ```bash
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables**
   Add all variables from `.env.example` in Render dashboard

4. **Advanced Settings**
   - Health Check Path: `/health`
   - Auto-Deploy: Enable

### **Option 2: Railway.app** (Easy & Fast)

1. **Create New Project**
   - Import from GitHub
   - Select backend directory

2. **Environment Variables**
   Add in Settings → Variables

3. **Deploy**
   - Automatic on push to main branch

### **Option 3: Heroku**

1. **Install Heroku CLI**
   ```bash
   heroku login
   heroku create your-app-name
   ```

2. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend.com
   # ... set all other env variables
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### **Option 4: DigitalOcean App Platform**

1. Create new app from GitHub
2. Select Node.js
3. Add environment variables
4. Set HTTP port to 3000
5. Deploy

### **Option 5: AWS (EC2 + PM2)**

More complex but full control - see AWS deployment guide below.

---

## 🔍 Testing Your Deployment

### 1. **Test Health Endpoint**
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T...",
  "environment": "production",
  "uptime": 123,
  "mongodb": "connected"
}
```

### 2. **Test CORS**
In browser console on your frontend:
```javascript
fetch('https://your-backend-url.com/api/test', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(console.log)
```

Should return without CORS errors.

### 3. **Test API Endpoints**
```bash
# Test endpoint
curl https://your-backend-url.com/api/test

# Products
curl https://your-backend-url.com/api/products

# Categories
curl https://your-backend-url.com/api/categories
```

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error in Production
**Problem**: "Access-Control-Allow-Origin" error

**Solution**:
1. Verify `FRONTEND_URL` in backend .env matches your actual frontend URL
2. Make sure frontend URL has NO trailing slash
3. Check browser network tab for exact origin being sent

### Issue 2: MongoDB Connection Failed
**Problem**: Can't connect to MongoDB

**Solution**:
1. Check MongoDB Atlas IP whitelist includes hosting provider
2. Verify connection string is correct (no typos in password)
3. Check if password contains special characters - URL encode them
4. Test connection locally first

### Issue 3: Environment Variables Not Loading
**Problem**: Server using default/undefined values

**Solution**:
1. Verify `.env` file exists in production
2. Check hosting platform has env variables set
3. Restart server after adding variables
4. Use absolute path for `.env` file if needed

### Issue 4: Google OAuth Not Working
**Problem**: OAuth redirect fails

**Solution**:
1. Update Google Console with production URLs
2. Wait 5-10 minutes for Google to propagate changes
3. Clear browser cookies and retry
4. Check callback URL matches exactly

### Issue 5: Port Already in Use
**Problem**: EADDRINUSE error

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm start
```

---

## 📊 Monitoring & Maintenance

### 1. **Add Logging Service**
Consider adding:
- [Logtail](https://logtail.com)
- [Papertrail](https://papertrailapp.com)
- [Sentry](https://sentry.io) for error tracking

### 2. **Set Up Alerts**
Monitor:
- Server uptime
- API response times
- Error rates
- Database connections

### 3. **Regular Maintenance**
- Update dependencies monthly: `npm update`
- Security patches: `npm audit fix`
- Monitor MongoDB storage usage
- Review error logs weekly

---

## 🔐 Security Best Practices

1. ✅ Use strong JWT_SECRET (32+ characters)
2. ✅ Enable HTTPS only in production
3. ✅ Keep dependencies updated
4. ✅ Use environment variables for all secrets
5. ✅ Enable MongoDB authentication
6. ✅ Use production API keys (Razorpay, etc.)
7. ✅ Implement rate limiting (add express-rate-limit)
8. ✅ Add request validation and sanitization
9. ✅ Regular security audits: `npm audit`
10. ✅ Monitor for suspicious activity

---

## 📞 Support

If you encounter issues:
1. Check server logs first
2. Verify all environment variables
3. Test health endpoint
4. Check hosting platform status page
5. Review this guide again

---

## ✨ Your Server is Now Production-Ready!

The CORS configuration and server setup are now fully prepared for hosting. Just:
1. Set environment variables
2. Deploy to your chosen platform
3. Update frontend API URL to point to your backend
4. Test thoroughly

**Good luck with your deployment! 🚀**
