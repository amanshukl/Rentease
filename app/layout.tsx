import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/context/AuthProvider';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'RentEase – Furniture & Appliance Rental Platform',
  description:
    'Rent premium furniture and appliances at affordable monthly prices. No heavy deposits, free delivery, and flexible rental tenures for students and professionals.',
  keywords: ['furniture rental', 'appliance rental', 'rent furniture', 'RentEase'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#1f2937',
                  color: '#fff',
                  fontSize: '14px',
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
