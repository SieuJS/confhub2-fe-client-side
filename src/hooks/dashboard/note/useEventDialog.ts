// src/hooks/dashboard/note/useEventDialog.ts

import { useState, useCallback, useEffect, RefObject } from 'react'
import { getConferenceFromDB } from '@/src/app/apis/conference/getConferenceDetails'
import { CalendarEvent } from '@/src/app/[locale]/dashboard/note/types/calendar'
import { ConferenceResponse } from '@/src/models/response/conference.response'

interface UseEventDialogProps {
  calendarRef: RefObject<HTMLDivElement>
  // dialogRef: RefObject<HTMLDivElement>; // Không cần nữa
  // calculateDialogPosition: (targetRect: DOMRect) => void; // Không cần nữa
  setHighlightedDate: React.Dispatch<React.SetStateAction<Date | null>>
}
interface UseEventDialogReturn {
  showDialog: boolean
  dialogDate: Date | null
  selectedEvent: CalendarEvent | null
  selectedEventDetail: ConferenceResponse | null
  loadingDetails: boolean
  openEventDetailsDialog: (
    event: CalendarEvent,
    clickEvent: React.MouseEvent
  ) => Promise<void>
  closeDialog: () => void
}

const useEventDialog = ({
  calendarRef,
  setHighlightedDate,
}: UseEventDialogProps) => {
  const [showDialog, setShowDialog] = useState(false)
  const [dialogDate, setDialogDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedEventDetail, setSelectedEventDetail] =
    useState<ConferenceResponse | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const closeDialog = useCallback(() => {
    setShowDialog(false)
    setSelectedEvent(null)
    setSelectedEventDetail(null)
    setHighlightedDate(null)
  }, [setHighlightedDate])

  const openEventDetailsDialog = useCallback(
    async (event: CalendarEvent, clickEvent: React.MouseEvent) => {
      if (!event.conferenceId) {
        console.log('Event is not a conference, dialog will not open.')
        return
      }

      // const target = clickEvent.currentTarget as HTMLElement; // Không cần nữa
      // const targetRect = target.getBoundingClientRect(); // Không cần nữa

      setDialogDate(new Date(event.year, event.month - 1, event.day))
      setSelectedEvent(event)
      setShowDialog(true)
      setHighlightedDate(new Date(event.year, event.month - 1, event.day))

      setSelectedEventDetail(null)
      setLoadingDetails(true)

      try {
        const conferenceDetails = await getConferenceFromDB(event.conferenceId)
        setSelectedEventDetail(conferenceDetails)
      } catch (error) {
        console.error('Failed to fetch conference details:', error)
        setSelectedEventDetail(null)
      } finally {
        setLoadingDetails(false)
      }

      // calculateDialogPosition(targetRect); // Không cần nữa
    },
    [setHighlightedDate] // Bỏ calculateDialogPosition khỏi dependencies
  )

  useEffect(() => {
    // Chỉ lắng nghe sự kiện để mở chi tiết event
    const handleOpenEventDetails = (e: any) => {
      openEventDetailsDialog(e.detail.event, e.detail.clickEvent)
    }
    const calendarElement = calendarRef.current

    calendarElement?.addEventListener(
      'open-event-details',
      handleOpenEventDetails
    )

    return () => {
      calendarElement?.removeEventListener(
        'open-event-details',
        handleOpenEventDetails
      )
    }
  }, [calendarRef, openEventDetailsDialog])

  return {
    showDialog,
    dialogDate,
    selectedEvent,
    selectedEventDetail,
    loadingDetails,
    openEventDetailsDialog,
    closeDialog,
  }
}

export default useEventDialog