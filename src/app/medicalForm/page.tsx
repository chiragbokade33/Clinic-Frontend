'use client';
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, FileText, Search, User, Save } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const data = [
    {
        title: "MOUTH AND NOSE RELATED CONDITION",
        items: [
            "Burning tongue",
            "Frequent biting of cheek",
            "Frequent snoring",
            "Broken teeth",
            "Teeth clenching"
        ]
    },
    {
        title: "EAR RELATED CONDITIONS",
        items: [
            "Buzzing in the ears",
            "Tinnitus (ringing in the ears)",
            "Ear pain",
            "Ear congestion",
            "Pain in front of the ear",
            "Hearing loss",
            "Recurrent ear infections",
            "Pain behind the ear"
        ]
    },
    {
        title: "EYE RELATED CONDITIONS",
        items: ["Blurred vision", "Eye pain"]
    },
    {
        title: "THROAT, NECK & BACK RELATED CONDITIONS CONTINUED",
        items: [
            "Back pain - lower",
            "Back pain - middle",
            "Back pain - upper",
            "Chronic sore throat",
            "Constant feeling of a foreign object in throat",
            "Difficulty in swallowing",
            "Limited movement of neck",
            "Neck pain",
            "Numbness in the hands or fingers",
            "Sciatica",
            "Scoliosis",
            "Shoulder pain",
            "Shoulder stiffness",
            "Swelling in the neck",
            "Swollen glands",
            "Thyroid enlargement",
            "Tightness in throat",
            "Tingling in the hands or fingers",
            "Chronic sinusitis"
        ]
    }
];

const MedicalAssessmentForm = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selected, setSelected] = useState({});
    const [neckPain, setNeckPain] = useState('');
    const [facialPain, setFacialPain] = useState('7');

    const toggleSelect = (label) => {
        setSelected((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const leftColumn = [
        "Jaw pain",
        "Jaw clicking",
        "Jaw locking",
        "Limited mouth opening",
        "Facial pain",
        "Neck pain",
        "Headaches",
    ];

    const rightColumn = [
        "Morning head pain",
        "Ringing in the ears",
        "Dizziness",
        "Frequent Heavy Snoring",
        "Pain in or around ear",
        "Pain when chewing",
        "Migraines",
    ];

    // State Management - Tracks selected symptoms and notes
    const [selectedSymptomss, setSelectedSymptomss] = useState(new Set(['sensitivity-noise'])); // Pre-select one item
    const [notes, setNotes] = useState('');

    // Handle checkbox toggle logic
    const handleSymptomChange = (symptom) => {
        const newSelected = new Set(selectedSymptomss); // Create copy of current selection
        if (newSelected.has(symptom)) {
            newSelected.delete(symptom); // Remove if already selected
        } else {
            newSelected.add(symptom); // Add if not selected
        }
        setSelectedSymptoms(newSelected); // Update state
    };

    // Symptoms data structure - Define all symptoms with their properties
    const symptomsList = [
        // Left column symptoms
        { id: 'dizziness', label: 'Dizziness', column: 'left' },
        { id: 'double-vision', label: 'Double vision', column: 'left' },
        { id: 'fatigue', label: 'Fatigue', column: 'left' },
        { id: 'nausea', label: 'Nausea', column: 'left' },
        { id: 'sensitivity-light', label: 'Sensitivity to light (photophobia)', column: 'left' },

        // Right column symptoms
        { id: 'sensitivity-noise', label: 'Sensitivity to noise', column: 'right', highlighted: true }, // Pre-highlighted
        { id: 'throbbing', label: 'Throbbing', column: 'right' },
        { id: 'vomiting', label: 'Vomiting', column: 'right' },
        { id: 'burning', label: 'Burning', column: 'right' }
    ];

    // Split symptoms into columns for grid layout
    const leftSymptoms = symptomsList.filter(s => s.column === 'left');   // Filter left column items
    const rightSymptoms = symptomsList.filter(s => s.column === 'right'); // Filter right column items

    const [formData, setFormData] = useState({
        personalDetails: {
            npId: '',
            name: '',
            email: '',
            dateOfBirth: '',
            gender: '',
            phoneNumber: ''
        },
        historyOfSymptoms: {
            symptom1: '',
            symptom2: '',
            symptom3: ''
        },
        chiefComplaint: {
            complaint: '',
            duration: '',
            severity: '',
            location: ''
        },
        symptoms: {
            headPain: [],
            jawSymptoms: [],
            neckPain: [],
            earSymptoms: []
        },
        headPainHistory: {
            painSide: '',
            location: '',
            frequency: '',
            duration: '',
            intensity: '',
            triggers: []
        },
        symptomRating: {},
        vitalData: {
            bloodPressure: '',
            pulse: '',
            temperature: ''
        },
        musclePalpation: {},
        jointEvaluation: {
            examinationType: [],
            rangeOfMotion: {},
            oralExamination: {},
            dentalRelationship: {}
        },
        stopBangQuestionnaire: {},
        painCatastrophizing: {},
        emotionalSensitization: {},
        finalAssessment: {
            notes: '',
            signature: '',
            date: ''
        }
    });

    const steps = [
        'Personal Details & History',
        'Chief Complaint & Symptoms',
        'Head Pain History',
        'Symptom Rating Scale',
        'Vital Data & Muscle Palpation',
        'Joint Evaluation',
        'STOP-BANG Questionnaire',
        'Pain Catastrophizing Scale',
        'Emotional Sensitization',
        'Final Assessment'
    ];

    const updateFormData = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const updateArrayField = (section, field, value, checked) => {
        setFormData(prev => {
            const currentArray = prev[section][field] || [];
            if (checked) {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: [...currentArray, value]
                    }
                };
            } else {
                return {
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [field]: currentArray.filter(item => item !== value)
                    }
                };
            }
        });
    };

    const nextStep = () => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const [symptoms, setSymptoms] = useState({
        headPain: {
            entireHead: false,
            front: { L: false, R: false, B: false },
            top: false,
            back: { L: false, R: false, B: false },
            temples: { L: false, R: false, B: false },
        },
        jawPain: {
            opening: { L: false, R: false, B: false },
            chewing: { L: false, R: false, B: false },
            rest: { L: false, R: false, B: false },
        },
        jawSymptoms: {
            popping: false,
            clicking: { L: false, R: false, B: false },
            lockClosed: false,
            lockOpen: false,
            grinding: false,
            pressureEyes: false,
        },
    });

    const toggleLRB = (category, symptom, side) => {
        setSymptoms((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [symptom]: {
                    ...prev[category][symptom],
                    [side]: !prev[category][symptom][side],
                },
            },
        }));
    };

    const toggleCheckbox = (category, symptom) => {
        setSymptoms((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [symptom]: !prev[category][symptom],
            },
        }));
    };

    const LRBButton = ({ active, onClick, label }) => (
        <button
            type="button"
            onClick={onClick}
            className={`px-2 py-0.5 border rounded text-xs font-bold ${active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-400"
                }`}
        >
            {label}
        </button>
    );


    const [selectedSymptoms, setSelectedSymptoms] = useState({});

    const handleChange = (section, item) => {
        setSelectedSymptoms((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [item]: !prev[section]?.[item]
            }
        }));
    };


    const generatePDF = () => {
        const printWindow = window.open('', '_blank');
        const formDataJSON = JSON.stringify(formData, null, 2);

        printWindow.document.write(`
      <html>
        <head>
          <title>Medical Assessment Form</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; page-break-inside: avoid; }
            .section h3 { color: #2563eb; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Assessment Form</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="section">
            <h3>Complete Form Data (JSON)</h3>
            <pre>${formDataJSON}</pre>
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.print();
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div className="border rounded-lg p-6 shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4 relative">
                                {/* Centered Title */}
                                <h3 className="text-lg font-bold underline absolute left-1/2 transform -translate-x-1/2">
                                    Personal Details
                                </h3>

                                {/* Right Side Name */}
                                <span className="text-blue-600 font-semibold cursor-pointer ml-auto flex items-center gap-1">
                                    Priyanka
                                    <FontAwesomeIcon icon={faChevronDown} className="text-sm" />
                                </span>
                            </div>


                            {/* Form Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* HF ID */}
                                <div className="flex items-center">
                                    <span className="w-28 font-medium">HF ID :</span>
                                    <input
                                        type="text"
                                        value={formData.personalDetails.npId}
                                        onChange={(e) => updateFormData('personalDetails', 'npId', e.target.value)}
                                        className="flex-1 border-b border-gray-400 focus:outline-none"
                                    />
                                </div>

                                {/* Name */}
                                <div className="flex items-center">
                                    <span className="w-28 font-medium">Name :</span>
                                    <input
                                        type="text"
                                        value={formData.personalDetails.name}
                                        onChange={(e) => updateFormData('personalDetails', 'name', e.target.value)}
                                        className="flex-1 border-b border-gray-400 focus:outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div className="flex items-center">
                                    <span className="w-28 font-medium">Email :</span>
                                    <input
                                        type="email"
                                        value={formData.personalDetails.email}
                                        onChange={(e) => updateFormData('personalDetails', 'email', e.target.value)}
                                        className="flex-1 border-b border-gray-400 focus:outline-none"
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div className="flex items-center">
                                    <span className="w-28 font-medium">Date of Birth :</span>
                                    <input
                                        type="date"
                                        value={formData.personalDetails.dateOfBirth}
                                        onChange={(e) => updateFormData('personalDetails', 'dateOfBirth', e.target.value)}
                                        className="flex-1 border-b border-gray-400 focus:outline-none"
                                    />
                                </div>

                                {/* Gender */}
                                <div className="flex items-center">
                                    <span className="w-28 font-medium">Gender :</span>
                                    <label className="flex items-center mr-4">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            checked={formData.personalDetails.gender === 'Male'}
                                            onChange={(e) => updateFormData('personalDetails', 'gender', e.target.value)}
                                            className="mr-1"
                                        />
                                        Male
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            checked={formData.personalDetails.gender === 'Female'}
                                            onChange={(e) => updateFormData('personalDetails', 'gender', e.target.value)}
                                            className="mr-1"
                                        />
                                        Female
                                    </label>
                                </div>

                                {/* Phone Number */}
                                <div className="flex items-center">
                                    <span className="w-28 font-medium">Phone no. :</span>
                                    <input
                                        type="tel"
                                        value={formData.personalDetails.phoneNumber}
                                        onChange={(e) => updateFormData('personalDetails', 'phoneNumber', e.target.value)}
                                        className="flex-1 border border-gray-400 rounded px-2 py-1 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>


                        {/* History of Symptoms */}
                        <div className="border rounded-lg p-6 mt-3">
                            <h3 className="text-lg font-bold underline text-center mb-6">
                                History Of Symptoms
                            </h3>

                            {/* Question 1 */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                <label className="font-medium text-sm md:w-2/3">
                                    1) Is there anything that makes your pain or discomfort worse?
                                </label>
                                <input
                                    type="text"
                                    placeholder="Text . . ."
                                    value={formData.historyOfSymptoms.q1}
                                    onChange={(e) =>
                                        updateFormData("historyOfSymptoms", "q1", e.target.value)
                                    }
                                    className="w-full md:w-1/3 px-3 py-2 border border-[#33333]  focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Question 2 */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                <label className="font-medium text-sm md:w-2/3">
                                    2) Is there anything that makes your pain or discomfort better?
                                </label>
                                <input
                                    type="text"
                                    value={formData.historyOfSymptoms.q2}
                                    onChange={(e) =>
                                        updateFormData("historyOfSymptoms", "q2", e.target.value)
                                    }
                                    className="w-full md:w-1/3 px-3 py-2 border border-[#33333]  focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Question 3 */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                <label className="font-medium text-sm md:w-2/3">
                                    3) What other information is important regarding the pain or condition?
                                </label>
                                <input
                                    type="text"
                                    value={formData.historyOfSymptoms.q3}
                                    onChange={(e) =>
                                        updateFormData("historyOfSymptoms", "q3", e.target.value)
                                    }
                                    className="w-full md:w-1/3 px-3 py-2 border border-[#33333]  focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block font-medium text-sm mb-1">Additional Notes :</label>
                                <textarea
                                    value={formData.historyOfSymptoms.notes}
                                    onChange={(e) =>
                                        updateFormData("historyOfSymptoms", "notes", e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-[#33333]  focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                />
                            </div>
                        </div>


                        {/* History of Accident */}
                        <div className="border rounded-lg p-6 mt-3">
                            <h3 className="text-lg font-bold underline text-center mb-6">
                                History Of Accident
                            </h3>
                            <div className='mt-3 mb-3'>
                                <p className='whitespace-nowrap text-sm font-medium'>DATE OF ACCIDENT OR INCIDENT:</p>
                            </div>

                            {/* Date */}
                            <div className="mb-4 flex items-center gap-4">
                                <label className="text-gray-700 text-sm font-medium">
                                    Enter date (month/day/year) :  </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => updateFormData("date", e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />
                            </div>


                            {/* Cause of Pain */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-3">
                                    THE PATIENT BELIEVES THE CAUSE OF THE PAIN OR CONDITION TO BE:
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    {[
                                        "A motor vehicle accident",
                                        "A motorcycle accident",
                                        "A work-related incident",
                                        "A playground incident",
                                        "Hit Object",
                                        "An athletic endeavour",
                                        "A fight",
                                        "An arrest",
                                        "An accident",
                                        "Hit by an object",
                                        "An Illness",
                                        "An Injury",
                                        "Orthodontics",
                                        "Dental procedure",
                                        "Whiplash",
                                    ].map((item) => (
                                        <label key={item} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData?.cause?.includes(item)}
                                                onChange={(e) => handleCheckboxChange("cause", item, e.target.checked)}
                                                className="mr-2"
                                            />
                                            {item}
                                        </label>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Others..."
                                        value={formData?.causeOther}
                                        onChange={(e) => updateFormData("causeOther", e.target.value)}
                                        className="col-span-2 md:col-span-3 px-3 py-1 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Were You */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">WERE YOU:</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 text-sm">
                                    {[
                                        "A passenger in a motor vehicle",
                                        "The driver of a vehicle",
                                        "A pedestrian",
                                        "At work",
                                        "Did you fall?",
                                        "Were you hit by an object?",
                                        "Did you run into an object?",
                                    ].map((item) => (
                                        <label key={item} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData?.wereYou?.includes(item)}
                                                onChange={(e) => handleCheckboxChange("wereYou", item, e.target.checked)}
                                                className="mr-2"
                                            />
                                            {item}
                                        </label>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Others..."
                                        value={formData?.wereYouOther}
                                        onChange={(e) => updateFormData("wereYouOther", e.target.value)}
                                        className="col-span-2 md:col-span-3 px-3 py-1 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Hit */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    IF IN A VEHICLE, WHERE WAS THE VEHICLE HIT?
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 text-sm">
                                    {[
                                        "At the front end",
                                        "At the rear end",
                                        "At the front right area",
                                        "At the front left area",
                                        "At the rear right area",
                                        "At the rear left area",
                                        "Head on",
                                        "On driver’s side",
                                        "On passenger’s side",
                                    ].map((item) => (
                                        <label key={item} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData?.vehicleHit?.includes(item)}
                                                onChange={(e) => handleCheckboxChange("vehicleHit", item, e.target.checked)}
                                                className="mr-2"
                                            />
                                            {item}
                                        </label>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Others..."
                                        value={formData.vehicleHitOther}
                                        onChange={(e) => updateFormData("vehicleHitOther", e.target.value)}
                                        className="col-span-2 md:col-span-3 px-3 py-1 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                            {/* Indicate Trauma */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2">
                                    INDICATE IF THERE WAS ANY TRAUMA :
                                </label>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div className="space-y-2">
                                        {["Forehead", "Face", "Chin", "Side of head", "Back of head"].map((item) => (
                                            <label key={item} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData?.trauma?.includes(item)}
                                                    onChange={(e) =>
                                                        handleCheckboxChange("trauma", item, e.target.checked)
                                                    }
                                                    className="mr-2"
                                                />
                                                {item}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {["Top of head", "Teeth", "Jaw"].map((item) => (
                                            <label key={item} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData?.trauma?.includes(item)}
                                                    onChange={(e) =>
                                                        handleCheckboxChange("trauma", item, e.target.checked)
                                                    }
                                                    className="mr-2"
                                                />
                                                {item}
                                            </label>
                                        ))}
                                        {/* Trauma Other */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="whitespace-nowrap">Others :</span>
                                            <input
                                                type="text"
                                                value={formData?.traumaOther}
                                                onChange={(e) => updateFormData("traumaOther", e.target.value)}
                                                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Forcibly Struck */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-2">
                                    Forcibly struck the:
                                </label>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <div className="space-y-2">
                                        {[
                                            "Steering wheel",
                                            "Windshield",
                                            "Passenger's side window",
                                            "Driver's side window",
                                            "Passenger's side door",
                                            "Driver's side door",
                                        ].map((item) => (
                                            <label key={item} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData?.struck?.includes(item)}
                                                    onChange={(e) =>
                                                        handleCheckboxChange("struck", item, e.target.checked)
                                                    }
                                                    className="mr-2"
                                                />
                                                {item}
                                            </label>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        {["Headrest", "Seat", "Roof", "Interior of the car"].map((item) => (
                                            <label key={item} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData?.struck?.includes(item)}
                                                    onChange={(e) =>
                                                        handleCheckboxChange("struck", item, e.target.checked)
                                                    }
                                                    className="mr-2"
                                                />
                                                {item}
                                            </label>
                                        ))}
                                        {/* Struck Other */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="whitespace-nowrap">Others :</span>
                                            <input
                                                type="text"
                                                value={formData.struckOther}
                                                onChange={(e) => updateFormData("struckOther", e.target.value)}
                                                className="flex-1 px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </div>
                );

            case 1:
                return (
                    <div className="space-y-6">
                        {/* Chief Complaint */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">
                                Chief Complaint
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Left Column */}
                                <div className="space-y-2">
                                    {leftColumn.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex gap-4 items-center p-2 "
                                        >
                                            <input
                                                type="number"
                                                className="w-12 text-sm border rounded px-1 text-center"
                                            />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-2">
                                    {rightColumn.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex gap-4 items-center p-2 "
                                        >
                                            <input
                                                type="number"
                                                className="w-12 text-sm border rounded px-1 text-center"
                                            />
                                            <span className="text-sm">
                                                {typeof item === "string" ? item : item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium mb-1">
                                    Additional Notes :
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full border rounded p-2 text-sm"
                                ></textarea>
                            </div>
                        </div>



                        {/* Symptoms */}
                        <div className="bg-white border rounded-lg p-6 max-w-7xl mx-auto">
                            <h3 className="text-lg font-bold mb-4 underline text-center">Symptoms</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                {/* HEAD PAIN */}
                                <div>
                                    <h4 className="font-bold mb-2">HEAD PAIN</h4>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.headPain.entireHead}
                                            onChange={() => toggleCheckbox("headPain", "entireHead")}
                                        />
                                        Entire head (Generalized)
                                    </label>

                                    <div className="flex items-center space-x-1 mb-2">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.headPain.front.L}
                                            onClick={() => toggleLRB("headPain", "front", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.headPain.front.R}
                                            onClick={() => toggleLRB("headPain", "front", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.headPain.front.B}
                                            onClick={() => toggleLRB("headPain", "front", "B")}
                                        />
                                        <span className="ml-2">Front of your head (Frontal)</span>
                                    </div>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.headPain.top}
                                            onChange={() => toggleCheckbox("headPain", "top")}
                                        />
                                        Top of the head
                                    </label>

                                    <div className="flex items-center space-x-1 mb-2">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.headPain.back.L}
                                            onClick={() => toggleLRB("headPain", "back", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.headPain.back.R}
                                            onClick={() => toggleLRB("headPain", "back", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.headPain.back.B}
                                            onClick={() => toggleLRB("headPain", "back", "B")}
                                        />
                                        <span className="ml-2">Back of your head</span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.headPain.temples.L}
                                            onClick={() => toggleLRB("headPain", "temples", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.headPain.temples.R}
                                            onClick={() => toggleLRB("headPain", "temples", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.headPain.temples.B}
                                            onClick={() => toggleLRB("headPain", "temples", "B")}
                                        />
                                        <span className="ml-2">In your temples</span>
                                    </div>
                                </div>

                                {/* JAW SYMPTOMS */}
                                <div>
                                    <h4 className="font-bold mb-2">JAW SYMPTOMS</h4>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.jawSymptoms.popping}
                                            onChange={() => toggleCheckbox("jawSymptoms", "popping")}
                                        />
                                        Jaw popping
                                    </label>

                                    <div className="flex items-center space-x-1 mb-2">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.jawSymptoms.clicking.L}
                                            onClick={() => toggleLRB("jawSymptoms", "clicking", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.jawSymptoms.clicking.R}
                                            onClick={() => toggleLRB("jawSymptoms", "clicking", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.jawSymptoms.clicking.B}
                                            onClick={() => toggleLRB("jawSymptoms", "clicking", "B")}
                                        />
                                        <span className="ml-2">Jaw clicking</span>
                                    </div>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.jawSymptoms.lockClosed}
                                            onChange={() => toggleCheckbox("jawSymptoms", "lockClosed")}
                                        />
                                        Jaw locks closed
                                    </label>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.jawSymptoms.lockOpen}
                                            onChange={() => toggleCheckbox("jawSymptoms", "lockOpen")}
                                        />
                                        Jaw locks open
                                    </label>

                                    <label className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.jawSymptoms.grinding}
                                            onChange={() => toggleCheckbox("jawSymptoms", "grinding")}
                                        />
                                        Teeth grinding
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={symptoms.jawSymptoms.pressureEyes}
                                            onChange={() => toggleCheckbox("jawSymptoms", "pressureEyes")}
                                        />
                                        Pain or pressure behind the eyes
                                    </label>
                                </div>

                                {/* JAW PAIN */}
                                <div>
                                    <h4 className="font-bold mb-2">JAW PAIN</h4>

                                    <div className="flex items-center space-x-1 mb-2">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.jawPain.opening.L}
                                            onClick={() => toggleLRB("jawPain", "opening", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.jawPain.opening.R}
                                            onClick={() => toggleLRB("jawPain", "opening", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.jawPain.opening.B}
                                            onClick={() => toggleLRB("jawPain", "opening", "B")}
                                        />
                                        <span className="ml-2">Jaw pain - on opening</span>
                                    </div>

                                    <div className="flex items-center space-x-1 mb-2">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.jawPain.chewing.L}
                                            onClick={() => toggleLRB("jawPain", "chewing", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.jawPain.chewing.R}
                                            onClick={() => toggleLRB("jawPain", "chewing", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.jawPain.chewing.B}
                                            onClick={() => toggleLRB("jawPain", "chewing", "B")}
                                        />
                                        <span className="ml-2">Jaw pain - while chewing</span>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <LRBButton
                                            label="L"
                                            active={symptoms.jawPain.rest.L}
                                            onClick={() => toggleLRB("jawPain", "rest", "L")}
                                        />
                                        <LRBButton
                                            label="R"
                                            active={symptoms.jawPain.rest.R}
                                            onClick={() => toggleLRB("jawPain", "rest", "R")}
                                        />
                                        <LRBButton
                                            label="B"
                                            active={symptoms.jawPain.rest.B}
                                            onClick={() => toggleLRB("jawPain", "rest", "B")}
                                        />
                                        <span className="ml-2">Jaw pain - at Rest</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border rounded-lg p-6 mt-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto ">
                                {/* LEFT COLUMN */}
                                <div className="p-6 space-y-6 border-b md:border-b-0 md:border-r border-black">
                                    {data.slice(0, 3).map((section, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-lg font-semibold mb-4 text-black">
                                                {section.title}
                                            </h3>
                                            <div className="space-y-2">
                                                {section.items.map((item, i) => (
                                                    <label key={i} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedSymptoms[section.title]?.[item]}
                                                            onChange={() => handleChange(section.title, item)}
                                                            className="form-checkbox"
                                                        />
                                                        <span>{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="p-6 space-y-6">
                                    {data.slice(3).map((section, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-lg font-semibold mb-4 text-black">
                                                {section.title}
                                            </h3>
                                            <div className="space-y-2">
                                                {section.items.map((item, i) => (
                                                    <label key={i} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedSymptoms[section.title]?.[item]}
                                                            onChange={() => handleChange(section.title, item)}
                                                            className="form-checkbox"
                                                        />
                                                        <span>{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ADDITIONAL NOTES */}
                                <div className="md:col-span-2  p-6">
                                    <label className="block mb-2 font-semibold">Additional Notes :</label>
                                    <textarea
                                        className="w-full border p-2"
                                        rows={3}
                                        placeholder="Enter notes here..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>


                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="bg-white ">
                            <div className="max-w-7xl mx-auto p-6 bg-white">
                                <div className="mb-3 flex justify-center">

                                    <h3 className="text-lg font-semibold mb-4 text-black underline">Head Pain History</h3>
                                </div>

                                <div className="space-y-6">

                                    {/* Worst Side Question */}
                                    <div>
                                        <p className="font-medium text-gray-700 mb-3">Which side are the headaches worse?</p>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                            {[
                                                'The Left Side',
                                                'No sides, mostly frontal',
                                                'The Right Side',
                                                'Both sides'
                                            ].map((option) => (
                                                <label key={option} className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="worstSide"
                                                        value={option}
                                                        checked={formData.headPainHistory.worstSide === option}
                                                        onChange={(e) =>
                                                            updateFormData(
                                                                'headPainHistory',
                                                                'worstSide',
                                                                e.target.checked ? e.target.value : ''
                                                            )
                                                        }
                                                        className="mr-2 text-blue-600"
                                                    />
                                                    <span className="text-gray-700">{option}</span>
                                                </label>
                                            ))}
                                        </div>


                                    </div>
                                </div>

                                <div className='mt-3'>
                                    <h4 className="font-semibold mb-3">LOCATION</h4>
                                    <div className="max-w-md  bg-white">
                                        {/* Pain Scale Inputs */}
                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={neckPain}
                                                    onChange={(e) => setNeckPain(e.target.value)}
                                                    className="w-12 h-8 border border-gray-300 text-center text-sm"
                                                    placeholder=""
                                                />
                                                <span className="text-sm text-gray-700">Neck Pain on a Numeric Pain Scale</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="text"
                                                    value={facialPain}
                                                    onChange={(e) => setFacialPain(e.target.value)}
                                                    className="w-12 h-8 border border-gray-300 text-center text-sm"
                                                />
                                                <span className="text-sm text-gray-700">Facial Pain on a 0-10 Pain Scale</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-white max-w-7xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
                                        {/* Headache spreads to section */}
                                        <div>
                                            <h4 className="font-semibold mb-3">HEADACHE SPREADS TO</h4>
                                            <div className="space-y-2 text-sm">
                                                {[
                                                    'The temple, The back of the head, The forehead',
                                                    'Neck',
                                                    'All over',
                                                    'Back',
                                                    'The temple',
                                                    'The back of the head'
                                                ].map((location) => (
                                                    <label key={location} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.headPainHistory.spreadsTo?.includes(location) || false}
                                                            onChange={() => handleSpreadsToChange(location)}
                                                            className="mr-2"
                                                        />
                                                        {location}
                                                    </label>
                                                ))}

                                                {/* Others input for spreadsTo */}
                                                <div className="mt-3">
                                                    <label className="text-sm font-medium">
                                                        Others:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.headPainHistory.othersSpreadsTo || ''}
                                                        onChange={(e) => updateFormData('headPainHistory', 'othersSpreadsTo', e.target.value)}
                                                        className="mt-1 block w-full px-3 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter other locations"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Frequency section */}
                                        <div className='border-l gap-3 pl-3'>
                                            <h4 className="font-semibold mb-3">FREQUENCY</h4>
                                            <div className="space-y-2 text-sm">
                                                {[
                                                    'Daily',
                                                    'Occasional (0-3/mo)',
                                                    'Frequent (3-6/mo)',
                                                    '2-3 times per week',
                                                    'Constant'
                                                ].map((freq) => (
                                                    <label key={freq} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="frequency"
                                                            value={freq}
                                                            checked={formData.headPainHistory.frequency === freq}
                                                            onChange={(e) => updateFormData('headPainHistory', 'frequency', e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        {freq}
                                                    </label>
                                                ))}

                                                {/* Others input for frequency */}
                                                <div className="mt-3">
                                                    <label className="text-sm font-medium">
                                                        Others:
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.headPainHistory.othersFrequency || ''}
                                                        onChange={(e) => updateFormData('headPainHistory', 'othersFrequency', e.target.value)}
                                                        className="mt-1 block w-full px-3 py-1 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter other frequency"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='p-6 bg-white max-w-7xl mx-auto'>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="">
                                            <h2 className="text-xl font-bold mb-3 text-gray-800">Pain Assessment Form</h2>

                                            <div className="space-y-3">
                                                {/* Severity Scale Section */}
                                                <div className="">
                                                    <h3 className="text-xl font-semibold mb-4 text-gray-700">SEVERITY ON A SCALE OF 0-10</h3>

                                                    <div className="bg-white p-3 rounded border mb-4">
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            <div>0 = No Pain</div>
                                                            <div>10 = Worst Pain Imaginable</div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {/* Jaw Pain */}
                                                        <div className="flex items-center space-x-4">
                                                            <label className="font-medium">
                                                                Jaw Pain on a Numeric Pain Scale
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                value={formData.severityScale?.jawPain}
                                                                onChange={(e) =>
                                                                    updateFormData('severityScale', 'jawPain', e.target.value)
                                                                }
                                                                className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="0-10"
                                                            />
                                                        </div>


                                                        {/* Headaches */}
                                                        <div className="flex items-center space-x-4">
                                                            <label className="font-medium">
                                                                Headaches on a 0-10 Pain Scale
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                value={formData.severityScale?.headaches}
                                                                onChange={(e) =>
                                                                    updateFormData('severityScale', 'headaches', e.target.value)
                                                                }
                                                                className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="0-10"
                                                            />
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-3">DURATION</h4>
                                            <div className="space-y-2 text-sm">
                                                {[
                                                    'Seconds',
                                                    'Minutes',
                                                    'Hours',
                                                    'Days',
                                                    'Weeks',
                                                    'Constant'
                                                ].map((duration) => (
                                                    <label key={duration} className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="duration"
                                                            value={duration}
                                                            checked={formData.headPainHistory.duration === duration}
                                                            onChange={(e) => updateFormData('headPainHistory', 'duration', e.target.value)}
                                                            className="mr-2"
                                                        />
                                                        {duration}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-7xl mx-auto p-6 ">
                                    {/* Form card - White background with shadow and border */}
                                    <div className=" p-8">

                                        {/* Form Title Section */}
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                            When having pain do you experience :
                                        </h2>

                                        {/* Main Checkbox Grid - 2 equal columns with gap */}
                                        <div className="grid grid-cols-2 gap-6 mb-8">

                                            {/* LEFT COLUMN */}
                                            <div className="space-y-3"> {/* Vertical spacing between items */}
                                                {leftSymptoms.map((symptom) => (
                                                    <div
                                                        key={symptom.id}
                                                        className={`flex items-center p-2 rounded transition-colors ${
                                                            // Conditional styling: Blue background if highlighted or selected
                                                            symptom.highlighted || selectedSymptomss.has(symptom.id)
                                                                ? 'bg-blue-100 border border-blue-300' // Selected/highlighted state
                                                                : 'hover:bg-gray-50' // Default hover state
                                                            }`}
                                                    >
                                                        {/* Checkbox Input */}
                                                        <input
                                                            type="checkbox"
                                                            id={symptom.id}
                                                            checked={selectedSymptomss.has(symptom.id)} // Check if symptom is selected
                                                            onChange={() => handleSymptomChange(symptom.id)} // Toggle selection
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                        {/* Label - Clickable and styled */}
                                                        <label
                                                            htmlFor={symptom.id}
                                                            className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                                                        >
                                                            {symptom.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* RIGHT COLUMN - Same structure as left */}
                                            <div className="space-y-3">
                                                {rightSymptoms.map((symptom) => (
                                                    <div
                                                        key={symptom.id}
                                                        className={`flex items-center p-2 rounded transition-colors ${symptom.highlighted || selectedSymptomss.has(symptom.id)
                                                                ? 'bg-blue-100 border border-blue-300'
                                                                : 'hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={symptom.id}
                                                            checked={selectedSymptomss?.has(symptom.id)}
                                                            onChange={() => handleSymptomChange(symptom.id)}
                                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                        />
                                                        <label
                                                            htmlFor={symptom.id}
                                                            className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
                                                        >
                                                            {symptom.label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Additional Notes Section - Separated with border */}
                                        <div className=" pt-6">
                                            {/* Notes Label */}
                                            <label
                                                htmlFor="notes"
                                                className="block text-sm font-semibold text-gray-900 mb-2"
                                            >
                                                Additional Notes :
                                            </label>

                                            {/* Notes Textarea - Controlled component */}
                                            <textarea
                                                id="notes"
                                                rows={4} // Fixed height of 4 rows
                                                value={notes} // Controlled by state
                                                onChange={(e) => setNotes(e.target.value)} // Update notes state
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                                                placeholder="Enter any additional notes..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">Symptom Rating Scale</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Rate each of the following by selecting how often you have experienced each symptom:
                            </p>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 p-2 text-left">Symptom</th>
                                            <th className="border border-gray-300 p-2 text-center">Never<br />0</th>
                                            <th className="border border-gray-300 p-2 text-center">Hardly<br />1</th>
                                            <th className="border border-gray-300 p-2 text-center">Sometimes<br />2</th>
                                            <th className="border border-gray-300 p-2 text-center">Often<br />3</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            'Little interest or pleasure in things',
                                            'Feeling down, depressed, or hopeless',
                                            'Trouble falling or staying asleep, or sleeping too much',
                                            'Feeling tired or having little energy',
                                            'Poor appetite or overeating',
                                            'Feeling bad about yourself - or that you are a failure',
                                            'Trouble concentrating on things',
                                            'Moving or speaking so slowly others noticed'
                                        ].map((symptom, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 p-2 text-sm">{symptom}</td>
                                                {[0, 1, 2, 3].map((rating) => (
                                                    <td key={rating} className="border border-gray-300 p-2 text-center">
                                                        <input
                                                            type="radio"
                                                            name={`symptom_${index}`}
                                                            value={rating}
                                                            onChange={(e) => updateFormData('symptomRating', `symptom_${index}`, e.target.value)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-4 p-4 bg-gray-50 rounded">
                                <p className="text-sm font-medium">Interpretation of Total Score</p>
                                <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                                    <div>
                                        <p><strong>Total Score</strong></p>
                                        <p>1-4: Minimal depression</p>
                                        <p>5-9: Mild depression</p>
                                        <p>10-14: Moderate depression</p>
                                        <p>15-19: Moderately severe</p>
                                        <p>20-27: Severe depression</p>
                                    </div>
                                    <div>
                                        <p><strong>Suggested Actions</strong></p>
                                        <p>Score 1-4: The score suggests...</p>
                                        <p>Score 5-9: Physician uses clinical...</p>
                                        <p>Score 10-14: Physician uses clinical...</p>
                                        <p>Score 15-19: Warrants active treatment...</p>
                                        <p>Score ≥20: Warrants active treatment...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        {/* Vital Data */}
                        <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">Vital Data</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                                    <input
                                        type="text"
                                        placeholder="120/80"
                                        value={formData.vitalData.bloodPressure}
                                        onChange={(e) => updateFormData('vitalData', 'bloodPressure', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pulse</label>
                                    <input
                                        type="text"
                                        placeholder="72"
                                        value={formData.vitalData.pulse}
                                        onChange={(e) => updateFormData('vitalData', 'pulse', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                                    <input
                                        type="text"
                                        placeholder="98.6°F"
                                        value={formData.vitalData.temperature}
                                        onChange={(e) => updateFormData('vitalData', 'temperature', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Muscle Palpation */}
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">Muscle Palpation</h3>

                            {/* Palpation Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                <div className="text-center font-medium">Muscle</div>
                                <div className="text-center font-medium">Right Tender</div>
                                <div className="text-center font-medium">Right Painful</div>
                                <div className="text-center font-medium">Left Tender/Painful</div>

                                {[
                                    'Temporalis Anterior',
                                    'Temporalis Middle',
                                    'Temporalis Posterior',
                                    'Posterior Capsule',
                                    'Posterior Capsule',
                                    'Lateral Capsule',
                                    'Tendon',
                                    'Coronoid Process',
                                    'Lateral Pterygoid',
                                    'Medial Pterygoid',
                                    'Posterior Digastric',
                                    'Submandibular',
                                    'Insertion Temporal',
                                    'Splenius Capitis',
                                    'Suboccipital',
                                    'Trapezius (Upper)',
                                    'Sternocleidomastoid',
                                    'Masseter (Upper)',
                                    'Masseter (Middle)',
                                    'Masseter (Lower)',
                                    'Masseter Deep'
                                ].map((muscle, index) => (
                                    <React.Fragment key={index}>
                                        <div className="text-sm p-2 border">{muscle}</div>
                                        <div className="text-center p-2 border">
                                            <input type="checkbox" />
                                        </div>
                                        <div className="text-center p-2 border">
                                            <input type="checkbox" />
                                        </div>
                                        <div className="text-center p-2 border">
                                            <input type="checkbox" />
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Pain Level Scale */}
                            <div className="mt-6">
                                <h4 className="font-semibold mb-2">Pain Level</h4>
                                <div className="flex space-x-2 mb-2">
                                    {['No pain', 'Mild', 'Moderate', 'Severe'].map((level, index) => (
                                        <div key={index} className={`w-8 h-8 rounded text-center text-xs leading-8 text-white ${index === 0 ? 'bg-green-500' :
                                            index === 1 ? 'bg-yellow-500' :
                                                index === 2 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}>
                                            {index}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">STOP-BANG Sleep Apnea Questionnaire</h3>

                            <div className="space-y-4">
                                {[
                                    'Do you SNORE loudly (louder than talking or loud enough to be heard through closed doors)?',
                                    'Do you often feel TIRED, fatigued, or sleepy during the daytime?',
                                    'Has anyone OBSERVED you stop breathing during your sleep?',
                                    'Do you have or are you being treated for high blood PRESSURE?',
                                    'BMI more than 35 kg/m²?',
                                    'AGE over 50 years old?',
                                    'NECK circumference > 16 inches (40cm)?',
                                    'GENDER: Male?'
                                ].map((question, index) => (
                                    <div key={index} className="border-b pb-4">
                                        <p className="text-sm font-medium mb-2">{question}</p>
                                        <div className="flex space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`stopbang_${index}`}
                                                    value="Yes"
                                                    onChange={(e) => updateFormData('stopBangQuestionnaire', `question_${index}`, e.target.value)}
                                                    className="mr-2"
                                                />
                                                Yes
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name={`stopbang_${index}`}
                                                    value="No"
                                                    onChange={(e) => updateFormData('stopBangQuestionnaire', `question_${index}`, e.target.value)}
                                                    className="mr-2"
                                                />
                                                No
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded">
                                <p className="text-sm font-medium">Total Score Interpretation:</p>
                                <p className="text-xs mt-1">High risk of OSA: Total ≥ 3</p>
                                <p className="text-xs">Intermediate risk of OSA: Total = 1-2</p>
                                <p className="text-xs">Low risk of OSA: Total = 0</p>
                            </div>
                        </div>
                    </div>
                );

            case 8:
                return (
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">Pain Catastrophizing Scale</h3>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="border border-gray-300 p-2 text-left">Statement</th>
                                            <th className="border border-gray-300 p-2 text-center">Not at all<br />0</th>
                                            <th className="border border-gray-300 p-2 text-center">To a slight<br />degree<br />1</th>
                                            <th className="border border-gray-300 p-2 text-center">To a<br />moderate<br />degree<br />2</th>
                                            <th className="border border-gray-300 p-2 text-center">To a great<br />degree<br />3</th>
                                            <th className="border border-gray-300 p-2 text-center">All the<br />time<br />4</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            'I worry all the time about whether the pain will end',
                                            'I feel I can\'t go on',
                                            'It\'s terrible and I think it\'s never going to get any better',
                                            'It\'s awful and I feel that it overwhelms me',
                                            'I feel I can\'t stand it anymore',
                                            'I become afraid that the pain will get worse',
                                            'I keep thinking of other painful events',
                                            'I anxiously want the pain to go away',
                                            'I can\'t seem to keep it out of my mind',
                                            'I keep thinking about how much it hurts',
                                            'I keep thinking about how badly I want the pain to stop',
                                            'There\'s nothing I can do to reduce the intensity of the pain',
                                            'I wonder whether something serious may happen'
                                        ].map((statement, index) => (
                                            <tr key={index}>
                                                <td className="border border-gray-300 p-2 text-sm">{statement}</td>
                                                {[0, 1, 2, 3, 4].map((rating) => (
                                                    <td key={rating} className="border border-gray-300 p-2 text-center">
                                                        <input
                                                            type="radio"
                                                            name={`pain_catastrophizing_${index}`}
                                                            value={rating}
                                                            onChange={(e) => updateFormData('painCatastrophizing', `statement_${index}`, e.target.value)}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 9:
                return (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">EMOTIONAL SENSITIZATION INVENTORY</h3>

                            <div className="mb-4 p-4 bg-blue-50 rounded text-sm">
                                <p>Questions 1-26 below show several ways that...</p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-semibold">Part A</h4>
                                {[
                                    'I have vivid and unpleasant return of past experiences.',
                                    'Sleep troubles related to distressing events.',
                                    'I have scary urges or urges.',
                                    'I worry about scary events.',
                                    'I have unwanted recurring or distressing thoughts.',
                                    'I have bad dreams at night.',
                                    'I feel afraid of unusual thoughts I have.',
                                    'I get real sad.'
                                ].map((question, index) => (
                                    <div key={index} className="border-b pb-2">
                                        <p className="text-sm mb-2">{index + 1}. {question}</p>
                                        <div className="flex space-x-2">
                                            {[0, 1, 2, 3, 4].map((rating) => (
                                                <label key={rating} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`emotional_${index}`}
                                                        value={rating}
                                                        onChange={(e) => updateFormData('emotionalSensitization', `partA_${index}`, e.target.value)}
                                                        className="mr-1"
                                                    />
                                                    <span className="text-xs">{rating}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 9:
                return (
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">Final Assessment & Review</h3>

                            <div className="space-y-6">
                                {/* Data Summary */}
                                <div className="p-4 bg-gray-50 rounded">
                                    <h4 className="font-semibold mb-2">Form Data Summary (JSON)</h4>
                                    <pre className="text-xs overflow-auto max-h-60 bg-white p-3 rounded border">
                                        {JSON.stringify(formData, null, 2)}
                                    </pre>
                                </div>

                                {/* Final Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                    <textarea
                                        value={formData.finalAssessment.notes}
                                        onChange={(e) => updateFormData('finalAssessment', 'notes', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        rows="4"
                                        placeholder="Any additional comments or observations..."
                                    />
                                </div>

                                {/* Signature and Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Patient Signature</label>
                                        <input
                                            type="text"
                                            value={formData.finalAssessment.signature}
                                            onChange={(e) => updateFormData('finalAssessment', 'signature', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Type your name as signature"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={formData.finalAssessment.date}
                                            onChange={(e) => updateFormData('finalAssessment', 'date', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        onClick={generatePDF}
                                        className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Generate PDF</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const dataStr = JSON.stringify(formData, null, 2);
                                            const dataBlob = new Blob([dataStr], { type: 'application/json' });
                                            const url = URL.createObjectURL(dataBlob);
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.download = 'medical-assessment-data.json';
                                            link.click();
                                        }}
                                        className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Download JSON</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Step not implemented</div>;
        }
    };

    return (
        <DefaultLayout>
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between ">
                        <h1 className="text-4xl font-semibold text-gray-900 mx-5">Patient's list:</h1>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-80 pl-10 pr-4 py-2 border border-black rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <button className="absolute inset-y-0 right-0 flex items-center justify-center w-10 bg-[#01154c] text-white rounded-full ">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>

                    </div>
                    <div className='border border-black mx-3'></div>

                    <div className='font-bold text-blue-800 text-2xl text-center mt-3 mb-3 '>"Fill out, submit, and keep things moving!"</div>

                    {/* Form Content */}
                    <div className=" rounded-lmd mt-3 border border-black">
                        <div className="p-6">
                            {renderStep()}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center p-6 bg-gray-50 rounded-b-lg">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${currentStep === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </button>

                            <div className="text-sm text-gray-500">
                                {currentStep + 1} / {steps.length}
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={currentStep === steps.length - 1}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${currentStep === steps.length - 1
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default MedicalAssessmentForm;