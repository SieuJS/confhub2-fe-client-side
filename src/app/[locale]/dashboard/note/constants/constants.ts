// src/constants/calendar.ts

export const DEFAULT_DOM_RECT: DOMRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  toJSON: () => {},
}

export const EVENT_TYPE_COLORS = {
  conferenceDates: 'bg-teal-500',
  submissionDate: 'bg-red-500',
  notificationDate: 'bg-blue-500',
  cameraReadyDate: 'bg-orange-500',
  registrationDate: 'bg-cyan-500',
}