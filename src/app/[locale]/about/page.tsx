"use client";

import { useTranslations } from 'next-intl';
import SearchSection from '../components/SearchSection';
import Image from 'next/image';
import { useState } from 'react'; // Import useState
import Button from '../components/Button';
import ConferenceFeedback from '../components/ConferenceFeedback';

interface Conference {
  imageUrl: string;
  datePosted: string;
  postedBy: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  website: string;
}

export default function About() {
  const t = useTranslations('');

  const conferenceData: Conference = {
    imageUrl: '/conference_image.png',
    datePosted: '2 Feb, 2025',
    postedBy: 'Confhub',
    title: 'ACM ASIA Conference on Computer and Communications Security',
    description:
      'CITA 2025 will be co-organized by Vietnam-Korea University of Information and Communication Technology (Vietnam), Cambodia Academy of Digital Technology (Cambodia) and King Mongkut\'s University of Technology North Bangkok (Thailand). The conference will take place in Phnom Penh, Cambodia on July 14-15, 2025. Phnom Penh, situated at the confluence of three rivers, the mighty Mekong, the Bassac and the great Tonle Sap, is the capital of Cambodia. The capital city has charm and tranquility with tree-lined boulevards amidst monumental Angkoriant architecture.',
    dateTime: 'Tue, Jan 21, 2025\nWed, Jan 22, 2025',
    location: '12 Dien Bien Phu,\nHo Chi Minh city',
    website: 'https://conference.com/infor/callforpapers',
  };

  const [isFollowing, setIsFollowing] = useState(false); // State for follow status

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const handleFeedbackSubmit = (rating: number | null, comment: string) => {
    // This function will be called when the feedback is submitted
    console.log('Rating:', rating);
    console.log('Comment:', comment);
    // In a real app, you'd send this data to your backend
  };

  return (
    <div className='px-10 py-10 text-center text-2xl'>

      <div className="grid grid-cols-5 gap-4 pt-10">
        <div className="col-span-1">
          <div className="relative">
            <Image
              src={conferenceData.imageUrl}
              alt={conferenceData.title}
              width={400}
              height={200} // Adjust height as needed
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              className="w-full" // Ensure image takes full width
            />
          </div>
        </div>

        <div className="col-span-3">
        <div className="relative">
            <Image
              src={conferenceData.imageUrl}
              alt={conferenceData.title}
              width={400}
              height={200} // Adjust height as needed
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              className="w-full" // Ensure image takes full width
            />
          </div>

            <div className="flex justify-end mt-2"> {/* Align button to the right and add top margin */}
              <Button
              onClick={handleFollowClick}
              variant="primary"
              size="medium"
              rounded
              className={`mr-2 w-24 ${isFollowing ? 'bg-green-500' : 'bg-blue-500'}`} // Change color based on follow status
              >
              {isFollowing ? 'Followed' : 'Follow'}
              </Button>
            </div>

          <div className="flex justify-between items-center">  {/* Aligned items vertically */}
              <p>{conferenceData.dateTime}</p>
              <div>
                  
                  <span>Post by {conferenceData.postedBy}</span>
              </div>
          </div>


          <h2 className=" font-bold text-left">{conferenceData.title}</h2>

          <p className="text-left">{conferenceData.description}</p>


          <ConferenceFeedback onSubmitFeedback={handleFeedbackSubmit} />
        </div>


        {/* cột phải */}
        <div className="col-span-1">
          <section className="bg-background-secondary">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-left">{conferenceData.dateTime}</span>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span className="text-left">{conferenceData.location}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-3-3a2 2 0 112.828-2.828l3 3a2 2 0 012.828 0l3-3z" />
              </svg>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <a
                  href={conferenceData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {conferenceData.website}
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}