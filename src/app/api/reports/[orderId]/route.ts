/**
 * Get Report by Order ID API Endpoint
 * GET /api/reports/[orderId] - Get generated report for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReportByOrderId } from '@/lib/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    
    // Get user ID from headers
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

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order ID is required',
          error: 'Missing orderId parameter',
        },
        { status: 400 }
      );
    }

    // Fetch report from Firestore
    const report = await getReportByOrderId(userId, orderId);

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: 'Report not found',
          error: 'No report found for this order',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Report retrieved successfully',
        data: report,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching report',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}