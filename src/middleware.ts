import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { locales } from './i18n'
import { localePrefix } from './navigation'

// Declare your custom environment variables type
interface Config {
  NEXT_PUBLIC_DATABASE_URL: string;
  NEXT_PUBLIC_BACKEND_URL: string;
  GOOGLE_REDIRECT_URI: string;
  // Add other environment variables here
}
export const appConfig: Config = {
  NEXT_PUBLIC_DATABASE_URL: process.env.NEXT_PUBLIC_DATABASE_URL || 'http://confhub.engineer', // Provide a default value
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', // Provide a default value
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8386/api/auth/google/callback', // Provide a default value
  // Assign other environment variables to the config object
};


type CustomMiddleware = (req: NextRequest) => Promise<NextRequest>
const customMiddleware: CustomMiddleware = async req => { 
  console.log('Custom middleware executed before next-intl')
  return req
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix
})

export default async function middleware(
  req: NextRequest
): Promise<ReturnType<typeof intlMiddleware>> {
  await customMiddleware(req)
  return intlMiddleware(req)
} 

export const config = {
  matcher: ['/', '/(fr|en|ja|de|ru|es|fa|ar|vi|zh|ko)/:path*']
}
