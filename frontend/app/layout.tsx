import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Publishify - Platform Penerbitan Naskah Terpadu",
  description:
    "Publishify adalah sistem manajemen lengkap untuk penerbitan buku digital yang mencakup proses dari penulisan, review hingga distribusi.",
  keywords: [
    "penerbitan",
    "naskah",
    "buku",
    "penulis",
    "editor",
    "digital publishing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <Toaster richColors position="top-center" />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
