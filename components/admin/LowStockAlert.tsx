"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { client } from "@/sanity/lib/client";
function LowStockProductRow({ product }: { product: any }) {
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/administrator/inventory/${product._id}`}
      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <div className="h-10 w-10 overflow-hidden rounded-md bg-zinc-200 dark:bg-zinc-700">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={40}
            height={40}
            className="object-cover"
          />
        ) : (
          "?"
        )}
      </div>
      <p className="flex-1 truncate">{product.name}</p>
      <Badge variant={isOutOfStock ? "destructive" : "secondary"}>
        {isOutOfStock ? "Out of stock" : `${product.stock} left`}
      </Badge>
    </Link>
  );
}

function LowStockProductRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Skeleton className="h-10 w-10 rounded-md" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

function LowStockAlertContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      const data = await client.fetch(`
        *[_type == "product" && stock <= 5] | order(stock asc) {
          _id,
          name,
          stock,
          "image": images[0].asset->url
        }
      `);
      setProducts(data);
      setLoading(false);
    };
    fetchLowStock();
  }, []);

  if (loading) return <LowStockAlertSkeleton />;

  if (!products.length)
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <span className="text-2xl">✓</span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          All products are well stocked!
        </p>
      </div>
    );

  return (
    <div className="space-y-2">
      {products.slice(0, 5).map((product) => (
        <LowStockProductRow key={product._id} product={product} />
      ))}
      {products.length > 5 && (
        <Link
          href="/administrator/inventory?filter=low-stock"
          className="block text-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          View all {products.length} low stock items →
        </Link>
      )}
    </div>
  );
}

function LowStockAlertSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <LowStockProductRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function LowStockAlert() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Low Stock Alerts
        </h2>
      </div>
      <div className="p-4">
        <LowStockAlertContent />
      </div>
    </div>
  );
}