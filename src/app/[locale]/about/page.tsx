"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
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

  const otherConferencesData: Conference[] = [
    {
      id: 456,
      name: 'International Conference on Software Engineering',
      shortName: 'ICSE',
      startDate: '2024-05-14',
      endDate: '2024-05-19',
      location: 'Lisbon, Portugal',
      imageUrl: '/conference_image.png',
      rank: 'Top Tier',
      averageScore: 4.8,
      topics: ['Software Engineering', 'Requirements Engineering', 'Testing', 'Agile'],
      type: 'offline',
      submissionDate: '2023-11-15',
      source: 1,
      fieldOfResearch: 'Computer Science',
      publish: true,
      website: 'https://icse.conf/',
      description: 'The premier software engineering conference.'
    },
    {
      id: 789,
      name: 'Conference on Neural Information Processing Systems',
      shortName: 'NeurIPS',
      startDate: '2024-12-08',
      endDate: '2024-12-14',
      location: 'Vancouver, Canada',
      imageUrl: '/conference_image.png',
      rank: 'Top Tier',
      averageScore: 4.9,
      topics: ['Machine Learning', 'Deep Learning', 'AI', 'Neuroscience'],
      type: 'hybrid',
      submissionDate: '2024-06-01',
      source: 1,
      fieldOfResearch: 'Computer Science',
      publish: true,
      website: 'https://neurips.cc/',
      description: 'A leading conference in machine learning and computational neuroscience.'
    },
    // Add more conference data as needed
  ];


  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShareClick = () => {
    console.log('Share button clicked');
    if (navigator.share) {
      navigator.share({
        title: conferenceData.name,
        text: conferenceData.description,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      alert('Web Share API is not supported in your browser.');
    }
  };


  const handleUpdateClick = () => {
    console.log('Update button clicked');
  };

  const handleFeedbackSubmit = (rating: number | null, comment: string) => {
    console.log('Rating:', rating);
    console.log('Comment:', comment);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className='px-10'>
      <div className="py-14 bg-background w-full"></div>
      <div className="container mx-auto py-6 px-4 rounded-lg flex flex-col md:flex-row gap-6">
        
        {/* Left Column */}
        <div className="md:w-2/3">
          {/* Image at the top */}
          <div className="relative  rounded-lg overflow-hidden">
            <Image
              src={conferenceData.imageUrl}
              alt={`${conferenceData.name} - secondary`}
              width={800}
              height={400}
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            />
          </div>

          {/* Buttons below the image */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleShareClick}
              variant="secondary"
              size="medium"
              rounded
              className={`mr-2 w-24 hover:opacity-90`} // Hover effect
            >
              Share
            </Button>
            <Button
              onClick={handleFollowClick}
              variant={isFollowing ? 'primary' : 'secondary'}
              size="medium"
              rounded
              className={`mr-2 w-24 hover:opacity-90`} // Hover and Followed color
            >
              {isFollowing ? 'Followed' : 'Follow'}
            </Button>
            <Button
              onClick={handleUpdateClick}
              variant="secondary"
              size="medium"
              rounded
              className="w-24 hover:opacity-90" // Hover effect
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
        <div className="md:w-1/3 ">
          <section className="overflow-x-auto relative bg-background-secondary p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-left mb-4">{t('Conference Details')}</h3>

<table className="w-full text-md text-left border-collapse">
  <thead className="text-md ">
    <tr className="border-b ">
      <th scope="col" className="px-3 py-3 font-semibold text-left">Title</th>
      <th scope="col" className="px-3 py-3 font-semibold text-left">Details</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Start Date')}</td>
      <td className="px-3 py-2">{formatDate(conferenceData.startDate)}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('End Date')}</td>
      <td className="px-3 py-2">{formatDate(conferenceData.endDate)}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Location')}</td>
      <td className="px-3 py-2">{conferenceData.location}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Website')}</td>
      <td className="px-3 py-2">
        <a
          href={conferenceData.website}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {conferenceData.website.length > 30 ? `${conferenceData.website.substring(0, 30)}...` : conferenceData.website}
        </a>
      </td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Rank')}</td>
      <td className="px-3 py-2">{conferenceData.rank}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Type')}</td>
      <td className="px-3 py-2" >{conferenceData.type}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Submission Date')}</td>
      <td className="px-3 py-2">{formatDate(conferenceData.submissionDate)}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Field')}</td>
      <td className="px-3 py-2">{conferenceData.fieldOfResearch}</td>
    </tr>

    <tr className="border-b  ">
      <td className="px-3 py-2 font-semibold">{t('Average Score')}</td>
      <td className="px-3 py-2">{conferenceData.averageScore} / 5</td>
    </tr>
  </tbody>
</table>
          </section>

          {/* Other Conferences in right column */}
          <section className="mt-8 overflow-x-auto relative bg-background-secondary p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-left mb-4">{t('Other Conferences')}</h3>
            <ul>
              {otherConferencesData.map((conf) => (
                <li key={conf.id} className="mb-4    hover:cursor-pointer rounded-md"> {/* Hover effect and cursor */}
                  <div className="flex items-start">
                    <div className="flex justify-center mr-4 w-20 h-16 relative">
                    <Image
                    src={conf.imageUrl}
                    alt={conf.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-md"
                    />
                    </div>
                  <div>
                    <h4 className="font-semibold text-left">{conf.shortName}</h4>
                    <p className="text-sm text-left">{formatDate(conf.startDate)} - {formatDate(conf.endDate)}</p>
                  </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-center mt-4">
              <a href="" className="text-blue-500 hover:underline"> 
                {t('View All Conferences')}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}