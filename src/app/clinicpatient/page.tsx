'use client'
import React, { useState } from 'react';
import { Search, Calendar, User } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';


const PatientListInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState() as any;
  const [endDate, setEndDate] = useState() as any;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();


  // Dummy patient data matching the screenshot
  const patients = [
    {
      id: 1,
      name: "Aarav Mehta",
      hfId: "HF120624RAN1097",
      lastVisit: "March 5, 2023",
      payment: "Cash",
      paymentColor: "text-gray-700"
    },
    {
      id: 2,
      name: "Aarav Mehta",
      hfId: "HF120624RAN1097",
      lastVisit: "July 18, 2022",
      payment: "UPI",
      paymentColor: "text-gray-700"
    },
    {
      id: 3,
      name: "Aarav Mehta",
      hfId: "HF120624RAN1097",
      lastVisit: "November 30, 2021",
      payment: "Cash",
      paymentColor: "text-gray-700",
      highlighted: true
    },
    {
      id: 4,
      name: "Aarav Mehta",
      hfId: "HF120624RAN1097",
      lastVisit: "July 18, 2022",
      payment: "Pending",
      paymentColor: "text-red-500"
    },
    {
      id: 5,
      name: "Aarav Mehta",
      hfId: "HF120624RAN1097",
      lastVisit: "July 18, 2022",
      payment: "Credit Card",
      paymentColor: "text-gray-700"
    }
  ];

  const totalPatients = 420;

  return (
    <DefaultLayout>
      <div className="h-[80vh]  p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between ">
            <h1 className="text-4xl font-semibold text-gray-900 mx-5">Patient's list:</h1>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 border border-black rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-[#01154c] text-white rounded-full ">
                <Search className="h-4 w-4" />
              </button>
            </div>

          </div>
          <div className='border border-black mx-3'></div>

          {/* Subtitle */}
          <div className="mt-4 mb-6 flex items-center">
            {/* Centered text */}
            <p className="flex-1 text-center text-blue-800 text-lg font-medium">
              "All your clinic's reports in one place!"
            </p>

            {/* Green circular icon */}
            <div className="w-8 h-8 bg-[#238B02] rounded-md flex items-center justify-center ml-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-white text-sm" />
            </div>
          </div>

          {/* Patient Directory Card */}
          <div className="bg-white rounded-lg shadow-sm border border-black overflow-hidden">
            {/* Card Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Patient Directory</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Total: {totalPatients}</span>

                  {/* Calendar Icon Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* Date Range Picker Modal */}
                    {showDatePicker && (
                      <div className="absolute right-0 top-12 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]">
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date Range</h3>
                          <DatePicker
                            selected={startDate}
                            onChange={(dates) => {
                              const [start, end] = dates;
                              setStartDate(start);
                              setEndDate(end);
                            }}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                            calendarClassName="border-0"
                          />
                        </div>

                        {/* Display selected range */}
                        {(startDate || endDate) && (
                          <div className="text-xs text-gray-600 mb-2">
                            {startDate ? startDate.toLocaleDateString() : 'Start'} - {endDate ? endDate.toLocaleDateString() : 'End'}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex justify-between">
                          <button
                            onClick={() => {
                              setStartDate(null);
                              setEndDate(null);
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => setShowDatePicker(false)}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="bg-white px-6 py-3 border-b border-gray-700 mx-auto">
              <div className="grid grid-cols-5 gap-4">
                <div className="text-sm font-medium text-gray-700">Name</div>
                <div className="text-sm font-medium text-gray-700">HF_id</div>
                <div className="text-sm font-medium text-gray-700">Last Visit</div>
                <div className="text-sm font-medium text-gray-700">Payment</div>
                <div className="text-sm font-medium text-gray-700">View</div>
              </div>
            </div>

            {/* Patient Rows */}
            <div className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${patient.highlighted ? 'bg-blue-50' : 'bg-white'
                    }`}
                >
                  <div className="grid grid-cols-5 gap-4 items-center">
                    {/* Name with Avatar */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{patient.name}</span>
                    </div>

                    {/* HF ID */}
                    <div className="text-sm text-gray-700">{patient.hfId}</div>

                    {/* Last Visit */}
                    <div className="text-sm text-gray-700">{patient.lastVisit}</div>

                    {/* Payment Status */}
                    <div className={`text-sm font-medium ${patient.paymentColor}`}>
                      {patient.payment}
                    </div>

                    {/* View Button */}
                    <div>
                      <button
                        className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${patient.highlighted
                            ? 'text-white bg-[#238B02]'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        onClick={() => router.push('/tretmentDetails')}
                      >
                        See more
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${currentPage === 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                1
              </button>
              <button
                onClick={() => setCurrentPage(2)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${currentPage === 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                2
              </button>
              <span className="text-gray-500 px-2">...</span>
              <button
                onClick={() => setCurrentPage(5)}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${currentPage === 5
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                5
              </button>
            </div>
          </div>
        </div>

        {/* Click outside to close modal */}
        {showDatePicker && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDatePicker(false)}
          ></div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default PatientListInterface;