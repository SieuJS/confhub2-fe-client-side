import React, { useState } from 'react';
import ConferenceItem from './ConferenceItem';

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
}

interface FollowedTabProps {
  conferences: Conference[];
}

const FollowedTab: React.FC<FollowedTabProps> = ({ conferences }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">Followed Conferences</h1>
      {conferences.length === 0 ? (
        <p className="text-gray-500">You are not following any conferences yet.</p>
      ) : (
        conferences.map((conference) => (
          <ConferenceItem key={conference.id} conference={conference} />
        ))
      )}
    </div>
  );
};

export default FollowedTab;