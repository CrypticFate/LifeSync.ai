# Firebase Order System - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Add Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **LifeSync.ai**
3. Navigate to **Firestore Database** → **Rules**
4. Replace existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to write their own orders
    match /orders/{document=**} {
      allow create: if request.auth != null;
      allow read, update: if request.auth.uid == resource.data.userId;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

5. Click **Publish**

### Step 2: Test the System

1. Start your development server:
```bash
npm run dev
```

2. Navigate to the order page:
```
http://localhost:3000/signin  # Sign in first
http://localhost:3000/order   # Then go to order page
```

3. Fill out the form and submit
4. Check Firebase Console → Firestore → Collections → orders

---

## 📋 Form Structure

The order form collects data in 3 segments:

### Segment 1: Contact & Scheduling
- Full Name
- Mobile Number
- Complete Address
- Preferred Test Date
- Preferred Time Slot

### Segment 2: Test Motivation
- Why are you taking the test? (Multiple choice)
- Other motivation (if applicable)

### Segment 3: Personal & Lifestyle Data
- Age, Gender, Sample Type
- Height, Weight, Blood Group
- Ethnicity
- Smoking, Alcohol, Exercise habits
- Current Medications
- Allergies
- Consent to privacy policy

---

## 💾 Data Storage

All order data is automatically saved to Firebase Firestore:

```
Database: LifeSync.ai (lifesync-4d5da)
Collection: orders
Document: {auto-generated-id}
```

### Example Order Document:
```json
{
  "fullName": "John Doe",
  "mobileNumber": "+1-555-0123",
  "completeAddress": "123 Main St, New York, NY 10001",
  "preferredTestDate": "2025-11-15",
  "preferredTestTime": "9am-11am",
  "motivations": ["Family history", "Personal interest"],
  "age": "35",
  "gender": "male",
  "bloodGroup": "o+",
  "createdAt": "2025-11-06T10:30:00.000Z",
  "userId": "firebase-user-id",
  "userEmail": "user@example.com",
  "status": "pending",
  "consent": true
}
```

---

## 🔧 API Endpoints

### Submit Order
**Endpoint**: `POST /api/orders`

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderData": { /* form data */ },
    "userInfo": {
      "userId": "user-id",
      "userEmail": "user@example.com",
      "userName": "John Doe"
    }
  }'
```

### Get User Orders
**Endpoint**: `GET /api/orders?limit=50`

```bash
curl -X GET http://localhost:3000/api/orders?limit=50 \
  -H "x-user-id: user-id" \
  -H "x-user-email: user@example.com"
```

---

## 🐛 Troubleshooting

### Issue: "Permission denied" when saving order
**Solution**: 
- Ensure user is signed in
- Check Firestore security rules
- Verify Firebase config is correct

### Issue: Orders not appearing in Firestore
**Solution**:
- Check browser console for errors
- Verify collection name is "orders"
- Ensure user is authenticated

### Issue: "Unauthorized domain" error
**Solution**:
- Add `localhost:3000` to Firebase Console authorized domains
- Refer to `FIREBASE_FIX_GUIDE.md`

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/app/order/page.tsx` | Order form UI |
| `src/lib/firestore.ts` | Firestore operations |
| `src/app/api/orders/route.ts` | Order API endpoints |
| `src/types/order.ts` | TypeScript interfaces |
| `src/hooks/use-auth.ts` | Authentication hook |

---

## 🔐 Security

- ✅ User authentication required
- ✅ Orders isolated per user
- ✅ Firestore security rules enforced
- ✅ Data encrypted in transit
- ✅ No sensitive data in URLs

---

## 📊 Monitoring

View orders in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **LifeSync.ai** project
3. Click **Firestore Database**
4. View **orders** collection
5. Click any order to see full details

---

## 🎯 Next Steps

- [ ] Set up Firestore security rules (Step 1 above)
- [ ] Test form submission
- [ ] Verify data in Firebase Console
- [ ] Add admin dashboard (optional)
- [ ] Set up order notifications (optional)
- [ ] Configure data export (optional)

---

## 📖 Full Documentation

See `FIREBASE_ORDER_SYSTEM.md` for complete documentation

---

**Status**: ✅ Ready to Use
**Last Updated**: November 6, 2025
