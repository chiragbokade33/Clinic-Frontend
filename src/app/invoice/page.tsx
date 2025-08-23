'use client'
import React, { useEffect, useState } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../components/Tooltip';
import Drawer from '../components/clinicInfoDrawer';
import { JsonAdded, ListJsondata, ListProfile } from '../services/ClinicServiceApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserId } from '../hooks/GetitemsLocal';
import { toast, ToastContainer } from 'react-toastify';

// Updated type to match your actual data structure
type Treatment = {
    name: string;
    qtyPerDay: string;
    cost: number;
    status: string;
    total: number;
};

const Invoice = () => {
    const [showForm, setShowForm] = useState(false);
    const [newTreatment, setNewTreatment] = useState({
        name: '',
        qtyPerDay: '',
        cost: '',
        total: ''
    });

    const [formData, setFormData] = useState({
        mobile: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [profileData, setProfileData] = useState() as any;
    const searchParams = useSearchParams();
    const [treatmentData, setTreatmentData] = useState<Treatment[]>([]);
    const [isSaving, setIsSaving] = useState(false);
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
            }
        };

        listDataProfile();
    }, [searchParams]);

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        const FetchDatajson = async () => {
            const extractedHfid = searchParams.get("hfid");
            const extractedLastVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get('patientId');
            if (!extractedHfid) return;
            const id = await getUserId();
            setCurrentUserId(id);
            try {
                const response = await ListJsondata(id, extractedPatientId, extractedLastVisitId);
                const apiData = response.data.data;

                // Find Treatment type
                const treatmentEntry = apiData.find((item: { type: string; }) => item.type === "Treatment");
                if (treatmentEntry) {
                    const parsed = JSON.parse(treatmentEntry.jsonData);
                    setTreatmentData(parsed.treatments || []);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        FetchDatajson();
    }, [searchParams]);


    // Fixed totalCost calculation with proper null checking
    const totalCost = treatmentData.reduce((sum, item) => sum + (item.total || 0), 0);

    // Fixed handleAddTreatment function
    const handleAddTreatment = () => {
        if (newTreatment.name && newTreatment.cost) {
            const cost = parseFloat(newTreatment.cost) || 0;
            const qtyPerDay = newTreatment.qtyPerDay || '1 QTY';
            const total = cost;

            const newTreatmentItem: Treatment = {
                name: newTreatment.name,
                qtyPerDay: qtyPerDay,
                cost: cost,
                status: "Not Started",
                total: total
            };

            setTreatmentData([...treatmentData, newTreatmentItem]);
            setNewTreatment({ name: '', qtyPerDay: '', cost: '', total: '' });
        }
    };

    const handleSaveInvoice = async () => {
        try {
            setIsSaving(true);

            // Get URL parameters
            const extractedHfid = searchParams.get("hfid");
            const extractedLastVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get('patientId');

            if (!extractedPatientId || !extractedLastVisitId || !currentUserId) {
                alert("Missing required parameters");
                return;
            }

            // Create invoice JSON data
            const invoiceData = {
                patient: {
                    name: profileData?.fullName || "",
                    hfid: profileData?.hfId || "",
                    gender: profileData?.gender || "",
                    invid: "INV3147", // You might want to generate this dynamically
                    dob: profileData?.dob || "",
                    date: new Date().toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    }),
                    mobile: profileData?.phoneNumber || "",
                    city: profileData?.city || ""
                },
                services: treatmentData.map(treatment => ({
                    name: treatment.name,
                    qtyPerDay: treatment.qtyPerDay,
                    cost: treatment.cost,
                    total: treatment.total
                })),
                totalCost: totalCost,
                grandTotal: totalCost,
                paid: totalCost,
                clinicInfo: {
                    name: "ARTHROSE",
                    subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                    website: "www.arthrosetmjindia.com"
                }
            };

            // Create API payload
            const payload = {
                clinicId: currentUserId,
                patientId: parseInt(extractedPatientId),
                clinicVisitId: parseInt(extractedLastVisitId),
                type: "Invoice",
                jsonData: JSON.stringify(invoiceData)
            };

            console.log("Saving invoice with payload:", payload);

            // Call the API
            const response = await JsonAdded(payload);

            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.message)
                router.push(`/clinicpatient`);
            } else {
            }

        } catch (error) {
            console.error("Error saving invoice:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DefaultLayout>
            <div className="w-full max-w-4xl mx-auto p-4 bg-white min-h-screen">
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
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Invoice</h1>
                            <div className="w-20 sm:w-15 border border-blue-500 mx-auto mt-1"></div>
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
                <div className='border border-black p-2'>

                    {/* Clinic Header */}
                    <div className="p-6 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <img
                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                alt="ARTHROSE Logo"
                                className="w-40 sm:w-40 object-contain"
                            />
                        </div>

                        {/* Patient Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="font-semibold w-24">Patient Name :</span>
                                    <span>{profileData?.fullName}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-24">Gender :</span>
                                    <span>{profileData?.gender}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-24">DOB :</span>
                                    <span>{profileData?.dob}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-24">Date :</span>
                                    <span> {new Date().toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                    })}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="font-semibold w-16">HFID :</span>
                                    <span>{profileData?.hfId}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-16">INVID :</span>
                                    <span>INV3147</span>
                                </div>
                                <div className="flex items-center mb-3">
                                    <label className="font-semibold w-20">Mobile :</label>
                                    <input
                                        type="text"
                                        placeholder="Enter mobile number"
                                        value={profileData?.phoneNumber || ""}
                                        readOnly
                                        className="px-2 py-1 rounded text-xs border border-gray-700 focus:outline-none w-full sm:w-auto"
                                    />
                                </div>

                                <div className="flex">
                                    <span className="font-semibold w-16">City :</span>
                                    <span>{profileData?.city}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='border border-black mx-auto'></div>

                    {/* Fixed Invoice Table */}
                    <div className="mb-6 mt-3">
                        <h3 className="text-center font-bold mb-4">Invoice</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full border-t border-b border-gray-400">
                                <thead>
                                    <tr className="border-b border-gray-400 bg-white">
                                        <th className="p-2 text-left text-sm">S.No.</th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Service/Product
                                        </th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Qty/Day
                                        </th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Cost (₹)
                                        </th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Total (₹)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {treatmentData && treatmentData.length > 0 ? (
                                        treatmentData.map((treatment, index) => (
                                            <tr key={`treatment-${index}`} className="">
                                                <td className="p-2 text-sm">{index + 1}</td>
                                                <td className="border-l border-gray-400 p-2 text-sm">
                                                    {treatment.name}
                                                </td>
                                                <td className="border-l border-gray-400 p-2 text-sm">
                                                    {treatment.qtyPerDay}
                                                </td>
                                                <td className="border-l border-gray-400 p-2 text-sm">
                                                    {treatment.cost.toFixed(1)}
                                                </td>
                                                <td className="border-l border-gray-400 p-2 text-sm">
                                                    {treatment.total.toFixed(1)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-500">
                                                No treatments available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="mt-4 text-right text-sm space-y-1">
                            <div>
                                <span className="font-semibold">Total Cost : ₹{totalCost.toFixed(1)}</span>
                                <span className="ml-8 font-semibold">Grand Total : ₹{totalCost.toFixed(1)}</span>
                            </div>
                            <div className="text-green-600">
                                <span className="font-semibold">Paid : ₹{totalCost.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className='border border-black mx-auto'></div>

                    {/* Fixed Add Treatment Form */}
                    <div className="mb-6 p-4 mt-3">
                        <div className={`flex ${showForm ? "justify-between" : "justify-end"} items-start`}>
                            {/* Show form only if true */}
                            {showForm && (
                                <div className="w-full md:w-3/4">
                                    {/* Row 1: Treatment Name + Qty/Day */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="text"
                                            placeholder="Treatment Name . . ."
                                            value={newTreatment.name}
                                            onChange={(e) =>
                                                setNewTreatment({ ...newTreatment, name: e.target.value })
                                            }
                                            className="border border-gray-400 p-2 text-sm w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Qty / Day"
                                            value={newTreatment.qtyPerDay}
                                            onChange={(e) =>
                                                setNewTreatment({ ...newTreatment, qtyPerDay: e.target.value })
                                            }
                                            className="border border-gray-400 p-2 text-sm w-full"
                                        />
                                    </div>

                                    {/* Row 2: Cost + Total */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="number"
                                            placeholder="Cost . . ."
                                            value={newTreatment.cost}
                                            onChange={(e) =>
                                                setNewTreatment({
                                                    ...newTreatment,
                                                    cost: e.target.value,
                                                    total: e.target.value // Auto-calculate total
                                                })
                                            }
                                            className="border border-gray-400 p-2 text-sm w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Total . . ."
                                            value={newTreatment.cost || newTreatment.total}
                                            readOnly
                                            className="border border-gray-400 p-2 text-sm w-full bg-gray-100"
                                        />
                                    </div>

                                    {/* Add Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddTreatment}
                                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Billing Info Button */}
                            <div>
                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded text-sm"
                                >
                                    {showForm ? 'Hide Form' : 'Enter Billing Info'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Signature */}
                    <div className="mt-2 sm:mt-2 flex justify-end mb-3">
                        <div className="text-center">
                            <div className="w-24 sm:w-32 h-12 sm:h-16 border-b border-gray-300 mb-2 flex items-end justify-center">
                                <span className="text-blue-600 font-script text-sm sm:text-lg mb-2">Dr. Varun R Kunte</span>
                            </div>
                            <p className="text-xs sm:text-sm font-medium">Dr. Varun R Kunte</p>
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
                <div className="text-end mt-3">
                    <button
                        onClick={handleSaveInvoice}
                        disabled={isSaving}
                        className="primary text-white font-semibold py-3 px-8 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
            <ToastContainer />
        </DefaultLayout>
    );
};

export default Invoice;