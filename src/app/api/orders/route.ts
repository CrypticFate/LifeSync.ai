/**
 * Orders API Endpoint
 * POST /api/orders - Submit a new order (saved under user → orders)
 * GET /api/orders - Get user's orders from their subcollection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';
import { saveOrderToFirestore, getUserOrders } from '@/lib/firestore';
import { OrderFormData, OrderSubmissionResponse } from '@/types/order';

/**
 * POST /api/orders
 * Submit a new order - saves to users/{userId}/orders/{orderId}
 */
export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();
    const { orderData, userInfo } = body;

    // Validate input
    if (!orderData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order data is required',
          error: 'Missing orderData field',
        },
        { status: 400 }
      );
    }

    if (!userInfo || !userInfo.userId || !userInfo.userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'User information is required',
          error: 'Missing user information',
        },
        { status: 400 }
      );
    }

    // Save order to user's orders subcollection
    // Structure: users/{userId}/orders/{orderId}
    const result = await saveOrderToFirestore(
      userInfo.userId,
      userInfo.userEmail,
      userInfo.userName || userInfo.userEmail,
      orderData as OrderFormData
    );

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing order',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Get orders from user's orders subcollection
 * Query params: ?limit=50&status=pending
 * 
 * Database path: users/{userId}/orders/{orderId}
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from request headers
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User authentication required',
          error: 'Missing user ID in headers',
        },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Fetch user orders from their subcollection
    // Query: users/{userId}/orders
    const orders = await getUserOrders(userId, limit);

    return NextResponse.json(
      {
        success: true,
        message: 'Orders retrieved successfully from users subcollection',
        data: orders,
        total: orders.length,
        databasePath: `users/${userId}/orders`,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching orders',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
