<link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />

import React from 'react';
import { ThemeProvider } from '@/src/app/[locale]/components/utils/ThemeProvider';
import type { Metadata } from 'next';
import {
  AbstractIntlMessages,
  NextIntlClientProvider,
  useMessages,
} from 'next-intl';
import { Inter, Rubik } from 'next/font/google';
import localFont from 'next/font/local'
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter',
});
const rubik = Rubik({
  subsets: ['arabic'],
  variable: '--rubik',
});
// Tải Space Grotesk cục bộ
const spaceGrotesk = localFont({
  src: [
    {
      path: '../../../public/fonts/SpaceGrotesk-Regular.ttf', 
      weight: '400', 
      style: 'normal', 
    },
    {
      path: '../../../public/fonts/SpaceGrotesk-Bold.ttf',
      weight: '700',  
      style: 'normal',
    },
  ],
  variable: '--font-space-grotesk', // Tên biến CSS
  display: 'swap', 
});
export const metadata: Metadata = {
  title: 'Next Temp',
  description: 'create next app By Yahya Parvar!',
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();
  return (
    <html
      lang={locale}
      dir={locale === 'ar' || locale == 'fa' ? 'rtl' : 'ltr'}
      className={`${spaceGrotesk.variable} ${rubik.variable} scroll-smooth scrollbar scrollbar-thumb-background-secondary scrollbar-track-background  `}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider
          enableSystem
          attribute="class"
          defaultTheme="light"
          themes={[
            'light',
            'dark',
            'instagram',
            'facebook',
            'discord',
            'netflix',
            'twilight',
            'reddit',
          ]}
        >
          <NextIntlClientProvider
            locale={locale}
            messages={messages as AbstractIntlMessages}
          >
            <NextTopLoader
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl={true}
              easing="ease"
              speed={200}
              shadow="0 0 10px #2299DD,0 0 5px #2299DD"
              color="var(--primary)"
              showSpinner={false}
            />
            <main className="mx-auto max-w-screen-2xl">{children}</main>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}