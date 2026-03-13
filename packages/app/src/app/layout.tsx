import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { cn } from "@/lib/utils";
import "./globals.css";
import type { PropsWithChildren } from "react";

import { Header } from "@/components/header";
import { AppProviders } from "@/components/providers/app-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clarity Optimistic Oracle",
  description: "Trustless Assertion Layer for Stacks Ecosystem",
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <AppProviders>
        <body className={cn([jetBrainsMono.variable, "antialiased"])}>
          <Header />
          {children}
        </body>
      </AppProviders>
    </html>
  );
}
