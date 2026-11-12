import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "StrataSky — Smart Desert Agriculture for the UAE",
  description:
    "Save desert water and grow resilient crops across the UAE. Powered by live NASA satellite climate data and verified soil science.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
