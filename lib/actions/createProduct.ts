"use server";

import { writeClient } from "@/sanity/lib/client";

export async function createProduct() {
  const newId = crypto.randomUUID();

  await writeClient.create({
    _id: newId,
    _type: "product",
    name: "New Product",
    stock: 0,
    price: 0,
    slug: {
      _type: "slug",
      current: `product-${newId.slice(0, 8)}`,
    },
  });

  return newId;
}