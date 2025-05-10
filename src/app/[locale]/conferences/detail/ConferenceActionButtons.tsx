// src/app/[locale]/conference/detail/ConferenceActionButtons.tsx
import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/src/app/[locale]/utils/Button'; // Adjust path if needed
import useClickOutside from '@/src/hooks/conferenceDetails/useClickOutside'; // Adjust path
import { Organization } from '@/src/models/response/conference.response';

interface ConferenceActionButtonsProps {
  conferenceId: string | null;
  displayOrganization: Organization | undefined;
  isAddToCalendar: boolean;
  handleAddToCalendar: () => void;
  calendarLoading: boolean;
  handleShareClick: (platform: 'facebook' | 'twitter' | 'reddit') => void;
  isFollowing: boolean;
  handleFollowClick: () => void;
  followLoading: boolean;
  isUpdating: boolean;
  updateConference: (id: string | null) => void;
  isBlacklisted: boolean;
  handleBlacklistClick: () => void;
  blacklistLoading: boolean;
  checkLoginAndRedirect: (callback: () => void) => void;
}

const ConferenceActionButtons: React.FC<ConferenceActionButtonsProps> = ({
  conferenceId,
  displayOrganization,
  isAddToCalendar,
  handleAddToCalendar,
  calendarLoading,
  handleShareClick,
  isFollowing,
  handleFollowClick,
  followLoading,
  isUpdating,
  updateConference,
  isBlacklisted,
  handleBlacklistClick,
  blacklistLoading,
  checkLoginAndRedirect,
}) => {
  const t = useTranslations('');
  const [openMenu, setOpenMenu] = useState<'share' | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const toggleShareMenu = () => {
    setOpenMenu(prev => (prev === 'share' ? null : 'share'));
  };

  const closeMenu = () => {
    setOpenMenu(null);
  };

  useClickOutside(menuContainerRef, closeMenu);

  const renderShareMenu = () => {
    if (openMenu !== 'share') return null;
    const menuItemClass = 'share-menu-container block w-full px-4 py-2 text-left text-sm hover:bg-gray-100';
    return (
      <div
        className='absolute right-0 z-20 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
        style={{ top: '100%' }}
      >
        <div className='py-1'>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('facebook');
                closeMenu();
              });
            }}
            className={menuItemClass}
          >
            <span className='flex items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook mr-2" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
              </svg>
              {t('Share_on_Facebook')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('twitter');
                closeMenu();
              });
            }}
            className={menuItemClass}
          >
            <span className='flex items-center'>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x mr-2" viewBox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
              </svg>
              {t('Share_on_X')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('reddit');
                closeMenu();
              });
            }}
            className={menuItemClass}
          >
             <span className='flex items-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reddit mr-2" viewBox="0 0 16 16">
                <path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028a.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"/>
              </svg>
              {t('Share_on_Reddit')}
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className='sticky top-24'>
      <div className='flex flex-row flex-wrap justify-center gap-2 md:flex-col md:items-stretch md:justify-start md:gap-3'>
        {/* Calendar Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleAddToCalendar)}
          variant={isAddToCalendar ? 'primary' : 'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={isAddToCalendar ? t('Remove_this_conference_from_your_personal_calendar') : t('Add_this_conference_to_your_personal_calendar')}
          disabled={calendarLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          <span className='hidden sm:inline'>{isAddToCalendar ? t('Added') : t('Calendar')}</span>
        </Button>

        {/* Share Button & Menu */}
        <div className='relative flex flex-grow md:flex-grow-0' ref={menuContainerRef}>
          <Button
            onClick={() => checkLoginAndRedirect(toggleShareMenu)}
            variant='secondary'
            size='small'
            className='flex w-full items-center justify-center gap-x-2 md:justify-start'
            aria-haspopup='true'
            aria-expanded={openMenu === 'share'}
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"/></svg>
            <span className='hidden sm:inline'>{t('Share')}</span>
          </Button>
          {renderShareMenu()}
        </div>

        {/* Follow Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleFollowClick)}
          variant={isFollowing ? 'primary' : 'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={isFollowing ? t('Remove_this_conference_from_your_personal_follow_list') : t('Add_this_conference_to_your_personal_follow_list')}
          disabled={followLoading}
        >
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.122 2.122 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>
          <span className='hidden sm:inline'>{isFollowing ? t('Followed') : t('Follow')}</span>
        </Button>

        {/* Update Button */}
        <Button
          variant={'secondary'}
          size='small'
          onClick={() => checkLoginAndRedirect(() => updateConference(conferenceId))}
          className={`flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isUpdating || !conferenceId || !displayOrganization?.link}
          title={t('Update_this_conference')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
          <span className='hidden sm:inline'>{isUpdating ? t('Updating') : t('Update')}</span>
        </Button>

        {/* Website Button */}
        <Button
          onClick={() => {
            if (displayOrganization?.link) {
              window.open(displayOrganization.link, '_blank', 'noopener noreferrer');
            } else {
              alert(t('Website_link_is_not_available'));
            }
          }}
          variant={'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={t('Go_to_conference_website')}
          disabled={!displayOrganization?.link}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>
          <span className='hidden sm:inline'>{t('Website')}</span>
        </Button>

        {/* Blacklist Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleBlacklistClick)}
          variant={isBlacklisted ? 'danger' : 'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          disabled={blacklistLoading}
          title={isBlacklisted ? t('Remove_this_conference_from_your_personal_blacklist') : t('Add_this_conference_to_your_personal_blacklist')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20"/><path d="M8.35 2.69A10 10 0 0 1 21.3 15.65"/><path d="M19.08 19.08A10 10 0 1 1 4.92 4.92"/></svg>
          <span className='hidden sm:inline'>{isBlacklisted ? t('Blacklisted') : t('Blacklist')}</span>
        </Button>
      </div>
    </div>
  );
};

export default ConferenceActionButtons;