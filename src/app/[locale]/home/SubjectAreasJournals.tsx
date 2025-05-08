// src/components/SubjectAreasJournals.tsx
import React from 'react'
import { useTranslations } from 'next-intl'

// Define the array of image paths directly in the component.
// These paths are relative to the 'public' folder.
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
  '/images/journals/11.png',
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
  // Add more image paths here
]

interface SubjectAreasJournalsProps {
  /** Optional animation speed (e.g., '40s', '20s'). Default is '40s'. */
  speed?: string
  /** Optional height for the image containers (Tailwind class, e.g., 'h-32'). Default is 'h-32'. */
  imageHeight?: string
  /** Optional width for the image containers (Tailwind class, e.g., 'w-40'). Default is 'w-40'. */
  imageWidth?: string
  /** Optional Tailwind classes for the inner container (spacing between images, vertical padding). Default is 'space-x-4 py-4'. */
  innerClasses?: string
  /** Optional Tailwind classes for the outer container padding (left and right space). Default is 'px-4'. */
  outerPaddingClasses?: string // New prop for outer padding
}

const SubjectAreasJournals: React.FC<SubjectAreasJournalsProps> = ({
  speed = '100s', // Default animation duration
  imageHeight = 'h-40', // Default image container height
  imageWidth = 'w-40', // Default image container width
  innerClasses = 'space-x-4 py-4' // Default inner spacing/padding
}) => {
  const t = useTranslations()

  // Use the locally defined array
  const imagesToDisplay = journalImagePaths

  // Basic check if there are images to display
  if (!imagesToDisplay || imagesToDisplay.length === 0) {
    return (
      <div className='py-8 text-center '>
        {t('No_images_available_to_scroll')}
      </div>
    )
  }

  // Duplicate the images array to create the seamless loop effect
  const duplicatedImages = [...imagesToDisplay, ...imagesToDisplay]

  return (
    // Add outerPaddingClasses to the outer div
    <div className='container mx-auto py-8'>
      <h1 className='mb-6 text-center text-2xl font-bold'>
        {t('Subject_areas_journals')}
      </h1>
      <div className={`relative w-full overflow-hidden px-4`}>
        <div
          className={`animate-scroll-left group flex w-max ${innerClasses}`}
          style={{ '--scroll-speed': speed } as React.CSSProperties}
        >
          {duplicatedImages.map((imageUrl, index) => (
            // Use a unique key for each item in the mapped array.
            // Using the index of the *duplicated* array is sufficient here.
            <div
              key={index}
              className={`flex-shrink-0 overflow-hidden rounded-lg ${imageWidth} ${imageHeight} bg-gray-20`}
            >
              <img
                // Use the image path from the array
                src={imageUrl}
                // Alt text reflecting the original index using the original array length
                alt={`Journal or subject area ${(index % imagesToDisplay.length) + 1}`}
                className='block h-full w-full object-cover' // Ensure image covers the container
              />
            </div>
          ))}
          {/* Optional: Pause animation on hover */}
          <style jsx>{`
            /* Apply pause animation state on group hover to the animated child */
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
