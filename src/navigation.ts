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
  '/chatbottong': '/chatbottong',
  '/chatbottong/chat': '/chatbottong/chat',
  '/chatbottong/livechat': '/chatbottong/livechat',
  '/support': '/support',
  '/other': '/other',
  '/addconference': '/addconference',
  '/conferences/detail': '/conferences/detail',
  '/journals/detail': '/journals/detail',
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })
