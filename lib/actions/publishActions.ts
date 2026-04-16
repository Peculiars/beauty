"use server";

import { writeClient } from "@/sanity/lib/client";

/**
 * Publish a document by copying the draft to the published ID.
 * Works for both drafts.xxx and non-draft IDs.
 */
export async function publishDocument(documentId: string): Promise<void> {
  const baseId = documentId.replace("drafts.", "");
  const draftId = documentId.startsWith("drafts.")
    ? documentId
    : `drafts.${documentId}`;

  // Fetch the draft if it exists, otherwise fetch the base doc
  const doc = await writeClient.fetch(
    `*[_id == $draftId || _id == $baseId][0]`,
    { draftId, baseId }
  );

  if (!doc) throw new Error("Document not found");

  // Write as the published (non-draft) ID
  const { _id: _omit, ...rest } = doc;
  await writeClient.createOrReplace({ ...rest, _id: baseId });

  // Delete the draft if it exists separately
  try {
    await writeClient.delete(draftId);
  } catch {
    // Draft may not exist — that's fine
  }
}

/**
 * Discard draft changes by deleting the drafts.xxx document.
 */
export async function revertDocument(documentId: string): Promise<void> {
  const draftId = documentId.startsWith("drafts.")
    ? documentId
    : `drafts.${documentId}`;
  await writeClient.delete(draftId);
}