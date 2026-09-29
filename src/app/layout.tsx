import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BizMind — AI Decision Intelligence & Institutional Memory',
  description:
    'BizMind is an institutional memory decision intelligence platform that remembers what your company tried, why it tried it, what happened afterward, and uses those experiences when analyzing future decisions.',
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
