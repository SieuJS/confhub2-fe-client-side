// src/types/calendar.ts

import { ConferenceResponse } from "@/src/models/response/conference.response"

export interface CalendarEvent {
  day: number
  month: number
  year: number
  startHour?: number
  startMinute?: number
  type: string
  conference: string
  conferenceId: string
  title?: string
  name?: string
}

export type ViewType = 'month' | 'week' | 'day'; // <-- THÊM DÒNG NÀY


// Export ConferenceResponse nếu nó chưa được định nghĩa ở một file chung khác
// Nếu đã có ở models/response/conference.response.ts thì không cần export lại ở đây.
// Giả định ConferenceResponse đã có sẵn và được import từ models.
export type { ConferenceResponse }