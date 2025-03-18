// hooks/useEventTypeColors.ts
import { useMemo } from 'react';
const useEventTypeColors = () => {
    const typeColors = useMemo(() => {
        return {
          conferenceDates: 'bg-teal-500',
          submissionDate: 'bg-red-500',
          notificationDate: 'bg-blue-500',
          cameraReadyDate: 'bg-orange-500',
          registrationDate: 'bg-cyan-500',
        };
      }, []);

      const getEventTypeColor = (type: string) => {
        return typeColors[type as keyof typeof typeColors] || 'bg-gray-400';
      };

      return {getEventTypeColor};
}

export default useEventTypeColors;