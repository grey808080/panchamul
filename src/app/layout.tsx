import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Panchamul Bijuli',
    default: 'Panchamul Bijuli | Kohalpur ko Bijuli Ghar',
  },
  description: 'Your trusted electrical store in Kohalpur, Banke since 2010. We provide top-quality electrical products, genuine brands, and professional electrician services.',
  keywords: ['electrical store', 'Kohalpur', 'Banke', 'electrician', 'wires', 'cables', 'switches', 'lighting', 'Panchamul Bijuli'],
  openGraph: {
    title: 'Panchamul Bijuli | Kohalpur ko Bijuli Ghar',
    description: 'Your trusted electrical store in Kohalpur, Banke. Top-quality products and professional electricians.',
    url: 'https://panchamulbijuli.com',
    siteName: 'Panchamul Bijuli',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#1E3A8A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
