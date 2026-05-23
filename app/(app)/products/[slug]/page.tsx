import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import {
  PRODUCT_BY_SLUG_QUERY,
  RELATED_PRODUCTS_BY_CATEGORY_QUERY,
} from "@/lib/sanity/queries/products";
import { ProductGallery } from "@/components/app/ProductGallery";
import { ProductInfo } from "@/components/app/ProductInfo";
import { ProductGrid } from "@/components/app/ProductGrid";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const { data: product } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!product) {
    notFound();
  }

  const relatedProductsResponse =
    product.category?.slug
      ? await sanityFetch({
          query: RELATED_PRODUCTS_BY_CATEGORY_QUERY,
          params: {
            categorySlug: product.category.slug,
            productId: product._id,
          },
        })
      : { data: [] };

  const relatedProducts = relatedProductsResponse.data ?? [];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <ProductInfo product={product} />
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                  Explore similar products
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  You may also like
                </h2>
              </div>
              {product.category?.slug && (
                <Link
                  href={`/?category=${product.category.slug}`}
                  className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                >
                  View all {product.category.title}
                </Link>
              )}
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
