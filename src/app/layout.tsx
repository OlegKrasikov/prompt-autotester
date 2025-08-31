import type { Metadata } from 'next';
import './globals.css';
import LayoutClient from './layout-client';

export const metadata: Metadata = {
  title: 'Prompt Autotester',
  description:
    'Compare prompt versions on conversation scenarios and see the differences in action. Test, validate, and optimize your AI prompts with confidence.',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
