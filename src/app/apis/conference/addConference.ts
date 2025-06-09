// src/app/apis/conference/addConference.ts
import { ConferenceFormData } from '@/src/models/send/addConference.send'
import { appConfig } from '@/src/middleware'

const API_ADD_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/add`

/**
 * Gửi dữ liệu hội nghị lên server.
 * @param conferenceData Dữ liệu của hội nghị.
 * @param userId ID của người dùng.
 * @param token Token xác thực.
 * @returns Dữ liệu hội nghị đã được thêm.
 * @throws {Error} Nếu có lỗi xảy ra trong quá trình gọi API.
 */
export const addConference = async (
  conferenceData: ConferenceFormData,
  userId: string,
  token: string | null
) => {
  if (!token) {
    throw new Error('Authentication token is missing.')
  }

  const response = await fetch(API_ADD_CONFERENCE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...conferenceData, userId })
  })

  if (!response.ok) {
    const errorData = await response.json()
    if (response.status === 403) {
      // Logic xử lý đặc biệt cho status 403 được giữ nguyên
      window.location.reload()
      throw new Error(errorData.message + `, you'll automatically logout`)
    } else {
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || 'Unknown error'
        }`
      )
    }
  }

  return await response.json()
}