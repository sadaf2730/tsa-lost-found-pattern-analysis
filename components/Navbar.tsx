"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { ShieldCheck } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Executive Overview", href: "/executive-overview" },
  { label: "Operational Insights", href: "/operational-insights" },
  { label: "Financial Analysis", href: "/financial-analysis" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-tsa-surface/85 border-b border-tsa-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-tsa-primary/20 border border-tsa-accent/30 flex items-center justify-center text-tsa-accent group-hover:scale-105 transition-transform duration-200 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-tsa-accent" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-tsa-text group-hover:text-tsa-accent transition-colors">
                  TSA Lost & Found
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-tsa-primary/30 text-tsa-accent border border-tsa-accent/20">
                  Analytics
                </span>
              </div>
              <p className="text-[11px] text-tsa-muted tracking-wide hidden sm:block">
                U.S. Airport Claims Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-tsa-bg/50 p-1 rounded-xl border border-tsa-border/60">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-tsa-text bg-tsa-surface shadow-sm font-semibold border border-tsa-border/80"
                      : "text-tsa-muted hover:text-tsa-text hover:bg-tsa-surface/50"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-tsa-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Theme Toggle & Status indicator */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Data Engine Active</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-tsa-border/50 text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1 rounded-md transition-colors ${
                  isActive ? "text-tsa-accent font-semibold" : "text-tsa-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
