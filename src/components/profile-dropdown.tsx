'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User as UserIcon, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserReport {
  reportId: string;
  orderId: string;
  title: string;
  generatedAt: string;
  status: 'generating' | 'completed' | 'failed';
}

export default function ProfileDropdown() {
  const [user, setUser] = useState<User | null>(null);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserReports(user);
      } else {
        setUserReports([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserReports = async (user: User) => {
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
        setUserReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getReportStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button asChild>
        <Link href="/signin">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-2 rounded-full">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback className="bg-blue-600 text-white text-sm">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Reports Section */}
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          My Reports ({userReports.length})
        </DropdownMenuLabel>
        
        {userReports.length === 0 ? (
          <div className="px-2 py-3">
            <p className="text-sm text-gray-500 text-center">No reports available yet</p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Complete a health assessment to generate your first report
            </p>
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto">
            {userReports.slice(0, 5).map((report) => (
              <DropdownMenuItem key={report.reportId} asChild>
                <Link 
                  href={`/result/${report.orderId}`}
                  className="flex items-center justify-between w-full p-2 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getReportStatusIcon(report.status)}
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(report.generatedAt)}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={report.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {report.status}
                  </Badge>
                </Link>
              </DropdownMenuItem>
            ))}
            {userReports.length > 5 && (
              <DropdownMenuItem asChild>
                <Link href="/my-reports" className="text-sm text-blue-600 text-center py-2">
                  View All Reports ({userReports.length})
                </Link>
              </DropdownMenuItem>
            )}
          </div>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/order-tracking" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Track Orders</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}