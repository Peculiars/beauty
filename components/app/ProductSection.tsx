"use client";

import Link from "next/link";
import { useState } from "react";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";
import type {
  ALL_CATEGORIES_QUERYResult,
  FILTER_PRODUCTS_BY_NAME_QUERYResult,
} from "@/sanity.types";

interface ProductSectionProps {
  categories: ALL_CATEGORIES_QUERYResult;
  products: FILTER_PRODUCTS_BY_NAME_QUERYResult;
  searchQuery: string;
  priceRange: {
    min: number;
    max: number;
  };
  currentPage: number;
  hasMore: boolean;
  currentSearchParams: Record<string, string>;
}

export function ProductSection({
  categories,
  products,
  searchQuery,
  priceRange,
  currentPage,
  hasMore,
  currentSearchParams,
}: ProductSectionProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(currentSearchParams).forEach(([key, value]) => {
      if (!value || key === "page") return;
      params.set(key, value);
    });

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    return queryString ? `/?${queryString}` : "/";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with results count and filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing {products.length} {products.length === 1 ? "product" : "products"}
          {searchQuery && (
            <span>
              {" "}
              for &quot;<span className="font-medium">{searchQuery}</span>&quot;
            </span>
          )}
          {currentPage > 1 && <span> · Page {currentPage}</span>}
        </p>

        {/* Filter toggle button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 border-zinc-300 bg-white shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          aria-label={filtersOpen ? "Hide filters" : "Show filters"}
        >
          {filtersOpen ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="hidden sm:inline">Hide Filters</span>
              <span className="sm:hidden">Hide</span>
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Show Filters</span>
              <span className="sm:hidden">Filters</span>
            </>
          )}
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filters - completely hidden when collapsed on desktop */}
        <aside
          className={`shrink-0 transition-all duration-300 ease-in-out ${
            filtersOpen ? "w-full lg:w-72 lg:opacity-100" : "hidden lg:hidden"
          }`}
        >
          <ProductFilters categories={categories} products={products} priceRange={priceRange} />
        </aside>

        {/* Product Grid - expands to full width when filters hidden */}
        <main className="flex-1 transition-all duration-300">
          <ProductGrid products={products} />

          <div className="mt-8 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm shadow-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
            <p>
              Page {currentPage} · {products.length} item{products.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {currentPage > 1 && (
                <Link href={buildPageHref(currentPage - 1)} className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">
                  Previous
                </Link>
              )}
              {hasMore && (
                <Link href={buildPageHref(currentPage + 1)} className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200">
                  Load More
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
