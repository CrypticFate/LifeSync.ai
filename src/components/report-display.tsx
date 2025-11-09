'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Heart,
  Dna,
  Brain,
  Activity
} from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import { format } from 'date-fns';

interface Report {
  reportId: string;
  orderId: string;
  userName: string;
  userEmail: string;
  generatedAt: string;
  updatedAt: string;
  status: 'generating' | 'completed' | 'failed';
  title: string;
  summary: string;
  sections: Array<{ title: string; content: string }>;
  recommendations: string[];
  conclusions: string;
  fullContent: string;
  error?: string;
}

interface ReportDisplayProps {
  report: Report | null;
  loading?: boolean;
  error?: string;
  userName?: string;
  orderId?: string;
  onDownload?: () => void;
  onAdvancedSuggestions?: () => void;
  onSeekConsultation?: () => void;
  showActionButtons?: boolean;
}

export function ReportDisplay({ 
  report, 
  loading = false, 
  error, 
  userName, 
  orderId,
  onDownload,
  onAdvancedSuggestions,
  onSeekConsultation,
  showActionButtons = true
}: ReportDisplayProps) {
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          No report available yet. Your report will appear here once analysis is complete.
        </AlertDescription>
      </Alert>
    );
  }

  // Extract risk indicators from content for quick overview
  const extractRiskLevels = (content: string) => {
    const risks = [];
    const riskPatterns = [
      /Sleep.*Risk Level:\*\*\s*(LOW|MODERATE|HIGH|URGENT)/i,
      /Cardiovascular.*Risk Level:\*\*\s*(LOW|MODERATE|HIGH|URGENT)/i,
      /Metabolic.*Risk Level:\*\*\s*(LOW|MODERATE|HIGH|URGENT)/i,
      /Digestive.*Risk Level:\*\*\s*(LOW|MODERATE|HIGH|URGENT)/i,
      /Cancer.*Risk Level:\*\*\s*(LOW|MODERATE|HIGH|URGENT)/i,
      /Neurological.*Risk Level:\*\*\s*(LOW|MODERATE|HIGH|URGENT)/i,
    ];

    const categories = ['Sleep', 'Cardiovascular', 'Metabolic', 'Digestive', 'Cancer', 'Neurological'];
    
    riskPatterns.forEach((pattern, index) => {
      const match = content.match(pattern);
      if (match) {
        risks.push({
          category: categories[index],
          level: match[1].toUpperCase()
        });
      }
    });
    
    return risks;
  };

  const riskLevels = extractRiskLevels(report.fullContent);
  
  const getRiskBadgeColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const hasUrgentConcerns = report.fullContent.toLowerCase().includes('urgent') || 
                           riskLevels.some(r => r.level === 'URGENT');

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Dna className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-2xl text-blue-900">
                  Health Analysis Report
                </CardTitle>
                <p className="text-blue-700">
                  Generated on {format(new Date(report.generatedAt), 'PPP p')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge 
                className={
                  report.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-gray-100 text-gray-800'
                }
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {report.status === 'completed' ? 'Complete' : report.status}
              </Badge>
              {onDownload && (
                <Button size="sm" variant="outline" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Risk Overview Dashboard */}
      {riskLevels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Risk Assessment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {riskLevels.map((risk, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {risk.category}
                  </span>
                  <Badge className={getRiskBadgeColor(risk.level)} variant="outline">
                    {risk.level}
                  </Badge>
                </div>
              ))}
            </div>
            {hasUrgentConcerns && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Urgent concerns identified.</strong> Please consult with a healthcare provider promptly.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Report Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-700" />
            Comprehensive Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownRenderer 
            content={report.fullContent} 
            className="max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {showActionButtons && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Take Action on Your Results
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-slate-700 hover:bg-slate-800 text-white px-8 py-3 text-base font-medium shadow-sm"
                  onClick={onAdvancedSuggestions}
                  disabled={!onAdvancedSuggestions}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Advanced Suggestions
                </Button>
                <Button 
                  variant="outline"
                  className="border-slate-600 text-slate-700 hover:bg-slate-50 hover:text-slate-800 px-8 py-3 text-base font-medium shadow-sm"
                  onClick={onSeekConsultation}
                  disabled={!onSeekConsultation}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Seek Consultation
                </Button>
              </div>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Get personalized AI-powered recommendations or connect with healthcare professionals for detailed consultation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Metadata */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Report ID: {report.reportId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span>Generated for: {report.userName}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              <strong>Important:</strong> This report is for informational purposes only. 
              Always consult with qualified healthcare professionals before making medical decisions based on these results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}