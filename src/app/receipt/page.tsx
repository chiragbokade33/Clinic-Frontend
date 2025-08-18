'use client'
import React, { useState } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../components/Tooltip';
import Drawer from '../components/clinicInfoDrawer';

const page = () => {
    const [treatments, setTreatments] = useState([
        { id: 1, Date: 'Mar', ReceiptNumber: 'RC3668', ModeOfPayment: "Cash", ChequeNo: "--", AmountPaidINR: "1000.0" },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [newReceipt, setNewReceipt] = useState({
        date: '',
        number: '',
        mode: '',
        amount: '',
        remarks: ''
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

    const handleAddReceipt = () => {
        if (newReceipt.number && newReceipt.amount && newReceipt.mode) {
            const newReceiptEntry = {
                id: treatments.length + 1,
                Date: newReceipt.date ? new Date(newReceipt.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short'
                }) : '',
                ReceiptNumber: newReceipt.number,
                ModeOfPayment: newReceipt.mode,
                ChequeNo: newReceipt.mode === 'cheque' ? 'CHQ001' : "--",
                AmountPaidINR: newReceipt.amount
            };

            setTreatments([...treatments, newReceiptEntry]);

            // Console log the data as requested
            console.log('New Receipt Added:', newReceiptEntry);
            console.log('All Receipts:', [...treatments, newReceiptEntry]);
            console.log('Form Data:', formData);

            // Reset form
            setNewReceipt({
                date: '',
                number: '',
                mode: '',
                amount: '',
                remarks: ''
            });

            setShowForm(false);
        } else {
            alert('Please fill in all required fields (Receipt Number, Amount, and Payment Mode)');
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
                            <h1 className="text-xl sm:text-2xl font-bold text-blue-800">Receipt</h1>
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
                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                alt="ARTHROSE Logo"
                                className="w-40 sm:w-40 object-contain"
                            />
                        </div>

                        {/* Patient Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="font-semibold w-24">Patient Name :</span>
                                    <span>KAURESH WAGH</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-24">Gender :</span>
                                    <span>Male ●</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-24">DOB :</span>
                                    <span>29 - 01 - 2025</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-24">Date :</span>
                                    <span>31 - 03 - 2025</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="font-semibold w-16">UHID :</span>
                                    <span>P20032502</span>
                                </div>
                                <div className="flex">
                                    <span className="font-semibold w-20">RECEIPTID :</span>
                                    <span>T50AHYBM6</span>
                                </div>
                                <div className="flex items-center mb-3">
                                    <label className="font-semibold w-20">Mobile :</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Mobile Number"
                                        value={formData.mobile}
                                        onChange={(e) => handleInputChange("mobile", e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md 
                                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex">
                                    <span className="font-semibold w-16">City :</span>
                                    <span>Pen</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='border border-black mx-auto'></div>
                    {/* Invoice Table */}
                    <div className="mb-6 mt-3">
                        {/* Heading */}
                        <h3 className="text-center font-bold mb-4">Receipt</h3>

                        {/* Receipt Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-t border-b border-gray-400">
                                <thead>
                                    <tr className="border-b border-gray-400 bg-white">
                                        <th className="p-2 text-left text-sm">Date</th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Receipt Number
                                        </th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Mode Of Payment
                                        </th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Cheque No.
                                        </th>
                                        <th className="border-l border-gray-400 p-2 text-left text-sm">
                                            Amount Paid INR
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {treatments.map((treatment) => (
                                        <tr key={treatment.id}>
                                            <td className="p-2 text-sm">{treatment.Date}</td>
                                            <td className="border-l border-gray-400 p-2 text-sm">
                                                {treatment.ReceiptNumber}
                                            </td>
                                            <td className="border-l border-gray-400 p-2 text-sm">
                                                {treatment.ModeOfPayment}
                                            </td>
                                            <td className="border-l border-gray-400 p-2 text-sm">
                                                {treatment.ChequeNo || "--"}
                                            </td>
                                            <td className="border-l border-gray-400 p-2 text-sm">
                                                {treatment.AmountPaidINR}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Section */}
                        <div className="mt-6 text-left text-sm space-y-2">
                            <p>
                                Received with thanks from{" "}
                                <span className="font-bold">Kalpesh Wagh</span>
                            </p>
                            <p>
                                The sum of Rupees : One Thousand Only{" "}
                                <span className="font-bold">(1000.0) /-</span>
                            </p>
                        </div>
                    </div>

                    {/* Add Treatment Form */}
                    <div className="mb-6 p-4 mt-3">
                        <div
                            className={`flex ${showForm ? "justify-between" : "justify-end"
                                } items-start`}
                        >
                            {/* Show form only if true */}
                            {showForm && (
                                <div className="w-full md:w-3/4">
                                    {/* Row 1: Date + Receipt Number */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="date"
                                            value={newReceipt.date}
                                            onChange={(e) =>
                                                setNewReceipt({ ...newReceipt, date: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Receipt Number . . ."
                                            value={newReceipt.number}
                                            onChange={(e) =>
                                                setNewReceipt({ ...newReceipt, number: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                    </div>

                                    {/* Row 2: Payment Mode + Amount */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <select
                                            value={newReceipt.mode}
                                            onChange={(e) =>
                                                setNewReceipt({ ...newReceipt, mode: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        >
                                            <option value="">Select Payment Mode</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Card">Card</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>

                                        <input
                                            type="number"
                                            placeholder="Amount Paid . . ."
                                            value={newReceipt.amount}
                                            onChange={(e) =>
                                                setNewReceipt({ ...newReceipt, amount: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                    </div>

                                    {/* Row 3: Remarks */}
                                    <div className="mb-4">
                                        <textarea
                                            placeholder="Remarks . . ."
                                            value={newReceipt.remarks}
                                            onChange={(e) =>
                                                setNewReceipt({ ...newReceipt, remarks: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                    </div>

                                    {/* Add Button */}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleAddReceipt}
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
                                    onClick={() => setShowForm(true)}
                                    className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded text-sm"
                                >
                                    fill Receipt
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
                        className="primary text-white font-semibold py-3 px-8 rounded text-sm"
                        onClick={() => {
                            console.log('Save button clicked');
                            console.log('All treatments/receipts:', treatments);
                            console.log('Form data:', formData);
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default page;