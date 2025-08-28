'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/navigation';
import { getUserId } from '../hooks/GetitemsLocal';
import { ListPatients } from '../services/ClinicServiceApi';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PatientListInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Separate states for selected dates vs applied dates
  const [startDate, setStartDate] = useState<Date | null>(null); // For date picker display
  const [endDate, setEndDate] = useState<Date | null>(null); // For date picker display
  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(null); // For API calls
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(null); // For API calls

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemsPerPage] = useState(10); // You can make this configurable

  const router = useRouter();

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  // Format date to dd-MM-yyyy
  const formatDateForAPI = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch patients from API - only depends on appliedStartDate and appliedEndDate
  const fetchPatients = useCallback(async () => {
    if (!currentUserId) return;

    setLoading(true);
    try {
      // Format dates to dd-MM-yyyy format if they exist
      const formattedStartDate = appliedStartDate ? formatDateForAPI(appliedStartDate) : undefined;
      const formattedEndDate = appliedEndDate ? formatDateForAPI(appliedEndDate) : undefined;

      console.log('API Call with dates:', { formattedStartDate, formattedEndDate }); // Debug log

      const response = await ListPatients(currentUserId, formattedStartDate, formattedEndDate);
      const patientsData = response?.data?.data?.patients || [];
      const total = response?.data?.data?.totalPatients || 0;

      setPatients(patientsData);
      setTotalPatients(total);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setPatients([]);
      setTotalPatients(0);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, appliedStartDate, appliedEndDate]); // Only depends on applied dates

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter patients based on search query only (dates handled by API)
  const filterPatients = useCallback(() => {
    let filtered = [...patients];

    // Search filter (name and hfid) - keep client-side
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(patient =>
        patient.patientName?.toLowerCase().includes(query) ||
        patient.hfid?.toLowerCase().includes(query)
      );
    }

    // Remove client-side date filtering since API handles it now
    setFilteredPatients(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [patients, debouncedSearchQuery]); // Removed startDate and endDate dependencies

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  // Pagination helpers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle date range selection (no API call)
  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    // Don't call API here - only when Done is clicked
  };

  // Handle Done button click - apply the selected dates and call API
  const handleDatePickerDone = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setShowDatePicker(false);
    // API will be called automatically due to useEffect dependency on appliedStartDate/appliedEndDate
  };

  // Clear date filter
  const clearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    // API will be called automatically due to applied dates changing
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setAppliedStartDate(null);
    setAppliedEndDate(null);
  };

  // Handle "See more" button click with patient data
  const handleSeeMore = (patient: any) => {
    // Create URL search parameters
    const params = new URLSearchParams();

    // Add patient data to URL parameters
    if (patient.patientId || patient.id) {
      params.append('patientId', patient.patientId || patient.id);
    }
    if (patient.hfid) {
      params.append('hfid', patient.hfid);
    }
    if (patient.lastVisitDate) {
      params.append('lastVisitDate', patient.lastVisitDate);
    }

    // Add visitId from the visits array (using the first visit if available)
    if (patient.visits && patient.visits.length > 0 && patient.visits[0].visitId) {
      params.append('visitId', patient.visits[0].visitId);
    }

    // Navigate to treatment details page with parameters
    const queryString = params.toString();
    router.push(`/tretmentDetails${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <DefaultLayout>
      <div className="h-[80vh] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-semibold text-gray-900 mx-5">Client's list:</h1>

            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or HF ID"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-80 pl-10 pr-4 py-2 border border-black rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-[#01154c] text-white rounded-full">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className='border border-black mx-3'></div>

          {/* Subtitle and Filter Status */}
          <div className="mt-4 mb-6 flex items-center">
            <p className="flex-1 text-center text-blue-800 text-lg font-medium">
              "All your client's details in one place!"
            </p>
            <div className="w-8 h-8 bg-[#238B02] rounded-md flex items-center justify-center ml-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-white text-sm" />
            </div>
          </div>



          {/* Patient Directory Card */}
          <div className="bg-white h-[550px] rounded-lg shadow-sm border border-black overflow-hidden">
            {/* Card Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Client Directory</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-800 font-bold">Total: {totalPatients}</span>

                  {/* Calendar Icon Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className={`flex items-center justify-center w-10 h-10 border rounded-lg transition-colors ${appliedStartDate || appliedEndDate
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <Calendar className="h-5 w-5" />
                    </button>

                    {/* Date Range Picker Modal */}
                    {showDatePicker && (
                      <div className="absolute right-0 top-12 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[300px]">
                        <div className="mb-3">
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Date Range</h3>
                          <DatePicker
                            selected={startDate}
                            onChange={handleDateRangeChange}
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
                            onClick={clearDateFilter}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Clear
                          </button>
                          <button
                            onClick={handleDatePickerDone}
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
              <div className="grid grid-cols-6 gap-4">
                <div className="text-sm font-medium text-gray-700">Name</div>
                <div className="text-sm font-medium text-gray-700">HF_id</div>
                <div className="text-sm font-medium text-gray-700">Last Visit</div>
                <div className="text-sm font-medium text-gray-700">Package</div>
                <div className="text-sm font-medium text-gray-700">Payment</div>
                <div className="text-sm font-medium text-gray-700">View</div>
              </div>
            </div>


            {/* Loading State */}
            {loading && (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-500">Loading clients...</div>
              </div>
            )}

            {/* No Results State */}
            {!loading && currentPatients.length === 0 && (
              <div className="px-6 py-8 text-center">
                <div className="text-gray-500">
                  {filteredPatients.length === 0 && patients.length > 0
                    ? 'No clients found matching your search criteria.'
                    : 'No clients found.'}
                </div>
                {(searchQuery || appliedStartDate || appliedEndDate) && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Clear filters to show all clients
                  </button>
                )}
              </div>
            )}

            {/* Patient Rows */}
            {!loading && (
              <div className="divide-y divide-gray-200">
                {currentPatients.map((patient: any, index: number) => (
                  <div
                    key={`${patient.hfid}-${index}`}
                    className={`group px-6 py-4 hover:bg-blue-100 transition-colors ${patient.highlighted ? 'bg-blue-50' : 'bg-white'}`}
                  >
                    <div className="grid grid-cols-6 gap-4 items-center">
                      {/* Name with Avatar */}
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{patient.patientName || 'N/A'}</span>
                      </div>

                      {/* HF ID */}
                      <div className="text-sm text-gray-700">{patient.hfid || 'N/A'}</div>

                      {/* Last Visit */}
                      <div className="text-sm text-gray-700">
                        {patient.lastVisitDate || 'N/A'}
                      </div>

                      {/* Package Name */}
                      <div className="text-sm text-gray-700">
                        {patient.treatmentNames || 'N/A'}
                      </div>

                      {/* Payment Status */}
                      <div
                        className={`text-sm font-medium ${patient.payment
                          ? patient.paymentColor || 'text-gray-700'
                          : 'text-red-500'
                          }`}
                      >
                        {patient.paymentStatus || "Pending"}
                      </div>

                      {/* View Button */}
                      <div>
                        <button
                          className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors
                bg-[#CAE5FF] text-[#353935] border-[#CAE5FF]
                group-hover:bg-[#238B02] group-hover:border-[#238B02] group-hover:text-white
                hover:bg-[#238B02] hover:border-[#238B02] hover:text-white cursor-pointer`}
                          onClick={() => handleSeeMore(patient)}
                        >
                          See more
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Enhanced Pagination */}
          {!loading && filteredPatients.length > 0 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md transition-colors ${currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                {getPaginationNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => goToPage(page as number)}
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {/* Next Button */}
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md transition-colors ${currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

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