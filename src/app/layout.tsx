import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'YATRA AI — Turn every journey into an experience',
  description:
    'Intelligent public mobility platform combining transit routes with along-the-way local tourism, historic sights, iconic dhabas, and artisan discovery.',
  keywords: [
    'Yatra AI',
    'transit discovery',
    'smart detour',
    'public transport India',
    'Ambala Chandigarh',
    'Indian tourism AI',
    'local dhabas',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col font-sans selection:bg-yatra-200 selection:text-yatra-950">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}

