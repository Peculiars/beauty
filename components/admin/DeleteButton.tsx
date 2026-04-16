"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { client } from "@/sanity/lib/client";
import { deleteProduct } from "@/lib/actions/deleteProduct";

interface DeleteButtonProps {
  documentId: string;
  documentType: string;
  redirectTo?: string;
}

export function DeleteButton({
  documentId,
  documentType,
  redirectTo = "/administrator/inventory",
}: DeleteButtonProps) {
  const router = useRouter();
  const baseId = documentId.replace("drafts.", "");

  const [loading, setLoading] = useState(true);
  const [referencingOrders, setReferencingOrders] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await client.fetch(
          `*[_type == "order" && references($id)]{ _id }`,
          { id: baseId }
        );
        setReferencingOrders(orders || []);
      } catch (err) {
        console.error("Failed to fetch delete data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this product permanently? This cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteProduct(documentId);
      router.push(redirectTo);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-9 w-20" />;
  }

  if (referencingOrders.length > 0) {
    const orderCount = referencingOrders.length;
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-1.5" asChild>
              <Link
                href={`/studio/structure/${documentType};${baseId}`}
                target="_blank"
              >
                <Trash2 className="h-4 w-4" />
                Delete in Studio
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              This product is referenced by {orderCount} order
              {orderCount !== 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      className="gap-1.5"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}