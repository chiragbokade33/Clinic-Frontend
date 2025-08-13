'use client'
import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import DefaultLayout from '../components/DefaultLayout';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';



const page = () => {
    const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);
    const router = useRouter();
    const [hovered, setHovered] = useState(false);

    return (
        <DefaultLayout>
            <div className='mx-auto p-4'>
                <div className='flex flex-col lg:flex-row justify-between gap-6 mb-6'>

                    {/* User Profile Card - Your original structure improved */}
                    <div className="relative bg-[#CAE5FF] rounded-2xl mb-8 border border-black w-full max-w-md p-4 md:p-6">

                        {/* HF ID in top-right */}
                        <div className="absolute top-0 right-0 bg-white px-3 py-1 rounded-bl-lg rounded-tr-2xl border-l border-b border-black">
                            <span className="text-xs md:text-sm font-mono text-gray-800">
                                HF010125ANK1312
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
                                <h2 className="text-xl font-bold text-blue-800">Ankit k.</h2>
                                <div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-medium text-gray-600">Blood Group :</span>
                                        <span className="bg-white border border-black text-black text-sm font-medium px-2.5 py-0.5 rounded">
                                            AB-
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
                    <div className="p-4 max-w-sm">
                        <p className="text-gray-700 text-center mb-4 font-medium">
                            Share a Symptoms Diary with the patient.
                        </p>
                        <button className='bg-green text-white font-semibold py-3 px-6 rounded-lg w-full transition-colors'>
                            Send Now
                        </button>
                    </div>
                </div>

                {/* Consent Forms Section - Added to match the design */}
                <div className="bg-white rounded-xl  border border-black ">
                    {/* Dropdown Header */}
                    <button
                        onClick={() => setIsConsentDropdownOpen(!isConsentDropdownOpen)}
                        className="w-full flex items-center justify-between p-4 border-b border-black  transition-colors"
                    >
                        <span className="text-lg font-medium text-black">
                            View and Edit the consent forms filled by the patient.
                        </span>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${isConsentDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Consent Forms Content */}
                    {isConsentDropdownOpen && (
                        <div className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6 mx-4">

                                {/* DTR Consent Form Card */}
                                <div className="relative p-4 rounded-xl border border-black transition-all cursor-pointer w-full max-w-md mx-auto" onClick={() => router.push("/consentForm")}>
                                    {/* Logo container */}
                                    <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3">
                                        <img
                                            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                            alt="ARTHROSE Logo"
                                            className="max-w-full max-h-full rounded"
                                        />
                                    </div>
                                    <div className="border border-gray-400 mx-auto w-full mt-3"></div>

                                    {/* Title */}
                                    <h3 className="font-semibold text-gray-800 text-md text-center mb-4 mt-4">
                                        DTR Consent Form
                                    </h3>

                                    {/* Red dot bottom-right */}
                                    <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-red-600"></div>
                                </div>

                                {/* Photo Consent Form - Active */}
                                <div
                                    className={`relative p-4 rounded-xl border border-black transition-all duration-300 cursor-pointer w-full max-w-md mx-auto ${hovered ? "bg-gray-700" : "bg-white"
                                        }`}
                                    onClick={() => router.push("/consentForm")}
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                >
                                    {hovered ? (
                                        // Hover content
                                        <div className="flex flex-col items-center justify-center text-center h-full">
                                            <h3 className="font-semibold text-yellow-400 text-sm mb-2">
                                                Photo Consent Form
                                            </h3>
                                            <span className="text-white text-xs">View</span>
                                        </div>
                                    ) : (
                                        // Default content
                                        <>
                                            {/* Logo */}
                                            <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3">
                                                <img
                                                    src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                                    alt="ARTHROSE Logo"
                                                    className="max-w-full max-h-full rounded"
                                                />
                                            </div>

                                            {/* Divider */}
                                            <div className="border border-gray-400 mx-auto w-full mt-3"></div>

                                            {/* Title */}
                                            <h3 className="font-semibold text-gray-800 text-md text-center mb-4 mt-4">
                                                DTR Consent Form
                                            </h3>
                                        </>
                                    )}

                                    {/* Green dot */}
                                    <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-green-500"></div>
                                </div>

                                {/* Arthrose Functional Screening */}
                                <div className="relative p-4 rounded-xl border border-black transition-all cursor-pointer w-full max-w-md mx-auto">
                                    {/* Logo container */}
                                    <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3">
                                        <img
                                            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                            alt="ARTHROSE Logo"
                                            className="max-w-full max-h-full rounded"
                                        />
                                    </div>
                                    <div className="border border-gray-400 mx-auto w-full mt-3"></div>

                                    {/* Title */}
                                    <h3 className="font-semibold text-gray-800 text-md text-center mb-4 mt-4">
                                        Arthose Functional Screening
                                    </h3>

                                    {/* Green dot bottom-right */}
                                    <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                            </div>

                            <div className="w-full flex justify-end">
                                <div className="flex flex-col items-start justify-between gap-4 p-4 border-t border-l border-black ">
                                    <span className="text-gray-700 font-medium">Share another consent form</span>
                                    <div className="w-full justify-center">
                                        <button className="bg-yellow-300 text-black border border-black font-semibold py-2 px-6 rounded-lg transition-colors">
                                            Send Now
                                        </button>
                                    </div>
                                </div>
                            </div>


                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-black mb-6 mt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-black">
                        <span className="text-lg font-medium text-black">
                            Manage treatment plans, prescriptions, and reports effortlessly.
                        </span>
                        <button className="flex items-center gap-2 px-3 py-1 border border-black rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"  onClick={() => router.push("/ClinicShareReports")}>
                            <span className="text-sm font-medium">History</span>
                            <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Patient's Treatment Plan Section */}
                        <div className="mb-8">
                            <h3 className="text-lg flex justify-end font-medium text-blue-800 mb-4">
                                patient's treatment plan :
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {/* Attach Images Card */}
                                <div className="bg-white rounded-lg p-4">
                                    <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                        <img
                                            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                            alt="ARTHROSE Logo"
                                            className="max-w-20 max-h-20 rounded"
                                        />
                                    </div>
                                    <button className="w-full bg-yellow text-black font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                                        Attach Images
                                    </button>
                                </div>

                                {/* Prescription + Share wrapper with border between */}
                                <div className="col-span-2 flex divide-x divide-black rounded-lg overflow-hidden bg-white">
                                    {/* Prescription */}
                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                                alt="ARTHROSE Logo"
                                                className="max-w-20 max-h-20 rounded"
                                            />
                                        </div>
                                        <button className="w-full bg-yellow text-black font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                                            Prescription
                                        </button>
                                    </div>

                                    {/* Share */}
                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                                alt="ARTHROSE Logo"
                                                className="max-w-20 max-h-20 rounded"
                                            />
                                        </div>
                                        <button className="w-full  text-white font-semibold py-2 px-4 rounded-lg primary cursor-pointer transition-colors">
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Send Invoice Details Section */}

                    </div>


                </div>
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-800 mb-4">Send Invoice Details :</h3>

                    <div className="flex  divide-x divide-black gap-4 mb-6">
                        {/* Invoice Share Card */}
                        <div className="bg-white  p-4">
                            <div className="h-45 w-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                    alt="ARTHROSE Logo"
                                    className="max-w-20 max-h-20 rounded"
                                />
                            </div>
                            <button className="w-full primary text-white font-semibold py-2 px-4 rounded-lg  transition-colors">
                                Share
                            </button>
                        </div>

                        {/* Receipt Card */}
                        <div className="bg-white  rounded-lg p-4">
                            <div className="h-45 w-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                    alt="ARTHROSE Logo"
                                    className="max-w-20 max-h-20 rounded"
                                />
                            </div>
                            <button className="w-full bg-yellow text-black border border-black font-semibold py-2 px-4 rounded-lg  transition-colors">
                                Receipt
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <button className="w-full sm:flex-1 bg-green text-white font-semibold py-3 px-6 rounded-lg  transition-colors">
                        Make sure all details are correct before proceeding.
                    </button>
                    <button className="w-full sm:w-auto primary text-white font-semibold py-3 px-8 rounded-lg  transition-colors">
                        Send
                    </button>
                </div>
            </div>
        </DefaultLayout>
    )
}

export default page