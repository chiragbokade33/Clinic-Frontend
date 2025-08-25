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

const page = () => {
    const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);
    const [isSendModalOpen, setIsSendModalOpen] = useState(false);
    const [isConsentFormsModalOpen, setIsConsentFormsModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('CreditCard');
    const router = useRouter();
    const searchParams = useSearchParams();

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

    // File storage states (NEW)
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [treatmentPlanFile, setTreatmentPlanFile] = useState<File | null>(null);
    const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [reportImagesFile, setReportImagesFile] = useState<File | null>(null);

    useEffect(() => {
        const FetchDatajson = async () => {
            const extractedHfid = searchParams.get("hfid");
            const extractedLastVisitId = searchParams.get("visitId");
            const extractedPatientId = searchParams.get("patientId");
            if (!extractedHfid) return;

            const id = await getUserId();
            setCurrentUserId(id);

            try {
                const response = await ListJsondata(id, extractedPatientId, extractedLastVisitId);
                const apiData = response.data.data;

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
                            qtyPerDay: t.qtyPerDay,
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
                    const normalizedReceiptData = {
                        patient: {
                            name: parsed.patient.name,
                            uhid: parsed.patient.hfid,
                            gender: parsed.patient.gender,
                            receiptId: parsed.patient.receiptId || parsed.patient.prfid,
                            dob: parsed.patient.dob,
                            doctor: parsed.patient.doctor || "Dr. Varun R Kunte",
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

                const reportImagesEntry = apiData.find((item: { type: string }) => item.type === "Images" || item.type === "Images" || item.type === "Reports");
                if (reportImagesEntry) {
                    const parsed = JSON.parse(reportImagesEntry.jsonData);
                    const normalizedImagesData = {
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

    // UPDATED: Function to handle prescription checkbox click and generate PDF
    const handlePrescriptionCheck = async () => {
        if (!prescriptionPdf) {
            console.warn("No prescription data found!");
            return;
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

        // Generate PDF and get file
        const file = await generatePrescriptionPDF(prescriptionPdf);
        if (file) {
            setPrescriptionFile(file);
        }
    };

    // UPDATED: Function to handle treatment plan checkbox click and generate PDF
    const handleTreatmentPlanCheck = async () => {
        console.log('Treatment Plan checkbox clicked - Generating PDF...');

        if (!treatmentData || !treatmentData.patient) {
            console.warn("No treatment data found!");
            return;
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

        // Generate PDF and get file
        const file = await generateTreatmentPlanPDF(treatmentData);
        if (file) {
            setTreatmentPlanFile(file);
        }
    };

    // UPDATED: Function to handle receipt checkbox click and generate PDF
    const handleReceiptCheck = async () => {
        console.log('Receipt checkbox clicked - Generating PDF...');

        let receiptDataForPDF;

        const convertNumberToWords = (amount) => {
            if (amount === 1000) return "One Thousand Only";
            if (amount === 1400) return "One Thousand Four Hundred Only";
            if (amount === 130000) return "One Lakh Thirty Thousand Only";
            return `${amount.toLocaleString('en-IN')} Only`;
        };

        // Priority logic for receipt data
        if (receiptApiData) {
            console.log('Using Receipt API data');
            receiptDataForPDF = receiptApiData;
        } else if (invoiceData) {
            console.log('Generating receipt from Invoice data');
            receiptDataForPDF = {
                patient: {
                    name: invoiceData.patient.name,
                    uhid: invoiceData.patient.uhid,
                    gender: invoiceData.patient.gender,
                    receiptId: `RC${Math.floor(Math.random() * 9999)}`,
                    dob: invoiceData.patient.dob,
                    doctor: "Dr. Varun R Kunte",
                    mobile: invoiceData.patient.mobile,
                    city: invoiceData.patient.city
                },
                receipt: {
                    date: new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
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
                    date: new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }),
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
            return;
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

        // Generate PDF and get file
        const file = await generateReceiptPDF(receiptDataForPDF);
        if (file) {
            setReceiptFile(file);
        }
    };

    // UPDATED: Function to handle invoice checkbox click and generate PDF
    const handleInvoiceCheck = async () => {
        console.log('Invoice checkbox clicked - Generating PDF...');

        if (!invoiceData) {
            console.warn("No invoice data found!");
            return;
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

        // Generate PDF and get file
        const file = await generateInvoicePDF(invoiceDataForPDF);
        if (file) {
            setInvoiceFile(file);
        }
    };

    const generatePrescriptionPDF = async (data) => {
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
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Consultant Doctor:</label>
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
                            Dr. Kunte
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
            const fileName = `prescription_${data.patient.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            console.log('✅ Prescription PDF generated successfully!', fileName);

            // Optional: Preview the PDF in a new tab
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            return file;

        } catch (error) {
            console.error('❌ Error generating prescription PDF:', error);
            return null;
        }
    };
    // UPDATED: Function to generate treatment plan PDF - now returns File object
    const generateTreatmentPlanPDF = async (data) => {
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
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Consultant Doctor:</label>
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
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Treatment Name</th>
                                <th style="background: #f8f8f8; border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold; color: #333;">Qty/Day</th>
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
                                    <td style="border: 1px solid #ddd; padding: 12px;">${treatment.qtyPerDay}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${treatment.cost.toFixed(2)}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; font-style: italic;">${treatment.status}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-weight: bold;">${treatment.total.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr style="background: #f0f0f0; font-weight: bold;">
                                <td colspan="3" style="border: 2px solid #333; padding: 15px;"></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: right;">
                                    <strong>Total: ${data.totalCost.toFixed(2)}</strong>
                                </td>
                                <td style="border: 2px solid #333; padding: 15px;"></td>
                                <td style="border: 2px solid #333; padding: 15px; text-align: right;">
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
                            Dr. Kunte
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

            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            return file;

        } catch (error) {
            console.error('❌ Error generating treatment plan PDF:', error);
            return null;
        }
    };

    const generateInvoicePDF = async (data) => {
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
                                    <td style="border: 1px solid #ddd; padding: 12px; vertical-align: top;">${service.qtyPerDay}</td>
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
                            Dr. Kunte
                        </div>
                        <div style="font-weight: bold; color: #333;">Dr. Varun R Kunte</div>
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

            // Optional: Preview the PDF in a new tab
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            return file;

        } catch (error) {
            console.error('❌ Error generating invoice PDF:', error);
            return null;
        }
    };

    // UPDATED: Function to generate receipt PDF - now returns File object
    const generateReceiptPDF = async (data) => {
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
                        <span style="color: #666;">${data.patient.hfid}</span>
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
                        <label style="font-weight: bold; margin-right: 10px; min-width: 120px; color: #333;">Consultant Doctor:</label>
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
                            Dr. Kunte
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

            // Optional: Preview the PDF in a new tab
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');

            return file;

        } catch (error) {
            console.error('❌ Error generating receipt PDF:', error);
            return null;
        }
    };

    // UPDATED: handleFinalSend function to send actual files
    const handleFinalSend = async () => {
        const extractedLastVisitId = searchParams.get("visitId");
        const extractedPatientId = searchParams.get("patientId");

        // Build FormData
        const formData = new FormData();
        formData.append("ClinicId", String(currentUserId));
        formData.append("PatientId", extractedPatientId || "");
        formData.append("ClinicVisitId", extractedLastVisitId || "");
        formData.append("PaymentMethod", paymentMethod || "CreditCard");

        // Get checked documents and append files
        const checkedDocuments = Object.keys(checkedItems).filter((key) => checkedItems[key]);

        checkedDocuments.forEach((key, index) => {
            formData.append(`Documents[${index}].Type`, key.charAt(0).toUpperCase() + key.slice(1));
            formData.append(`Documents[${index}].SendToPatient`, "true");

            // Append actual file based on document type using if/else
            let file = null;

            if (key === "prescription") {
                file = prescriptionFile;
            } else if (key === "Treatment") {
                file = treatmentPlanFile;
            } else if (key === "invoice") {
                file = invoiceFile;
            } else if (key === "Receipt") {
                file = receiptFile;
            } else if (key === "Images") {
                file = reportImagesFile;
            }

            if (file) {
                formData.append(`Documents[${index}].PdfFile`, file);
                console.log(`📎 Added ${key} file:`, file.name, file.size, "bytes");
            } else {
                console.warn(`⚠️ No file found for ${key}`);
            }
        });

        // Debug: Log FormData contents
        console.log("🚀 Sending documents:", checkedDocuments);
        console.log("📋 FormData entries:");
        for (let [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        try {
            await UploadeallData(formData);
            console.log("✅ Documents successfully uploaded!");
            setIsSendModalOpen(false);

            // Optional: Clear file states after successful upload
            setPrescriptionFile(null);
            setTreatmentPlanFile(null);
            setInvoiceFile(null);
            setReceiptFile(null);
            setReportImagesFile(null);

            // Clear checked items
            setCheckedItems({
                prescription: false,
                Images: false,
                Receipt: false,
                invoice: false,
                Treatment: false,
            });
        } catch (error) {
            console.error("❌ Error uploading documents:", error);
        }
    };


    // Enhanced handleCheckboxChange function
    const handleCheckboxChange = (itemName: string) => {
        console.log("Checkbox clicked:", itemName);

        setCheckedItems((prev: Record<string, boolean>) => {
            const newCheckedState = {
                ...prev,
                [itemName]: !prev[itemName],
            };

            console.log("Previous state:", prev[itemName]);
            console.log("New state:", newCheckedState[itemName]);

            // Normalize item name for comparison
            const normalized = itemName.toLowerCase();

            // Trigger PDF generation only when checked (not unchecked)
            if (!prev[itemName]) {
                console.log(`Triggering ${itemName} PDF generation...`);

                if (normalized === "prescription") {
                    handlePrescriptionCheck();
                } else if (normalized === "treatment") {
                    handleTreatmentPlanCheck();
                } else if (normalized === "invoice") {
                    handleInvoiceCheck();
                } else if (normalized === "receipt") {
                    handleReceiptCheck();
                }
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
                            View and Edit the consent forms filled by the patient.
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
                                            if (consentForm?.consentFormUrl) {
                                                router.push(`/consentForm?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${consentForm.title}&pdf=${consentForm.consentFormUrl}`);
                                            } else {
                                                router.push(`/publicConsentForm?ConsentId=${consentForm.clinicConsentFormId}&ConsentName=${consentForm.title}`);
                                            }
                                        }}
                                    >
                                        <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3">
                                            <img
                                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                                alt="ARTHROSE Logo"
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
                            Manage treatment plans, prescriptions, and reports effortlessly.
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
                                patient's treatment plan :
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <FileUploadModal />

                                <div className="col-span-2 flex divide-x divide-black rounded-lg overflow-hidden bg-white">
                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
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

                                    <div className="flex-1 p-4">
                                        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                                            <img
                                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                                alt="ARTHROSE Logo"
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
                                    alt="ARTHROSE Logo"
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
                                    alt="ARTHROSE Logo"
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
                                            />
                                            <CheckboxItem
                                                itemName="Images"
                                                label="Report Images"
                                                checked={checkedItems.Images}
                                                onChange={handleCheckboxChange}
                                            />
                                            <CheckboxItem
                                                itemName="Receipt"
                                                label="Payment Receipt"
                                                checked={checkedItems.Receipt}
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
                                                        itemName="Treatment"
                                                        label="Treatment Plan"
                                                        checked={checkedItems.Treatment}
                                                        onChange={handleCheckboxChange}
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
                                            <option>Credit Card</option>
                                            <option>Debit Card</option>
                                            <option>Cash</option>
                                            <option>Bank Transfer</option>
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
                                            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors text-lg"
                                        >
                                            Send
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