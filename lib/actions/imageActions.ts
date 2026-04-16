"use server";

import { writeClient } from "@/sanity/lib/client";

/**
 * Upload an image file to Sanity and return the asset ID
 */
export async function uploadImageAsset(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const asset = await writeClient.assets.upload("image", file, {
    filename: file.name,
  });

  return asset._id;
}

/**
 * Save the full images array to a document
 */
export async function saveProductImages(
  documentId: string,
  images: Array<{ _type: "image"; _key: string; asset: { _type: "reference"; _ref: string } }>
): Promise<void> {
  await writeClient.patch(documentId).set({ images }).commit();
}