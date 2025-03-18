// page.tsx
"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useRef } from 'react';
import Button from '../../utils/Button';
import ConferenceFeedback from '../../conferences/detail/ConferenceFeedback';
import NotFoundPage from "../../utils/NotFoundPage";
import Loading from "../../utils/Loading"; // Consistent path
import { ConferenceTabs } from '../../conferences/detail/ConferenceTabs';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Header } from '../../utils/Header';
import Footer from '../../utils/Footer';

// Import the custom hooks
import useConferenceData from '../../../../hooks/conferenceDetails/useConferenceData';
import useFollowConference from '../../../../hooks/conferenceDetails/useFollowConference';
import useShareConference from '../../../../hooks/conferenceDetails/useShareConference';
import useClickOutside from '../../../../hooks/conferenceDetails/useClickOutside';
import useTopicsDisplay from '../../../../hooks/conferenceDetails/useTopicsDisplay';
import useFormatConferenceDates from '../../../../hooks/conferenceDetails/useFormatConferenceDates';
import useAddToCalendar from '../../../../hooks/conferenceDetails/useAddToCalendar';


interface EventCardProps {
    locale: string;
}

const Detail: React.FC<EventCardProps> = ({ locale }: EventCardProps) => {
    const t = useTranslations('');
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const pathname = usePathname();

    const { conferenceData, error, loading } = useConferenceData(id);
    const { isFollowing, handleFollowClick } = useFollowConference(conferenceData);
    const { isAddToCalendar, handleAddToCalendar } = useAddToCalendar(conferenceData);

    const { handleShareClick } = useShareConference(conferenceData);
    const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } = useTopicsDisplay(conferenceData?.organization.topics);
    const { dateDisplay } = useFormatConferenceDates(conferenceData?.dates);

    const [openMenu, setOpenMenu] = useState<"share" | "calendar" | null>(null);
    const shareButtonRef = useRef<HTMLButtonElement>(null);
    const [updating, setUpdating] = useState(false);

    const toggleShareMenu = () => {
        setOpenMenu(prev => prev === "share" ? null : "share");
    };

    const closeMenu = () => {
        setOpenMenu(null);
    }

    useClickOutside(shareButtonRef, closeMenu);

    const renderShareMenu = () => {
        if (openMenu !== "share") return null;

        return (
            <div className="absolute z-20 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                    <button
                        onClick={() => { handleShareClick('facebook'); closeMenu(); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook mr-2" viewBox="0 0 16 16">
                                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                            </svg>
                            Share on Facebook
                        </span>
                    </button>
                    <button
                        onClick={() => { handleShareClick('twitter'); closeMenu(); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x mr-2" viewBox="0 0 16 16">
                                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                            </svg>
                            Share on X
                        </span>
                    </button>
                    <button
                        onClick={() => { handleShareClick('reddit'); closeMenu(); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                        <span className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reddit mr-2" viewBox="0 0 16 16">
                                <path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z" />
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028a.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165" />
                            </svg>
                            Share on Reddit
                        </span>
                    </button>
                </div>
            </div>
        );
    };

    const handleTopicClick = (topic: string) => {
        const newParams = new URLSearchParams();
        newParams.append('topics', topic);
        const localePrefix = pathname.split('/')[1];
        router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
    };

    const handleFeedbackSubmit = (rating: number | null, comment: string) => {
        console.log('Rating:', rating);
        console.log('Comment:', comment);
    };

    const { conference, organization, locations } = conferenceData || {};

    if (error === "Conference not found") {
        return <NotFoundPage />;
    }
    if (loading) return <Loading />;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header locale={locale} />

            <div className="pt-20 flex-grow container mx-auto px-4 py-8">
                {/* px and py on container */}
                {updating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <Loading />
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-6"> {/* Main content wrapper */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left Column */}
                        <div className="md:w-4/5">  {/* Adjusted width */}
                            <div className="flex flex-col md:flex-row items-start"> {/* Wrap image and details */}
                                <div className="md:w-1/4 mb-4 md:mb-0"> {/* Image container */}
                                    <Image
                                        src={'/bg-2.jpg'}
                                        alt={`Logo`}
                                        width={300}
                                        height={300}
                                        className="rounded-lg w-full h-auto"  // Make image responsive
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div className="md:w-3/4 md:pl-6">    {/* Text details container */}
                                    <p className="text-red-500 text-sm font-semibold">{dateDisplay}</p>
                                    <h1 className="font-bold text-3xl md:text-3xl mt-1 mb-2">{conference?.title}</h1>
                                    <p className="text-gray-600 text-sm">
                                        4.5 <span className="text-gray-500">(89 Ratings)</span> {/* Add span here */}
                                    </p>
                                    <a href="#map" className="text-blue-600 text-sm mt-1 flex items-center hover:underline">                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                        {locations?.cityStateProvince}, {locations?.country}
                                    </a>

                                </div>
                            </div>

                            <div className="mt-2">
                                <h2 className="font-semibold text-lg mb-2">Topics:</h2>
                                <div className="flex flex-wrap">
                                    {displayedTopics.map((topic, index) => (
                                        <button
                                            key={index}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-3 py-1 text-sm font-semibold mr-2"
                                            onClick={() => handleTopicClick(topic)}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                    {hasMoreTopics && (
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 py-1 text-sm font-semibold mr-2"
                                            onClick={() => setShowAllTopics(!showAllTopics)}
                                        >
                                            {showAllTopics ? 'View Less' : 'View More'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="md:w-1/5">
                            <div className="sticky top-4">
                                <div className="flex flex-col gap-3"> {/* Removed items-stretch */}
                                    <Button
                                        onClick={handleAddToCalendar}
                                        variant={isAddToCalendar ? 'primary' : 'secondary'}
                                        size="small"
                                        className="flex items-center justify-start gap-x-4 mx-14" // Added justify-start and gap-x-4 mx-14
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M8 2v4" />
                                            <path d="M16 2v4" />
                                            <rect width="18" height="18" x="3" y="4" rx="2" />
                                            <path d="M3 10h18" />
                                            <path d="M8 14h.01" />
                                            <path d="M12 14h.01" />
                                            <path d="M16 14h.01" />
                                            <path d="M8 18h.01" />
                                            <path d="M12 18h.01" />
                                            <path d="M16 18h.01" />
                                        </svg>
                                        {isAddToCalendar ? 'Added' : 'Calendar'}
                                    </Button>

                                    <Button
                                        onClick={toggleShareMenu}
                                        variant="secondary"
                                        size="small"
                                        className="flex items-center justify-start gap-x-4 mx-14" // Added justify-start and gap-x-4 mx-14
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                                        </svg>
                                        Share
                                    </Button>
                                    {renderShareMenu()}

                                    <Button
                                        onClick={handleFollowClick}
                                        variant={isFollowing ? 'primary' : 'secondary'}
                                        size="small"
                                        className="flex items-center justify-start gap-x-4 mx-14" // Added justify-start and gap-x-4 mx-14
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                                        </svg>
                                        {isFollowing ? 'Followed' : 'Follow'}
                                    </Button>

                                    <Button
                                        variant={'secondary'}
                                        size="small"
                                        className={`flex items-center justify-start gap-x-4 mx-14 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`} // Added justify-start and gap-x-4 mx-14, kept opacity
                                        disabled={updating}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                            <path d="M16 16h5v5" />
                                        </svg>
                                        {updating ? 'Updating...' : 'Update'}
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            if (organization?.link) {
                                                window.open(organization.link, '_blank');
                                            } else {
                                                alert("Website link is not available.");
                                            }
                                        }}
                                        variant={'secondary'}
                                        size="small"
                                        className="flex items-center justify-start gap-x-4 mx-14" // Added justify-start and gap-x-4 mx-14
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                            <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                                            <path d="m21 3-9 9" />
                                            <path d="M15 3h6v6" />
                                        </svg>
                                        Website
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ConferenceTabs conference={conferenceData} />
                </div>

                <div className="mt-8 bg-white rounded-lg shadow-md p-6"> {/* Feedback section */}
                    <ConferenceFeedback />
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default Detail;
