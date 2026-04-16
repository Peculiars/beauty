"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Check, Loader2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { publishDocument, revertDocument } from "@/lib/actions/publishActions";


interface PublishButtonProps {
  documentId: string;
  documentType?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  redirectTo?: string;
}

export function PublishButton({
  documentId,
  variant = "default",
  size = "default",
  redirectTo,
}: PublishButtonProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [justPublished, setJustPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      await publishDocument(documentId);
      setJustPublished(true);
      setTimeout(() => {
        setJustPublished(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
      }, 1500);
    } catch (err) {
      console.error("Failed to publish:", err);
      setError("Publish failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  if (justPublished) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className="min-w-[120px] border-green-500 text-green-600 dark:border-green-500 dark:text-green-400"
      >
        <Check className="mr-2 h-4 w-4" />
        Published!
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="destructive" size={size} disabled className="min-w-[120px]">
        {error}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePublish}
      disabled={isPublishing}
      className="min-w-[120px]"
    >
      {isPublishing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Publishing...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Publish
        </>
      )}
    </Button>
  );
}

// ============================================
// Revert Button — discards draft
// ============================================

interface RevertButtonProps {
  documentId: string;
  documentType?: string;
  size?: "default" | "sm" | "lg" | "icon";
  redirectTo?: string;
}

export function RevertButton({ documentId, size = "icon" }: RevertButtonProps) {
  const [isReverting, setIsReverting] = useState(false);
  const [justReverted, setJustReverted] = useState(false);

  const handleRevert = async () => {
    const confirmed = window.confirm(
      "Discard all draft changes? This cannot be undone."
    );
    if (!confirmed) return;

    setIsReverting(true);
    try {
      await revertDocument(documentId);
      setJustReverted(true);
      setTimeout(() => setJustReverted(false), 2000);
    } catch (err) {
      console.error("Failed to revert:", err);
    } finally {
      setIsReverting(false);
    }
  };

  if (justReverted) {
    return (
      <Button variant="outline" size={size} disabled>
        <Check className="h-4 w-4 text-green-500" />
      </Button>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={size}
            onClick={handleRevert}
            disabled={isReverting}
          >
            {isReverting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Undo2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Discard draft changes</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}