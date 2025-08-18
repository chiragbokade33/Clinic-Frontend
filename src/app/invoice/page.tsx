'use client'
import React, { useState } from 'react';
import DefaultLayout from '../components/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../components/Tooltip';
import Drawer from '../components/clinicInfoDrawer';

const Invoice = () => {
    const [treatments, setTreatments] = useState([
        { id: 1, service: 'Arthrose Functional screening', qty: '1 QTY', cost: 35000.0, total: 35000.0 },
        { id: 2, service: 'TMJ Orthotic', qty: '1 QTY', cost: 95000.0, total: 95000.0 }
    ]);
    const [showForm, setShowForm] = useState(false);
    const [newTreatment, setNewTreatment] = useState({
        name: '',
        qty: '',
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


    const totalCost = treatments.reduce((sum, item) => sum + item.total, 0);

    const handleAddTreatment = () => {
        if (newTreatment.name && newTreatment.cost) {
            const cost = parseFloat(newTreatment.cost) || 0;
            const qty = newTreatment.qty || '1 QTY';
            const total = cost;

            setTreatments([...treatments, {
                id: treatments.length + 1,
                service: newTreatment.name,
                qty: qty,
                cost: cost,
                total: total
            }]);

            setNewTreatment({ name: '', qty: '', cost: '', total: '' });
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
                                    <span className="font-semibold w-16">INVID :</span>
                                    <span>INV3147</span>
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
                                    {treatments.map((treatment, index) => (
                                        <tr key={treatment.id} className="">
                                            <td className="p-2 text-sm">{index + 1}</td>
                                            <td className="  p-2 text-sm">
                                                {treatment.service}
                                            </td>
                                            <td className="  p-2 text-sm">
                                                {treatment.qty}
                                            </td>
                                            <td className="  p-2 text-sm">
                                                {treatment.cost.toFixed(1)}
                                            </td>
                                            <td className="  p-2 text-sm">
                                                {treatment.total.toFixed(1)}
                                            </td>
                                        </tr>
                                    ))}
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
                            <div>
                                <span className="font-semibold">Balance : ₹0.0</span>
                            </div>
                        </div>
                    </div>
                    <div className='border border-black mx-auto'></div>

                    {/* Add Treatment Form */}

                    <div className="mb-6 p-4 mt-3">
                        <div
                            className={`flex ${showForm ? "justify-between" : "justify-end"
                                } items-start`}
                        >
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
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Qty / Day"
                                            value={newTreatment.qty}
                                            onChange={(e) =>
                                                setNewTreatment({ ...newTreatment, qty: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                    </div>

                                    {/* Row 2: Cost + Total */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <input
                                            type="number"
                                            placeholder="Cost . . ."
                                            value={newTreatment.cost}
                                            onChange={(e) =>
                                                setNewTreatment({ ...newTreatment, cost: e.target.value })
                                            }
                                            className="border border-gray-400  p-2 text-sm w-full"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Total . . ."
                                            value={newTreatment.total}
                                            readOnly
                                            className="border border-gray-400  p-2 text-sm w-full"
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
                                    onClick={() => {
                                        handleAddTreatment();
                                        setShowForm(true);
                                    }}
                                    className="bg-yellow-300 hover:bg-yellow-400 text-black font-semibold py-2 px-6 rounded text-sm"
                                >
                                    Enter Billing Info
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
                    <button className="primary text-white font-semibold py-3 px-8 rounded text-sm">
                        Save
                    </button>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default Invoice;