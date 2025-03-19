// SettingTab.tsx
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useLocalStorage } from 'usehooks-ts'; // Import useLocalStorage
import { useRouter, usePathname } from 'next/navigation'; // Correct import
import deleteUser from '../../../api/user/deleteUser'; // Import API function directly

interface SettingTabProps {
    //  props (nếu bạn có truyền props nào từ component cha).
}

const SettingTab: React.FC<SettingTabProps> = () => {
    const t = useTranslations('');
    const [autoAdd, setAutoAdd] = useState(true);
    const [changeUpdate, setChangeUpdate] = useState(true);
    const [upcomingEvent, setUpcomingEvent] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'notification' | 'notification+email'>('notification'); // Thay đổi state
    const [isDeleting, setIsDeleting] = useState(false); // Add loading state
    const [deleteError, setDeleteError] = useState<string | null>(null); // Add error state
    const router = useRouter();
    const pathname = usePathname();

    // Get user from local storage
    const [user, setUser] = useLocalStorage<{
      firstname: string;
      lastname: string;
      email: string;
      id: string;
  } | null>('user', null);

    const toggleAutoAdd = () => setAutoAdd(!autoAdd);
    const toggleChangeUpdate = () => setChangeUpdate(!changeUpdate);
    const toggleUpcomingEvent = () => setUpcomingEvent(!upcomingEvent);
    const handleDeliveryChange = (event: React.ChangeEvent<HTMLSelectElement>) => { // Hàm xử lý thay đổi
        setDeliveryMethod(event.target.value as 'notification' | 'notification+email');
    };

    const handleDeleteAccount = async () => {
      if (window.confirm("Are you sure you want to delete your account?  This action cannot be undone.")) {
        setIsDeleting(true); // Set loading state to true
        setDeleteError(null); // Clear any previous errors

        try {
          if (!user) {
              setDeleteError("User not logged in.");
              return; // Early return if no user
          }
          await deleteUser(user.id); // Call the API function
          setUser(null);

           // Redirect to login page, correctly handling locale
           let pathWithLocale = '/auth/login';
           if (pathname) {
               const pathParts = pathname.split('/');
               if (pathParts.length > 1) {
                   const localePrefix = pathParts[1];
                   pathWithLocale = `/${localePrefix}/auth/login`;
               }
           }
           router.push(pathWithLocale);

        } catch (error: any) {
          setDeleteError(error.message || "Failed to delete account."); // Set error message
          console.error("Failed to delete account:", error); // Log the error for debugging.
        } finally {
          setIsDeleting(false); // Reset loading state
        }
      }
    };

    return (
        <div className="flex">

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold">Setting</h2>
                </header>

                {/* Setting Options */}
                <section className="mb-8">

                    {/* Option 1: Auto add events to schedule */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="font-semibold">{t('Auto add events to schedule')}</h4>
                            <p className="text-gray-500 text-sm">
                                {t('Important dates from conferences you follow will be automatically added to your schedule')}.
                            </p>
                        </div>
                        <button
                            className={`w-12 h-6 rounded-full focus:outline-none transition-colors duration-200 ${
                                autoAdd ? 'bg-button' : 'bg-background-secondary'
                            }`}
                            onClick={toggleAutoAdd}
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                                    autoAdd ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            ></div>
                        </button>
                    </div>

                    {/* Option 2: Change and Update */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="font-semibold">{t('Change and Update')}</h4>
                            <p className="text-gray-500 text-sm">
                                {t('Our system will send you email notifications about conferences with extended dates.')}
                            </p>
                        </div>
                        <button
                            className={`w-12 h-6 rounded-full focus:outline-none transition-colors duration-200 ${
                                changeUpdate ? 'bg-button' : 'bg-background-secondary'
                            }`}
                            onClick={toggleChangeUpdate}
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                                    changeUpdate ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            ></div>
                        </button>
                    </div>

                    {/* Option 3: Your upcoming event */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="font-semibold">{t('Your upcoming event')}</h4>
                            <p className="text-gray-500 text-sm">
                                {t('Our system will send you email notifications about your upcoming events in the timestamp.')}
                            </p>
                        </div>
                        <button
                            className={`w-12 h-6 rounded-full focus:outline-none transition-colors duration-200 ${
                                upcomingEvent ? 'bg-button' : 'bg-background-secondary'
                            }`}
                            onClick={toggleUpcomingEvent}
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                                    upcomingEvent ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            ></div>
                        </button>
                    </div>

                    {/* Option 4: Customize notification delivery (Combobox) */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="font-semibold">{t('Customize notification delivery')}</h4>
                            <p className="text-gray-500 text-sm">
                                {t('Choose how you want to receive notifications.')}
                            </p>
                        </div>
                        <select
                            className="border rounded px-2 py-1 bg-background-secondary focus:outline-none focus:ring focus:border-blue-300"
                            value={deliveryMethod}
                            onChange={handleDeliveryChange}
                        >
                            <option value="notification">{t('Notification only')}</option>
                            <option value="notification+email">{t('Notification + email')}</option>
                        </select>
                    </div>

                </section>

                {/* Delete Account Button */}
                <section>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    {isDeleting ? 'Deleting...' : t('Delete Account')}
                  </button>
                  {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
                  <p className="text-sm mt-2">
                    {t('Warning: Deleting your account is irreversible. All your data will be permanently removed.')}
                  </p>
                </section>
            </main>
        </div>
    );
};

export default SettingTab;