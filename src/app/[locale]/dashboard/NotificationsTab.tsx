// NotificationsTab.tsx
import React, { useState, useEffect } from 'react';
import { Notification, UserResponse } from '../../../models/response/user.response';

interface NotificationItemProps {
  notification: Notification;
  onDelete?: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  isChecked,
  onCheckboxChange,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
      setIsStarred(notification.isImportant);
  }, [notification.isImportant]);


  const toggleStar = () => {
    setIsStarred(!isStarred);
    // TODO: Thêm logic để update isImportant lên server nếu cần
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckboxChange(event.target.checked);
  };

  const openModal = () => { // Removed 'e' parameter
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div
      className={`rounded-md p-4 mb-4 flex justify-between w-full items-start ${isStarred || notification.isImportant ? 'bg-yellow-100 border border-yellow-400' : (isChecked ? 'bg-blue-50' : 'bg-white')} shadow-sm`}
    >
      <div className="flex items-start">
        <input
          type="checkbox"
          className="mr-2 mt-1 transform scale-110 appearance-none h-4 w-4 border border-gray-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none cursor-pointer"
          checked={isChecked}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => { toggleStar(); e.stopPropagation(); }}
          className="mr-2 focus:outline-none"
          aria-label="Mark as important"
        >
          <span className={`${isStarred || notification.isImportant ? 'text-yellow-500' : 'text-gray-600'} text-xl`}>
            ★
          </span>
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 cursor-pointer" onClick={openModal}> {/* Added onClick */}
            {notification.type}
          </h3>
          <p className="text-gray-700">{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">Updated: {formatDate(notification.createdAt)}</p>
          </div>
        </div>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-gray-500 hover:text-red-500 focus:outline-none"
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
          <div className="bg-white p-6 rounded-md shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">{notification.type}</h3>
            <p className="mb-4">{notification.message}</p>
            <p className="text-sm text-gray-500">Created at: {formatDate(notification.createdAt)}</p>
            <p className="text-sm text-gray-500">Seen at: {formatDate(notification.seenAt)}</p>
            <div className="text-right mt-4">
              <button onClick={closeModal} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ... (phần còn lại của NotificationTab giữ nguyên) ...
interface NotificationTabProps {
    //  Xóa notifications prop
    onDeleteNotification?: (id: string) => void; // Nhận ID thay vì index
  }
  
  const NotificationTab: React.FC<NotificationTabProps> = ({ onDeleteNotification }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [checkedIndices, setCheckedIndices] = useState<string[]>([]); // Store IDs instead of indices
    const [selectAllChecked, setSelectAllChecked] = useState(false);
      const [loading, setLoading] = useState(true);
      const [loggedIn, setLoggedIn] = useState(false);
  
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const userData = localStorage.getItem('user');
          if (!userData) {
              setLoggedIn(false);
            setLoading(false);
            return;
          }
  
          const user = JSON.parse(userData);
            setLoggedIn(true);
          const userResponse = await fetch(`http://localhost:3000/api/v1/user/${user.id}`);
          if (!userResponse.ok) {
            throw new Error(`HTTP error! status: ${userResponse.status}`);
          }
          const userDetails: UserResponse = await userResponse.json();
          setNotifications(userDetails.notifications || []);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
  
      const handleCheckboxChangeTab = (id: string, checked: boolean) => { // Use ID
      if (checked) {
        setCheckedIndices([...checkedIndices, id]);
      } else {
        setCheckedIndices(checkedIndices.filter((i) => i !== id));
      }
    };
  
    const handleDeleteSelected = () => {
      if (onDeleteNotification) {
          checkedIndices.forEach(id => {  // Pass the ID
              onDeleteNotification(id);
          });
  
        //  Cập nhật state sau khi xóa (cần backend hỗ trợ)
        setNotifications(prevNotifications => prevNotifications.filter(n => !checkedIndices.includes(n.id)));
        setCheckedIndices([]);
        setSelectAllChecked(false);
      }
    };
  
    const handleSelectAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setSelectAllChecked(checked);
      if (checked) {
        const allIds = notifications.map((n) => n.id); // Get all IDs
        setCheckedIndices(allIds);
      } else {
        setCheckedIndices([]);
      }
    };
  
    const hasCheckedNotifications = checkedIndices.length > 0;
  
      if (!loggedIn) {
          return (
              <div className='container mx-auto p-4'>
                  Please log in to view notifications.
              </div>
          );
      }
  
      if (loading) {
      return <div className='container mx-auto p-4'>Loading...</div>;
    }
  
  
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-2">Notifications</h1>
        <p className=" mb-4">All notifications here</p>
  
        <div className="mb-2 flex items-center justify-between">
          <div>
            <input
              type="checkbox"
              className="mr-2 transform scale-110 appearance-none h-4 w-4 border border-gray-300 rounded-sm checked:bg-blue-600 checked:border-blue-600 focus:outline-none cursor-pointer"
              checked={selectAllChecked}
              onChange={handleSelectAllChange}
            />
            <label htmlFor="select-all" className="text-sm">Select All</label>
          </div>
          {hasCheckedNotifications && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Delete Selected
            </button>
          )}
        </div>
  
         {notifications.length === 0 ? (
                  <p>You have no notifications.</p>
              ) : (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDelete={() => onDeleteNotification && onDeleteNotification(notification.id)} // Pass the ID
            isChecked={checkedIndices.includes(notification.id)} // Check by ID
            onCheckboxChange={(checked) => handleCheckboxChangeTab(notification.id, checked)} // Pass the ID
  
          />
        )))}
      </div>
    );
  };
  
  export default NotificationTab;