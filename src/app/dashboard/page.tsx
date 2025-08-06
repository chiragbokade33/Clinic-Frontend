'use client'
import React, { useState } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import DefaultLayout from '../components/DefaultLayout';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const HealthcareDashboard = () => {
  // Initialize with current date instead of hardcoded date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(1); // For combined component

  const [appointmentForm, setAppointmentForm] = useState({
    visitorName: "",
    phone: "",
    date: "",
    time: "",
    period: ""
  });

  // Enhanced appointments with complete patient data
  const appointments = [
    {
      id: 1,
      patient: "Ankit k.",
      patientId: "HF120624RANI097",
      time: "8:12 AM",
      type: "morning",
      lastVisit: "15 / 02 / 2024",
      status: "Scheduled",
      treatment: "Facial, Jaw Pain",
      phone: "9845624873"
    },
    {
      id: 2,
      patient: "Ankit k.",
      patientId: "HF120624RANI097",
      time: "3:10 AM",
      type: "morning",
      lastVisit: "15 / 02 / 2024",
      status: "Scheduled",
      treatment: "Facial, Jaw Pain",
      phone: "9845624873"
    },
    {
      id: 3,
      patient: "Ankit k.",
      patientId: "HF120624RANI097",
      time: "3:01 AM",
      type: "morning",
      lastVisit: "15 / 02 / 2024",
      status: "Scheduled",
      treatment: "Facial, Jaw Pain",
      phone: "9845624873"
    },
    {
      id: 4,
      patient: "Ankit k.",
      patientId: "HF120624RANI097",
      time: "1:00 AM",
      type: "early",
      lastVisit: "15 / 02 / 2024",
      status: "Scheduled",
      treatment: "Facial, Jaw Pain",
      phone: "9845624873"
    },
    {
      id: 5,
      patient: "Ankit k.",
      patientId: "HF120624RANI097",
      time: "09:20 AM",
      type: "morning",
      lastVisit: "15 / 02 / 2024",
      status: "Scheduled",
      treatment: "Facial, Jaw Pain",
      phone: "9845624873"
    }
  ];

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

  // Function to handle calendar date click
  const handleDateClick = (day: number | null | undefined) => {
    if (day) {
      const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const formattedDate = `${day.toString().padStart(2, '0')} - ${(currentDate.getMonth() + 1).toString().padStart(2, '0')} - ${currentDate.getFullYear()}`;

      setAppointmentForm({
        ...appointmentForm,
        date: formattedDate
      });
      setShowModal(true);
    }
  };

  // Go to current month function
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Get selected patient data
  const selectedPatient = appointments.find(apt => apt.id === selectedAppointment) || appointments[0];

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
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-colors ${selectedAppointment === appointment.id
                  ? 'bg-blue-100 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
                  }`}
                onClick={() => setSelectedAppointment(appointment.id)}
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
                  <h4 className="font-medium text-gray-800 truncate font-poppins-600">{appointment.patient}</h4>
                  <p className="text-sm text-gray-600 truncate font-medium font-poppins-500">{appointment.patientId}</p>
                </div>

                {/* Time Badge */}
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold flex-shrink-0 font-poppins-600 ${getTimeColor(appointment.type)}`}>
                  {appointment.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Patient Details */}
        <div className="w-full lg:w-[30%] p-6 lg:pl-0 mx-auto ">
          <div className="text-center mb-6">
            <div className="w-25 h-25 rounded-full mx-auto mb-4 overflow-hidden border">
              <img
                src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-xl font-medium font-poppins-500 text-gray-800">{selectedPatient.patient}</h3>
            <p className="text-sm text-gray-600 font-poppins-600 font-medium mt-1">{selectedPatient.patientId}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 py-2">
              <span className="text-black font-semibold font-poppins-600">Last Visit :</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-700 font-montserrat-500">{selectedPatient.lastVisit}</span>
                <span className="text-[#C20C25] text-xs font-semibold font-montserrat-500 ">● Canceled</span>
              </div>
            </div>

            <div className="flex items-center gap-4 py-2">
              <span className="text-black font-semibold font-poppins-600">Status :</span>
              <span className="text-blue-800 font-bold font-montserrat-700">{selectedPatient.status}</span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <span className="text-black font-semibold font-poppins-600">Treatment :</span>
              <span className="font-semibold text-gray-700 text-right  font-montserrat-500 ">{selectedPatient.treatment}</span>
            </div>

            <div className="flex items-center gap-4 py-2">
              <span className="text-black font-semibold font-poppins-600">Phone :</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700  font-montserrat-500 ">{selectedPatient.phone}</span>
              </div>
            </div>
          </div>

          <button className="w-full primary text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors">
            Edit
          </button>
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
                  <div className="text-lg font-semibold text-gray-800">22 / 60</div>
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
                <div className="text-center text-xl font-bold text-gray-900">3</div>

                {/* Bottom Text */}
                <div className="text-[14px] text-center text-blue-800 mt-1">
                  patients missed their appointments today.
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
                <span>Add Patient</span>
              </button>
            </div>
          </div>

          {/* Combined Appointment List & Patient Details - Full Width */}
          <CombinedAppointmentPatient />
        </div>

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
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>

              {/* Modal Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-3">
                {/* Left side */}
                <div>
                  <div className="mb-4">
                    <label className="block font-medium mb-2">Patient's HF ID</label>
                    <input
                      type="text"
                      placeholder="Patient's HF id."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold mb-2 text-blue-700">Select Forms to Send</p>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="accent-yellow-400" defaultChecked />
                        <span>DTR Consent</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="accent-yellow-400" />
                        <span>TMD Consent</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="accent-yellow-400" />
                        <span>Photo Consent</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="accent-yellow-400" defaultChecked />
                        <span>Arthrose Functional Screening Consent</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex space-x-4 mb-4">
                    <div className="flex items-center border rounded-lg px-3 py-2 w-1/2">
                      <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 mr-2 text-gray-500" />
                      <input
                        type="date"
                        className="w-full focus:outline-none"
                        defaultValue="2026-07-18"
                      />
                    </div>

                    <div className="flex items-center border rounded-lg px-3 py-2 w-1/2">
                      <FontAwesomeIcon icon={faClock} className="w-5 h-5 mr-2 text-gray-500" />
                      <input
                        type="time"
                        className="w-full focus:outline-none"
                        defaultValue="04:20"
                      />
                    </div>
                  </div>

                  <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-lg transition-colors">
                    Save
                  </button>
                </div>

                {/* Right side: Image and Info */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center bg-blue-100 rounded-xl p-4 w-fit">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-bold text-lg ml-4">Ankit k.</p>
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
            </div>
          </div>
        )}

        {/* Modal for Add New Appointment */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-5xl w-full relative ">
              {/* Modal Header */}
              <div className="relative mb-8">
                {/* Title Centered */}
                <div className="flex items-center justify-center space-x-3">
                  <FontAwesomeIcon icon={faCalendar} className="w-7 h-7 text-blue-800" />
                  <h2 className="text-2xl font-bold text-blue-800">Add New Appointment</h2>
                </div>
                <div className='border border-blue-800 mx-auto w-40 mt-2'></div>

                {/* Close Button on Right */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-6 h-6 text-gray-600" />
                </button>
              </div>


              <div className="grid grid-cols-1 lg:grid-cols-2  gap-8">
                {/* Form Section */}
                <div className="space-y-6 lg:border-r lg:border-black  lg:pr-6">
                  {/* Visitor Name */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-black" />

                      <input
                        type="text"
                        value={appointmentForm.visitorName}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, visitorName: e.target.value })}
                        className="w-full border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter visitor name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faPhone} className="w-5 h-5 text-black" />

                      <input
                        type="tel"
                        value={appointmentForm.phone}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                        className="w-full border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-2 ">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-black" />

                      <div className="flex items-center lg:border-r lg:border-gray-400 lg:pr-6">
                        <input
                          type="text"
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                          className="flex-1 w-[190px] border border-gray-700 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="DD - MM - YYYY"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-black" />
                        <input
                          type="text"
                          value={appointmentForm.time}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                          className="w-16 border border-gray-700 rounded-md px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="4"
                        />
                        <span className="text-2xl font-bold text-gray-400">:</span>
                        <input
                          type="text"
                          value={appointmentForm.period}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, period: e.target.value })}
                          className="w-16 border border-gray-700 rounded-md px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => {
                      // Handle save logic here
                      console.log('Saving appointment:', appointmentForm);
                      setShowModal(false);
                    }}
                    className="w-full primary text-white font-bold py-4 px-6 rounded-lg transition-colors"
                  >
                    Save
                  </button>
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
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default HealthcareDashboard;