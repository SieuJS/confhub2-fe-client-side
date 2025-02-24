"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react'; // Import useState
import Button from '../components/Button';
import ConferenceFeedback from '../components/ConferenceFeedback';

interface Conference {
  id: number;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  rank: string;
  averageScore: number;
  topics: string[];
  type: 'online' | 'offline' | 'hybrid';
  submissionDate: string;
  source: number;
  fieldOfResearch: string;
  publish: boolean;
  website: string;
  description: string;
}

export default function About() {
  const t = useTranslations('');

  const conferenceData: Conference = {
    id: 123,
    name: 'ACM ASIA Conference on Computer and Communications Security',
    shortName: 'ASIACCS',
    startDate: '2025-01-21',
    endDate: '2025-01-22',
    location: 'Phnom Penh, Cambodia',
    imageUrl: '/conference_image.png',
    rank: 'Top Tier',
    averageScore: 4.5,
    topics: ['Computer Security', 'Communications Security', 'Cryptography', 'Network Security'],
    type: 'hybrid',
    submissionDate: '2024-10-15',
    source: 1,
    fieldOfResearch: 'Computer Science',
    publish: true,
    website: 'https://conference.com/infor/callforpapers',
    description:
      'CITA 2025 will be co-organized by Vietnam-Korea University of Information and Communication Technology (Vietnam), Cambodia Academy of Digital Technology (Cambodia) and King Mongkut\'s University of Technology North Bangkok (Thailand). The conference will take place in Phnom Penh, Cambodia on July 14-15, 2025. Phnom Penh, situated at the confluence of three rivers, the mighty Mekong, the Bassac and the great Tonle Sap, is the capital of Cambodia. The capital city has charm and tranquility with tree-lined boulevards amidst monumental Angkoriant architecture.',
  };

  const [isFollowing, setIsFollowing] = useState(false); // State for follow status

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const handleUpdateClick = () => {
    // Handle update logic here
    console.log('Update button clicked');
    // You can add functionality to update conference details or navigate to an edit page
  };

  const handleFeedbackSubmit = (rating: number | null, comment: string) => {
    // This function will be called when the feedback is submitted
    console.log('Rating:', rating);
    console.log('Comment:', comment);
    // In a real app, you'd send this data to your backend
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className='px-10'> {/* Removed py-10 and text-2xl */}
      <div className="py-14 bg-background w-full"></div>
      <div className="grid grid-cols-5 gap-4 pt-10">
        <div className="col-span-1">
          <div className="relative">
            <Image
              src={conferenceData.imageUrl}
              alt={conferenceData.name}
              width={400}
              height={200} // Adjust height as needed
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              className="w-full rounded-lg" // Ensure image takes full width and rounded corners
            />
          </div>
        </div>

        <div className="col-span-3">
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleFollowClick}
              variant="primary"
              size="medium"
              rounded
              className={`mr-2 w-24 ${isFollowing ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isFollowing ? 'Followed' : 'Follow'}
            </Button>
            <Button
              onClick={handleUpdateClick}
              variant="secondary" // Or another appropriate variant
              size="medium"
              rounded
              className="w-24" // Adjust width as needed
            >
              Update
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-lg">{formatDate(conferenceData.startDate)} - {formatDate(conferenceData.endDate)}</p>
            <div>
              <span>{conferenceData.shortName}</span>
            </div>
          </div>

          <h2 className=" font-bold text-left text-4xl mt-2">{conferenceData.name}</h2>

          <p className="text-left mt-4">{conferenceData.description}</p>

          <div className="flex items-center mt-6 text-left">
            <span className="font-semibold mr-2">Topics:</span>
            <div className="flex flex-wrap">
              {conferenceData.topics.map((topic, index) => (
                <span key={index} className="bg-gray-200 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <ConferenceFeedback onSubmitFeedback={handleFeedbackSubmit} />
        </div>


        {/* Right Column */}
        <div className="col-span-1">
          <section className="bg-background-secondary p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-left mb-4">{t('Conference Details')}</h3>

            <div className="mb-3">
              <div className="text-left">
                <p><span className="font-semibold">{t('Start Date')}:</span> {formatDate(conferenceData.startDate)}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-left">
                <p><span className="font-semibold">{t('End Date')}:</span> {formatDate(conferenceData.endDate)}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-left">
                <p><span className="font-semibold">{t('Location')}:</span> {conferenceData.location}</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-left">
                <p><span className="font-semibold">{t('Website')}:</span>
                <a
                  href={conferenceData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {conferenceData.website}
                </a>
                </p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-left"><span className="font-semibold">{t('Rank')}:</span> {conferenceData.rank}</p>
            </div>

            <div className="mb-3">
              <p className="text-left"><span className="font-semibold">{t('Type')}:</span> <span className="capitalize">{conferenceData.type}</span></p>
            </div>

            <div className="mb-3">
              <p className="text-left"><span className="font-semibold">{t('Submission Date')}:</span> {formatDate(conferenceData.submissionDate)}</p>
            </div>

            <div className="mb-3">
              <p className="text-left"><span className="font-semibold">{t('Field')}:</span> {conferenceData.fieldOfResearch}</p>
            </div>

            <div className="mb-3">
              <p className="text-left"><span className="font-semibold">{t('Average Score')}:</span> {conferenceData.averageScore} / 5</p>
            </div>

          </section>
        </div>
      </div>
    </div>
  )
}