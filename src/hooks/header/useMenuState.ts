// components/Header/hooks/useMenuState.ts
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

  // Corrected toggleUserDropdown: ONLY toggle the state.
  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(isOpen => !isOpen);
  }, [isUserDropdownOpen]);

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