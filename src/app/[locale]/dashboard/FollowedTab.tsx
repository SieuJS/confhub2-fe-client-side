// FollowedTab.tsx
import React, { useState, useEffect } from 'react'
import ConferenceItem from '../conferences/ConferenceItem'
import { getListConference } from '../../../api/conference/getListConferences'
import { ConferenceInfo } from '../../../models/response/conference.list.response'
import {
  UserResponse,
  FollowedConference
} from '../../../models/response/user.response'
import { timeAgo, formatDateFull } from './timeFormat'
import Tooltip from '../utils/Tooltip'

interface FollowedTabProps {}

const API_GET_USER_ENDPOINT = 'http://localhost:3000/api/v1/user'

const FollowedTab: React.FC<FollowedTabProps> = () => {
  const [followedConferences, setFollowedConferences] = useState<
    (ConferenceInfo & { followedAt?: string })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) {
          setLoggedIn(false)
          setLoading(false)
          return
        }

        const user = JSON.parse(userData)
        setLoggedIn(true)

        const userResponse = await fetch(`${API_GET_USER_ENDPOINT}/${user.id}`)
        if (!userResponse.ok) {
          throw new Error(`HTTP error! status: ${userResponse.status}`)
        }
        const userDetails: UserResponse = await userResponse.json()

        if (userDetails.followedConferences.length > 0) {
          const conferencesData = await getListConference()

          const followed = conferencesData.payload
            .filter(conf =>
              userDetails.followedConferences.some(
                followedConf => followedConf.id === conf.id
              )
            )
            .map(conf => {
              const followedConfInfo: FollowedConference | undefined =
                userDetails.followedConferences.find(fc => fc.id === conf.id)
              // Use createdAt as followedAt
              return {
                ...conf,
                followedAt: followedConfInfo?.createdAt
              }
            })

          setFollowedConferences(followed)
        } else {
          setFollowedConferences([])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        Please log in to view followed conferences.
      </div>
    )
  }

  if (loading) {
    return <div className='container mx-auto p-4'>Loading...</div>
  }

  const transformedConferences = followedConferences.map(conf => ({
    id: conf.id,
    title: conf.title,
    acronym: conf.acronym,
    location: `${conf.location.cityStateProvince}, ${conf.location.country}`,
    fromDate: conf.dates?.fromDate,
    toDate: conf.dates?.toDate,
    followedAt: conf.followedAt,
    status: conf.status // Thêm status
  }))

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-2 text-2xl font-semibold'>Followed Conferences</h1>
      {followedConferences.length === 0 ? (
        <p>You are not following any conferences yet.</p>
      ) : (
        transformedConferences.map(conference => (
          <div
            className='mb-4 rounded-xl border-2 px-4 py-2 shadow-xl'
            key={conference.id}
          >
            <div className='flex'>
              <span className='mr-1'>Followed Time: </span>
              <Tooltip text={formatDateFull(conference.followedAt)}>
                <span>{timeAgo(conference.followedAt)}</span>
              </Tooltip>
            </div>
            <ConferenceItem conference={conference} />
          </div>
        ))
      )}
    </div>
  )
}

export default FollowedTab
