# LifeCare.ai - Advanced DNA Testing Platform

<div align="center">
  
  
  **Personalized Health Analysis Through Genetic Testing**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-9.0-orange?logo=firebase)](https://firebase.google.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
  [![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--time-brightgreen?logo=socket.io)](https://socket.io/)
</div>

---

## 🧬 Overview

LifeCare.ai is a comprehensive, enterprise-grade DNA testing and personalized health analysis platform. It combines cutting-edge genetic analysis with AI-powered health insights to provide users with actionable, personalized health recommendations based on their genetic profile and lifestyle data.

### 🌟 Key Features

- **🔬 Comprehensive DNA Analysis** - Advanced genetic testing with detailed health insights
- **🤖 AI-Powered Reports** - Google Gemini AI generates personalized health recommendations
- **📊 Real-time Tracking** - Live order status updates via WebSocket connections
- **👨‍⚕️ Admin Dashboard** - Complete lab management system for healthcare providers
- **📱 Responsive Design** - Mobile-first approach with professional medical UI
- **🔐 Secure Authentication** - Firebase Auth with Google OAuth integration
- **📈 Health Monitoring** - Comprehensive questionnaire covering 30+ health indicators

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Professional component library
- **React 19** - Latest React features

**Backend & Database:**
- **Node.js** - Custom server with Socket.IO
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Prisma ORM** - Database schema management
- **Socket.IO** - Real-time notifications

**AI & Analytics:**
- **Google Gemini AI** - Health report generation
- **React Markdown** - Professional report rendering

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Custom Server  │────│   Firebase DB   │
│   (Frontend)    │    │  (Socket.IO)     │    │  (Firestore)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │  Real-time APIs  │    │   User Reports  │
│  (Lab Mgmt)     │    │ (Notifications)  │    │ (AI Generated)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Firebase Project** with Firestore and Authentication enabled
- **Google Gemini AI API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/lifecare-ai.git
   cd lifecare-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   
   # Database
   DATABASE_URL=file:./db/custom.db
   
   # Custom Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Firebase Setup**
   
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Firestore Database**
   - Enable **Authentication** with Google provider
   - Add your domain to authorized domains
   - Download the configuration and update your `.env.local`

5. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Visit the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
lifecare-ai/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── 📂 admin/             # Admin dashboard
│   │   │   ├── 📂 dashboard/     # Lab management
│   │   │   └── 📂 report/        # Report management
│   │   ├── 📂 api/               # API endpoints
│   │   │   ├── 📂 orders/        # Order management
│   │   │   ├── 📂 reports/       # Report generation
│   │   │   └── 📂 user-reports/  # User report access
│   │   ├── 📂 order/             # Order placement
│   │   ├── 📂 result/            # Report viewing
│   │   └── 📂 my-reports/        # User dashboard
│   ├── 📂 components/            # Reusable components
│   │   ├── 📂 admin/             # Admin-specific components
│   │   └── 📂 ui/                # shadcn/ui components
│   ├── 📂 contexts/              # React contexts
│   ├── 📂 hooks/                 # Custom hooks
│   ├── 📂 lib/                   # Utility libraries
│   └── 📂 types/                 # TypeScript definitions
├── 📂 public/                    # Static assets
├── 📂 prisma/                    # Database schema
├── 📂 db/                        # SQLite database
└── 📋 Documentation files
```

### Key Components

- **`src/app/page.tsx`** - Landing page with health assessment form
- **`src/app/order/page.tsx`** - Comprehensive health questionnaire (30+ questions)
- **`src/app/result/[id]/page.tsx`** - User report viewing with markdown rendering
- **`src/app/admin/`** - Complete admin dashboard for lab management
- **`src/components/report-display.tsx`** - Professional report viewer
- **`src/lib/firebase.ts`** - Firebase configuration and utilities
- **`server.ts`** - Custom Node.js server with Socket.IO integration

---

## 🎯 Core Features

### 1. **Comprehensive Health Assessment**

**30+ Health Questions across 6 categories:**
- Sleep and Energy Assessment
- Cardiovascular and Circulatory Health  
- Metabolic and Endocrine Health
- Digestive and Abdominal Health
- Cancer and Immune System Indicators
- Neurological and Musculoskeletal Health

**Data Collection:**
- Personal details and contact information
- Family medical history
- Current medications and supplements
- Lifestyle factors and exercise habits
- Detailed symptom tracking

### 2. **AI-Powered Report Generation**

**Google Gemini AI Integration:**
- Analyzes user responses and generates personalized reports
- Evidence-based health recommendations
- Risk level assessments (LOW/MODERATE/HIGH/URGENT)
- Actionable next steps with timelines

**Professional Report Format:**
- Executive Summary
- Section-by-section health analysis
- Key Recommendations (immediate and long-term)
- Urgent Medical Concerns
- Personalized Wellness Plan

### 3. **Real-time Order Tracking**

**6-Stage Tracking Process:**
1. **Pending** - Order received and being processed
2. **Out for Lab** - DNA kit shipped to customer
3. **Kit Reached Lab** - Sample received at laboratory
4. **Testing in Progress** - Genetic analysis underway
5. **Processing Result** - AI report generation in progress
6. **Result Ready** - Complete analysis available

**Live Updates:**
- Socket.IO real-time notifications
- Email notifications for status changes
- Mobile-responsive tracking interface

### 4. **Admin Dashboard**

**Order Management:**
- View all customer orders with filtering
- Update order status and tracking stages
- Customer communication tools
- Bulk operations for efficiency

**Report Management:**
- Generate AI reports for completed orders
- Review and edit reports before publishing
- Download reports in multiple formats
- Quality control workflows

**Analytics & Insights:**
- Order volume tracking
- Customer satisfaction metrics
- Report completion rates
- Revenue and business analytics

### 5. **User Experience Features**

**Profile Management:**
- Comprehensive user profiles with avatar support
- Report history and status tracking
- Account settings and preferences
- Secure authentication with Google OAuth

**Responsive Design:**
- Mobile-first responsive layout
- Touch-friendly interfaces
- Progressive Web App features
- Accessibility compliance

---

## 🔐 Security & Privacy

### Data Protection
- **HIPAA-compliant** architecture design
- **End-to-end encryption** for sensitive health data
- **Firebase Security Rules** for database access control
- **Role-based access** for admin and user permissions

### Authentication
- **Firebase Authentication** with multi-provider support
- **JWT tokens** for secure API access
- **Session management** with automatic logout
- **CSRF protection** on all forms

### Data Storage
- **Encrypted at rest** in Firebase Firestore
- **Audit trails** for all data modifications
- **Data retention policies** following healthcare regulations
- **GDPR compliance** for international users

---

## 📊 API Documentation

### Core Endpoints

#### **Orders API**
```
GET    /api/orders              # Get user orders
POST   /api/orders              # Create new order  
GET    /api/orders/[id]         # Get specific order
PATCH  /api/orders/[id]         # Update order status
```

#### **Reports API**
```
POST   /api/reports/generate    # Generate AI report
GET    /api/reports/[orderId]   # Get report by order ID
GET    /api/user-reports        # Get all user reports
```

#### **Health Check**
```
GET    /api/health              # System health status
```

### Authentication Headers
All API requests require authentication headers:
```javascript
{
  'x-user-id': 'firebase_user_uid',
  'x-user-email': 'user@example.com'
}
```

### Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:coverage # Generate coverage report
```

### Test Categories
- **Unit Tests** - Component and utility testing
- **Integration Tests** - API endpoint testing
- **E2E Tests** - Full user workflow testing
- **Performance Tests** - Load and stress testing

### Testing Stack
- **Jest** - Unit testing framework
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing
- **MSW** - API mocking for tests

---

## 🚀 Deployment

### Production Build
```bash
npm run build         # Create production build
npm run start         # Start production server
```

### Environment Setup

**Production Environment Variables:**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
# Add all other environment variables
```

### Deployment Platforms

**Recommended Platforms:**
- **Vercel** - Optimal for Next.js applications
- **Railway** - Full-stack deployment with database
- **AWS** - Enterprise-grade scalability
- **Google Cloud** - Integration with Firebase services

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Firebase production project setup
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Performance monitoring enabled
- [ ] Backup systems operational

---

## 🔧 Configuration

### Firebase Configuration

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

**Firebase Functions (Optional):**
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendReportNotification = functions.firestore
  .document('users/{userId}/reports/{reportId}')
  .onCreate(async (snap, context) => {
    // Send notification logic
  });
```

### Custom Server Configuration

**Socket.IO Server:**
```javascript
// server.ts configuration
const server = createServer(handler);
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  socket.on('join-order', (orderId) => {
    socket.join(`order-${orderId}`);
  });
});
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Standards

**TypeScript Configuration:**
- Strict type checking enabled
- ESLint with custom rules
- Prettier for code formatting
- Husky for pre-commit hooks

**Component Guidelines:**
```typescript
// Component template
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  title: string;
  onClick?: () => void;
}

export default function Component({ title, onClick }: ComponentProps) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Button onClick={onClick} disabled={loading}>
        {loading ? 'Loading...' : 'Click Me'}
      </Button>
    </div>
  );
}
```

### Commit Convention
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code style changes
refactor: code refactoring
test: testing updates
chore: maintenance tasks
```

---

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting** - Dynamic imports for large components
- **Image Optimization** - Next.js Image component with WebP
- **Bundle Analysis** - Regular bundle size monitoring
- **Caching Strategy** - Aggressive caching for static assets

### Backend Optimization
- **Database Indexing** - Firestore composite indexes
- **API Response Caching** - Redis for frequently accessed data
- **Connection Pooling** - Efficient database connections
- **Rate Limiting** - API protection against abuse

### Monitoring Tools
- **Vercel Analytics** - Performance monitoring
- **Firebase Performance** - Real user monitoring
- **Lighthouse CI** - Automated performance testing
- **Sentry** - Error tracking and performance monitoring

---

## 🔍 Troubleshooting

### Common Issues

**1. Firebase Connection Errors**
```bash
Error: Firebase project not found
```
**Solution:** Verify Firebase configuration in `.env.local`

**2. Socket.IO Connection Failed**
```bash
Error: WebSocket connection failed
```
**Solution:** Check server port and CORS configuration

**3. AI Report Generation Timeout**
```bash
Error: Gemini API timeout
```
**Solution:** Verify API key and increase timeout limits

### Debug Mode
```bash
npm run dev:debug     # Start with debug logging
npm run dev:verbose   # Verbose logging mode
```

### Log Analysis
```bash
tail -f logs/app.log          # Application logs
tail -f logs/error.log        # Error logs
tail -f logs/access.log       # Access logs
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Learning Resources
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://typescript-eslint.io/)
- [Firebase Security](https://firebase.google.com/docs/rules)
- [Healthcare Data Compliance](https://www.hhs.gov/hipaa)

### Community
- [GitHub Issues](https://github.com/your-username/lifecare-ai/issues)
- [Discord Server](https://discord.gg/your-server)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/lifecare-ai)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced health analysis capabilities
- **Firebase Team** for robust backend infrastructure
- **shadcn/ui** for beautiful, accessible component library
- **Next.js Team** for an excellent React framework
- **Healthcare Community** for guidance on medical data handling

---

<div align="center">
  <p><strong>Built with ❤️ for personalized healthcare</strong></p>
  
  [Website](https://lifecare-ai.com) • [Documentation](https://docs.lifecare-ai.com) • [Support](mailto:support@lifecare-ai.com)
</div>