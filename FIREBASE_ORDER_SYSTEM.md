# Firebase Order Management System Documentation

## Overview

A complete order management system that captures user information through a multi-step form and saves all data to Firebase Firestore in JSON format.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Order Page (UI)                       │
│              (src/app/order/page.tsx)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              useAuth Hook                                │
│         (src/hooks/use-auth.ts)                         │
│    Gets current user info from Firebase Auth            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│          Firestore Service Layer                         │
│      (src/lib/firestore.ts)                             │
│    Handles all Firestore CRUD operations                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│        Firebase Firestore Database                       │
│   Stores orders in "orders" collection                  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Structure

### Order Document in Firestore

Each order is stored with the following JSON structure:

```json
{
  "orderId": "auto-generated-firestore-id",
  "userId": "firebase-auth-user-id",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "createdAt": "2025-11-06T10:30:00.000Z",
  "updatedAt": "2025-11-06T10:30:00.000Z",
  "status": "pending",
  "notes": "",
  
  "fullName": "John Doe",
  "mobileNumber": "+1-555-0123",
  "completeAddress": "123 Main St, New York, NY 10001",
  "preferredTestDate": "2025-11-15",
  "preferredTestTime": "9am-11am",
  
  "motivations": [
    "Family history of inherited diseases",
    "Personal interest in health & longevity"
  ],
  "otherMotivation": "",
  
  "age": "35",
  "gender": "male",
  "sampleType": "myself",
  "height": "5'10\"",
  "weight": "180 lbs",
  "bloodGroup": "o+",
  "ethnicity": "Caucasian",
  "smoking": "no",
  "alcohol": "occasionally",
  "exercise": "4-5",
  "medications": "",
  "takingMedications": "no",
  "allergies": "Penicillin",
  "hasAllergies": "yes",
  "sleepQuality": "",
  "dietaryPreferences": "",
  "stressLevel": "",
  "consent": true
}
```

### TypeScript Interfaces

```typescript
interface OrderFormData {
  // Contact & Scheduling
  fullName: string;
  mobileNumber: string;
  completeAddress: string;
  preferredTestDate: string;
  preferredTestTime: string;
  
  // Test Motivation
  motivations: string[];
  otherMotivation: string;
  
  // Personal & Lifestyle
  age: string;
  gender: string;
  sampleType: string;
  height: string;
  weight: string;
  bloodGroup: string;
  ethnicity: string;
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
  consent: boolean;
}

interface Order extends OrderFormData {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}
```

---

## File Structure

### Core Files

#### 1. `src/types/order.ts`
- **Purpose**: TypeScript interfaces for order management
- **Exports**:
  - `OrderFormData` - Form input data
  - `Order` - Complete order document
  - `OrderSubmissionResponse` - API response type
  - `OrderQueryFilters` - Query filter options
  - `OrdersQueryResponse` - Paginated orders

#### 2. `src/lib/firestore.ts`
- **Purpose**: Firebase Firestore service layer
- **Key Functions**:
  - `initializeFirebaseApp()` - Initialize Firebase
  - `saveOrderToFirestore()` - Save new order
  - `getOrderById()` - Retrieve single order
  - `getUserOrders()` - Get all user orders
  - `updateOrderStatus()` - Update order status
  - `exportOrderAsJson()` - Export as JSON
  - `backupUserOrders()` - Backup all user orders

#### 3. `src/app/api/orders/route.ts`
- **Purpose**: API endpoint for order operations
- **Endpoints**:
  - `POST /api/orders` - Submit new order
  - `GET /api/orders` - Get user's orders

#### 4. `src/app/order/page.tsx`
- **Purpose**: Multi-step order form UI
- **Features**:
  - 3-segment form (Contact, Motivation, Personal)
  - Progress tracking
  - Form validation
  - Firebase integration
  - Loading states
  - Toast notifications

#### 5. `src/hooks/use-auth.ts`
- **Purpose**: React hook for authentication state
- **Returns**: `{ user, loading, error }`

---

## Usage Guide

### 1. Submitting an Order

```typescript
import { saveOrderToFirestore } from '@/lib/firestore';

const result = await saveOrderToFirestore(
  userId,
  userEmail,
  userName,
  orderFormData
);

if (result.success) {
  console.log('Order saved:', result.orderId);
}
```

### 2. Retrieving User Orders

```typescript
import { getUserOrders } from '@/lib/firestore';

const orders = await getUserOrders(userId);
orders.forEach(order => {
  console.log(`Order ${order.orderId}: ${order.status}`);
});
```

### 3. Getting a Specific Order

```typescript
import { getOrderById } from '@/lib/firestore';

const order = await getOrderById('order-id-here');
if (order) {
  console.log(JSON.stringify(order, null, 2));
}
```

### 4. Updating Order Status

```typescript
import { updateOrderStatus } from '@/lib/firestore';

const success = await updateOrderStatus(
  'order-id',
  'confirmed',
  'Order confirmed by admin'
);
```

### 5. Exporting Order Data

```typescript
import { exportOrderAsJson } from '@/lib/firestore';

const jsonString = await exportOrderAsJson('order-id');
console.log(jsonString);
```

---

## Firebase Console Setup

### Required Security Rules

Add these Firestore security rules to allow authenticated users to create orders:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to write their own orders
    match /orders/{document=**} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.userId;
      
      // Allow admins to read all orders
      allow read: if request.auth.token.admin == true;
    }
  }
}
```

### Collections

**Collection**: `orders`
- **Document ID**: Auto-generated by Firestore
- **Data**: Complete order information

---

## API Endpoints

### POST /api/orders

**Submit a new order**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderData": { ... },
    "userInfo": {
      "userId": "user-id",
      "userEmail": "user@example.com",
      "userName": "John Doe"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "orderId": "generated-order-id",
  "message": "Order saved successfully",
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

### GET /api/orders

**Retrieve user's orders**

```bash
curl -X GET "http://localhost:3000/api/orders?limit=50" \
  -H "x-user-id: user-id" \
  -H "x-user-email: user@example.com"
```

**Response:**
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": [ ... ],
  "total": 5,
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

---

## Features

### ✅ Implemented

- [x] Multi-step form with validation
- [x] Firebase Firestore integration
- [x] User authentication
- [x] Complete JSON data storage
- [x] Order status tracking
- [x] User order retrieval
- [x] Order export as JSON
- [x] Data backup functionality
- [x] Loading states
- [x] Toast notifications
- [x] Error handling
- [x] TypeScript support

### 🔄 In Development / Optional

- [ ] Admin dashboard for order management
- [ ] Email notifications on order submission
- [ ] Order search and filtering UI
- [ ] Order history page
- [ ] PDF invoice generation
- [ ] Webhook integrations
- [ ] Order status history tracking

---

## Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## Error Handling

All functions include error handling and return meaningful error messages:

```typescript
const result = await saveOrderToFirestore(...);

if (!result.success) {
  console.error('Error:', result.error);
  // Handle error gracefully
}
```

---

## Best Practices

1. **Always authenticate** - Check user authentication before operations
2. **Validate data** - Validate on client before sending to Firebase
3. **Handle errors** - Always check success flag before using data
4. **Use loading states** - Show loading indicators during async operations
5. **Secure data** - Use Firebase security rules to protect sensitive data
6. **Monitor usage** - Use Firebase console to monitor read/write operations

---

## Troubleshooting

### Orders not saving?
- Check Firebase configuration in `src/lib/firebase.ts`
- Verify Firestore security rules allow writes
- Check browser console for errors
- Ensure user is authenticated

### Cannot retrieve orders?
- Verify user is logged in
- Check security rules allow reads for user's own orders
- Ensure userId matches in order document

### Firestore quotas exceeded?
- Firestore has free tier limits
- Monitor usage in Firebase console
- Consider upgrading to paid plan

---

## Database Schema

### Firestore Collections

```
firestore
  ├── orders/
  │   ├── {orderId1}/
  │   │   ├── fullName: "John Doe"
  │   │   ├── userId: "user-123"
  │   │   ├── status: "pending"
  │   │   ├── createdAt: Timestamp
  │   │   └── ... (all form fields)
  │   │
  │   └── {orderId2}/
  │       └── ...
```

---

## Performance Considerations

- **Firestore Reads**: ~1 read per order retrieval
- **Firestore Writes**: ~1 write per order submission
- **Batch Operations**: Use writeBatch for multiple updates
- **Indexes**: Add composite indexes for complex queries

---

## Security Considerations

1. **Authentication Required** - All operations require Firebase Auth
2. **User Data Isolation** - Users can only access their own orders
3. **Rate Limiting** - Consider adding rate limiting
4. **Data Validation** - Validate all inputs on client and server
5. **HTTPS Only** - Always use HTTPS in production

---

## Resources

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Console](https://console.firebase.google.com/)

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review Firebase console logs
3. Verify Firebase configuration
4. Check security rules are correct
5. Review TypeScript types for data structure

---

**Last Updated**: November 6, 2025
**Version**: 1.0.0
**Status**: Production Ready
