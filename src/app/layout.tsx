import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resite MVP',
  description: 'Client-side Al-Fatihah recitation follow-along',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
