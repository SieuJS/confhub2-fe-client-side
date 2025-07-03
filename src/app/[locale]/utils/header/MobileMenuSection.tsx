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

  return (
    <>
      {/* THAY ĐỔI Ở ĐÂY: Thay lg:hidden thành xl:hidden */}
      <Button
        className='block xl:hidden'
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