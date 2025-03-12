'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ConferenceResponse, ConferenceDates } from '../../../../models/response/conference.response';
import conferenceList from '../../../../models/data/conferences-list.json';
import { useRouter } from 'next/navigation';


type Conference = ConferenceResponse;

const AddConference = () => {
  const router = useRouter();
    const [name, setName] = useState('');
    const [acronym, setAcronym] = useState('');
    const [link, setLink] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [conferenceDates, setConferenceDates] = useState<ConferenceDates[]>([
        { startDate: '', endDate: '', dateName: 'Conference Date' }, // Mục nhập đầu tiên, không thể xóa
        { startDate: '', endDate: '', dateName: '' }, // Mục nhập thứ hai, có thể xóa
    ]);
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [rank, setRank] = useState('');
    const [sourceYear, setSourceYear] = useState('');

    const handleAddTopic = () => {
        if (newTopic.trim() !== '') {
            setTopics([...topics, newTopic.trim()]);
            setNewTopic('');
        }
    };

    const handleRemoveTopic = (index: number) => {
        setTopics(topics.filter((_, i) => i !== index));
    };

    const handleDateChange = (index: number, field: keyof ConferenceDates, value: string) => {
        const newDates = [...conferenceDates];
        newDates[index] = { ...newDates[index], [field]: value };
        setConferenceDates(newDates);
    };

    const handleAddDate = () => {
        setConferenceDates([...conferenceDates, { startDate: '', endDate: '', dateName: '' }]); // Thêm date mới
    };

    const handleRemoveDate = (index: number) => {
      if (index !== 0) { // Chỉ xóa nếu không phải index 0
        setConferenceDates(conferenceDates.filter((_, i) => i !== index));
    }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
          // Simple validation (you can add more)
        if (!name || !acronym || !location || conferenceDates.some(date => !date.startDate || !date.endDate || !date.dateName)) {
            alert('Please fill in all required fields.'); // Or use a more sophisticated notification method
            return;
        }
        const conferenceData: Conference = {
            id: Date.now().toString(),
            name,
            acronym,
            link,
            topics,
            type,
            location,
            conferenceDates,
            imageUrl: '',
            description,
            rank,
            sourceYear,
            category: '',
            likeCount: 0,
            followCount: 0,
        };

        const existingConferences = JSON.parse(localStorage.getItem('conferences') || '[]');
        const newConferences = [...existingConferences, conferenceData];
        localStorage.setItem('conferences', JSON.stringify(newConferences));
        router.push('/my-conferences');

    };

  return (
    <div className="container mx-auto p-8">
      <div className="py-14 bg-background w-full"></div>

      <h1 className="text-2xl font-bold mb-4">Add New Conference</h1>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {/* Basic Information - Fields remain unchanged */}
         <div className="sm:col-span-2">
        <label htmlFor="conferenceName" className="block text-sm font-medium ">
          * Conference name:
        </label>
        <input
          type="text"
          id="conferenceName"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="acronym" className="block text-sm font-medium ">
          * Acronym:
        </label>
        <input
          type="text"
          id="acronym"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={acronym}
          onChange={(e) => setAcronym(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="link" className="block text-sm font-medium ">
          * Link:
        </label>
        <input
          type="url"
          id="link"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="type" className="block text-sm font-medium ">
          * Type:
        </label>
        <select
          id="type"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as Conference['type'])}
          required
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="location" className="block text-sm font-medium ">
          * Location:
        </label>
        <input
          type="text"
          id="location"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

        {/* Important Dates */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Important Dates:
          </label>
          {conferenceDates.map((date, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 mt-1">
                <div>
                <label htmlFor={`dateName-${index}`} className="block text-sm font-medium text-gray-700">
                   Name:
                </label>
                <input
                  type="text"
                  id={`dateName-${index}`}
                  value={date.dateName}
                  onChange={(e) => handleDateChange(index, 'dateName', e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                    ${index === 0 ? 'opacity-50' : ''    
                    }`
                  }
                  required
                  readOnly={index === 0}
                />
              </div>
              <div>
                <label htmlFor={`startDate-${index}`} className="block text-sm font-medium text-gray-700">
                  Start Date:
                </label>
                <input
                  type="date"
                  id={`startDate-${index}`}
                  value={date.startDate}
                  onChange={(e) => handleDateChange(index, 'startDate', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor={`endDate-${index}`} className="block text-sm font-medium text-gray-700">
                  End Date:
                </label>
                <input
                  type="date"
                  id={`endDate-${index}`}
                  value={date.endDate}
                  onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>

              {/* Hide the remove button for the first date entry */}
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveDate(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Remove date"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddDate}
            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add Date
          </button>
        </div>

        {/* Topics */}
          <div className="sm:col-span-2">
          <label htmlFor="newTopic" className="block text-sm font-medium text-gray-700">
            Topics:
          </label>
          <div className="items-center mt-1">
          <div className="mt-2">
            {topics.map((topic, index) => (
              <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {topic}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(index)}
                  className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
            <input
              type="text"
              id="newTopic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="flex-1 w-80 px-3 py-2 bg-white border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Add a topic"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="ml-3 px-4 py-2 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add
            </button>
          </div>
          
        </div>

         {/* Image URL */}
        <div className="sm:col-span-2">
           <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL:
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
        </div>
        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description:
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Rank */}
        <div className="sm:col-span-1">
             <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
              Rank:
            </label>
            <input
              type="text"
              id="rank"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        {/* Source Year */}
        <div className="sm:col-span-1">
          <label htmlFor="sourceYear" className="block text-sm font-medium text-gray-700">
            Source Year:
          </label>
          <input
            type="text"
            id="sourceYear"
            value={sourceYear}
            onChange={(e) => setSourceYear(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </form>
      {/* Submit Button */}
      <div className="mt-6 ">
          <button
            type="submit"
            className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Conference
          </button>
        </div>
    </div>
  );
};

export default AddConference;