
// components/Header/hooks/useMenuState.ts (No Changes)
import { useState, useCallback } from 'react';

export const useMenuState = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const closeAllMenus = useCallback(() => {
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, []);

  const toggleNotification = useCallback(() => {
    setIsNotificationOpen(isOpen => !isOpen);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(isOpen => !isOpen);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(isOpen => !isOpen);
  }, []);

  return {
    isNotificationOpen,
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus,
    toggleNotification,
    toggleMobileMenu,
    toggleUserDropdown,
  };
};

