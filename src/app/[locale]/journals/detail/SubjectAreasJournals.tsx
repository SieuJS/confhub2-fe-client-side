// src/components/SubjectAreasJournals.tsx
import React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'

const journalImagePaths: string[] = [
  '/images/journals/1.png',
  '/images/journals/2.png',
  '/images/journals/3.png',
  '/images/journals/4.png',
  '/images/journals/5.png',
  '/images/journals/6.png',
  '/images/journals/7.png',
  '/images/journals/8.png',
  '/images/journals/9.png',
  '/images/journals/10.png',
  '/images/journals/11.png', // This corresponds to Economics, Econometrics and Finance
  '/images/journals/12.png',
  '/images/journals/13.png',
  '/images/journals/14.png',
  '/images/journals/15.png',
  '/images/journals/16.png',
  '/images/journals/17.png',
  '/images/journals/18.png',
  '/images/journals/19.png',
  '/images/journals/20.png',
  '/images/journals/21.png',
  '/images/journals/22.png',
  '/images/journals/23.png',
  '/images/journals/24.png',
  '/images/journals/25.png',
  '/images/journals/26.png',
  '/images/journals/27.png'
]

const subjectAreaNames: string[] = [
  'Agricultural and Biological Sciences',
  'Arts and Humanities',
  'Biochemistry, Genetics and Molecular Biology',
  'Business, Management and Accounting',
  'Chemical Engineering',
  'Chemistry',
  'Computer Science',
  'Decision Sciences',
  'Dentistry',
  'Earth and Planetary Sciences',
  'Economics, Econometrics and Finance',
  'Energy',
  'Engineering',
  'Environmental Science',
  'Health Professions',
  'Immunology and Microbiology',
  'Materials Science',
  'Mathematics',
  'Medicine',
  'Multidisciplinary',
  'Neuroscience',
  'Nursing',
  'Pharmacology, Toxicology and Pharmaceutics',
  'Physics and Astronomy',
  'Psychology',
  'Social Sciences',
  'Veterinary'
]

interface SubjectAreasJournalsProps {
  speed?: string
  imageHeight?: string
  imageWidth?: string
  innerClasses?: string
  outerPaddingClasses?: string
}

const SubjectAreasJournals: React.FC<SubjectAreasJournalsProps> = ({
  speed = '100s',
  imageHeight = 'h-80',
  imageWidth = 'w-50',
  innerClasses = 'space-x-4 py-4'
}) => {
  const t = useTranslations()

  const imagesToDisplay = journalImagePaths

  if (
    !imagesToDisplay ||
    imagesToDisplay.length === 0 ||
    imagesToDisplay.length !== subjectAreaNames.length
  ) {
    return (
      <div className='py-8 text-center '>
        {t('No_images_available_to_scroll')}{' '}
        {imagesToDisplay.length !== subjectAreaNames.length &&
          '(Subject names list does not match image count)'}
      </div>
    )
  }

  const duplicatedImages = [...imagesToDisplay, ...imagesToDisplay]

  return (
    <div className='container mx-auto py-8'>
      <h1 className='mb-6 text-center text-2xl font-bold'>
        {t('Subject_areas_journals')}
      </h1>
      <div className={`relative w-full overflow-hidden px-4`}>
        <div
          className={`group flex w-max animate-scroll-left ${innerClasses}`}
          style={{ '--scroll-speed': speed } as React.CSSProperties}
        >
          {duplicatedImages.map((imageUrl, index) => {
            const originalIndex = index % imagesToDisplay.length
            const subjectName = subjectAreaNames[originalIndex]

            // Mã hóa tất cả các ký tự đặc biệt, bao gồm cả dấu cách thành %20
            const encodedForURL = encodeURIComponent(subjectName);
            // Thay thế %20 thành + để đáp ứng yêu cầu
            const finalQueryValue = encodedForURL.replace(/%20/g, '+');

            return (
              <Link
                key={index}
                href={{
                  pathname: '/journals',
                  // Truyền giá trị đã được xử lý vào query
                  query: { areas: finalQueryValue }
                }}
                className={`flex-shrink-0 overflow-hidden rounded-lg ${imageWidth} ${imageHeight} 
                           bg-gray-20 shadow transition-shadow duration-200 hover:cursor-pointer hover:shadow-md`}
              >
                <img
                  src={imageUrl}
                  alt={`Journal or subject area: ${subjectName || `Image ${originalIndex + 1}`}`}
                  className='block h-full w-full object-cover'
                />
              </Link>
            )
          })}
          <style jsx>{`
            .group:hover > .animate-scroll-left {
              animation-play-state: paused;
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}

export default SubjectAreasJournals