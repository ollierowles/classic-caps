import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/context";
import ErrorBoundary from "@/components/ErrorBoundary";
import OfflineBanner from "@/components/OfflineBanner";
import StorageErrorToast from "@/components/StorageErrorToast";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Classic Caps - Guess the Starting XI",
  description: "Test your football knowledge by guessing historical starting lineups",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-pitch focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <AppProvider>
            <LayoutClient>
              <OfflineBanner />
              <StorageErrorToast />
              <main id="main-content" className="flex-1">
                {children}
              </main>
              <AppFooter />
            </LayoutClient>
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
