'use client'
import React, { useEffect, useState } from 'react';
import { Info, User, ExternalLink } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import { HistoryList } from '../services/ClinicServiceApi';
import { useSearchParams } from 'next/navigation';
import { getUserId } from '../hooks/GetitemsLocal';

const SharedReportsDashboard = () => {
  const searchParams = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [patient, SetPatient] = useState() as any;
  const [VisitData, setVisitData] = useState() as any;

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const listData = async () => {
      const extractedPatientId = searchParams.get('patientId');
      const id = await getUserId();
      setCurrentUserId(id);
      const response = await HistoryList(id, extractedPatientId);
      SetPatient(response?.data?.data)
      setVisitData(response?.data?.data?.visits)
    }
    listData();
  }, [searchParams]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle card click to open PDF in new tab
  const handleCardClick = (url: string, type: string) => {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    } else {
      alert(`${type} document is not available yet.`);
    }
  };

  // Get status color (you can customize this based on your business logic)
  const getStatusColor = (record: any) => {
    if (!record.url || record.url.trim() === '') {
      return 'bg-red-500'; // No document available
    }
    if (record.sendToPatient) {
      return 'bg-green-500'; // Shared with patient
    }
    return 'bg-blue-500'; // Available but not shared
  };

  return (
    <DefaultLayout>
      <div className="mx-auto p-4 h-screen">
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
          <div className="absolute top-0 right-0 bg-white px-3 py-1 rounded-bl-lg rounded-tr-2xl">
            <span className="text-xs md:text-sm font-mono text-gray-800">
              {patient?.hfId}
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
              <h2 className="text-xl font-bold text-blue-800">{patient?.patientName}</h2>
              <p className="text-black text-sm md:text-base mt-1">
                <span className="font-bold">Email:</span> {patient?.email}
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

        {/* Reports Sections - Using actual visit data */}
        {VisitData && VisitData.length > 0 ? (
          VisitData.map((visit: any, visitIndex: number) => (
            <div key={visitIndex} className="mb-8">
              {/* Date Header */}
              <div className="flex justify-end">
                <span className="text-gray-600 font-medium text-sm md:text-base">
                  {formatDate(visit.appointmentDate)}
                </span>
              </div>
              <div className="border-t border-gray-400 my-2"></div>

              {/* Consent Forms */}
              {visit.consentForms && visit.consentForms.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Consent Forms</h3>
                  <div className="flex flex-wrap gap-6 justify-start">
                    {visit.consentForms.map((consentUrl: string, consentIndex: number) => (
                      <div key={consentIndex} className="flex flex-col items-center">
                        <div
                          className="relative w-40 h-46 bg-white rounded-lg border border-gray-300 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleCardClick(consentUrl, 'Consent Form')}
                        >
                          <div className="w-full flex justify-center pt-2">
                            <img
                              src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                              alt="Consent Form"
                              className="w-36 h-16 object-contain"
                            />
                          </div>
                          {/* External link icon */}
                          <ExternalLink className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                          {/* Status Dot */}
                          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                        <p className="mt-2 text-center text-sm text-gray-800">
                          Consent Form
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Records */}
              {visit.records && visit.records.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Medical Records</h3>
                  <div className="flex flex-wrap gap-6 justify-start">
                    {visit.records
                      .filter((record: any) => record.sendToPatient) // Only show records shared with patient
                      .map((record: any, recordIndex: number) => (
                        <div key={recordIndex} className="flex flex-col items-center">
                          <div
                            className={`relative w-40 h-46 bg-white rounded-lg border border-gray-300 overflow-hidden transition-shadow ${record.url && record.url.trim() !== ''
                                ? 'cursor-pointer hover:shadow-md'
                                : 'opacity-75 cursor-not-allowed'
                              }`}
                            onClick={() => handleCardClick(record.url, record.type)}
                          >
                            <div className="w-full flex justify-center pt-2">
                              <img
                                src='/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png'
                                alt={record.type}
                                className="w-36 h-16 object-contain"
                              />
                            </div>

                            {/* External link icon - only show if URL exists */}
                            {record.url && record.url.trim() !== '' && (
                              <ExternalLink className="absolute top-2 right-2 w-4 h-4 text-gray-500" />
                            )}

                            {/* Status Dot */}
                            <span
                              className={`absolute bottom-1 right-1 w-2 h-2 rounded-full ${getStatusColor(record)}`}
                            ></span>
                          </div>

                          <p className="mt-2 text-center text-sm text-gray-800">
                            {record.type}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No visit records found.</p>
          </div>
        )}

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