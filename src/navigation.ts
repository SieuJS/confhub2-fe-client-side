'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { locales } from './i18n'

export const localePrefix = 'always'

export const pathnames = {
  '/': '/',
  '/about': '/about',
  '/conferences': '/conferences',
  '/setting': '/setting',
  '/journals': '/journals',
  '/journaldetails': '/journaldetails',
  '/chatbot': '/chatbot',
  '/support': '/support',
  '/other': '/other',
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })
