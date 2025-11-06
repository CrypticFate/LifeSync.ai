# Hierarchical Database Architecture

## 🏗️ New Database Structure Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                      FIREBASE FIRESTORE                       │
│                    (Google Cloud Service)                     │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │  USERS COLLECTION   │
                    │    (/users/)        │
                    └─────────┬───────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │ USER 1   │  │ USER 2   │  │ USER 3   │
          │(userId-1)│  │(userId-2)│  │(userId-3)│
          └──────────┘  └──────────┘  └──────────┘
          Document      Document      Document
          ┌──────┐      ┌──────┐      ┌──────┐
          │ info │      │ info │      │ info │
          └──────┘      └──────┘      └──────┘
          ┌──────┐      ┌──────┐      ┌──────┐
          │email │      │email │      │email │
          └──────┘      └──────┘      └──────┘
                │                      
                ▼
    ┌──────────────────────┐
    │ ORDERS SUBCOLLECTION │
    │  (/users/{userId}/   │
    │    orders/)          │
    └──────────┬───────────┘
               │
       ┌───────┼───────┐
       │       │       │
       ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌─────┐
    │ O1  │ │ O2  │ │ O3  │
    └─────┘ └─────┘ └─────┘
    (Order  (Order  (Order
     Data)   Data)   Data)
```

---

## 📋 Complete Data Structure

```
FIRESTORE
└── users (collection)
    │
    ├── {userId-1} (document)
    │   ├── email: "john@example.com"
    │   ├── displayName: "John Doe"
    │   ├── createdAt: 2025-11-01T10:00:00Z
    │   ├── updatedAt: 2025-11-01T10:00:00Z
    │   │
    │   └── orders (subcollection)
    │       │
    │       ├── {orderId-1} (document)
    │       │   ├── fullName: "John Doe"
    │       │   ├── mobileNumber: "+1-555-0123"
    │       │   ├── completeAddress: "123 Main St"
    │       │   ├── preferredTestDate: "2025-11-15"
    │       │   ├── preferredTestTime: "9am-11am"
    │       │   ├── motivations: ["Family history", "Personal interest"]
    │       │   ├── age: "35"
    │       │   ├── gender: "male"
    │       │   ├── bloodGroup: "o+"
    │       │   ├── status: "pending"
    │       │   ├── createdAt: 2025-11-06T10:30:00Z
    │       │   ├── updatedAt: 2025-11-06T10:30:00Z
    │       │   └── ... (15+ more fields)
    │       │
    │       ├── {orderId-2} (document)
    │       │   └── ... (another order)
    │       │
    │       └── {orderId-3} (document)
    │           └── ... (another order)
    │
    ├── {userId-2} (document)
    │   ├── email: "jane@example.com"
    │   ├── displayName: "Jane Smith"
    │   ├── createdAt: 2025-11-02T15:00:00Z
    │   │
    │   └── orders (subcollection)
    │       ├── {orderId-A} (document)
    │       │   └── ... (order data)
    │       │
    │       └── {orderId-B} (document)
    │           └── ... (order data)
    │
    └── {userId-3} (document)
        ├── email: "bob@example.com"
        ├── displayName: "Bob Johnson"
        │
        └── orders (subcollection)
            └── {orderId-X} (document)
                └── ... (order data)
```

---

## 🔄 Data Access Paths

### Before (Flat Structure)
```
orders/{orderId}
├── userId: "user-123"
├── userEmail: "user@example.com"
├── ... (all order data)
└── (Query all, then filter by userId) ❌ Inefficient
```

### After (Hierarchical Structure)
```
users/{userId}/orders/{orderId}
├── fullName: "John Doe"
├── mobileNumber: "+1-555-0123"
├── ... (all order data)
└── (Direct access, scoped to user) ✅ Efficient
```

---

## 📊 Query Comparison

### Query 1: Get All Orders for User

**Old Way:**
```typescript
// Query all orders collection
const allOrders = await getDocs(collection(db, 'orders'));
// Filter in application
const userOrders = allOrders.filter(o => o.userId === userId);
```
- **Reads**: 1000s of orders (expensive)
- **Speed**: Slow
- **Cost**: High

**New Way:**
```typescript
// Query directly user's subcollection
const userOrders = await getDocs(
  query(collection(db, 'users', userId, 'orders'))
);
```
- **Reads**: Only user's orders (efficient)
- **Speed**: Fast ⚡
- **Cost**: Low 💰

### Query 2: Get User's Pending Orders

**Old Way:**
```typescript
// Query all pending orders
const pendingOrders = await getDocs(
  query(collection(db, 'orders'), where('status', '==', 'pending'))
);
// Filter by userId in application
const userPending = pendingOrders.filter(o => o.userId === userId);
```

**New Way:**
```typescript
// Query user's orders directly
const userPending = await getDocs(
  query(
    collection(db, 'users', userId, 'orders'),
    where('status', '==', 'pending')
  )
);
```

---

## 🔐 Security Model

### User Isolation in Database Path

```
Access Control Hierarchy:

┌─────────────────────────────────────┐
│       Firebase Authentication       │
│      (User is logged in as: ABC)    │
└──────────────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Database Path Check  │
        └──────────────────────┘
                   │
     ┌─────────────┴─────────────┐
     │                           │
Can access:         Cannot access:
users/ABC/orders    users/XYZ/orders
users/ABC/*         users/XYZ/*
     │                           │
     ✅ Own data                 ❌ Other's data
```

### Security Rule Implementation

```javascript
match /users/{userId} {
  // Database path: users/{userId}
  // Request: request.auth.uid == userId (e.g., "ABC")
  allow read: if request.auth.uid == userId;
  
  match /orders/{orderId} {
    // Full path: users/{userId}/orders/{orderId}
    // Example: users/ABC/orders/order123
    // User ABC can access
    // User XYZ cannot access
    allow read: if request.auth.uid == userId;
  }
}
```

---

## 📈 Scalability

### How It Scales

```
Single User Growth:
User → 10 orders → 100 orders → 1000 orders
No impact on other users ✅

Multiple Users:
1 user  → 10 users → 1000 users → 1M users
Each user's data isolated ✅

Total Data:
10k orders → 100k orders → 1M orders → 1B orders
Each query scoped to user ✅
```

### Performance Graph

```
Query Speed vs Users

Old Structure (Flat):
│     ╱╱╱
│   ╱╱  (Performance degrades)
│ ╱╱
│╱_________________ Users
(Speed decreases as more users/orders)

New Structure (Hierarchical):
│ ───────────────────
│        (Consistent performance)
│_____________________ Users
(Speed constant regardless of other users)
```

---

## 🔌 API Paths

### REST API Endpoints

```
POST /api/orders
  │
  ├─ Body: { orderData, userInfo }
  ├─ Saves to: users/{userId}/orders/{orderId}
  └─ Response: { success, orderId }

GET /api/orders?limit=50
  │
  ├─ Header: x-user-id: {userId}
  ├─ Queries: users/{userId}/orders
  └─ Response: { data: [...orders] }
```

---

## 🔄 Data Flow

### Creating an Order

```
User Form
    │
    ▼
useAuth() → Get userId
    │
    ▼
saveOrderToFirestore(userId, ...)
    │
    ├─ Create user profile at: users/{userId}
    │
    ├─ Create order at: users/{userId}/orders/{orderId}
    │
    └─ Return: { success, orderId }
         │
         ▼
    Save localStorage
         │
         ▼
    Redirect to confirmation
```

### Retrieving Orders

```
User Requests Orders
    │
    ▼
useAuth() → Get userId
    │
    ▼
getUserOrders(userId)
    │
    ├─ Query: users/{userId}/orders
    ├─ Filter: orderBy('createdAt', 'desc')
    ├─ Limit: 50
    │
    └─ Return: [orders]
         │
         ▼
    Display to user
```

---

## 🗂️ File Organization in Firebase Console

### How It Looks

```
Firestore > Collections

📦 users (collection)
  📄 abc123 (document - User 1)
    ├─ email: "john@example.com"
    ├─ displayName: "John Doe"
    └─ 📦 orders (subcollection)
       ├─ 📄 order1 (document)
       ├─ 📄 order2 (document)
       └─ 📄 order3 (document)
  
  📄 def456 (document - User 2)
    ├─ email: "jane@example.com"
    ├─ displayName: "Jane Smith"
    └─ 📦 orders (subcollection)
       ├─ 📄 orderA (document)
       └─ 📄 orderB (document)
  
  📄 ghi789 (document - User 3)
    ├─ email: "bob@example.com"
    └─ 📦 orders (subcollection)
       └─ 📄 orderX (document)
```

---

## 🚨 Security Zones

```
┌─────────────────────────────────────┐
│        PUBLIC INTERNET              │
│         (Unsecured)                 │
└──────────────────┬──────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ FIREBASE AUTH        │
        │ (User signs in)      │
        │ ✅ Token validated   │
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ FIRESTORE RULES      │
        │ Path-based access    │
        │ ✅ users/{userId}    │
        │ ✅ Isolation enforced│
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ USER'S DATA          │
        │ ✅ Protected         │
        │ ✅ Isolated          │
        │ ✅ Encrypted         │
        └──────────────────────┘
```

---

## 🎯 Summary

| Aspect | Old (Flat) | New (Hierarchical) |
|--------|-----------|-------------------|
| **Path** | `orders/{id}` | `users/{uid}/orders/{id}` |
| **Query** | All orders | User's orders only |
| **Security** | Rule-based | Path-based + Rule-based |
| **Performance** | O(n) | O(1) |
| **Cost** | High | Low |
| **Isolation** | Logical | Physical |
| **Scalability** | Degrades | Constant |

---

**Last Updated**: November 6, 2025
**Version**: 2.0 (Hierarchical Structure)
**Status**: Production Ready ✅
