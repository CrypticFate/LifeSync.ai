# Firebase Order System - Architecture Diagrams

## 1️⃣ Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         Order Form Page (/order)                       │   │
│  │       (src/app/order/page.tsx)                         │   │
│  │                                                         │   │
│  │  Segment 1: Contact & Scheduling                       │   │
│  │  Segment 2: Test Motivation                            │   │
│  │  Segment 3: Personal & Lifestyle                       │   │
│  └───────────────────────┬────────────────────────────────┘   │
│                          │                                     │
│                          │ User Fills Form                    │
│                          ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Form Validation & State Management                 │   │
│  │  - Validate required fields                           │   │
│  │  - Enable/disable navigation buttons                  │   │
│  │  - Track form progress                               │   │
│  └───────────────────────┬────────────────────────────────┘   │
│                          │                                     │
│                          │ User Clicks Submit               │
│                          ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Get Current User (useAuth Hook)                    │   │
│  │  - User ID (uid)                                      │   │
│  │  - User Email                                         │   │
│  │  - Display Name                                       │   │
│  └───────────────────────┬────────────────────────────────┘   │
│                          │                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
                           │ Firebase Auth
                           │ (via Firebase SDK)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEXT.JS BACKEND / SERVER SIDE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │   saveOrderToFirestore() Function                     │   │
│  │   (src/lib/firestore.ts)                              │   │
│  │                                                         │   │
│  │  Actions:                                             │   │
│  │  1. Create order document object                      │   │
│  │  2. Add user metadata (userId, email, timestamp)      │   │
│  │  3. Set status = "pending"                            │   │
│  │  4. Generate ISO timestamp                            │   │
│  │  5. Send to Firestore                                 │   │
│  └───────────────────────┬────────────────────────────────┘   │
│                          │                                     │
│                          │ addDoc() Firebase call             │
│                          ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Firebase Firestore Database                        │   │
│  │    (Cloud Service)                                    │   │
│  │                                                         │   │
│  │    Collection: "orders"                               │   │
│  │    ├─ Document 1: {all order data}                    │   │
│  │    ├─ Document 2: {all order data}                    │   │
│  │    └─ Document 3: {all order data}                    │   │
│  └───────────────────────┬────────────────────────────────┘   │
│                          │                                     │
│                          │ Return success + orderId           │
│                          ▼                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                          │ Response with order ID
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      USER BROWSER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Success Toast Notification                         │   │
│  │    "Order saved successfully!"                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                     │
│                          ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Store Order ID in localStorage                     │   │
│  │    Store Order Data in localStorage (backup)          │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                     │
│                          ▼                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │    Redirect to Confirmation Page                      │   │
│  │    /order/confirmation?orderId={id}                   │   │
│  └────────────────────────────────────────────────────────┘   │
│                          │                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
                           ▼
                    ✅ PROCESS COMPLETE
```

---

## 2️⃣ Service Layer Architecture

```
┌────────────────────────────────────────┐
│   React Components                     │
│  (Order Page, Other Pages)             │
└────────────────┬───────────────────────┘
                 │
                 │ Import & Call
                 ▼
┌────────────────────────────────────────┐
│   useAuth Hook                         │
│   (Get current user from Firebase)     │
└────────────────┬───────────────────────┘
                 │
                 │ Provides user info
                 ▼
┌────────────────────────────────────────┐
│   FIRESTORE SERVICE LAYER              │
│   (src/lib/firestore.ts)               │
│                                        │
│  Core Functions:                       │
│  ✓ saveOrderToFirestore()              │
│  ✓ getOrderById()                      │
│  ✓ getUserOrders()                     │
│  ✓ updateOrderStatus()                 │
│  ✓ deleteOrder()                       │
│  ✓ exportOrderAsJson()                 │
│  ✓ backupUserOrders()                  │
│  ✓ getOrdersByStatus()                 │
│  ✓ getOrdersCounts()                   │
│  ✓ initializeFirebaseApp()             │
└────────────────┬───────────────────────┘
                 │
                 │ Firebase SDK calls
                 ▼
┌────────────────────────────────────────┐
│   Firebase Admin SDK                   │
│  (client-side SDK in browsers)         │
│                                        │
│  - Authentication                      │
│  - Firestore Database                  │
│  - Real-time Listeners                 │
└────────────────┬───────────────────────┘
                 │
                 │ HTTPS / Secure
                 ▼
┌────────────────────────────────────────┐
│   Firebase Cloud Services              │
│  (Google Cloud Platform)               │
│                                        │
│  - Firebase Auth                       │
│  - Firestore Database                  │
│  - Security Rules Enforcement          │
│  - Data Persistence                    │
│  - Backup & Replication                │
└────────────────────────────────────────┘
```

---

## 3️⃣ Database Schema

```
FIRESTORE
└── Database: lifesync-4d5da
    │
    └── Collection: "orders"
        │
        ├── Document: {auto-generated-id}
        │   ├── orderId: "doc-id"
        │   ├── userId: "firebase-user-id"
        │   ├── userEmail: "user@example.com"
        │   ├── userName: "John Doe"
        │   ├── createdAt: Timestamp
        │   ├── updatedAt: Timestamp
        │   ├── status: "pending" | "confirmed" | "completed" | "cancelled"
        │   ├── notes: ""
        │   │
        │   ├── CONTACT INFO:
        │   ├── fullName: "John Doe"
        │   ├── mobileNumber: "+1-555-0123"
        │   ├── completeAddress: "123 Main St"
        │   │
        │   ├── SCHEDULING:
        │   ├── preferredTestDate: "2025-11-15"
        │   ├── preferredTestTime: "9am-11am"
        │   │
        │   ├── TEST MOTIVATION:
        │   ├── motivations: ["Family history", "Personal interest"]
        │   ├── otherMotivation: ""
        │   │
        │   ├── PERSONAL DATA:
        │   ├── age: "35"
        │   ├── gender: "male"
        │   ├── sampleType: "myself"
        │   ├── height: "5'10\""
        │   ├── weight: "180 lbs"
        │   ├── bloodGroup: "o+"
        │   ├── ethnicity: "Caucasian"
        │   │
        │   ├── LIFESTYLE:
        │   ├── smoking: "no"
        │   ├── alcohol: "occasionally"
        │   ├── exercise: "4-5"
        │   ├── sleepQuality: ""
        │   ├── dietaryPreferences: ""
        │   ├── stressLevel: ""
        │   │
        │   ├── MEDICAL HISTORY:
        │   ├── takingMedications: "no"
        │   ├── medications: ""
        │   ├── hasAllergies: "yes"
        │   ├── allergies: "Penicillin"
        │   │
        │   └── CONSENT:
        │       └── consent: true
        │
        ├── Document: {auto-generated-id}
        │   └── ... (another order)
        │
        └── Document: {auto-generated-id}
            └── ... (another order)
```

---

## 4️⃣ Component Interaction Diagram

```
                      ┌──────────────────┐
                      │  Firebase Config │
                      │  (firebase.ts)   │
                      └────────┬─────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
                ▼              ▼              ▼
            ┌────────┐   ┌─────────┐   ┌──────────┐
            │ Auth   │   │Firestore│   │Google    │
            │Service │   │Service  │   │Provider  │
            └────┬───┘   └────┬────┘   └──────────┘
                 │            │
                 └─────┬──────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  useAuth Hook        │
            │ (use-auth.ts)        │
            │                      │
            │ Returns:             │
            │ - user object        │
            │ - loading state      │
            │ - error state        │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Order Page Component│
            │  (order/page.tsx)    │
            │                      │
            │ - Form state         │
            │ - Validation         │
            │ - Submit handler     │
            └──────────┬───────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
      ┌────────┐ ┌────────┐ ┌──────────────┐
      │Toast   │ │Loading │ │Confirmation  │
      │Notif   │ │Spinner │ │Redirect      │
      └────────┘ └────────┘ └──────────────┘
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
      ┌──────────────────────────────────┐
      │ firestore.ts Service Layer       │
      │                                  │
      │ saveOrderToFirestore()  ─────┐   │
      │ getOrderById()           ─┐   │   │
      │ getUserOrders()           │   │   │
      │ updateOrderStatus()       │   │   │
      │ etc...                    │   │   │
      └──────────┬────────────────┼───┴───┤
                 │                │       │
                 └────────┬───────┘       │
                          │              │
                          ▼              ▼
                  ┌──────────────┐   Firebase
                  │ Firestore    │   Cloud
                  │ Collection   │   Services
                  │  "orders"    │
                  └──────────────┘
```

---

## 5️⃣ API Request Flow

```
CLIENT BROWSER
│
└─ User Submits Form
   │
   └─ POST /api/orders
      │
      REQUEST BODY:
      {
        "orderData": { /* all form fields */ },
        "userInfo": {
          "userId": "...",
          "userEmail": "...",
          "userName": "..."
        }
      }
      │
      └─ Sent over HTTPS
         │
         ▼
NEXT.JS SERVER (route.ts)
│
├─ Receive request
│
├─ Extract body
│
├─ Validate input
│
├─ Check for errors
│
├─ Call saveOrderToFirestore()
│  │
│  ├─ Create order document
│  ├─ Add metadata & timestamp
│  ├─ Send to Firestore
│  └─ Get back orderId
│
├─ Return response
│
└─ Response Object:
   {
     "success": true,
     "orderId": "...",
     "message": "Order saved successfully",
     "timestamp": "2025-11-06T10:30:00Z"
   }
   │
   └─ Sent back over HTTPS
      │
      ▼
CLIENT BROWSER
│
├─ Receive response
│
├─ Check success flag
│
├─ Show success toast
│
├─ Store orderId in localStorage
│
└─ Redirect to confirmation page
```

---

## 6️⃣ Security & Authentication Flow

```
┌─────────────────────────────────────┐
│    User Not Authenticated           │
│    (No Firebase Auth)               │
└────────────────┬────────────────────┘
                 │
                 ▼
    Cannot access protected routes
    Cannot save orders
    Redirected to /signin
                 │
                 ▼
┌─────────────────────────────────────┐
│    User Signs In with Google        │
│    (Firebase Auth)                  │
└────────────────┬────────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ Firebase Auth State Updated │
    │ - userId set               │
    │ - userEmail set            │
    │ - useAuth hook triggers    │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ User Can Now:               │
    │ ✓ Access /order page        │
    │ ✓ Submit orders             │
    │ ✓ Access own orders         │
    └────────────┬────────────────┘
                 │
                 ▼
    ┌─────────────────────────────┐
    │ When User Submits Order:    │
    │                             │
    │ 1. Get userId from Auth     │
    │ 2. Add to order data        │
    │ 3. Save to Firestore        │
    │ 4. Firestore enforces rules │
    │    - Only owner can read    │
    │    - Only owner can update  │
    │    - Must be authenticated  │
    └────────────┬────────────────┘
                 │
                 ▼
    ✅ Order saved securely
    ✅ Only accessible by user
    ✅ Audit trail via timestamps
```

---

## 7️⃣ Form Validation Flow

```
START
│
├─ Segment 1: Contact & Scheduling
│  │
│  ├─ fullName: Required ✓
│  ├─ mobileNumber: Required ✓
│  ├─ completeAddress: Required ✓
│  ├─ preferredTestDate: Required ✓
│  └─ preferredTestTime: Required ✓
│
├─ NEXT BUTTON LOGIC:
│  ├─ All required fields filled? ✓
│  └─ YES → Enable, NO → Disable
│
├─ User Clicks NEXT
│  │
│  ├─ Save segment 1 data
│  └─ Move to Segment 2
│
├─ Segment 2: Test Motivation
│  │
│  ├─ motivations: At least 1 selected ✓
│  ├─ otherMotivation: Required if "Other" selected
│  │
│  ├─ NEXT BUTTON LOGIC:
│  ├─ motivations.length > 0? ✓
│  └─ YES → Enable, NO → Disable
│
├─ User Clicks NEXT
│  │
│  ├─ Save segment 2 data
│  └─ Move to Segment 3
│
├─ Segment 3: Personal & Lifestyle
│  │
│  ├─ age: Required ✓
│  ├─ gender: Required ✓
│  ├─ sampleType: Required ✓
│  ├─ height: Optional
│  ├─ weight: Optional
│  ├─ bloodGroup: Optional
│  ├─ ... (other fields)
│  ├─ consent: MUST BE CHECKED ✓
│  │
│  ├─ SUBMIT BUTTON LOGIC:
│  ├─ age filled? ✓
│  ├─ gender selected? ✓
│  ├─ sampleType selected? ✓
│  ├─ consent checked? ✓
│  └─ All YES → Enable, NO → Disable
│
├─ User Clicks SUBMIT
│  │
│  ├─ Final validation check
│  ├─ All required fields present?
│  │
│  ├─ YES → Save to Firebase
│  └─ NO → Show error & prevent submit
│
└─ COMPLETE
```

---

## 8️⃣ Status Lifecycle

```
Order Created
│
├─ Initial Status: "pending"
│  └─ Order in review
│     └─ Awaiting admin confirmation
│
├─ Update by Admin
│  └─ Status: "confirmed"
│     └─ Order confirmed
│        └─ Sample collection scheduled
│
├─ Update by System
│  └─ Status: "completed"
│     └─ Test results ready
│        └─ Report generated
│
└─ Optional Cancel
   └─ Status: "cancelled"
      └─ Order cancelled
         └─ Reason documented
```

---

**These diagrams illustrate the complete Firebase Order Management System architecture.**

Last Updated: November 6, 2025
