'use client'

import React, { useState } from 'react'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import { useRouter, usePathname } from 'next/navigation';
import { getPathname } from '@/src/navigation';

const API_ADD_CONFERENCE_ENDPOINT = 'http://localhost:3000/api/v1/conferences';

interface ConferenceFormData {
  title: string
  acronym: string
  link: string
  topics: string[]
  type: 'offline' | 'online' | 'hybrid'
  location: LocationInput
  dates: ImportantDateInput[]
  imageUrl: string
  description: string
}

interface LocationInput {
  address: string
  cityStateProvince: string
  country: string
  continent: string
}

interface ImportantDateInput {
  type: string
  name: string
  fromDate: string
  toDate: string
}

const AddConference = ({ locale }: { locale: string }) => {
  const [title, setTitle] = useState('')
  const [acronym, setAcronym] = useState('')
  const [link, setLink] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [type, setType] = useState<'offline' | 'online' | 'hybrid'>('offline')
  const [location, setLocation] = useState<LocationInput>({
    address: '',
    cityStateProvince: '',
    country: '',
    continent: ''
  })
  const [dates, setDates] = useState<ImportantDateInput[]>([
    {
      type: 'Conference Date',
      name: 'Conference Date',
      fromDate: '',
      toDate: ''
    }
  ])

  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  const router = useRouter()
  const pathname = usePathname();

  const handleAddTopic = () => {
    if (newTopic.trim() !== '') {
      setTopics([...topics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation({
      ...location,
      [field]: value
    })
  }

  const handleDateChange = (
    index: number,
    field: keyof ImportantDateInput,
    value: string
  ) => {
    const newDates = [...dates]
    newDates[index] = {
      ...newDates[index],
      [field]: value
    }
    setDates(newDates)
  }

  const addDate = () => {
    setDates([...dates, { type: '', name: '', fromDate: '', toDate: '' }])
  }

  const removeDate = (index: number) => {
    if (index !== 0) {
      setDates(dates.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => { // Hàm async
    e.preventDefault();
    if (
      !title ||
      !acronym ||
      !link ||
      !type ||
      !location.address ||
      !location.cityStateProvince ||
      !location.country ||
      !location.continent ||
      dates.some(date => !date.fromDate || !date.toDate || !date.name)
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    const conferenceData: ConferenceFormData = {
      title,
      acronym,
      link,
      topics,
      type,
      location,
      dates,
      imageUrl,
      description,
    };

    const userData = localStorage.getItem('user');
    if (!userData) {
      console.error('User not logged in');
      alert("Please log in to add new Conference")
      return; // Kết thúc sớm nếu không có thông tin người dùng
    }
    const user = JSON.parse(userData);
    const userId = user.id; // Lấy userId từ localStorage
    console.log(conferenceData);
    try {
      const response = await fetch(API_ADD_CONFERENCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Thêm Authorization header nếu cần
        },
        body: JSON.stringify({ ...conferenceData, userId }), // GỬI userId TRONG BODY
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message}`);
      }

      const addedConference = await response.json(); // Lấy conference đã thêm từ response
      console.log('Conference added:', addedConference);

      // --- Prepend Locale Prefix ---
      const localePrefix = pathname.split('/')[1]; // Extract locale prefix (e.g., "en")
      const pathWithLocale = `/${localePrefix}/dashboard?tab=myconferences`; // Construct path with locale

      router.push(pathWithLocale); // Use path with locale for internal navigation   

    } catch (error: any) {
      console.error('Error adding conference:', error.message);
      // Xử lý lỗi (hiển thị thông báo, v.v.)
    }

  };

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>

        <h1 className='mb-4 text-2xl font-bold'>Add New Conference</h1>

        <form onSubmit={handleSubmit} className='grid gap-5'>
          {/* Basic Information -  Grouped Acronym, Link, and Type */}
          <div className='sm:col-span-2'>
            <label htmlFor='title' className='block text-sm font-medium '>
              * Conference name:
            </label>
            <input
              type='text'
              id='title'
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-3'>
            {/* Acronym */}
            <div>
              <label htmlFor='acronym' className='block text-sm font-medium '>
                * Acronym:
              </label>
              <input
                type='text'
                id='acronym'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={acronym}
                onChange={e => setAcronym(e.target.value)}
                required
              />
            </div>

            {/* Link */}
            <div>
              <label htmlFor='link' className='block text-sm font-medium '>
                * Link:
              </label>
              <input
                type='url'
                id='link'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={link}
                onChange={e => setLink(e.target.value)}
                required
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor='type' className='block text-sm font-medium '>
                * Type:
              </label>
              <select
                id='type'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={type}
                onChange={e =>
                  setType(e.target.value as 'offline' | 'online' | 'hybrid')
                }
                required
              >
                <option value='offline'>Offline</option>
                <option value='online'>Online</option>
                <option value='hybrid'>Hybrid</option>
              </select>
            </div>
          </div>

          {/* Location Inputs */}
          <div className='sm:col-span-2'>
            <label className='block text-base font-medium '>* Location:</label>
            <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-4 sm:gap-x-4'>
              <div>
                <label htmlFor='address' className='block text-sm font-medium '>
                  Address:
                </label>
                <input
                  type='text'
                  id='address'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={location.address}
                  onChange={e =>
                    handleLocationChange('address', e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='cityStateProvince'
                  className='block text-sm font-medium '
                >
                  City/State/Province:
                </label>
                <input
                  type='text'
                  id='cityStateProvince'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={location.cityStateProvince}
                  onChange={e =>
                    handleLocationChange('cityStateProvince', e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor='country' className='block text-sm font-medium '>
                  Country:
                </label>
                <input
                  type='text'
                  id='country'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={location.country}
                  onChange={e =>
                    handleLocationChange('country', e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='continent'
                  className='block text-sm font-medium '
                >
                  Continent:
                </label>
                <input
                  type='text'
                  id='continent'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={location.continent}
                  onChange={e =>
                    handleLocationChange('continent', e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className='sm:col-span-2'>
            <label className='block text-sm font-medium text-gray-700'>
              Important Dates:
            </label>
            {dates.map((date, index) => (
              <div key={index} className='mt-1 grid grid-cols-4 gap-4'>
                <div>
                  <label
                    htmlFor={`name-${index}`}
                    className='block text-sm font-medium text-gray-700'
                  >
                    Name:
                  </label>
                  <input
                    type='text'
                    id={`name-${index}`}
                    value={date.name}
                    onChange={e =>
                      handleDateChange(index, 'name', e.target.value)
                    }
                    className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm
                      ${index === 0 ? 'opacity-50' : ''}`}
                    required
                    readOnly={index === 0}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`type-${index}`}
                    className='block text-sm font-medium text-gray-700'
                  >
                    Type:
                  </label>
                  <input
                    type='text'
                    id={`type-${index}`}
                    value={date.type}
                    onChange={e =>
                      handleDateChange(index, 'type', e.target.value)
                    }
                    className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm
                       ${index === 0 ? 'opacity-50' : ''}`}
                    readOnly={index === 0}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`fromDate-${index}`}
                    className='block text-sm font-medium text-gray-700'
                  >
                    Start Date:
                  </label>
                  <input
                    type='date'
                    id={`fromDate-${index}`}
                    value={date.fromDate}
                    onChange={e =>
                      handleDateChange(index, 'fromDate', e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor={`toDate-${index}`}
                    className='block text-sm font-medium text-gray-700'
                  >
                    End Date:
                  </label>
                  <input
                    type='date'
                    id={`toDate-${index}`}
                    value={date.toDate}
                    onChange={e =>
                      handleDateChange(index, 'toDate', e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    required
                  />
                </div>

                {/* Hide the remove button for the first date entry */}
                {index !== 0 && (
                  <button
                    type='button'
                    onClick={() => removeDate(index)}
                    className='mt-6 text-red-500 hover:text-red-700 focus:outline-none'
                    aria-label='Remove date'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={addDate}
              className='mt-2 rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
              Add Date
            </button>
          </div>

          {/* Topics */}
          <div className='sm:col-span-2'>
            <label
              htmlFor='newTopic'
              className='block text-sm font-medium text-gray-700'
            >
              Topics:
            </label>
            <div className='mt-1 items-center'>
              <div className='mt-2'>
                {topics.map((topic, index) => (
                  <span
                    key={index}
                    className='mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700'
                  >
                    {topic}
                    <button
                      type='button'
                      onClick={() => handleRemoveTopic(topic)}
                      className='ml-1 text-gray-500 hover:text-gray-700 focus:outline-none'
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type='text'
                id='newTopic'
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                className='w-80 flex-1 rounded-l-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                placeholder='Add a topic'
              />
              <button
                type='button'
                onClick={handleAddTopic}
                className='ml-3 rounded-r-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              >
                Add
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div className='sm:col-span-2'>
            <label
              htmlFor='imageUrl'
              className='block text-sm font-medium text-gray-700'
            >
              Image URL:
            </label>
            <input
              type='url'
              id='imageUrl'
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            />
          </div>
          {/* Description */}
          <div className='sm:col-span-2'>
            <label
              htmlFor='description'
              className='block text-sm font-medium text-gray-700'
            >
              Description:
            </label>
            <textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            />
          </div>

          {/* Submit Button */}
          <div className='mt-6 '>
            <button
              type='submit'
              onClick={handleSubmit}
              className='w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
              Add Conference
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  )
}

export default AddConference;