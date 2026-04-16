"use server";

import { writeClient } from "@/sanity/lib/client";

export interface CreateCategoryInput {
  title: string;
  slug: string;
}

export async function createCategory(input: CreateCategoryInput) {
  try {
    const newCategory = await writeClient.create({
      _type: "category",
      title: input.title,
      slug: {
        _type: "slug",
        current: input.slug,
      },
    });

    return {
      _id: newCategory._id,
      title: input.title,
      slug: input.slug,
    };
  } catch (error) {
    console.error("Failed to create category:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create category"
    );
  }
}
