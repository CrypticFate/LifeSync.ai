# Updated Firestore Security Rules

## New Database Structure

The database now organizes orders hierarchically under each user:

```
Firestore
└── users/ (collection)
    ├── {userId}/ (document)
    │   ├── email: string
    │   ├── displayName: string
    │   ├── createdAt: timestamp
    │   ├── updatedAt: timestamp
    │   └── orders/ (subcollection)
    │       ├── {orderId}/ (document)
    │       │   ├── fullName: string
    │       │   ├── mobileNumber: string
    │       │   ├── ... (all order fields)
    │       │   ├── status: string
    │       │   ├── createdAt: timestamp
    │       │   └── updatedAt: timestamp
    │       └── {orderId}/
    │           └── ... (another order)
    │
    └── {userId}/
        └── orders/ (subcollection)
            └── ...
```

## Firestore Security Rules

Add these rules to your Firebase Console:

### Option 1: Standard Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - protect user documents
    match /users/{userId} {
      // Allow users to read/write their own profile
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      
      // Orders subcollection - under each user
      match /orders/{orderId} {
        // Allow users to create their own orders
        allow create: if request.auth.uid == userId && request.auth != null;
        
        // Allow users to read their own orders
        allow read: if request.auth.uid == userId;
        
        // Allow users to update their own orders
        allow update: if request.auth.uid == userId;
        
        // Allow users to delete their own orders
        allow delete: if request.auth.uid == userId;
      }
    }
  }
}
```

### Option 2: Admin Access Allowed

If you need admin access to view all orders:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow admins full access
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId;
      
      match /orders/{orderId} {
        allow create: if request.auth.uid == userId && request.auth != null;
        allow read: if request.auth.uid == userId || isAdmin();
        allow update: if request.auth.uid == userId || isAdmin();
        allow delete: if request.auth.uid == userId || isAdmin();
      }
    }
  }
}
```

### Option 3: With Validation

Strict validation of order data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      
      match /orders/{orderId} {
        // Create validation
        allow create: if request.auth.uid == userId 
          && request.auth != null
          && request.resource.data.fullName is string
          && request.resource.data.mobileNumber is string
          && request.resource.data.consent == true;
        
        // Read validation
        allow read: if request.auth.uid == userId;
        
        // Update validation
        allow update: if request.auth.uid == userId 
          && request.resource.data.userId == userId;
        
        // Delete validation
        allow delete: if request.auth.uid == userId;
      }
    }
  }
}
```

## Steps to Update Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **LifeSync.ai**
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with one of the options above
5. Click **Publish**
6. Verify in the rules playground (optional)

## Testing the Rules

### In Firebase Console Playground:

**Test Case 1: User Can Create Their Own Order**
```
Request Auth: { uid: "user123" }
Path: /users/user123/orders/order1
Method: write
Result: ✅ ALLOW
```

**Test Case 2: User Cannot Access Another User's Orders**
```
Request Auth: { uid: "user1" }
Path: /users/user2/orders/order1
Method: read
Result: ❌ DENY
```

**Test Case 3: Unauthenticated User Cannot Create**
```
Request Auth: null
Path: /users/user123/orders/order1
Method: write
Result: ❌ DENY
```

## Key Features

✅ **User Isolation**: Each user can only access their own orders
✅ **Subcollection Structure**: Orders organized under users
✅ **Authentication Required**: Only authenticated users can create/read
✅ **Scalable**: Subcollections scale better than global collection
✅ **Performance**: Queries are faster and more efficient
✅ **Security**: Data protected by user ID

## Benefits of This Structure

### 1. **Data Organization**
- Orders logically grouped under users
- Clear parent-child relationship
- Easy to navigate in Firebase Console

### 2. **Performance**
- Faster queries (scoped to user)
- Better indexing
- Reduced read operations

### 3. **Security**
- Easier to enforce access controls
- User isolation enforced by rules
- Better data privacy

### 4. **Scalability**
- Handles millions of users with millions of orders
- Each user's data is isolated
- No cross-user queries needed

### 5. **Cost Efficiency**
- Fewer read operations
- Targeted queries
- Lower Firestore bill

## Migration Notes

If you have existing orders in the old "orders" collection:

1. Create a migration script to move orders to the new structure
2. Run script to copy: `orders/{orderId}` → `users/{userId}/orders/{orderId}`
3. Verify all orders are in new location
4. Delete old orders collection
5. Update security rules

### Example Migration Query:
```javascript
// Get all orders from old collection
db.collection('orders').get().then(snapshot => {
  snapshot.docs.forEach(doc => {
    const order = doc.data();
    const userId = order.userId;
    
    // Save to new location
    db.collection('users')
      .doc(userId)
      .collection('orders')
      .doc(doc.id)
      .set(order);
  });
});
```

## API Changes

All API functions now require `userId` parameter:

### Before:
```typescript
await getOrderById(orderId)
```

### After:
```typescript
await getOrderById(userId, orderId)
```

## Function Signatures

All functions updated to use the new structure:

```typescript
// User Management
createUserProfile(userId, userEmail, userName)
getUserProfile(userId)
getAllUsers(limit)

// Order Operations
saveOrderToFirestore(userId, userEmail, userName, orderData)
getOrderById(userId, orderId)
getUserOrders(userId, limit)
getUserOrdersByStatus(userId, status, limit)
updateOrderStatus(userId, orderId, status, notes)
deleteOrder(userId, orderId)

// Statistics
getUserOrdersCounts(userId)
getUserOrdersCount(userId)

// Data Export
exportOrderAsJson(userId, orderId)
backupUserOrders(userId)
```

## Verification Checklist

- [ ] Updated Firebase security rules
- [ ] Published new rules in Firebase Console
- [ ] Tested rules in playground
- [ ] Updated all function calls to include userId
- [ ] Verified orders are saved under users collection
- [ ] Confirmed user isolation works
- [ ] Tested API endpoints with new structure
- [ ] Updated documentation

## Monitoring

Monitor your new structure in Firebase Console:

1. **Users Collection**
   - View user profiles
   - See user count
   - Monitor storage

2. **Orders Subcollection**
   - View orders per user
   - Check data structure
   - Monitor subcollection size

3. **Activity**
   - Monitor read/write counts
   - Check for unauthorized access attempts
   - Review error rates

---

**Last Updated**: November 6, 2025
**Version**: 2.0 (Hierarchical Structure)
**Status**: Production Ready ✅
