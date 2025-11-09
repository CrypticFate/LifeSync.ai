/**
 * Get User Reports API Endpoint
 * GET /api/user-reports - Get all reports for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserReports } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
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

    // Fetch user reports from Firestore
    const reports = await getUserReports(userId);

    // Transform reports for dropdown display
    const formattedReports = reports.map(report => ({
      reportId: report.reportId,
      orderId: report.orderId,
      title: report.title || 'Health Analysis Report',
      generatedAt: report.generatedAt,
      status: report.status || 'completed',
      summary: report.summary ? report.summary.substring(0, 100) + '...' : ''
    }));

    return NextResponse.json(
      {
        success: true,
        message: 'Reports retrieved successfully',
        reports: formattedReports,
        count: formattedReports.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching user reports',
        error: error instanceof Error ? error.message : 'Unknown error',
        reports: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}