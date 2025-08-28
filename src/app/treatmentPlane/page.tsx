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
import { JsonAdded, ListJsondata, ListProfile, ListTreatemnet, Treatment, UpdateData } from '../services/ClinicServiceApi'
import { toast, ToastContainer } from 'react-toastify'
import { getUserId } from '../hooks/GetitemsLocal'
import { useRouter, useSearchParams } from 'next/navigation'

// Type definitions
interface TreatmentData {
    treatmentId: number;
    treatmentName: string;
    cost: number;
    status?: string;
    total?: number;
    sessions?: number;
    duration?: number;
    frequency?: number;
    quantityPerDay?: any;
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
    duration: string;
    frequency: string;
    sessions: string;
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

// Treatment Drawer Component - UPDATED with enhanced layout
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

    // Helper function to format duration
    const formatDuration = (duration: number | undefined): string => {
        if (!duration) return "N/A";
        switch (duration) {
            case 1: return "1 Month";
            case 3: return "3 Months";
            case 6: return "6 Months";
            default: return `${duration} Months`;
        }
    };

    // Helper function to format frequency
    const formatFrequency = (quantityPerDay: number | undefined): string => {
        if (!quantityPerDay) return "N/A";
        switch (quantityPerDay) {
            case 1: return "1 Day/week";    // ✅ Added missing case
            case 2: return "2 Days/week";
            case 3: return "3 Days/week";
            default: return `${quantityPerDay} Days/week`;
        }
    };
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30"
                onClick={onClose}
            />

            {/* Drawer - Made wider to accommodate more information */}
            <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl overflow-y-auto transform transition-transform duration-300">
                {/* Header */}
                <div className="relative p-4 border-b">
                    <h2 className="text-lg font-bold text-black text-center">
                        All Packages
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
                        <p className="font-medium">Available Packages</p>
                    </div>

                    <div className='border border-gray-300'></div>
                    <div className="mx-auto font-sans">
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading packages...</p>
                            </div>
                        ) : (
                            /* Enhanced List of Treatments */
                            <div className="space-y-4 mt-4">
                                {treatmentList.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">📦</div>
                                        <p>No packages found</p>
                                        <p className="text-sm text-gray-400 mt-1">Create a new package to get started</p>
                                    </div>
                                ) : (
                                    treatmentList.map((treatment: TreatmentData, index: number) => (
                                        <div
                                            key={treatment.treatmentId}
                                            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                                            onClick={() => onSelectTreatment(treatment)}
                                        >
                                            {/* Package Name */}
                                            <div className="mb-3">
                                                <h3 className="font-semibold text-base text-gray-800 line-clamp-2">
                                                    {treatment.treatmentName}
                                                </h3>
                                            </div>

                                            {/* Package Details Grid */}
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                {/* Duration */}
                                                <div className="bg-blue-50 rounded-md p-2">
                                                    <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                                        Duration
                                                    </div>
                                                    <div className="text-sm font-semibold text-blue-800">
                                                        {formatDuration(treatment.duration)}
                                                    </div>
                                                </div>

                                                {/* Frequency */}
                                                <div className="bg-green-50 rounded-md p-2">
                                                    <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                                                        Frequency
                                                    </div>
                                                    <div className="text-sm font-semibold text-green-800">
                                                        {formatFrequency(treatment.quantityPerDay)}
                                                    </div>
                                                </div>

                                                {/* Sessions */}
                                                <div className="bg-purple-50 rounded-md p-2">
                                                    <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                                                        Sessions
                                                    </div>
                                                    <div className="text-sm font-semibold text-purple-800">
                                                        {treatment.sessions || "N/A"}
                                                    </div>
                                                </div>

                                                {/* Cost */}
                                                <div className="bg-orange-50 rounded-md p-2">
                                                    <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                                                        Cost
                                                    </div>
                                                    <div className="text-sm font-semibold text-orange-800">
                                                        ₹{treatment.cost.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Select Button */}
                                            <div className="pt-2 border-t border-gray-100">
                                                <div className="text-center">
                                                    <span className="text-xs text-blue-600 font-medium">
                                                        Click to select this package
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className='flex justify-center mt-6'>
                        {/* Add New Button */}
                        <button
                            onClick={onAddNew}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black px-6 py-3 rounded-lg font-medium text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                            Create New Package
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
            duration: "",
            frequency: "",
            sessions: "",
        },
        validationSchema: Yup.object({
            treatmentName: Yup.string().trim().required("Package name is required"),
            cost: Yup.number()
                .typeError("Cost must be a number")
                .positive("Cost must be greater than 0")
                .required("Package cost is required"),
            // duration: Yup.number()
            //     .typeError("Duration must be a number")
            //     .positive("Duration must be greater than 0")
            //     .required("Duration is required"),
            // frequency: Yup.string().required("Frequency is required"),
            // sessions: Yup.number()
            //     .typeError("Sessions must be a number")
            //     .positive("Sessions must be greater than 0")
            //     .required("Sessions are required"),
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
                    duration: parseInt(values.duration),
                    frequency: parseInt(values.frequency), // ✅ only number extracted
                    sessions: parseInt(values.sessions),
                };

                const response: ApiResponse<any> = await Treatment(payload);
                toast.success(response.data.message);

                if (onSuccess) {
                    onSuccess({
                        treatmentName: values.treatmentName.trim(),
                        cost: parseFloat(values.cost),
                        duration: parseInt(values.duration),
                        frequency: parseInt(values.frequency),
                        sessions: parseInt(values.sessions),
                    });
                }
                resetForm();
                onClose();
            } catch (error) {
                console.error("Error saving package:", error);
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
                        Add a New Package
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
                                    Package Name :
                                </label>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="treatmentName"
                                        value={formik.values.treatmentName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Package Name"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.treatmentName && formik.errors.treatmentName
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
                                    Package Cost :
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

                            {/* Duration */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="w-40 text-sm font-medium text-gray-700">
                                    Duration :
                                </label>
                                <div className="flex-1">
                                    <select
                                        name="duration"
                                        value={formik.values.duration}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.duration && formik.errors.duration
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                            } transition`}
                                    >
                                        <option value="" disabled>
                                            Select Duration
                                        </option>
                                        <option value="1">1 Month</option>
                                        <option value="2">3 Months</option>
                                        <option value="6">6 Months</option>
                                    </select>

                                    {formik.touched.duration && formik.errors.duration && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formik.errors.duration}
                                        </p>
                                    )}
                                </div>
                            </div>


                            {/* Frequency */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="w-40 text-sm font-medium text-gray-700">
                                    Frequency :
                                </label>
                                <div className="flex-1">
                                    <select
                                        name="frequency"
                                        value={formik.values.frequency}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.frequency && formik.errors.frequency
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                            } transition`}
                                    >
                                        <option value="">Select Frequency</option>
                                        <option value="1">1 Day/week</option>
                                        <option value="2">2 Days/week</option>
                                        <option value="3">3 Days/week</option>
                                    </select>
                                    {formik.touched.frequency && formik.errors.frequency && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formik.errors.frequency}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Sessions */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="w-40 text-sm font-medium text-gray-700">
                                    Sessions :
                                </label>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        name="sessions"
                                        value={formik.values.sessions}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Enter Sessions"
                                        min="1"
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${formik.touched.sessions && formik.errors.sessions
                                            ? "border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:ring-blue-500"
                                            } transition`}
                                    />
                                    {formik.touched.sessions && formik.errors.sessions && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formik.errors.sessions}
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


// First, update your TreatmentData interface to include the new fields
interface TreatmentData {
    treatmentId: number;
    treatmentName: string;
    quantityPerDay?: number;
    cost: number;
    sessions?: number;
    duration?: number;
    frequency?: number;
}

// Update TreatmentFormValues interface
interface TreatmentFormValues {
    treatmentName: string;
    qty: string;
    cost: string;
    status: string;
    sessions: string;
    duration: string;
    frequency: string;
    quantityPerDay: any;
}

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
        const FetchDatajson = async () => {
            const extractedHfid = searchParams.get("hfid");
            const extractedLastVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get('patientId');

            if (!extractedHfid || !extractedPatientId || !extractedLastVisitId) return;

            const id = await getUserId();
            setCurrentUserId(id);

            try {
                const response = await ListJsondata(id, Number(extractedPatientId), Number(extractedLastVisitId));
                const apiData = response.data.data;
                console.log("Full API Response:", apiData);

                // Find Treatment type entry
                const treatmentEntry = apiData.find((item: { type: string; }) => item.type === "Treatment");

                if (treatmentEntry) {
                    const parsed = JSON.parse(treatmentEntry.jsonData);
                    console.log("Parsed Treatment Data:", parsed);

                    // Transform the treatments data to match TreatmentData interface
                    const transformedTreatments: TreatmentData[] = parsed.treatments.map((treatment: any, index: number) => ({
                        treatmentId: index + 1, // Generate ID since API data doesn't have it
                        treatmentName: treatment.name,
                        cost: treatment.cost,
                        status: STATUS_UI_TO_API[treatment.status] || treatment.status, // Convert to API format
                        total: treatment.total,
                        sessions: treatment.sessions,
                        duration: treatment.duration === "1 Month" ? 1 :
                            treatment.duration === "3 Months" ? 3 :
                                treatment.duration === "6 Months" ? 6 : 1,
                        frequency: treatment.frequency === "1 Days/week" ? 1 :
                            treatment.frequency === "2 Days/week" ? 2 :
                                treatment.frequency === "3 Days/week" ? 3 : 2
                    }));

                    // Set the treatments data using the correct state setter
                    setTreatments(transformedTreatments);
                    console.log("Transformed Treatments:", transformedTreatments);
                } else {
                    console.log("No Treatment entry found in API data");
                    setTreatments([]); // Set empty array if no data found
                }
            } catch (error) {
                console.error("Error fetching treatment data:", error);
                setTreatments([]); // Set empty array on error
            }
        };

        FetchDatajson();
    }, [searchParams]);

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

    // Updated Formik for adding treatments with new fields
    const addTreatmentFormik = useFormik<TreatmentFormValues>({
        initialValues: {
            treatmentName: "",
            cost: "",
            status: "Not Started",
            sessions: "",
            duration: "",
            quantityPerDay: ""
        },
        validationSchema: Yup.object({
            treatmentName: Yup.string()
                .trim()
                .required("Package name is required"),
            cost: Yup.number()
                .typeError("Cost must be a number")
                .positive("Cost must be greater than 0")
                .required("Cost is required"),
            status: Yup.string().required("Status is required"),
            // sessions: Yup.number()
            //     .typeError("Sessions must be a number")
            //     .positive("Sessions must be greater than 0")
            //     .required("Sessions is required"),
            // duration: Yup.string().required("Duration is required"),
            // frequency: Yup.string().required("Frequency is required")
        }),
        onSubmit: async (values, { resetForm }) => {
            if (!currentUserId) {
                toast.error("User ID not found");
                return;
            }

            try {
                // Create payload for API with new fields - UPDATED: total equals cost
                const payload = {
                    treatmentName: values.treatmentName.trim(),
                    cost: parseFloat(values.cost),
                    total: parseFloat(values.cost), // ✅ Changed: total now equals cost
                    status: STATUS_UI_TO_API[values.status] || values.status,
                    sessions: parseInt(values.sessions),
                    duration: parseInt(values.duration),
                    quantityPerDay: parseInt(values.quantityPerDay)
                };

                if (editingTreatmentId !== null) {
                    // Check if this treatmentId already exists in current treatments
                    const existingTreatment = treatments.find(t => t.treatmentId === editingTreatmentId);

                    if (existingTreatment) {
                        // Update existing treatment
                        await UpdateData(currentUserId, editingTreatmentId, payload);
                        toast.success("Package updated successfully");

                        // Update local state - UPDATED: total equals cost
                        setTreatments(treatments.map(t =>
                            t.treatmentId === editingTreatmentId
                                ? {
                                    ...t,
                                    treatmentName: values.treatmentName.trim(),
                                    cost: parseFloat(values.cost),
                                    status: STATUS_UI_TO_API[values.status] || values.status,
                                    total: parseFloat(values.cost), // ✅ Changed: total now equals cost
                                    sessions: parseInt(values.sessions),
                                    duration: parseInt(values.duration),
                                    quantityPerDay: parseInt(values.quantityPerDay)
                                }
                                : t
                        ));
                    } else {
                        // Add new treatment with preserved treatmentId (from drawer selection)
                        await UpdateData(currentUserId, editingTreatmentId, payload);
                        toast.success("Package added successfully");

                        // Add to local state with preserved treatmentId - UPDATED: total equals cost
                        const newTreatment: TreatmentData = {
                            treatmentId: editingTreatmentId,
                            treatmentName: values.treatmentName.trim(),
                            cost: parseFloat(values.cost),
                            status: STATUS_UI_TO_API[values.status] || values.status,
                            total: parseFloat(values.cost), // ✅ Changed: total now equals cost
                            sessions: parseInt(values.sessions),
                            duration: parseInt(values.duration),
                            quantityPerDay: parseInt(values.quantityPerDay)
                        };

                        setTreatments([...treatments, newTreatment]);
                    }
                } else {
                    // Add completely new treatment (manual entry, not from drawer)
                    const newTreatmentId = treatments.length > 0
                        ? Math.max(...treatments.map(t => t.treatmentId)) + 1
                        : 1;

                    await UpdateData(currentUserId, newTreatmentId, payload);
                    toast.success("Package added successfully");

                    // Only add to local state after successful API call - UPDATED: total equals cost
                    const newTreatment: TreatmentData = {
                        treatmentId: newTreatmentId,
                        treatmentName: values.treatmentName.trim(),
                        cost: parseFloat(values.cost),
                        status: STATUS_UI_TO_API[values.status] || values.status,
                        total: parseFloat(values.cost), // ✅ Changed: total now equals cost
                        sessions: parseInt(values.sessions),
                        duration: parseInt(values.duration),
                        quantityPerDay: parseInt(values.quantityPerDay)
                    };

                    setTreatments([...treatments, newTreatment]);
                }

                resetForm();
                setShowMedicationForm(false);
                setEditingTreatmentId(null);
            } catch (error) {
                console.error("Error processing package:", error);
                toast.error(editingTreatmentId !== null ? "Error updating package" : "Error adding package");
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
                if (field === "cost" || field === "sessions" || field === "duration" || field === "quantityPerDay") {
                    updatedValue = parseFloat(value.toString()) || 0;
                } else if (field === "status") {
                    updatedValue = STATUS_UI_TO_API[value as string] || value;
                }

                const updatedTreatment = {
                    ...treatment,
                    [field === "qty" ? "quantityPerDay" : field === "name" ? "treatmentName" : field]: updatedValue,
                };

                // UPDATED: Set total equal to cost when cost changes
                if (field === "cost") {
                    updatedTreatment.total = updatedTreatment.cost; // ✅ Changed: total now equals cost
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
                    case 'cost':
                        payload.cost = parseFloat(value.toString()) || 0;
                        // UPDATED: Set total equal to cost
                        payload.total = parseFloat(value.toString()) || 0; // ✅ Changed: total now equals cost
                        break;
                    case 'status':
                        payload.status = STATUS_UI_TO_API[value as string] || value;
                        break;
                    case 'sessions':
                        payload.sessions = parseInt(value.toString()) || 0;
                        break;
                    case 'duration':
                        payload.duration = parseInt(value.toString()) || 0;
                        break;
                    case 'quantityPerDay':
                        payload.quantityPerDay = parseInt(value.toString()) || 0;
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
        toast.success("Package removed");
    };

    // Calculate totals - UPDATED: Use cost directly instead of cost * quantityPerDay
    const totalCost = treatments.reduce((sum, treatment) =>
        sum + treatment.cost, 0); // ✅ Changed: sum cost directly
    const grandTotal = totalCost; // You can add additional charges here if needed

    // Updated: selectTreatment function to handle API data structure with new fields
    const selectTreatment = (selectedTreatment: TreatmentData): void => {
        // ... other code ...

        addTreatmentFormik.setValues({
            treatmentName: selectedTreatment.treatmentName,
            qty: selectedTreatment.quantityPerDay?.toString() || "1",
            cost: selectedTreatment.cost?.toString() || "",
            status: STATUS_API_TO_UI[selectedTreatment.status || ""] || selectedTreatment.status || "Not Started",
            sessions: selectedTreatment.sessions?.toString() || "",
            duration: selectedTreatment.duration?.toString() || "",
            // ✅ Fixed frequency mapping
            quantityPerDay: selectedTreatment.quantityPerDay?.toString() || ""
        });

        setEditingTreatmentId(selectedTreatment.treatmentId);
        setShowMedicationForm(true);
        setIsTreatmentDrawerOpen(false);
    };

    const addNewTreatment = (newTreatmentData: { treatmentName: string; cost: number }): void => {
        const newTreatmentId = treatments.length > 0
            ? Math.max(...treatments.map(t => t.treatmentId)) + 1
            : 1;

        // UPDATED: total equals cost
        const newTreatment: TreatmentData = {
            treatmentId: newTreatmentId,
            treatmentName: newTreatmentData.treatmentName,
            quantityPerDay: 1,
            cost: newTreatmentData.cost,
            status: 'NotStarted',
            total: newTreatmentData.cost, // ✅ Changed: total now equals cost
            sessions: 10,
            duration: 1,
            quantityPerDay: 2
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
            status: STATUS_API_TO_UI[treatment.status || ""] || treatment.status || "Not Started",
            sessions: treatment.sessions?.toString() || "",
            duration: treatment.duration?.toString() || "",
            quantityPerDay: treatment.quantityPerDay?.toString() || ""
        });
        setEditingTreatmentId(treatment.treatmentId);
        setShowMedicationForm(true);
    };

    return (
        <DefaultLayout>
            <div className="min-w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
                {/* Header */}
                <div className="bg-white p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <div className="flex items-center cursor-pointer">
                            <button
                                className="mr-1 sm:mr-2 p-1.5 sm:p-2 lg:p-3 rounded-lg transition-colors flex items-center hover:bg-gray-100"
                                onClick={() => router.push("/clinicpatient")}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="text-sm sm:text-md lg:text-lg font-bold text-[#333333]">Back</span>
                            </button>
                        </div>

                        <div className="flex flex-col items-center">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-blue-800">Package plan</h1>
                            <div className="w-16 sm:w-20 md:w-24 lg:w-32 border border-blue-500 mx-auto mt-1"></div>
                        </div>

                        {/* Info Button */}
                        <div className="flex items-start mt-3">
                            <div className="ml-2 bg-green-700 text-white rounded-sm w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 flex items-center justify-center cursor-pointer hover:bg-green-800 transition-colors">
                                <Tooltip content="Information about this page" position="bottom right-2">
                                    <FontAwesomeIcon
                                        icon={faInfoCircle}
                                        onClick={() => setIsDrawerOpen(true)}
                                        className="text-xs sm:text-sm lg:text-base"
                                    />
                                </Tooltip>
                            </div>

                            <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                                Package Plan Information
                            </Drawer>
                        </div>
                    </div>
                </div>

                <div className='border'>
                    {/* Clinic Header */}
                    <div className="p-3 sm:p-6 lg:p-8">
                        <div className="flex justify-center">
                            <img
                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                alt="High% Logo"
                                className="w-40 sm:w-60 md:w-80 lg:w-96 object-contain"
                            />
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="p-3 sm:p-6 lg:p-8 border-b bg-white mx-1 sm:mx-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm lg:text-base">
                            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-32 md:w-36 lg:w-40 mb-1 sm:mb-0">Client Name:</span>
                                    <span className="text-gray-700">{profileData?.fullName}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-32 md:w-36 lg:w-40 mb-1 sm:mb-0">Gender:</span>
                                    <span className="text-gray-700">{profileData?.gender}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-32 md:w-36 lg:w-40 mb-1 sm:mb-0">DOB:</span>
                                    <span className="text-gray-700">{profileData?.dob}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-32 md:w-36 lg:w-40 mb-1 sm:mb-0">Consultant Coach:</span>
                                    <span className="text-gray-700">Priyanka</span>
                                </div>
                            </div>
                            <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-20 md:w-24 lg:w-28 mb-1 sm:mb-0">HFID:</span>
                                    <span className="text-gray-700">{profileData?.hfId}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-20 md:w-24 lg:w-28 mb-1 sm:mb-0">TID:</span>
                                    <span className="text-gray-700">T5QAHYBM6</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                    <span className="font-medium w-full sm:w-20 md:w-24 lg:w-28">Mobile:</span>
                                    <input
                                        type="text"
                                        placeholder="Enter mobile number"
                                        value={profileData?.phoneNumber || ""}
                                        readOnly
                                        className="px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm border border-gray-700 focus:outline-none focus:border-blue-500 w-[120px]"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center">
                                    <span className="font-medium w-full sm:w-20 md:w-24 lg:w-28 mb-1 sm:mb-0">City:</span>
                                    <span className="text-gray-700">{profileData?.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Treatment Table Section */}
                    <div className="p-3 sm:p-6 lg:p-8">
                        <div className="bg-white">
                            <div className="flex justify-between items-center mb-4 sm:mb-6">
                                <h3 className="text-base sm:text-lg lg:text-xl font-bold">Package</h3>
                            </div>

                            {/* Desktop Table View - Hidden on mobile */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full border-t border-gray-700">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="px-2 py-3 text-left text-sm font-medium w-12 border-gray-700">S.No.</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium">Package Name</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium w-20">Sessions</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium w-24">Frequency</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium w-20">Duration</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium w-24">Cost (₹)</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium w-24">Status</th>
                                            <th className="border-l border-gray-700 px-2 py-3 text-left text-sm font-medium w-24">Total (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {treatments.map((treatment, index) => (
                                            <tr
                                                key={treatment.treatmentId}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => populateFormWithTreatment(treatment)}
                                            >
                                                <td className="px-2 py-3 text-sm text-center border-gray-700">{index + 1}</td>
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm">
                                                    <input
                                                        type="text"
                                                        value={treatment.treatmentName}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'name', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm"
                                                        placeholder="Enter treatment name"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm">
                                                    <input
                                                        type="number"
                                                        value={treatment.sessions || 0}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'sessions', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm text-center"
                                                        min="1"
                                                    />
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm">
                                                    <select
                                                        value={treatment.quantityPerDay || ''}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'quantityPerDay', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm"
                                                    >
                                                        <option value="">Select Frequency</option>
                                                        <option value="1">1 Day/week</option>
                                                        <option value="2">2 Days/week</option>
                                                        <option value="3">3 Days/week</option>
                                                    </select>
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm">
                                                    <select
                                                        value={treatment.duration || ''}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'duration', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border-none outline-none bg-transparent text-sm"
                                                    >
                                                        <option value="">Select Duration</option>
                                                        <option value="1">1 Month</option>
                                                        <option value="3">3 Months</option>
                                                        <option value="6">6 Months</option>
                                                    </select>
                                                </td>
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm">
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
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm">
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
                                                <td className="border-l border-gray-700 px-2 py-3 text-sm text-right font-medium">
                                                    ₹{treatment.cost.toFixed(2)}
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
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                        <td className="border-l border-gray-700 px-2 py-4 text-sm">&nbsp;</td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}

                                        {/* Total Row */}
                                        <tr className="border-t border-b border-gray-700 bg-gray-50">
                                            <td className="px-2 py-3 text-sm border-gray-700" colSpan={4}></td>
                                            <td className="border-l border-gray-700 px-2 py-3 text-sm font-bold" colSpan={2}>
                                                Total Cost: ₹{totalCost.toFixed(2)}
                                            </td>
                                            <td className="border-l border-gray-700 px-2 py-3 text-sm font-bold" colSpan={2}>
                                                Grand Total: ₹{grandTotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile/Tablet Card View - Visible on smaller screens */}
                            <div className="lg:hidden space-y-4">
                                {treatments.map((treatment, index) => (
                                    <div
                                        key={treatment.treatmentId}
                                        className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => populateFormWithTreatment(treatment)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                                            <span className="text-lg font-bold text-green-600">₹{treatment.cost.toFixed(2)}</span>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Package Name</label>
                                                <input
                                                    type="text"
                                                    value={treatment.treatmentName}
                                                    onChange={(e) => updateTreatment(treatment.treatmentId, 'name', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                    placeholder="Enter treatment name"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Sessions</label>
                                                    <input
                                                        type="number"
                                                        value={treatment.sessions || 0}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'sessions', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                        min="1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Cost (₹)</label>
                                                    <input
                                                        type="number"
                                                        value={treatment.cost}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'cost', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                        step="0.01"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
                                                    <select
                                                        value={treatment.quantityPerDay || ''}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'quantityPerDay', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select Frequency</option>
                                                        <option value="1">1 Day/week</option>
                                                        <option value="2">2 Days/week</option>
                                                        <option value="3">3 Days/week</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Duration</label>
                                                    <select
                                                        value={treatment.duration || ''}
                                                        onChange={(e) => updateTreatment(treatment.treatmentId, 'duration', e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Select Duration</option>
                                                        <option value="1">1 Month</option>
                                                        <option value="3">3 Months</option>
                                                        <option value="6">6 Months</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                                <select
                                                    value={STATUS_API_TO_UI[treatment.status || ""] || treatment.status || 'Not Started'}
                                                    onChange={(e) => updateTreatment(treatment.treatmentId, 'status', e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                                >
                                                    <option value="Not Started">Not Started</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Mobile Total Summary */}
                                {treatments.length > 0 && (
                                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Total Cost:</span>
                                            <span className="text-lg font-bold text-blue-600">₹{totalCost.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Grand Total:</span>
                                            <span className="text-xl font-bold text-green-600">₹{grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Treatment Form - Responsive Layout */}
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mt-6 lg:mt-8">
                            {/* Treatment Form */}
                            {showMedicationForm && (
                                <form onSubmit={addTreatmentFormik.handleSubmit} className="w-full lg:flex-1 space-y-4">
                                    {/* Mobile/Tablet: Stack all fields vertically */}
                                    <div className="space-y-4 lg:space-y-0">
                                        {/* Package Name - Full width on mobile */}
                                        <div className="w-full lg:flex lg:gap-4 lg:mb-4">
                                            <div className="flex-1 mb-4 lg:mb-0">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 lg:hidden">
                                                    Package Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="treatmentName"
                                                    placeholder="Package Name..."
                                                    value={addTreatmentFormik.values.treatmentName}
                                                    onChange={addTreatmentFormik.handleChange}
                                                    onBlur={addTreatmentFormik.handleBlur}
                                                    className={`w-full border px-3 py-2 sm:py-3 focus:outline-none focus:border-blue-500 text-sm rounded-md transition-colors ${addTreatmentFormik.touched.treatmentName && addTreatmentFormik.errors.treatmentName
                                                        ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                />
                                                {addTreatmentFormik.touched.treatmentName && addTreatmentFormik.errors.treatmentName && (
                                                    <p className="text-red-500 text-xs mt-1">{addTreatmentFormik.errors.treatmentName}</p>
                                                )}
                                            </div>

                                            <div className="w-full lg:w-1/5">
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 lg:hidden">
                                                    Sessions
                                                </label>
                                                <input
                                                    type="number"
                                                    name="sessions"
                                                    placeholder="Sessions"
                                                    value={addTreatmentFormik.values.sessions}
                                                    onChange={addTreatmentFormik.handleChange}
                                                    onBlur={addTreatmentFormik.handleBlur}
                                                    min="1"
                                                    className={`w-full border px-3 py-2 sm:py-3 focus:outline-none focus:border-blue-500 text-sm rounded-md transition-colors ${addTreatmentFormik.touched.sessions && addTreatmentFormik.errors.sessions
                                                        ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Second row - Grid layout for smaller fields */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 lg:hidden">
                                                    Frequency
                                                </label>
                                                <select
                                                    name="quantityPerDay"
                                                    value={addTreatmentFormik.values.quantityPerDay}
                                                    onChange={addTreatmentFormik.handleChange}
                                                    onBlur={addTreatmentFormik.handleBlur}
                                                    className={`w-full border px-3 py-2 sm:py-3 text-sm rounded-md focus:outline-none focus:border-blue-500 transition-colors ${addTreatmentFormik.touched.quantityPerDay && addTreatmentFormik.errors.quantityPerDay
                                                        ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <option value="">Select Frequency</option>
                                                    <option value="1">1 Day/week</option>
                                                    <option value="2">2 Days/week</option>
                                                    <option value="3">3 Days/week</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 lg:hidden">
                                                    Duration
                                                </label>
                                                <select
                                                    name="duration"
                                                    value={addTreatmentFormik.values.duration}
                                                    onChange={addTreatmentFormik.handleChange}
                                                    onBlur={addTreatmentFormik.handleBlur}
                                                    className={`w-full border px-3 py-2 sm:py-3 text-sm rounded-md focus:outline-none focus:border-blue-500 transition-colors ${addTreatmentFormik.touched.duration && addTreatmentFormik.errors.duration
                                                        ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                >
                                                    <option value="">Select Duration</option>
                                                    <option value="1">1 Month</option>
                                                    <option value="3">3 Months</option>
                                                    <option value="6">6 Months</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 lg:hidden">
                                                    Cost (₹)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="cost"
                                                    placeholder="Cost..."
                                                    value={addTreatmentFormik.values.cost}
                                                    onChange={addTreatmentFormik.handleChange}
                                                    onBlur={addTreatmentFormik.handleBlur}
                                                    step="0.01"
                                                    min="0"
                                                    className={`w-full border px-3 py-2 sm:py-3 focus:outline-none focus:border-blue-500 text-sm rounded-md transition-colors ${addTreatmentFormik.touched.cost && addTreatmentFormik.errors.cost
                                                        ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
                                                        }`}
                                                />
                                                {addTreatmentFormik.touched.cost && addTreatmentFormik.errors.cost && (
                                                    <p className="text-red-500 text-xs mt-1">{addTreatmentFormik.errors.cost}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 lg:hidden">
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    value={addTreatmentFormik.values.status}
                                                    onChange={addTreatmentFormik.handleChange}
                                                    onBlur={addTreatmentFormik.handleBlur}
                                                    className="w-full border border-gray-300 hover:border-gray-400 px-3 py-2 sm:py-3 text-sm rounded-md focus:outline-none focus:border-blue-500 transition-colors"
                                                >
                                                    <option value="Not Started">Not Started</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={addTreatmentFormik.isSubmitting}
                                            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 px-6 sm:px-8 py-2 sm:py-3 border border-yellow-500 rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
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
                                            className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 px-6 sm:px-8 py-2 sm:py-3 border border-gray-400 rounded-lg font-medium text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Add Treatment Buttons - Responsive */}
                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 w-full">
                                <button
                                    onClick={addManualTreatment}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 sm:py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                    New Package
                                </button>

                                <button
                                    onClick={openSavedPrescriptions}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                                    From Saved
                                </button>
                            </div>


                        </div>

                        {/* Doctor Signature */}
                        <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-center lg:justify-end">
                            <div className="text-center">
                                <div className="w-24 sm:w-32 lg:w-40 h-12 sm:h-16 lg:h-20 border-b border-gray-300 mb-2 flex items-end justify-center">
                                    <span className="text-blue-600 font-script text-sm sm:text-lg lg:text-xl mb-2">Priyanka</span>
                                </div>
                                <p className="text-xs sm:text-sm lg:text-base font-medium">Priyanka</p>
                            </div>
                        </div>
                    </div>

                    <div className='border border-black mx-1 sm:mx-3'></div>

                    {/* Footer */}
                    <div className="p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row justify-between text-xs sm:text-sm lg:text-base text-gray-600 gap-2">
                        <span>www.high5performance.in</span>
                        <span>www.hfiles.in</span>
                    </div>
                </div>

                {/* Save Button */}
                <div className="p-3 sm:p-4 lg:p-6 flex justify-center lg:justify-end">
                    <button
                        disabled={isSaving || treatments.length === 0}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-lg font-medium text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                        onClick={async () => {
                            setIsSaving(true);
                            try {
                                // Get required IDs
                                const extractedHfid = searchParams.get("hfid");
                                const extractedVisitId = searchParams.get("visitId");
                                const extractedPatientId = searchParams.get('patientId');

                                if (!currentUserId) {
                                    toast.error("High5 ID not found");
                                    return;
                                }

                                if (!extractedPatientId) {
                                    toast.error("Client ID not found");
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

                                // Prepare the treatment data in the required format with new fields
                                const treatmentPlanData = {
                                    patient: {
                                        name: profileData?.fullName || "",
                                        hfid: profileData?.hfId || extractedHfid,
                                        gender: profileData?.gender || "",
                                        tid: "T5QAHYBM6", // You might want to get this from profileData if available
                                        dob: profileData?.dob || "",
                                        mobile: profileData?.phoneNumber || "",
                                        doctor: "Priyanka",
                                        city: profileData?.city || ""
                                    },
                                    treatments: treatments.map(treatment => ({
                                        name: treatment.treatmentName,
                                        qtyPerDay: `${treatment.quantityPerDay || 1} QTY`,
                                        sessions: treatment.sessions || 0,
                                        frequency: treatment.frequency === 2 ? "2 Days/week" : treatment.frequency === 3 ? "3 Days/week" : "",
                                        duration: treatment.duration === 1 ? "1 Month" : treatment.duration === 3 ? "3 Months" : treatment.duration === 6 ? "6 Months" : "",
                                        cost: treatment.cost,
                                        status: STATUS_API_TO_UI[treatment.status || ""] || treatment.status || "Not started",
                                        total: treatment.cost // ✅ Changed: total now equals cost
                                    })),
                                    totalCost: totalCost,
                                    grandTotal: grandTotal,
                                    clinicInfo: {
                                        name: "High5",
                                        subtitle: "Performance & Rehab",
                                        website: "www.high5performance.in"
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
                            <div className="flex items-center justify-center">
                                <span className="mr-2">⏳</span>
                                Saving...
                            </div>
                        ) : (
                            "Save Package Plan"
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