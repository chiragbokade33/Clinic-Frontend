'use client'
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import Tooltip from '../components/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Drawer from '../components/clinicInfoDrawer';
import { useRouter, useSearchParams } from 'next/navigation';
import { AddPrescripation, GetListData, JsonAdded, ListProfile, UpdatePrescipation } from '../services/ClinicServiceApi';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { getUserId } from '../hooks/GetitemsLocal';
import { toast } from 'react-toastify';

interface SavedPrescriptionDrawerProps {
    isOpen: any;
    onClose: any;
    onSelectMedication: any;
}

interface AddNewPrescriptionModalProps {
    isOpen: boolean;
    onClose: any;
    onSave: any;
}

const AddNewPrescriptionModal: React.FC<AddNewPrescriptionModalProps> = ({
    isOpen,
    onClose,
    onSave,
}) => {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            medicationName: "",
            medicationDosage: "",
            frequency: "",
            timing: "",
            instructions: "",
        },
        validationSchema: Yup.object({
            medicationName: Yup.string().required("Drug name is required"),
            medicationDosage: Yup.string().required("Dosage is required"),
            frequency: Yup.string().required("Select frequency"),
            timing: Yup.string().required("Select timing"),
            instructions: Yup.string().nullable(),
        }),
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);

            try {
                const clinicId = await getUserId();
                setCurrentUserId(clinicId);

                // Create payload with only non-empty values
                const payload: any = {
                    clinicId: clinicId,
                };

                if (values.medicationName?.trim()) payload.medicationName = values.medicationName.trim();
                if (values.medicationDosage?.trim()) payload.medicationDosage = values.medicationDosage.trim();
                if (values.frequency?.trim()) payload.frequency = values.frequency.trim();
                if (values.timing?.trim()) payload.timing = values.timing.trim();
                if (values.instructions?.trim()) payload.instructions = values.instructions.trim();

                const response = await AddPrescripation(payload);
                toast.success(response.data.message || "Prescription added successfully");
                resetForm();
                onClose();
                if (onSave) {
                    onSave(values); // Pass the values to parent
                }
            } catch (error: any) {
                console.error("❌ Failed to add prescription:", error);
                toast.error(error?.response?.data?.message || "Failed to add prescription");
            } finally {
                setIsSubmitting(false);
            }
        },
    });

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
                            <h2 className="text-base sm:text-lg font-bold text-blue-800">
                                Add a New Prescription
                            </h2>
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
                        <form onSubmit={formik.handleSubmit}>
                            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                                {/* Left side - Form */}
                                <div className="flex-1 space-y-2">
                                    {/* Drug Name & Dosage */}
                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <div className="flex-1 w-full">
                                            {/* Drug Name */}
                                            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
                                                <label
                                                    htmlFor="medicationName"
                                                    className="w-full sm:w-32 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
                                                >
                                                    Drug Name :
                                                </label>
                                                <input
                                                    type="text"
                                                    name="medicationName"
                                                    value={formik.values.medicationName}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                                    placeholder="Enter drug name"
                                                />
                                            </div>
                                            {formik.touched.medicationName &&
                                                formik.errors.medicationName && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formik.errors.medicationName}
                                                    </p>
                                                )}

                                            {/* Drug Dosage */}
                                            <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-6">
                                                <label
                                                    htmlFor="medicationDosage"
                                                    className="w-full sm:w-32 text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
                                                >
                                                    Drug Dosage :
                                                </label>
                                                <input
                                                    type="text"
                                                    name="medicationDosage"
                                                    value={formik.values.medicationDosage}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                                    placeholder="Enter dosage"
                                                />
                                            </div>
                                            {formik.touched.medicationDosage &&
                                                formik.errors.medicationDosage && (
                                                    <p className="text-red-500 text-xs mt-1">
                                                        {formik.errors.medicationDosage}
                                                    </p>
                                                )}
                                        </div>

                                        {/* Illustration */}
                                        <div className="w-full sm:w-35 flex items-center justify-center order-first sm:order-last">
                                            <img
                                                src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                                                alt="samantha"
                                                className="max-w-24 sm:max-w-32 h-auto"
                                            />
                                        </div>
                                    </div>

                                    {/* Frequency and Timing */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Frequency
                                            </label>
                                            <select
                                                name="frequency"
                                                value={formik.values.frequency}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                            >
                                                <option value="">Select</option>
                                                <option value="OnceADay">Once a day</option>
                                                <option value="TwiceADay">Twice a day</option>
                                                <option value="ThreeTimesADay">
                                                    Three times a day
                                                </option>
                                                <option value="FourTimesADay">Four times a day</option>
                                            </select>
                                            {formik.touched.frequency && formik.errors.frequency && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {formik.errors.frequency}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Timing
                                            </label>
                                            <select
                                                name="timing"
                                                value={formik.values.timing}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="w-full px-3 py-2 border rounded-md text-sm"
                                            >
                                                <option value="">Select</option>
                                                <option value="Morning">Morning</option>
                                                <option value="Evening">Evening</option>
                                                <option value="Night">Night</option>
                                                <option value="MorningEvening">
                                                    Morning / Evening
                                                </option>
                                                <option value="MorningNight">Morning / Night</option>
                                                <option value="BeforeMeals">Before meals</option>
                                                <option value="AfterMeals">After meals</option>
                                            </select>
                                            {formik.touched.timing && formik.errors.timing && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {formik.errors.timing}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <textarea
                                            name="instructions"
                                            rows={3}
                                            value={formik.values.instructions}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                                            placeholder="Enter instructions..."
                                        />
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`px-6 py-2 rounded-md text-sm font-medium transition ${isSubmitting
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                                } text-white`}
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
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
    const [selectedMedication, setSelectedMedication] = useState<any>(null);
    const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
    const [medicalList, setMedicalList] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    // Enhanced listData function with error handling
    const listData = async () => {
        if (!currentUserId) return;

        try {
            setLoading(true);
            const response = await GetListData(Number(currentUserId));

            if (response?.data?.data) {
                // Map the API response to match the component's expected format
                const mappedData = response.data.data.map((item: any) => ({
                    id: item.prescriptionId,
                    name: item.medicationName || '',
                    dosage: item.medicationDosage || '',
                    frequency: item.frequency || '',
                    timing: item.timing || '',
                    instruction: item.instructions || '',
                    isSelected: false
                }));

                setMedicalList(mappedData);
            } else {
                setMedicalList([]);
            }
        } catch (error: any) {
            console.error('Error fetching prescription data:', error);
            toast.error(error?.response?.data?.message || 'Failed to fetch prescriptions');
            setMedicalList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUserId) {
            listData();
        }
    }, [currentUserId]);

    // Enhanced handleSelectMedication with better state management
    const handleSelectMedication = (med: any) => {
        // Toggle selection
        const isCurrentlySelected = selectedMedication?.id === med.id;
        setSelectedMedication(isCurrentlySelected ? null : med);

        // Update the medication list to reflect selection
        setMedicalList(prev => prev.map(item => ({
            ...item,
            isSelected: item.id === med.id ? !isCurrentlySelected : false
        })));

        // Pass the selected medication to parent component
        if (onSelectMedication && !isCurrentlySelected) {
            onSelectMedication(med);
        }
    };

    // Fixed handleSaveNewPrescription function
    const handleSaveNewPrescription = async (newPrescription: any) => {
        try {
            // Create the new medication object with proper mapping
            const newMed = {
                id: Date.now(), // Temporary ID until API response
                name: newPrescription.medicationName, // Fixed property mapping
                dosage: newPrescription.medicationDosage, // Fixed property mapping
                frequency: newPrescription.frequency,
                timing: newPrescription.timing,
                instruction: newPrescription.instructions, // Fixed property mapping
                isSelected: false
            };

            // Add to local list immediately for better UX
            setMedicalList(prev => [...prev, newMed]);

            // Close the modal
            setIsAddNewModalOpen(false);

            // Select the newly added medication
            if (onSelectMedication) {
                onSelectMedication(newMed);
            }

            // Refresh the list from server to get the actual ID
            setTimeout(() => {
                listData();
            }, 500);

        } catch (error) {
            console.error("Error handling new prescription:", error);
            toast.error("Failed to add prescription");
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

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-8">
                                <div className="text-gray-500">Loading prescriptions...</div>
                            </div>
                        )}

                        {/* Medication List */}
                        <div className="space-y-0 mt-3">
                            {!loading && medicalList.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No saved prescriptions found
                                </div>
                            )}

                            {medicalList.map((med) => (
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
    const [medications, setMedications] = useState([]) as any;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSavedPrescriptionOpen, setIsSavedPrescriptionOpen] = useState(false);
    const [showMedicationForm, setShowMedicationForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const [profileData, setProfileData] = useState<any>();
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
        const router = useRouter();


    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    // Yup validation schema
    const validationSchema = Yup.object({
        medicationName: Yup.string()
            .required('Medication name is required')
            .min(2, 'Medication name must be at least 2 characters'),
        medicationDosage: Yup.string()
            .required('Dosage is required'),
        frequency: Yup.string()
            .required('Frequency is required'),
        timing: Yup.string()
            .required('Timing is required'),
        instructions: Yup.string()
            .optional()
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            medicationName: '',
            medicationDosage: '',
            frequency: '',
            timing: '',
            instructions: ''
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            await handleAddMedication(values, resetForm);
        }
    });

    useEffect(() => {
        const listDataProfile = async () => {
            const extractedHfid = searchParams.get("hfid");
            if (!extractedHfid) return;
            try {
                const response = await ListProfile(extractedHfid);
                setProfileData(response.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        listDataProfile();
    }, [searchParams]);

    // Fixed handleAddMedication function
    const handleAddMedication = async (values: any, resetForm: any) => {
        if (isLoading) return; // Prevent multiple submissions

        setIsLoading(true);

        try {
            const id = await getUserId();
            setCurrentUserId(id);

            // Create payload with only non-empty values (differential update)
            const payload: any = {
                clinicId: id,
            };

            if (values.medicationName?.trim()) payload.medicationName = values.medicationName.trim();
            if (values.medicationDosage?.trim()) payload.medicationDosage = values.medicationDosage.trim();
            if (values.frequency?.trim()) payload.frequency = values.frequency.trim();
            if (values.timing?.trim()) payload.timing = values.timing.trim();
            if (values.instructions?.trim()) payload.instructions = values.instructions.trim();

            // Check if we have any data to send
            if (Object.keys(payload).length <= 1) { // Only clinicId
                toast.error("Please fill at least one field to add");
                return;
            }

            // Use AddPrescripation for new prescriptions
            const response = await AddPrescripation(payload);

            if (response.data) {
                // Add to local state for immediate UI update
                const newMedication = {
                    sno: medications.length + 1,
                    medication: values.medicationName,
                    description: values.instructions || '',
                    dosage: values.medicationDosage,
                    frequency: values.frequency,
                    timing: values.timing
                };

                setMedications(prev => [...prev, newMedication]);
                toast.success(response.data.message || "Medication added successfully");
                resetForm();
                setShowMedicationForm(false);
            }
        } catch (error: any) {
            console.error("Error adding medication:", error);
            toast.error(error?.response?.data?.message || "Failed to add medication");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to update existing prescription (if needed)
    const handleUpdatePrescription = async (prescriptionId: number, values: any) => {
        setIsLoading(true);

        try {
            const id = await getUserId();

            // Create payload with only changed values
            const payload: any = {};

            // Compare with existing values and only include changed ones
            Object.keys(values).forEach(key => {
                if (values[key] && values[key].trim() !== '') {
                    payload[key] = values[key].trim();
                }
            });

            if (Object.keys(payload).length === 0) {
                toast.error("No changes detected");
                return;
            }

            const response = await UpdatePrescipation(id, prescriptionId, payload);

            if (response.data) {
                toast.success(response.data.message || "Prescription updated successfully");

                // Update local medications list
                setMedications(prev => prev.map(med =>
                    med.sno === prescriptionId ? {
                        ...med,
                        medication: payload.medicationName || med.medication,
                        description: payload.instructions || med.description,
                        dosage: payload.medicationDosage || med.dosage,
                        frequency: payload.frequency || med.frequency,
                        timing: payload.timing || med.timing
                    } : med
                ));
            }
        } catch (error: any) {
            console.error("Error updating prescription:", error);
            toast.error(error?.response?.data?.message || "Failed to update prescription");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle medication selection from drawer
    const handleSelectMedication = (selectedMed: any) => {
        formik.setValues({
            medicationName: selectedMed.name || '',
            medicationDosage: selectedMed.dosage || '',
            frequency: selectedMed.frequency || '',
            timing: selectedMed.timing || '',
            instructions: selectedMed.instruction || ''
        });
        setIsSavedPrescriptionOpen(false);
        setShowMedicationForm(true); // Show the form when a medication is selected
    };

    // Function to open saved prescriptions drawer
    const openSavedPrescriptions = () => {
        setIsSavedPrescriptionOpen(true);
        setShowMedicationForm(true);
    };

    const handleSavePrescription = async () => {
        try {
            setIsLoading(true);

            // Extract URL parameters
            const extractedHfid = searchParams.get("hfid");
            const extractedVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get('patientId');

            // Validation
            if (!currentUserId) {
                toast.error("Clinic ID not found");
                return;
            }

            if (!extractedPatientId) {
                toast.error("Patient ID not found");
                return;
            }

            if (!extractedVisitId) {
                toast.error("Visit ID not found");
                return;
            }

            if (medications.length === 0) {
                toast.error("Please add at least one medication before saving");
                return;
            }

            // Create prescription data in the required format
            const prescriptionData = {
                patient: {
                    name: profileData?.fullName || "",
                    hfid: profileData?.hfId || extractedHfid || "",
                    gender: profileData?.gender || "",
                    prfid: "T5QAHYBM6", // You may want to get this from profileData if available
                    dob: profileData?.dob || "",
                    mobile: profileData?.phoneNumber || "",
                    doctor: "Dr. Varun R Kunte", // You may want to make this dynamic
                    city: profileData?.city || ""
                },
                medications: medications.map(med => ({
                    name: med.medication || "",
                    dosage: med.dosage || "",
                    frequency: med.frequency || "",
                    timing: med.timing || "",
                    instruction: med.description || ""
                })),
                clinicInfo: {
                    name: "ARTHROSE",
                    subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                    website: "www.arthrosetmjindia.com"
                },
                timestamp: new Date().toISOString(),
                prescriptionId: `PRESC_${Date.now()}`
            };

            // Create API payload
            const payload = {
                clinicId: Number(currentUserId),
                patientId: Number(extractedPatientId),
                clinicVisitId: Number(extractedVisitId),
                type: "Prescription",
                jsonData: JSON.stringify(prescriptionData)
            };

            console.log("Saving prescription with payload:", payload);

            // Make API call
            const response = await JsonAdded(payload);
            if (response.data) {
                toast.success(response.data.message || "Prescription saved successfully!");
                router.push(`/clinicpatient`);
            }

        } catch (error: any) {
            console.error("Error saving prescription:", error);
        } finally {
            setIsLoading(false);
        }
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
                                Prescription Information
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
                                    <span>{profileData?.fullName}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">Gender:</span>
                                    <span>{profileData?.gender}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">DOB:</span>
                                    <span>{profileData?.dob}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-32">Consultant Doctor:</span>
                                    <span>Dr. Varun R Kunte</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-20">HFID:</span>
                                    <span>{profileData?.hfId}</span>
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
                                        value={profileData?.phoneNumber || ""}
                                        readOnly
                                        className="px-2 py-1 rounded text-xs border border-gray-700 focus:outline-none w-full sm:w-auto"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row">
                                    <span className="font-medium w-full sm:w-20">City:</span>
                                    <span>{profileData?.city}</span>
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
                        <form onSubmit={formik.handleSubmit}>
                            <div className="mt-6 sm:mt-8 space-y-4">
                                <div
                                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${showMedicationForm ? "justify-between" : "justify-end"
                                        }`}
                                >
                                    {showMedicationForm && (
                                        <div className="w-full sm:w-40 md:w-1/2">
                                            <input
                                                type="text"
                                                placeholder="Medication name..."
                                                name="medicationName"
                                                value={formik.values.medicationName}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm ${formik.touched.medicationName && formik.errors.medicationName
                                                    ? 'border-red-500'
                                                    : 'border-gray-500'
                                                    }`}
                                            />
                                            {formik.touched.medicationName && formik.errors.medicationName && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.medicationName}</div>
                                            )}
                                        </div>
                                    )}
                                    <button
                                        type="button"
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
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Dosage..."
                                                    name="medicationDosage"
                                                    value={formik.values.medicationDosage}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm ${formik.touched.medicationDosage && formik.errors.medicationDosage
                                                        ? 'border-red-500'
                                                        : 'border-gray-500'
                                                        }`}
                                                />
                                                {formik.touched.medicationDosage && formik.errors.medicationDosage && (
                                                    <div className="text-red-500 text-xs mt-1">{formik.errors.medicationDosage}</div>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Frequency..."
                                                    name="frequency"
                                                    value={formik.values.frequency}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm ${formik.touched.frequency && formik.errors.frequency
                                                        ? 'border-red-500'
                                                        : 'border-gray-500'
                                                        }`}
                                                />
                                                {formik.touched.frequency && formik.errors.frequency && (
                                                    <div className="text-red-500 text-xs mt-1">{formik.errors.frequency}</div>
                                                )}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Timing..."
                                                    name="timing"
                                                    value={formik.values.timing}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm ${formik.touched.timing && formik.errors.timing
                                                        ? 'border-red-500'
                                                        : 'border-gray-500'
                                                        }`}
                                                />
                                                {formik.touched.timing && formik.errors.timing && (
                                                    <div className="text-red-500 text-xs mt-1">{formik.errors.timing}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Instruction Textarea */}
                                        <div>
                                            <textarea
                                                placeholder="Instructions"
                                                name="instructions"
                                                value={formik.values.instructions}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                className="w-full sm:w-40 md:w-1/2 border border-gray-500 px-3 py-2 h-16 sm:h-20 resize-none focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                            {formik.touched.instructions && formik.errors.instructions && (
                                                <div className="text-red-500 text-xs mt-1">{formik.errors.instructions}</div>
                                            )}
                                        </div>

                                        {/* Add Button */}
                                        <div className="flex justify-center">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className={`px-6 sm:px-8 py-2 border border-black rounded-lg font-medium text-sm ${isLoading
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-yellow hover:bg-yellow-400'
                                                    }`}
                                            >
                                                {isLoading ? 'Adding...' : 'Add'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </form>

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
                    <button
                        onClick={handleSavePrescription}
                        disabled={isLoading}
                        className={`w-full sm:w-auto px-6 sm:px-8 py-2 rounded-lg font-medium text-sm text-white transition-colors ${isLoading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
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