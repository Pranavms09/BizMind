import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Business Analyst — Hindsight-Powered Decision Intelligence',
  description:
    'An institutional memory business analyst that remembers what your company tried, why it tried it, what happened afterward, and uses those experiences when analyzing future decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
