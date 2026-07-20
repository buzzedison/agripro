// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavbar from "./components/ClientNavbar";
import ClientFooter from "./components/ClientFooter";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://agripro.com'),
  title: {
    default: "AgriPro - Learn, Connect, Trade & Grow Your Agribusiness",
    template: "%s | AgriPro"
  },
  description: "Africa's leading agribusiness platform. Access agricultural knowledge, connect with farmers and buyers across Africa, trade products, and grow your business with expert support.",
  keywords: [
    "agribusiness",
    "African agriculture",
    "farming",
    "agricultural marketplace",
    "farm products",
    "agritech",
    "sustainable farming",
    "agricultural knowledge",
    "farm trading",
    "agricultural network",
    "African farmers",
    "agricultural experts",
    "farm business"
  ],
  authors: [{ name: "AgriPro Hub", url: "https://agripro.com" }],
  creator: "AgriPro Hub",
  publisher: "AgriPro Hub",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://agripro.com',
    siteName: 'AgriPro',
    title: 'AgriPro - Learn, Connect, Trade & Grow Your Agribusiness',
    description: "Africa's leading agribusiness platform. Access agricultural knowledge, connect with farmers and buyers, trade products, and grow your business.",
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AgriPro - Africa\'s Agribusiness Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriPro - Learn, Connect, Trade & Grow Your Agribusiness',
    description: "Africa's leading agribusiness platform for knowledge, networking, trading, and growth.",
    images: ['/images/og-image.jpg'],
    creator: '@Agriprotweet',
    site: '@Agriprotweet',
  },
  alternates: {
    canonical: 'https://agripro.com',
  },
  category: 'Agriculture',
  verification: {
    // Add your verification codes here
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <ClientNavbar />
        {children}
        <ClientFooter />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}