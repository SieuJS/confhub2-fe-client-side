// src/components/Policy.tsx
'use client' // Cần thiết cho các component sử dụng hook như useState và useTranslations

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

// Định nghĩa kiểu cho một mục chính sách
interface PolicyItem {
  titleKey: string
  descriptionKey: string
}

// Định nghĩa kiểu cho một phần (tab) chính sách
interface PolicySection {
  id: string
  titleKey: string
  icon: React.ElementType
  items: PolicyItem[]
}

// Cấu trúc dữ liệu đã được cập nhật để khớp với các key mới trong file JSON
const policySections: PolicySection[] = [
  {
    id: 'submission',
    titleKey: 'Submission_Title',
    icon: ClipboardDocumentListIcon,
    items: [
      {
        titleKey: 'Accuracy_of_Information_Title',
        descriptionKey: 'Accuracy_of_Information_Desc'
      },
      {
        titleKey: 'Content_Guidelines_Title',
        descriptionKey: 'Content_Guidelines_Desc'
      },
      {
        titleKey: 'Intellectual_Property_Title',
        descriptionKey: 'Intellectual_Property_Desc'
      },
      {
        titleKey: 'Review_Process_Title',
        descriptionKey: 'Review_Process_Desc'
      },
      {
        titleKey: 'Updates_Corrections_Title',
        descriptionKey: 'Updates_Corrections_Desc'
      }
    ]
  },
  {
    id: 'chatbot',
    titleKey: 'Chatbot_Title',
    icon: ChatBubbleLeftRightIcon,
    items: [
      {
        titleKey: 'Chatbot_Usage_Policy_Title',
        descriptionKey: 'Chatbot_Usage_Policy_Desc'
      },
      {
        titleKey: 'Chatbot_Limitation_Title',
        descriptionKey: 'Chatbot_Limitation_Desc'
      },
      { titleKey: 'Chatbot_Data_Title', descriptionKey: 'Chatbot_Data_Desc' }
    ]
  },
  {
    id: 'registration',
    titleKey: 'Registration_Title',
    icon: UserCircleIcon,
    items: [
      {
        titleKey: 'Account_Responsibility_Title',
        descriptionKey: 'Account_Responsibility_Desc'
      },
      {
        titleKey: 'User_Eligibility_Title',
        descriptionKey: 'User_Eligibility_Desc'
      },
      {
        titleKey: 'Account_Termination_Title',
        descriptionKey: 'Account_Termination_Desc'
      },
      {
        titleKey: 'Account_Deletion_Title',
        descriptionKey: 'Account_Deletion_Desc'
      }
    ]
  },
  {
    id: 'general',
    titleKey: 'General_Title',
    icon: Cog6ToothIcon,
    items: [
      {
        titleKey: 'Privacy_Policy_Title',
        descriptionKey: 'Privacy_Policy_Desc'
      },
      { titleKey: 'Disclaimer_Title', descriptionKey: 'Disclaimer_Desc' },
      { titleKey: 'Governing_Law_Title', descriptionKey: 'Governing_Law_Desc' },
      {
        titleKey: 'Prohibited_Conduct_Title',
        descriptionKey: 'Prohibited_Conduct_Desc'
      },
      {
        titleKey: 'Copyright_Policy_Title',
        descriptionKey: 'Copyright_Policy_Desc'
      },
      {
        titleKey: 'Third_Party_Links_Title',
        descriptionKey: 'Third_Party_Links_Desc'
      },
      {
        titleKey: 'Changes_To_Terms_Title',
        descriptionKey: 'Changes_To_Terms_Desc'
      }
    ]
  }
]

const PolicyPage: React.FC = () => {
  const t = useTranslations('Policy')
  const [activeTab, setActiveTab] = useState<string>(policySections[0].id)

  const activeSection = policySections.find(section => section.id === activeTab)

  return (
    <div className='min-h-screen bg-gradient-to-r from-background to-background-secondary'>
      <div className='mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8'>
        {/* === TIÊU ĐỀ CHÍNH === */}
        <div className='mb-12 text-center'>
          <h1 className='text-4xl font-extrabold tracking-tight  sm:text-5xl'>
            {t('Page_Title')}
          </h1>
          <p className='mt-4 text-xl '>{t('Page_Subtitle')}</p>
        </div>

        {/* === GIAO DIỆN TAB === */}
        <div>
          {/* Tab Navigation */}
          <div className='border-b border-gray-200'>
            <nav
              className='-mb-px flex space-x-6 sm:space-x-8'
              aria-label='Tabs'
            >
              {policySections.map(section => {
                const IconComponent = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={clsx(
                      'group inline-flex items-center border-b-2 px-1 py-4  font-medium transition-colors duration-200 focus:outline-none',
                      activeTab === section.id
                        ? 'border-secondary text-secondary'
                        : 'border-transparent  hover:border-gray-300 hover:text-gray-70'
                    )}
                  >
                    <IconComponent
                      className={clsx(
                        'mr-2 h-5 w-5',
                        activeTab === section.id
                          ? 'text-secondary'
                          : 'group-hover: '
                      )}
                    />
                    <span>{t(section.titleKey)}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className='mt-8'>
            {activeSection && (
              <div
                key={activeSection.id}
                className='rounded-lg border border-gray-200 bg-white-pure p-6 shadow-md sm:p-8'
              >
                <dl className='space-y-10'>
                  {activeSection.items.map(item => (
                    <div key={item.titleKey}>
                      <dt className='text-xl font-semibold '>
                        {t(item.titleKey)}
                      </dt>
                      <dd className='mt-2 text-base leading-relaxed '>
                        {t(item.descriptionKey)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PolicyPage
