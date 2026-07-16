import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School AI Platform - Apple Subsystem',
  description: 'School AI Platform - Awards, Finance, Assets, and Students Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-HK">
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
