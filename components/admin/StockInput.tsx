"use client";

import { Suspense, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { client } from "@/sanity/lib/client";

interface StockInputProps {
  documentId: string;
  documentType?: string; // optional, in case you want to handle different types in the future
}

function StockInputContent({ documentId }: StockInputProps) {
  const [stockValue, setStockValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch current stock from Sanity
  useEffect(() => {
    async function fetchStock() {
      try {
        const stock = await client.fetch<number>(
          `*[_id == $id][0].stock`,
          { id: documentId }
        );
        if (stock !== undefined) setStockValue(stock);
      } finally {
        setLoading(false);
      }
    }
    fetchStock();
  }, [documentId]);

  const handleChange = async (value: number) => {
    setStockValue(value); // Optimistic update
    await client.patch(documentId).set({ stock: value }).commit();
  };

  const isLowStock = stockValue > 0 && stockValue <= 5;
  const isOutOfStock = stockValue === 0;

  if (loading) return <StockInputSkeleton />;

  return (
    <Input
      type="number"
      min={0}
      value={stockValue}
      onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
      className={cn(
        "h-8 w-20 text-center",
        isOutOfStock &&
          "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
        isLowStock &&
          "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
      )}
    />
  );
}

function StockInputSkeleton() {
  return <Skeleton className="h-8 w-20" />;
}

export function StockInput(props: StockInputProps) {
  return (
    <Suspense fallback={<StockInputSkeleton />}>
      <StockInputContent {...props} />
    </Suspense>
  );
}