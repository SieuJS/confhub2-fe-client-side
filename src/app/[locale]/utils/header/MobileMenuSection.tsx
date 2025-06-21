// src/app/[locale]/utils/header/MobileMenuSection.tsx (TẠO FILE MỚI)

'use client';

import { FC } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useMenuState } from '@/src/hooks/header/useMenuState';
import Button from '../Button';
import { MenuIcon, CloseIcon } from './Icon';
import MobileNavigation from './MobileNavigation';

interface MobileMenuSectionProps {
  locale: string;
}

const MobileMenuSection: FC<MobileMenuSectionProps> = ({ locale }) => {
  const { isLoggedIn } = useAuth();
  const { isMobileMenuOpen, openMobileMenu, closeAllMenus } = useMenuState();

  // Không cần skeleton cho nút bấm này
  return (
    <>
      <Button
        className='block lg:hidden'
        onClick={e => { e.stopPropagation(); openMobileMenu(); }}
      >
        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </Button>
      <MobileNavigation
        isMobileMenuOpen={isMobileMenuOpen}
        closeAllMenus={closeAllMenus}
        locale={locale}
        isLogin={isLoggedIn}
      />
    </>
  );
};

export default MobileMenuSection;