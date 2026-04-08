import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Asisten Gaple",
  description: "Asisten permainan Gaple 4 pemain – saran langkah & logging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <main className="flex-1 pb-20 max-w-lg mx-auto w-full px-4 pt-4">
          {children}
        </main>
        <Navbar />
      </body>
    </html>
  );
}


