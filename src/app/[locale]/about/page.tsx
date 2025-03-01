"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useMemo, useEffect, useRef } from 'react'; // Import useMemo
import Button from '../components/Button';
import ConferenceFeedback from '../components/ConferenceFeedback';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse type
import conferenceList from '../../../models/data/conferences-list.json'; // Import conferenceList JSON data
import Map from '../components/Map';
import * as ics from 'ics';

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
    const [openMenu, setOpenMenu] = useState<"share" | "calendar" | null>(null); // State chung
    const shareButtonRef = useRef<HTMLButtonElement>(null);

    const handleFollowClick = () => {
        setIsFollowing(!isFollowing);
    };

    const handleShareClick = (platform: 'facebook' | 'twitter' | 'reddit') => {
        const conferenceDates = conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates"); // Find main conference dates
        const startDate = conferenceDates?.startDate;
        const endDate = conferenceDates?.endDate;

        const shareText = `📢 ${conferenceData.name}\n📅 Thời gian: ${startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Dates not available'}\n📍 Địa điểm: ${conferenceData.location}\n🔗 Chi tiết: ${conferenceData.link}`;
        const shareUrl = encodeURIComponent(conferenceData.link || window.location.href);
        const encodedText = encodeURIComponent(shareText);

        let shareLink = '';

        switch (platform) {
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
                break;
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodedText}`;
                break;
            case 'reddit':
                shareLink = `https://www.reddit.com/submit?url=${shareUrl}&title=${encodedText}`;
                break;
            default:
                console.error('Unsupported platform');
                return;
        }

        window.open(shareLink, '_blank', 'width=600,height=400');
    };


    const handleUpdateClick = () => {
        console.log('Update button clicked');
    };

    const handleFeedbackSubmit = (rating: number | null, comment: string) => {
      console.log('Rating:', rating);
      console.log('Comment:', comment);
    };


    const formatDate = (dateString: string | undefined): string => { // Allow undefined input
        if (!dateString) return 'N/A'; // Return N/A if dateString is undefined
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    function createGoogleCalendarLink(conference: Conference) {
        const conferenceDates = conference.conferenceDates.find(date => date.dateName === "Conference Dates"); // Find main conference dates
        const startDate = conferenceDates?.startDate;
        const endDate = conferenceDates?.endDate;

        const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : new Date(); // Default to current date if not found
        const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : new Date();     // Default to current date if not found


        const start = startDateObj.toISOString().replace(/-|:|\.\d+/g, '');
        const end = endDateObj.toISOString().replace(/-|:|\.\d+/g, '');

        const details = `📢 ${conference.name}\n📅 Thời gian: ${startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Dates not available'}\n📍 Địa điểm: ${conference.location}\n🔗 Chi tiết: ${conference.link}`;


        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: conference.name,
            dates: `${start}/${end}`,
            details: details,
            location: conference.location,
            trp: 'false', // Optional: Show/hide "Add to my calendar" button (true/false)
            sprop: `website:${conferenceData.link}`, //Optional. Good practice
            // ctz: 'Asia/Ho_Chi_Minh', // Time zone (optional, but recommended!)
        });

        return `https://www.google.com/calendar/render?${params.toString()}`;
    }


    function createICalendarEvent(conference: Conference) {
        const conferenceDates = conference.conferenceDates.find(date => date.dateName === "Conference Dates"); // Find main conference dates
        const startDate = conferenceDates?.startDate;
        const endDate = conferenceDates?.endDate;

        const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : new Date(); // Default to current date if not found
        const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : new Date();     // Default to current date if not found


        const start = [
            startDateObj.getFullYear(),
            startDateObj.getMonth() + 1, //getMonth() trả về 0-11
            startDateObj.getDate(),
            startDateObj.getHours(),
            startDateObj.getMinutes(),
        ];

        const end = [
            endDateObj.getFullYear(),
            endDateObj.getMonth() + 1,
            endDateObj.getDate(),
            endDateObj.getHours(),
            endDateObj.getMinutes(),
        ];
        const event: ics.EventAttributes = {
            start: start as ics.DateArray,
            end: end as ics.DateArray,
            title: conference.name,
            description: `📢 ${conferenceData.name}\n📅 Thời gian: ${startDate && endDate ? `${formatDate(startDate)} - ${formatDate(endDate)}` : 'Dates not available'}\n📍 Địa điểm: ${conference.location}\n🔗 Chi tiết: ${conference.link}`,
            location: conference.location,
            url: conferenceData.link,
            organizer: { name: 'Conference Organizer' }, // Add organizer info if available
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
        };

        const { error, value } = ics.createEvent(event);

        if (error) {
            console.error('Error creating iCalendar event:', error);
            return null; // Or handle the error appropriately
        }
        // console.log(value);
        return value; // This is the iCalendar data as a string.
    }

    const handleAddToCalendar = (type: 'google' | 'ical') => {
        if (type === 'google') {
            const googleLink = createGoogleCalendarLink(conferenceData);
            window.open(googleLink, '_blank');
        } else if (type === 'ical') {
            const icalData = createICalendarEvent(conferenceData);
            if (icalData) {
                const blob = new Blob([icalData], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const conferenceDates = conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates"); // Find main conference dates
                const startDate = conferenceDates?.startDate;
                const conferenceDate = startDate ? new Date(startDate) : new Date(); // Default to current date if not found

                a.download = `${conferenceData.acronym + conferenceDate.getFullYear()}.ics`; // Use acronym instead of shortName
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url); // Clean up
            }
        }
    };

    const toggleShareMenu = () => {
        setOpenMenu(prev => prev === "share" ? null : "share"); // Mở/đóng menu Share

    };
    const toggleCalendarMenu = () => {
        setOpenMenu(prev => prev === "calendar" ? null : "calendar");  // Mở/đóng menu Calendar
    };

    const closeMenu = () => {
        setOpenMenu(null);
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                shareButtonRef.current &&
                !shareButtonRef.current.contains(event.target as Node) &&
                !(event.target instanceof Element && event.target.closest('.share-menu-container'))
            ) {
                closeMenu();
            }
        };

        if (openMenu) { // Chỉ thêm event listener khi có menu mở
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenu]); // Dependency là openMenu

    const renderShareMenu = () => {
        if (openMenu !== "share") { // Kiểm tra state chung
            return null;
        }
        return (
            <div className="absolute z-10 right-0 mt-2 w-48  rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-red p-2">
                <Button
                  onClick={() => { handleShareClick('facebook'); closeMenu(); }}
                  variant="secondary"
                  size="small"
                  className="px-2 py-2 text-sm w-full text-left flex items-center mb-1"
                >
                  {/* Facebook Icon SVG Path */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-facebook mr-2" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                  </svg>
                  Share on Facebook
                </Button>
                <Button
                    onClick={() => { handleShareClick('twitter'); closeMenu(); }}
                    variant="secondary"
                    size="small"
                    className="px-2 py-2 text-sm  w-full text-left flex items-center mb-1"
                >
                    {/* X (Twitter) Icon SVG Path */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x mr-2" viewBox="0 0 16 16">
  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
</svg>

                    Share on X
                </Button>
                <Button
                    onClick={() => { handleShareClick('reddit'); closeMenu(); }}
                    variant="secondary"
                    size="small"
                    className="px-2 py-2 text-sm  w-full text-left flex items-center"
                >
                    {/* Reddit Icon SVG Path */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-reddit mr-2" viewBox="0 0 16 16">
  <path d="M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z"/>
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165"/>
</svg>
                    Share on Reddit
                </Button>
            </div>
        );
    };

    const renderCalendarMenu = () => {
        if (openMenu !== "calendar") { // Kiểm tra state chung
            return null;
        }
        return (
            <div className="absolute z-10 right-0 mt-2 w-56  rounded-md shadow-lg p-2 ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Button
                    onClick={() => { handleAddToCalendar('google'); closeMenu(); }}
                    variant="secondary"
                    size="small"
                    className="px-2 py-2 text-sm  w-full text-left flex items-center mb-1"
                >
                    {/* Google Calendar Icon SVG Path (Simple G icon - you might want a more detailed one) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 mr-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>


                    Add to Google Calendar
                </Button>
                <Button
                    onClick={() => { handleAddToCalendar('ical'); closeMenu(); }}
                    variant="secondary"
                    size="small"
                    className="px-2 py-2 text-sm  w-full text-left flex items-center"
                >
                    {/* iCal/Download Icon SVG Path (Simple download icon - can be replaced with a calendar icon if desired) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6 mr-2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
</svg>

                    Download iCal
                </Button>
            </div>
        );
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
        <div className="relative share-menu-container">
          <Button
            onClick={toggleShareMenu}
            variant="secondary"
            size="medium"
            rounded
            className="mr-2 hover:opacity-90 p-2"
            
          >
            {/* Inline SVG for Share Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
</svg>

          </Button>
          {renderShareMenu()}
        </div>
        <div className="relative share-menu-container">
          <Button
            onClick={toggleCalendarMenu}
            variant="secondary"
            size="medium"
            rounded
            className="mr-2 hover:opacity-90 p-2"
          >
            {/* Inline SVG for Calendar Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
</svg>

          </Button>
          {renderCalendarMenu()}
        </div>
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
        <p className="text-lg">
            {conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates") ? // Find Conference Dates
                `${formatDate(conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates")?.startDate)} - ${formatDate(conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates")?.endDate)}`
                : 'Dates not available'}
        </p>
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

      <Map location={conferenceData.location} />

      <ConferenceFeedback onSubmitFeedback={handleFeedbackSubmit} />
    </div>


        {/* Right Column */}
        <div className="md:w-1/3 ">
          <section className="overflow-x-auto relative bg-gradient-to-r from-background to-background-secondary p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-left mb-4">{t('Conference Details')}</h3>

        <table className="w-full text-md text-left border-collapse">

          <tbody>
            <tr className="border-b  ">
              <td className="px-3 py-2 font-semibold">{t('Start Date')}</td>
              <td className="px-3 py-2">
                {formatDate(conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates")?.startDate)}
              </td>
            </tr>

            <tr className="border-b  ">
              <td className="px-3 py-2 font-semibold">{t('End Date')}</td>
              <td className="px-3 py-2">
                {formatDate(conferenceData.conferenceDates.find(date => date.dateName === "Conference Dates")?.endDate)}
              </td>
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
              <td className="px-3 py-2">
                {formatDate(conferenceData.conferenceDates.find(date => date.dateName === "Submission Deadline")?.startDate)}
              </td>
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
                    <p className="text-sm text-left">
                        {conf.conferenceDates.find(date => date.dateName === "Conference Dates") ? // Find Conference Dates
                            `${formatDate(conf.conferenceDates.find(date => date.dateName === "Conference Dates")?.startDate)} - ${formatDate(conf.conferenceDates.find(date => date.dateName === "Conference Dates")?.endDate)}`
                            : 'Dates not available'}
                    </p>
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