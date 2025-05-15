// src/app/[locale]/chatbot/NavigationMenu.tsx
import React from 'react';
import { Link } from '@/src/navigation'; // Chỉ cần Link ở đây nếu AppPathname không dùng
import type { NavItem, NavLinkItem, NavButtonItem } from '@/src/hooks/chatbot/useLeftPanelNavigation';

interface NavigationMenuProps {
  navItems: NavItem[];
  isLeftPanelOpen: boolean;
  disabled?: boolean; // <<<< THÊM PROP DISABLED TOÀN CỤC >>>>
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  navItems,
  isLeftPanelOpen,
  disabled: globalDisabled = false, // <<<< GIÁ TRỊ MẶC ĐỊNH >>>>
}) => {
  const iconOnlyButtonBaseClasses = 'h-12 w-12 justify-center p-2';
  const commonButtonInteractiveClasses =
    'rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const expandedButtonBaseClasses = 'px-3 py-2.5 text-sm font-medium';

  return (
    <nav className={`${isLeftPanelOpen ? 'space-y-1' : 'space-y-1'}`}>
      {navItems.map(item => {
        const IconComponent = item.icon;
        // Item bị disabled nếu bản thân nó disabled HOẶC menu bị disabled toàn cục
        const itemIsActuallyDisabled = item.disabled || globalDisabled;

        const isActiveClasses = item.isActive && !itemIsActuallyDisabled // Không active nếu bị disabled
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : commonButtonInteractiveClasses;
        const disabledClasses = itemIsActuallyDisabled ? 'cursor-not-allowed opacity-50' : '';
        const buttonLayoutClasses = isLeftPanelOpen
          ? expandedButtonBaseClasses
          : iconOnlyButtonBaseClasses;

        if (item.type === 'link') {
          const linkItem = item as NavLinkItem;
          return (
            <Link
              key={linkItem.id}
              href={linkItem.href}
              className={`group flex w-full items-center ${buttonLayoutClasses} ${isActiveClasses} ${disabledClasses}`}
              title={isLeftPanelOpen ? undefined : linkItem.label}
              aria-current={linkItem.isActive && !itemIsActuallyDisabled ? 'page' : undefined}
              aria-disabled={itemIsActuallyDisabled} // Sử dụng itemIsActuallyDisabled
              onClick={e => {
                if (itemIsActuallyDisabled) { // Sử dụng itemIsActuallyDisabled
                  e.preventDefault();
                  return;
                }
                if (linkItem.action) {
                  e.preventDefault();
                  linkItem.action();
                }
              }}
              tabIndex={itemIsActuallyDisabled ? -1 : undefined} // Sử dụng itemIsActuallyDisabled
            >
              <IconComponent
                size={isLeftPanelOpen ? 20 : 24}
                className={`${isLeftPanelOpen ? 'mr-3' : ''} flex-shrink-0 ${linkItem.isActive && !itemIsActuallyDisabled ? 'text-blue-600 dark:text-blue-400' : ' group-hover:text-gray-600  dark:group-hover:text-gray-300'}`}
                strokeWidth={1.75}
              />
              {isLeftPanelOpen && <span>{linkItem.label}</span>}
            </Link>
          );
        }
        if (item.type === 'button') {
            const buttonItem = item as NavButtonItem;
             return (
                <button
                  key={buttonItem.id}
                  type='button'
                  onClick={buttonItem.action}
                  disabled={itemIsActuallyDisabled} // <<<< SỬ DỤNG itemIsActuallyDisabled >>>>
                  className={`group flex w-full items-center ${buttonLayoutClasses} ${isActiveClasses} ${disabledClasses}`}
                  title={isLeftPanelOpen ? undefined : buttonItem.label}
                  aria-pressed={buttonItem.isActive && !itemIsActuallyDisabled}
                  aria-label={!isLeftPanelOpen ? buttonItem.label : undefined}
                >
                  <IconComponent
                    size={isLeftPanelOpen ? 20 : 24}
                    className={`${isLeftPanelOpen ? 'mr-3' : ''} flex-shrink-0 ${buttonItem.isActive && !itemIsActuallyDisabled ? 'text-blue-600 dark:text-blue-400' : ' group-hover:text-gray-600  dark:group-hover:text-gray-300'}`}
                    strokeWidth={1.75}
                  />
                  {isLeftPanelOpen && <span>{buttonItem.label}</span>}
                </button>
              );
        }
        return null;
      })}
    </nav>
  );
};

export default NavigationMenu;