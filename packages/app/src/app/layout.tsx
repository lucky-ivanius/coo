import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";
import type { PropsWithChildren } from "react";

import { Header } from "@/components/header";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@/consts/app";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["Clarity", "Optimistic Oracle", "Stacks", "Bitcoin", "DeFi", "Blockchain", "Assertions", "Dispute Resolution", "sBTC"],
  authors: [{ name: "COO" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-256x256.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={cn([jetBrainsMono.variable, "antialiased"])}>
        <AppProviders>
          <Header />
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
