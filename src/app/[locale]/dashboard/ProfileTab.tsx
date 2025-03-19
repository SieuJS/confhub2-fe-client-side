import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserResponse } from '@/src/models/response/user.response';
import { useLocalStorage } from 'usehooks-ts';
import Button from '../utils/Button';
import { getUserById } from '../../../api/user/getUserById'; // Correct relative path
import { updateUser } from '../../../api/user/updateUser';   // Correct relative path
import { FaCheckCircle } from 'react-icons/fa'; // Import an icon, e.g., from react-icons


interface ProfileTabProps { }

const ProfileTab: React.FC<ProfileTabProps> = () => {
    const [userData, setUserData] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<UserResponse>>({});

      const [user, setUser] = useLocalStorage<{
        firstname: string;
        lastname: string;
        email: string;
        id: string;
    } | null>('user', null);

    const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
        'loginStatus',
        null
    );


    useEffect(() => {
        const fetchUserData = async () => {
            if (loginStatus !== null && user?.id) {
                setLoading(true);
                setError(null);
                try {
                    const fetchedUser = await getUserById(user.id);
                    setUserData(fetchedUser);
                    setEditedData(fetchedUser);
                } catch (err: any) {
                    setError(err.message || 'Error fetching user data');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError('User not logged in or user ID not found');
            }
        };

        fetchUserData();
    }, [loginStatus, user]);


    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const updatedUser = await updateUser(user!.id, editedData);
            setUserData(updatedUser);
            setIsEditing(false);

            if (user) {
                localStorage.setItem('user', JSON.stringify({
                    firstname: updatedUser.firstName,
                    lastname: updatedUser.lastName,
                    email: updatedUser.email,
                    id: updatedUser.id,
                }));
            }

        } catch (error: any) {
            console.error("Failed to update user:", error);
            setError(error.message || "Update user failed");
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setEditedData(userData || {});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditedData({
            ...editedData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // TODO: Handle image upload
            console.log("Selected file:", file);
        }
    };


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    if (!userData) {
        return <div className="text-center py-4">No user data found.</div>;
    }

    return (
        <div className="mx-auto max-w-7xl bg-gray-100 rounded-lg shadow-md rounded-lg overflow-hidden px-12 py-8 ">
            {/* Cover Photo */}
            <div className="relative h-80 rounded-lg overflow-hidden">
                <Image
                    src="/bg-2.jpg"
                    alt="Cover Photo"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 100vw"
                    priority
                />
            </div>

            {/* Profile Info Section */}
            <div className="relative px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-5">
                {/* Avatar */}
                <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-white -mt-40 bg-gray-200">
                    <Image
                        src="/s1.png"
                        alt={`Avatar of ${userData.firstName} ${userData.lastName}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 25vw"
                        priority
                    />
                </div>

                {/* Name and Title */}
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {userData.firstName} {userData.lastName}
                        {userData.role === 'admin' && <FaCheckCircle className="ml-2 text-blue-500 inline-block" />}
                    </h1>
                    <p className="text-gray-600 font-medium">Senior Software Engineer at Technext Limited</p>
                    <p className="text-gray-500">New York, USA</p>

                    <div className="mt-3 space-x-3">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-full transition duration-300 ease-in-out">Following</button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition duration-300 ease-in-out">Message</button>
                    </div>
                </div>

                 {/* Followers and Company Logos */}
                <div className="flex items-center gap-4 md:ml-auto">
                    <div className="text-sm text-gray-600">
                        See followers (330)
                    </div>
                    <div className='flex gap-2'>
                        <Image src='/google.png' alt='Google' width={24} height={24} className='rounded-full' />
                        <Image src='/apple.png' alt='Apple' width={24} height={24} className='rounded-full'/>
                        <Image src='/hp.png' alt='HP' width={24} height={24} className='rounded-full'/>
                    </div>
                </div>
            </div>


            {/* Edit/Display Section */}
            <div className="p-6 border-t border-gray-200">
                {isEditing ? (
                    // Edit Form
                    <div className="space-y-6 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                                    Change Profile Pic
                                </label>
                                <input type="file" id="avatar" accept="image/*" onChange={handleImageChange} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={editedData.firstName || ''}
                                    onChange={handleInputChange}
                                    className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={editedData.lastName || ''}
                                    onChange={handleInputChange}
                                    className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={editedData.email || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={editedData.dob || ''}
                                onChange={handleInputChange}
                                className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>

                        <div>
                            <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label>
                            <input
                                type="text"
                                id="designation"
                                name="designation"
                                placeholder="Enter Designation"
                                onChange={handleInputChange}
                                className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                            />
                        </div>

                        <div>
                            <label htmlFor="about" className="block text-sm font-medium text-gray-700">About</label>
                            <textarea
                                id="about"
                                name="about"
                                placeholder="Tell us more about you"
                                onChange={handleInputChange}
                                className="mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50 h-32"
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="opportunities" className="block text-sm font-medium text-gray-700">Opportunities</label>
                            <input type="text" id='opportunities' className='mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50' placeholder='Attending Event' />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">I belong to this sector</label>
                            <input type="text" id='sector' className='mt-2 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50' placeholder='Building & Construction' />

                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">I'm also interested in these sectors</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Apparel & Clothing</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Home & Office</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">IT & Technology</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Medical & Pharma</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Telecommunication</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Topics/Products</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Blockchain</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Chemical Biology</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Drug Discovery & Dev</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Drugs & Medicine</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Furniture</span>
                                <span className="bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-sm transition duration-200">Home Improvement</span>
                            </div>
                        </div>


                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleCancelClick}
                                className="px-6 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-200 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveClick}
                                className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    // Display Information
                    <>
                        <div className="flex justify-end">
                            <Button variant="primary" onClick={handleEditClick} className="px-6 py-2 rounded-md focus:outline-none focus:ring-2">
                                Edit Profile
                            </Button>
                        </div>
                         <div className="mt-4">
                            <p className="text-gray-700">
                                <span className="font-semibold">Email:</span> <a href={`mailto:${userData.email}`} className="text-blue-500 hover:underline">{userData.email}</a>
                            </p>
                             {/* Display dob if it exists */}
                            {userData.dob && (
                                <p className="text-gray-700">
                                <span className="font-semibold">Date of Birth:</span> {userData.dob}
                                </p>
                            )}
                            {/* Display other fields here */}
                            </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileTab;