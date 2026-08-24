import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'Last-Mile Delivery Tracker — Enterprise Logistics Platform',
  description: 'Precision volumetric pricing, zone routing, auto-assignment, and immutable tracking history.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#050505] text-gray-100 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
