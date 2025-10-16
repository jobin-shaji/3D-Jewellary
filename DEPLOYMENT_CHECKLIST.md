# ✅ Quick Deployment Checklist

## Before Deploying

- [ ] Copy `.env.example` to `.env` and fill in production values
- [ ] Change `NODE_ENV=production` in `.env`
- [ ] Set `FRONTEND_URL` to your actual frontend domain
- [ ] Generate strong `JWT_SECRET` (32+ characters)
- [ ] Update to production MongoDB URI
- [ ] Use Razorpay LIVE keys (not test keys)
- [ ] Verify all API keys are production-ready
- [ ] Test locally with production environment variables
- [ ] Run `npm audit fix` to fix security vulnerabilities
- [ ] Commit all changes to Git (except .env!)

## Update External Services

### Google OAuth
- [ ] Add production frontend URL to Authorized JavaScript origins
- [ ] Add production callback URL to Authorized redirect URIs
- [ ] Wait 5-10 minutes for changes to propagate

### MongoDB Atlas
- [ ] Add hosting provider IP to Network Access whitelist
- [ ] Or allow all IPs (0.0.0.0/0) for dynamic hosting
- [ ] Verify database user has proper permissions

### Razorpay
- [ ] Switch to Live mode in dashboard
- [ ] Update webhook URLs to production backend
- [ ] Update payment redirect URLs
- [ ] Test with small amount first

### Cloudinary
- [ ] Verify account limits for production usage
- [ ] Check storage and bandwidth quotas

## Deploy Backend

### Choose Platform (pick one):
- [ ] **Render.com** - Easiest (recommended)
- [ ] **Railway.app** - Fast & simple
- [ ] **Heroku** - Popular choice
- [ ] **DigitalOcean** - Good performance
- [ ] **AWS/GCP** - Full control

### Platform Configuration
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables
- [ ] Set health check path: `/health`
- [ ] Enable auto-deploy from Git

## After Deployment

- [ ] Test health endpoint: `https://your-backend.com/health`
- [ ] Test API endpoint: `https://your-backend.com/api/test`
- [ ] Check CORS by calling from frontend
- [ ] Test authentication (login/register)
- [ ] Test file uploads
- [ ] Test payment flow
- [ ] Monitor logs for errors
- [ ] Set up error monitoring (Sentry)
- [ ] Configure SSL/HTTPS (usually automatic)

## Update Frontend

- [ ] Update API URL in frontend to point to deployed backend
- [ ] Test all features end-to-end
- [ ] Deploy frontend
- [ ] Clear browser cache and test again

## Final Verification

- [ ] Can users register and login?
- [ ] Can users browse products?
- [ ] Can users add to cart?
- [ ] Can users checkout and pay?
- [ ] Do emails work? (if applicable)
- [ ] Do invoices generate?
- [ ] Does admin dashboard work?
- [ ] Are images loading from Cloudinary?
- [ ] Are metal prices updating?

## Monitoring Setup

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation
- [ ] Create backup strategy for database
- [ ] Document API endpoints
- [ ] Set up alerts for downtime

## Security Final Check

- [ ] HTTPS enabled (check padlock in browser)
- [ ] `.env` file NOT in version control
- [ ] Secrets are secure
- [ ] CORS properly configured
- [ ] Rate limiting considered (optional but recommended)
- [ ] Input validation in place
- [ ] SQL injection prevention (using Mongoose helps)
- [ ] XSS protection enabled

---

## 🎉 Deployment Complete!

Once all items are checked, your backend is ready for production use!

**Remember to:**
- Monitor regularly
- Update dependencies monthly
- Check logs for errors
- Backup database regularly
- Keep secrets secure

---

## Quick Reference

### Health Check
```bash
curl https://your-backend-url.com/health
```

### View Logs (depends on platform)
```bash
# Render
render logs

# Railway
railway logs

# Heroku
heroku logs --tail
```

### Restart Server (if needed)
Most platforms have a restart button in the dashboard.

---

**Need help?** Check the PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions!
