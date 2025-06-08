import { useState, useCallback } from 'react';

export const useMenuState = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // These togglers are stable because they use the functional update form of useState
  // and have no other dependencies.
  const toggleNotification = useCallback(() => {
    setIsNotificationOpen((isOpen) => !isOpen);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((isOpen) => !isOpen);
  }, []);

  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen((isOpen) => !isOpen);
  }, []);


  const closeAllMenus = useCallback(() => {
      setIsNotificationOpen(false);
      setIsMobileMenuOpen(false);
      setIsUserDropdownOpen(false);
  }, []);


  // FIX: Add `toggleNotification` to the dependency array.
  const openNotification = useCallback(() => {
    toggleNotification();
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [toggleNotification]);

  // FIX: Add `toggleMobileMenu` to the dependency array.
  const openMobileMenu = useCallback(() => {
    toggleMobileMenu();
    setIsNotificationOpen(false);
    setIsUserDropdownOpen(false);
  }, [toggleMobileMenu]);

  // FIX: Add `toggleUserDropdown` to the dependency array.
  const openUserDropdown = useCallback(() => {
    toggleUserDropdown();
    setIsNotificationOpen(false);
    setIsMobileMenuOpen(false)
  }, [toggleUserDropdown]);


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
    openMobileMenu,
  };
};