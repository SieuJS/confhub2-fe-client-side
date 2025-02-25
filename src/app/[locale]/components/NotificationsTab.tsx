import React, { useState } from 'react';

interface NotificationItemProps {
  title: string;
  description: string;
  updatedAt: string;
  detailsLink: string;
  isImportant?: boolean;
  onDelete?: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  description,
  updatedAt,
  detailsLink,
  isImportant,
  onDelete,
  isChecked,
  onCheckboxChange,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleStar = () => {
    setIsStarred(!isStarred);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckboxChange(event.target.checked);
  };

  const openModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div
      className={`rounded-md p-4 mb-4 flex justify-between w-full items-start ${isStarred ? 'bg-yellow-300' : (isChecked ? 'bg-background-secondary' : 'bg-background')}`} // Conditional background color
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          className="mr-2 mt-1 transform scale-110 appearance-none h-4 w-4 border border-text-secondary rounded-sm checked:bg-button checked:border-button focus:outline-none cursor-pointer"
          checked={isChecked}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => { toggleStar(); e.stopPropagation(); }}
          className="mr-2 focus:outline-none"
          aria-label="Mark as important"
        >
          <span className={`${isStarred ? 'text-yellow-500' : 'text-text-secondary'} text-xl`}>★</span>
        </button>
        <div>
          <h3 className="text-button font-semibold">{title}</h3>
          <p className="">{description}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm ">Updated in {updatedAt}</p>
            <a href={detailsLink} onClick={openModal} className="text-button hover:underline text-sm">
              More details →
            </a>
          </div>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-text-secondary hover:text-red-500 focus:outline-none mt-0"
          aria-label="Delete notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m-10.013 0c.34.059.68.114 1.02.165m-1.02-.165L5.09 5.79m14.416 0c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m10.013 0c.34.059.68.114 1.02.165m-3.478-.397l.346 9m7.47-9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" />
          </svg>
        </button>
      )}

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center" onClick={closeModal}>
          <div className="bg-background p-6 rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <p className="mb-4">{description}</p>
            <p className="text-sm ">Updated in {updatedAt}</p>
            <div className="text-right mt-4">
              <button onClick={closeModal} className="bg-button hover:bg-button-button hover:opacity-80 text-button-text  font-bold py-2 px-4 rounded focus:outline-none">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NotificationTabProps {
  notifications: {
    title: string;
    description: string;
    updatedAt: string;
    detailsLink: string;
    isImportant?: boolean;
  }[];
  onDeleteNotification?: (index: number) => void;
}

const NotificationTab: React.FC<NotificationTabProps> = ({ notifications, onDeleteNotification }) => {
  const [checkedIndices, setCheckedIndices] = useState<number[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const handleCheckboxChangeTab = (index: number, checked: boolean) => {
    if (checked) {
      setCheckedIndices([...checkedIndices, index]);
    } else {
      setCheckedIndices(checkedIndices.filter((i) => i !== index));
    }
  };

  const handleDeleteSelected = () => {
    if (onDeleteNotification) {
      const sortedIndices = checkedIndices.sort((a, b) => b - a);
      sortedIndices.forEach(indexToDelete => {
          onDeleteNotification(indexToDelete);
      });
      setCheckedIndices([]);
      setSelectAllChecked(false);
    }
  };

  const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setSelectAllChecked(checked);
    if (checked) {
      const allIndices = notifications.map((_, index) => index);
      setCheckedIndices(allIndices);
    } else {
      setCheckedIndices([]);
    }
  };


  const hasCheckedNotifications = checkedIndices.length > 0;


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-2">Notification</h1>
      <p className=" mb-4">All notifications here</p>

      <div className="mb-2 flex items-center justify-between">
        <div>
          <input
            type="checkbox"
            className="mr-2 transform scale-110 appearance-none h-4 w-4 border border-text-secondary rounded-sm checked:bg-button checked:border-button focus:outline-none cursor-pointer"
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
          />
          <label htmlFor="select-all" className="text-sm">Select All</label>
        </div>
        {hasCheckedNotifications && (
          <button
            onClick={handleDeleteSelected}
            className="bg-button hover:bg-button hover:opacity-80 text-button-text font-bold py-2 px-4 rounded"
          >
            Delete Selected
          </button>
        )}
      </div>


      {notifications.map((notification, index) => (
        <NotificationItem
          key={index}
          title={notification.title}
          description={notification.description}
          updatedAt={notification.updatedAt}
          detailsLink={notification.detailsLink}
          isImportant={notification.isImportant}
          onDelete={() => onDeleteNotification && onDeleteNotification(index)}
          isChecked={checkedIndices.includes(index)}
          onCheckboxChange={(checked) => handleCheckboxChangeTab(index, checked)}
        />
      ))}
    </div>
  );
};

export default NotificationTab;