'use client'
import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import Tooltip from '../components/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Drawer from '../components/clinicInfoDrawer';

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
            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                timing: '',
                instruction: ''
            });
        }
    };

    return (
        <DefaultLayout>
            <div className="max-w-7xl mx-auto ">
                {/* Header */}
                <div className="bg-white p-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <div className="flex items-center space-x-2">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-600">Back</span>
                        </div>

                        <div className="flex flex-col items-start">
                            <h1 className="text-2xl font-bold text-blue-800">Prescription</h1>
                            <div className="w-24 border border-blue-500 mx-auto mt-1"></div>
                        </div>


                        {/* Info Button */}
                        <div className="flex items-start mt-3">
                            <div className="ml-2 bg-green-700 text-white rounded-sm w-8 h-8 flex items-center justify-center cursor-pointer">
                                <Tooltip content="Information about this page" position="bottom right-2">
                                    <FontAwesomeIcon icon={faInfoCircle} onClick={() => setIsDrawerOpen(true)} />
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
                    <div className="p-6">
                        <div className="flex justify-center">
                            <img
                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                alt="ARTHROSE Logo"
                                className="w-80 object-contain"
                            />
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="p-6 border-b bg-white mx-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="font-medium w-32">Patient Name:</span>
                                    <span>KALPESH WAGH</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium w-32">Gender:</span>
                                    <span>Male ●</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium w-32">DOB:</span>
                                    <span>29 - 03 - 2025</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium w-32">Counsultant Doctor:</span>
                                    <span>Dr. Varun R Kunte</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex">
                                    <span className="font-medium w-20">UHID:</span>
                                    <span>P20032502</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium w-20">PRID:</span>
                                    <span>T5QAHYBM6</span>
                                </div>
                               <div className="flex items-center">
                                <span className="font-medium w-20">Mobile:</span>
                                <input
                                    type="text"
                                    placeholder="Enter mobile number"
                                    className="px-2 py-1 rounded text-xs border border-gray-700 focus:outline-none"
                                />
                                </div>

                                <div className="flex">
                                    <span className="font-medium w-20">City:</span>
                                    <span>Pen</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prescription Table */}
                    <div className="p-6">
                        <h3 className="text-lg font-bold mb-4">Prescription</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full border-t border-b border-gray-400">
                                <thead>
                                    <tr className="text-left">
                                        <th className="p-3 border-b border-gray-400 w-16">S.No.</th>
                                        <th className="p-3 border-b border-l border-gray-400">Medication</th>
                                        <th className="p-3 border-b border-l border-gray-400 w-24">Dosage</th>
                                        <th className="p-3 border-b border-l border-gray-400 w-32">Frequency</th>
                                        <th className="p-3 border-b border-l border-gray-400 w-32">Timing</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.map((med) => (
                                        <tr key={med.sno} className="align-top">
                                            <td className="p-3 border-t border-gray-400 text-center">{med.sno}</td>
                                            <td className="p-3 border-t border-l border-gray-400">
                                                <div className="font-medium">{med.medication}</div>
                                                {med.description && (
                                                    <div className="text-xs text-gray-500 mt-1">{med.description}</div>
                                                )}
                                            </td>
                                            <td className="p-3 border-t border-l border-gray-400">{med.dosage}</td>
                                            <td className="p-3 border-t border-l border-gray-400">{med.frequency}</td>
                                            <td className="p-3 border-t border-l  border-gray-400">{med.timing}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                        {/* Add Medication Form */}
                        <div className="mt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <input
                                    type="text"
                                    placeholder="Medication name..."
                                    value={newMedication.name}
                                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                                    className="flex-1 border border-gray-500  px-3 py-2 mr-4 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    onClick={handleAddMedication}
                                    className="bg-yellow-300 hover:bg-yellow-500 px-6 py-2 rounded-lg font-medium text-sm"
                                >
                                    Add Medication
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Dosage..."
                                    value={newMedication.dosage}
                                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                                    className="border border-gray-500  px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Frequency..."
                                    value={newMedication.frequency}
                                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                    className="border border-gray-500  px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="text"
                                    placeholder="Timing..."
                                    value={newMedication.timing}
                                    onChange={(e) => setNewMedication({ ...newMedication, timing: e.target.value })}
                                    className="border border-gray-500  px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <textarea
                                placeholder="Instruction"
                                value={newMedication.instruction}
                                onChange={(e) => setNewMedication({ ...newMedication, instruction: e.target.value })}
                                className="w-full border border-gray-500  px-3 py-2 h-20 resize-none focus:outline-none focus:border-blue-500"
                            />

                            <div className="flex justify-center">
                                <button
                                    onClick={handleAddMedication}
                                    className="bg-yellow px-8 py-2 border border-black rounded-lg font-medium"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Doctor Signature */}
                        <div className="mt-12 flex justify-end">
                            <div className="text-center">
                                <div className="w-32 h-16 border-b border-gray-300 mb-2 flex items-end justify-center">
                                    <span className="text-blue-600 font-script text-lg mb-2">Dr. Varun R Kunte</span>
                                </div>
                                <p className="text-sm font-medium">Dr. Varun R Kunte</p>
                            </div>
                        </div>
                    </div>
                    <div className='border border-black mx-3'></div>
                    {/* Footer */}
                    <div className=" p-4 flex justify-between text-sm text-gray-600">
                        <span>www.arthrosetmjindia.com</span>
                        <span>www.hfiles.in</span>
                    </div>
                </div>



                {/* Save Button */}
                <div className="p-4 flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium">
                        Save
                    </button>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default PrescriptionForm;