'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
    },
    confirmed: {
      label: 'Confirmed',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: CheckCircle2,
    },
    completed: {
      label: 'Completed',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn('flex items-center gap-2', config.color, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};
