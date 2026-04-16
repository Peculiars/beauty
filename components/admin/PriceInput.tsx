"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { client } from "@/sanity/lib/client";


interface PriceInputProps {
  documentId: string;
}

export function PriceInput({ documentId }: PriceInputProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current price
  useEffect(() => {
    const fetchPrice = async () => {
      const data = await client.fetch<number>(
        `*[_type == "product" && _id == $id][0].price`,
        { id: documentId }
      );
      setPrice(data ?? 0);
    };
    fetchPrice();
  }, [documentId]);

  const handleChange = async (value: number) => {
    setPrice(value);
    setIsUpdating(true);
    try {
      await client.patch(documentId).set({ price: value }).commit();
    } catch (err) {
      console.error("Failed to update price:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (price === null) return <Skeleton className="h-8 w-24" />;

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-zinc-500">₦</span>
      <Input
        type="number"
        min={0}
        step={0.01}
        value={price}
        onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
        className="h-8 w-24 text-right"
        disabled={isUpdating}
      />
    </div>
  );
}