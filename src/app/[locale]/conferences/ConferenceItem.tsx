// components/conferences/ConferenceItem.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../utils/Button';
import { Link } from '@/src/navigation';

// Define the *exact* data ConferenceItem needs.  This is the key change.
interface ConferenceItemProps {
    conference: {
        id: string;
        title: string;
        acronym: string;
        location: string;
        fromDate?: string; // Make these optional if they might be missing
        toDate?: string;   // Make these optional if they might be missing
    };
}

const ConferenceItem: React.FC<ConferenceItemProps> = ({ conference }) => {
    const [isFollowing, setIsFollowing] = useState(false); // Keep if needed

    const handleFollowClick = () => {
        setIsFollowing(!isFollowing);
        // Implement follow/unfollow logic
    };

      const formatDate = (dateString?: string) => {
            if (!dateString) return 'Unknown';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        };

    return (
        <div className="bg-background rounded-md shadow-md p-4 mb-4 grid grid-cols-9 gap-4">
            <div className="col-span-1 flex items-center justify-center">
                <Image
                    src={"/bg-2.jpg"} // Replace with your image path
                    alt={conference.title}
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                />
            </div>
            <div className="col-span-6 text-left">
                <h3 className="text-lg font-semibold text-button">{conference.title} ({conference.acronym})</h3>
                <p>
                   <strong>Dates:</strong>{" "}
                    {conference.fromDate
                        ? formatDate(conference.fromDate) + " - " + formatDate(conference.toDate)
                        : 'Dates not available'}
                </p>
                <p>
                    <strong>Location:</strong> {conference.location}
                </p>
            </div>
            <div className="col-span-2 flex items-center justify-center">
                <Link href={{ pathname: '/conferences/detail', query: { id: conference.id } }}>
                    <Button variant="primary" size="medium" rounded className="mr-2 w-24">
                        Details
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default ConferenceItem;