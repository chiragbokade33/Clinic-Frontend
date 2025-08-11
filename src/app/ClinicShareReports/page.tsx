import React from 'react';
import { Info, User } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';


const SharedReportsDashboard = () => {
  const reportsData = [
    {
      date: "March 5, 2024",
      reports: [
        { name: "X-Ray", type: "medical" },
        { name: "Prescription", type: "medical" },
        { name: "Invoice", type: "financial" },
        { name: "Receipt", type: "financial" }
      ]
    },
    {
      date: "April 2, 2025",
      reports: [
        { name: "Symptoms Diary", type: "diary", status: "active" },
        { name: "DTR Consent Form", type: "consent", status: "completed" },
        { name: "Arthrose Functional Screening", type: "screening", status: "pending" }
      ]
    }
  ];

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-red-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <DefaultLayout>
      <div className=" mx-auto p-4 h-screen">
        {/* Header */}
        <div className="flex items-center mb-6">
          <h1 className="flex-1 text-center text-2xl md:text-3xl font-bold text-gray-800">
            Shared Reports
            <div className='border border-black w-40 mx-auto mt-2'></div>
          </h1>
          <div className="bg-green-600 text-white p-2 rounded-lg ml-auto">
            <Info className="w-5 h-5" />
          </div>
        </div>



        {/* User Profile Card */}
        <div className="relative bg-[#CAE5FF] rounded-2xl mb-8 border border-black w-full max-w-md p-4 md:p-6">

          {/* HF ID in top-right */}
          <div className="absolute top-0 right-0 bg-white px-3 py-1 rounded-bl-lg rounded-tr-2xl ">
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
              <h2 className="text-xl font-bold text-blue-800">Ankit HFiles</h2>
              <p className="text-black text-sm md:text-base mt-1">
                <span className="font-bold">Email :</span> ankithfiles@gmail.com
              </p>

              {/* More Details */}
              <div className="mt-3 flex justify-end">
                <button className="text-black underline font-semibold text-sm hover:text-gray-700">
                  More Details
                </button>
              </div>
            </div>
          </div>
        </div>



        {/* Reports Sections */}
        {reportsData.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            {/* Date Header */}
            <div className="flex justify-end">
              <span className="text-gray-600 font-medium text-sm md:text-base">
                {section.date}
              </span>
            </div>
            <div className="border-t border-gray-400 my-2"></div>

            {/* Reports Row */}
            <div className="flex flex-wrap gap-6 justify-start">
              {section.reports.map((report: any, reportIndex) => (
                <div key={reportIndex} className="flex flex-col items-center">
                  {/* Card */}
                  <div className="relative w-40 h-46 bg-white rounded-lg border border-gray-300 overflow-hidden">
                    <div className="w-full flex justify-center pt-2">
                      <img
                        src="/0604d10d087f97b877ea0ae85e9494b5df28b6e7.png"
                        alt="ARTHROSE icon"
                        className="w-36 h-16 object-contain"
                      />
                    </div>

                    {/* Status Dot */}
                    {report.status && (
                      <span
                        className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${getStatusColor(report.status)}`}
                      ></span>
                    )}
                  </div>

                  {/* Title */}
                  <p className="mt-2 text-center text-sm text-gray-800">
                    {report.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}




        {/* Chat/Support Button */}
        <div className="fixed bottom-6 left-6">
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SharedReportsDashboard;