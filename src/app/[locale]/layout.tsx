// src/app/[locale]/layout.tsx (CHỈNH SỬA)

import React from 'react'
import { ThemeProvider } from '@/src/app/[locale]/utils/ThemeProvider'
import type { Metadata } from 'next'
import type { Viewport } from 'next'

import {
  AbstractIntlMessages,
  NextIntlClientProvider,
  useMessages
} from 'next-intl'
import localFont from 'next/font/local'
import NextTopLoader from 'nextjs-toploader'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import ChatbotGlobalInitializer from './chatbot/ChatbotGlobalInitializer'
import { AuthProvider } from '@/src/contexts/AuthContext';
import FloatingChatbot from './floatingchatbot/FloatingChatbot';
import { NotificationProvider } from '@/src/contexts/NotificationContext';
import { SidebarProvider } from '@/src/contexts/SidebarContext'
// THÊM IMPORT MỚI
// THÊM IMPORT MỚI
import MainLayout from './MainLayout';
import Header from './utils/Header'; // Import Header
import Footer from './utils/Footer'; // Import Footer
import { WhatsNewController } from './home/whatnews/WhatsNewController'

const spaceGrotesk = localFont({
  src: [
    {
      path: '../../../public/fonts/SpaceGrotesk-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/SpaceGrotesk-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-space-grotesk',
  display: 'swap'
})
const inter = localFont({
  src: [
    {
      path: '../../../public/fonts/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--inter',
  display: 'swap'
})
const rubik = localFont({
  src: [
    {
      path: '../../../public/fonts/Rubik-Regular.ttf',
      weight: '400',
      style: 'normal'
    },
    {
      path: '../../../public/fonts/Rubik-Bold.ttf',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--rubik',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Global Conference & Journal Hub',
  description:
    'ConFHub is a comprehensive platform for managing and discovering academic conferences and journals.',
  keywords:
    'conferences, academic conferences, conference management, research conferences',
  authors: [{ name: 'ConFHub Team' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ConFHub',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-180x180.png',
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/icons/icon-180x180.png',
      },
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/icon-180x180.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '152x152',
        url: '/icons/icon-152x152.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '167x167',
        url: '/icons/icon-167x167.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        url: '/icons/icon-180x180.png',
      }
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' || locale === 'fa' ? 'rtl' : 'ltr'}
      className={`${spaceGrotesk.variable} ${inter.variable} ${rubik.variable} scroll-smooth scrollbar scrollbar-track-background scrollbar-thumb-background-secondary`}
      suppressHydrationWarning
    >
      <head></head>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <SidebarProvider>
              <ThemeProvider
                enableSystem
                attribute='class'
                defaultTheme='light'
                themes={[
                  'light', 'dark', 'instagram', 'facebook', 'discord',
                  'netflix', 'twilight', 'reddit'
                ]}
              >
                <ToastContainer
                  position='top-right'
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={locale === 'ar' || locale === 'fa'}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme='colored'
                />

                <NextIntlClientProvider
                  locale={locale}
                  messages={messages as AbstractIntlMessages}
                >
                  <ChatbotGlobalInitializer />

                  <NextTopLoader
                    color="var(--primary)"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px var(--primary), 0 0 5px var(--primary-dark)"
                  />

                  <FloatingChatbot />


                  {/* === THÊM COMPONENT MỚI Ở ĐÂY === */}
                  <WhatsNewController />
                  {/* ================================= */}


                  {/* === THAY ĐỔI CÁCH RENDER MAINLAYOUT === */}
                  {/*
                    1. Chúng ta render Header và Footer ngay tại đây (trong Server Component).
                    2. Chúng sẽ thực thi logic server của mình (Footer sẽ gọi getTranslations thành công).
                    3. Kết quả render của chúng được truyền dưới dạng props vào MainLayout.
                  */}
                  <MainLayout
                    header={<Header locale={locale} />}
                    footer={<Footer />}
                  >
                    {children}
                  </MainLayout>
                  {/* ======================================= */}



                </NextIntlClientProvider>
              </ThemeProvider>
            </SidebarProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}