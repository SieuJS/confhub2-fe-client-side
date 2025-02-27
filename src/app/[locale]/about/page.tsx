"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useMemo } from 'react'; // Import useMemo
import Button from '../components/Button';
import ConferenceFeedback from '../components/ConferenceFeedback';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse type
import conferenceList from '../../../models/data/conferences-list.json'; // Import conferenceList JSON data

// Removed interface Conference and using ConferenceResponse type alias instead
type Conference = ConferenceResponse;

export default function About() {
  const t = useTranslations('');

  // Use useMemo to ensure conferenceData and otherConferencesData are only computed once
  const conferenceData: Conference = useMemo(() => {
    return conferenceList[0] as Conference; // Get the first conference from the list and type assert
  }, []); // Empty dependency array means it only runs once on mount

  const otherConferencesData: Conference[] = useMemo(() => {
    return conferenceList.slice(1, 3) as Conference[]; // Get the second and third conferences and type assert
  }, []); // Empty dependency array means it only runs once on mount


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
            <div className="">

            <Button
              onClick={handleFollowClick}
              variant="primary"
              size="medium"
              rounded
              advanced
              advancedDivColor="p-4" // Advanced color
              className={` w-24 hover:opacity-90`} // Hover and Followed color
            >
              {isFollowing ? 'Followed' : 'Follow'}
            </Button>
            </div>
            <div className="py-4 px-2">

            <Button
              onClick={handleUpdateClick}
              variant="secondary"
              size="medium"
              rounded
              className="mr-2 w-24 hover:opacity-90" // Hover effect
            >
              Update
            </Button>
            </div>
            <div className="py-4 px-2">

            <Button
              onClick={handleShareClick}
              variant="secondary"
              size="medium"
              rounded
              className={`mr-2 w-24 hover:opacity-90`} // Hover effect
            >
              Share
            </Button>
            </div>
          </div>


          <div className="flex justify-between items-center mt-4">
            <p className="text-lg">{formatDate(conferenceData.startDate)} - {formatDate(conferenceData.endDate)}</p>
            <div>
              <span>{conferenceData.acronym}</span> {/* shortName to acronym */}
            </div>
          </div>

          <h2 className=" font-bold text-left text-4xl mt-2">{conferenceData.name}</h2>


          <p className="text-left mt-4">{conferenceData.description}</p>

          <div className="flex items-center mt-6 text-left">
            <span className="font-semibold mr-2 pb-2">Topics:</span>
            <div className="flex flex-wrap">
              {conferenceData.topics.map((topic, index) => (
                <span key={index} className="bg-background-secondary  rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          <ConferenceFeedback onSubmitFeedback={handleFeedbackSubmit} />
        </div>


        {/* Right Column */}
        <div className="md:w-1/3 ">
          <section className="overflow-x-auto relative bg-gradient-to-r from-background to-background-secondary p-6 rounded-lg shadow-md">
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
                  href={conferenceData.link} // website to link
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {conferenceData.link.length > 30 ? `${conferenceData.link.substring(0, 30)}...` : conferenceData.link} {/* website to link */}
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
              <td className="px-3 py-2">{conferenceData.category}</td> {/* fieldOfResearch to category */}
            </tr>
          </tbody>
        </table>
          </section>

          {/* Other Conferences in right column */}
          <section className="mt-8 overflow-x-auto relative bg-gradient-to-r from-background to-background-secondary p-6 rounded-lg shadow-md">
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
                    <h4 className="font-semibold text-left">{conf.acronym}</h4> {/* shortName to acronym */}
                    <p className="text-sm text-left">{formatDate(conf.startDate)} - {formatDate(conf.endDate)}</p>
                  </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-center mt-4">
              <a href="" className=" hover:underline">
                {t('View All Conferences')}
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}