"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const PATH_NAMES: Record<string, string> = {
  "/": "Home",
  "/executive-overview": "Executive Overview",
  "/operational-insights": "Operational & Geographic Intelligence",
  "/financial-analysis": "Financial & Pattern Analysis",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const pageTitle = PATH_NAMES[pathname] || "Dashboard";

  return (
    <nav className="flex items-center gap-1.5 text-xs text-tsa-muted mb-2">
      <Link
        href="/"
        className="inline-flex items-center gap-1 hover:text-tsa-accent transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      <ChevronRight className="w-3.5 h-3.5 text-tsa-border" />

      <span className="font-semibold text-tsa-text">{pageTitle}</span>
    </nav>
  );
}
