import { appConfig } from '@/src/middleware'
import { Calendar } from '@/src/models/response/user.response'

const API_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/calendar`

// 1. Hàm fetch danh sách đã thêm vào calendar
export const fetchCalendarConferences = async (): Promise<Calendar[]> => {
  const token = localStorage.getItem('token')
  if (!token) return []

  const response = await fetch(`${API_ENDPOINT}/conference-events`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// 2. Hàm để thêm/xóa calendar
export const toggleCalendarConference = async (
  conferenceId: string,
  isCurrentlyInCalendar: boolean
): Promise<any> => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  if (!token || !userStr) throw new Error('User not logged in.')
  const user = JSON.parse(userStr)

  const url = `${API_ENDPOINT}${isCurrentlyInCalendar ? '/remove' : '/add'}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ conferenceId, userId: user.id })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`
    )
  }
  return response.json()
}