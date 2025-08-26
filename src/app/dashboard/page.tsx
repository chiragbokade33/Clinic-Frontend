'use client'
import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faUser,
  faPhone,
  faClock,
  faExclamationCircle,
  faXmark,
  faUserPlus,
  faPlus,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import DefaultLayout from '../components/DefaultLayout';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateAppointments, ListAppointment, HFID, AddFolllowUp, AppoinmentUpdate, BookFolllowUp } from '../services/ClinicServiceApi';
import { getUserId } from '../hooks/GetitemsLocal';
import CustomTimePicker from '../components/CustomTimePicker';
import { toast } from 'react-toastify';

const HealthcareDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<number>() as any;
  const [appointments, setAppointments] = useState() as any;
  const [todayAppoinment, SetTodayAppoinmnet] = useState()as any;
  const [miss, SetMiss] = useState() as any;

  // New state variables for HF ID verification
  const [isVerifyingHFID, setIsVerifyingHFID] = useState(false);
  const [hfidVerified, setHfidVerified] = useState(false);
  const [hfidError, setHfidError] = useState('');
  const [open, setOpen] = useState(false);

  // Add this new state variable with your other useState declarations
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // Updated edit state variables - using separate states instead of object
  const [isEditing, setIsEditing] = useState(false);
  const [editingStatus, setEditingStatus] = useState("");
  const [editingTreatment, setEditingTreatment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [userName , setUserName]= useState() as any;

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  // HF ID Verification Handler
  const handleHFIDVerification = async () => {
    if (!patientFormik.values.patientId) {
      setHfidError('Please enter a Patient ID first');
      return;
    }

    setIsVerifyingHFID(true);
    setHfidError('');

    try {
      const payload = {
        hfid: patientFormik.values.patientId
      };

      const response = await HFID(payload);

      // Adjust this condition based on your API response structure
      if (response.data.success || response.status === 200) {
        setHfidVerified(true);
        setUserName(response.data.data.username)
        setHfidError('');
        toast.success('Patient ID verified successfully!');
      } else {
        setHfidVerified(false);
        setHfidError(response.data.message || 'Patient ID verification failed');
        toast.error('Patient ID verification failed');
      }
    } catch (error) {
      console.error('Error verifying HFID:', error);
      setHfidVerified(false);
      setHfidError('Error verifying Patient ID. Please try again.');
      toast.error('Error verifying Patient ID');
    } finally {
      setIsVerifyingHFID(false);
    }
  };

  // Modal Close Handler
  const handlePatientModalClose = () => {
    patientFormik.resetForm();
    setIsModalOpen(false);
    setHfidVerified(false);
    setHfidError('');
  };

  // Validation Schema for Appointment Form
  const appointmentValidationSchema = Yup.object({
    visitorName: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Client name is required'),

    phone: Yup.string()
      .matches(
        /^[\+]?[1-9][\d]{0,15}$/,
        'Please enter a valid phone number'
      )
      .min(10, 'Phone number must be at least 10 digits')
      .required('Phone number is required'),

    date: Yup.string()
      .matches(
        /^(0[1-9]|[12][0-9]|3[01]) - (0[1-9]|1[012]) - (19|20)\d\d$/,
        'Date must be in DD - MM - YYYY format'
      )
      .required('Date is required'),

    time: Yup.date()
      .required('Time is required')
      .nullable(),
  });

  // Validation Schema for Patient Form
  const patientValidationSchema = Yup.object({
    patientId: Yup.string()
      .min(5, 'Patient ID must be at least 5 characters')
      .required('Patient ID is required'),
    appointmentDate: Yup.date()
      .required('Appointment date is required')
      .nullable(),
    appointmentTime: Yup.date()
      .required('Appointment time is required')
      .nullable(),
    dtrConsent: Yup.boolean(),
    tmdConsent: Yup.boolean(),
    photoConsent: Yup.boolean(),
    arthroseConsent: Yup.boolean(),
  });

  const handleDateClick = (day: number | null) => {
    if (day) {
      const formattedDate = `${day.toString().padStart(2, '0')} - ${(currentDate.getMonth() + 1).toString().padStart(2, '0')} - ${currentDate.getFullYear()}`;

      appointmentFormik.setFieldValue('date', formattedDate);
      setShowModal(true);
    }
  };

  // Formik setup for Appointment Form
  const appointmentFormik = useFormik({
    initialValues: {
      visitorName: "",
      phone: "",
      date: "",
      time: new Date(),
      period: "",
    },
    validationSchema: appointmentValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const id = await getUserId();
      setCurrentUserId(id);
      try {
        // Convert date format from "DD - MM - YYYY" to "dd-MM-yyyy"
        const convertDateFormat = (dateString: string) => {
          if (!dateString) return "";
          // Remove spaces and replace with hyphens
          return dateString.replace(/\s/g, '');
        };

        // Transform Formik values into required payload
        const payload = {
          visitorUsername: values.visitorName,
          visitorPhoneNumber: values.phone,
          appointmentDate: convertDateFormat(values.date), // Convert format
          appointmentTime: values.time
            ? `${values.time.getHours().toString().padStart(2, "0")}:${values.time
              .getMinutes()
              .toString()
              .padStart(2, "0")}`
            : "",
          clinicId: id,
        };
        const response = await CreateAppointments(payload);
        toast.success(`${response.data.message}`)
        resetForm();
        setShowModal(false);
        appoinmentData(); // Refresh appointments
      } catch (error) {
        console.error("Error saving appointment:", error);
        toast.error("Failed to create appointment");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Updated Formik setup for Patient Form with API integration
  const patientFormik = useFormik({
    initialValues: {
      patientId: "",
      appointmentDate: new Date(),
      appointmentTime: new Date(),
      dtrConsent: false,
      tmdConsent: false,
      photoConsent: false,
      arthroseConsent: false,
    },
    validationSchema: patientValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      // Check if HFID is verified before submitting
      if (!hfidVerified) {
        toast.error('Please verify the Patient ID first by clicking the HF button');
        setSubmitting(false);
        return;
      }

      try {
        const id = await getUserId();
        setCurrentUserId(id);

        // Format the date for the API
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${day}-${month}-${year}`;
        };

        // Format the time for the API
        const formatTime = (time: Date) => {
          const hours = String(time.getHours()).padStart(2, '0');
          const minutes = String(time.getMinutes()).padStart(2, '0');
          return `${hours}:${minutes}`;
        };

        // Create consentFormTitles array based on selected checkboxes
        const consentFormTitles = [];
        if (values.dtrConsent) consentFormTitles.push("DTR Consent");
        if (values.tmdConsent) consentFormTitles.push("TMD/TMJP Consent");
        if (values.photoConsent) consentFormTitles.push("Photo Consent");
        if (values.arthroseConsent) consentFormTitles.push("Arthrose Functional Screening Consent");

        // Create payload for both APIs (same structure)
        const payload = {
          hfid: values.patientId,
          consentFormTitles: consentFormTitles,
          appointmentDate: formatDate(values.appointmentDate),
          appointmentTime: formatTime(values.appointmentTime),
        };

        console.log('Saving patient with payload:', payload);

        let response;
        let modalType = '';

        // Determine which API to call based on which modal is open
        if (isModalOpen) {
          // Add New Patient modal - use AddFolllowUp API
          response = await AddFolllowUp(id, payload);
          modalType = 'Add New Patient';
        } else if (showFollowUpModal) {
          // Book Follow-up Appointment modal - use BookFolllowUp API
          response = await BookFolllowUp(id, payload);
          modalType = 'Book Follow-up Appointment';
        }

        // Handle response
        if (response && (response.data.success || response.status === 200)) {
          toast.success(response.data.message || `${modalType} completed successfully!`);
          resetForm();
          setIsModalOpen(false);
          setShowFollowUpModal(false);
          setHfidVerified(false); // Reset verification status
          setHfidError('');

          // Refresh appointments list
          appoinmentData();
        } else {
          toast.error(response?.data?.message || `Failed to ${modalType.toLowerCase()}`);
        }

      } catch (error) {
        console.error('Error saving client:', error);
        const modalType = isModalOpen ? 'add client' : 'book follow-up appointment';
        toast.error(`Error ${modalType}. Please try again.`);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Helper function to get error message
  const getErrorMessage = (formik: any, fieldName: string) => {
    return formik.touched[fieldName] && formik.errors[fieldName]
      ? formik.errors[fieldName]
      : null;
  };

  // Helper function to check if field has error
  const hasError = (formik: any, fieldName: string) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  const appoinmentData = async () => {
    const id = await getUserId();
    setCurrentUserId(id);
    const response = await ListAppointment(id);
    setAppointments(response.data.data.appointments);
    SetMiss(response.data.data.missedAppointmentsToday)
    SetTodayAppoinmnet(response.data.data.totalAppointmentsToday)
  }

  useEffect(() => {
    appoinmentData();
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const selectYear = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  // Enhanced year generation - more dynamic range
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // Generate years from 20 years ago to 20 years in the future
    for (let year = currentYear - 20; year <= currentYear + 20; year++) {
      years.push(year);
    }
    return years;
  };

  const getTimeColor = (type: string) => {
    switch (type) {
      case 'morning': return 'bg-yellow-400 text-black';
      case 'early': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  // Enhanced today check function
  const isToday = (day: number | null) => {
    const today = new Date();
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  // Check if we're viewing current month
  const isCurrentMonth = () => {
    const today = new Date();
    return currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  // Go to current month function
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Get selected patient data based on selectedAppointment ID
  const selectedPatient = appointments && appointments.length > 0
    ? appointments.find((appointment: any) => appointment.id === selectedAppointment)
    : null;

  // Add optimized handlers to prevent re-renders and cursor jumping
  const handleTreatmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTreatment(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditingStatus(e.target.value);
  }, []);

  // Updated handleEditSave function using separate state variables
  const handleEditSave = async () => {
    if (!isEditing) {
      // Enter edit mode
      setIsEditing(true);
      setEditingStatus(selectedPatient?.status || "Scheduled");
      setEditingTreatment(selectedPatient?.treatment || "");
    } else {
      // Save changes
      try {
        setIsUpdating(true);

        const payload = {
          status: editingStatus,
          treatment: editingTreatment
        };

        const response = await AppoinmentUpdate(
          currentUserId,
          selectedPatient.id,
          payload
        );

        if (response.status === 200 || response.data.success) {
          // Update the appointments list with the new data
          setAppointments((prev: any[]) =>
            prev.map(apt =>
              apt.id === selectedPatient.id
                ? { ...apt, ...payload }
                : apt
            )
          );

          toast.success('Appointment updated successfully!');
          setIsEditing(false);
          setEditingStatus("");
          setEditingTreatment("");
        } else {
          toast.error('Failed to update appointment');
        }
      } catch (error) {
        console.error('Error updating appointment:', error);
        toast.error('Error updating appointment. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Updated handleCancelEdit function
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingStatus("");
    setEditingTreatment("");
  };

  // Combined Appointment List & Patient Details Component
  const CombinedAppointmentPatient = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Appointment List */}
        <div className="w-full lg:w-[60%] lg:border-r lg:border-black lg:pr-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-800 font-poppins-600">Appointment List :</h3>
            <select className=" px-3 py-2 text-md font-montserrat-600 font-semibold">
              <option>All</option>
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>
          <div className='border border-black '></div>

          <div className="space-y-3 mt-3">
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${selectedAppointment === appointment.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  onClick={() => {
                    setSelectedAppointment(appointment.id);
                    // Reset edit mode when switching patients
                    setIsEditing(false);
                    setEditingStatus("");
                    setEditingTreatment("");
                  }}
                >
                  {/* Profile Image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border shadow">
                    <img
                      src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate font-poppins-600">{appointment.visitorUsername}</h4>
                    <p className="text-sm text-gray-600 truncate font-medium font-poppins-500">{appointment.visitorPhoneNumber}</p>
                  </div>

                  {/* Time Badge */}
                  <div className={`px-3 py-1 rounded-lg text-sm font-semibold flex-shrink-0 font-poppins-600 ${getTimeColor(appointment.status || 'morning')}`}>
                    {appointment.appointmentTime}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No appointments available
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Updated Patient Details */}
        <div className="w-full lg:w-[30%] p-6 lg:pl-0 mx-auto ">
          {selectedPatient ? (
            <>
              <div className="text-center mb-6">
                <div className="w-25 h-25 rounded-full mx-auto mb-4 overflow-hidden border">
                  <img
                    src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-xl font-medium font-poppins-500 text-gray-800">
                  {selectedPatient.visitorUsername}
                </h3>
                <p className="text-sm text-gray-600 font-poppins-600 font-medium mt-1">
                  {selectedPatient.hfid || 'Not a Registered High5 Client'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 py-2">
                  <span className="text-black font-semibold font-poppins-600">Last Visit :</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700 font-montserrat-500">
                      {selectedPatient.appointmentDate || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Updated Status Field using separate state */}
                <div className="flex items-center gap-4 py-2">
                  <span className="text-black font-semibold font-poppins-600">Status :</span>
                  {!isEditing ? (
                    // Display as text when not editing
                    <span className="font-medium text-gray-700 font-montserrat-500">
                      {selectedPatient?.status || "Scheduled"}
                    </span>
                  ) : (
                    // Show dropdown when editing with stable key
                    <select
                      key={`status-${selectedPatient?.id || 'new'}`}
                      className="border rounded-lg px-3 py-1 text-blue-800 font-bold font-montserrat-700 bg-white"
                      value={editingStatus}
                      onChange={handleStatusChange}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Canceled">Canceled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </div>

                {/* Updated Treatment Field using separate state */}
                <div className="flex items-center gap-4 py-2">
                  <label className="text-black font-semibold font-poppins-600 w-22">
                    Treatment :
                  </label>
                  {!isEditing ? (
                    // Display as text when not editing
                    <span className="font-medium text-gray-700 font-montserrat-500">
                      {selectedPatient.treatment || "No treatment specified"}
                    </span>
                  ) : (
                    // Show input when editing with stable key and optimized handler
                    <input
                      key={`treatment-${selectedPatient?.id || 'new'}`}
                      type="text"
                      name="treatment"
                      value={editingTreatment}
                      onChange={handleTreatmentChange}
                      placeholder="Enter treatment"
                      autoComplete="off"
                      autoFocus={true}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-montserrat-500 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                  )}
                </div>

                <div className="flex items-center gap-4 py-2">
                  <span className="text-black font-semibold font-poppins-600">Phone :</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-700 font-montserrat-500">
                      {selectedPatient.visitorPhoneNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Updated Edit/Save/Cancel Buttons */}
              <div className="mt-6 space-y-2">
                {!isEditing ? (
                  <button
                    onClick={handleEditSave}
                    className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSave}
                      disabled={isUpdating}
                      className={`flex-1 font-semibold py-3 px-4 rounded-lg transition-colors ${isUpdating
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select an appointment to view patient details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <div className="max-w-7xl mx-auto ">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-black">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-black " />
                      </button>

                      {/* Month Display */}
                      <div>
                        <h2 className="text-2xl font-semibold text-blue-800 font-poppins-600">
                          {monthNames[currentDate.getMonth()]}
                        </h2>
                      </div>

                      <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-black" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Today button - only show if not viewing current month */}
                      {!isCurrentMonth() && (
                        <button
                          onClick={goToCurrentMonth}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          Today
                        </button>
                      )}

                      {/* Year Picker */}
                      <div className="relative">
                        <button
                          onClick={() => setShowYearPicker(!showYearPicker)}
                          className="flex items-center space-x-2 bg-green text-white px-4 py-2 border border-black rounded-lg transition-colors"
                        >
                          <span className="font-medium">{currentDate.getFullYear()}</span>
                          <ChevronDown className="w-5 h-5" />
                        </button>

                        {showYearPicker && (
                          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                            {generateYears().map((year) => (
                              <button
                                key={year}
                                onClick={() => selectYear(year)}
                                className={`block w-full px-4 py-2 text-sm text-left font-montserrat-500 hover:bg-blue-50 transition-colors ${year === currentDate.getFullYear()
                                  ? 'bg-blue-100 text-blue-600 '
                                  : 'text-gray-700'
                                  } ${year === new Date().getFullYear()
                                    ? 'border-l-4 border-black'
                                    : ''
                                  }`}
                              >
                                {year} {year === new Date().getFullYear() ? '(Current)' : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Border line */}
                  <div className="border-t border- mb-3"></div>

                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 gap-1 mb-3 ">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-md font-semibold text-black py-2 font-poppins-600">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => (
                      <div
                        key={index}
                        className={`
        h-12 w-full flex items-center justify-center text-sm cursor-pointer border border-gray-200 rounded-lg transition-colors
        ${day ? 'hover:bg-gray-50 text-gray-700 bg-white' : 'cursor-default border-transparent'}
        ${isToday(day) ? 'bg-blue-100 text-blue-600 font-bold border-blue-300' : ''}
      `}
                        onClick={() => handleDateClick(day)}
                      >
                        {day && (
                          <span className={`text-lg font-montserrat-500 ${isToday(day) ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                            {day}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-black px-4 py-3 w-auto text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-blue-800" />
                  <span className="text-md font-semibold text-gray-800 font-montserrat-600">Appointments</span>
                </div>

                <hr className="border-t border-black mb-1" />

                {/* Combined row for 22 / 60 and Today */}
                <div className="flex items-center justify-center gap-2">
                  <div className="text-lg font-semibold text-gray-800">{todayAppoinment} / 60</div>
                  <div className="text-xs text-blue-800 font-semibold font-montserrat-600">Today</div>
                </div>
              </div>

              {/* Missed Appointments */}
              <div className="bg-white rounded-2xl p-4 shadow border w-auto flex flex-col justify-between">
                {/* Top Row: Icon + Label */}
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faExclamationCircle} className="w-4 h-4 text-red-700" />
                  <span className="text-md font-semibold text-gray-800 font-montserrat-600">Missed</span>
                </div>

                {/* Divider Line */}
                <div className="border-t my-1" />

                {/* Middle: Number */}
                <div className="text-center text-xl font-bold text-gray-900">{miss}</div>

                {/* Bottom Text */}
                <div className="text-[14px] text-center text-blue-800 mt-1">
                  clients missed their appointments today.
                </div>
              </div>

              <div
                className="w-full h-[125px] rounded-2xl overflow-hidden relative shadow-md cursor-pointer"
                onClick={() => setShowModal(true)}
              >
                {/* Background Image */}
                <img
                  src="/731ac77d84fd328ec7b8a61074193ecc84f33309.jpg"
                  alt="Add Appointment"
                  className="w-full h-full object-cover"
                />

                {/* Left Black Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                {/* Centered White Text on Left Side */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white font-poppins-600 ">
                  <p className="text-sm text-center font-semibold">Add</p>
                  <p className="text-sm font-semibold">Appointment</p>
                </div>
              </div>

              <button
                className="w-full bg-yellow text-black font-semibold border font-poppins-600  border-black py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                onClick={() => setIsModalOpen(true)}
              >
                <FontAwesomeIcon icon={faUserPlus} className="w-5 h-5" />
                <span>Add Client</span>
              </button>
            </div>
          </div>

          {/* Combined Appointment List & Patient Details - Full Width */}
          <CombinedAppointmentPatient />
        </div>

        {/* Add Patient Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full relative p-6 sm:p-8">
              {/* Close Button */}
              <h2 className="text-2xl font-bold mb-4 flex justify-center text-center space-x-2">
                <FontAwesomeIcon icon={faPlus} className="text-white bg-blue-800 w-4 h-4 rounded-sm" />
                <span className='text-blue-800 font-poppins-600 font-semibold'>Add a New Patient</span>
              </h2>
              <div className='border border-blue-800 mx-auto w-40'></div>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
                onClick={handlePatientModalClose}
              >
                &times;
              </button>

              {/* Modal Content */}
              <form onSubmit={patientFormik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-3">
                  {/* Left side */}
                  <div className="lg:border-r lg:border-black lg:pr-6">
                    {/* Patient ID */}
                    <div className="mb-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleHFIDVerification}
                        disabled={isVerifyingHFID || !patientFormik.values.patientId}
                        className={`px-2 py-1 rounded-md text-sm font-semibold transition-colors ${hfidVerified
                          ? 'bg-green-600 text-white'
                          : isVerifyingHFID
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-800 text-white hover:bg-blue-900'
                          }`}
                      >
                        {isVerifyingHFID ? 'Verifying...' : hfidVerified ? '✓ HF' : 'HF'}
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="patientId"
                          value={patientFormik.values.patientId}
                          onChange={(e) => {
                            patientFormik.handleChange(e);
                            setHfidVerified(false);
                            setHfidError('');
                          }}
                          onBlur={patientFormik.handleBlur}
                          placeholder="Client's HF id."
                          className={`w-full border rounded-md px-4 py-2 focus:outline-none ${hasError(patientFormik, 'patientId')
                            ? 'border-red-500 bg-red-50'
                            : hfidVerified
                              ? ' bg-green-50'
                              : 'border-black'
                            }`}
                        />
                        {getErrorMessage(patientFormik, 'patientId') && (
                          <p className="text-red-500 text-sm mt-1">
                            {getErrorMessage(patientFormik, 'patientId')}
                          </p>
                        )}
                        {hfidError && (
                          <p className="text-red-500 text-sm mt-1">
                            {hfidError}
                          </p>
                        )}

                      </div>
                    </div>

                    {/* Forms Section */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src="/01fe876ae4c4ba6eac80e64ee74af7bb5936c1f8.png"
                          alt="Forms"
                          className="w-8 h-8"
                        />
                        <h2 className="text-blue-700 text-lg font-semibold">Select Forms to Send</h2>
                      </div>
                      <div className="h-[2px] bg-blue-700 w-60 mx-auto mb-3"></div>

                      <div className="space-y-2 gap-3 mx-5">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="dtrConsent"
                            checked={patientFormik.values.dtrConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>DTR Consent</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="tmdConsent"
                            checked={patientFormik.values.tmdConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>TMD/TMJP Consent</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="photoConsent"
                            checked={patientFormik.values.photoConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>Photo Consent</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="arthroseConsent"
                            checked={patientFormik.values.arthroseConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>Arthrose Functional Screening Consent</span>
                        </label>
                      </div>
                    </div>

                    {/* Date and Time Pickers */}
                    <div className="flex space-x-4 mb-4">
                      {/* Date Picker */}
                      <div className="w-1/2">
                        <div className="flex items-center border rounded-lg px-3 py-2">
                          <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 mr-2 text-gray-500" />
                          <DatePicker
                            selected={patientFormik.values.appointmentDate}
                            onChange={(date) => patientFormik.setFieldValue('appointmentDate', date)}
                            onBlur={() => patientFormik.setFieldTouched('appointmentDate', true)}
                            dateFormat="yyyy-MM-dd"
                            className="w-full focus:outline-none"
                          />
                        </div>
                        {getErrorMessage(patientFormik, 'appointmentDate') && (
                          <p className="text-red-500 text-sm mt-1">
                            {getErrorMessage(patientFormik, 'appointmentDate')}
                          </p>
                        )}
                      </div>

                      {/* Time Picker */}
                      <div className="w-1/2">
                        <div className="flex items-center border rounded-lg px-3 py-2">
                          <FontAwesomeIcon icon={faClock} className="w-5 h-5 mr-2 text-gray-500" />
                          <DatePicker
                            selected={patientFormik.values.appointmentTime}
                            onChange={(time) => patientFormik.setFieldValue('appointmentTime', time)}
                            onBlur={() => patientFormik.setFieldTouched('appointmentTime', true)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="HH:mm"
                            className="w-full focus:outline-none"
                          />
                        </div>
                        {getErrorMessage(patientFormik, 'appointmentTime') && (
                          <p className="text-red-500 text-sm mt-1">
                            {getErrorMessage(patientFormik, 'appointmentTime')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Verification Status Message */}
                    {!hfidVerified && patientFormik.values.patientId && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                        <p className="text-yellow-700 text-sm font-medium">
                          Please verify the Patient ID by clicking the HF button before saving.
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={patientFormik.isSubmitting || !patientFormik.isValid || !hfidVerified}
                      className={`w-full font-bold py-3 rounded-lg transition-colors ${patientFormik.isSubmitting || !patientFormik.isValid || !hfidVerified
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      {patientFormik.isSubmitting ? 'Saving...' : 'Save Patient'}
                    </button>

                    {/* Form Status */}
                    {Object.keys(patientFormik.errors).length > 0 && patientFormik.submitCount > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                        <p className="text-red-700 text-sm font-medium">
                          Please fix the errors above before submitting.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right side: Image and Info */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center bg-blue-100 rounded-xl p-4 w-full">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border shadow">
                        <img
                          src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-bold text-lg ml-4">{userName}</p>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-full max-w-sm">
                        <img
                          src="f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                          alt="Add Appointment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add New Appointment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-5xl w-full relative">
              {/* Modal Header */}
              <div className="relative mb-8">
                <div className="text-center relative">
                  {/* Header */}
                  <div className="flex items-center justify-center space-x-3">
                    <FontAwesomeIcon icon={faCalendar} className="w-7 h-7 text-blue-800" />
                    <h2
                      className="text-2xl font-bold text-blue-800 flex items-center space-x-2 cursor-pointer"
                      onClick={() => setOpen(!open)}
                    >
                      <span>Add New Appointment</span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`w-5 h-5 text-blue-800 transform transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </h2>
                  </div>
                  <div className="border border-blue-800 mx-auto w-40 mt-2"></div>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-blue-300 rounded-lg shadow-lg z-10">
                      <ul className="divide-y divide-gray-200">
                        <li className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-800" onClick={() => {

                          setOpen(false); // Close dropdown
                        }}>
                          Add New Appointment
                        </li>
                        <li className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-800" onClick={() => {
                          setShowModal(false); // Close Add New Appointment modal
                          setShowFollowUpModal(true); // Open Book Follow-up Appointment modal
                          setOpen(false); // Close dropdown
                          // Reset appointment form
                          appointmentFormik.resetForm();
                        }}>
                          Book a New Appointment
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    appointmentFormik.resetForm();
                    setShowModal(false);
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={appointmentFormik.handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Form Section */}
                  <div className="space-y-6 lg:border-r lg:border-black lg:pr-6">
                    {/* Visitor Name */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-black" />
                        <div className="w-full">
                          <input
                            type="text"
                            name="visitorName"
                            value={appointmentFormik.values.visitorName}
                            onChange={appointmentFormik.handleChange}
                            onBlur={appointmentFormik.handleBlur}
                            className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasError(appointmentFormik, 'visitorName')
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-700'
                              }`}
                            placeholder="Enter client name"
                          />
                          {getErrorMessage(appointmentFormik, 'visitorName') && (
                            <p className="text-red-500 text-sm mt-1">
                              {getErrorMessage(appointmentFormik, 'visitorName')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-black" />
                        <div className="w-full">
                          <input
                            type="tel"
                            name="phone"
                            value={appointmentFormik.values.phone}
                            onChange={appointmentFormik.handleChange}
                            onBlur={appointmentFormik.handleBlur}
                            className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasError(appointmentFormik, 'phone')
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-700'
                              }`}
                            placeholder="Enter phone number"
                          />
                          {getErrorMessage(appointmentFormik, 'phone') && (
                            <p className="text-red-500 text-sm mt-1">
                              {getErrorMessage(appointmentFormik, 'phone')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center space-x-6">
                      {/* Date */}
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-black" />
                        <div>
                          <input
                            type="text"
                            name="date"
                            value={appointmentFormik.values.date}
                            onChange={appointmentFormik.handleChange}
                            onBlur={appointmentFormik.handleBlur}
                            className={`w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${hasError(appointmentFormik, 'date')
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-700'
                              }`}
                            placeholder="DD-MM-YYYY"
                          />
                          {getErrorMessage(appointmentFormik, 'date') && (
                            <p className="text-red-500 text-sm mt-1">
                              {getErrorMessage(appointmentFormik, 'date')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-10 bg-gray-300"></div>

                      {/* Time */}
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-black" />
                        <div>
                          <CustomTimePicker
                            value={appointmentFormik.values.time}
                            onChange={(time) => appointmentFormik.setFieldValue('time', time)}
                            onBlur={() => appointmentFormik.setFieldTouched('time', true)}
                            hasError={hasError(appointmentFormik, 'time')}
                            placeholder="Select time"
                            className="border-gray-300"
                          />
                          {getErrorMessage(appointmentFormik, 'time') && (
                            <p className="text-red-500 text-sm mt-1">
                              {getErrorMessage(appointmentFormik, 'time')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      type="submit"
                      disabled={appointmentFormik.isSubmitting || !appointmentFormik.isValid}
                      className={`w-full font-bold py-4 px-6 rounded-lg transition-colors ${appointmentFormik.isSubmitting || !appointmentFormik.isValid
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      {appointmentFormik.isSubmitting ? 'Saving...' : 'Save Appointment'}
                    </button>

                    {/* Form Status */}
                    {Object.keys(appointmentFormik.errors).length > 0 && appointmentFormik.submitCount > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-700 text-sm font-medium">
                          Please fix the errors above before submitting.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Illustration Section */}
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-sm">
                      <img
                        src="f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                        alt="Add Appointment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Book Follow-up Appointment Modal */}
        {showFollowUpModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full relative p-6 sm:p-8">
              {/* Modal Header with Dropdown */}
              <div className="relative mb-8">
                <div className="text-center relative">
                  {/* Header */}
                  <div className="flex items-center justify-center space-x-3">
                    <FontAwesomeIcon icon={faPlus} className="text-white bg-blue-800 w-4 h-4 rounded-sm" />
                    <h2
                      className="text-2xl font-bold text-blue-800 flex items-center space-x-2 cursor-pointer"
                      onClick={() => setOpen(!open)}
                    >
                      <span>Book Follow-up Appointment</span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`w-5 h-5 text-blue-800 transform transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </h2>
                  </div>
                  <div className="border border-blue-800 mx-auto w-40 mt-2"></div>

                  {/* Dropdown */}
                  {open && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-blue-300 rounded-lg shadow-lg z-10">
                      <ul className="divide-y divide-gray-200">
                        <li
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-800"
                          onClick={() => {
                            setShowFollowUpModal(false); // Close follow-up modal
                            setShowModal(true); // Open Add New Appointment modal
                            setOpen(false); // Close dropdown
                            // Reset patient form states
                            patientFormik.resetForm();
                            setHfidVerified(false);
                            setHfidError('');
                          }}
                        >
                          Add New Appointment
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-blue-800"
                          onClick={() => {
                            setOpen(false); // Close dropdown (stay on current modal)
                          }}
                        >
                          Book a New Appointment
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Close Button */}

              </div>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
                onClick={() => {
                  patientFormik.resetForm();
                  setShowFollowUpModal(false);
                  setHfidVerified(false);
                  setHfidError('');
                }}
              >
                &times;
              </button>

              {/* Modal Content */}
              <form onSubmit={patientFormik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-3">
                  {/* Left side */}
                  <div className="lg:border-r lg:border-black lg:pr-6">
                    {/* Patient ID */}
                    <div className="mb-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleHFIDVerification}
                        disabled={isVerifyingHFID || !patientFormik.values.patientId}
                        className={`px-2 py-1 rounded-md text-sm font-semibold transition-colors ${hfidVerified
                          ? 'bg-green-600 text-white'
                          : isVerifyingHFID
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-800 text-white hover:bg-blue-900'
                          }`}
                      >
                        {isVerifyingHFID ? 'Verifying...' : hfidVerified ? '✓ HF' : 'HF'}
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          name="patientId"
                          value={patientFormik.values.patientId}
                          onChange={(e) => {
                            patientFormik.handleChange(e);
                            setHfidVerified(false);
                            setHfidError('');
                          }}
                          onBlur={patientFormik.handleBlur}
                          placeholder="Client's HF id."
                          className={`w-full border rounded-md px-4 py-2 focus:outline-none ${hasError(patientFormik, 'patientId')
                            ? 'border-red-500 bg-red-50'
                            : hfidVerified
                              ? ' bg-green-50'
                              : 'border-black'
                            }`}
                        />
                        {getErrorMessage(patientFormik, 'patientId') && (
                          <p className="text-red-500 text-sm mt-1">
                            {getErrorMessage(patientFormik, 'patientId')}
                          </p>
                        )}
                        {hfidError && (
                          <p className="text-red-500 text-sm mt-1">
                            {hfidError}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Forms Section */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <img
                          src="/01fe876ae4c4ba6eac80e64ee74af7bb5936c1f8.png"
                          alt="Forms"
                          className="w-8 h-8"
                        />
                        <h2 className="text-blue-700 text-lg font-semibold">Select Forms to Send</h2>
                      </div>
                      <div className="h-[2px] bg-blue-700 w-60 mx-auto mb-3"></div>

                      <div className="space-y-2 gap-3 mx-5">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="dtrConsent"
                            checked={patientFormik.values.dtrConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>DTR Consent</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="tmdConsent"
                            checked={patientFormik.values.tmdConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>TMD Consent</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="photoConsent"
                            checked={patientFormik.values.photoConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>Photo Consent</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="arthroseConsent"
                            checked={patientFormik.values.arthroseConsent}
                            onChange={patientFormik.handleChange}
                            className="accent-yellow-400"
                          />
                          <span>Arthrose Functional Screening Consent</span>
                        </label>
                      </div>
                    </div>

                    {/* Date and Time Pickers */}
                    <div className="flex space-x-4 mb-4">
                      {/* Date Picker */}
                      <div className="w-1/2">
                        <div className="flex items-center border rounded-lg px-3 py-2">
                          <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 mr-2 text-gray-500" />
                          <DatePicker
                            selected={patientFormik.values.appointmentDate}
                            onChange={(date) => patientFormik.setFieldValue('appointmentDate', date)}
                            onBlur={() => patientFormik.setFieldTouched('appointmentDate', true)}
                            dateFormat="yyyy-MM-dd"
                            className="w-full focus:outline-none"
                          />
                        </div>
                        {getErrorMessage(patientFormik, 'appointmentDate') && (
                          <p className="text-red-500 text-sm mt-1">
                            {getErrorMessage(patientFormik, 'appointmentDate')}
                          </p>
                        )}
                      </div>

                      {/* Time Picker */}
                      <div className="w-1/2">
                        <div className="flex items-center border rounded-lg px-3 py-2">
                          <FontAwesomeIcon icon={faClock} className="w-5 h-5 mr-2 text-gray-500" />
                          <DatePicker
                            selected={patientFormik.values.appointmentTime}
                            onChange={(time) => patientFormik.setFieldValue('appointmentTime', time)}
                            onBlur={() => patientFormik.setFieldTouched('appointmentTime', true)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption="Time"
                            dateFormat="HH:mm"
                            className="w-full focus:outline-none"
                          />
                        </div>
                        {getErrorMessage(patientFormik, 'appointmentTime') && (
                          <p className="text-red-500 text-sm mt-1">
                            {getErrorMessage(patientFormik, 'appointmentTime')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Verification Status Message */}
                    {!hfidVerified && patientFormik.values.patientId && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                        <p className="text-yellow-700 text-sm font-medium">
                          Please verify the Patient ID by clicking the HF button before saving.
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={patientFormik.isSubmitting || !patientFormik.isValid || !hfidVerified}
                      className={`w-full font-bold py-3 rounded-lg transition-colors ${patientFormik.isSubmitting || !patientFormik.isValid || !hfidVerified
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      {patientFormik.isSubmitting ? 'Saving...' : 'Save Patient'}
                    </button>

                    {/* Form Status */}
                    {Object.keys(patientFormik.errors).length > 0 && patientFormik.submitCount > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                        <p className="text-red-700 text-sm font-medium">
                          Please fix the errors above before submitting.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right side: Image and Info */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center bg-blue-100 rounded-xl p-4 w-full">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border shadow">
                        <img
                          src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-bold text-lg ml-4">{userName}</p>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-full max-w-sm">
                        <img
                          src="f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                          alt="Add Appointment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default HealthcareDashboard;