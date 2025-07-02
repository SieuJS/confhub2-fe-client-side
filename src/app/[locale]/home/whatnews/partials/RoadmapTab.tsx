import { roadmapData, RoadmapItem } from '../data/announcementData';
import { cn } from '@/lib/utils';

// Hàm tiện ích để lấy màu badge theo status
const getStatusClass = (status: RoadmapItem['status']) => {
  switch (status) {
    case 'Đã hoàn thành':
      return 'bg-green-200 text-green-800';
    case 'Đang phát triển':
      return 'bg-yellow-200 text-yellow-800';
    case 'Sắp ra mắt':
      return 'bg-blue-200 text-blue-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const RoadmapCard = ({ item }: { item: RoadmapItem }) => (
  <li className="flex items-start space-x-4 p-4">
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-background-secondary text-text-primary">
      <item.icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-text-primary">{item.title}</h4>
        <span className={cn('px-2.5 py-0.5 text-xs font-semibold rounded-full', getStatusClass(item.status))}>
          {item.status}
        </span>
      </div>
      <p className="text-sm text-text-secondary mt-1">{item.description}</p>
    </div>
  </li>
);

export const RoadmapTab = () => (
  <ul className="divide-y divide-border">
    {roadmapData.map((item, index) => (
      <RoadmapCard key={index} item={item} />
    ))}
  </ul>
);