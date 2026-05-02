import type { Metadata } from 'next';
import { Lexend, Inter, Space_Grotesk } from 'next/font/google';
import { AppShell } from '@/app/components/nav/AppShell';
import './globals.css';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--loaded-font-lexend',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--loaded-font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--loaded-font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vlinder League',
  description: 'World Cup 2026 Prediction League',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${inter.variable} ${spaceGrotesk.variable} dark`}
    >
      {/*
        React 19 (used by Next.js 16) automatically hoists <link> elements
        that appear anywhere in the component tree to <head>.
        Loading a fixed-instance Material Symbols subset keeps the request
        small while covering every icon used in the navigation and components.
      */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen font-body-md antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
