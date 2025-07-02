// src/app/[locale]/conferences/detail/ConferenceActionButtons.tsx

import React, { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import Button from '@/src/app/[locale]/utils/Button'
import useClickOutside from '@/src/hooks/conferenceDetails/useClickOutside'
import { Organization } from '@/src/models/response/conference.response'
import { notification } from '@/src/utils/toast/notification'
import Modal from '@/src/app/[locale]/chatbot/Modal' // Import Modal component

// Import Lucide Icons
import {
  CalendarDays,
  Share2,
  Star,
  RefreshCcw,
  ExternalLink,
  Ban,
  Loader2, // Import icon loading,
  Send // Import icon cho nút Submit

} from 'lucide-react'

interface ConferenceActionButtonsProps {
  conferenceId: string | null
  displayOrganization: Organization | undefined
  isAddToCalendar: boolean
  handleAddToCalendar: () => void
  calendarLoading: boolean
  handleShareClick: (platform: 'facebook' | 'twitter' | 'reddit') => void
  isFollowing: boolean
  handleFollowClick: () => void
  followLoading: boolean
  isUpdating: boolean
  updateConference: (id: string | null) => void
  isBlacklisted: boolean
  handleBlacklistClick: () => void
  blacklistLoading: boolean
  isAuthInitializing: boolean // Prop mới
  checkLoginAndRedirect: (callback: () => void) => void
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
  isAuthInitializing,
  checkLoginAndRedirect
}) => {
  const t = useTranslations('ConferenceDetail')
  const [openMenu, setOpenMenu] = useState<'share' | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false) // State cho Modal Submit

  const toggleShareMenu = () => {
    setOpenMenu(prev => (prev === 'share' ? null : 'share'))
  }

  const closeMenu = () => {
    setOpenMenu(null)
  }

  useClickOutside(menuContainerRef, closeMenu)

  const handleBlacklistWithCheck = () => {
    if (!isBlacklisted && (isFollowing || isAddToCalendar)) {
      notification.warning(t('Blacklist_Requires_Unfollow_Calendar'))
      return
    }
    handleBlacklistClick()
  }

  // Hàm xử lý khi click nút Submit bài
  const handleSubmitPaperClick = () => {
    setIsSubmitModalOpen(true)
  }

  // Hàm đóng Modal Submit bài
  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false)
  }


  const renderShareMenu = () => {
    if (openMenu !== 'share') return null
    const menuItemClass =
      'share-menu-container block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
    return (
      <div
        className='absolute right-0 z-20 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
        style={{ top: '100%' }}
      >
        <div className='py-1'>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('facebook')
                closeMenu()
              })
            }}
            className={menuItemClass}
            disabled={isBlacklisted}
          >
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-facebook mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951' />
              </svg>
              {t('Share_on_Facebook')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('twitter')
                closeMenu()
              })
            }}
            className={menuItemClass}
            disabled={isBlacklisted}
          >
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-twitter-x mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z' />
              </svg>
              {t('Share_on_X')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('reddit')
                closeMenu()
              })
            }}
            className={menuItemClass}
            disabled={isBlacklisted}
          >
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-reddit mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z' />
                <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028a.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165' />
              </svg>
              {t('Share_on_Reddit')}
            </span>
          </button>
        </div>
      </div>
    )
  }

  // ==================================================================
  // SỬA LỖI: TÁCH BIỆT LOGIC VÔ HIỆU HÓA
  // Biến này chỉ dùng cho các nút bị ảnh hưởng bởi hành động Blacklist
  const otherButtonsDisabled = isAuthInitializing || isBlacklisted
  // ==================================================================

  const blacklistTooltip = t('Remove_Blacklist_First_Tooltip')

  // Component con để hiển thị icon hoặc spinner
  const ActionIcon = ({
    isLoading,
    IconComponent,
    ...props
  }: {
    isLoading: boolean
    IconComponent: React.ElementType
    [key: string]: any
  }) => {
    return isLoading ? (
      <Loader2 {...props} className='animate-spin' />
    ) : (
      <IconComponent {...props} />
    )
  }

  // console.log('displayOrganization:', displayOrganization)

  return (
    // ==================================================================
    // SỬA LỖI Z-INDEX TẠI ĐÂY
    // Thêm `z-40` để nâng khối này lên trên thanh điều hướng (có z-30)
    // ==================================================================
    <div className='z-40'>
      <div className='flex flex-row flex-wrap justify-center gap-2 md:flex-col md:items-stretch md:justify-start md:gap-3'>
        {/* Các nút bấm không thay đổi */}
        {/* Calendar Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleAddToCalendar)}
          variant={isAddToCalendar ? 'primary' : 'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={
            isAuthInitializing
              ? t('Authenticating')
              : isBlacklisted
                ? blacklistTooltip
                : isAddToCalendar
                  ? t('Remove_from_Calendar_Tooltip')
                  : t('Add_to_Calendar_Tooltip')
          }
          disabled={otherButtonsDisabled || calendarLoading}
        >
          <ActionIcon
            isLoading={calendarLoading}
            IconComponent={CalendarDays}
            size={18}
          />
          <span className='hidden sm:inline'>
            {isAddToCalendar ? t('Added_Button') : t('Calendar_Button')}
          </span>
        </Button>

        {/* Share Button */}
        <div
          className='relative flex flex-grow md:flex-grow-0'
          ref={menuContainerRef}
        >
          <Button
            onClick={() => checkLoginAndRedirect(toggleShareMenu)}
            variant='secondary'
            size='small'
            className='flex w-full items-center justify-center gap-x-2 md:justify-start'
            aria-haspopup='true'
            aria-expanded={openMenu === 'share'}
            title={isBlacklisted ? blacklistTooltip : t('Share_Tooltip')}
            disabled={isBlacklisted} // Share chỉ cần check blacklist, không cần auth
          >
            <Share2 size={18} />
            <span className='hidden sm:inline'>{t('Share_Button')}</span>
          </Button>
          {renderShareMenu()}
        </div>

        {/* Follow Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleFollowClick)}
          variant={isFollowing ? 'primary' : 'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={
            isAuthInitializing
              ? t('Authenticating')
              : isBlacklisted
                ? blacklistTooltip
                : isFollowing
                  ? t('Unfollow_Tooltip')
                  : t('Follow_Tooltip')
          }
          disabled={otherButtonsDisabled || followLoading}
        >
          <ActionIcon
            isLoading={followLoading}
            IconComponent={Star}
            size={18}
          />
          <span className='hidden sm:inline'>
            {isFollowing ? t('Followed_Button') : t('Follow_Button')}
          </span>
        </Button>

        {/* Update Button */}
        <Button
          variant={'secondary'}
          size='small'
          onClick={() =>
            checkLoginAndRedirect(() => updateConference(conferenceId))
          }
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={
            isAuthInitializing
              ? t('Authenticating')
              : isBlacklisted
                ? blacklistTooltip
                : t('Update_Tooltip')
          }
          disabled={
            otherButtonsDisabled ||
            isUpdating ||
            !conferenceId ||
            !displayOrganization?.link
          }
        >
          <ActionIcon
            isLoading={isUpdating}
            IconComponent={RefreshCcw}
            size={18}
          />
          <span className='hidden sm:inline'>
            {isUpdating ? t('Updating_Button') : t('Update_Button')}
          </span>
        </Button>

        {/* Website Button */}
        <Button
          onClick={() => {
            if (displayOrganization?.link) {
              window.open(
                displayOrganization.link,
                '_blank',
                'noopener noreferrer'
              )
            } else {
              notification.info(t('Website_link_is_not_available'))
            }
          }}
          variant={'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={
            isBlacklisted ? blacklistTooltip : t('Go_to_conference_website')
          }
          disabled={!displayOrganization?.link || isBlacklisted}
        >
          <ExternalLink size={18} />
          <span className='hidden sm:inline'>{t('Website_Button')}</span>
        </Button>

        {/* Blacklist Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleBlacklistWithCheck)}
          variant={isBlacklisted ? 'danger' : 'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={
            isAuthInitializing
              ? t('Authenticating')
              : isBlacklisted
                ? t('Remove_from_Blacklist_Tooltip')
                : t('Add_to_Blacklist_Tooltip')
          }
          // ==================================================================
          // SỬA LỖI: Chỉ vô hiệu hóa khi đang xác thực hoặc đang loading,
          // KHÔNG vô hiệu hóa khi isBlacklisted = true
          // ==================================================================
          disabled={isAuthInitializing || blacklistLoading}
        >
          <ActionIcon
            isLoading={blacklistLoading}
            IconComponent={Ban}
            size={18}
          />
          <span className='hidden sm:inline'>
            {isBlacklisted ? t('Blacklisted_Button') : t('Blacklist_Button')}
          </span>
        </Button>


        {/* NEW: Submit Paper Button */}
        <Button
          onClick={() => checkLoginAndRedirect(handleSubmitPaperClick)}
          variant={'secondary'}
          size='small'
          className='flex flex-grow items-center justify-center gap-x-2 md:flex-grow-0 md:justify-start'
          title={
            isAuthInitializing
              ? t('Authenticating')
              : isBlacklisted
                ? blacklistTooltip
                : t('Submit_Paper_Tooltip')
          }
          disabled={otherButtonsDisabled}
        >
          <Send size={18} />
          <span className='hidden sm:inline'>{t('Submit_Paper_Button')}</span>
        </Button>


        {/* Modal for Submit Paper */}
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={closeSubmitModal}
          title={t('Submit_Paper_Modal_Title')}
          size='sm'
          footer={
            <Button onClick={closeSubmitModal} variant='secondary'>
              {t('Close_Button')}
            </Button>
          }
        >
          <p>{t('Submit_Paper_Modal_Message')}</p>
        </Modal>

      </div>
    </div>
  )
}

export default ConferenceActionButtons
