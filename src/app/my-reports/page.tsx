'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface UserReport {
  reportId: string;
  orderId: string;
  title: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  summary?: string;
}

export default function MyReportsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/user-reports', {
          method: 'GET',
          headers: {
            'x-user-id': user.uid,
            'x-user-email': user.email || '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReports(data.reports || []);
        } else {
          setReportError('Failed to load reports');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        setReportError('Error loading reports');
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'generating':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || (!user && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your reports.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Health Reports</h1>
          <p className="mt-2 text-gray-600">
            View and download all your genetic analysis reports
          </p>
        </div>

        {/* Loading State */}
        {pageLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {reportError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{reportError}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!pageLoading && reports.length === 0 && !reportError && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No reports yet</h3>
            <p className="mt-2 text-gray-600">
              Complete a health assessment to generate your first report.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/order">Start Health Assessment</Link>
            </Button>
          </div>
        )}

        {/* Reports Grid */}
        {!pageLoading && reports.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.reportId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(report.status)}
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(report.status)} variant="outline">
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(report.generatedAt), 'MMM dd, yyyy')}
                  </div>
                </CardHeader>
                <CardContent>
                  {report.summary && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {report.summary}
                    </p>
                  )}
                  <div className="flex space-x-2">
                    <Button size="sm" asChild className="flex-1">
                      <Link href={`/result/${report.orderId}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Link>
                    </Button>
                    {report.status === 'completed' && (
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics Summary */}
        {!pageLoading && reports.length > 0 && (
          <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {reports.length}
                </div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {reports.filter(r => r.status === 'generating').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}