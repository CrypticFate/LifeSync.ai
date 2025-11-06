/**
 * Firebase Order System - Usage Examples
 * 
 * This file shows how to use the Firebase order management system
 * programmatically from other parts of your application.
 */

// ============================================================================
// Example 1: Save an Order to Firebase
// ============================================================================

import { saveOrderToFirestore } from '@/lib/firestore';
import type { OrderFormData } from '@/types/order';

async function example1_SaveOrder() {
  const userId = 'user-123';
  const userEmail = 'john@example.com';
  const userName = 'John Doe';

  const orderData: OrderFormData = {
    fullName: 'John Doe',
    mobileNumber: '+1-555-0123',
    completeAddress: '123 Main St, New York, NY 10001',
    preferredTestDate: '2025-11-15',
    preferredTestTime: '9am-11am',
    motivations: ['Family history of inherited diseases', 'Personal interest in health & longevity'],
    otherMotivation: '',
    age: '35',
    gender: 'male',
    sampleType: 'myself',
    height: '5\'10"',
    weight: '180 lbs',
    bloodGroup: 'o+',
    ethnicity: 'Caucasian',
    smoking: 'no',
    alcohol: 'occasionally',
    exercise: '4-5',
    medications: '',
    takingMedications: 'no',
    allergies: 'Penicillin',
    hasAllergies: 'yes',
    sleepQuality: '',
    dietaryPreferences: '',
    stressLevel: '',
    consent: true,
  };

  const result = await saveOrderToFirestore(userId, userEmail, userName, orderData);

  if (result.success) {
    console.log('✅ Order saved successfully!');
    console.log('Order ID:', result.orderId);
  } else {
    console.error('❌ Error saving order:', result.error);
  }
}

// ============================================================================
// Example 2: Retrieve All Orders for a User
// ============================================================================

import { getUserOrders } from '@/lib/firestore';

async function example2_GetUserOrders() {
  const userId = 'user-123';

  // Get up to 50 most recent orders
  const orders = await getUserOrders(userId, 50);

  console.log(`📋 Found ${orders.length} orders`);

  orders.forEach((order) => {
    console.log(`
      Order ID: ${order.orderId}
      Status: ${order.status}
      Date: ${order.createdAt}
      Name: ${order.fullName}
      Email: ${order.userEmail}
    `);
  });
}

// ============================================================================
// Example 3: Get a Specific Order by ID
// ============================================================================

import { getOrderById } from '@/lib/firestore';

async function example3_GetOrderById() {
  const orderId = 'order-id-from-confirmation-page';

  const order = await getOrderById(orderId);

  if (order) {
    console.log('✅ Order found:');
    console.log(JSON.stringify(order, null, 2));
  } else {
    console.log('❌ Order not found');
  }
}

// ============================================================================
// Example 4: Update Order Status
// ============================================================================

import { updateOrderStatus } from '@/lib/firestore';

async function example4_UpdateOrderStatus() {
  const orderId = 'order-id-here';

  // Mark order as confirmed
  const success = await updateOrderStatus(
    orderId,
    'confirmed',
    'Order has been reviewed and confirmed by admin'
  );

  if (success) {
    console.log('✅ Order status updated to confirmed');
  } else {
    console.log('❌ Failed to update order status');
  }

  // Mark order as completed
  const completed = await updateOrderStatus(
    orderId,
    'completed',
    'Test completed and results are ready'
  );
}

// ============================================================================
// Example 5: Export Order as JSON
// ============================================================================

import { exportOrderAsJson } from '@/lib/firestore';

async function example5_ExportOrderAsJson() {
  const orderId = 'order-id-here';

  const jsonString = await exportOrderAsJson(orderId);

  if (jsonString) {
    console.log('✅ Order exported as JSON:');
    console.log(jsonString);

    // Save to file (in a Node.js environment)
    // fs.writeFileSync(`order-${orderId}.json`, jsonString);
  } else {
    console.log('❌ Failed to export order');
  }
}

// ============================================================================
// Example 6: Backup All User Orders
// ============================================================================

import { backupUserOrders } from '@/lib/firestore';

async function example6_BackupUserOrders() {
  const userId = 'user-123';

  const backupJson = await backupUserOrders(userId);

  if (backupJson) {
    console.log('✅ User orders backed up:');
    console.log(backupJson);

    // Save to file (in a Node.js environment)
    // fs.writeFileSync(`user-${userId}-backup.json`, backupJson);
  } else {
    console.log('❌ Failed to backup orders');
  }
}

// ============================================================================
// Example 7: Get Orders by Status (Admin Function)
// ============================================================================

import { getOrdersByStatus } from '@/lib/firestore';

async function example7_GetOrdersByStatus() {
  // Get all pending orders
  const pendingOrders = await getOrdersByStatus('pending', 100);
  console.log(`📋 Pending orders: ${pendingOrders.length}`);

  // Get all confirmed orders
  const confirmedOrders = await getOrdersByStatus('confirmed', 100);
  console.log(`✅ Confirmed orders: ${confirmedOrders.length}`);

  // Get all completed orders
  const completedOrders = await getOrdersByStatus('completed', 100);
  console.log(`🎉 Completed orders: ${completedOrders.length}`);
}

// ============================================================================
// Example 8: Get Orders Count Summary (Dashboard)
// ============================================================================

import { getOrdersCounts } from '@/lib/firestore';

async function example8_GetOrdersCounts() {
  const counts = await getOrdersCounts();

  console.log('📊 Order Summary:');
  console.log(`  Pending: ${counts.pending}`);
  console.log(`  Confirmed: ${counts.confirmed}`);
  console.log(`  Completed: ${counts.completed}`);
  console.log(`  Cancelled: ${counts.cancelled}`);
  console.log(`  Total: ${counts.pending + counts.confirmed + counts.completed + counts.cancelled}`);
}

// ============================================================================
// Example 9: Delete an Order (Admin Function)
// ============================================================================

import { deleteOrder } from '@/lib/firestore';

async function example9_DeleteOrder() {
  const orderId = 'order-id-to-delete';

  const success = await deleteOrder(orderId);

  if (success) {
    console.log('✅ Order deleted successfully');
  } else {
    console.log('❌ Failed to delete order');
  }
}

// ============================================================================
// Example 10: Complete Order Processing Flow
// ============================================================================

async function example10_CompleteFlow() {
  try {
    // 1. Get user ID (from auth context)
    const userId = 'user-123';
    const userEmail = 'john@example.com';
    const userName = 'John Doe';

    // 2. Prepare order data
    const orderData: OrderFormData = {
      // ... form fields ...
      fullName: 'John Doe',
      consent: true,
      // ... other fields ...
    };

    // 3. Save order
    console.log('📝 Saving order...');
    const result = await saveOrderToFirestore(userId, userEmail, userName, orderData);

    if (!result.success) {
      throw new Error('Failed to save order: ' + result.error);
    }

    const orderId = result.orderId;
    console.log('✅ Order saved with ID:', orderId);

    // 4. Retrieve the saved order
    console.log('📖 Retrieving order...');
    const savedOrder = await getOrderById(orderId);

    if (!savedOrder) {
      throw new Error('Failed to retrieve saved order');
    }

    console.log('✅ Order retrieved successfully');

    // 5. Update order status
    console.log('🔄 Updating order status...');
    const updateSuccess = await updateOrderStatus(
      orderId,
      'confirmed',
      'Order automatically confirmed'
    );

    if (updateSuccess) {
      console.log('✅ Order status updated');
    }

    // 6. Export order as JSON
    console.log('💾 Exporting order as JSON...');
    const jsonData = await exportOrderAsJson(orderId);

    if (jsonData) {
      console.log('✅ Order exported');
      console.log(jsonData);
    }

    console.log('🎉 Complete flow executed successfully!');
  } catch (error) {
    console.error('❌ Error in complete flow:', error);
  }
}

// ============================================================================
// Example 11: Using in React Component
// ============================================================================

/*
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

function OrderHistoryComponent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      try {
        const userOrders = await getUserOrders(user.uid);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2>Your Orders ({orders.length})</h2>
      {orders.map((order) => (
        <div key={order.orderId} className="order-card">
          <h3>{order.fullName}</h3>
          <p>Status: {order.status}</p>
          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Test Date: {order.preferredTestDate}</p>
        </div>
      ))}
    </div>
  );
}

// For more details, see: examples/ORDER_COMPONENT_EXAMPLE.tsx
*/

// ============================================================================
// Example 12: API Endpoint Usage
// ============================================================================

// Client-side code to submit order via API

async function submitOrderViaAPI(orderData: OrderFormData, userInfo: any) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderData,
        userInfo,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Order submitted via API');
      console.log('Order ID:', result.orderId);
      return result.orderId;
    } else {
      console.error('❌ API error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// ============================================================================
// Export all examples for reference
// ============================================================================

export {
  example1_SaveOrder,
  example2_GetUserOrders,
  example3_GetOrderById,
  example4_UpdateOrderStatus,
  example5_ExportOrderAsJson,
  example6_BackupUserOrders,
  example7_GetOrdersByStatus,
  example8_GetOrdersCounts,
  example9_DeleteOrder,
  example10_CompleteFlow,
  submitOrderViaAPI,
};
