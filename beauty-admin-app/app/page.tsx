"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome to the Beauty Admin App</h1>
      <p className="text-lg text-zinc-600">Manage your orders and customers efficiently.</p>
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        {/* Additional content can be added here */}
      </Suspense>
    </div>
  );
}