'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown, X, Clipboard } from 'lucide-react'
import DefaultLayout from '../components/DefaultLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { Listconsent, ListJsondata, ListProfile } from '../services/ClinicServiceApi';
import { getUserId } from '../hooks/GetitemsLocal';

const page = () => {
    const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isConsentFormsModalOpen, setIsConsentFormsModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const router = useRouter();
    const searchParams = useSearchParams(); // Hook to get query parameters
    const [hovered, setHovered] = useState(false);

    // Enhanced state for tracking actions and PDF data
    const [actionPayload, setActionPayload] = useState([]);
    const [prescriptionData, setPrescriptionData] = useState(null);
    const [treatmentPlanData, setTreatmentPlanData] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    const [receiptData, setReceiptData] = useState(null);
    const [consentListData, setConsentListData] = useState() as any;
    const [profileData, setProfileData] = useState() as any;
    const [currentUserId, setCurrentUserId] = useState<number>();
    const [treatmentData, setTreatmentData] = useState([]) as any;


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
                    const treatmentEntry = apiData.find((item: { type: string; }) => item.type === "Invoice");
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


    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);


    useEffect(() => {
        const listDataProfile = async () => {
            const extractedHfid = searchParams.get("hfid");
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



    // Checkbox states for documents
    const [checkedItems, setCheckedItems] = useState({
        prescription: false,
        reportImages: false,
        paymentReceipt: false,
        invoice: false,
        treatmentPlan: false
    }) as any;

    // Checkbox states for consent forms
    const [consentFormsChecked, setConsentFormsChecked] = useState({
        dtrConsent: false,
        tmdTmjpConsent: false,
        photoConsent: false,
        arthroseScreeningConsent: false
    }) as any;


    const convertDateFormat = (dateString: { split: (arg0: string) => [any, any, any]; }) => {
        if (!dateString) return null;

        try {
            const [day, month, year] = dateString.split('-');
            const convertedDate = `${year}-${month}-${day}`;
            return convertedDate;
        } catch (error) {
            return dateString; // Return original if conversion fails
        }
    };
    useEffect(() => {
        const extractParamsAndCallAPI = async () => {
            // Extract parameters from URL
            const extractedPatientId = searchParams.get('patientId');
            const extractedHfid = searchParams.get('hfid');
            const extractedLastVisitDate = searchParams.get('lastVisitDate');
            const extractedLastVisitId = searchParams.get('visitId');
            const convertedDate = convertDateFormat(extractedLastVisitDate);
            if (extractedHfid && convertedDate) {
                const payload = {
                    hfid: extractedHfid,
                    appointmentDate: convertedDate
                };
                const id = await getUserId();
                setCurrentUserId(id);
                try {
                    const response = await Listconsent(id, payload);
                    setConsentListData(response.data.data);
                } catch (error) {

                } finally {
                    console.log('🏁 API Call Completed');
                }
            } else {
            }
        };

        extractParamsAndCallAPI();
    }, [searchParams]);

    // Enhanced console logging when state updates
    useEffect(() => {
        if (consentListData) {
        }
    }, [consentListData]);

    // Handle consent forms modal
    const handleConsentFormsSendClick = () => {
        setIsConsentFormsModalOpen(true);
    };

    const handleConsentFormsModalClose = () => {
        setIsConsentFormsModalOpen(false);
    };

    // Handle consent form checkbox change
    const handleConsentFormCheckboxChange = (formName: string | number) => {
        setConsentFormsChecked((prev: any) => ({
            ...prev,
            [formName]: !prev[formName]
        }));
    };

    // Handle consent forms final send
    const handleConsentFormsFinalSend = () => {
        const selectedForms = Object.keys(consentFormsChecked).filter(key => consentFormsChecked[key]);
        setIsConsentFormsModalOpen(false);
        router.push('/publicConsentForm');
    };

    const handleSendClick = () => {
        setIsSendModalOpen(true);
    };

    const handleModalClose = () => {
        setIsSendModalOpen(false);
    };

    // Function to handle prescription checkbox click and generate PDF
    const handlePrescriptionCheck = () => {
        console.log('Prescription checkbox clicked - Generating PDF...');

        // Sample prescription data (replace with your actual API data)
        const samplePrescriptionData = {
            patient: {
                name: "Ankit K.",
                uhid: "HF010125ANK1312",
                gender: "Male",
                prfid: "T50AHYBM6",
                dob: "1990-01-25",
                mobile: "+91 9876543210",
                doctor: "Dr. Varun R Kunte",
                city: "Mumbai",
                bloodGroup: "AB-"
            },
            medications: [
                {
                    name: "Paracetamol",
                    dosage: "500mg",
                    frequency: "Three times a day",
                    timing: "After meals",
                    instruction: "Take with plenty of water"
                },
                {
                    name: "Ibuprofen",
                    dosage: "200mg",
                    frequency: "Twice a day",
                    timing: "Morning & Evening",
                    instruction: "Take with food to avoid stomach upset"
                },
                {
                    name: "Vitamin D3",
                    dosage: "60,000 IU",
                    frequency: "Once a week",
                    timing: "Sunday morning",
                    instruction: "Take with breakfast"
                }
            ],
            clinicInfo: {
                name: "ARTHROSE",
                subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                website: "www.arthrosetmjindia.com"
            }
        };

        // Store the action in payload
        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'prescription_checked',
            patientId: "HF010125ANK1312",
            documentType: 'prescription',
            data: samplePrescriptionData
        };

        // Update action payload state
        setActionPayload(prev => [...prev, actionData]);

        // Store prescription data for PDF generation
        setPrescriptionData(samplePrescriptionData);

        // Log to console
        console.log('Action Payload:', actionData);
        console.log('All Actions:', [...actionPayload, actionData]);

        // Generate PDF
        generatePrescriptionPDF(samplePrescriptionData);
    };

    // Function to handle treatment plan checkbox click and generate PDF
    const handleTreatmentPlanCheck = () => {
        console.log('Treatment Plan checkbox clicked - Generating PDF...');

        // Sample treatment plan data
        const sampleTreatmentData = {
            patient: {
                name: "Ankit K.",
                hfid: "HF010125ANK1312",
                gender: "Male",
                prfid: "T50AHYBM6",
                dob: "1990-01-25",
                mobile: "+91 9876543210",
                doctor: "Dr. Varun R Kunte",
                city: "Mumbai",
                bloodGroup: "AB-"
            },
            treatments: [
                {
                    name: "Arthrose Functional screening",
                    qtyPerDay: "1 QTY",
                    cost: 35000.0,
                    status: "Not started",
                    total: 35000.0
                },
                {
                    name: "TMJ Orthotic",
                    qtyPerDay: "1 QTY",
                    cost: 95000.0,
                    status: "Not started",
                    total: 95000.0
                }
            ],
            totalCost: 130000.0,
            grandTotal: 130000.0,
            clinicInfo: {
                name: "ARTHROSE",
                subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                website: "www.arthrosetmjindia.com"
            }
        };

        // Store the action in payload
        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'treatment_plan_checked',
            patientId: "HF010125ANK1312",
            documentType: 'treatment_plan',
            data: sampleTreatmentData
        };

        // Update action payload state
        setActionPayload(prev => [...prev, actionData]);

        // Store treatment plan data for PDF generation
        setTreatmentPlanData(sampleTreatmentData);

        // Log to console
        console.log('Treatment Plan Action Payload:', actionData);

        // Generate PDF
        generateTreatmentPlanPDF(sampleTreatmentData);
    };

    // Function to handle receipt checkbox click and generate PDF
    const handleReceiptCheck = () => {
        console.log('Receipt checkbox clicked - Generating PDF...');

        // Sample receipt data
        const sampleReceiptData = {
            patient: {
                name: "Ankit K.",
                uhid: "HF010125ANK1312",
                gender: "Male",
                receiptId: "T50AHYBM6",
                dob: "1990-01-25",
                doctor: "Dr. Varun R Kunte",
                mobile: "+91 9876543210",
                city: "Mumbai"
            },
            receipt: {
                date: "22 Mar, 2025",
                receiptNumber: "Rc.3668",
                modeOfPayment: "Cash",
                chequeNo: "-",
                amountPaid: 1000.0,
                amountInWords: "One Thousand Only"
            },
            clinicInfo: {
                name: "ARTHROSE",
                subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                website: "www.arthrosetmjindia.com"
            }
        };

        // Store the action in payload
        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'receipt_checked',
            patientId: "HF010125ANK1312",
            documentType: 'receipt',
            data: sampleReceiptData
        };

        // Update action payload state
        setActionPayload(prev => [...prev, actionData]);

        // Store receipt data for PDF generation
        setReceiptData(sampleReceiptData);

        // Log to console
        console.log('Receipt Action Payload:', actionData);

        // Generate PDF
        generateReceiptPDF(sampleReceiptData);
    };

    // Function to handle invoice checkbox click and generate PDF
    const handleInvoiceCheck = () => {
        console.log('Invoice checkbox clicked - Generating PDF...');

        // Sample invoice data
        const sampleInvoiceData = {
            patient: {
                name: "Ankit K.",
                uhid: "HF010125ANK1312",
                gender: "Male",
                invid: "INV3147",
                dob: "1990-01-25",
                date: "31-03-2025",
                mobile: "+91 9876543210",
                city: "Mumbai"
            },
            services: [
                {
                    name: "Arthrose Functional screening",
                    qtyPerDay: "1 QTY",
                    cost: 35000.0,
                    total: 35000.0
                },
                {
                    name: "TMJ Orthotic",
                    qtyPerDay: "1 QTY",
                    cost: 95000.0,
                    total: 95000.0
                }
            ],
            totalCost: 130000.0,
            grandTotal: 130000.0,
            paid: 130000.0,
            clinicInfo: {
                name: "ARTHROSE",
                subtitle: "CRANIOFACIAL PAIN & TMJ CENTRE",
                website: "www.arthrosetmjindia.com"
            }
        };

        // Store the action in payload
        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'invoice_checked',
            patientId: "HF010125ANK1312",
            documentType: 'invoice',
            data: sampleInvoiceData
        };

        // Update action payload state
        setActionPayload(prev => [...prev, actionData]);

        // Store invoice data for PDF generation
        setInvoiceData(sampleInvoiceData);

        // Log to console
        console.log('Invoice Action Payload:', actionData);

        // Generate PDF
        generateInvoicePDF(sampleInvoiceData);
    };

    // Function to generate prescription PDF
    const generatePrescriptionPDF = (data: any) => {
        // Create a new window/tab for the PDF
        const pdfWindow = window.open('', '_blank');

        const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Prescription - ${data.patient.name}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: #333;
                    padding: 20px;
                    background: white;
                }
                
                .prescription-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #8B4513;
                    padding-bottom: 20px;
                }
                
                .logo {
                    width: 80px;
                    height: 80px;
                    background: #D2B48C;
                    border-radius: 50%;
                    margin-right: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #8B4513;
                    font-weight: bold;
                }
                
                .clinic-info h1 {
                    color: #8B4513;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .clinic-info p {
                    color: #666;
                    font-size: 14px;
                }
                
                .patient-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 5px;
                }
                
                .info-field {
                    display: flex;
                    align-items: center;
                }
                
                .info-field label {
                    font-weight: bold;
                    margin-right: 10px;
                    min-width: 120px;
                    color: #333;
                }
                
                .info-field span {
                    color: #666;
                }
                
                .prescription-section h2 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .prescription-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                }
                
                .prescription-table th {
                    background: #f8f8f8;
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                    color: #333;
                }
                
                .prescription-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    vertical-align: top;
                }
                
                .prescription-table tr:nth-child(even) {
                    background: #fafafa;
                }
                
                .medication-name {
                    font-weight: bold;
                    color: #333;
                }
                
                .medication-instruction {
                    font-size: 12px;
                    color: #666;
                    font-style: italic;
                    margin-top: 3px;
                }
                
                .prescription-footer {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                }
                
                .website-info {
                    font-size: 12px;
                    color: #666;
                }
                
                .doctor-signature {
                    text-align: center;
                }
                
                .signature-area {
                    width: 150px;
                    height: 60px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: end;
                    justify-content: center;
                    font-family: cursive;
                    font-size: 18px;
                    color: #333;
                }
                
                .doctor-name {
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="prescription-container">
                <div class="header">
                    <div class="logo">AR</div>
                    <div class="clinic-info">
                        <h1>${data.clinicInfo.name}</h1>
                        <p>${data.clinicInfo.subtitle}</p>
                    </div>
                </div>

                <div class="patient-info">
                    <div class="info-field">
                        <label>Patient Name:</label>
                        <span>${data.patient.name}</span>
                    </div>
                    <div class="info-field">
                        <label>UHID:</label>
                        <span>${data.patient.uhid}</span>
                    </div>
                    <div class="info-field">
                        <label>Gender:</label>
                        <span>${data.patient.gender}</span>
                    </div>
                    <div class="info-field">
                        <label>PRFID:</label>
                        <span>${data.patient.prfid}</span>
                    </div>
                    <div class="info-field">
                        <label>DOB:</label>
                        <span>${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div class="info-field">
                        <label>Mobile:</label>
                        <span>${data.patient.mobile}</span>
                    </div>
                    <div class="info-field">
                        <label>Consultant Doctor:</label>
                        <span>${data.patient.doctor}</span>
                    </div>
                    <div class="info-field">
                        <label>City:</label>
                        <span>${data.patient.city}</span>
                    </div>
                </div>

                <div class="prescription-section">
                    <h2>Prescription</h2>
                    <table class="prescription-table">
                        <thead>
                            <tr>
                                <th style="width: 10%">S.No.</th>
                                <th style="width: 35%">Medication</th>
                                <th style="width: 15%">Dosage</th>
                                <th style="width: 20%">Frequency</th>
                                <th style="width: 20%">Timing</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.medications.map((med, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <div class="medication-name">${med.name}</div>
                                        ${med.instruction ? `<div class="medication-instruction">Instruction: ${med.instruction}</div>` : ''}
                                    </td>
                                    <td>${med.dosage}</td>
                                    <td>${med.frequency}</td>
                                    <td>${med.timing}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="prescription-footer">
                    <div class="website-info">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature">
                        <div class="signature-area">Dr. Kunte</div>
                        <div class="doctor-name">${data.patient.doctor}</div>
                    </div>
                </div>
            </div>

            <script>
                // Auto-print when page loads
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
        `;

        pdfWindow.document.write(pdfContent);
        pdfWindow.document.close();

        console.log('Prescription PDF generated successfully!');
    };

    // Function to generate treatment plan PDF
    const generateTreatmentPlanPDF = (data: any) => {
        const pdfWindow = window.open('', '_blank');

        const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Treatment Plan - ${data.patient.name}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: #333;
                    padding: 20px;
                    background: white;
                }
                
                .prescription-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #8B4513;
                    padding-bottom: 20px;
                }
                
                .logo {
                    width: 80px;
                    height: 80px;
                    background: #D2B48C;
                    border-radius: 50%;
                    margin-right: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #8B4513;
                    font-weight: bold;
                }
                
                .clinic-info h1 {
                    color: #8B4513;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .clinic-info p {
                    color: #666;
                    font-size: 14px;
                }
                
                .patient-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 5px;
                }
                
                .info-field {
                    display: flex;
                    align-items: center;
                }
                
                .info-field label {
                    font-weight: bold;
                    margin-right: 10px;
                    min-width: 120px;
                    color: #333;
                }
                
                .info-field span {
                    color: #666;
                }
                
                .prescription-section h2 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .prescription-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                }
                
                .prescription-table th {
                    background: #f8f8f8;
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                    color: #333;
                }
                
                .prescription-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    vertical-align: top;
                }
                
                .prescription-table tr:nth-child(even) {
                    background: #fafafa;
                }
                
                .medication-name {
                    font-weight: bold;
                    color: #333;
                }
                
                .cost-cell {
                    text-align: right;
                    font-weight: bold;
                }
                
                .status-cell {
                    font-style: italic;
                    color: #666;
                }
                
                .total-row {
                    background: #f0f0f0 !important;
                    font-weight: bold;
                }
                
                .total-row td {
                    border-top: 2px solid #333;
                    padding: 15px 12px;
                }
                
                .prescription-footer {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                }
                
                .website-info {
                    font-size: 12px;
                    color: #666;
                }
                
                .doctor-signature {
                    text-align: center;
                }
                
                .signature-area {
                    width: 150px;
                    height: 60px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: end;
                    justify-content: center;
                    font-family: cursive;
                    font-size: 18px;
                    color: #333;
                }
                
                .doctor-name {
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="prescription-container">
                <div class="header">
                    <div class="logo">AR</div>
                    <div class="clinic-info">
                        <h1>${data.clinicInfo.name}</h1>
                        <p>${data.clinicInfo.subtitle}</p>
                    </div>
                </div>

                <div class="patient-info">
                    <div class="info-field">
                        <label>Patient Name:</label>
                        <span>${data.patient.name}</span>
                    </div>
                    <div class="info-field">
                        <label>UHID:</label>
                        <span>${data.patient.uhid}</span>
                    </div>
                    <div class="info-field">
                        <label>Gender:</label>
                        <span>${data.patient.gender}</span>
                    </div>
                    <div class="info-field">
                        <label>TID:</label>
                        <span>${data.patient.prfid}</span>
                    </div>
                    <div class="info-field">
                        <label>DOB:</label>
                        <span>${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div class="info-field">
                        <label>Mobile:</label>
                        <span>${data.patient.mobile}</span>
                    </div>
                    <div class="info-field">
                        <label>Consultant Doctor:</label>
                        <span>${data.patient.doctor}</span>
                    </div>
                    <div class="info-field">
                        <label>City:</label>
                        <span>${data.patient.city}</span>
                    </div>
                </div>

                <div class="prescription-section">
                    <h2>Treatment</h2>
                    <table class="prescription-table">
                        <thead>
                            <tr>
                                <th style="width: 10%">S.No.</th>
                                <th style="width: 40%">Treatment Name</th>
                                <th style="width: 15%">Qty/Day</th>
                                <th style="width: 15%">Cost (₹)</th>
                                <th style="width: 10%">Status</th>
                                <th style="width: 10%">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.treatments.map((treatment, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <div class="medication-name">${treatment.name}</div>
                                    </td>
                                    <td>${treatment.qtyPerDay}</td>
                                    <td class="cost-cell">${treatment.cost.toFixed(1)}</td>
                                    <td class="status-cell">${treatment.status}</td>
                                    <td class="cost-cell">${treatment.total.toFixed(1)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3"></td>
                                <td class="cost-cell"><strong>Total Cost : ${data.totalCost.toFixed(1)}</strong></td>
                                <td></td>
                                <td class="cost-cell"><strong>Grand Total : ${data.grandTotal.toFixed(1)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="prescription-footer">
                    <div class="website-info">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature">
                        <div class="signature-area">Dr. Kunte</div>
                        <div class="doctor-name">${data.patient.doctor}</div>
                    </div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
        `;

        pdfWindow.document.write(pdfContent);
        pdfWindow.document.close();

        console.log('Treatment Plan PDF generated successfully!');
    };

    // Function to generate invoice PDF
    const generateInvoicePDF = (data: any) => {
        const pdfWindow = window.open('', '_blank');

        const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Invoice - ${data.patient.name}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: #333;
                    padding: 20px;
                    background: white;
                }
                
                .prescription-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #8B4513;
                    padding-bottom: 20px;
                }
                
                .logo {
                    width: 80px;
                    height: 80px;
                    background: #D2B48C;
                    border-radius: 50%;
                    margin-right: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #8B4513;
                    font-weight: bold;
                }
                
                .clinic-info h1 {
                    color: #8B4513;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .clinic-info p {
                    color: #666;
                    font-size: 14px;
                }
                
                .patient-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 5px;
                }
                
                .info-field {
                    display: flex;
                    align-items: center;
                }
                
                .info-field label {
                    font-weight: bold;
                    margin-right: 10px;
                    min-width: 120px;
                    color: #333;
                }
                
                .info-field span {
                    color: #666;
                }
                
                .prescription-section h2 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .prescription-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                }
                
                .prescription-table th {
                    background: #f8f8f8;
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                    color: #333;
                }
                
                .prescription-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    vertical-align: top;
                }
                
                .prescription-table tr:nth-child(even) {
                    background: #fafafa;
                }
                
                .medication-name {
                    font-weight: bold;
                    color: #333;
                }
                
                .cost-cell {
                    text-align: right;
                    font-weight: bold;
                }
                
                .total-row {
                    background: #f0f0f0 !important;
                    font-weight: bold;
                }
                
                .total-row td {
                    border-top: 2px solid #333;
                    padding: 15px 12px;
                }
                
                .prescription-footer {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                }
                
                .website-info {
                    font-size: 12px;
                    color: #666;
                }
                
                .doctor-signature {
                    text-align: center;
                }
                
                .signature-area {
                    width: 150px;
                    height: 60px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: end;
                    justify-content: center;
                    font-family: cursive;
                    font-size: 18px;
                    color: #333;
                }
                
                .doctor-name {
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="prescription-container">
                <div class="header">
                    <div class="logo">AR</div>
                    <div class="clinic-info">
                        <h1>${data.clinicInfo.name}</h1>
                        <p>${data.clinicInfo.subtitle}</p>
                    </div>
                </div>

                <div class="patient-info">
                    <div class="info-field">
                        <label>Patient Name:</label>
                        <span>${data.patient.name}</span>
                    </div>
                    <div class="info-field">
                        <label>UHID:</label>
                        <span>${data.patient.uhid}</span>
                    </div>
                    <div class="info-field">
                        <label>Gender:</label>
                        <span>${data.patient.gender}</span>
                    </div>
                    <div class="info-field">
                        <label>INVID:</label>
                        <span>${data.patient.invid}</span>
                    </div>
                    <div class="info-field">
                        <label>DOB:</label>
                        <span>${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div class="info-field">
                        <label>Date:</label>
                        <span>${data.patient.date}</span>
                    </div>
                    <div class="info-field">
                        <label>Mobile:</label>
                        <span>${data.patient.mobile}</span>
                    </div>
                    <div class="info-field">
                        <label>City:</label>
                        <span>${data.patient.city}</span>
                    </div>
                </div>

                <div class="prescription-section">
                    <h2>Invoice</h2>
                    <table class="prescription-table">
                        <thead>
                            <tr>
                                <th style="width: 10%">S.No.</th>
                                <th style="width: 40%">Service/Product</th>
                                <th style="width: 15%">Qty/Day</th>
                                <th style="width: 17.5%">Cost (₹)</th>
                                <th style="width: 17.5%">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.services.map((service, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>
                                        <div class="medication-name">${service.name}</div>
                                    </td>
                                    <td>${service.qtyPerDay}</td>
                                    <td class="cost-cell">${service.cost.toFixed(1)}</td>
                                    <td class="cost-cell">${service.total.toFixed(1)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3"></td>
                                <td class="cost-cell"><strong>Total Cost : ${data.totalCost.toFixed(1)}</strong></td>
                                <td class="cost-cell"><strong>Grand Total : ${data.grandTotal.toFixed(1)}</strong></td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3"></td>
                                <td class="cost-cell"><strong>Paid : ${data.paid.toFixed(1)}</strong></td>
                                <td class="cost-cell"><strong>Balance : ${data.balance.toFixed(1)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="prescription-footer">
                    <div class="website-info">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature">
                        <div class="signature-area">Dr. Kunte</div>
                        <div class="doctor-name">Dr. Varun R Kunte</div>
                    </div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
        `;

        pdfWindow.document.write(pdfContent);
        pdfWindow.document.close();

        console.log('Invoice PDF generated successfully!');
    };

    // Function to generate receipt PDF
    const generateReceiptPDF = (data: any) => {
        const pdfWindow = window.open('', '_blank');

        const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt - ${data.patient.name}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.4;
                    color: #333;
                    padding: 20px;
                    background: white;
                }
                
                .prescription-container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                }
                
                .header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #8B4513;
                    padding-bottom: 20px;
                }
                
                .logo {
                    width: 80px;
                    height: 80px;
                    background: #D2B48C;
                    border-radius: 50%;
                    margin-right: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #8B4513;
                    font-weight: bold;
                }
                
                .clinic-info h1 {
                    color: #8B4513;
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .clinic-info p {
                    color: #666;
                    font-size: 14px;
                }
                
                .patient-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 30px;
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 5px;
                }
                
                .info-field {
                    display: flex;
                    align-items: center;
                }
                
                .info-field label {
                    font-weight: bold;
                    margin-right: 10px;
                    min-width: 120px;
                    color: #333;
                }
                
                .info-field span {
                    color: #666;
                }
                
                .prescription-section h2 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                
                .prescription-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                    border: 1px solid #ddd;
                }
                
                .prescription-table th {
                    background: #f8f8f8;
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                    font-weight: bold;
                    color: #333;
                }
                
                .prescription-table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    vertical-align: top;
                }
                
                .receipt-footer {
                    margin-top: 30px;
                    text-align: left;
                }
                
                .received-text {
                    font-size: 14px;
                    color: #333;
                    margin-bottom: 10px;
                }
                
                .amount-words {
                    font-size: 14px;
                    color: #333;
                    font-weight: bold;
                }
                
                .prescription-footer {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-between;
                    align-items: end;
                }
                
                .website-info {
                    font-size: 12px;
                    color: #666;
                }
                
                .doctor-signature {
                    text-align: center;
                }
                
                .signature-area {
                    width: 150px;
                    height: 60px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: end;
                    justify-content: center;
                    font-family: cursive;
                    font-size: 18px;
                    color: #333;
                }
                
                .doctor-name {
                    font-weight: bold;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div class="prescription-container">
                <div class="header">
                    <div class="logo">AR</div>
                    <div class="clinic-info">
                        <h1>${data.clinicInfo.name}</h1>
                        <p>${data.clinicInfo.subtitle}</p>
                    </div>
                </div>

                <div class="patient-info">
                    <div class="info-field">
                        <label>Patient Name:</label>
                        <span>${data.patient.name}</span>
                    </div>
                    <div class="info-field">
                        <label>UHID:</label>
                        <span>${data.patient.uhid}</span>
                    </div>
                    <div class="info-field">
                        <label>Gender:</label>
                        <span>${data.patient.gender}</span>
                    </div>
                    <div class="info-field">
                        <label>RECEIPTID:</label>
                        <span>${data.patient.receiptId}</span>
                    </div>
                    <div class="info-field">
                        <label>DOB:</label>
                        <span>${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div class="info-field">
                        <label>Mobile:</label>
                        <span>${data.patient.mobile}</span>
                    </div>
                    <div class="info-field">
                        <label>Consultant Doctor:</label>
                        <span>${data.patient.doctor}</span>
                    </div>
                    <div class="info-field">
                        <label>City:</label>
                        <span>${data.patient.city}</span>
                    </div>
                </div>

                <div class="prescription-section">
                    <h2>Receipt</h2>
                    <table class="prescription-table">
                        <thead>
                            <tr>
                                <th style="width: 15%">Date</th>
                                <th style="width: 20%">Receipt Number</th>
                                <th style="width: 20%">Mode Of Payment</th>
                                <th style="width: 15%">Cheque No.</th>
                                <th style="width: 30%">Amount Paid INR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${data.receipt.date}</td>
                                <td>${data.receipt.receiptNumber}</td>
                                <td>${data.receipt.modeOfPayment}</td>
                                <td>${data.receipt.chequeNo}</td>
                                <td style="text-align: right; font-weight: bold;">${data.receipt.amountPaid.toFixed(1)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="receipt-footer">
                    <div class="received-text">
                        Received with thanks from <strong>${data.patient.name}</strong>
                    </div>
                    <div class="amount-words">
                        The sum of Rupees : ${data.receipt.amountInWords} (${data.receipt.amountPaid.toFixed(1)}) /-
                    </div>
                </div>

                <div class="prescription-footer">
                    <div class="website-info">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature">
                        <div class="signature-area">Dr. Kunte</div>
                        <div class="doctor-name">${data.patient.doctor}</div>
                    </div>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
        `;

        pdfWindow.document.write(pdfContent);
        pdfWindow.document.close();

        console.log('Receipt PDF generated successfully!');
    };

    // Enhanced handleFinalSend to include payload data
    const handleFinalSend = () => {
        const finalPayload = {
            timestamp: new Date().toISOString(),
            patientId: "HF010125ANK1312",
            patientName: "Ankit K.",
            checkedDocuments: Object.keys(checkedItems).filter(key => checkedItems[key]),
            paymentMethod: paymentMethod,
            allActions: actionPayload,
            prescriptionData: prescriptionData,
            treatmentPlanData: treatmentPlanData,
            invoiceData: invoiceData,
            receiptData: receiptData
        };

        console.log('Final Send Payload:', finalPayload);
        console.log('Sending documents...');
        console.log('Checked items:', checkedItems);

        // Here you can send the payload to your API
        // Example: await sendDocumentsToPatient(finalPayload);

        setIsSendModalOpen(false);
    };

    // Enhanced handleCheckboxChange function
    const handleCheckboxChange = (itemName: any) => {
        console.log('Checkbox clicked:', itemName); // Debug log

        setCheckedItems((prev: any) => {
            const newCheckedState = {
                ...prev,
                [itemName]: !prev[itemName]
            };

            console.log('Previous state:', prev[itemName]); // Debug log
            console.log('New state:', newCheckedState[itemName]); // Debug log

            // Special handling for prescription checkbox
            if (itemName === 'prescription' && !prev[itemName]) {
                console.log('Triggering prescription PDF generation...'); // Debug log
                handlePrescriptionCheck();
            }

            // Special handling for treatment plan checkbox
            if (itemName === 'treatmentPlan' && !prev[itemName]) {
                console.log('Triggering treatment plan PDF generation...'); // Debug log
                handleTreatmentPlanCheck();
            }

            // Special handling for invoice checkbox
            if (itemName === 'invoice' && !prev[itemName]) {
                console.log('Triggering invoice PDF generation...'); // Debug log
                handleInvoiceCheck();
            }

            // Special handling for payment receipt checkbox
            if (itemName === 'paymentReceipt' && !prev[itemName]) {
                console.log('Triggering receipt PDF generation...'); // Debug log
                handleReceiptCheck();
            }

            return newCheckedState;
        });
    };

    const CheckboxItem = ({ itemName, label, checked, onChange }) => (
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(itemName)}
                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked
                    ? 'bg-yellow-400 border-yellow-400'
                    : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                    }`}
            >
                {checked && (
                    <span className="text-xs text-black font-bold">✓</span>
                )}
            </button>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );

    // Consent Form Checkbox Component
    const ConsentFormCheckboxItem = ({ itemName, label, checked, onChange }) => (
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(itemName)}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${checked
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
            >
                {checked && (
                    <span className="text-xs text-white font-bold">✓</span>
                )}
            </button>
            <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
    );

    return (
        <DefaultLayout>
            <div className='mx-auto p-4'>
                <div className='flex flex-col lg:flex-row justify-between gap-6 mb-6'>

                    {/* User Profile Card - Your original structure improved */}
                    <div className="relative bg-[#CAE5FF] rounded-2xl mb-8 border border-black w-full max-w-md p-4 md:p-6">

                        {/* HF ID in top-right */}
                        <div className="absolute top-0 right-0 bg-white px-3 py-1 rounded-bl-lg rounded-tr-2xl border-l border-b border-black">
                            <span className="text-xs md:text-sm font-mono text-gray-800">
                                {profileData?.hfId}
                            </span>
                        </div>

                        {/* Main Content */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">

                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
                                    <img
                                        src="/98c4113b37688d826fc939709728223539f249dd.jpg"
                                        alt="User profile"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-blue-800">{profileData?.fullName}</h2>
                                <div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-medium text-gray-600">Blood Group :</span>
                                        <span className="bg-white border border-black text-black text-sm font-medium px-2.5 py-0.5 rounded">
                                            AB-
                                        </span>
                                    </div>
                                </div>

                                {/* More Details */}
                                <div className="mt-3 flex justify-end">
                                    <button className="text-black underline font-semibold text-sm hover:text-gray-700">
                                        More Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Symptoms Diary Section - Your original improved */}
                    <div className="p-4 max-w-sm">
                        <p className="text-gray-700 text-center mb-4 font-medium">
                            Share a Symptoms Diary with the patient.
                        </p>
                        <button className='bg-green text-white font-semibold py-3 px-6 rounded-lg w-full transition-colors'>
                            Send Now
                        </button>
                    </div>
                </div>

                {/* Consent Forms Section - Added to match the design */}
                <div className="bg-white rounded-xl  border border-black ">
                    {/* Dropdown Header */}
                    <button
                        onClick={() => setIsConsentDropdownOpen(!isConsentDropdownOpen)}
                        className="w-full flex items-center justify-between p-4 border-b border-black  transition-colors"
                    >
                        <span className="text-lg font-medium text-black">
                            View and Edit the consent forms filled by the patient.
                        </span>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${isConsentDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Consent Forms Content */}
                    {isConsentDropdownOpen && (
                        <div className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6 mx-4">

                                {/* DTR Consent Form Card */}
                                {consentListData?.map((consentForm: any) => (
                                    <div
                                        key={consentForm.clinicConsentFormId}
                                        className="relative p-4 rounded-xl border border-black transition-all cursor-pointer w-full max-w-md mx-auto"
                                        onClick={() => {
                                            if (consentForm?.consentFormUrl) {
                                                router.push(`/consentForm?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${consentForm.title}&pdf=${consentForm.consentFormUrl}`);
                                            } else {
                                                router.push(`/publicConsentForm?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${consentForm.title}`);
                                            }
                                        }}

                                    >
                                        {/* Logo container */}
                                        <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3">
                                            <img
                                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                                alt="ARTHROSE Logo"
                                                className="max-w-full max-h-full rounded"
                                            />
                                        </div>
                                        <div className="border border-gray-400 mx-auto w-full mt-3"></div>

                                        {/* Title */}
                                        <h3 className="font-semibold text-gray-800 text-md text-center mb-4 mt-4">
                                            {consentForm.title}
                                        </h3>

                                        {/* Verification status dot - Red for false, Green for true */}
                                        <div className={`absolute bottom-3 right-3 w-3 h-3 rounded-full ${consentForm.isVerified ? 'bg-green-600' : 'bg-red-600'
                                            }`}></div>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full flex justify-end">
                                <div className="flex flex-col items-start justify-between gap-4 p-4 border-t border-l border-black ">
                                    <span className="text-gray-700 font-medium">Share another consent form</span>
                                    <div className="w-full justify-center">
                                        <button
                                            className="bg-yellow-300 text-black border border-black font-semibold py-2 px-6 rounded-lg transition-colors"
                                            onClick={handleConsentFormsSendClick}
                                        >
                                            Send Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-black mb-6 mt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-black">
                        <span className="text-lg font-medium text-black">
                            Manage treatment plans, prescriptions, and reports effortlessly.
                        </span>
                        <button className="flex items-center gap-2 px-3 py-1 border border-black rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => router.push("/ClinicShareReports")}>
                            <span className="text-sm font-medium">History</span>
                            <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Patient's Treatment Plan Section */}
                        <div className="mb-8">
                            <h3 className="text-lg flex justify-end font-medium text-blue-800 mb-4">
                                patient's treatment plan :
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                {/* Attach Images Card */}
                                <div className="bg-white rounded-lg p-4">
                                    <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                        <img
                                            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                            alt="ARTHROSE Logo"
                                            className="max-w-20 max-h-20 rounded"
                                        />
                                    </div>
                                    <button className="w-full bg-yellow text-black font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors">
                                        Attach Images
                                    </button>
                                </div>

                                {/* Prescription + Share wrapper with border between */}
                                <div className="col-span-2 flex divide-x divide-black rounded-lg overflow-hidden bg-white">
                                    {/* Prescription */}
                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                                alt="ARTHROSE Logo"
                                                className="max-w-20 max-h-20 rounded"
                                            />
                                        </div>
                                        <button className="w-full bg-yellow text-black font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors"
                                            onClick={() => {
                                                const extractedHfid = searchParams.get("hfid");
                                                const extractedLastVisitId = searchParams.get("visitId");
                                                const extractedPatientId = searchParams.get('patientId');
                                                if (extractedHfid) {
                                                    router.push(`/prescription?hfid=${extractedHfid}&visitId=${extractedLastVisitId}&patientId=${extractedPatientId}`);
                                                } else {
                                                    console.error("HFID not found in URL");
                                                }
                                            }}>
                                            Prescription
                                        </button>
                                    </div>

                                    {/* Share */}
                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                                alt="ARTHROSE Logo"
                                                className="max-w-20 max-h-20 rounded"
                                            />
                                        </div>
                                        <button className="w-full  text-white font-semibold py-2 px-4 rounded-lg primary cursor-pointer transition-colors"
                                            onClick={() => {
                                                const extractedHfid = searchParams.get("hfid");
                                                const extractedLastVisitId = searchParams.get("visitId");
                                                const extractedPatientId = searchParams.get('patientId');
                                                if (extractedHfid) {
                                                    router.push(`/treatmentPlane?hfid=${extractedHfid}&visitId=${extractedLastVisitId}&patientId=${extractedPatientId}`);
                                                } else {
                                                    console.error("HFID not found in URL");
                                                }
                                            }}>
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Send Invoice Details Section */}

                    </div>


                </div>
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-800 mb-4">Send Invoice Details :</h3>

                    <div className="flex  divide-x divide-black gap-4 mb-6">
                        {/* Invoice Share Card */}
                        <div className="bg-white  p-4">
                            <div className="h-45 w-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                    alt="ARTHROSE Logo"
                                    className="max-w-20 max-h-20 rounded"
                                />
                            </div>
                            <button className="w-full primary text-white font-semibold py-2 px-4 rounded-lg  transition-colors"
                                onClick={() => {
                                    const extractedHfid = searchParams.get("hfid");
                                    const extractedLastVisitId = searchParams.get("visitId");
                                    const extractedPatientId = searchParams.get('patientId');
                                    if (extractedHfid) {
                                        router.push(`/invoice?hfid=${extractedHfid}&visitId=${extractedLastVisitId}&patientId=${extractedPatientId}`);
                                    } else {
                                        console.error("HFID not found in URL");
                                    }
                                }}>
                                Share
                            </button>
                        </div>

                        {/* Receipt Card */}
                        <div className="bg-white  rounded-lg p-4">
                            <div className="h-45 w-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                    alt="ARTHROSE Logo"
                                    className="max-w-20 max-h-20 rounded"
                                />
                            </div>
                            <button className="w-full bg-yellow text-black border border-black font-semibold py-2 px-4 rounded-lg  transition-colors"
                              onClick={() => {
                                    const extractedHfid = searchParams.get("hfid");
                                    const extractedLastVisitId = searchParams.get("visitId");
                                    const extractedPatientId = searchParams.get('patientId');
                                    if (extractedHfid) {
                                        router.push(`/receipt?hfid=${extractedHfid}&visitId=${extractedLastVisitId}&patientId=${extractedPatientId}`);
                                    } else {
                                        console.error("HFID not found in URL");
                                    }
                                }}>
                                Receipt
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <button className="w-full sm:flex-1 bg-green text-white font-semibold py-3 px-6 rounded-lg  transition-colors">
                        Make sure all details are correct before proceeding.
                    </button>
                    <button
                        className="w-full sm:w-auto primary text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        onClick={handleSendClick}
                    >
                        Send
                    </button>
                </div>

                {/* Send Confirmation Modal */}
                {isSendModalOpen && (
                    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
                            {/* Modal Header */}
                            <div className="text-center mb-6 pb-4 border-b border-gray-300">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Check the following details before sending
                                </h2>
                                <button
                                    onClick={handleModalClose}
                                    className="absolute top-4 right-4 text-black hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Section - Document Checklist */}
                                <div>
                                    {/* Documents being sent */}
                                    <div className=" border border-black rounded-lg p-4 mb-6">
                                        <p className="text-sm text-blue-700 font-medium mb-4">
                                            You're about to send the following documents to the patient :
                                        </p>

                                        <div className="space-y-3">
                                            <CheckboxItem
                                                itemName="prescription"
                                                label="Prescription"
                                                checked={checkedItems.prescription}
                                                onChange={handleCheckboxChange}
                                            />
                                            <CheckboxItem
                                                itemName="reportImages"
                                                label="Report Images"
                                                checked={checkedItems.reportImages}
                                                onChange={handleCheckboxChange}
                                            />
                                            <CheckboxItem
                                                itemName="paymentReceipt"
                                                label="Payment Receipt"
                                                checked={checkedItems.paymentReceipt}
                                                onChange={handleCheckboxChange}
                                            />
                                            <div className="mb-6">
                                                <p className="text-sm font-semibold text-blue-800 mb-1">
                                                    Invoice and Treatment Plan :
                                                </p>
                                                <p className="text-xs text-gray-500 mb-4">
                                                    (verify here. Invoice & Treatment)
                                                </p>

                                                <div className="space-y-3">
                                                    <CheckboxItem
                                                        itemName="invoice"
                                                        label="Invoice"
                                                        checked={checkedItems.invoice}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                    <CheckboxItem
                                                        itemName="treatmentPlan"
                                                        label="Treatment Plan"
                                                        checked={checkedItems.treatmentPlan}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice and Treatment Plan */}
                                </div>

                                {/* Right Section */}
                                <div className="space-y-6">
                                    {/* Payment Method */}
                                    <div className="flex items-center gap-4 rounded-sm bg-[#CAE5FF] ">
                                        <label className="text-sm font-semibold text-blue-800 w-30 mx-2">
                                            Payment Method :
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="flex-1 border border-black bg-white rounded-lg px-4 py-1 text-sm font-medium  mx-2"
                                        >
                                            <option>Credit Card</option>
                                            <option>Debit Card</option>
                                            <option>Cash</option>
                                            <option>Bank Transfer</option>
                                        </select>
                                    </div>


                                    {/* Illustration */}
                                    <div className="flex items-center justify-center">
                                        <img
                                            src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                                            alt="Doctor illustration"
                                            className="w-64 h-48 object-contain"
                                        />
                                    </div>
                                    <div className="flex justify-end mt-2 pt-2 ">
                                        <button
                                            onClick={handleFinalSend}
                                            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                        </div>
                    </div>
                )}

                {/* Consent Forms Selection Modal */}
                {isConsentFormsModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-gray-200">
                            {/* Modal Header */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-300">
                                <Clipboard className="w-6 h-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Select Forms to Send
                                </h2>
                                <button
                                    onClick={handleConsentFormsModalClose}
                                    className="ml-auto text-black hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Consent Forms List */}
                            <div className="space-y-4 mb-6">
                                <ConsentFormCheckboxItem
                                    itemName="dtrConsent"
                                    label="DTR Consent"
                                    checked={consentFormsChecked.dtrConsent}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                                <ConsentFormCheckboxItem
                                    itemName="tmdTmjpConsent"
                                    label="TMD/TMJP Consent"
                                    checked={consentFormsChecked.tmdTmjpConsent}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                                <ConsentFormCheckboxItem
                                    itemName="photoConsent"
                                    label="Photo Consent"
                                    checked={consentFormsChecked.photoConsent}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                                <ConsentFormCheckboxItem
                                    itemName="arthroseScreeningConsent"
                                    label="Arthrose Functional Screening Consent"
                                    checked={consentFormsChecked.arthroseScreeningConsent}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleConsentFormsModalClose}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConsentFormsFinalSend}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={!Object.values(consentFormsChecked).some(Boolean)}
                                >
                                    Send Selected Forms
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DefaultLayout>
    )
}

export default page