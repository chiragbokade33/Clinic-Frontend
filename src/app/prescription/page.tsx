'use client'
import React, { useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import Tooltip from '../components/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Drawer from '../components/clinicInfoDrawer';

interface SavedPrescriptionDrawerProps {
    isOpen: any;
    onClose: any;
    onSelectMedication: any;
    // adjust type if medication is not string
}

interface AddNewPrescriptionModalProps {
    isOpen: boolean;
    onClose: any;
    onSave: any; // replace `any` with the actual type you expect
}


// Add New Prescription Modal Component
const AddNewPrescriptionModal: React.FC<AddNewPrescriptionModalProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState({
        drugName: '',
        drugDosage: '',
        frequency: '',
        timing: '',
        instruction: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        if (formData.drugName && formData.drugDosage) {
            onSave(formData);
            // Reset form
            setFormData({
                drugName: '',
                drugDosage: '',
                frequency: '',
                timing: '',
                instruction: ''
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2 sm:px-4"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-white rounded-lg border border-[#353935] shadow-xl w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center rounded-lg justify-between p-3 sm:p-4 bg-white relative">
                        <div className="flex-1 text-center">
                            <h2 className="text-base sm:text-lg font-bold text-blue-800">Add a New Prescription</h2>
                            <div className="border-b-2 border-blue-800 w-32 sm:w-40 mx-auto mt-1"></div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute right-3 sm:right-4 top-3 sm:top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                            {/* Left side - Form */}
                            <div className="flex-1 space-y-2">
                                {/* Drug Name */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    {/* Left side - Form Fields */}
                                    <div className="flex-1 w-full">
                                        {/* Drug Name */}
                                        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
                                            <label
                                                htmlFor="drugName"
                                                className="w-full sm:w-32 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
                                            >
                                                Drug Name :
                                            </label>
                                            <input
                                                id="drugName"
                                                type="text"
                                                placeholder="Enter Drug Name :"
                                                value={formData.drugName}
                                                onChange={(e) => handleInputChange('drugName', e.target.value)}
                                                className="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#353935] rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                     placeholder-gray-400 text-sm"
                                            />
                                        </div>

                                        {/* Drug Dosage */}
                                        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
                                            <label
                                                htmlFor="drugDosage"
                                                className="w-full sm:w-32 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
                                            >
                                                Drug Dosage :
                                            </label>
                                            <input
                                                id="drugDosage"
                                                type="text"
                                                placeholder="Enter Dosage :"
                                                value={formData.drugDosage}
                                                onChange={(e) => handleInputChange('drugDosage', e.target.value)}
                                                className="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 border border-[#353935] rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                     placeholder-gray-400 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Right side - Illustration */}
                                    <div className="w-full sm:w-35 flex items-center justify-center order-first sm:order-last">
                                        <img
                                            src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                                            alt='samantha'
                                            className="max-w-24 sm:max-w-32 h-auto"
                                        />
                                    </div>
                                </div>

                                {/* Frequency and Timing Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Frequency */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Frequency
                                        </label>
                                        <select
                                            value={formData.frequency}
                                            onChange={(e) => handleInputChange('frequency', e.target.value)}
                                            className="w-full px-3 py-2 border border-[#353935] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                                        >
                                            <option value="">Frequency</option>
                                            <option value="Once a day">Once a day</option>
                                            <option value="Twice a day">Twice a day</option>
                                            <option value="Three times a day">Three times a day</option>
                                            <option value="Four times a day">Four times a day</option>
                                            <option value="As needed">As needed</option>
                                        </select>
                                    </div>

                                    {/* Timing */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Timing
                                        </label>
                                        <select
                                            value={formData.timing}
                                            onChange={(e) => handleInputChange('timing', e.target.value)}
                                            className="w-full px-3 py-2 border border-[#353935] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                                        >
                                            <option value="">Timing</option>
                                            <option value="Morning">Morning</option>
                                            <option value="Evening">Evening</option>
                                            <option value="Night">Night</option>
                                            <option value="Morning / Evening">Morning / Evening</option>
                                            <option value="Morning / night">Morning / Night</option>
                                            <option value="Before meals">Before meals</option>
                                            <option value="After meals">After meals</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Instruction */}
                                <div>
                                    <textarea
                                        placeholder="Instruction ..."
                                        value={formData.instruction}
                                        onChange={(e) => handleInputChange('instruction', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-[#353935] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                    />
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSave}
                                        className="primary text-white px-6 sm:px-8 py-2 rounded-md font-medium transition-colors text-sm"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Saved Prescription Drawer Component
const SavedPrescriptionDrawer: React.FC<SavedPrescriptionDrawerProps> = ({
    isOpen,
    onClose,
    onSelectMedication,
}) => {
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);

    const savedMedications = [
        {
            id: 1,
            name: 'TAB ZERODOL TH 4MG',
            dosage: '1 Tablet',
            frequency: 'Twice a day',
            timing: 'Morning / night',
            instruction: 'Take on an empty stomach and avoid dairy products.',
            isSelected: false
        },
        {
            id: 2,
            name: 'TAB PAN 40 MG PANTOPRAZOLE',
            dosage: '1 Tablet',
            frequency: 'Twice a day',
            timing: 'Morning / night',
            instruction: 'Take on an empty stomach and avoid dairy products.',
            isSelected: true
        },
        {
            id: 3,
            name: 'TAB ZERODOL TH 4MG',
            dosage: '1 Tablet',
            frequency: 'Twice a day',
            timing: 'Morning / night',
            instruction: 'Take on an empty stomach and avoid dairy products.',
            isSelected: false
        },
        {
            id: 4,
            name: 'TAB ZERODOL TH 4MG',
            dosage: '1 Tablet',
            frequency: 'Twice a day',
            timing: 'Morning / night',
            instruction: 'Take on an empty stomach and avoid dairy products.',
            isSelected: false
        }
    ];

    const handleSelectMedication = (med: any) => {
        setSelectedMedication(med.id === selectedMedication?.id ? null : med);
        if (onSelectMedication) {
            onSelectMedication(med);
        }
    };

    const handleSaveNewPrescription = (newPrescription: any) => {
        // You can add logic here to save the new prescription to your data source
        console.log('New prescription saved:', newPrescription);
        // Optionally, you can call onSelectMedication to add it to the current form
        if (onSelectMedication) {
            onSelectMedication({
                name: newPrescription.drugName,
                dosage: newPrescription.drugDosage,
                frequency: newPrescription.frequency,
                timing: newPrescription.timing,
                instruction: newPrescription.instruction
            });
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Side Drawer */}
            <div
                className={`fixed top-0 sm:top-19 right-0 h-full sm:h-auto pb-6 w-full sm:w-96 md:w-120 lg:w-170 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full sm:h-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b-2 border-gray-400 bg-white">
                        <h2 className="flex-1 text-center text-base sm:text-lg font-bold text-gray-800">
                            Saved Prescription
                        </h2>
                        <button
                            onClick={onClose}
                            className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className='text-black text-base sm:text-lg'>
                            <p>Medication</p>
                        </div>
                        <div className='border border-gray-400'></div>

                        {/* Medication List */}
                        <div className="space-y-0 mt-3">
                            {savedMedications.map((med) => (
                                <div
                                    key={med.id}
                                    className={`px-3 sm:px-4 py-4 cursor-pointer transition-colors border-b border-gray-200 last:border-b-0 ${med.isSelected || selectedMedication?.id === med.id
                                        ? 'bg-blue-100'
                                        : 'bg-white hover:bg-blue-50'
                                        }`}
                                    onClick={() => handleSelectMedication(med)}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                                            {med.name}
                                        </h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-xs sm:text-sm text-gray-700 gap-1 sm:gap-0">
                                            <span>{med.dosage}</span>
                                            <span>{med.frequency}</span>
                                            <span>{med.timing}</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-600">
                                        <span className="font-normal">Instruction:</span> {med.instruction}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 flex justify-end">
                            <button
                                onClick={() => setIsAddNewModalOpen(true)}
                                className="w-full sm:w-50 bg-yellow-300 hover:bg-yellow-400 text-gray-800 py-2 px-4 rounded-lg font-medium text-sm transition-colors"
                            >
                                Add New
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Prescription Modal */}
            <AddNewPrescriptionModal
                isOpen={isAddNewModalOpen}
                onClose={() => setIsAddNewModalOpen(false)}
                onSave={handleSaveNewPrescription}
            />
        </>
    );
};

const PrescriptionForm = () => {
    const [medications, setMedications] = useState([
        {
            sno: 1,
            medication: 'Cetirizine',
            description: 'Cetirizine Tabs are an effective remedy against mild asthma and hay fever conditions',
            dosage: '1 Tablet',
            frequency: 'Twice a day',
            timing: 'Morning night'
        },
        {
            sno: 2,
            medication: 'Aciclovir (Zovirax)',
            description: '',
            dosage: '1 Tablet',
            frequency: 'Once a day',
            timing: 'Evening'
        }
    ]);

    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        timing: '',
        instruction: ''
    });

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSavedPrescriptionOpen, setIsSavedPrescriptionOpen] = useState(false);
    const [showMedicationForm, setShowMedicationForm] = useState(false);

    // Function to add medication to the table
    const handleAddMedication = () => {
        if (newMedication.name) {
            setMedications([...medications, {
                sno: medications.length + 1,
                medication: newMedication.name,
                description: newMedication.instruction,
                dosage: newMedication.dosage,
                frequency: newMedication.frequency,
                timing: newMedication.timing
            }]);
            // Clear the form after adding
            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                timing: '',
                instruction: ''
            });
            // Hide the form after adding medication
            setShowMedicationForm(false);
        }
    };

    // Function to handle medication selection from drawer
    const handleSelectMedication = (selectedMed: any) => {
        setNewMedication({
            name: selectedMed.name,
            dosage: selectedMed.dosage,
            frequency: selectedMed.frequency,
            timing: selectedMed.timing,
            instruction: selectedMed.instruction
        });
        setIsSavedPrescriptionOpen(false);
    };

    // Function to open saved prescriptions drawer
    const openSavedPrescriptions = () => {
        setIsSavedPrescriptionOpen(true);
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
                            // onClick={() => router.push('/folders')}
                            className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg  transition-colors flex items-center"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="w-2 h-2 mr-2" />
                            <span className="text-md sm:text-md font-bold text-[#333333] ">Back</span>
                        </button>
                        </div>

                        <div className="flex flex-col items-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Prescription</h1>
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
                                    <span className="font-medium w-full sm:w-20">PRID:</span>
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

                    {/* Prescription Table */}
                    <div className="p-3 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold mb-4">Prescription</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full border-t border-b border-gray-400 min-w-[600px]">
                                <thead>
                                    <tr className="text-left">
                                        <th className="p-2 sm:p-3 border-b border-gray-400 w-12 sm:w-16 text-xs sm:text-sm">S.No.</th>
                                        <th className="p-2 sm:p-3 border-b border-l border-gray-400 text-xs sm:text-sm">Medication</th>
                                        <th className="p-2 sm:p-3 border-b border-l border-gray-400 w-20 sm:w-24 text-xs sm:text-sm">Dosage</th>
                                        <th className="p-2 sm:p-3 border-b border-l border-gray-400 w-24 sm:w-32 text-xs sm:text-sm">Frequency</th>
                                        <th className="p-2 sm:p-3 border-b border-l border-gray-400 w-24 sm:w-32 text-xs sm:text-sm">Timing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.map((med) => (
                                        <tr key={med.sno} className="align-top">
                                            <td className="p-2 sm:p-3 border-t border-gray-400 text-center text-xs sm:text-sm">{med.sno}</td>
                                            <td className="p-2 sm:p-3 border-t border-l border-gray-400">
                                                <div className="font-medium text-xs sm:text-sm">{med.medication}</div>
                                                {med.description && (
                                                    <div className="text-xs text-gray-500 mt-1">{med.description}</div>
                                                )}
                                            </td>
                                            <td className="p-2 sm:p-3 border-t border-l border-gray-400 text-xs sm:text-sm">{med.dosage}</td>
                                            <td className="p-2 sm:p-3 border-t border-l border-gray-400 text-xs sm:text-sm">{med.frequency}</td>
                                            <td className="p-2 sm:p-3 border-t border-l border-gray-400 text-xs sm:text-sm">{med.timing}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Add Medication Form */}
                        <div className="mt-6 sm:mt-8 space-y-4">
                            <div
                                className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${showMedicationForm ? "justify-between" : "justify-end"
                                    }`}
                            >
                                {showMedicationForm && (
                                    <input
                                        type="text"
                                        placeholder="Medication name..."
                                        value={newMedication.name}
                                        onChange={(e) =>
                                            setNewMedication({ ...newMedication, name: e.target.value })
                                        }
                                        className="w-full sm:w-40 md:w-1/2 border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                )}
                                <button
                                    onClick={openSavedPrescriptions}
                                    className="w-full sm:w-auto bg-yellow-300 hover:bg-yellow-500 px-4 sm:px-6 py-2 rounded-lg font-medium text-sm"
                                >
                                    Add Medication
                                </button>
                            </div>

                            {/* Show form fields only when showMedicationForm is true */}
                            {showMedicationForm && (
                                <>
                                    {/* Dosage, Frequency, Timing Inputs */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Dosage..."
                                            value={newMedication.dosage}
                                            onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                            className="border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Frequency..."
                                            value={newMedication.frequency}
                                            onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                            className="border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Timing..."
                                            value={newMedication.timing}
                                            onChange={(e) => setNewMedication({ ...newMedication, timing: e.target.value })}
                                            className="border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                    </div>

                                    {/* Instruction Textarea */}
                                    <textarea
                                        placeholder="Instruction"
                                        value={newMedication.instruction}
                                        onChange={(e) => setNewMedication({ ...newMedication, instruction: e.target.value })}
                                        className="w-full sm:w-40 md:w-1/2 border border-gray-500 px-3 py-2 h-16 sm:h-20 resize-none focus:outline-none focus:border-blue-500 text-sm"
                                    />

                                    {/* Add Button */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleAddMedication}
                                            className="bg-yellow px-6 sm:px-8 py-2 border border-black rounded-lg font-medium text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </>
                            )}
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

            {/* Saved Prescription Drawer */}
            <SavedPrescriptionDrawer
                isOpen={isSavedPrescriptionOpen}
                onClose={() => setIsSavedPrescriptionOpen(false)}
                onSelectMedication={handleSelectMedication}
            />
        </DefaultLayout>
    );
};

export default PrescriptionForm;