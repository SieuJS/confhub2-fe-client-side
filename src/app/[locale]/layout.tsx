<link
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
  rel="stylesheet"
/>

import { ThemeProvider } from '@/src/app/[locale]/components/utils/ThemeProvider';
import type { Metadata } from 'next';
import {
  AbstractIntlMessages,
  NextIntlClientProvider,
  useMessages,
} from 'next-intl';
import { Inter, Rubik, Space_Grotesk } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import { Header } from './components/utils/Header';
import './globals.css';
import Footer from './components/utils/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter',
});
const rubik = Rubik({
  subsets: ['arabic'],
  variable: '--rubik',
});
const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
      className={`${space_grotesk.variable} ${rubik.variable} scroll-smooth scrollbar scrollbar-thumb-background-secondary scrollbar-track-background  `}
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
            <Header locale={locale} />
            <main className="mx-auto max-w-screen-2xl ">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}