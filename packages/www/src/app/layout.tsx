import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";

import { Header } from "@/components/header";
import { APP_DESCRIPTION, APP_KEYWORDS, APP_NAME, APP_URL } from "@/consts/app";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
  keywords: APP_KEYWORDS,
  authors: [{ name: "COO" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo-256x256.png",
  },
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
  other: {
    "talentapp:project_verification":
      "5596fb46d81b14ce0be6ed3f516c3d1482b46a120127c58ea5bfb5bca498a6ed5b915e927b4d4d54238c7b8f408153b0b6313fdca540a0144e3fb7a9261fae48",
  },
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={cn([inter.variable, jetBrainsMono.variable, "scroll-smooth"])}>
      <body className="font-sans antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
