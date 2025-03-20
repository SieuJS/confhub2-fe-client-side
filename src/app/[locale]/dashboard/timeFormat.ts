// utils/timeFormat.ts (tạo file mới)

export function timeAgo(dateParam: string | Date | undefined): string {
  if (!dateParam) {
      return "Unknown";
  }


  const date = typeof dateParam === 'string' ? new Date(dateParam) : dateParam;
    if (isNaN(date.getTime()))
    {
      return "Invalid Date";
    }
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} giây trước`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4){
        return `${diffInWeeks} tuần trước`
    }

    const diffInMonths = Math.floor(diffInDays/30);
    if (diffInMonths < 12){
        return `${diffInMonths} tháng trước`
    }

    return `${Math.floor(diffInDays / 365)} năm trước`

}

export function formatDateFull(dateParam: string | Date | undefined): string {
  if (!dateParam) {
      return "Unknown date";
  }

  const date = typeof dateParam === 'string' ? new Date(dateParam) : dateParam;
  if (isNaN(date.getTime())){
    return "Invalid Date"
  }


const options: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false, // Use 12-hour format (optional)
};

return date.toLocaleDateString('vi-VN', options);
}