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

    // Close other menus when opening notification
  const openNotification = useCallback(() => {
    toggleNotification();
    setIsMobileMenuOpen(false); // Close mobile menu
    setIsUserDropdownOpen(false); // Close user dropdown
  }, []);

    // Close other menus when opening UserDropdown
  const openUserDropdown = useCallback(() => {
    toggleUserDropdown();
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false)
  }, []);

    // keep origin toggle
  const toggleNotification = useCallback(() => {
    setIsNotificationOpen((isOpen) => !isOpen);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((isOpen) => !isOpen);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen((isOpen) => !isOpen);
  }, []);

  return {
    isNotificationOpen,
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus,
    toggleNotification,
    toggleMobileMenu,
    toggleUserDropdown,
    openNotification,
    openUserDropdown,
  };
};