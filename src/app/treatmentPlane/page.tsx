'use client'
import React, { useState } from 'react'
import Tooltip from '../components/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faInfoCircle, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import Drawer from '../components/clinicInfoDrawer'
import DefaultLayout from '../components/DefaultLayout'

// Treatment Drawer Component
const TreatmentDrawer = ({ isOpen, onClose, onSelectTreatment, onAddNew }) => {
    const predefinedTreatments = [
        { id: 1, name: 'TMJ Appliance', cost: 30000 },
        { id: 2, name: 'Invisalign+ Disclusion Time Reduction', cost: 375000 },
        { id: 3, name: 'Disclusion Time Reduction', cost: 75000 },
        { id: 4, name: 'Trigger point Injections, nerve and ganglion blocks', cost: 15000 },
        { id: 5, name: 'Arthrose Functional screening', cost: 35000 },
        { id: 6, name: 'TMJ Orthotic', cost: 95000 }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-170 bg-white shadow-xl overflow-y-auto transform transition-transform duration-300">
                {/* Header */}
                <div className="relative p-4 border-b">
                    <h2 className="text-lg font-bold text-black text-center">
                        All Treatments
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    </button>
                </div>


                {/* Treatments List */}
                <div className="p-4">
                    <div className='mt-3 mb-3 text-gray-700'>
                        <p>Treatment</p>
                    </div>

                    <div className='border border-gray-500'></div>
                    <div className=" mx-auto  font-sans">


                        {/* List of Treatments */}
                        <div className="space-y-3">
                            {predefinedTreatments.map((treatment, index) => (
                                <div
                                    key={treatment.id}
                                    // Add a bottom border to each item, but not the last one
                                    className={`flex justify-between items-center py-2 px-1 cursor-pointer 
                        ${index < predefinedTreatments.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    onClick={() => onSelectTreatment(treatment)}
                                >
                                    {/* Treatment Name */}
                                    <div className="pr-4">
                                        <h3 className="font-medium text-sm text-gray-700 leading-tight">
                                            {treatment.name}
                                        </h3>
                                    </div>
                                    {/* Treatment Cost */}
                                    <div className="text-sm font-semibold text-right text-gray-800">
                                        {treatment.cost.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='flex justify-end'>

                        {/* Add New Button */}
                        <button
                            onClick={onAddNew}
                            className="w-40 mt-6 bg-yellow text-black px-4 py-2 rounded-lg font-medium text-sm"
                        >
                            Add New
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

// Add Treatment Modal Component
const AddTreatmentModal = ({ isOpen, onClose, onSave }) => {
    const [treatmentName, setTreatmentName] = useState('');
    const [treatmentCost, setTreatmentCost] = useState('');

    const handleSave = () => {
        if (treatmentName.trim() && treatmentCost) {
            onSave({
                name: treatmentName.trim(),
                cost: parseFloat(treatmentCost) || 0
            });
            setTreatmentName('');
            setTreatmentCost('');
            onClose();
        }
    };

    const handleClose = () => {
        setTreatmentName('');
        setTreatmentCost('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            {/* Backdrop with a click handler to close the modal */}
            <div
                className="fixed inset-0 bg-black/30 bg-opacity-30"
                onClick={handleClose}
            />

            {/* Modal content container */}
            <div className="relative bg-white rounded-xl border border-black shadow-2xl w-full max-w-2xl mx-auto transform transition-all">
                {/* Header */}
                <div className="p-6 text-center ">
                    <h2 className="text-xl font-semibold text-blue-800">Add a New Treatment</h2>
                    <div className="w-24 border-t-2 border-blue-800 mx-auto mt-2"></div>
                </div>

                {/* Content area */}
                <div className="p-6 space-y-6 flex flex-col md:flex-row items-center">
                    <div className="flex-1 space-y-4">
                        {/* Treatment Name input field */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <label className="w-40 text-sm font-medium text-gray-700">Treatment Name :</label>
                            <input
                                type="text"
                                value={treatmentName}
                                onChange={(e) => setTreatmentName(e.target.value)}
                                placeholder="Enter Treatment Name"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                        {/* Treatment Cost input field */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <label className="w-40 text-sm font-medium text-gray-700">Treatment Cost :</label>
                            <input
                                type="number"
                                value={treatmentCost}
                                onChange={(e) => setTreatmentCost(e.target.value)}
                                placeholder="Enter Cost"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />
                        </div>

                    </div>

                    {/* Image section */}
                    <div className="w-full sm:w-35 flex items-center justify-center order-first sm:order-last">
                        <img
                            src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                            alt='samantha'
                            className="max-w-24 sm:max-w-32 h-auto"
                        />
                    </div>
                </div>

                {/* Footer with buttons */}
                <div className="p-4 flex justify-end ">
                    <button
                        onClick={handleSave}
                        className="primary bg-blue-600 text-white px-8 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const page = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isTreatmentDrawerOpen, setIsTreatmentDrawerOpen] = useState(false);
    const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState(false);

    // Add medication form state
    const [showMedicationForm, setShowMedicationForm] = useState(false);
    const [newMedication, setNewMedication] = useState({
        treatment: '',
        qty: '',
        cost: '',
        status: 'Not started',
        Total: ''
    });

    const [treatments, setTreatments] = useState([
        {
            id: 1,
            name: 'Arthrose Functional screening',
            qty: '1 QTY',
            cost: 35000.0,
            status: 'Not started'
        },
        {
            id: 2,
            name: 'TMJ Orthotic',
            qty: '1 QTY',
            cost: 95000.0,
            status: 'Not started'
        }
    ]);

    const updateTreatment = (id, field, value) => {
        setTreatments(treatments.map(treatment =>
            treatment.id === id
                ? { ...treatment, [field]: field === 'cost' ? parseFloat(value) || 0 : value }
                : treatment
        ));
    };

    const removeTreatment = (id) => {
        setTreatments(treatments.filter(treatment => treatment.id !== id));
    };

    const totalCost = treatments.reduce((sum, treatment) => sum + treatment.cost, 0);

    const addTreatment = () => {
        setIsTreatmentDrawerOpen(true);
    };

    const selectTreatment = (selectedTreatment) => {
        const newTreatment = {
            id: Math.max(...treatments.map(t => t.id), 0) + 1,
            name: selectedTreatment.name,
            qty: '1 QTY',
            cost: selectedTreatment.cost,
            status: 'Not started'
        };
        setTreatments([...treatments, newTreatment]);
        setIsTreatmentDrawerOpen(false);
    };

    const addNewTreatment = (newTreatmentData) => {
        const newTreatment = {
            id: Math.max(...treatments.map(t => t.id), 0) + 1,
            name: newTreatmentData.name,
            qty: '1 QTY',
            cost: newTreatmentData.cost,
            status: 'Not started'
        };
        setTreatments([...treatments, newTreatment]);
    };

    // Handle adding medication from inline form
    const handleAddMedication = () => {
        if (newMedication.treatment.trim() && newMedication.cost) {
            const newTreatment = {
                id: Math.max(...treatments.map(t => t.id), 0) + 1,
                name: newMedication.treatment.trim(),
                qty: newMedication.qty || '1 QTY',
                cost: parseFloat(newMedication.cost) || 0,
                status: newMedication.status
            };

            setTreatments([...treatments, newTreatment]);

            // Reset form
            setNewMedication({
                treatment: '',
                qty: '',
                cost: '',
                status: 'Not started',
                Total: ''
            });

            // Hide form
            setShowMedicationForm(false);
        }
    };

    const openSavedPrescriptions = () => {
        setIsTreatmentDrawerOpen(true);
        setShowMedicationForm(true);
    };

    return (
        <DefaultLayout>
            <div className="min-w-full max-w-7xl mx-auto p-2 sm:p-4">
                {/* Header */}
                <div className="bg-white p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <div className="flex items-center">
                            <button
                                className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg transition-colors flex items-center"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="w-2 h-2 mr-2" />
                                <span className="text-md sm:text-md font-bold text-[#333333]">Back</span>
                            </button>
                        </div>

                        <div className="flex flex-col items-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Treatment plan</h1>
                            <div className="w-20 sm:w-24 border border-blue-500 mx-auto mt-1"></div>
                        </div>

                        {/* Info Button */}
                        <div className="flex items-start mt-3">
                            <div className="ml-2 bg-green-700 text-white rounded-sm w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer">
                                <Tooltip content="Information about this page" position="bottom right-2">
                                    <FontAwesomeIcon
                                        icon={faInfoCircle}
                                        onClick={() => setIsDrawerOpen(true)}
                                        className="text-xs sm:text-sm"
                                    />
                                </Tooltip>
                            </div>

                            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                                hii
                            </Drawer>
                        </div>
                    </div>
                </div>

                <div className='border'>
                    {/* Clinic Header */}
                    <div className="p-3 sm:p-6">
                        <div className="flex justify-center">
                            <img
                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                alt="ARTHROSE Logo"
                                className="w-60 sm:w-80 object-contain"
                            />
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="p-3 sm:p-6 border-b bg-white mx-1 sm:mx-3">
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">Patient Name:</span>
                                    <span>KALPESH WAGH</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">Gender:</span>
                                    <span>Male ●</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">DOB:</span>
                                    <span>29 - 03 - 2025</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">Counsultant Doctor:</span>
                                    <span>Dr. Varun R Kunte</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-20">UHID:</span>
                                    <span>P20032502</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-20">TID:</span>
                                    <span>T5QAHYBM6</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                    <span className="font-medium w-full sm:w-20">Mobile:</span>
                                    <input
                                        type="text"
                                        placeholder="Enter mobile number"
                                        className="px-2 py-1 rounded text-xs border border-gray-700 focus:outline-none w-full sm:w-auto"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-20">City:</span>
                                    <span>Pen</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Treatment Table */}
                    <div className="p-3 sm:p-6 min-w-7xl mx-auto">
                        <div className="bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base sm:text-lg font-bold">Treatment</h3>
                            </div>

                            {/* Treatment Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-t border-gray-700">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="px-2 py-2 text-left text-sm font-medium w-16 border-gray-700">S.No.</th>
                                            <th className="border-l border-gray-700 px-2 py-2 text-left text-sm font-medium">Treatment Name</th>
                                            <th className="border-l border-gray-700 px-2 py-2 text-left text-sm font-medium w-20">Qty/Day</th>
                                            <th className="border-l border-gray-700 px-2 py-2 text-left text-sm font-medium w-24">Cost (₹)</th>
                                            <th className="border-l border-gray-700 px-2 py-2 text-left text-sm font-medium w-24">Status</th>
                                            <th className="border-l border-gray-700 px-2 py-2 text-left text-sm font-medium w-24">Total (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {treatments.map((treatment) => (
                                            <tr key={treatment.id} className="">
                                                <td className="px-2 py-2 text-sm text-center border-gray-700">{treatment.id}</td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    <input
                                                        type="text"
                                                        value={treatment.name}
                                                        onChange={(e) => updateTreatment(treatment.id, 'name', e.target.value)}
                                                        className="w-full border-none outline-none bg-transparent text-sm"
                                                        placeholder="Enter treatment name"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                  {treatment.qty}
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    <input
                                                        type="number"
                                                        value={treatment.cost}
                                                        onChange={(e) => updateTreatment(treatment.id, 'cost', e.target.value)}
                                                        className="w-full border-none outline-none bg-transparent text-sm text-right"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    {treatment.status}
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm text-right">
                                                    {treatment.cost.toFixed(1)}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Empty rows for spacing */}
                                        {treatments.length < 5 && (
                                            <>
                                                {Array.from({ length: 5 - treatments.length }).map((_, index) => (
                                                    <tr key={`empty-${index}`} className="">
                                                        <td className="px-2 py-4 text-sm border-gray-700">&nbsp;</td>
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}

                                        {/* Total Row as part of table */}
                                        <tr className="border-t border-b border-gray-700 bg-white">
                                            <td className="px-2 py-3 text-sm border-gray-700" colSpan={2}></td>
                                            <td className="border-l border-gray-700 px-2 py-3 text-sm font-medium" colSpan={2}>
                                                Total Cost: {totalCost.toFixed(1)}
                                            </td>
                                            <td className="border-l border-gray-700 px-2 py-3 text-sm font-medium" colSpan={2}>
                                                Grand Total: {totalCost.toFixed(1)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        {/* Add Treatment Buttons */}
                        <div className="flex justify-end items-start gap-4 mt-4">
                            {/* Medication Form */}
                            {showMedicationForm && (
                                <div className="flex-1 space-y-4 p-">
                                    {/* First row */}
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Treatment Name..."
                                            value={newMedication.treatment}
                                            onChange={(e) => setNewMedication({ ...newMedication, treatment: e.target.value })}
                                            className="flex-1 border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Qty / Day"
                                            value={newMedication.qty}
                                            onChange={(e) => setNewMedication({ ...newMedication, qty: e.target.value })}
                                            className="w-1/4 border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded"
                                        />
                                    </div>

                                    {/* Second row */}
                                    <div className="flex items-end gap-4">
                                        <input
                                            type="text"
                                            placeholder="Cost..."
                                            value={newMedication.cost}
                                            onChange={(e) => setNewMedication({ ...newMedication, cost: e.target.value })}
                                            className="w-1/4 border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded"
                                        />
                                        <select
                                            value={newMedication.status}
                                            onChange={(e) => setNewMedication({ ...newMedication, status: e.target.value })}
                                            className="w-1/4 border border-gray-500 px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="Not started">Not Started</option>
                                            <option value="In progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Total..."
                                            value={newMedication.Total}
                                            onChange={(e) => setNewMedication({ ...newMedication, Total: e.target.value })}
                                            className="w-1/4 border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded"
                                        />
                                    </div>
                                    <div className="flex-1 flex justify-center"> <button onClick={handleAddMedication} className="bg-yellow-300 hover:bg-yellow-500 px-6 sm:px-8 py-2 border border-yellow-500 rounded-lg font-medium text-sm" > Add </button> </div>
                                </div>

                            )}

                            {/* Add Treatment Button */}
                            <button
                                onClick={openSavedPrescriptions}
                                className="primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 self-start"
                            >
                                <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                Add Treatment
                            </button>
                        </div>



                        {/* Doctor Signature */}
                        <div className="mt-8 sm:mt-12 flex justify-end">
                            <div className="text-center">
                                <div className="w-24 sm:w-32 h-12 sm:h-16 border-b border-gray-300 mb-2 flex items-end justify-center">
                                    <span className="text-blue-600 font-script text-sm sm:text-lg mb-2">Dr. Varun R Kunte</span>
                                </div>
                                <p className="text-xs sm:text-sm font-medium">Dr. Varun R Kunte</p>
                            </div>
                        </div>
                    </div>

                    <div className='border border-black mx-1 sm:mx-3'></div>

                    {/* Footer */}
                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-600 gap-2">
                        <span>www.arthrosetmjindia.com</span>
                        <span>www.hfiles.in</span>
                    </div>
                </div>

                {/* Save Button */}
                <div className="p-3 sm:p-4 flex justify-end">
                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 rounded-lg font-medium text-sm">
                        Save
                    </button>
                </div>
            </div>

            {/* Treatment Drawer */}
            <TreatmentDrawer
                isOpen={isTreatmentDrawerOpen}
                onClose={() => setIsTreatmentDrawerOpen(false)}
                onSelectTreatment={selectTreatment}
                onAddNew={() => {
                    setIsTreatmentDrawerOpen(false);
                    setIsAddTreatmentModalOpen(true);
                }}
            />

            {/* Add Treatment Modal */}
            <AddTreatmentModal
                isOpen={isAddTreatmentModalOpen}
                onClose={() => setIsAddTreatmentModalOpen(false)}
                onSave={addNewTreatment}
            />
        </DefaultLayout>
    )
}

export default page