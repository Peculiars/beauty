"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ORDER_STATUS_CONFIG,
  getOrderStatus,
  type OrderStatusValue,
} from "@/lib/constants/orderStatus";
import { client } from "@/sanity/lib/client";
import { updateOrderStatus } from "@/lib/actions/updateOrderStatus";

interface StatusSelectProps {
  documentId: string;
  documentType?: string; // Optional, can be used for future extensions
}

function StatusSelectContent({ documentId }: StatusSelectProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatusValue>("paid");
  const [loading, setLoading] = useState(true);

  // Fetch the current status from Sanity
  useEffect(() => {
    async function fetchStatus() {
      try {
        const status = await client.fetch<string>(
          `*[_id == $id][0].status`,
          { id: documentId }
        );
        if (status) setCurrentStatus(status as OrderStatusValue);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [documentId]);

  const handleStatusChange = async (value: string) => {
    setCurrentStatus(value as OrderStatusValue);
    // Call server action to update status
    try {
      await updateOrderStatus(documentId, value);
    } catch (error) {
      console.error("Failed to update status:", error);
      setCurrentStatus(currentStatus); // Revert on error
    }
  };

  if (loading) return <StatusSelectSkeleton />;

  const statusConfig = getOrderStatus(currentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            {statusConfig.label}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => {
          const Icon = config.icon;
          return (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {config.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

function StatusSelectSkeleton() {
  return <Skeleton className="h-10 w-[180px]" />;
}

export function StatusSelect(props: StatusSelectProps) {
  return (
    <Suspense fallback={<StatusSelectSkeleton />}>
      <StatusSelectContent {...props} />
    </Suspense>
  );
}