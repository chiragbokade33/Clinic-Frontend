'use client'
export const runtime = "edge";           // ✅ Run on Edge runtime
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from 'react'
import Tooltip from '../components/Tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faInfoCircle, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'
import Drawer from '../components/clinicInfoDrawer'
import DefaultLayout from '../components/DefaultLayout'
import { useFormik } from 'formik'
import * as Yup from "yup";
import { JsonAdded, ListProfile, ListTreatemnet, Treatment, UpdateData } from '../services/ClinicServiceApi'
import { toast, ToastContainer } from 'react-toastify'
import { getUserId } from '../hooks/GetitemsLocal'
import { useRouter, useSearchParams } from 'next/navigation'

// Type definitions
interface TreatmentData {
    treatmentId: number;
    treatmentName: string;
    cost: number;
    quantityPerDay?: number;
    status?: string;
    total?: number;
}

interface TreatmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTreatment: (treatment: TreatmentData) => void;
    onAddNew: () => void;
}

interface AddTreatmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: { treatmentName: string; cost: number }) => void;
}

interface TreatmentFormValues {
    treatmentName: string;
    qty: string;
    cost: string;
    status: string;
}

interface AddTreatmentFormValues {
    treatmentName: string;
    cost: string;
}

interface ApiResponse<T> {
    data: {
        data: T;
        message: string;
    };
}

// Status mapping constants
const STATUS_API_TO_UI: Record<string, string> = {
    "NotStarted": "Not Started",
    "InProgress": "In Progress",
    "Completed": "Completed",
    "Cancelled": "Cancelled",
};

const STATUS_UI_TO_API: Record<string, string> = {
    "Not Started": "NotStarted",
    "Not started": "NotStarted",
    "In Progress": "InProgress",
    "In progress": "InProgress",
    "Completed": "Completed",
    "Cancelled": "Cancelled",
};

// Treatment Drawer Component
const TreatmentDrawer: React.FC<TreatmentDrawerProps> = ({ isOpen, onClose, onSelectTreatment, onAddNew }) => {
    const [treatmentList, setTreatmentList] = useState<TreatmentData[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
     const router = useRouter();

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    const listData = async () => {
        if (!currentUserId) return;

        setLoading(true);
        try {
            const response: ApiResponse<TreatmentData[]> = await ListTreatemnet(currentUserId);
            setTreatmentList(response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching treatment list:", error);
            toast.error("Failed to load treatments");
            setTreatmentList([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isOpen && currentUserId) {
            listData();
        }
    }, [isOpen, currentUserId]);

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
                        {loading ? (
                            <div className="text-center py-4">Loading treatments...</div>
                        ) : (
                            /* List of Treatments */
                            <div className="space-y-3">
                                {treatmentList.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        No treatments found
                                    </div>
                                ) : (
                                    treatmentList.map((treatment: TreatmentData, index: number) => (
                                        <div
                                            key={treatment.treatmentId}
                                            className={`flex justify-between items-center py-2 px-1 cursor-pointer hover:bg-gray-50
                                ${index < treatmentList.length - 1 ? 'border-b border-gray-200' : ''}`}
                                            onClick={() => onSelectTreatment(treatment)}
                                        >
                                            {/* Treatment Name */}
                                            <div className="pr-4">
                                                <h3 className="font-medium text-sm text-gray-700 leading-tight">
                                                    {treatment.treatmentName}
                                                </h3>
                                            </div>
                                            {/* Treatment Cost */}
                                            <div className="text-sm font-semibold text-right text-gray-800">
                                                ₹{treatment.cost.toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                    <div className='flex justify-end'>
                        {/* Add New Button */}
                        <button
                            onClick={onAddNew}
                            className="w-40 mt-6 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium text-sm"
                        >
                            Add New
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddTreatmentModal: React.FC<AddTreatmentModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    const formik = useFormik<AddTreatmentFormValues>({
        initialValues: {
            treatmentName: "",
            cost: "",
        },
        validationSchema: Yup.object({
            treatmentName: Yup.string()
                .trim()
                .required("Treatment name is required"),
            cost: Yup.number()
                .typeError("Cost must be a number")
                .positive("Cost must be greater than 0")
                .required("Treatment cost is required"),
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                if (!currentUserId) {
                    toast.error("User ID not found");
                    return;
                }

                const payload = {
                    clinicId: currentUserId,
                    treatmentName: values.treatmentName.trim(),
                    cost: parseFloat(values.cost),
                };

                const response: ApiResponse<any> = await Treatment(payload);
                toast.success(response.data.message || "Treatment added successfully");

                if (onSuccess) {
                    onSuccess({
                        treatmentName: values.treatmentName.trim(),
                        cost: parseFloat(values.cost)
                    });
                }
                resetForm();
                onClose();
            } catch (error) {
                console.error("Error saving treatment:", error);
                toast.error("Error saving treatment");
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 bg-opacity-30"
                onClick={onClose}
            />

            {/* Modal content */}
            <div className="relative bg-white rounded-xl border border-black shadow-2xl w-full max-w-2xl mx-auto transform transition-all">
                {/* Header */}
                <div className="p-6 text-center ">
                    <h2 className="text-xl font-semibold text-blue-800">
                        Add a New Treatment
                    </h2>
                    <div className="w-24 border-t-2 border-blue-800 mx-auto mt-2"></div>
                </div>

                {/* Content */}
                <form onSubmit={formik.handleSubmit}>
                    <div className="p-6 space-y-6 flex flex-col md:flex-row items-center">
                        <div className="flex-1 space-y-4">
                            {/* Treatment Name */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="w-40 text-sm font-medium text-gray-700">
                                    Treatment Name :
                                </label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="treatmentName"
                                        value={formik.values.treatmentName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Treatment Name"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.treatmentName &&
                                            formik.errors.treatmentName
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                            } transition`}
                                    />
                                    {formik.touched.treatmentName &&
                                        formik.errors.treatmentName && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {formik.errors.treatmentName}
                                            </p>
                                        )}
                                </div>
                            </div>

                            {/* Treatment Cost */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="w-40 text-sm font-medium text-gray-700">
                                    Treatment Cost :
                                </label>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formik.values.cost}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Cost"
                                        step="0.01"
                                        min="0"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.cost && formik.errors.cost
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                            } transition`}
                                    />
                                    {formik.touched.cost && formik.errors.cost && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formik.errors.cost}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="w-full sm:w-35 flex items-center justify-center order-first sm:order-last">
                            <img
                                src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                                alt="treatment"
                                className="max-w-24 sm:max-w-32 h-auto"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
                        >
                            {formik.isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Page: React.FC = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
    const [isTreatmentDrawerOpen, setIsTreatmentDrawerOpen] = useState<boolean>(false);
    const [isAddTreatmentModalOpen, setIsAddTreatmentModalOpen] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [editingTreatmentId, setEditingTreatmentId] = useState<number | null>(null);
    const searchParams = useSearchParams(); // Hook to get query parameters
    const [profileData, setProfileData] = useState() as any;
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const router = useRouter();


    useEffect(() => {
        const listDataProfile = async () => {
            const extractedHfid = searchParams.get("hfid");
            const extractedLastVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get('patientId');
            if (!extractedHfid) return;
            try {
                const response = await ListProfile(extractedHfid);
                setProfileData(response.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
            }
        };

        listDataProfile();
    }, [searchParams]);

    // Add medication form state
    const [showMedicationForm, setShowMedicationForm] = useState<boolean>(false);

    // Updated: Start with empty treatments array instead of static data
    const [treatments, setTreatments] = useState<TreatmentData[]>([]);

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    // Load existing treatments on component mount
    useEffect(() => {
        const loadExistingTreatments = async () => {
            if (!currentUserId) return;

            try {
                // You might want to call a different API to load existing treatments for the current patient
                // For now, I'll leave this empty, but you can implement it based on your requirements
                console.log("Loading existing treatments for user:", currentUserId);
            } catch (error) {
                console.error("Error loading existing treatments:", error);
            }
        };

        loadExistingTreatments();
    }, [currentUserId]);

    // Formik for adding treatments
    const addTreatmentFormik = useFormik<TreatmentFormValues>({
        initialValues: {
            treatmentName: "",
            qty: "",
            cost: "",
            status: "Not Started"
        },
        validationSchema: Yup.object({
            treatmentName: Yup.string()
                .trim()
                .required("Treatment name is required"),
            qty: Yup.number()
                .typeError("Quantity must be a number")
                .positive("Quantity must be greater than 0")
                .required("Quantity is required"),
            cost: Yup.number()
                .typeError("Cost must be a number")
                .positive("Cost must be greater than 0")
                .required("Cost is required"),
            status: Yup.string().required("Status is required")
        }),
        onSubmit: async (values, { resetForm }) => {
            if (!currentUserId) {
                toast.error("User ID not found");
                return;
            }

            try {
                // Create payload for API
                const payload = {
                    treatmentName: values.treatmentName.trim(),
                    quantityPerDay: parseInt(values.qty),
                    cost: parseFloat(values.cost),
                    total: parseInt(values.qty) * parseFloat(values.cost),
                    status: STATUS_UI_TO_API[values.status] || values.status
                };

                if (editingTreatmentId !== null) {
                    // Check if this treatmentId already exists in current treatments
                    const existingTreatment = treatments.find(t => t.treatmentId === editingTreatmentId);

                    if (existingTreatment) {
                        // Update existing treatment
                        await UpdateData(currentUserId, editingTreatmentId, payload);
                        toast.success("Treatment updated successfully");

                        // Update local state
                        setTreatments(treatments.map(t =>
                            t.treatmentId === editingTreatmentId
                                ? {
                                    ...t,
                                    treatmentName: values.treatmentName.trim(),
                                    quantityPerDay: parseInt(values.qty),
                                    cost: parseFloat(values.cost),
                                    status: STATUS_UI_TO_API[values.status] || values.status,
                                    total: parseInt(values.qty) * parseFloat(values.cost)
                                }
                                : t
                        ));
                    } else {
                        // Add new treatment with preserved treatmentId (from drawer selection)
                        await UpdateData(currentUserId, editingTreatmentId, payload);
                        toast.success("Treatment added successfully");

                        // Add to local state with preserved treatmentId
                        const newTreatment: TreatmentData = {
                            treatmentId: editingTreatmentId,
                            treatmentName: values.treatmentName.trim(),
                            quantityPerDay: parseInt(values.qty),
                            cost: parseFloat(values.cost),
                            status: STATUS_UI_TO_API[values.status] || values.status,
                            total: parseInt(values.qty) * parseFloat(values.cost)
                        };

                        setTreatments([...treatments, newTreatment]);
                    }
                } else {
                    // Add completely new treatment (manual entry, not from drawer)
                    const newTreatmentId = treatments.length > 0
                        ? Math.max(...treatments.map(t => t.treatmentId)) + 1
                        : 1;

                    await UpdateData(currentUserId, newTreatmentId, payload);
                    toast.success("Treatment added successfully");

                    // Only add to local state after successful API call
                    const newTreatment: TreatmentData = {
                        treatmentId: newTreatmentId,
                        treatmentName: values.treatmentName.trim(),
                        quantityPerDay: parseInt(values.qty),
                        cost: parseFloat(values.cost),
                        status: STATUS_UI_TO_API[values.status] || values.status,
                        total: parseInt(values.qty) * parseFloat(values.cost)
                    };

                    setTreatments([...treatments, newTreatment]);
                }

                resetForm();
                setShowMedicationForm(false);
                setEditingTreatmentId(null);
            } catch (error) {
                console.error("Error processing treatment:", error);
                toast.error(editingTreatmentId !== null ? "Error updating treatment" : "Error adding treatment");
            }
        },
    });

    const updateTreatment = async (
        treatmentId: number,
        field: string,
        value: string | number
    ): Promise<void> => {
        const updatedTreatments = treatments.map((treatment) => {
            if (treatment.treatmentId === treatmentId) {
                let updatedValue = value;

                // Handle field-specific transformations
                if (field === "cost" || field === "qty") {
                    updatedValue = parseFloat(value.toString()) || 0;
                } else if (field === "status") {
                    updatedValue = STATUS_UI_TO_API[value as string] || value;
                }

                const updatedTreatment = {
                    ...treatment,
                    [field === "qty" ? "quantityPerDay" : field === "name" ? "treatmentName" : field]: updatedValue,
                };

                // Recalculate total if cost or quantity changed
                if (field === "cost" || field === "qty") {
                    updatedTreatment.total = (updatedTreatment.quantityPerDay || 0) * updatedTreatment.cost;
                }

                return updatedTreatment;
            }
            return treatment;
        });

        setTreatments(updatedTreatments);

        // Update via API
        try {
            if (currentUserId) {
                let payload: Record<string, any> = {};

                // Only include the field that was actually changed
                switch (field) {
                    case 'name':
                        payload.treatmentName = value;
                        break;
                    case 'qty':
                        payload.quantityPerDay = parseFloat(value.toString()) || 0;
                        // Also update total since qty changed
                        const currentTreatment = updatedTreatments.find(t => t.treatmentId === treatmentId);
                        if (currentTreatment && currentTreatment.quantityPerDay !== undefined) {
                            payload.total = currentTreatment.quantityPerDay * currentTreatment.cost;
                        }
                        break;
                    case 'cost':
                        payload.cost = parseFloat(value.toString()) || 0;
                        // Also update total since cost changed
                        const currentTreatmentForCost = updatedTreatments.find(t => t.treatmentId === treatmentId);
                        if (currentTreatmentForCost && currentTreatmentForCost.quantityPerDay !== undefined) {
                            payload.total = currentTreatmentForCost.quantityPerDay * currentTreatmentForCost.cost;
                        }
                        break;
                    case 'status':
                        payload.status = STATUS_UI_TO_API[value as string] || value;
                        break;
                    default:
                        console.warn(`Unknown field: ${field}`);
                        return;
                }

                await UpdateData(currentUserId, treatmentId, payload);
            }
        } catch (error) {
            console.error("Error updating treatment:", error);
            toast.error("Error updating treatment");
        }
    };

    const deleteTreatment = (treatmentId: number): void => {
        setTreatments(treatments.filter(t => t.treatmentId !== treatmentId));
        toast.success("Treatment removed");
    };

    // Calculate totals - Updated to use correct field names
    const totalCost = treatments.reduce((sum, treatment) =>
        sum + (treatment.cost * (treatment.quantityPerDay || 0)), 0);
    const grandTotal = totalCost; // You can add additional charges here if needed

    // Updated: selectTreatment function to handle API data structure
    const selectTreatment = (selectedTreatment: TreatmentData): void => {
        // Check if this treatmentId already exists in current treatments
        const existingTreatment = treatments.find(t => t.treatmentId === selectedTreatment.treatmentId);

        // Set values in formik form using API data structure
        addTreatmentFormik.setValues({
            treatmentName: selectedTreatment.treatmentName,
            qty: selectedTreatment.quantityPerDay?.toString() || "1",
            cost: selectedTreatment.cost?.toString() || "",
            status: STATUS_API_TO_UI[selectedTreatment.status || ""] || selectedTreatment.status || "Not Started"
        });

        setEditingTreatmentId(selectedTreatment.treatmentId);
        setShowMedicationForm(true);
        setIsTreatmentDrawerOpen(false);
    };

    const addNewTreatment = (newTreatmentData: { treatmentName: string; cost: number }): void => {
        const newTreatmentId = treatments.length > 0
            ? Math.max(...treatments.map(t => t.treatmentId)) + 1
            : 1;

        const newTreatment: TreatmentData = {
            treatmentId: newTreatmentId,
            treatmentName: newTreatmentData.treatmentName,
            quantityPerDay: 1,
            cost: newTreatmentData.cost,
            status: 'NotStarted',
            total: newTreatmentData.cost
        };
        setTreatments([...treatments, newTreatment]);
        setIsAddTreatmentModalOpen(false);
    };

    const openSavedPrescriptions = (): void => {
        setEditingTreatmentId(null); // Reset editing mode
        setIsTreatmentDrawerOpen(true);
    };

    // Add function for manual new treatment entry
    const addManualTreatment = (): void => {
        addTreatmentFormik.resetForm();
        setEditingTreatmentId(null); // Ensure this is null for new manual entry
        setShowMedicationForm(true);
    };

    // Updated: Function to populate form with existing treatment data using correct field names
    const populateFormWithTreatment = (treatment: TreatmentData): void => {
        addTreatmentFormik.setValues({
            treatmentName: treatment.treatmentName,
            qty: treatment.quantityPerDay?.toString() || "",
            cost: treatment.cost?.toString() || "",
            status: STATUS_API_TO_UI[treatment.status || ""] || treatment.status || "Not Started"
        });
        setEditingTreatmentId(treatment.treatmentId);
        setShowMedicationForm(true);
    };

    return (
        <DefaultLayout>
            <div className="min-w-full max-w-7xl mx-auto p-2 sm:p-4">
                {/* Header */}
                <div className="bg-white p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <div className="flex items-center cursor-pointer">
                            <button
                                className="mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-lg transition-colors flex items-center"
                                 onClick={() => router.push("/clinicpatient")}
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
                                Treatment Plan Information
                            </Drawer>
                        </div>
                    </div>
                </div>

                <div className='border'>
                    {/* Clinic Header */}
                    <div className="p-3 sm:p-6">
                        <div className="flex justify-center">
                            <img
                               src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
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
                                    <span className="font-medium w-full sm:w-20">TID:</span>
                                    <span>T5QAHYBM6</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                                    <span className="font-medium w-full sm:w-20">Mobile:</span>
                                    <input
                                        type="text"
                                        placeholder="Enter mobile number"
                                        value={profileData?.phoneNumber || ""}
                                        readOnly   // if you only want to display
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

                    {/* Treatment Table */}
                    <div className="p-3 sm:p-6 min-w-7xl mx-auto">
                        <div className="bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base sm:text-lg font-bold">Treatment</h3>
                            </div>

                            {/* Treatment Table - Updated to use correct field names */}
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
                                        {treatments.map((treatment: TreatmentData, index: number) => (
                                            <tr
                                                key={treatment.treatmentId}
                                                className="hover:bg-gray-50 cursor-pointer"
                                                onClick={() => populateFormWithTreatment(treatment)}
                                            >
                                                <td className="px-2 py-2 text-sm text-center border-gray-700">{index + 1}</td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    <input
                                                        type="text"
                                                        value={treatment.treatmentName}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'name', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm"
                                                        placeholder="Enter treatment name"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    <input
                                                        type="number"
                                                        value={treatment.quantityPerDay || 0}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'qty', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm text-center"
                                                        min="1"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    <input
                                                        type="number"
                                                        value={treatment.cost}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'cost', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm text-right"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm">
                                                    <select
                                                        value={STATUS_API_TO_UI[treatment.status || ""] || treatment.status || 'Not Started'}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'status', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm"
                                                    >
                                                        <option value="Not Started">Not Started</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-2 text-sm text-right">
                                                    ₹{(treatment.cost * (treatment.quantityPerDay || 0)).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Empty rows for spacing */}
                                        {treatments.length < 5 && (
                                            <>
                                                {Array.from({ length: 5 - treatments.length }).map((_, index: number) => (
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
                                        <tr className="border-t border-b border-gray-700 bg-gray-50">
                                            <td className="px-2 py-3 text-sm border-gray-700" colSpan={2}></td>
                                            <td className="border-l border-gray-700 px-2 py-3 text-sm font-medium" colSpan={2}>
                                                <strong>Total Cost: ₹{totalCost.toFixed(2)}</strong>
                                            </td>
                                            <td className="border-l border-gray-700 px-2 py-3 text-sm font-medium" colSpan={2}>
                                                <strong>Grand Total: ₹{grandTotal.toFixed(2)}</strong>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Add Treatment Form and Button */}
                        <div className="flex justify-end items-start gap-4 mt-4">
                            {/* Treatment Form */}
                            {showMedicationForm && (
                                <form onSubmit={addTreatmentFormik.handleSubmit} className="flex-1 space-y-4">
                                    {/* First row */}
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                name="treatmentName"
                                                placeholder="Treatment Name..."
                                                value={addTreatmentFormik.values.treatmentName}
                                                onChange={addTreatmentFormik.handleChange}
                                                onBlur={addTreatmentFormik.handleBlur}
                                                className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded ${addTreatmentFormik.touched.treatmentName && addTreatmentFormik.errors.treatmentName
                                                    ? 'border-red-500' : 'border-gray-500'
                                                    }`}
                                            />
                                            {addTreatmentFormik.touched.treatmentName && addTreatmentFormik.errors.treatmentName && (
                                                <p className="text-red-500 text-xs mt-1">{addTreatmentFormik.errors.treatmentName}</p>
                                            )}
                                        </div>
                                        <div className="w-1/4">
                                            <input
                                                type="number"
                                                name="qty"
                                                placeholder="Qty / Day"
                                                value={addTreatmentFormik.values.qty}
                                                onChange={addTreatmentFormik.handleChange}
                                                onBlur={addTreatmentFormik.handleBlur}
                                                min="1"
                                                className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded ${addTreatmentFormik.touched.qty && addTreatmentFormik.errors.qty
                                                    ? 'border-red-500' : 'border-gray-500'
                                                    }`}
                                            />
                                            {addTreatmentFormik.touched.qty && addTreatmentFormik.errors.qty && (
                                                <p className="text-red-500 text-xs mt-1">{addTreatmentFormik.errors.qty}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Second row */}
                                    <div className="flex items-end gap-4">
                                        <div className="w-1/4">
                                            <input
                                                type="number"
                                                name="cost"
                                                placeholder="Cost..."
                                                value={addTreatmentFormik.values.cost}
                                                onChange={addTreatmentFormik.handleChange}
                                                onBlur={addTreatmentFormik.handleBlur}
                                                step="0.01"
                                                min="0"
                                                className={`w-full border px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded ${addTreatmentFormik.touched.cost && addTreatmentFormik.errors.cost
                                                    ? 'border-red-500' : 'border-gray-500'
                                                    }`}
                                            />
                                            {addTreatmentFormik.touched.cost && addTreatmentFormik.errors.cost && (
                                                <p className="text-red-500 text-xs mt-1">{addTreatmentFormik.errors.cost}</p>
                                            )}
                                        </div>
                                        <div className="w-1/4">
                                            <select
                                                name="status"
                                                value={addTreatmentFormik.values.status}
                                                onChange={addTreatmentFormik.handleChange}
                                                onBlur={addTreatmentFormik.handleBlur}
                                                className="w-full border border-gray-500 px-3 py-2 text-sm rounded focus:outline-none focus:border-blue-500"
                                            >
                                                <option value="Not Started">Not Started</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                        <div className="w-1/4">
                                            <input
                                                type="text"
                                                placeholder="Total..."
                                                value={addTreatmentFormik.values.qty && addTreatmentFormik.values.cost
                                                    ? `₹${(parseFloat(addTreatmentFormik.values.qty) * parseFloat(addTreatmentFormik.values.cost)).toFixed(2)}`
                                                    : ''
                                                }
                                                readOnly
                                                className="w-full border border-gray-500 px-3 py-2 focus:outline-none focus:border-blue-500 text-sm rounded bg-gray-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={addTreatmentFormik.isSubmitting}
                                            className="bg-yellow-400 hover:bg-yellow-500 px-6 sm:px-8 py-2 border border-yellow-500 rounded-lg font-medium text-sm disabled:opacity-50"
                                        >
                                            {addTreatmentFormik.isSubmitting
                                                ? (editingTreatmentId !== null ? 'Updating...' : 'Adding...')
                                                : (editingTreatmentId !== null ? 'Update' : 'Add')
                                            }
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowMedicationForm(false);
                                                setEditingTreatmentId(null);
                                                addTreatmentFormik.resetForm();
                                            }}
                                            className="bg-gray-300 hover:bg-gray-400 px-6 sm:px-8 py-2 border border-gray-400 rounded-lg font-medium text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Add Treatment Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={addManualTreatment}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 self-start"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                    New Treatment
                                </button>
                                <button
                                    onClick={openSavedPrescriptions}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 self-start"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                    From Saved
                                </button>
                            </div>
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
                    <button
                        disabled={isSaving || treatments.length === 0}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={async () => {
                            setIsSaving(true);
                            try {
                                // Get required IDs
                                const extractedHfid = searchParams.get("hfid");
                                const extractedVisitId = searchParams.get("visitId");
                                const extractedPatientId = searchParams.get('patientId');


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

                                if (treatments.length === 0) {
                                    toast.error("Please add at least one treatment before saving");
                                    return;
                                }

                                // Prepare the treatment data in the required format
                                const treatmentPlanData = {
                                    patient: {
                                        name: profileData?.fullName || "",
                                        hfid: profileData?.hfId || extractedHfid,
                                        gender: profileData?.gender || "",
                                        tid: "T5QAHYBM6", // You might want to get this from profileData if available
                                        dob: profileData?.dob || "",
                                        mobile: profileData?.phoneNumber || "",
                                        doctor: "Dr. Varun R Kunte",
                                        city: profileData?.city || ""
                                    },
                                    treatments: treatments.map(treatment => ({
                                        name: treatment.treatmentName,
                                        qtyPerDay: `${treatment.quantityPerDay || 1} QTY`,
                                        cost: treatment.cost,
                                        status: STATUS_API_TO_UI[treatment.status || ""] || treatment.status || "Not started",
                                        total: treatment.cost * (treatment.quantityPerDay || 1)
                                    })),
                                    totalCost: totalCost,
                                    grandTotal: grandTotal,
                                    clinicInfo: {
                                        name: "ARTHROSE",
                                        subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                                        website: "www.arthrosetmjindia.com"
                                    }
                                };

                                // Prepare the API payload
                                const payload = {
                                    clinicId: parseInt(currentUserId.toString()),
                                    patientId: parseInt(extractedPatientId),
                                    clinicVisitId: parseInt(extractedVisitId),
                                    type: "Treatment",
                                    jsonData: JSON.stringify(treatmentPlanData)
                                };
                                const response = await JsonAdded(payload);
                                toast.success(`${response.data.message}`);
                                router.push(`/clinicpatient`);
                            } catch (error) {
                                console.error("Error saving treatment plan:", error);
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                    >
                        {isSaving ? (
                            <>
                                <span className="mr-2">⏳</span>
                                Saving...
                            </>
                        ) : (
                            "Save Treatment Plan"
                        )}
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
                onSuccess={addNewTreatment}
            />
            <ToastContainer position="top-right" />
        </DefaultLayout>
    )
}

export default Page