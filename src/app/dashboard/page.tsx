'use client'
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Phone, Clock, AlertCircle, Plus, X } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';

const HealthcareDashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // March 2025
  const [showModal, setShowModal] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

  const [appointmentForm, setAppointmentForm] = useState({
    visitorName: "",
    phone: "",
    date: "",
    time: "",
    period: ""
  });
  const [selectedPatient, setSelectedPatient] = useState({
    name: "Ankit k.",
    id: "HF120624RANI097",
    lastVisit: "15 / 02 / 2024",
    status: "Scheduled",
    treatment: "Facial, Jaw Pain",
    phone: "9845624873"
  });

  const appointments = [
    { id: 1, patient: "Ankit k.", patientId: "HF120624RANI097", time: "8 - 12 AM", type: "morning" },
    { id: 2, patient: "Ankit k.", patientId: "HF120624RANI097", time: "3 - 10 AM", type: "morning" },
    { id: 3, patient: "Ankit k.", patientId: "HF120624RANI097", time: "3 - 01 AM", type: "morning" },
    { id: 4, patient: "Ankit k.", patientId: "HF120624RANI097", time: "1 - 00 AM", type: "early" },
    { id: 5, patient: "Ankit k.", patientId: "HF120624RANI097", time: "09 - 20 AM", type: "morning" }
  ];

  const getDaysInMonth = (date) => {
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

  const getTimeColor = (type) => {
    switch (type) {
      case 'morning': return 'bg-yellow-400 text-black';
      case 'early': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  // Function to handle calendar date click
  const handleDateClick = (day) => {
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

  return (
    <DefaultLayout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Calendar Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-blue-600">
                  {monthNames[currentDate.getMonth()]}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-green-600 text-white px-4 py-2 rounded-lg">
                {currentDate.getFullYear()}
              </div>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className="aspect-square flex items-center justify-center text-lg hover:bg-blue-50 rounded-lg cursor-pointer relative"
                  onClick={() => handleDateClick(day)}
                >
                  {day && (
                    <>
                      <span className={day === 5 ? 'text-red-500 font-bold' : 'text-gray-700'}>
                        {day}
                      </span>
                      {day === 5 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        </div>
                      )}
                      {day === 6 && (
                        <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                          15
                        </div>
                      )}
                      {day === 7 && (
                        <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                          2
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointment List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Appointment List :</h3>
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option>All</option>
                <option>Today</option>
                <option>This Week</option>
              </select>
            </div>

            <div className="space-y-3">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => setSelectedPatient({
                    name: appointment.patient,
                    id: appointment.patientId,
                    lastVisit: "15 / 02 / 2024",
                    status: "Scheduled",
                    treatment: "Facial, Jaw Pain",
                    phone: "9845624873"
                  })}
                >
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{appointment.patient}</h4>
                    <p className="text-sm text-gray-600">{appointment.patientId}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getTimeColor(appointment.type)}`}>
                    {appointment.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Appointments Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-800">Appointments</span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">22 / 60</div>
              <div className="text-sm text-gray-600 mt-1">Today</div>
            </div>
          </div>

          {/* Missed Appointments */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span className="text-lg font-bold text-gray-800">Missed</span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">3</div>
              <div className="text-sm text-gray-600 mt-2">
                patients missed their appointments today
              </div>
            </div>
          </div>

          {/* Add Appointment */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Add Appointment</h3>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-8 translate-x-8"></div>
          </div>

       <button
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-6 rounded-2xl flex items-center justify-center space-x-2 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <User className="w-5 h-5" />
        <span>Add Patient</span>
      </button>

          {/* Patient Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedPatient.name}</h3>
              <p className="text-sm text-gray-600">{selectedPatient.id}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Visit :</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{selectedPatient.lastVisit}</span>
                  <span className="text-red-500 text-xs">● Canceled</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status :</span>
                <span className="text-blue-600 font-semibold">{selectedPatient.status}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Treatment :</span>
                <span className="font-semibold text-right">{selectedPatient.treatment}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phone :</span>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{selectedPatient.phone}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>

        {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full relative p-6 sm:p-8">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>

            {/* Modal Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left side */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                  <span className="text-blue-600">➕</span>
                  <span>Add a New Patient</span>
                </h2>

                <div className="mb-4">
                  <label className="block font-medium mb-2">Patient’s HF ID</label>
                  <input
                    type="text"
                    placeholder="Patient’s HF id."
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
                    <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                    <input
                      type="date"
                      className="w-full focus:outline-none"
                      defaultValue="2026-07-18"
                    />
                  </div>

                  <div className="flex items-center border rounded-lg px-3 py-2 w-1/2">
                    <Clock className="w-5 h-5 mr-2 text-gray-500" />
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
  <img
    src="/339cc0fc-67b3-4268-9fb3-f612c1350f8d.png"
    alt="Patient Illustration"
    className="w-12 h-12 object-cover rounded-full border-2 border-yellow-400"
  />
  <p className="font-bold text-lg ml-4">Ankit k.</p>
</div>


                <div className="flex justify-center">
                  <img
                    src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png" // Replace or remove if you don’t want a logo
                    alt="Clinic Logo"
                    className="h-auto w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Add New Appointment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-5xl w-full relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-blue-600">Add New Appointment</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                {/* Visitor Name */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <label className="text-gray-700 font-medium">Visitor Name</label>
                  </div>
                  <input
                    type="text"
                    value={appointmentForm.visitorName}
                    onChange={(e) => setAppointmentForm({...appointmentForm, visitorName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter visitor name"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-600" />
                    <label className="text-gray-700 font-medium">Phone</label>
                  </div>
                  <input
                    type="tel"
                    value={appointmentForm.phone}
                    onChange={(e) => setAppointmentForm({...appointmentForm, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Date and Time */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <label className="text-gray-700 font-medium">Date & Time</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="DD - MM - YYYY"
                    />
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <input
                        type="text"
                        value={appointmentForm.time}
                        onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})}
                        className="w-16 border border-gray-300 rounded-lg px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="4"
                      />
                      <span className="text-2xl font-bold text-gray-400">:</span>
                      <input
                        type="text"
                        value={appointmentForm.period}
                        onChange={(e) => setAppointmentForm({...appointmentForm, period: e.target.value})}
                        className="w-16 border border-gray-300 rounded-lg px-3 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
              

              {/* Illustration Section */}
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md">
                  <img
                    src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                    alt="Add Appointment"
                    className="w-full h-auto"
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