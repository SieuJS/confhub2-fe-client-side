// src/app/[locale]/utils/Footer/types.ts

import { ComponentType } from 'react';
import { AppPathname } from '@/src/navigation';

export type FooterLink = {
  label: string;
  href: AppPathname | { pathname: AppPathname; query: Record<string, string | number> };
};

export type IconProps = {
  className?: string;
};