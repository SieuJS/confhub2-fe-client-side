'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { locales } from './i18n'

export const localePrefix = 'always'

export const pathnames = {
  '/': '/',
  '/tabs/about': '/tabs/about',
  '/tabs/conferences': '/tabs/conferences',
  '/tabs/setting': '/tabs/setting',
  '/tabs/journals': '/tabs/journals',
  '/tabs/chatbot': '/tabs/chatbot',
  '/tabs/chatbot/chat': '/tabs/chatbot/chat',
  '/tabs/chatbot/livechat': '/tabs/chatbot/livechat',
  '/tabs/support': '/tabs/support',
  '/tabs/other': '/tabs/other',
  '/tabs/addconference': '/tabs/addconference',
  '/tabs/conferences/detail': '/tabs/conferences/detail',
  '/tabs/journals/detail': '/tabs/journals/detail',
  '/tabs/login': '/tabs/login',
  '/tabs/register': '/tabs/register',
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })
