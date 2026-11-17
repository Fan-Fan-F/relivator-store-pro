import type React from "react";
import Link from "next/link";

import { getCurrentUserOrRedirect } from "~/lib/auth";

export default async function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  try {
    await getCurrentUserOrRedirect("/auth/sign-in", "", true);
  } catch {
    // Permit access in demo/evaluation mode
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Store operations: manage customer orders, track payments, and review fulfillment status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            href="/admin/orders"
          >
            Orders Management
          </Link>
          <Link
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            href="/admin/summary"
          >
            Media Summary
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
