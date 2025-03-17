// NoteTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Calendar from './Calendar';
import { CalendarEvent } from './DayNote';
import { ConferenceResponse } from '../../../models/response/conference.response';
import { getConference } from '../../../api/getConference/getConferenceDetails';
import { Link } from '@/src/navigation';
import Button from '../utils/Button';

interface NoteTabProps { }

const API_GET_USER_CALENDAR_ENDPOINT = 'http://localhost:3000/api/v1/user';

const NoteTab: React.FC<NoteTabProps> = () => {
    const [upcomingNotes, setUpcomingNotes] = useState<any[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    type NoteType = 'conferenceDates' | 'submissionDate' | 'notificationDate' | 'cameraReadyDate' | 'registrationDate' | 'yourNote';

    const typeColors = useMemo(() => ({
        conferenceDates: 'bg-teal-100 text-teal-700',
        submissionDate: 'bg-red-100 text-red-700',
        notificationDate: 'bg-blue-100 text-blue-700',
        cameraReadyDate: 'bg-orange-100 text-orange-700',
        registrationDate: 'bg-gray-100 text-gray-700',
        yourNote: 'bg-cyan-100 text-cyan-700',
    }), []);

    const getEventTypeColor = (type: NoteType) => typeColors[type] || 'bg-gray-100 text-gray-700';

    // ... (rest of your useEffect and data fetching logic remains the same) ...
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (!userData) {
                    setLoggedIn(false);
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(userData);
                setLoggedIn(true);

                const calendarResponse = await fetch(`${API_GET_USER_CALENDAR_ENDPOINT}/${user.id}/calendar`);

                if (!calendarResponse.ok) {
                    const errorMessage = calendarResponse.status === 404 ? "Calendar not found for this user." : `HTTP error! status: ${calendarResponse.status}`;
                    setError(errorMessage);
                    throw new Error(errorMessage);
                }

                const calendarData: CalendarEvent[] = await calendarResponse.json();
                setCalendarEvents(calendarData);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const testToday = new Date(2025, 2, 17); // Keep for consistent testing
                testToday.setHours(0, 0, 0, 0);


                const upcoming = calendarData
                    .filter(event => {
                        const eventDate = new Date(event.year, event.month - 1, event.day);
                        return eventDate >= testToday;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(a.year, a.month - 1, a.day);
                        const dateB = new Date(b.year, b.month - 1, b.day);
                        return dateA.getTime() - dateB.getTime();
                    });



                const notesWithLocation = await Promise.all(
                    upcoming.map(async (event) => {
                        const eventDate = new Date(event.year, event.month - 1, event.day);
                        const formattedDate = eventDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });
                        const timeDiff = eventDate.getTime() - new Date().getTime();
                        const daysLeft = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
                        const hoursLeft = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
                        const countdownString = `${daysLeft}d ${hoursLeft}h `;

                        try {
                            const conferenceDetails: ConferenceResponse = await getConference(event.conferenceId);
                            return {
                                type: event.type,
                                conference: event.conference,
                                id: event.conferenceId,
                                location: `${conferenceDetails.locations.cityStateProvince}, ${conferenceDetails.locations.country}`,
                                date: formattedDate,
                                countdown: countdownString,
                                year: event.year,
                                month: event.month,
                                day: event.day,
                            };
                        } catch (locationError) {
                            console.error(`Error fetching location for conference ${event.conferenceId}:`, locationError);
                            return {
                                type: event.type,
                                conference: event.conference,
                                id: event.conferenceId,
                                location: 'Location unavailable',
                                date: formattedDate,
                                countdown: countdownString,
                                year: event.year,
                                month: event.month,
                                day: event.day,
                            };
                        }
                    })
                );

                // Group notes by conference and handle date ranges
                const groupedNotes: { [key: string]: any } = {};
                notesWithLocation.forEach(note => {
                    const key = `${note.id}`; // Group by conference ID ONLY
                    if (!groupedNotes[key]) {
                        groupedNotes[key] = {
                            ...note,
                            types: [note.type],
                            dates: [{ year: note.year, month: note.month, day: note.day }], // Store dates as objects
                        };
                    } else {
                        if (!groupedNotes[key].types.includes(note.type)) {
                            groupedNotes[key].types.push(note.type);
                        }
                        // Add date to dates array if it's not already there
                        const dateExists = groupedNotes[key].dates.some((d: any) =>
                            d.year === note.year && d.month === note.month && d.day === note.day
                        );
                        if (!dateExists) {
                            groupedNotes[key].dates.push({ year: note.year, month: note.month, day: note.day });
                        }
                    }
                });

                // Format dates after grouping
                const finalUpcomingNotes = Object.values(groupedNotes).map((note: any) => {
                    // Sort dates chronologically
                    note.dates.sort((a: any, b: any) => {
                        const dateA = new Date(a.year, a.month - 1, a.day);
                        const dateB = new Date(b.year, b.month - 1, b.day);
                        return dateA.getTime() - dateB.getTime();
                    });

                    // Format date ranges
                    let formattedDateRange = "";
                    if (note.dates.length > 0) {
                        const firstDate = note.dates[0];
                        const lastDate = note.dates[note.dates.length - 1];

                        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }; // Options for formatting
                        const firstDateObj = new Date(firstDate.year, firstDate.month - 1, firstDate.day);
                        const lastDateObj = new Date(lastDate.year, lastDate.month - 1, lastDate.day);


                        if (note.dates.length === 1) {
                            formattedDateRange = firstDateObj.toLocaleDateString('en-US', options);
                        } else if (firstDate.year === lastDate.year && firstDate.month === lastDate.month) {
                            formattedDateRange = `${firstDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${lastDateObj.toLocaleDateString('en-US', { day: 'numeric' })}`;
                        } else if (firstDate.year === lastDate.year) {
                            formattedDateRange = `${firstDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${lastDateObj.toLocaleDateString('en-US', options)}`;
                        } else {
                            formattedDateRange = `${firstDateObj.toLocaleDateString('en-US', options)}, ${firstDate.year} - ${lastDateObj.toLocaleDateString('en-US', options)}, ${lastDate.year}`;
                        }
                    }
                    return { ...note, date: formattedDateRange }; // Overwrite the 'date' with the formatted range
                }).slice(0, 3); // Limit to the first 3 grouped notes


                setUpcomingNotes(finalUpcomingNotes);

            } catch (error: any) {
                console.error("Failed to fetch calendar data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (!loggedIn) {
        return <div className="container mx-auto p-4">Please log in to view your calendar.</div>;
    }

    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full p-4 bg-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <section className="lg:w-5/6 bg-white rounded-md shadow p-4">
                    <h2 className="text-lg font-semibold mb-2">Upcoming Notes</h2>
                    {upcomingNotes.length === 0 ? (
                        <p>You are not following any conferences yet.</p>
                    ) : (
                        <div className="flex flex-row gap-4 flex-wrap">
                            {upcomingNotes.map((note, index) => (
                                <div key={index} className={`w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] p-4 rounded-md shadow-md border ${note.types.map(getEventTypeColor).join(' ')}`}>
                                    <div className="flex flex-col h-full">
                                        {/* Top 3/4: Conference details */}
                                        <div className="h-3/4">
                                            <h3 className="text-lg font-semibold text-gray-900">{note.conference}</h3> {/* Larger, bolder title */}
                                            <div className="flex items-center text-gray-700 mt-1"> {/* Slightly lighter text */}
                                                <Image src="/images/location-pin.svg" alt="Location" width={14} height={14} className="mr-1.5" /> {/* Slightly larger icon */}
                                                <span className="text-sm">{note.location}</span> {/* Location on its own line, smaller text */}
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1"> {/* Date on its own line, smaller text */}
                                                {note.date}
                                            </p>
                                            {/* Types of Dates (Pills) */}
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {note.types.map((type: NoteType, typeIndex: number) => {
                                                    let typeText = "";
                                                    switch (type) {
                                                        case 'conferenceDates': typeText = "Conference"; break;
                                                        case 'submissionDate': typeText = "Submission"; break;
                                                        case 'notificationDate': typeText = "Notification"; break;
                                                        case 'cameraReadyDate': typeText = "Camera Ready"; break;
                                                        case 'registrationDate': typeText = "Registration"; break;
                                                        default: typeText = type;
                                                    }
                                                    const colorClasses = getEventTypeColor(type);
                                                    return (
                                                        <span key={typeIndex} className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
                                                            {typeText}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Bottom 1/4: Countdown and Details Link */}
                                        <div className="h-1/4 flex items-end">
                                            <div className="flex items-center mt-2 w-full justify-between">
                                                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">{note.countdown}</div>
                                                <Link href={{ pathname: '/conferences/detail', query: { id: note.id } }}>
                                                    <Button className="text-blue-500 hover:text-gray-900 text-xs">More details</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Dates Details Section */}
                <section className="lg:w-1/6 bg-white rounded-md shadow pb-6 pt-4 px-4">
                    <h2 className="text-lg font-semibold mb-4">Dates details</h2>
                    <ul>
                        <li className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-teal-500 mr-2"></div>
                            <span className="text-gray-700 text-sm">Conference date</span>
                        </li>
                        <li className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-gray-700 text-sm">Submission date</span>
                        </li>
                        <li className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-700 text-sm">Notification date</span>
                        </li>
                        <li className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                            <span className="text-gray-700 text-sm">Camera ready date</span>
                        </li>
                        <li className="flex items-center mb-4">
                            <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                            <span className="text-gray-700 text-sm">Registration date</span>
                        </li>
                        <li className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-cyan-500 mr-2"></div>
                            <span className="text-gray-700 text-sm">Your note</span>
                        </li>
                    </ul>
                </section>
            </div>

            {/* Calendar Section */}
            <div className="flex-grow">
                <Calendar calendarEvents={calendarEvents} />
            </div>
        </div>
    );
};

export default NoteTab;