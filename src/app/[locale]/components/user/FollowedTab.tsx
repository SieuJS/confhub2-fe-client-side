import React, { useState } from 'react';
import ConferenceItem from '../conference/ConferenceItem';
import { ConferenceResponse } from '../../../../models/response/conference.response'; // Import ConferenceResponse

// Replace interface Conference with type Conference = ConferenceResponse
type Conference = ConferenceResponse;

interface FollowedTabProps {
  conferences: Conference[]; // Use the type alias Conference (which is ConferenceResponse)
}

const FollowedTab: React.FC<FollowedTabProps> = ({ conferences }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">Followed Conferences</h1>
      {conferences.length === 0 ? (
        <p className="">You are not following any conferences yet.</p>
      ) : (
        conferences.map((conference) => (
          <ConferenceItem key={conference.id} conference={conference} />
        ))
      )}
    </div>
  );
};

export default FollowedTab;