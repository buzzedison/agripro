// Explicitly tell Next.js to use this layout instead of the root layout
export const runtime = 'edge';

import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'AgriPro AI Assistant',
  description: 'Chat with our AI assistant about agriculture, farming, and sustainable practices.',
};

// This is a Root Layout - it completely replaces the root layout.tsx
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 