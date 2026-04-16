"use server";

import { writeClient } from "@/sanity/lib/client";

export interface AdminProduct {
  _id: string;
  name: string;
  stock: number;
  price: number;
  slug: string | null;
}

/**
 * Fetch products for admin inventory (includes both published and draft)
 * Uses writeClient to see all versions of products
 */
export async function fetchAdminProducts(
  filter?: string,
  limit = 20,
  offset = 0
): Promise<AdminProduct[]> {
  const groq = `*[_type == "product"${filter ? ` && ${filter}` : ""}] | order(_updatedAt desc) [${offset}...${offset + limit}]{
    _id,
    name,
    stock,
    price,
    "slug": slug.current
  }`;
  return await writeClient.fetch<AdminProduct[]>(groq);
}

/**
 * Get the total count of products for pagination
 */
export async function getProductCount(filter?: string): Promise<number> {
  const groq = `count(*[_type == "product"${filter ? ` && ${filter}` : ""}])`;
  return await writeClient.fetch<number>(groq);
}
