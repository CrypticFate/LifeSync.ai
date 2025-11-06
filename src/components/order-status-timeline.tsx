'use client';

import { Order } from '@/types/order';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderStatusTimelineProps {
  order: Order;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  order,
}) => {
  const getStatusDate = (status: string, createdAt: string, updatedAt: string) => {
    if (status === 'pending') return createdAt;
    if (status === 'completed' || status === 'cancelled') return updatedAt;
    return updatedAt;
  };

  const statuses: Array<{
    key: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      key: 'confirmed',
      label: 'Order Confirmed',
      description: 'Your order has been confirmed by our team',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    {
      key: 'completed',
      label: 'Completed',
      description: 'Your order is complete',
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
  ];

  const cancelledStatus = {
    key: 'cancelled' as const,
    label: 'Cancelled',
    description: 'Your order has been cancelled',
    icon: <XCircle className="h-5 w-5" />,
  };

  const isCancelled = order.status === 'cancelled';
  const timelineStatuses = isCancelled ? [cancelledStatus] : statuses;

  const getStatusIndex = (currentStatus: string) => {
    const index = timelineStatuses.findIndex((s) => s.key === currentStatus);
    return index !== -1 ? index : 0;
  };

  const currentIndex = getStatusIndex(order.status);

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-lg font-semibold">Order Progress</h3>

      <div className="space-y-6">
        {timelineStatuses.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          const statusDate =
            isCurrent || isCompleted
              ? getStatusDate(status.key, order.createdAt, order.updatedAt)
              : null;
          const formattedDate = statusDate
            ? format(new Date(statusDate), 'MMM dd, yyyy hh:mm a')
            : null;

          return (
            <div key={status.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2',
                    isCompleted || isCurrent
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-300 bg-gray-50 text-gray-400'
                  )}
                >
                  {status.icon}
                </div>
                {index < timelineStatuses.length - 1 && (
                  <div
                    className={cn(
                      'mt-2 h-12 w-0.5',
                      isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    )}
                  />
                )}
              </div>

              <div className="flex-1 pt-1">
                <div
                  className={cn(
                    'font-semibold',
                    isCompleted || isCurrent
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                >
                  {status.label}
                </div>
                <p className="text-sm text-gray-600">{status.description}</p>
                {formattedDate && (
                  <p className="mt-1 text-xs text-gray-500">{formattedDate}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
