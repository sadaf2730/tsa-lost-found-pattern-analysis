import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { FilterProvider } from "@/context/FilterContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TSA Lost & Found Pattern Analysis | Enterprise Airport Analytics",
  description:
    "Interactive analytics platform for exploring historical TSA airport claim patterns, loss frequencies, and financial metrics across the United States.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-tsa-bg text-tsa-text font-sans antialiased selection:bg-tsa-accent selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <FilterProvider>
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <footer className="w-full border-t border-tsa-border/60 py-6 bg-tsa-surface/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-tsa-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-tsa-text">TSA Lost & Found Pattern Analysis</span>
                  <span>—</span>
                  <span>Airport Operations Research Platform</span>
                </div>
                <div>Powered by Next.js 15, Python Pandas & Next-Themes</div>
              </div>
            </footer>
          </FilterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
