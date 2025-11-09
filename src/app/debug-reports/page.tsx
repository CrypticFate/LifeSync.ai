'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

// Quick debug component to check report data
export default function DebugReports() {
  const [user] = useAuthState(auth);
  const [reportData, setReportData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkReports = async () => {
      if (!user) return;

      try {
        console.log('🔍 Starting debug check for user:', user.uid);

        // Check user reports
        const userReportsResponse = await fetch('/api/user-reports', {
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });
        
        if (userReportsResponse.ok) {
          const userReportsData = await userReportsResponse.json();
          console.log('📊 User reports data:', userReportsData);
          setReportData(userReportsData);
        } else {
          console.log('❌ User reports failed:', userReportsResponse.status);
          setError('Failed to fetch user reports');
        }

        // Check orders
        const ordersResponse = await fetch('/api/orders', {
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });

        if (ordersResponse.ok) {
          const ordersResponseData = await ordersResponse.json();
          console.log('📋 Orders data:', ordersResponseData);
          setOrdersData(ordersResponseData);
          
          // Try to get a specific report for each order
          if (ordersResponseData.data && ordersResponseData.data.length > 0) {
            for (const order of ordersResponseData.data) {
              console.log(`🔍 Checking report for order: ${order.orderId} (status: ${order.status}, stage: ${order.trackingStage})`);
              
              try {
                const specificReportResponse = await fetch(`/api/reports/${order.orderId}`, {
                  headers: {
                    'x-user-id': user.uid,
                    'x-user-email': user.email || '',
                  },
                });
                
                if (specificReportResponse.ok) {
                  const specificReportData = await specificReportResponse.json();
                  console.log(`📄 Found report for order ${order.orderId}:`, specificReportData);
                } else {
                  console.log(`❌ No report found for order ${order.orderId}:`, specificReportResponse.status);
                }
              } catch (err) {
                console.log(`❌ Error fetching report for order ${order.orderId}:`, err);
              }
            }
          }
        } else {
          console.log('❌ Orders failed:', ordersResponse.status);
        }
      } catch (err) {
        console.error('❌ Debug error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkReports();
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Reports</h1>
        <p>Please sign in to debug reports</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Reports</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">User Info:</h3>
          <p>User ID: {user.uid}</p>
          <p>Email: {user.email}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Orders Data:</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(ordersData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold mb-2">User Reports Data:</h3>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-100 rounded">
        <h3 className="font-semibold mb-2">Quick Actions:</h3>
        <div className="space-y-2">
          {ordersData?.data?.map((order: any) => (
            <div key={order.orderId} className="flex items-center gap-4">
              <span className="text-sm">Order: {order.orderId}</span>
              <span className="text-xs bg-white px-2 py-1 rounded">
                Status: {order.status} | Stage: {order.trackingStage}
              </span>
              <a 
                href={`/result/${order.orderId}`}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View Result
              </a>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Check the browser console for detailed logs.
      </div>
    </div>
  );
}