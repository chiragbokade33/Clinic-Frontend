'use client'
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserId } from '../hooks/GetitemsLocal';
import { ListMedical } from '../services/ClinicServiceApi';

const MedicalProfile = () => {
    const [expandedSections, setExpandedSections] = useState({
        medicalBackground: false
    });
    const router = useRouter();

    const [currentUserId, setCurrentUserId] = useState<number>();
    const searchParams = useSearchParams(); // Hook to get query parameters

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);

    useEffect(() => {
        const HistoryMedical = async () => {
            const extractedPatientId = searchParams.get('patientId');
            const id = await getUserId();
            setCurrentUserId(id);
            try {
                const response = await ListMedical(id, Number(extractedPatientId))
                console.log(response.data.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        HistoryMedical();
    }, []);

    const [patientData, setPatientData] = useState({
        name: 'Ankit k.',
        hfid: 'HF010125ANK1312',
        bloodGroup: 'A+',
        weight: 65,
        height: { feet: 5, inches: 7 },
        smoking: false,
        alcohol: true,
        exercise: false,
        caffeine: true,
        allergies: {
            nuts: false,
            milk: false,
            chocolate: true,
            fish: false,
            shellfish: false,
            dust: false,
            latex: false,
            pollen: false
        },
        medicalHistory: {
            diabetes: { self: false, mother: false, father: true },
            cancer: { self: false, mother: false, father: true },
            thyroid: { self: false, mother: false, father: true },
            bloodPressure: { self: false, mother: false, father: true },
            cholesterol: { self: false, mother: false, father: true }
        }
    });

    const [historyList, setHistoryList] = useState([
        {
            surgeryName: "Appendectomy",
            surgeryDate: "15-03-2020",
            hospitalName: "City General Hospital",
            doctorName: "Dr. Rajesh Sharma"
        },
        {
            surgeryName: "Gallbladder Removal",
            surgeryDate: "22-08-2021",
            hospitalName: "Apollo Medical Center",
            doctorName: "Dr. Priya Mehta"
        },
        {
            surgeryName: "Knee Arthroscopy",
            surgeryDate: "10-12-2022",
            hospitalName: "Fortis Healthcare",
            doctorName: "Dr. Amit Patel"
        },
        {
            surgeryName: "Cataract Surgery",
            surgeryDate: "05-06-2023",
            hospitalName: "Max Super Speciality Hospital",
            doctorName: "Dr. Sunita Gupta"
        }
    ]);

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const updateAllergyStatus = (allergyType, status) => {
        setPatientData(prev => ({
            ...prev,
            allergies: {
                ...prev.allergies,
                [allergyType]: status
            }
        }));
    };

    const RadioButton = ({ checked, onChange, color = 'blue' }) => (
        <div
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${checked
                ? color === 'yellow'
                    ? 'border-yellow-400 bg-yellow-400'
                    : 'border-blue-500 bg-blue-500'
                : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
            onClick={onChange}
        >
            {checked && (
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${color === 'yellow' ? 'bg-yellow-600' : 'bg-white'}`} />
            )}
        </div>
    );

    return (
        <DefaultLayout>
            <div className="w-full  mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                {/* Back Button */}
                <button
                    className="text-[#333333] font-bold text-sm sm:text-base cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => router.push("/dashboard")}
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="w-2 h-2 sm:w-3 sm:h-3 mr-2" /> Back
                </button>

                {/* Main Content - Stack on mobile, side by side on larger screens */}
                <div className='flex flex-col xl:flex-row gap-4 sm:gap-6'>
                    {/* Main Profile Card */}
                    <div className="relative flex flex-col w-full  border bg-blue-50 p-3 sm:p-4 md:p-6 rounded-lg shadow-md">
                        {/* HFID Badge */}
                        <div className="absolute top-0 right-0 bg-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-bl-lg font-semibold shadow">
                            {patientData.hfid}
                        </div>

                        {/* Top section - Stack on mobile, flex on larger screens */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mt-6 sm:mt-0">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <img
                                    src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                                    alt="Profile"
                                    className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
                                />
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 w-full text-center sm:text-left">
                                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-800 mb-3 sm:mb-4">
                                    {patientData.name}
                                </h2>

                                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                                    {/* Blood Group */}
                                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                                        <span className="font-medium mb-1 sm:mb-0 sm:mr-4">Blood Group:</span>
                                        <span className="border border-gray-300 px-3 py-1 rounded bg-white text-center min-w-[60px]">
                                            {patientData.bloodGroup}
                                        </span>
                                    </div>

                                    {/* Weight */}
                                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                                        <span className="font-medium mb-1 sm:mb-0 sm:mr-4">Weight:</span>
                                        <div className="flex items-center">
                                            <span className="border border-gray-300 px-3 py-1 rounded bg-white text-center min-w-[60px]">
                                                {patientData.weight}
                                            </span>
                                            <span className="ml-1">Kg</span>
                                        </div>
                                    </div>

                                    {/* Height */}
                                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start">
                                        <span className="font-medium mb-1 sm:mb-0 sm:mr-4">Height:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="border border-gray-300 px-3 py-1 rounded bg-white text-center min-w-[50px]">
                                                {patientData.height.feet}
                                            </span>
                                            <span className="text-xs sm:text-sm">Feet</span>
                                            <span className="border border-gray-300 px-3 py-1 rounded bg-white text-center min-w-[50px]">
                                                {patientData.height.inches}
                                            </span>
                                            <span className="text-xs sm:text-sm">Inch</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lifestyle Section */}
                        <div className="mt-6 space-y-3 sm:space-y-6">
                            {/* Smoking */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <span className="font-semibold text-sm sm:text-base text-center sm:text-left">Do You Smoke?</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">Yes</span>
                                        <RadioButton
                                            checked={patientData.smoking}
                                            onChange={() => setPatientData(prev => ({ ...prev, smoking: true }))}
                                        />
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">No</span>
                                        <RadioButton
                                            checked={!patientData.smoking}
                                            onChange={() => setPatientData(prev => ({ ...prev, smoking: false }))}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Alcohol */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <span className="font-semibold text-sm sm:text-base text-center sm:text-left">Do You Consume Alcohol?</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">Yes</span>
                                        <RadioButton
                                            checked={patientData.alcohol}
                                            onChange={() => setPatientData(prev => ({ ...prev, alcohol: true }))}
                                            color="yellow"
                                        />
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">No</span>
                                        <RadioButton
                                            checked={!patientData.alcohol}
                                            onChange={() => setPatientData(prev => ({ ...prev, alcohol: false }))}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Exercise */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <span className="font-semibold text-sm sm:text-base text-center sm:text-left">Do You Exercise Regularly?</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">Yes</span>
                                        <RadioButton
                                            checked={patientData.exercise}
                                            onChange={() => setPatientData(prev => ({ ...prev, exercise: true }))}
                                            color="yellow"
                                        />
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">No</span>
                                        <RadioButton
                                            checked={!patientData.exercise}
                                            onChange={() => setPatientData(prev => ({ ...prev, exercise: false }))}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Caffeine */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                                <span className="font-semibold text-sm sm:text-base text-center sm:text-left">Do You Consume Caffeine?</span>
                                <div className="flex gap-4 sm:gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">Yes</span>
                                        <RadioButton
                                            checked={patientData.caffeine}
                                            onChange={() => setPatientData(prev => ({ ...prev, caffeine: true }))}
                                            color="yellow"
                                        />
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <span className="mr-2 text-sm">No</span>
                                        <RadioButton
                                            checked={!patientData.caffeine}
                                            onChange={() => setPatientData(prev => ({ ...prev, caffeine: false }))}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Allergies Section */}
                    <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 border border-black w-full ">
                        {/* Title */}
                        <div className="text-center mb-4">
                            <div className="font-bold text-blue-800 text-base sm:text-lg md:text-xl">
                                Are You Allergic to any of These?
                            </div>
                            <div className="border border-blue-800 w-1/3 sm:w-1/4 mx-auto mt-2"></div>
                        </div>

                        {/* Header Row */}
                        <div className="grid grid-cols-3 text-xs sm:text-sm font-medium bg-[#ACEDFF] rounded-md py-2 px-2 sm:px-3 border border-black mb-2">
                            <span>Type</span>
                            <span className="text-center">Yes</span>
                            <span className="text-center">No</span>
                        </div>

                        {/* Allergy Rows */}
                        <div className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
                            {Object.entries(patientData.allergies).map(([allergyType, isAllergic]) => (
                                <div
                                    key={allergyType}
                                    className="grid grid-cols-3 items-center py-2 sm:py-3 px-2 sm:px-3 text-xs sm:text-sm hover:bg-gray-50"
                                >
                                    <span className="capitalize font-medium">{allergyType}</span>
                                    <div className="flex justify-center">
                                        <RadioButton
                                            checked={isAllergic}
                                            onChange={() => updateAllergyStatus(allergyType, true)}
                                            color={allergyType === "chocolate" ? "yellow" : "blue"}
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <RadioButton
                                            checked={!isAllergic}
                                            onChange={() => updateAllergyStatus(allergyType, false)}
                                            color="blue"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Surgery Details - Mobile Card Layout / Desktop Table */}
                <div className="p-3 sm:p-4 border-b">
                    <h3 className="text-lg sm:text-xl font-bold text-blue-800 text-center">Surgery History</h3>
                </div>
                <div className="bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm">

                    {/* Mobile Cards (visible on small screens) */}
                    <div className="block lg:hidden">
                        {historyList.map((item, index) => (
                            <div key={index} className={`p-4 border-b border-gray-200 last:border-b-0 `}>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-blue-800">{item.surgeryName}</span>
                                        <span className="text-xs text-gray-600 ml-2">
                                            {item.surgeryDate
                                                ? new Date(item.surgeryDate.split("-").reverse().join("-"))
                                                    .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                                : "—"}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div className="mb-1">
                                            <span className="font-medium">Hospital:</span> {item.hospitalName || "—"}
                                        </div>
                                        <div>
                                            <span className="font-medium">Doctor:</span> {item.doctorName || "—"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table (visible on large screens) */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#ACEDFF] text-gray-800">
                                <tr>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Surgery Name</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Surgery Date</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Hospital Name</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Doctor Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyList.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`border-t hover:bg-blue-50 `}
                                    >
                                        <td className="p-3 sm:p-4 text-sm font-medium">{item.surgeryName || "—"}</td>
                                        <td className="p-3 sm:p-4 text-sm">
                                            {item.surgeryDate
                                                ? new Date(item.surgeryDate.split("-").reverse().join("-"))
                                                    .toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })
                                                : "—"}
                                        </td>
                                        <td className="p-3 sm:p-4 text-sm">{item.hospitalName || "—"}</td>
                                        <td className="p-3 sm:p-4 text-sm">{item.doctorName || "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Medical Background */}
                <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">
                    <button
                        onClick={() => toggleSection("medicalBackground")}
                        className="w-full flex items-center p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex-1 text-center">
                            <span className="text-base sm:text-lg text-blue-800 font-bold">Ankit's Medical Background</span>
                        </div>
                        <div className="ml-2">
                            {expandedSections.medicalBackground ?
                                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" /> :
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                            }
                        </div>
                    </button>

                    {expandedSections.medicalBackground && (
                        <div className="border-t">
                            {/* Mobile Cards (visible on small screens) */}
                            <div className="block md:hidden p-3">
                                {Object.entries(patientData.medicalHistory).map(([condition, history]) => (
                                    <div key={condition} className="bg-gray-50 rounded-lg p-3 mb-3 last:mb-0">
                                        <div className="font-semibold text-blue-800 mb-3 capitalize text-center">
                                            {condition === 'bloodPressure' ? 'Blood Pressure' : condition}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">My Self</span>
                                                <RadioButton checked={history.self} onChange={() => { }} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Mother's Side</span>
                                                <RadioButton checked={history.mother} onChange={() => { }} />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Father's Side</span>
                                                <RadioButton checked={history.father} onChange={() => { }} color="yellow" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table (visible on medium screens and up) */}
                            <div className="hidden md:block p-4">
                                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 bg-[#ACEDFF] rounded-md py-2 sm:py-3 px-2 sm:px-3 border border-black">
                                    <div className="font-medium text-xs sm:text-sm">Type</div>
                                    <div className="font-medium text-xs sm:text-sm text-center">My Self</div>
                                    <div className="font-medium text-xs sm:text-sm text-center">Mother's Side</div>
                                    <div className="font-medium text-xs sm:text-sm text-center">Father's Side</div>
                                </div>

                                <div className="space-y-1">
                                    {Object.entries(patientData.medicalHistory).map(([condition, history]) => (
                                        <div key={condition} className="grid grid-cols-4 gap-2 sm:gap-4 items-center py-2 sm:py-3 px-2 sm:px-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 rounded">
                                            <div className="text-xs sm:text-sm capitalize font-medium">
                                                {condition === 'bloodPressure' ? 'Blood Pressure' : condition}
                                            </div>
                                            <div className="flex justify-center">
                                                <RadioButton checked={history.self} onChange={() => { }} />
                                            </div>
                                            <div className="flex justify-center">
                                                <RadioButton checked={history.mother} onChange={() => { }} />
                                            </div>
                                            <div className="flex justify-center">
                                                <RadioButton checked={history.father} onChange={() => { }} color="yellow" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DefaultLayout>
    );
};

export default MedicalProfile;