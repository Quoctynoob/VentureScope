import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SidebarNav from "@/components/SidebarNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VentureScope",
  description: "Venture analytics platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar — always visible, never remounts */}
          <SidebarNav />

          {/* Page content swaps here on every navigation */}
          <main className="flex-1 overflow-y-auto bg-white p-7">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
