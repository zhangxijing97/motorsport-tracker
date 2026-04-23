import './globals.css';
import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'Motorsport Tracker',
  description: 'Motorsport tracker inspired by FotMob and F1-style editorial UI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${rajdhani.variable}`}>
        {children}
      </body>
    </html>
  );
}