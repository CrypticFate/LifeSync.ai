/**
 * Firebase Firestore Service Layer
 * Handles all Firestore operations for orders
 * 
 * Database Structure:
 * Firestore
 * └── users/
 *     ├── {userId}/
 *     │   ├── email: string
 *     │   ├── displayName: string
 *     │   ├── createdAt: timestamp
 *     │   └── orders/ (subcollection)
 *     │       ├── {orderId}/
 *     │       │   ├── order data...
 *     │       │   └── timestamps
 *     │       └── {orderId}/
 *     │           └── order data...
 *     └── {userId}/
 *         └── orders/ (subcollection)
 */

import {
  initializeApp,
  getApps,
  FirebaseApp,
} from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  Query,
  QueryConstraint,
  Timestamp,
  writeBatch,
  setDoc,
  collectionGroup,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Order, OrderFormData, OrderSubmissionResponse } from '@/types/order';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Initialize Firebase app and Firestore
 */
export const initializeFirebaseApp = () => {
  if (db) {
    return db;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  return db;
};

/**
 * Get Firestore instance
 */
export const getFirestoreDb = (): Firestore => {
  if (!db) {
    return initializeFirebaseApp();
  }
  return db;
};

/**
 * Create or update user profile document
 * @param userId - User ID from Firebase Auth
 * @param userEmail - User email
 * @param userName - User display name
 */
export const createUserProfile = async (
  userId: string,
  userEmail: string,
  userName: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const userRef = doc(db, 'users', userId);
    
    // Get existing user doc to check if exists
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create new user document only if it doesn't exist
      await setDoc(userRef, {
        email: userEmail,
        displayName: userName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};

/**
 * Save order to user's orders subcollection
 * @param userId - User ID from Firebase Auth
 * @param userEmail - User email from Firebase Auth
 * @param userName - User display name
 * @param orderData - Complete order form data
 * @returns Order submission response with order ID
 */
export const saveOrderToFirestore = async (
  userId: string,
  userEmail: string,
  userName: string,
  orderData: OrderFormData
): Promise<OrderSubmissionResponse> => {
  try {
    const db = getFirestoreDb();
    const now = new Date().toISOString();

    // First, ensure user profile exists
    await createUserProfile(userId, userEmail, userName);

    // Create order document with metadata
    const orderDocument = {
      ...orderData,
      // Metadata
      userId,
      userEmail,
      userName,
      createdAt: now,
      updatedAt: now,
      status: 'pending' as const,
      notes: '',
    };

    // Add to user's orders subcollection
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    const docRef = await addDoc(userOrdersRef, orderDocument);

    return {
      success: true,
      orderId: docRef.id,
      message: 'Order saved successfully',
      timestamp: now,
    };
  } catch (error) {
    console.error('Error saving order to Firestore:', error);
    return {
      success: false,
      message: 'Failed to save order',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get order by ID from user's orders
 * @param userId - User ID
 * @param orderId - Firestore order document ID
 * @returns Order document or null
 */
export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<Order | null> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (orderSnap.exists()) {
      return {
        orderId: orderSnap.id,
        ...orderSnap.data(),
      } as Order;
    }

    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

/**
 * Get all orders for a user from their orders subcollection
 * @param userId - User ID from Firebase Auth
 * @param orderLimit - Number of orders to fetch (default: 50)
 * @returns Array of orders
 */
export const getUserOrders = async (
  userId: string,
  orderLimit: number = 50
): Promise<Order[]> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');

    const q = query(
      userOrdersRef,
      orderBy('createdAt', 'desc'),
      limit(orderLimit)
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        orderId: doc.id,
        ...doc.data(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

/**
 * Get orders by status for a user
 * @param userId - User ID
 * @param status - Order status
 * @param orderLimit - Number of orders to fetch (default: 50)
 * @returns Array of orders
 */
export const getUserOrdersByStatus = async (
  userId: string,
  status: string,
  orderLimit: number = 50
): Promise<Order[]> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');

    const q = query(
      userOrdersRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(orderLimit)
    );

    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];

    querySnapshot.forEach((doc) => {
      orders.push({
        orderId: doc.id,
        ...doc.data(),
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    return [];
  }
};

/**
 * Update order status (user's order)
 * @param userId - User ID
 * @param orderId - Order document ID
 * @param status - New status
 * @param notes - Optional notes
 * @returns Success flag
 */
export const updateOrderStatus = async (
  userId: string,
  orderId: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  notes?: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    await updateDoc(orderRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
};

/**
 * Delete order (user or admin)
 * @param userId - User ID
 * @param orderId - Order document ID
 * @returns Success flag
 */
export const deleteOrder = async (
  userId: string,
  orderId: string
): Promise<boolean> => {
  try {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'users', userId, 'orders', orderId);
    await deleteDoc(orderRef);
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};

/**
 * Get orders count by status for a user
 * @param userId - User ID
 * @returns Object with counts for each status
 */
export const getUserOrdersCounts = async (userId: string): Promise<{
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');

    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
    const counts = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };

    for (const status of statuses) {
      const q = query(
        userOrdersRef,
        where('status', '==', status)
      );
      const querySnapshot = await getDocs(q);
      counts[status] = querySnapshot.size;
    }

    return counts;
  } catch (error) {
    console.error('Error getting user orders counts:', error);
    return {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
  }
};

/**
 * Export order data as JSON
 * @param userId - User ID
 * @param orderId - Order document ID
 * @returns JSON string or null
 */
export const exportOrderAsJson = async (
  userId: string,
  orderId: string
): Promise<string | null> => {
  try {
    const order = await getOrderById(userId, orderId);
    if (!order) return null;
    return JSON.stringify(order, null, 2);
  } catch (error) {
    console.error('Error exporting order:', error);
    return null;
  }
};

/**
 * Backup all user orders
 * @param userId - User ID
 * @returns JSON string of all user orders
 */
export const backupUserOrders = async (userId: string): Promise<string> => {
  try {
    const orders = await getUserOrders(userId, 1000);
    return JSON.stringify({
      userId,
      backupDate: new Date().toISOString(),
      totalOrders: orders.length,
      orders,
    }, null, 2);
  } catch (error) {
    console.error('Error backing up orders:', error);
    return '';
  }
};

/**
 * Get user profile
 * @param userId - User ID
 * @returns User profile or null
 */
export const getUserProfile = async (userId: string): Promise<any | null> => {
  try {
    const db = getFirestoreDb();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return {
        userId,
        ...userSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get all users (admin function - use with caution)
 * @param userLimit - Number of users to fetch (default: 100)
 * @returns Array of user profiles
 */
export const getAllUsers = async (userLimit: number = 100): Promise<any[]> => {
  try {
    const db = getFirestoreDb();
    const usersRef = collection(db, 'users');

    const q = query(
      usersRef,
      orderBy('createdAt', 'desc'),
      limit(userLimit)
    );

    const querySnapshot = await getDocs(q);
    const users: any[] = [];

    querySnapshot.forEach((doc) => {
      users.push({
        userId: doc.id,
        ...doc.data(),
      });
    });

    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

/**
 * Get user's total orders count
 * @param userId - User ID
 * @returns Total number of orders
 */
export const getUserOrdersCount = async (userId: string): Promise<number> => {
  try {
    const db = getFirestoreDb();
    const userOrdersRef = collection(db, 'users', userId, 'orders');
    const querySnapshot = await getDocs(userOrdersRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting user orders count:', error);
    return 0;
  }
};
