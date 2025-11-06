# Firebase Google OAuth Setup - Checklist

## Quick Fix Checklist

Use this checklist to quickly resolve the `auth/unauthorized-domain` error:

### ✅ Step 1: Code Update (Already Done)
- [x] Updated `src/lib/firebase.ts` with Google provider configuration
- [x] Added `googleProvider.setCustomParameters({ prompt: 'select_account' })`

### ⏳ Step 2: Firebase Console Configuration (You Need To Do This)

**Navigate to Firebase Console:**
- [ ] Open https://console.firebase.google.com
- [ ] Select project: **lifesync-4d5da**
- [ ] Go to: Build → Authentication
- [ ] Click: Settings tab
- [ ] Scroll to: Authorized domains

**Add Development Domains:**
- [ ] Add: `localhost`
- [ ] Add: `127.0.0.1`
- [ ] Add: `0.0.0.0` (optional, for network development)

**Add Production Domains (Later):**
- [ ] Add: `yourdomain.com`
- [ ] Add: `www.yourdomain.com`
- [ ] Wait 5-10 minutes for changes to propagate

### ✅ Step 3: Test the Fix
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to: `http://localhost:3000/signin`
- [ ] Click: "Google" button
- [ ] Verify: Google OAuth popup appears
- [ ] Complete: Google authentication
- [ ] Confirm: You're redirected to home page

### 🔍 Step 4: Troubleshoot (If Still Not Working)

#### Clear Cache
- [ ] Open DevTools: F12
- [ ] Right-click Refresh button → "Empty cache and hard refresh"
- [ ] OR Clear cookies: Ctrl+Shift+Delete

#### Verify Domain
- [ ] Check Firebase Console → Authentication → Authorized domains
- [ ] Confirm your domain appears in the list
- [ ] Wait 5-10 minutes if just added

#### Check Browser Console
- [ ] Open DevTools: F12 → Console tab
- [ ] Look for error messages
- [ ] Verify the domain in the error matches your authorized list

#### Test with Different Domain
- [ ] If using `127.0.0.1`, try `localhost`
- [ ] Ensure you're accessing via the EXACT domain you authorized

---

## Common Domain Configurations

### For Local Development Only
```
Authorized Domains:
- localhost
- 127.0.0.1
```

### For Team Development (Shared Network)
```
Authorized Domains:
- localhost
- 127.0.0.1
- 0.0.0.0
- your-team-server.local
```

### For Production
```
Authorized Domains:
- localhost (for development)
- 127.0.0.1 (for development)
- yourdomain.com (production)
- www.yourdomain.com (production)
- app.yourdomain.com (if subdomain)
```

---

## Expected Behavior After Fix

### Before Fix (Error):
```
User clicks "Google"
        ↓
Error modal appears:
❌ Firebase: Error (auth/unauthorized-domain)
```

### After Fix (Success):
```
User clicks "Google"
        ↓
Google OAuth popup opens
        ↓
User selects Google account
        ↓
Popup closes
        ↓
User is redirected to home page
        ↓
AuthButton shows user email and "Sign Out" button
✅ Authentication successful!
```

---

## Important Notes

⚠️ **Security Warning:**
- Do NOT add `0.0.0.0` to production environments
- Do NOT add wildcard domains like `*.example.com` unless absolutely necessary
- Only add domains you actually own and control

📱 **Mobile Testing:**
- If testing on mobile: add your machine's IP address (e.g., `192.168.1.100`)
- Firebase only recognizes the domain/IP being used to access the app

🌐 **Deployment Domains:**
- If deploying to Vercel: add `yourapp.vercel.app` to authorized domains
- If deploying to custom domain: add that domain instead

---

## Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/lib/firebase.ts` | Added Google provider configuration | Improves OAuth account selection |
| `FIREBASE_FIX_GUIDE.md` | Created | Detailed troubleshooting guide |
| `PROJECT_ARCHITECTURE.md` | Created | Complete project overview |
| `.env.example` | Created | Environment variable template |

---

## Component Summary

| Component | Location | Purpose | Auth Required |
|-----------|----------|---------|---|
| SignIn Page | `src/app/signin/page.tsx` | Email/Google login | No |
| SignUp Page | `src/app/signup/page.tsx` | Email/Google registration | No |
| AuthButton | `src/components/auth-button.tsx` | Display user status | No |
| Order Page | `src/app/order/page.tsx` | Order management | Yes |
| Order Confirmation | `src/app/order/confirmation/page.tsx` | Order confirmation | Yes |
| withAuth HOC | `src/components/with-auth.tsx` | Route protection | Yes |

---

## Next Steps After Fix

1. ✅ Test Google OAuth authentication
2. ✅ Test email/password authentication
3. ✅ Test sign out functionality
4. ✅ Verify protected routes redirect to signin
5. ✅ Test on different network (if team development)
6. ✅ Set up production domain authorization

---

## Quick Reference

**Error Occurs At:** Firebase auth/google-provider when validating domain
**Error Code:** `auth/unauthorized-domain`
**Solution:** Add domain to Firebase Console authorized domains list
**Time to Fix:** 2-5 minutes for code + 5-10 minutes for Firebase propagation
**Related Files:** 
- Frontend: `src/lib/firebase.ts`, `src/app/signin/page.tsx`
- Backend: `server.ts`
- Config: `firebase.config.json` (in Firebase Console)

---

## Support

If you still have issues:
1. Check `FIREBASE_FIX_GUIDE.md` for detailed steps
2. Review `PROJECT_ARCHITECTURE.md` for component flow
3. Check browser console (F12) for detailed error messages
4. Verify Firebase project ID: `lifesync-4d5da`
5. Ensure you have Editor access to Firebase project
