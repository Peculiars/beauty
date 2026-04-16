"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FeaturedToggleProps {
  documentId: string;
}

export function FeaturedToggle({ documentId }: FeaturedToggleProps) {
  const [featured, setFeatured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch current value
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await client.fetch(
          `*[_id == $id][0]{ featured }`,
          { id: documentId }
        );
        setFeatured(data?.featured ?? false);
      } catch (err) {
        console.error("Failed to fetch featured:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [documentId]);

  // ✅ Toggle + save
  const handleToggle = async () => {
    if (featured === null) return;

    const newValue = !featured;

    // Optimistic UI
    setFeatured(newValue);
    setUpdating(true);

    try {
      await client
        .patch(documentId)
        .set({ featured: newValue })
        .commit();
    } catch (err) {
      console.error("Failed to update featured:", err);
      setFeatured(!newValue); // rollback
    } finally {
      setUpdating(false);
    }
  };

  if (loading || featured === null) {
    return <Skeleton className="h-8 w-8" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleToggle}
      disabled={updating}
      title={featured ? "Remove from featured" : "Add to featured"}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-colors",
          featured
            ? "fill-amber-400 text-amber-400"
            : "text-zinc-300 dark:text-zinc-600"
        )}
      />
    </Button>
  );
}