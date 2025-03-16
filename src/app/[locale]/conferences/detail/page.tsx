// page.tsx
"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useRef } from 'react'; // Removed useEffect
import Button from '../../utils/Button';
import ConferenceFeedback from '../../conferences/detail/ConferenceFeedback';
import NotFoundPage from "../../utils/NotFoundPage";
import Loading from "../../utils/Loading";
import { ConferenceTabs } from '../../conferences/detail/ConferenceTabs';
import { useSearchParams } from 'next/navigation';
import { Header } from '../../utils/Header';
import Footer from '../../utils/Footer';

// Import the custom hooks
import useConferenceData from '../../../../hooks/conferenceDetails/useConferenceData';
import useFollowConference from '../../../../hooks/conferenceDetails/useFollowConference';
import useShareConference from '../../../../hooks/conferenceDetails/useShareConference';
import useClickOutside from '../../../../hooks/conferenceDetails/useClickOutside';
import useTopicsDisplay from '../../../../hooks/conferenceDetails/useTopicsDisplay';
import useFormatConferenceDates from '../../../../hooks/conferenceDetails/useFormatConferenceDates';


interface EventCardProps {
    locale: string;
}

const Detail: React.FC<EventCardProps> = ({ locale }: EventCardProps) => {
    const t = useTranslations('');
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    // Use the hooks
    const { conferenceData, error, loading } = useConferenceData(id);
    const { isFollowing, handleFollowClick } = useFollowConference(conferenceData);
    const { handleShareClick } = useShareConference(conferenceData);
    const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } = useTopicsDisplay(conferenceData?.organization.topics);
    const { dateDisplay } = useFormatConferenceDates(conferenceData?.dates);


    const [openMenu, setOpenMenu] = useState<"share" | "calendar" | null>(null);
    const shareButtonRef = useRef<HTMLButtonElement>(null);
    const [updating, setUpdating] = useState(false); // Still in the component, could be a hook if needed

    const toggleShareMenu = () => {
        setOpenMenu(prev => prev === "share" ? null : "share");
    };
    const toggleCalendarMenu = () => {
        setOpenMenu(prev => prev === "calendar" ? null : "calendar");
    };

    const closeMenu = () => {
        setOpenMenu(null);
    }

    useClickOutside(shareButtonRef, closeMenu);

    const renderShareMenu = () => {
        if (openMenu !== "share") {
            return null;
        }
        return (
          <div className="absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-red p-2">
            <Button
              onClick={() => { handleShareClick('facebook'); closeMenu(); }}
              variant="secondary"
              size="small"
              className="px-2 py-2 text-sm w-full text-left flex items-center mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook mr-2" viewBox="0 0 16 16">
                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
              </svg>
              Share on Facebook
            </Button>
            <Button
              onClick={() => { handleShareClick('twitter'); closeMenu(); }}
              variant="secondary"
              size="small"
              className="px-2 py-2 text-sm w-full text-left flex items-center mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x mr-2" viewBox="0 0 16 16">
                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
              </svg>
              Share on X
            </Button>
            <Button
              onClick={() => { handleShareClick('reddit'); closeMenu(); }}
              variant="secondary"
              size="small"
              className="px-2 py-2 text-sm w-full text-left flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reddit mr-2" viewBox="0 0 16 16">
                <path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z" />
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028a.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165" />
              </svg>
              Share on Reddit
            </Button>
          </div>
        );
    };


    const handleFeedbackSubmit = (rating: number | null, comment: string) => { // Could also be a hook
        console.log('Rating:', rating);
        console.log('Comment:', comment);
    };

    const { conference, organization, locations } = conferenceData || {};


    if (error === "Conference not found") {
        return <NotFoundPage />;
    }
    if (loading) return <Loading />;


    return (
        <div>
            <Header locale={locale} />

            <div className='relative'>
                {updating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <Loading />
                    </div>
                )}
                <div className='px-10'>
                    <div>
                        <div className="py-12 w-full"></div>
                        <div className="container mx-auto py-6 px-4 rounded-lg flex flex-col md:flex-row gap-6">
                            {/* Left Column */}
                            <div className="md:w-4/5">
                                <div className="relative">
                                    <div className="flex mt-4">
                                        <Image
                                            src={'/bg-2.jpg'}
                                            alt={`Logo`}
                                            width="300"
                                            height="300"
                                            className="mr-4"
                                            style={{ objectFit: 'contain' }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-red-500 text-sm">{dateDisplay}</p>
                                            <h2 className="font-bold text-left text-4xl mt-0">{conference?.title}</h2>
                                            <p className="text-gray-600 text-sm mt-1">
                                                4.5 (89 Ratings)
                                            </p>
                                            <p className="text-blue-500 text-sm mt-2 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                </svg>
                                                {locations?.cityStateProvince}, {locations?.country}
                                                <a href="#" className="ml-1 text-blue-700 hover:underline"> Get Directions
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 inline ml-1">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H12m-2 1a5.5 5.5 0 00-5.5 5.5V18m0-10.5A5.5 5.5 0 018 7m3 3h7.5m-7.5 3l3-3m-3 3l-3-3m3 3V15m-6-1.5a5.5 5.5 0 00-5.5 5.5V21m0-3.5A5.5 5.5 0 018 18.5" />
                                                    </svg>
                                                </a>
                                            </p>
                                        </div>
                                    </div>


                                    <div className="flex items-center mt-6 text-left">
                                        <div className="flex flex-col">
                                            <div className="flex flex-wrap">
                                                <span className="font-semibold mr-2 pb-2">Topics:</span>
                                                <div className="flex flex-wrap">
                                                    {displayedTopics.map((topic, index) => (
                                                        <span key={index} className="bg-background-secondary rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                    {hasMoreTopics && !showAllTopics && (
                                                        <Button variant="primary" size="small" onClick={() => setShowAllTopics(true)}>
                                                            View More
                                                        </Button>
                                                    )}
                                                    {hasMoreTopics && showAllTopics && (
                                                        <Button variant="primary" size="small" onClick={() => setShowAllTopics(false)}>
                                                            View Less
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="md:w-1/5 ">
                                <div className="flex flex-col items-end">

                                    <div className="flex flex-row items-center w-full justify-end space-x-2">
                                        <div className="">
                                            <Button
                                                onClick={toggleCalendarMenu}
                                                variant="secondary"
                                                size="medium"
                                                rounded
                                                className="hover:opacity-90 p-2 flex items-center max-h-10"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 mr-2">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                                                </svg>
                                                Add Calendar
                                            </Button>
                                        </div>
                                        <div className="">
                                            <Button
                                                // ref={shareButtonRef}
                                                onClick={toggleShareMenu}
                                                variant="secondary"
                                                size="medium"
                                                rounded
                                                className="hover:opacity-90 p-2 flex items-center max-h-10"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                                </svg>
                                                Share
                                            </Button>
                                        </div>
                                        {renderShareMenu()}
                                    </div>

                                    <div className="mt-6 flex flex-col gap-2 w-full">
                                        <Button
                                            onClick={handleFollowClick}
                                            variant={isFollowing ? 'primary' : 'secondary'}
                                            size="medium"
                                            rounded
                                            className={`hover:opacity-90 w-full`}
                                        >
                                            {isFollowing ? 'Followed' : 'Follow'}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="medium"
                                            rounded
                                            className={`hover:opacity-90 w-full ${updating ? '' : ''}`}
                                        >
                                            {updating ? 'Updating' : 'Update'}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (organization?.link) {
                                                    window.open(organization.link, '_blank');
                                                } else {
                                                    alert("Website link is not available.");
                                                }
                                            }}
                                            variant="secondary"
                                            size="medium"
                                            rounded
                                            className={`hover:opacity-90 w-full`}
                                        >
                                            Link website
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <ConferenceTabs conference={conferenceData} />
                        <ConferenceFeedback />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Detail;