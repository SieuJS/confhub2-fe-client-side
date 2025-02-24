import React from 'react';

interface NotificationItemProps {
  title: string;
  description: string;
  updatedAt: string;
  detailsLink: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  description,
  updatedAt,
  detailsLink,
}) => {
  return (
    <div className="bg-slate-50 rounded-md p-4 mb-4">
      <h3 className="text-blue-700 font-semibold">{title}</h3>
      <p className="text-gray-700">{description}</p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-500">Updated in {updatedAt}</p>
        <a href={detailsLink} className="text-blue-500 hover:underline text-sm">
          More details &rarr;
        </a>
      </div>
    </div>
  );
};

interface NotificationTabProps {
  notifications: {
    title: string;
    description: string;
    updatedAt: string;
    detailsLink: string;
  }[];
}

const NotificationTab: React.FC<NotificationTabProps> = ({ notifications }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">Notification</h1>
      <p className="text-gray-700 mb-4">All notifications here</p>

      {notifications.map((notification, index) => (
        <NotificationItem
          key={index}
          title={notification.title}
          description={notification.description}
          updatedAt={notification.updatedAt}
          detailsLink={notification.detailsLink}
        />
      ))}
    </div>
  );
};

export default NotificationTab;