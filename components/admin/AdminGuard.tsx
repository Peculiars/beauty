"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    // If not signed in, redirect to sign-in page
    if (!isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If not signed in, don't render children
  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}
