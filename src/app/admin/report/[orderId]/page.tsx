'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/contexts/admin-context';
import { getOrderById, getReportByOrderId, saveReportToFirestore, updateReportStatus } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Loader,
  ArrowLeft,
  Copy,
  Brain,
  Zap,
  BarChart3,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { MarkdownRenderer } from '@/components/markdown-renderer';

interface Order {
  orderId: string;
  userId: string;
  userName: string;
  userEmail: string;
  [key: string]: any;
}

interface Report {
  id?: string;
  reportId: string;
  orderId: string;
  userName: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  title: string;
  summary: string;
  sections: Array<{ title: string; content: string }>;
  recommendations: string[];
  conclusions: string;
  fullContent: string;
  error?: string;
}

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin, adminUser, loading: adminLoading } = useAdmin();
  const { toast } = useToast();

  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handler functions for action buttons
  const handleAdvancedSuggestions = () => {
    toast({
      title: 'Advanced Suggestions',
      description: 'Generating AI-powered personalized recommendations...',
    });
    
    // TODO: Implement advanced suggestions functionality
    // This could generate additional AI insights, personalized meal plans,
    // exercise routines, supplement recommendations, etc.
    console.log('Advanced Suggestions clicked for order:', orderId);
    
    // For now, show a placeholder
    setTimeout(() => {
      toast({
        title: 'Feature Coming Soon',
        description: 'Advanced AI suggestions will be available in the next update.',
      });
    }, 2000);
  };

  const handleSeekConsultation = () => {
    toast({
      title: 'Consultation Request',
      description: 'Connecting you with healthcare professionals...',
    });
    
    // TODO: Implement consultation booking functionality
    // This could integrate with calendaring systems, telemedicine platforms,
    // or healthcare provider networks
    console.log('Seek Consultation clicked for order:', orderId);
    
    // For now, show a placeholder
    setTimeout(() => {
      toast({
        title: 'Consultation Booking',
        description: 'You will be redirected to our consultation booking system shortly.',
      });
    }, 2000);
  };

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, adminLoading, router]);

  // Fetch order and check for existing report
  useEffect(() => {
    if (!orderId || !isAdmin) return;

    const fetchOrderAndReport = async () => {
      try {
        setLoading(true);

        // First, fetch all admin orders to find this order
        const { getAdminOrders } = await import('@/lib/firestore');
        const allOrders = await getAdminOrders(1000);
        const foundOrder = allOrders.find((o) => o.orderId === orderId);

        if (!foundOrder) {
          toast({
            title: 'Error',
            description: 'Order not found',
            variant: 'destructive',
          });
          router.push('/admin/dashboard');
          return;
        }

        setOrder(foundOrder);

        // Always generate a fresh report when the page loads
        // This ensures the loading screen shows and API is called every time
        await generateReport(foundOrder);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndReport();
  }, [orderId, isAdmin]);

  // Generate report using Gemini API
  const generateReport = async (orderData: Order) => {
    try {
      console.log('\n📱 [CLIENT] Starting report generation...');
      console.log(`📱 [CLIENT] Order ID: ${orderData.orderId}`);
      console.log(`📱 [CLIENT] User: ${orderData.userName}`);
      
      setGenerating(true);
      setLoading(false); // Stop showing skeleton - we're ready to show content

      // Create placeholder report in Firestore
      const placeholderReport: Report = {
        reportId: `report-${orderId}-${Date.now()}`,
        orderId: orderData.orderId,
        userName: orderData.userName,
        generatedAt: new Date().toISOString(),
        status: 'generating',
        title: 'Generating Your Personalized Health Analysis Report...',
        summary: 'Please wait while your report is being generated.',
        sections: [],
        recommendations: [],
        conclusions: '',
        fullContent: '',
      };

      // Save placeholder
      console.log('📱 [CLIENT] Saving placeholder report to Firestore...');
      const reportId = await saveReportToFirestore(orderData.userId, placeholderReport);
      console.log(`📱 [CLIENT] Placeholder saved with ID: ${reportId}`);
      
      // Set the placeholder report to show loading screen immediately
      setReport(placeholderReport);
      console.log('📱 [CLIENT] Loading screen displayed');

      // Call the report generation API
      console.log('📱 [CLIENT] Calling /api/reports/generate endpoint...');
      const apiCallStart = Date.now();
      
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.orderId,
          orderData: orderData,
          userName: orderData.userName,
          userEmail: orderData.userEmail,
        }),
      });

      const apiCallDuration = Date.now() - apiCallStart;
      console.log(`📱 [CLIENT] API response received in ${apiCallDuration}ms`);
      console.log(`📱 [CLIENT] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`📱 [CLIENT] API error: ${response.statusText}`);
        console.error(`📱 [CLIENT] Error details:`, errorBody);
        throw new Error(`API error: ${response.statusText} - ${errorBody.error}`);
      }

      console.log('📱 [CLIENT] Parsing API response...');
      const { report: generatedReport } = await response.json();

      console.log('📱 [CLIENT] API Response structure:');
      console.log(`   ✓ Report ID: ${generatedReport.reportId}`);
      console.log(`   ✓ Status: ${generatedReport.status}`);
      console.log(`   ✓ Sections: ${generatedReport.sections?.length || 0}`);
      console.log(`   ✓ Recommendations: ${generatedReport.recommendations?.length || 0}`);

      // Save the generated report
      console.log('📱 [CLIENT] Saving final report to Firestore...');
      const finalReport = {
        ...generatedReport,
        id: reportId,
      };

      await saveReportToFirestore(orderData.userId, finalReport);
      console.log('📱 [CLIENT] Report saved to Firestore');
      
      setReport(finalReport);
      console.log('📱 [CLIENT] Report displayed on UI');

      toast({
        title: 'Success',
        description: 'Report generated successfully!',
      });
    } catch (error) {
      console.error('❌ [CLIENT] Error generating report');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   Error type: ${error?.constructor?.name || 'Unknown'}`);
      console.error(`   Error message: ${errorMessage}`);
      
      if (error instanceof Error && error.stack) {
        console.error(`   Stack trace: ${error.stack}`);
      }

      // Update status to failed
      if (order?.userId) {
        console.log(`📱 [CLIENT] Updating report status to failed in Firestore...`);
        await updateReportStatus(order.userId, `report-${orderId}-${Date.now()}`, 'failed', errorMessage);
        console.log(`📱 [CLIENT] Report status updated to failed`);
      }

      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Download report as PDF/Text
  const downloadReport = () => {
    if (!report) return;

    const content = `
${report.title}
Generated: ${format(new Date(report.generatedAt), 'PPP p')}
Patient: ${report.userName}

EXECUTIVE SUMMARY
${report.summary}

---

${report.sections.map((section) => `${section.title}\n${section.content}`).join('\n\n---\n\n')}

---

RECOMMENDATIONS
${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

CONCLUSIONS
${report.conclusions}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `report-${orderId}-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: 'Success',
      description: 'Report downloaded successfully!',
    });
  };

  // Copy report to clipboard
  const copyToClipboard = () => {
    if (!report) return;

    const content = `
${report.title}
Generated: ${format(new Date(report.generatedAt), 'PPP p')}

${report.summary}

${report.sections.map((section) => `${section.title}\n${section.content}`).join('\n\n')}

RECOMMENDATIONS:
${report.recommendations.map((rec) => `• ${rec}`).join('\n')}

${report.conclusions}
    `;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    toast({
      title: 'Success',
      description: 'Report copied to clipboard!',
    });
  };

  const statusColor = {
    generating: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
  };

  const statusBadgeVariant = {
    generating: 'default' as const,
    completed: 'default' as const,
    failed: 'destructive' as const,
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="space-y-6">
            {/* Animated header skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-64 rounded-lg bg-blue-100 animate-pulse" />
              <Skeleton className="h-4 w-96 rounded-lg bg-blue-50 animate-pulse" />
            </div>

            {/* Card skeleton */}
            <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 rounded-lg bg-blue-100 animate-pulse" />
                <Skeleton className="h-8 w-32 rounded-lg bg-blue-50 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
                <Skeleton className="h-16 rounded-lg bg-blue-50 animate-pulse" />
              </div>
            </div>

            {/* Report content skeleton */}
            <Skeleton className="h-96 rounded-lg bg-blue-50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Order not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Report Status - Only show when completed or failed */}
        {report && (report.status === 'completed' || report.status === 'failed') && (
          <div className={`mb-6 p-4 border rounded-lg ${statusColor[report.status]}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {report.status === 'completed' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Report Ready</h3>
                      <p className="text-sm text-gray-600">
                        Generated on {format(new Date(report.generatedAt), 'PPP p')}
                      </p>
                    </div>
                  </>
                )}
                {report.status === 'failed' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-semibold">Report Generation Failed</h3>
                      <p className="text-sm text-gray-600">
                        {report.error || 'An error occurred while generating the report'}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={statusBadgeVariant[report.status]}>
                {report.status === 'completed' ? 'completed' : 'failed'}
              </Badge>
            </div>
          </div>
        )}

        {/* AI Analyzer Screen - Show while generating */}
        {report && report.status === 'generating' && (
          <div className="mb-6">
            <Card className="bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 overflow-hidden">
              <CardContent className="p-12">
                {/* AI Brain Icon with Animation */}
                <div className="flex justify-center mb-12">
                  <div className="relative w-32 h-32">
                    {/* Rotating outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
                    
                    {/* Middle ring - slower rotation */}
                    <div className="absolute inset-4 rounded-full border-3 border-transparent border-b-pink-500 border-l-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                    
                    {/* Brain icon center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Brain className="w-16 h-16 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Simple loading text */}
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Generating Your Report
                  </h2>
                  <p className="text-gray-600">
                    Please wait while your personalized analysis is being created...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Order Information Card - Only show when not generating */}
        {report && report.status !== 'generating' && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Health Analysis Report
                  </CardTitle>
                </div>
                {report && report.status === 'completed' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadReport}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient Name</p>
                  <p className="font-semibold">{order.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-sm">{order.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{order.age || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report Content */}
        {report && report.status === 'completed' && (
          <>
            {/* Executive Summary */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={report.summary} className="prose-sm" />
              </CardContent>
            </Card>

            {/* Report Sections */}
            {report.sections
              .filter(section => {
                const lowerTitle = section.title.toLowerCase();
                return !lowerTitle.includes('key recommendations') &&
                       !lowerTitle.includes('recommendations') &&
                       !lowerTitle.includes('personalized wellness plan') &&
                       !lowerTitle.includes('urgent medical concerns') &&
                       !lowerTitle.includes('conclusions') &&
                       !lowerTitle.includes('executive summary') &&
                       lowerTitle !== 'personalized health analysis report' &&
                       section.content.trim().length > 20;
              })
              .map((section, index) => (
              <Card key={index} className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownRenderer content={section.content} className="prose-sm" />
                </CardContent>
              </Card>
            ))}

            {/* Recommendations */}
            <Card className="mb-6 bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Key Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Try to extract Key Recommendations section from full content
                  const fullContent = report.fullContent;
                  
                  // Try different possible section headers
                  const patterns = [
                    /## Key Recommendations\s*([\s\S]*?)(?=\n## |\n# |$)/i,
                    /Key Recommendations:\s*([\s\S]*?)(?=\n## |\n# |$)/i,
                    /## Recommendations\s*([\s\S]*?)(?=\n## |\n# |$)/i,
                    /Recommendations:\s*([\s\S]*?)(?=\n## |\n# |$)/i
                  ];
                  
                  for (const pattern of patterns) {
                    const match = fullContent.match(pattern);
                    if (match && match[1]) {
                      const content = match[1].trim();
                      if (content.length > 10) {
                        return <MarkdownRenderer content={content} className="prose-sm" />;
                      }
                    }
                  }
                  
                  // Fallback to the parsed recommendations array
                  if (report.recommendations && report.recommendations.length > 0) {
                    return (
                      <ul className="space-y-2">
                        {report.recommendations.slice(0, 6).map((rec, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="font-semibold text-green-700 shrink-0">
                              {index + 1}.
                            </span>
                            <span className="text-gray-700 text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  
                  // Final fallback
                  return (
                    <div className="text-gray-600 italic text-sm">
                      <p>Recommendations are integrated within the health assessment sections above.</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Urgent Concerns */}
            {(() => {
              const urgentConcerns = report.sections.find(section => 
                section.title.toLowerCase().includes('urgent') ||
                section.title.toLowerCase().includes('medical concerns')
              );
              
              if (urgentConcerns && urgentConcerns.content.trim().length > 10) {
                return (
                  <Card className="mb-6 bg-red-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-900 flex items-center gap-2">
                        ⚠️ Urgent Medical Concerns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownRenderer content={urgentConcerns.content} className="prose-sm" />
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Wellness Plan */}
            {(() => {
              const wellnessPlan = report.sections.find(section => 
                section.title.toLowerCase().includes('wellness plan') ||
                section.title.toLowerCase().includes('personalized wellness')
              );
              
              if (wellnessPlan) {
                return (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">Personalized Wellness Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownRenderer content={wellnessPlan.content} className="prose-sm" />
                    </CardContent>
                  </Card>
                );
              }
              return null;
            })()}

            {/* Conclusions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Conclusions</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownRenderer content={report.conclusions} className="prose-sm" />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Next Steps for Patient
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 text-base font-medium shadow-sm"
                      onClick={() => handleAdvancedSuggestions()}
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Advanced Suggestions
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-slate-600 text-slate-700 hover:bg-slate-50 hover:text-slate-800 px-8 py-3 text-base font-medium shadow-sm"
                      onClick={() => handleSeekConsultation()}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Seek Consultation
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                    Get personalized recommendations based on AI analysis or connect with healthcare professionals for detailed consultation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {report && report.status === 'failed' && (
          <Card>
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {report.error || 'Failed to generate report. Please try again.'}
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => generateReport(order)}
                className="mt-4 w-full"
              >
                Retry Report Generation
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
