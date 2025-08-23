import React from 'react'

interface ProfileData {
  name: string;
  email: string;
  age?: number; // optional
  avatarUrl?: string;
  hfId:string;
  bloodGroup:string;
  fullName:string;
}

const Profiledetails: React.FC<{ profileData: ProfileData }> = ({ profileData }) => {
  return (
    <div className='flex flex-col lg:flex-row justify-between gap-6 mb-6'>
    
                        {/* User Profile Card - Your original structure improved */}
                        <div className="relative bg-[#CAE5FF] rounded-2xl mb-8 border border-black w-full max-w-md p-4 md:p-6">
    
                            {/* HF ID in top-right */}
                            <div className="absolute top-0 right-0 bg-white px-3 py-1 rounded-bl-lg rounded-tr-2xl border-l border-b border-black">
                                <span className="text-xs md:text-sm font-mono text-gray-800">
                                    {profileData?.hfId}
                                </span>
                            </div>
    
                            {/* Main Content */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
    
                                {/* Profile Image */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                                        <img
                                            src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                                            alt="User profile"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
    
                                {/* Details */}
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-blue-800">{profileData?.fullName}</h2>
                                    <div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-medium text-gray-600">Blood Group :</span>
                                            <span className="bg-white border border-black text-black text-sm font-medium px-2.5 py-0.5 rounded">
                                                {profileData?.bloodGroup}
                                            </span>
                                        </div>
                                    </div>
    
                                    {/* More Details */}
                                    <div className="mt-3 flex justify-end">
                                        <button className="text-black underline font-semibold text-sm hover:text-gray-700">
                                            More Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        {/* Symptoms Diary Section - Your original improved */}
                        {/* <div className="p-4 max-w-sm">
                            <p className="text-gray-700 text-center mb-4 font-medium">
                                Share a Symptoms Diary with the patient.
                            </p>
                            <button className='bg-green text-white font-semibold py-3 px-6 rounded-lg w-full transition-colors'>
                                Send Now
                            </button>
                        </div> */}
                    </div>
  )
}

export default Profiledetails
