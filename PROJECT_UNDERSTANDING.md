# LifeSync.ai Project Understanding

## 📋 Project Overview

**LifeSync.ai** is an advanced DNA testing and health genomics platform built with modern web technologies. It provides users with clinical-grade DNA testing, interactive health journeys, and a comprehensive multi-step order management system.

### Project Name
- **Display Name**: LifeSync.ai
- **Code Repository**: LifeSync.ai / Solvio GLM
- **Type**: Full-stack Next.js web application
- **Owner**: CrypticFate

### Core Purpose
Enable users to:
1. Order DNA testing kits
2. Provide comprehensive health and lifestyle data
3. Track their orders in real-time
4. Receive personalized health insights based on genetic data
5. Access interactive health journeys

## 🏗️ Architecture Overview

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (Radix UI based)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Data Fetching**: TanStack Query (React Query)
- **Tables**: TanStack Table
- **Drag & Drop**: DND Kit
- **Charts**: Recharts
- **Theming**: Next Themes

#### Backend
- **Runtime**: Node.js with tsx
- **Server**: Next.js API Routes
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **ORM**: Prisma (optional, currently using Firestore)
- **File Storage**: Firebase Storage

#### Development Tools
- **Package Manager**: npm
- **Build Tool**: Next.js built-in
- **Linter**: ESLint
- **Dev Server**: Nodemon
- **Image Processing**: Sharp
- **Internationalization**: Next Intl (i18n ready)

## 📁 Project Structure

```
/media/cryptic/New Volume1/Project/Solvio/GLM/Final/
├── public/                          # Static files
│   └── robots.txt
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # API routes
│   │   │   ├── health/route.ts     # Health check endpoint
│   │   │   └── orders/route.ts     # Orders CRUD
│   │   ├── order/                  # Order creation page
│   │   │   ├── page.tsx            # Multi-step form
│   │   │   └── confirmation/       # Confirmation page
│   │   ├── order-tracking/         # Order tracking page (NEW)
│   │   │   └── page.tsx            # Tracking dashboard
│   │   ├── signin/                 # Authentication
│   │   ├── signup/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── globals.css             # Global styles
│   ├── components/                 # React components
│   │   ├── ui/                     # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   └── (20+ more components)
│   │   ├── auth-button.tsx         # Auth UI component
│   │   ├── order-status-badge.tsx  # NEW - Status display
│   │   ├── order-status-timeline.tsx # NEW - Progress timeline
│   │   ├── order-details-modal.tsx # NEW - Details view
│   │   ├── with-auth.tsx           # Auth HOC
│   │   └── (other components)
│   ├── hooks/                      # Custom React hooks
│   │   ├── use-auth.ts             # Authentication state
│   │   ├── use-mobile.ts           # Mobile detection
│   │   └── use-toast.ts            # Toast notifications
│   ├── lib/                        # Utility libraries
│   │   ├── firebase.ts             # Firebase config
│   │   ├── firestore.ts            # Firestore operations
│   │   ├── db.ts                   # Database utilities
│   │   ├── socket.ts               # WebSocket (optional)
│   │   └── utils.ts                # General utilities
│   └── types/                      # TypeScript types
│       └── order.ts                # Order interfaces
├── prisma/
│   └── schema.prisma               # Database schema (Prisma)
├── db/                             # Database files
├── examples/                       # Example implementations
├── Configuration Files
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── eslint.config.mjs
│   └── package.json
└── Documentation
    ├── README.md
    ├── INDEX.md
    ├── ORDER_TRACKING_DOCUMENTATION.md    # NEW
    ├── ORDER_TRACKING_IMPLEMENTATION.md   # NEW
    ├── DATABASE_ARCHITECTURE.md
    ├── FIREBASE_CONSOLE_SETUP.md
    ├── (10+ other docs)
    └── ...
```

## 🔑 Key Concepts

### 1. Authentication Flow
- Users sign up/sign in using Firebase Auth
- Email & password authentication
- Google OAuth provider configured
- Auth state managed globally via `useAuth` hook
- Session persisted across page refreshes

### 2. Order Management System

#### Multi-Step Order Creation
The order process is divided into 3 segments:

**Segment 1: Contact & Scheduling**
- Full Name
- Mobile Number
- Complete Address
- Preferred Test Date
- Preferred Test Time

**Segment 2: Test Motivation**
- Multiple motivations (checkboxes)
- Other motivation (text field)

**Segment 3: Personal & Lifestyle Data**
- Age, Gender, Sample Type
- Height, Weight, Blood Group, Ethnicity
- Smoking, Alcohol, Exercise habits
- Medications, Allergies
- Sleep Quality, Dietary Preferences, Stress Level
- Medical consent

#### Order Storage Structure
```
Firestore Database:
└── users/{userId}
    ├── email: string
    ├── displayName: string
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    └── orders/ (subcollection)
        └── {orderId}/
            ├── Full order data
            ├── Metadata (userId, userEmail, userName)
            ├── Status: pending|confirmed|completed|cancelled
            ├── createdAt: timestamp
            └── updatedAt: timestamp
```

### 3. Order Status Flow
```
pending → confirmed → completed → (success)
            ↓
          cancelled → (end)
```

### 4. Real-Time Tracking
NEW Feature: Users can now track their orders in real-time with:
- Visual status indicators
- Order progress timeline
- Detailed order information
- Search and filtering capabilities

## 🔐 Authentication & Security

### Firebase Setup
- Firebase Project: `lifesync-4d5da`
- Auth Domain: `lifesync-4d5da.firebaseapp.com`
- Firestore Database: Active
- Cloud Storage: Enabled
- Google OAuth: Configured

### Security Rules
Firestore security rules (applied):
- Users can only read/write their own documents
- Orders subcollection is protected per user
- Admin operations require special permissions

### Password Requirements
- Email-based authentication
- Firebase handles secure storage
- Session tokens managed by Firebase

## 📊 Database Schema

### User Document
```typescript
interface UserProfile {
  email: string;
  displayName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Order Document (Stored in subcollection)
```typescript
interface Order {
  // Contact Information
  fullName: string;
  mobileNumber: string;
  completeAddress: string;
  
  // Scheduling
  preferredTestDate: string;
  preferredTestTime: string;
  
  // Motivations
  motivations: string[];
  otherMotivation: string;
  
  // Personal Information
  age: string;
  gender: string;
  sampleType: string;
  height: string;
  weight: string;
  bloodGroup: string;
  ethnicity: string;
  
  // Lifestyle
  smoking: string;
  alcohol: string;
  exercise: string;
  medications: string;
  takingMedications: string;
  allergies: string;
  hasAllergies: string;
  sleepQuality: string;
  dietaryPreferences: string;
  stressLevel: string;
  
  // Metadata
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: 'pending'|'confirmed'|'completed'|'cancelled';
  createdAt: string; // ISO
  updatedAt: string; // ISO
  notes?: string;
  consent: boolean;
}
```

## 🌐 API Endpoints

### Orders API

#### POST `/api/orders` - Create Order
Submit a new DNA test order.

**Request:**
```json
{
  "orderData": { /* OrderFormData */ },
  "userInfo": {
    "userId": "string",
    "userEmail": "string",
    "userName": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "string",
  "message": "Order saved successfully",
  "timestamp": "ISO string"
}
```

#### GET `/api/orders` - Get User's Orders
Retrieve all orders for the authenticated user.

**Headers:**
```
x-user-id: string
x-user-email: string
```

**Query Parameters:**
```
?limit=50
?status=pending
```

**Response:**
```json
{
  "success": true,
  "orders": [/* Order[] */],
  "total": number,
  "databasePath": "users/{userId}/orders",
  "timestamp": "ISO string"
}
```

### Health API

#### GET `/api/health` - Health Check
Check if the server is running.

## 🎯 User Workflows

### 1. Sign Up / Login Flow
```
1. User visits site
2. Click Sign In/Sign Up
3. Enter email and password
4. Firebase authenticates
5. User redirected to home or order page
6. Auth state synced across app
```

### 2. Create Order Flow
```
1. User clicks "Order Now"
2. Multi-step form opens
3. Segment 1: Enter contact & scheduling info
4. Segment 2: Select test motivations
5. Segment 3: Enter personal & lifestyle data
6. Review and submit
7. Order saved to user's Firestore subcollection
8. Redirected to confirmation page
9. Order ID provided
```

### 3. Track Order Flow (NEW)
```
1. User clicks "Track Orders"
2. Order tracking page loads
3. All user's orders displayed
4. Can search by Order ID, Name, Email
5. Can filter by status
6. Click "View Details" to see timeline
7. Modal shows:
   - Order status badge
   - Progress timeline
   - Full order information
   - All personal data
```

## 🚀 Running the Project

### Development
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

Server runs on `http://localhost:3000`

### Production
```bash
# Build
npm run build

# Start
npm start
```

### Database Commands
```bash
# Push schema to database
npm run db:push

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset
```

## 📦 Key Dependencies

### Production Dependencies
- `next@15.0.0` - React framework
- `react@19.0.0` - UI library
- `firebase@11.0.0` - Backend services
- `@prisma/client@6.11.1` - ORM
- `zod@3.22.0` - Validation
- `zustand` - State management
- `framer-motion` - Animations
- `recharts` - Charts
- `tailwindcss@4.0.0` - CSS utility
- `@radix-ui/*` - UI components
- `react-hook-form` - Form management
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `next-intl` - Internationalization
- `date-fns` - Date utilities

### Dev Dependencies
- TypeScript
- ESLint
- Next.js plugins
- Tailwind CSS plugins

## 🎨 UI/UX Design

### Design System
- **Color Scheme**: Blue primary, with status-specific colors
- **Typography**: Clean, modern sans-serif fonts
- **Spacing**: Consistent 4px grid
- **Shadows**: Subtle, modern shadows
- **Rounded Corners**: 8px default border radius
- **Transitions**: 300ms default animation duration

### Components Used
- **Cards**: For organizing information
- **Badges**: For status display
- **Buttons**: Multiple variants (primary, outline, ghost)
- **Tabs**: For filtering
- **Dialog/Modal**: For detailed views
- **Forms**: Input fields, textareas, selects
- **Progress**: Visual indicators
- **Timelines**: Order progress display

## 🔄 Data Flow Architecture

```
User Action
    ↓
React Component State Update
    ↓
API Call (if needed)
    ↓
Next.js API Route
    ↓
Firebase Service (Firestore/Auth)
    ↓
Response to Frontend
    ↓
Component Re-render
    ↓
UI Update
```

## 📈 Performance Features

- **Code Splitting**: Automatic Next.js code splitting
- **Image Optimization**: Next.js Image component
- **CSS Optimization**: Tailwind CSS purging
- **Client Components**: Selective use of 'use client'
- **Server Components**: Default Next.js 15 behavior
- **Bundle Size**: Optimized dependencies

## 🧪 Testing Strategy

Currently no automated tests, but can add:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright/Cypress
- Integration tests with API mocking

## 📱 Responsive Design

### Breakpoints Used
- Mobile: < 768px (md)
- Tablet: 768px - 1024px (lg)
- Desktop: > 1024px (xl)

### Layout Strategy
- Mobile-first approach
- Flexbox and CSS Grid
- Responsive typography
- Responsive spacing

## 🔌 WebSocket Integration (Optional)

The project includes socket.ts for WebSocket support (not currently implemented):
- Can be used for real-time order updates
- Live notifications
- Chat support

## 🌍 Internationalization (i18n) Ready

The project uses `next-intl` for internationalization:
- Multi-language support
- URL-based locale routing
- Fallback language support
- Currently not configured with specific languages

## 🐛 Error Handling

### Global Error Handling
- Try-catch blocks in API routes
- Error boundaries (to be implemented)
- Toast notifications for user feedback
- Console logging for debugging

### Types of Errors Handled
- Authentication errors
- Network errors
- Firestore errors
- Form validation errors
- Type errors (TypeScript)

## 📝 Code Standards

- **Language**: TypeScript (strict mode)
- **Style**: ESLint configured
- **Naming**: camelCase for variables/functions, PascalCase for components
- **File Organization**: Co-locate related files
- **Comments**: JSDoc comments for functions
- **Error Handling**: Descriptive error messages

## 🎓 Learning Path

To understand the project:
1. Start with `README.md` for overview
2. Check `src/types/order.ts` for data structures
3. Review `src/lib/firebase.ts` for Firebase setup
4. Look at `src/app/order/page.tsx` for main flow
5. Check new `src/app/order-tracking/page.tsx` for tracking
6. Review API routes in `src/app/api/`
7. Examine Firebase Firestore operations in `src/lib/firestore.ts`

## 🚀 Future Roadmap

Planned enhancements:
1. Admin Dashboard - Manage orders and users
2. Real-time Notifications - WebSocket updates
3. Payment Gateway - Stripe/PayPal integration
4. Results Portal - Display test results
5. Report Generation - PDF reports
6. User Profile - Edit profile data
7. Appointment Booking - Calendar integration
8. Analytics Dashboard - Business insights
9. Mobile App - React Native version
10. API Documentation - Swagger/OpenAPI

## 📞 Support & Maintenance

- **Repository**: GitHub (CrypticFate/LifeSync.ai)
- **Branch**: main
- **Documentation**: Multiple markdown files
- **Issues**: To be managed via GitHub Issues
- **Deployment**: Ready for Vercel/AWS

---

**Project Status**: ✅ Active Development
**Latest Feature**: Order Tracking System (NEW)
**Last Updated**: November 7, 2024
**Version**: 1.0.0

