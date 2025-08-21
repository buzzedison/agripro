// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavbar from "./components/ClientNavbar";
import ClientFooter from "./components/ClientFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agripro",
  description: "Redefining Agribusiness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientNavbar />
        {children}
        <ClientFooter />
      </body>
    </html>
  );
}