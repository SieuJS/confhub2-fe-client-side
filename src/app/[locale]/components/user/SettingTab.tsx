import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface SettingTabProps {
    //  props (nếu bạn có truyền props nào từ component cha).
}

const SettingTab: React.FC<SettingTabProps> = () => {
    const t = useTranslations('');
    const [autoAdd, setAutoAdd] = useState(true);
    const [changeUpdate, setChangeUpdate] = useState(true);
    const [upcomingEvent, setUpcomingEvent] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState<'notification' | 'notification+email'>('notification'); // Thay đổi state

    const toggleAutoAdd = () => setAutoAdd(!autoAdd);
    const toggleChangeUpdate = () => setChangeUpdate(!changeUpdate);
    const toggleUpcomingEvent = () => setUpcomingEvent(!upcomingEvent);
    const handleDeliveryChange = (event: React.ChangeEvent<HTMLSelectElement>) => { // Hàm xử lý thay đổi
        setDeliveryMethod(event.target.value as 'notification' | 'notification+email');
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
                    <button className="bg-red-500 hover:bg-red-600  font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        {t('Delete Account')}
                    </button>
                     <p className=" text-sm mt-2">
                        {t('Warning: Deleting your account is irreversible. All your data will be permanently removed.')}
                    </p>
                </section>
            </main>
        </div>
    );
};

export default SettingTab;