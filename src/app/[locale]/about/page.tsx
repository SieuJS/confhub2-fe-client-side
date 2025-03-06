"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState, useMemo, useEffect, useRef } from 'react'; // Import useMemo
import Button from '../components/utils/Button';
import ConferenceFeedback from '../components/conference/ConferenceFeedback';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse type
import conferenceList from '../../../models/data/conferences-list.json'; // Import conferenceList JSON data
import { fetchConferences } from '../../../api/crawl/test_api'; // Import fetchConferences, adjust path.
import Map from '../components/conference/Map';
import * as ics from 'ics';
import { ConferenceTabs } from '../components/conference/ConferenceTabs';

// Removed interface Conference and using ConferenceResponse type alias instead
type Conference = ConferenceResponse;

export default function About() {
  const t = useTranslations('');
  
  return (
    <div className='px-10'>
      <div className="py-14 bg-background w-full"></div>
      About us
    </div>
  )
}