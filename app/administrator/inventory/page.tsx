"use client";

import { Suspense, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody } from "@/components/ui/table";
import {
  ProductRow,
  ProductRowSkeleton,
  AdminSearch,
  useProductSearchFilter,
  ProductTableHeader,
} from "@/components/admin";
import { fetchAdminProducts } from "@/lib/actions/AdminProductActions";
import { createProduct } from "@/lib/actions/createProduct";

interface Product {
  _id: string;
  name: string;
  stock: number;
  price: number;
  slug: string | null;
}

async function fetchProducts(filter?: string, limit = 20, offset = 0) {
  return await fetchAdminProducts(filter, limit, offset);
}

function ProductListContent({
  filter,
  onCreateProduct,
  isCreating,
}: {
  filter?: string;
  onCreateProduct: () => void;
  isCreating: boolean;
}) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts(filter, 20, 0).then((data) => {
      setProducts(data);
      setHasMore(data.length === 20);
      setOffset(20);
      setIsLoading(false);
    });
  }, [filter]);

  const loadMore = () => {
    setIsLoading(true);
    fetchProducts(filter, 20, offset).then((data) => {
      setProducts((prev) => [...(prev || []), ...data]);
      setHasMore(data.length === 20);
      setOffset((prev) => prev + 20);
      setIsLoading(false);
    });
  };

  // Show skeleton while loading on initial load
  if (isLoading && (!products || products.length === 0)) {
    return <ProductListSkeleton />;
  }

  // Show empty state only when not loading and no products
  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title={filter ? "No products found" : "No products yet"}
        description={
          filter
            ? "Try adjusting your search terms."
            : "Get started by adding your first product."
        }
        action={
          !filter
            ? {
                label: "Add Product",
                onClick: onCreateProduct,
                disabled: isCreating,
                icon: isCreating ? Loader2 : Plus,
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <ProductTableHeader />
          <TableBody>
            {products.map((product) => (
              <ProductRow key={product._id} documentId={product._id} />
            ))}
          </TableBody>
        </Table>
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
}

function ProductListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <Table>
        <ProductTableHeader />
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <ProductRowSkeleton key={i} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function InventoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { filter, isSearching } = useProductSearchFilter(searchQuery);

  const handleCreateProduct = () => {
    startTransition(async () => {
      setIsCreating(true);
      try {
        const newId = await createProduct();
        setIsCreating(false);
        router.push(`/administrator/inventory/${newId}`);
      } catch (error) {
        console.error("Failed to create product:", error);
        setIsCreating(false);
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 sm:text-base">
            Manage your product stock and pricing
          </p>
        </div>
        <Button
          onClick={handleCreateProduct}
          disabled={isPending || isCreating}
          className="w-full sm:w-auto"
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Product
        </Button>
      </div>

      <AdminSearch
        placeholder="Search products..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="w-full sm:max-w-sm"
      />

      {isSearching ? (
        <ProductListSkeleton />
      ) : (
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductListContent
            filter={filter}
            onCreateProduct={handleCreateProduct}
            isCreating={isCreating}
          />
        </Suspense>
      )}
    </div>
  );
}