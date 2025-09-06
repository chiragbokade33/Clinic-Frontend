'use client'
export const runtime = "edge";           // ✅ Run on Edge runtime
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from 'react'
import { ChevronDown, X, Clipboard } from 'lucide-react'
import DefaultLayout from '../components/DefaultLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';
import { Listconsent, ListJsondata, ListProfile, UploadeallData } from '../services/ClinicServiceApi';
import { getUserId } from '../hooks/GetitemsLocal';
import FileUploadModal from '../components/FileUploadModal';
import Profiledetails from '../components/TreatMentdetailsData/Profiledetails';

// Add these imports at the top of your component
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast, ToastContainer } from 'react-toastify';

const page = () => {
    const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isConsentFormsModalOpen, setIsConsentFormsModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CreditCard');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSending, setIsSending] = useState(false);

    // Enhanced state for tracking actions and PDF data
    const [actionPayload, setActionPayload] = useState([]);
    const [prescriptionData, setPrescriptionData] = useState(null);
    const [treatmentPlanData, setTreatmentPlanData] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null) as any;
    const [receiptData, setReceiptData] = useState(null);
    const [consentListData, setConsentListData] = useState() as any;
    const [profileData, setProfileData] = useState() as any;
    const [currentUserId, setCurrentUserId] = useState<number>();
    const [treatmentData, setTreatmentData] = useState([]) as any;
    const [prescriptionPdf, setPrescriptionPdf] = useState() as any;
    const [receiptApiData, setReceiptApiData] = useState(null);
    const [reportImagesData, setReportImagesData] = useState(null);

    // File storage states
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [treatmentPlanFile, setTreatmentPlanFile] = useState<File | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [reportImagesFile, setReportImagesFile] = useState<File | null>(null);
    const [imgAttechData, setImgAttechData] = useState();

    // NEW: Add loading states for each document type
    const [loadingStates, setLoadingStates] = useState({
        prescription: false,
        Images: false,
        Receipt: false,
        invoice: false,
        Treatment: false
    });

    useEffect(() => {
        const FetchDatajson = async () => {
            const extractedHfid = searchParams.get("hfid");
            const extractedLastVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get("patientId");
            if (!extractedHfid) return;

            const id = await getUserId();
            setCurrentUserId(id);

            try {
                const response = await ListJsondata(id, Number(extractedPatientId), Number(extractedLastVisitId));
                const apiData = response.data.data;

                const viewImgs = apiData.filter(
                    (item: { type: string }) => item.type === "Images" || item.type === "Reports"
                );

                if (viewImgs.length > 0) {
                    const allUrls = viewImgs.flatMap((entry: { jsonData: string }) => {
                        const parsed = JSON.parse(entry.jsonData);

                        if (Array.isArray(parsed)) {
                            return parsed; // directly array of URLs
                        } else if (parsed.images || parsed.reports) {
                            return parsed.images || parsed.reports;
                        }
                        return [];
                    });

                    setImgAttechData(allUrls);
                } else {
                    setImgAttechData([]);
                }

                // ✅ Find Treatment data
                const treatmentEntry = apiData.find((item: { type: string }) => item.type === "Treatment");
                if (treatmentEntry) {
                    const parsed = JSON.parse(treatmentEntry.jsonData);
                    const normalized = {
                        patient: {
                            name: parsed.patient.name,
                            uhid: parsed.patient.hfid,
                            prfid: parsed.patient.tid,
                            gender: parsed.patient.gender,
                            dob: parsed.patient.dob,
                            mobile: parsed.patient.mobile,
                            doctor: parsed.patient.doctor,
                            city: parsed.patient.city,
                        },
                        treatments: parsed.treatments.map((t: any) => ({
                            name: t.name,
                            frequency: t.frequency,
                            cost: t.cost,
                            status: t.status,
                            total: t.total,
                        })),
                        totalCost: parsed.totalCost,
                        grandTotal: parsed.grandTotal,
                        clinicInfo: {
                            name: parsed.clinicInfo.name,
                            subtitle: parsed.clinicInfo.subtitle,
                            website: parsed.clinicInfo.website,
                        },
                    };

                    setTreatmentData(normalized || []);
                }

                // ✅ Find Invoice data
                const invoiceEntry = apiData.find((item: { type: string }) => item.type === "Invoice");
                if (invoiceEntry) {
                    const parsed = JSON.parse(invoiceEntry.jsonData);
                    const normalizedInvoiceData = {
                        patient: {
                            name: parsed.patient.name,
                            uhid: parsed.patient.hfid,
                            gender: parsed.patient.gender,
                            invid: parsed.patient.invid,
                            dob: parsed.patient.dob,
                            date: parsed.patient.date,
                            mobile: parsed.patient.mobile,
                            city: parsed.patient.city
                        },
                        services: parsed.services,
                        totalCost: parsed.totalCost,
                        grandTotal: parsed.grandTotal,
                        paid: parsed.paid,
                        balance: parsed.grandTotal - parsed.paid,
                        clinicInfo: parsed.clinicInfo
                    };

                    setInvoiceData(normalizedInvoiceData);
                }

                // ✅ Find Prescription data
                const PrescripationEntry = apiData.find((item: { type: string }) => item.type === "Prescription");
                if (PrescripationEntry) {
                    const parsed = JSON.parse(PrescripationEntry.jsonData);
                    const normalized = {
                        patient: {
                            name: parsed.patient.name,
                            uhid: parsed.patient.hfid,
                            prfid: parsed.patient.prfid,
                            gender: parsed.patient.gender,
                            dob: parsed.patient.dob,
                            mobile: parsed.patient.mobile,
                            doctor: parsed.patient.doctor,
                            city: parsed.patient.city,
                            bloodGroup: parsed.patient.bloodGroup || "",
                        },
                        medications: parsed.medications,
                        clinicInfo: parsed.clinicInfo,
                        timestamp: parsed.timestamp,
                        prescriptionId: parsed.prescriptionId
                    };

                    setPrescriptionPdf(normalized);
                }

                const ReceiptEntry = apiData.find((item: { type: string }) => item.type === "Receipt");
                if (ReceiptEntry) {
                    const parsed = JSON.parse(ReceiptEntry.jsonData);
                    const normalizedReceiptData: any = {
                        patient: {
                            name: parsed.patient.name,
                            uhid: parsed.patient.uhid,
                            gender: parsed.patient.gender,
                            receiptId: parsed.patient.receiptId || parsed.patient.prfid,
                            dob: parsed.patient.dob,
                            doctor: parsed.patient.doctor || "Priyanka",
                            mobile: parsed.patient.mobile,
                            city: parsed.patient.city
                        },
                        receipt: {
                            date: parsed.receipt.date,
                            receiptNumber: parsed.receipt.receiptNumber,
                            modeOfPayment: parsed.receipt.modeOfPayment,
                            chequeNo: parsed.receipt.chequeNo,
                            amountPaid: parsed.receipt.amountPaid,
                            amountInWords: parsed.receipt.amountInWords
                        },
                        clinicInfo: parsed.clinicInfo
                    };

                    setReceiptApiData(normalizedReceiptData);
                }

                const reportImagesEntry = apiData.find((item: { type: string }) => item.type === "Images" || item.type === "Reports");
                if (reportImagesEntry) {
                    const parsed = JSON.parse(reportImagesEntry.jsonData);
                    const normalizedImagesData: any = {
                        patient: {
                            name: parsed.patient.name,
                            uhid: parsed.patient.hfid,
                            gender: parsed.patient.gender,
                            dob: parsed.patient.dob,
                            mobile: parsed.patient.mobile,
                            city: parsed.patient.city
                        },
                        images: parsed.images || parsed.reports || [],
                        totalImages: parsed.images?.length || parsed.reports?.length || 0,
                        clinicInfo: parsed.clinicInfo,
                        uploadDate: parsed.uploadDate || new Date().toISOString()
                    };

                    setReportImagesData(normalizedImagesData);
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

    // Checkbox states for documents
    const [checkedItems, setCheckedItems] = useState({
        prescription: false,
        Images: false,
        Receipt: false,
        invoice: false,
        Treatment: false
    }) as any;

    // Checkbox states for consent forms
    const [consentFormsChecked, setConsentFormsChecked] = useState({
        high5RegistrationForm: false,
        high5WaiverForm: false,
        high5TermsAndConditions: false,
        high5PostnatalQuestionnaire: false
    }) as any;

    const convertDateFormat = (dateString: { split: (arg0: string) => [any, any, any]; }) => {
        if (!dateString) return null;

        try {
            const [day, month, year] = dateString.split('-');
            const convertedDate = `${year}-${month}-${day}`;
            return convertedDate;
        } catch (error) {
            return dateString;
        }
    };

    useEffect(() => {
        const extractParamsAndCallAPI = async () => {
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
                    console.error("Error fetching consent:", error);
                }
            }
        };

        extractParamsAndCallAPI();
    }, [searchParams]);

    // Handle consent forms modal
    const handleConsentFormsSendClick = () => {
        setIsConsentFormsModalOpen(true);
    };

    const handleConsentFormsModalClose = () => {
        setIsConsentFormsModalOpen(false);
    };

    const handleConsentFormCheckboxChange = (formName: string | number) => {
        setConsentFormsChecked((prev: any) => ({
            ...prev,
            [formName]: !prev[formName]
        }));
    };

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

    // UPDATED: Make all PDF generation functions properly async
    const handlePrescriptionCheck = async () => {
        if (!prescriptionPdf) {
            console.warn("No prescription data found!");
            throw new Error("No prescription data available");
        }

        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'prescription_checked',
            patientId: prescriptionPdf.patient.uhid,
            documentType: 'prescription',
            data: prescriptionPdf
        };

        setActionPayload(prev => [...prev, actionData]);
        setPrescriptionData(prescriptionPdf);

        console.log('Prescription Action Payload:', actionData);

        const file = await generatePrescriptionPDF(prescriptionPdf);
        if (!file) {
            throw new Error("Failed to generate prescription PDF");
        }

        setPrescriptionFile(file);
        console.log('✅ Prescription file set successfully');
    };

    const handleTreatmentPlanCheck = async () => {
        if (!treatmentData || !treatmentData.patient) {
            console.warn("No treatment data found!");
            throw new Error("No treatment data available");
        }

        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'treatment_plan_checked',
            patientId: treatmentData.patient.uhid,
            documentType: 'treatment_plan',
            data: treatmentData
        };

        setActionPayload(prev => [...prev, actionData]);
        setTreatmentPlanData(treatmentData);

        console.log('Treatment Plan Action Payload:', actionData);

        const file = await generateTreatmentPlanPDF(treatmentData);
        if (!file) {
            throw new Error("Failed to generate treatment plan PDF");
        }

        setTreatmentPlanFile(file);
        console.log('✅ Treatment plan file set successfully');
    };

    const handleReceiptCheck = async () => {
        console.log('Receipt checkbox clicked - Generating PDF...');

        let receiptDataForPDF;

        const convertNumberToWords = (amount: any) => {
            if (amount === 1000) return "One Thousand Only";
            if (amount === 1400) return "One Thousand Four Hundred Only";
            if (amount === 130000) return "One Lakh Thirty Thousand Only";
            return `${amount.toLocaleString('en-IN')} Only`;
        };

        const formatReceiptDate = (inputDate = null) => {
            const date = inputDate ? new Date(inputDate) : new Date();

            if (isNaN(date.getTime())) {
                console.warn('Invalid date provided, using current date');
                return new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            }

            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        // Priority logic for receipt data
        if (receiptApiData) {
            console.log('Using Receipt API data');
            receiptDataForPDF = {
                ...receiptApiData,
                receipt: {
                    ...receiptApiData.receipt,
                    date: formatReceiptDate(receiptApiData.receipt.date)
                }
            };
        } else if (invoiceData) {
            console.log('Generating receipt from Invoice data');
            receiptDataForPDF = {
                patient: {
                    name: invoiceData.patient.name,
                    uhid: invoiceData.patient.uhid,
                    gender: invoiceData.patient.gender,
                    receiptId: `RC${Math.floor(Math.random() * 9999)}`,
                    dob: invoiceData.patient.dob,
                    doctor: "Priyanka",
                    mobile: invoiceData.patient.mobile,
                    city: invoiceData.patient.city
                },
                receipt: {
                    date: formatReceiptDate(invoiceData.patient.date),
                    receiptNumber: `Rc.${Math.floor(Math.random() * 9999)}`,
                    modeOfPayment: paymentMethod,
                    chequeNo: paymentMethod === 'Cash' ? '-' : 'N/A',
                    amountPaid: invoiceData.paid,
                    amountInWords: convertNumberToWords(invoiceData.paid)
                },
                clinicInfo: invoiceData.clinicInfo
            };
        } else if (treatmentData) {
            console.log('Generating receipt from Treatment data');
            receiptDataForPDF = {
                patient: {
                    name: treatmentData.patient.name,
                    uhid: treatmentData.patient.uhid,
                    gender: treatmentData.patient.gender,
                    receiptId: treatmentData.patient.prfid,
                    dob: treatmentData.patient.dob,
                    doctor: treatmentData.patient.doctor,
                    mobile: treatmentData.patient.mobile,
                    city: treatmentData.patient.city
                },
                receipt: {
                    date: formatReceiptDate(),
                    receiptNumber: `Rc.${Math.floor(Math.random() * 9999)}`,
                    modeOfPayment: paymentMethod,
                    chequeNo: paymentMethod === 'Cash' ? '-' : 'N/A',
                    amountPaid: treatmentData.grandTotal,
                    amountInWords: convertNumberToWords(treatmentData.grandTotal)
                },
                clinicInfo: treatmentData.clinicInfo
            };
        } else {
            console.warn("No data available for receipt generation!");
            throw new Error("No data available for receipt generation");
        }

        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'receipt_checked',
            patientId: receiptDataForPDF.patient.uhid,
            documentType: 'receipt',
            data: receiptDataForPDF
        };

        setActionPayload(prev => [...prev, actionData]);
        setReceiptData(receiptDataForPDF);

        console.log('Receipt Action Payload:', actionData);

        const file = await generateReceiptPDF(receiptDataForPDF);
        if (!file) {
            throw new Error("Failed to generate receipt PDF");
        }

        setReceiptFile(file);
        console.log('✅ Receipt file set successfully');
    };

    const handleInvoiceCheck = async () => {
        if (!invoiceData) {
            console.warn("No invoice data found!");
            throw new Error("No invoice data available");
        }

        const invoiceDataForPDF = {
            patient: {
                name: invoiceData.patient.name,
                uhid: invoiceData.patient.uhid,
                gender: invoiceData.patient.gender,
                invid: invoiceData.patient.invid,
                dob: invoiceData.patient.dob,
                date: invoiceData.patient.date,
                mobile: invoiceData.patient.mobile,
                city: invoiceData.patient.city
            },
            services: invoiceData.services,
            totalCost: invoiceData.totalCost,
            grandTotal: invoiceData.grandTotal,
            paid: invoiceData.paid,
            balance: invoiceData.balance || 0,
            clinicInfo: invoiceData.clinicInfo
        };

        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'invoice_checked',
            patientId: invoiceData.patient.uhid,
            documentType: 'invoice',
            data: invoiceDataForPDF
        };

        setActionPayload(prev => [...prev, actionData]);

        console.log('Invoice Action Payload:', actionData);

        const file = await generateInvoicePDF(invoiceDataForPDF);
        if (!file) {
            throw new Error("Failed to generate invoice PDF");
        }

        setInvoiceFile(file);
        console.log('✅ Invoice file set successfully');
    };

    // NEW: Add Images handler function
    const handleImagesCheck = async () => {
        if (!reportImagesData && !imgAttechData) {
            console.warn("No images data found!");
            throw new Error("No images data available");
        }

        let imagesDataForPayload;

        if (reportImagesData) {
            imagesDataForPayload = reportImagesData;
        } else if (imgAttechData && imgAttechData.length > 0) {
            imagesDataForPayload = {
                patient: profileData ? {
                    name: profileData.firstName + ' ' + profileData.lastName,
                    uhid: profileData.hfid,
                    gender: profileData.gender,
                    dob: profileData.dob,
                    mobile: profileData.mobile,
                    city: profileData.city
                } : {
                    name: 'N/A',
                    uhid: 'N/A',
                    gender: 'N/A',
                    dob: 'N/A',
                    mobile: 'N/A',
                    city: 'N/A'
                },
                images: imgAttechData,
                totalImages: imgAttechData.length,
                clinicInfo: {
                    website: 'www.hfiles.in'
                },
                uploadDate: new Date().toISOString()
            };
        } else {
            console.warn("No images available!");
            throw new Error("No images available");
        }

        const actionData = {
            timestamp: new Date().toISOString(),
            action: 'images_checked',
            patientId: imagesDataForPayload.patient.uhid,
            documentType: 'images',
            data: imagesDataForPayload
        };

        setActionPayload(prev => [...prev, actionData]);

        // Store images data for sending (NO PDF generation)
        setReportImagesData(imagesDataForPayload);

        console.log('Images Action Payload:', actionData);
        console.log('✅ Images payload prepared - NO PDF generated');

        // Important: Do NOT set any file for images
        // setReportImagesFile(null); // Keep this null for images
    };

    const generatePrescriptionPDF = async (data: any) => {
        try {
            // Create a temporary div for PDF content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.fontFamily = 'Arial, sans-serif';

            tempDiv.innerHTML = `
            <div class="prescription-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 30px;">
                <!-- Header Section -->
                 <div class="header" style="display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #8B4513; padding-bottom: 20px;">
                <div class="logo" style="width: 180px; height: 100px; margin-right: 20px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png" 
                        alt="Clinic Logo"
                        style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
            </div>

                <!-- Patient Information Grid -->
                <div class="patient-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 5px;">
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Patient Name:</label>
                        <span style="color: #666;">${data.patient.name}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">UHID:</label>
                        <span style="color: #666;">${data.patient.uhid}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Gender:</label>
                        <span style="color: #666;">${data.patient.gender}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">PRFID:</label>
                        <span style="color: #666;">${data.patient.prfid}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">DOB:</label>
                        <span style="color: #666;">${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Mobile:</label>
                        <span style="color: #666;">${data.patient.mobile}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Consultant Coach:</label>
                        <span style="color: #666;">${data.patient.doctor}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">City:</label>
                        <span style="color: #666;">${data.patient.city}</span>
                    </div>
                </div>

                <!-- Prescription Section -->
                <div class="prescription-section">
                    <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Prescription</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
                        <thead>
                            <tr>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 10%;">S.No.</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 35%;">Medication</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 15%;">Dosage</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 20%;">Frequency</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 20%;">Timing</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.medications.map((med, index) => `
                                <tr style="${index % 2 === 1 ? 'background: #fafafa;' : ''}">
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${index + 1}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">
                                        <div style="font-weight: bold; color: #333;">${med.name}</div>
                                        ${med.instruction ? `<div style="font-size: 12px; color: #666; font-style: italic; margin-top: 3px;">Instruction: ${med.instruction}</div>` : ''}
                                    </td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${med.dosage}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${med.frequency}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${med.timing}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Footer Section -->
                <div class="prescription-footer" style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end;">
                    <div class="website-info" style="font-size: 12px; color: #666;">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature" style="text-align: center;">
                        <div style="width: 150px; height: 60px; border-bottom: 1px solid #333; margin-bottom: 10px; display: flex; align-items: end; justify-content: center; font-family: cursive; font-size: 18px; color: #333;">
                          Priyanka
                        </div>
                        <div style="font-weight: bold; color: #333;">${data.patient.doctor}</div>
                    </div>
                </div>
            </div>
        `;

            // Append to body temporarily
            document.body.appendChild(tempDiv);

            // Convert to canvas
            const canvas = await html2canvas(tempDiv, {
                width: 800,
                height: tempDiv.scrollHeight,
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Remove the temporary div
            document.body.removeChild(tempDiv);

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Calculate dimensions to fit A4
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));

            // If content is taller than one page, add additional pages
            if (imgHeight > pdfHeight - 20) {
                let remainingHeight = imgHeight - (pdfHeight - 20);
                let yPosition = -(pdfHeight - 20);

                while (remainingHeight > 0) {
                    pdf.addPage();
                    const pageHeight = Math.min(remainingHeight, pdfHeight - 20);
                    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
                    remainingHeight -= pageHeight;
                    yPosition -= pdfHeight;
                }
            }

            // Convert PDF to blob and create file
            const pdfBlob = pdf.output('blob');
            const fileName = `prescription_${data.patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            console.log('✅ Prescription PDF generated successfully!', fileName);

            return file;

        } catch (error) {
            console.error('❌ Error generating prescription PDF:', error);
            return null;
        }
    };

    const generateTreatmentPlanPDF = async (data: any) => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.fontFamily = 'Arial, sans-serif';

            tempDiv.innerHTML = `
            <div class="treatment-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 30px;">
                <!-- Header Section -->
        <div class="header" style="display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #8B4513; padding-bottom: 20px;">
                <div class="logo" style="width: 180px; height: 100px; margin-right: 20px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png" 
                        alt="Clinic Logo"
                        style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
            </div>

                <!-- Patient Information -->
                 <div class="patient-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 5px;">
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Patient Name:</label>
                        <span style="color: #666;">${data.patient.name}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">UHID:</label>
                        <span style="color: #666;">${data.patient.uhid}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Gender:</label>
                        <span style="color: #666;">${data.patient.gender}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">PRFID:</label>
                        <span style="color: #666;">${data.patient.prfid}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">DOB:</label>
                        <span style="color: #666;">${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Mobile:</label>
                        <span style="color: #666;">${data.patient.mobile}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Consultant Coach:</label>
                        <span style="color: #666;">${data.patient.doctor}</span>
                    </div>
                    <div class="info-field" style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">City:</label>
                        <span style="color: #666;">${data.patient.city}</span>
                    </div>
                </div>

                <!-- Treatment Section -->
                <div class="treatment-section">
                    <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Treatment Plan</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
                        <thead>
                            <tr>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">S.No.</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Package</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Frequency</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Cost (₹)</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Status</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.treatments.map((treatment, index) => `
                                <tr style="${index % 2 === 1 ? 'background: #fafafa;' : ''}">
                                    <td style="border: 1px solid #ddd; padding: 12px;">${index + 1}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">${treatment.name}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px;">${treatment.frequency}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: left;">${treatment.cost.toFixed(2)}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; font-style: italic;">${treatment.status}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">${treatment.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr style="background: #f0f0f0; font-weight: bold;">
                                <td colspan="3" style="border: 2px solid #333; padding: 15px;"></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: left;">
                                    <strong>Total: ${data.totalCost.toFixed(2)}</strong>
                                </td>
                                <td style="border: 2px solid #333; padding: 15px;"></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: left;">
                                    <strong>Grand Total: ${data.grandTotal.toFixed(2)}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Footer -->
                <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end;">
                    <div style="font-size: 12px; color: #666;">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div style="text-align: center;">
                        <div style="width: 150px; height: 60px; border-bottom: 1px solid #333; margin-bottom: 10px; display: flex; align-items: end; justify-content: center; font-family: cursive; font-size: 18px; color: #333;">
                           Priyanka
                        </div>
                        <div style="font-weight: bold; color: #333;">${data.patient.doctor}</div>
                    </div>
                </div>
            </div>
        `;

            document.body.appendChild(tempDiv);

            const canvas = await html2canvas(tempDiv, {
                width: 800,
                height: tempDiv.scrollHeight,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            document.body.removeChild(tempDiv);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));

            const pdfBlob = pdf.output('blob');
            const fileName = `treatment_plan_${data.patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            console.log('✅ Treatment Plan PDF generated successfully!', fileName);

            return file;

        } catch (error) {
            console.error('❌ Error generating treatment plan PDF:', error);
            return null;
        }
    };

    const generateInvoicePDF = async (data: any) => {
        try {
            // Create a temporary div for PDF content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.fontFamily = 'Arial, sans-serif';

            tempDiv.innerHTML = `
            <div class="invoice-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 30px;">
                <!-- Header Section -->
                 <div class="header" style="display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #8B4513; padding-bottom: 20px;">
                <div class="logo" style="width: 180px; height: 100px; margin-right: 20px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png" 
                        alt="Clinic Logo"
                        style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
            </div>

                <!-- Patient Information Grid -->
                <div class="patient-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 5px;">
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Patient Name:</label>
                        <span style="color: #666;">${data.patient.name}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">UHID:</label>
                        <span style="color: #666;">${data.patient.uhid}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Gender:</label>
                        <span style="color: #666;">${data.patient.gender}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">INVID:</label>
                        <span style="color: #666;">${data.patient.invid}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">DOB:</label>
                        <span style="color: #666;">${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Date:</label>
                        <span style="color: #666;">${data.patient.date}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Mobile:</label>
                        <span style="color: #666;">${data.patient.mobile}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">City:</label>
                        <span style="color: #666;">${data.patient.city}</span>
                    </div>
                </div>

                <!-- Invoice Section -->
                <div class="invoice-section">
                    <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Invoice</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
                        <thead>
                            <tr>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 10%;">S.No.</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 40%;">Service/Product</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 15%;">Qty/Day</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 17.5%;">Cost (₹)</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 17.5%;">Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.services.map((service, index) => `
                                <tr style="${index % 2 === 1 ? 'background: #fafafa;' : ''}">
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${index + 1}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">
                                        <div style="font-weight: bold; color: #333;">${service.name}</div>
                                    </td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${service.frequency}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top; text-align: right; font-weight: bold;">${service.cost.toFixed(2)}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top; text-align: right; font-weight: bold;">${service.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr style="background: #f0f0f0; font-weight: bold;">
                                <td colspan="3" style="border: 2px solid #333; padding: 15px;"></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: right;"><strong>Total Cost: ₹${data.totalCost.toFixed(2)}</strong></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: right;"><strong>Grand Total: ₹${data.grandTotal.toFixed(2)}</strong></td>
                            </tr>
                            <tr style="background: #f0f0f0; font-weight: bold;">
                                <td colspan="3" style="border: 2px solid #333; padding: 15px;"></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: right; color: #28a745;"><strong>Paid: ₹${data.paid.toFixed(2)}</strong></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: right; color: #dc3545;"><strong>Balance: ₹${data.balance.toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Footer Section -->
                <div class="invoice-footer" style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end;">
                    <div class="website-info" style="font-size: 12px; color: #666;">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature" style="text-align: center;">
                        <div style="width: 150px; height: 60px; border-bottom: 1px solid #333; margin-bottom: 10px; display: flex; align-items: end; justify-content: center; font-family: cursive; font-size: 18px; color: #333;">
                           Priyanka
                        </div>
                        <div style="font-weight: bold; color: #333;">Priyanka</div>
                    </div>
                </div>
            </div>
        `;

            // Append to body temporarily
            document.body.appendChild(tempDiv);

            // Convert to canvas
            const canvas = await html2canvas(tempDiv, {
                width: 800,
                height: tempDiv.scrollHeight,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Remove the temporary div
            document.body.removeChild(tempDiv);

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Calculate dimensions to fit A4
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));

            // If content is taller than one page, add additional pages
            if (imgHeight > pdfHeight - 20) {
                let remainingHeight = imgHeight - (pdfHeight - 20);
                let yPosition = -(pdfHeight - 20);

                while (remainingHeight > 0) {
                    pdf.addPage();
                    const pageHeight = Math.min(remainingHeight, pdfHeight - 20);
                    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
                    remainingHeight -= pageHeight;
                    yPosition -= pdfHeight;
                }
            }

            // Convert PDF to blob and create file
            const pdfBlob = pdf.output('blob');
            const fileName = `invoice_${data.patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            console.log('✅ Invoice PDF generated successfully!', fileName);

            return file;

        } catch (error) {
            console.error('❌ Error generating invoice PDF:', error);
            return null;
        }
    };

    const generateReceiptPDF = async (data: any) => {
        try {
            // Create a temporary div for PDF content
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '800px';
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.fontFamily = 'Arial, sans-serif';

            tempDiv.innerHTML = `
            <div class="receipt-container" style="max-width: 800px; margin: 0 auto; background: white; padding: 30px;">
                <!-- Header Section -->
                 <div class="header" style="display: flex; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #8B4513; padding-bottom: 20px;">
                <div class="logo" style="width: 180px; height: 100px; margin-right: 20px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <img src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png" 
                        alt="Clinic Logo"
                        style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
            </div>

                <!-- Patient Information Grid -->
                <div class="patient-info" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 5px;">
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Patient Name:</label>
                        <span style="color: #666;">${data.patient.name}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">UHID:</label>
                        <span style="color: #666;">${data.patient.uhid}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Gender:</label>
                        <span style="color: #666;">${data.patient.gender}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Receipt ID:</label>
                        <span style="color: #666;">${data.patient.receiptId}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">DOB:</label>
                        <span style="color: #666;">${new Date(data.patient.dob).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Mobile:</label>
                        <span style="color: #666;">${data.patient.mobile}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Consultant Coach:</label>
                        <span style="color: #666;">${data.patient.doctor}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">City:</label>
                        <span style="color: #666;">${data.patient.city}</span>
                    </div>
                </div>

                <!-- Receipt Section -->
                <div class="receipt-section">
                    <h2 style="color: #333; margin-bottom: 15px; font-size: 18px;">Receipt</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
                        <thead>
                            <tr>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 15%;">Date</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 20%;">Receipt Number</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 20%;">Mode Of Payment</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 15%;">Cheque No.</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333; width: 30%;">Amount Paid (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${data.receipt.date}</td>
                                <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top; font-weight: bold;">${data.receipt.receiptNumber}</td>
                                <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${data.receipt.modeOfPayment}</td>
                                <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${data.receipt.chequeNo}</td>
                                <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top; text-align: right; font-weight: bold; color: #28a745; font-size: 16px;">₹${data.receipt.amountPaid.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Receipt Footer with Amount in Words -->
                <div class="receipt-footer" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #28a745;">
                    <div style="font-size: 14px; color: #333; margin-bottom: 10px;">
                        <strong>Received with thanks from:</strong> <em>${data.patient.name}</em>
                    </div>
                    <div style="font-size: 14px; color: #333; font-weight: bold; line-height: 1.6;">
                        <strong>The sum of Rupees:</strong> ${data.receipt.amountInWords} 
                        <span style="color: #28a745;">(₹${data.receipt.amountPaid.toFixed(2)})</span> /-
                    </div>
                </div>

                <!-- Footer Section -->
                <div class="prescription-footer" style="margin-top: 40px; display: flex; justify-content: space-between; align-items: end;">
                    <div class="website-info" style="font-size: 12px; color: #666;">
                        ${data.clinicInfo.website}<br>
                        www.hfiles.in
                    </div>
                    <div class="doctor-signature" style="text-align: center;">
                        <div style="width: 150px; height: 60px; border-bottom: 1px solid #333; margin-bottom: 10px; display: flex; align-items: end; justify-content: center; font-family: cursive; font-size: 18px; color: #333;">
                            Priyanka
                        </div>
                        <div style="font-weight: bold; color: #333;">${data.patient.doctor}</div>
                    </div>
                </div>
            </div>
        `;

            // Append to body temporarily
            document.body.appendChild(tempDiv);

            // Convert to canvas
            const canvas = await html2canvas(tempDiv, {
                width: 800,
                height: tempDiv.scrollHeight,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Remove the temporary div
            document.body.removeChild(tempDiv);

            // Create PDF
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Calculate dimensions to fit A4
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pdfHeight - 20));

            // If content is taller than one page, add additional pages
            if (imgHeight > pdfHeight - 20) {
                let remainingHeight = imgHeight - (pdfHeight - 20);
                let yPosition = -(pdfHeight - 20);

                while (remainingHeight > 0) {
                    pdf.addPage();
                    const pageHeight = Math.min(remainingHeight, pdfHeight - 20);
                    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
                    remainingHeight -= pageHeight;
                    yPosition -= pdfHeight;
                }
            }

            // Convert PDF to blob and create file
            const pdfBlob = pdf.output('blob');
            const fileName = `receipt_${data.patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            console.log('✅ Receipt PDF generated successfully!', fileName);

            return file;

        } catch (error) {
            console.error('❌ Error generating receipt PDF:', error);
            return null;
        }
    };

    // UPDATED: Fixed async checkbox handling with loading states
    const handleCheckboxChange = async (itemName: string) => {
        console.log("Checkbox clicked:", itemName);

        // First update the checkbox state
        setCheckedItems((prev: Record<string, boolean>) => ({
            ...prev,
            [itemName]: !prev[itemName],
        }));

        // If unchecking, just return early
        const wasChecked = checkedItems[itemName];
        if (wasChecked) {
            console.log(`Unchecking ${itemName}, no PDF generation needed`);
            return;
        }

        // If checking, start PDF generation
        const normalized = itemName.toLowerCase();

        // Set loading state
        setLoadingStates(prev => ({ ...prev, [itemName]: true }));

        try {
            console.log(`Starting PDF generation for ${itemName}...`);

            switch (normalized) {
                case "prescription":
                    await handlePrescriptionCheck();
                    break;
                case "treatment":
                    await handleTreatmentPlanCheck();
                    break;
                case "invoice":
                    await handleInvoiceCheck();
                    break;
                case "receipt":
                    await handleReceiptCheck();
                    break;
                case "images":
                    await handleImagesCheck();
                    break;
                default:
                    console.warn(`Unknown document type: ${itemName}`);
            }

            console.log(`✅ PDF generation completed for ${itemName}`);

        } catch (error) {
            console.error(`❌ Error generating PDF for ${itemName}:`, error);

            // Uncheck the item if PDF generation failed
            setCheckedItems(prev => ({
                ...prev,
                [itemName]: false
            }));

            alert(`Failed to generate ${itemName} PDF. Please try again.`);
        } finally {
            // Clear loading state
            setLoadingStates(prev => ({ ...prev, [itemName]: false }));
        }
    };

    // UPDATED: handleFinalSend with better validation
    const handleFinalSend = async () => {
        const isAnyLoading = Object.values(loadingStates).some(loading => loading);
        if (isAnyLoading) {
            alert("Please wait for all documents to finish generating before sending.");
            return;
        }

        setIsSending(true);
        const extractedLastVisitId = searchParams.get("visitId");
        const extractedPatientId = searchParams.get("patientId");

        try {
            const checkedDocuments = Object.keys(checkedItems).filter((key) => checkedItems[key]);

            if (checkedDocuments.length === 0) {
                alert("Please select at least one document to send.");
                setIsSending(false);
                return;
            }

            let successfulUploads = 0;
            let failedUploads = [];

            for (const key of checkedDocuments) {
                let file = null;
                let documentType = "";

                switch (key.toLowerCase()) {
                    case "prescription":
                        file = prescriptionFile;
                        documentType = "Prescription";
                        break;
                    case "treatment":
                        file = treatmentPlanFile;
                        documentType = "Treatment";
                        break;
                    case "invoice":
                        file = invoiceFile;
                        documentType = "Invoice";
                        break;
                    case "receipt":
                        file = receiptFile;
                        documentType = "Receipt";
                        break;
                    case "images":
                        // Images: NO PDF file, just payload
                        file = null;
                        documentType = "Images";
                        console.log("Processing Images - NO PDF file will be sent");
                        break;
                    default:
                        console.warn(`Unknown document type: ${key}`);
                        continue;
                }

                try {
                    const formData = new FormData();

                    // Add main request properties
                    formData.append("ClinicId", String(currentUserId));
                    formData.append("PatientId", extractedPatientId || "");
                    formData.append("ClinicVisitId", extractedLastVisitId || "");
                    formData.append("PaymentMethod", paymentMethod || "CreditCard");

                    // Add document type and SendToPatient flag
                    formData.append(`Documents[0].Type`, documentType);
                    formData.append(`Documents[0].SendToPatient`, "true");

                    // Only add PDF for non-image documents
                    if (key.toLowerCase() !== "images") {
                        if (file && file instanceof File) {
                            formData.append(`Documents[0].PdfFile`, file);
                            console.log(`Adding PDF file for ${documentType}:`, file.name);
                        } else {
                            console.warn(`No PDF file found for ${documentType}`);
                            failedUploads.push(documentType);
                            continue;
                        }
                    } else {
                        // Images: Send only the payload, NO PDF file
                        console.log(`Sending ${documentType} - payload only, NO PDF`);
                    }

                    // Send the document
                    const response = await UploadeallData(formData);
                    toast.success(response.data.message);
                    successfulUploads++;
                    console.log(`✅ ${documentType} sent successfully`);

                } catch (documentError) {
                    console.error(`❌ Failed to upload ${documentType}:`, documentError);
                    failedUploads.push(documentType);
                }
            }

            // Show results
            if (successfulUploads > 0) {
                let message = `${successfulUploads} document(s) sent successfully!`;
                if (failedUploads.length > 0) {
                    message += `\n\nFailed to send: ${failedUploads.join(', ')}`;
                }
                console.log(message);

                // Close modal and clear data after success
                setIsSendModalOpen(false);

                // Clear all files and data
                setPrescriptionFile(null);
                setTreatmentPlanFile(null);
                setInvoiceFile(null);
                setReceiptFile(null);
                setReportImagesFile(null);
                setReportImagesData(null);

                setCheckedItems({
                    prescription: false,
                    Images: false,
                    Receipt: false,
                    invoice: false,
                    Treatment: false,
                });

                setActionPayload([]);
            } else {
                alert("No documents were sent successfully. Please check and try again.");
            }

        } catch (error) {
            console.error("Upload process error:", error);
            alert("An error occurred during the upload process.");
        } finally {
            setIsSending(false);
        }
    };

    // UPDATED CheckboxItem component with loading state
    const CheckboxItem = ({ itemName, label, checked, onChange, isLoading = false }) => (
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(itemName)}
                disabled={isLoading}
                className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isLoading
                    ? 'bg-gray-300 border-gray-300 cursor-not-allowed'
                    : checked
                        ? 'bg-yellow-400 border-yellow-400'
                        : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                    }`}
            >
                {isLoading ? (
                    <span className="text-xs">⏳</span>
                ) : checked ? (
                    <span className="text-xs text-black font-bold">✓</span>
                ) : null}
            </button>
            <span className={`text-sm font-medium ${isLoading ? 'text-gray-400' : 'text-gray-700'}`}>
                {label}
                {isLoading && <span className="text-xs text-blue-600 ml-2">(Generating...)</span>}
            </span>
        </div>
    );

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
                <Profiledetails profileData={profileData} />

                {/* Consent Forms Section */}
                <div className="bg-white rounded-xl border border-black">
                    <button
                        onClick={() => setIsConsentDropdownOpen(!isConsentDropdownOpen)}
                        className="w-full flex items-center justify-between p-4 border-b border-black transition-colors"
                    >
                        <span className="text-lg font-medium text-black">
                            View and Edit the consent forms filled by the client.
                        </span>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-500 transition-transform ${isConsentDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isConsentDropdownOpen && (
                        <div className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6 mx-4">
                                {consentListData?.map((consentForm: any) => (
                                    <div
                                        key={consentForm.clinicConsentFormId}
                                        className="relative p-4 rounded-xl border border-black transition-all cursor-pointer w-full max-w-md mx-auto"
                                        onClick={() => {
                                            const extractedHfid = searchParams.get("hfid");

                                            if (consentForm?.consentFormUrl) {
                                                router.push(
                                                    `/consentForm?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${encodeURIComponent(
                                                        consentForm.title
                                                    )}&pdf=${encodeURIComponent(
                                                        consentForm.consentFormUrl
                                                    )}&hfid=${extractedHfid}`
                                                );
                                            } else if (consentForm?.title === "High 5 Waiver Form") {
                                                router.push(
                                                    `/publicConsentForm?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${encodeURIComponent(
                                                        consentForm.title
                                                    )}&hfid=${extractedHfid}`
                                                );
                                            } else if (consentForm?.title === "High 5 Terms and Conditions") {
                                                router.push(
                                                    `/publicTerm&Condition?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${encodeURIComponent(
                                                        consentForm.title
                                                    )}&hfid=${extractedHfid}`
                                                );
                                            }
                                        }}
                                    >
                                        <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3">
                                            <img
                                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                                alt="High5 Logo"
                                                className="max-w-full max-h-full rounded"
                                            />
                                        </div>
                                        <div className="border border-gray-400 mx-auto w-full mt-3"></div>

                                        <h3 className="font-semibold text-gray-800 text-md text-center mb-4 mt-4">
                                            {consentForm.title}
                                        </h3>

                                        <div className={`absolute bottom-3 right-3 w-3 h-3 rounded-full ${consentForm.isVerified ? 'bg-green-600' : 'bg-red-600'
                                            }`}></div>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full flex justify-end">
                                <div className="flex flex-col items-start justify-between gap-4 p-4 border-t border-l border-black">
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
                    <div className="flex items-center justify-between p-4 border-b border-black">
                        <span className="text-lg font-medium text-black">
                            Manage package plans, prescriptions, and reports effortlessly.
                        </span>
                        <button
                            className="flex items-center gap-2 px-3 py-1 border border-black rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => {
                                const extractedPatientId = searchParams.get("patientId");
                                router.push(`/ClinicShareReports?patientId=${extractedPatientId}`);
                            }}
                        >
                            <span className="text-sm font-medium">History</span>
                            <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-8">
                            <h3 className="text-lg flex justify-end font-medium text-blue-800 mb-4">
                                Client's package Plan :
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <FileUploadModal />

                                <div className="col-span-2 flex divide-x divide-black rounded-lg overflow-hidden bg-white">
                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                                alt="High5 Logo"
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

                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                                alt="High5 Logo"
                                                className="max-w-20 max-h-20 rounded"
                                            />
                                        </div>
                                        <button className="w-full text-white font-semibold py-2 px-4 rounded-lg primary cursor-pointer transition-colors"
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
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-blue-800 mb-4">Send Invoice Details :</h3>

                    <div className="flex divide-x divide-black gap-4 mb-6">
                        <div className="bg-white p-4">
                            <div className="h-45 w-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                    alt="High5 Logo"
                                    className="max-w-20 max-h-20 rounded"
                                />
                            </div>
                            <button className="w-full primary text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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

                        <div className="bg-white rounded-lg p-4">
                            <div className="h-45 w-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                <img
                                    src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                    alt="High5 Logo"
                                    className="max-w-20 max-h-20 rounded"
                                />
                            </div>
                            <button className="w-full bg-yellow text-black border border-black font-semibold py-2 px-4 rounded-lg transition-colors"
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
                    <button className="w-full sm:flex-1 bg-green text-white font-semibold py-3 px-6 rounded-lg transition-colors">
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
                            <div className="relative text-center mb-6 pb-4 border-b border-gray-300">
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

                            {/* Patient Information Display */}
                            {profileData && (
                                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                                    <p className="text-sm text-blue-800 font-medium">
                                        Reports PDF will be sent to <span className="font-bold">{profileData.fullName || 'N/A'}</span> in their HFID: <span className="font-bold">{profileData.hfId || 'N/A'} account.</span>
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <div className="border border-black rounded-lg p-4 mb-6">
                                        <p className="text-sm text-blue-700 font-medium mb-4">
                                            You're about to send the following documents to the patient :
                                        </p>

                                        <div className="space-y-3">
                                            <CheckboxItem
                                                itemName="prescription"
                                                label="Prescription"
                                                checked={checkedItems.prescription}
                                                onChange={handleCheckboxChange}
                                                isLoading={loadingStates.prescription}
                                            />
                                            <CheckboxItem
                                                itemName="Images"
                                                label="Report Images"
                                                checked={checkedItems.Images}
                                                onChange={handleCheckboxChange}
                                                isLoading={loadingStates.Images}
                                            />
                                            <CheckboxItem
                                                itemName="Receipt"
                                                label="Payment Receipt"
                                                checked={checkedItems.Receipt}
                                                onChange={handleCheckboxChange}
                                                isLoading={loadingStates.Receipt}
                                            />
                                            <div className="mb-6">
                                                <p className="text-sm font-semibold text-blue-800 mb-1">
                                                    Invoice and Package Plan :
                                                </p>
                                                <p className="text-xs text-gray-500 mb-4">
                                                    (verify here. Invoice & Package)
                                                </p>

                                                <div className="space-y-3">
                                                    <CheckboxItem
                                                        itemName="invoice"
                                                        label="Invoice"
                                                        checked={checkedItems.invoice}
                                                        onChange={handleCheckboxChange}
                                                        isLoading={loadingStates.invoice}
                                                    />
                                                    <CheckboxItem
                                                        itemName="Treatment"
                                                        label="Package Plan"
                                                        checked={checkedItems.Treatment}
                                                        onChange={handleCheckboxChange}
                                                        isLoading={loadingStates.Treatment}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 rounded-sm bg-[#CAE5FF]">
                                        <label className="text-sm font-semibold text-blue-800 w-30 mx-2">
                                            Payment Method :
                                        </label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="flex-1 border border-black bg-white rounded-lg px-4 py-1 text-sm font-medium mx-2"
                                        >
                                            <option value="CreditCard">Credit Card</option>
                                            <option value="DebitCard">Debit Card</option>
                                            <option value="Cash">Cash</option>
                                            <option value="BankTransfer">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <img
                                            src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4 (1).png"
                                            alt="Doctor illustration"
                                            className="w-64 h-48 object-contain"
                                        />
                                    </div>
                                    <div className="flex justify-end mt-2 pt-2">
                                        <button
                                            onClick={handleFinalSend}
                                            disabled={isSending}
                                            className={`bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors
      ${isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
                                        >
                                            {isSending ? "Sending..." : "Send"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Consent Forms Selection Modal */}
                {isConsentFormsModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full border-2 border-gray-200">
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

                            <div className="space-y-4 mb-6">
                                <ConsentFormCheckboxItem
                                    itemName="high5RegistrationForm"
                                    label="High 5 Registration Form"
                                    checked={consentFormsChecked.high5RegistrationForm}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                                <ConsentFormCheckboxItem
                                    itemName="high5WaiverForm"
                                    label="High 5 Waiver Form"
                                    checked={consentFormsChecked.high5WaiverForm}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                                <ConsentFormCheckboxItem
                                    itemName="high5TermsAndConditions"
                                    label="High 5 Terms and Conditions"
                                    checked={consentFormsChecked.high5TermsAndConditions}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                                <ConsentFormCheckboxItem
                                    itemName="high5PostnatalQuestionnaire"
                                    label="High 5 Postnatal Questionnaire"
                                    checked={consentFormsChecked.high5PostnatalQuestionnaire}
                                    onChange={handleConsentFormCheckboxChange}
                                />
                            </div>

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
            <ToastContainer />
        </DefaultLayout>
    )
}

export default page