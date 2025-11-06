# Project Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend Application                  │
│                        (React + TypeScript)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │   Sign In Page   │  │  Sign Up Page    │  │   Order Pages    │
│  │  (signin/)       │  │  (signup/)       │  │  (order/)        │
│  │                  │  │                  │  │                  │
│  │ - Email/Pass     │  │ - Email/Pass     │  │ - Protected      │
│  │ - Google OAuth   │  │ - Google OAuth   │  │ - with Auth HOC  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                     │                     │
│           └─────────────────┬───┴─────────────────┬───┘
│                             │                     │
│                     ┌───────▼────────────┐        │
│                     │  Auth Button       │        │
│                     │  - User Status     │        │
│                     │  - Sign Out        │        │
│                     └───────┬────────────┘        │
│                             │                     │
│                     ┌───────▼────────────────────▼─┐
│                     │  Firebase Client SDK         │
│                     │  - Authentication            │
│                     │  - Google Provider           │
│                     └───────┬────────────┬──────────┘
│                             │            │
└─────────────────────────────┼────────────┼──────────────────────┘
                              │            │
                    ┌─────────▼───┐  ┌────▼──────────┐
                    │  Firebase   │  │  Google OAuth │
                    │  Console    │  │  Provider     │
                    │  - Auth     │  │  (Google)     │
                    │  - DB       │  │               │
                    └─────────────┘  └────────────────┘
```

## Component Interaction Flow

### Authentication Flow Diagram

```
User
  │
  ├─→ Visit /signin
  │     │
  │     └─→ SignInPage Component Renders
  │           ├─ Email Input Field
  │           ├─ Password Input Field
  │           └─ Google Button
  │
  ├─→ Click "Google" Button
  │     │
  │     └─→ handleGoogleSignIn() Triggered
  │           │
  │           └─→ signInWithPopup(auth, googleProvider)
  │                 │
  │                 └─→ Firebase SDK
  │                     │
  │                     └─→ [DOMAIN CHECK] ← Firebase Validates Domain
  │                         ├─ SUCCESS: Domain Authorized
  │                         │   │
  │                         │   └─→ Google OAuth Popup Opens
  │                         │       │
  │                         │       └─→ User Authenticates with Google
  │                         │           │
  │                         │           └─→ Firebase Receives Token
  │                         │               │
  │                         │               └─→ Router.push("/")
  │                         │
  │                         └─ ERROR: auth/unauthorized-domain
  │                             └─→ Error Message Displayed ❌
  │
  ├─→ Home Page (If Authenticated)
  │     │
  │     └─→ AuthButton Component Loads
  │           │
  │           ├─→ onAuthStateChanged(auth) Hook
  │           │   │
  │           │   └─→ Checks Firebase Auth State
  │           │
  │           └─→ Renders User Email & Sign Out Button
  │
  └─→ Protected Routes (Order Pages)
        │
        └─→ withAuth HOC Component
            ├─→ useAuthState(auth) Hook
            ├─→ If No User: Redirect to /signin
            └─→ If User Exists: Render Page
```

## File Structure & Responsibilities

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # Root layout with metadata & Toaster
│   ├── page.tsx                     # Home page
│   ├── globals.css                  # Global styles (Tailwind)
│   │
│   ├── signin/
│   │   └── page.tsx                 # Sign in page with email & Google OAuth
│   │
│   ├── signup/
│   │   └── page.tsx                 # Sign up page with email & Google OAuth
│   │
│   ├── order/
│   │   ├── page.tsx                 # Order page (protected)
│   │   └── confirmation/
│   │       └── page.tsx             # Order confirmation (protected)
│   │
│   └── api/
│       └── health/
│           └── route.ts             # Health check endpoint
│
├── components/                      # React Components
│   ├── auth-button.tsx              # Auth status display component
│   ├── client-only.tsx              # Client-side rendering wrapper
│   ├── with-auth.tsx                # Route protection HOC
│   │
│   └── ui/                          # UI Components (shadcn/ui)
│       ├── button.tsx               # Reusable button
│       ├── card.tsx                 # Reusable card
│       ├── input.tsx                # Reusable input
│       ├── label.tsx                # Reusable label
│       ├── form.tsx                 # Form component
│       ├── toaster.tsx              # Toast notification system
│       └── [26 more UI components]  # Other shadcn/ui components
│
└── lib/                             # Utility Functions & Services
    ├── firebase.ts                  # Firebase initialization & config
    ├── socket.ts                    # Socket.IO setup
    ├── db.ts                        # Prisma database client
    └── utils.ts                     # General utilities

root files:
├── server.ts                        # Custom Node.js server with Socket.IO
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── postcss.config.mjs               # PostCSS configuration
├── package.json                     # Dependencies & scripts
├── .env                             # Environment variables
└── prisma/
    └── schema.prisma                # Database schema
```

## Key Dependencies

### Authentication & Firebase
- `firebase` - Firebase SDK
- `react-firebase-hooks` - React hooks for Firebase

### UI Framework
- `react` - React library
- `react-dom` - React DOM rendering
- `next` - Next.js framework

### UI Components & Styling
- `@radix-ui/*` - Accessible component primitives
- `tailwindcss` - Utility-first CSS framework
- `class-variance-authority` - Component styling system
- `lucide-react` - Icon library

### Form Handling
- `react-hook-form` - React form management
- `@hookform/resolvers` - Validation resolvers

### Real-time Communication
- `socket.io` - WebSocket library
- `socket.io-client` - Socket.IO client

### Database
- `@prisma/client` - Prisma ORM client

### Development Tools
- `typescript` - TypeScript language
- `nodemon` - Development file watcher
- `tsx` - TypeScript executor

## Data Flow

### Sign In with Google

```
1. User clicks "Google" button
   └─→ SignInPage.handleGoogleSignIn()

2. Firebase SDK initiates Google OAuth popup
   └─→ signInWithPopup(auth, googleProvider)

3. Firebase checks authorized domains
   └─→ Domain must be in Firebase Console's authorized list

4. If authorized, Google popup opens
   └─→ User selects/authenticates with Google account
   └─→ Google returns auth token

5. Firebase verifies token & creates session
   └─→ Auth state updated

6. Application redirects to home
   └─→ router.push("/")

7. AuthButton listens to auth state change
   └─→ onAuthStateChanged() detects user
   └─→ Displays user email & sign-out option
```

### Protected Route Access

```
1. User visits /order (protected route)
   └─→ withAuth HOC wraps component

2. withAuth checks authentication state
   └─→ useAuthState(auth) retrieves current user

3. If no user
   └─→ Redirect to /signin (router.push('/signin'))

4. If user exists
   └─→ Render the protected component

5. AuthButton available on all pages
   └─→ Shows "Sign Out" button when authenticated
```

## Error Handling

### Firebase "unauthorized-domain" Error

**When:** User clicks "Google" on Sign In page
**Error:** `Firebase: Error (auth/unauthorized-domain)`
**Cause:** Current domain not in Firebase Console's authorized domains
**Solution:** Add domain to Firebase Console → Authentication → Authorized domains

### Why This Error Occurs

Firebase implements OAuth 2.0 security best practices. The "unauthorized-domain" error ensures that:
- Only your authorized domains can request Google OAuth tokens
- Prevents domain hijacking and phishing attacks
- Protects your Firebase project from unauthorized access

## Environment Variables

The application uses these environment variables from `firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAuBu4XiyFzlvdWsFTfaB-Jbt-AIHqP0Os",
  authDomain: "lifesync-4d5da.firebaseapp.com",
  projectId: "lifesync-4d5da",
  storageBucket: "lifesync-4d5da.firebasestorage.app",
  messagingSenderId: "855268479053",
  appId: "1:855268479053:web:03bb38d3cf69ca387d0c04",
  measurementId: "G-ZK07PCTZ2Z"
};
```

These are public values (safe to expose in frontend code) - they don't contain sensitive secrets.

## Development Server Details

- **Type:** Custom Node.js server with Socket.IO integration
- **Port:** 3000
- **Hostname:** 0.0.0.0 (accessible from any network interface)
- **Socket.IO Path:** /api/socketio
- **CORS:** Enabled for all origins (development only)

## Security Considerations

### Current Security Features
✅ Firebase Authentication (industry-standard OAuth)
✅ Protected routes with auth HOC
✅ Auth state validation
✅ Environment-based configuration

### Production Recommendations
⚠️ Add specific production domain to Firebase authorized domains
⚠️ Disable CORS for all origins in production
⚠️ Use environment-specific API keys
⚠️ Enable HTTPS only
⚠️ Set up Firebase security rules
⚠️ Implement rate limiting on auth endpoints

## Deployment

The application is configured for deployment to:
- **Vercel** (Next.js recommended platform)
- **Docker** (custom server in server.ts)
- **Node.js hosting** (supports node:18+)

Key files for deployment:
- `next.config.ts` - Build configuration
- `package.json` - Dependencies & scripts
- `.env` - Environment variables
- `prisma/schema.prisma` - Database schema
