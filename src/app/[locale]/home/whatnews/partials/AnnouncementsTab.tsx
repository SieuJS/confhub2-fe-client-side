import { announcementsData } from '../data/announcementData';
import { Megaphone } from 'lucide-react';

export const AnnouncementsTab = () => (
  <div className="space-y-4">
    {announcementsData.length > 0 ? (
      announcementsData.map((announcement, index) => (
        <div key={index} className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-text-primary">{announcement.title}</h4>
            <span className="text-xs text-text-secondary">{announcement.date}</span>
          </div>
          <p className="text-sm text-text-secondary">{announcement.content}</p>
        </div>
      ))
    ) : (
      <div className="flex flex-col items-center justify-center text-center text-text-secondary h-48">
        <Megaphone className="w-12 h-12 mb-4" />
        <p>Hiện tại không có thông báo nào.</p>
      </div>
    )}
  </div>
);