# Firebase "auth/unauthorized-domain" Error - Fix Guide

## Problem
When attempting to sign in using Google OAuth, you're receiving the error:
```
Firebase: Error (auth/unauthorized-domain)
```

## Root Cause
Firebase only allows authentication from domains that are explicitly whitelisted in your Firebase Console. Your application is trying to authenticate from a domain that hasn't been authorized yet.

## Solution

### Step 1: Add Authorized Domains to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lifesync-4d5da**
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain** and add the following domains:

**For Development:**
- `localhost` (for local development on port 3000)
- `127.0.0.1` (alternative localhost IP)
- `0.0.0.0` (for network access during development)

**For Production:**
- Your production domain (e.g., `yourdomain.com`)
- `www.yourdomain.com` (if different)

**Additional Domains:**
- Any other domains/subdomains you plan to use

### Step 2: Code Updates

The following change has been made to `src/lib/firebase.ts`:

```typescript
// Configure Google provider to work with any domain
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
```

This ensures the Google provider prompts users to select an account, which can help with domain detection.

### Step 3: Test the Fix

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signin`

3. Click the "Google" button to test Google OAuth

4. You should now be able to sign in without the "unauthorized-domain" error

## Detailed Steps in Firebase Console

### If you don't have access to Firebase Console:

**Contact your Firebase project owner and ask them to:**

1. Open Firebase Console → Project Settings → Authorized domains
2. Add these domains:
   - `localhost`
   - `127.0.0.1`
   - `0.0.0.0` (optional)
3. Add your production domains once deployed

### Screenshots of the Process:

**Location in Firebase Console:**
```
Firebase Console 
  → Your Project (lifesync-4d5da)
    → Build
      → Authentication
        → Settings
          → Authorized domains
```

## Common Domains to Add

| Environment | Domain | Port |
|------------|--------|------|
| Local Development | `localhost` | 3000 |
| Local Development (IP) | `127.0.0.1` | 3000 |
| Network Development | `0.0.0.0` | 3000 |
| Production | `yourdomain.com` | 443 |
| Production WWW | `www.yourdomain.com` | 443 |

## Important Notes

⚠️ **Security Consideration:** 
- `0.0.0.0` is NOT recommended for production
- Only add specific production domains in production environments
- Each domain added increases your OAuth application's attack surface

## Alternative Solution (If you can't access Firebase Console)

If you don't have Firebase Console access, ask the Firebase project owner to add your development domain.

Alternatively, you can use **Firebase Emulator Suite** for local development without domain restrictions:

```bash
firebase emulators:start
```

## Troubleshooting

### Still Getting the Error?

1. **Clear browser cache and cookies:**
   - Press `Ctrl+Shift+Delete` (Cmd+Shift+Delete on Mac)
   - Clear all cookies and cache for localhost

2. **Verify Domain was Added:**
   - Go back to Firebase Console → Authentication → Settings
   - Confirm the domain appears in the Authorized domains list
   - Wait a few minutes for changes to propagate

3. **Check Server Hostname:**
   - Ensure you're accessing the app via the authorized domain
   - Don't mix domains (use `localhost`, not `127.0.0.1` if only `localhost` is added)

4. **Browser Console Errors:**
   - Open Developer Tools (F12) → Console
   - Look for the full error message and domain being used
   - Report the actual domain being used to Firebase Console

### Successful Sign-In Flow

After fixing the domain issue, the sign-in flow should work as follows:

1. User clicks "Google" button on `/signin` page
2. Google OAuth popup appears
3. User selects/authenticates with their Google account
4. Firebase receives the token and authorizes the user
5. User is redirected to `/` (home page)
6. `AuthButton` component shows the user's email

## Project Architecture

### Authentication Flow

```
signin/page.tsx
    ↓
handleGoogleSignIn()
    ↓
signInWithPopup(auth, googleProvider)
    ↓
Firebase Google Auth
    ↓
Authorized Domain Check ← (WHERE ERROR OCCURS)
    ↓
Router redirects to "/"
    ↓
AuthButton.tsx displays user info
```

### Key Components

- **firebase.ts** - Initializes Firebase auth with Google provider
- **signin/page.tsx** - Handles Google OAuth login
- **auth-button.tsx** - Displays authentication status
- **with-auth.tsx** - Protects routes that require authentication

## Additional Resources

- [Firebase Authentication - Web Setup](https://firebase.google.com/docs/auth/web/start)
- [Firebase Authorized Domains](https://firebase.google.com/docs/auth/web/manage-users#set_an_authorization_policy)
- [Google OAuth Setup](https://firebase.google.com/docs/auth/web/google-signin)

## Questions?

If you still encounter issues after following these steps, check:
1. Your Firebase project ID is correct
2. You have Editor access to the Firebase project
3. You're using the exact domain in your browser address bar
