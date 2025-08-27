'use client'
export const runtime = "edge";           // ✅ Run on Edge runtime
export const dynamic = "force-dynamic";
import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { Upload, FileText, Check, Camera, X, Download, CloudUpload } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicDefault from '../components/PublicDefault';
import { AddPdfPublic, ListProfile } from '../services/ClinicServiceApi';
import { toast, ToastContainer } from 'react-toastify';

// Type definitions
interface FormData {
    participantName: string;
    age: string;
    address: string;
    gender: string;
    phoneNumber: string;
    emergencyContact: string;
    guardianName: string;
    timeSlotFrom: string;
    timeSlotTo: string;
    weekDay: string;
    periodMonths: string;
    startDate: string;
    endDate: string;
    feesAmount: string;
    signatureFile: File | null;
    date: string;
}

interface ConsentFormProps {
    // Add any props here if needed in the future
}

const ConsentForm: React.FC<ConsentFormProps> = () => {
    const [formData, setFormData] = useState<FormData>({
        participantName: '',
        age: '',
        address: '',
        gender: '',
        phoneNumber: '',
        emergencyContact: '',
        guardianName: '',
        timeSlotFrom: '',
        timeSlotTo: '',
        weekDay: '',
        periodMonths: '',
        startDate: '',
        endDate: '',
        feesAmount: '',
        signatureFile: null,
        date: new Date().toISOString().split('T')[0]
    });
    const router = useRouter();
    const searchParams = useSearchParams();

    // Extract URL parameters
    const getUrlParams = () => {
        const params = Object.fromEntries(searchParams.entries());
        const consentId = params.ConsentId ? Number(params.ConsentId) : 121212;
        const consentName = params.ConsentName ? decodeURIComponent(params.ConsentName) : "TERMS & CONDITIONS";

        return { consentId, consentName };
    };

    const { consentId, consentName } = getUrlParams();

    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [showSignatureOptions, setShowSignatureOptions] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const [profileData, setProfileData] = useState() as any;

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

    // Cleanup camera stream and object URLs on component unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [stream, imagePreview]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignatureUpload = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
            const fileType: string = file.type.toLowerCase();

            if (!allowedTypes.includes(fileType)) {
                alert('Please upload only PNG, JPG, JPEG, or PDF files.');
                e.target.value = '';
                return;
            }

            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            let previewUrl: string | null = null;
            if (file.type.startsWith('image/')) {
                previewUrl = URL.createObjectURL(file);
            }

            setFormData(prev => ({
                ...prev,
                signatureFile: file
            }));
            setImagePreview(previewUrl);
            setShowSignatureOptions(false);
        }
    };

    const startCamera = async (): Promise<void> => {
        try {
            const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setStream(mediaStream);
            setShowCamera(true);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play();
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please check permissions or use file upload.');
        }
    };

    const stopCamera = (): void => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
        setShowSignatureOptions(true);
    };

    const capturePhoto = useCallback((): void => {
        if (videoRef.current && canvasRef.current) {
            const video: HTMLVideoElement = videoRef.current;
            const canvas: HTMLCanvasElement = canvasRef.current;
            const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

            if (!ctx) {
                console.error('Could not get canvas context');
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob: Blob | null) => {
                if (!blob) {
                    console.error('Could not create blob from canvas');
                    return;
                }

                const file = new File([blob], `signature_${Date.now()}.jpg`, { type: 'image/jpeg' });

                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                }

                const previewUrl: string = URL.createObjectURL(file);

                setFormData(prev => ({
                    ...prev,
                    signatureFile: file
                }));
                setImagePreview(previewUrl);
                stopCamera();
                setShowSignatureOptions(false);
            }, 'image/jpeg', 0.9);
        }
    }, [stream, imagePreview]);

    const removeSignature = (): void => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setFormData(prev => ({ ...prev, signatureFile: null }));
        setImagePreview(null);
        setShowSignatureOptions(false);
        setShowCamera(false);
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const generatePDFFile = async (): Promise<File | null> => {
        const cleanup = () => {
            const styleOverride = document.getElementById('pdf-color-override');
            if (styleOverride && styleOverride.parentNode) {
                styleOverride.parentNode.removeChild(styleOverride);
            }

            if (formRef.current) {
                formRef.current.classList.remove('pdf-temp-override');
            }

            const elementsToHide = formRef.current?.querySelectorAll('.pdf-hidden');
            const elementsToShow = formRef.current?.querySelectorAll('.pdf-show');

            elementsToHide?.forEach(el => {
                (el as HTMLElement).style.display = '';
            });

            elementsToShow?.forEach(el => {
                (el as HTMLElement).style.display = 'none';
            });
        };

        try {
            if (!formRef.current) {
                throw new Error('Form reference not found');
            }

            let jsPDF: any, html2canvas: any;
            try {
                const imports = await Promise.all([
                    import('jspdf'),
                    import('html2canvas')
                ]);
                jsPDF = imports[0].default;
                html2canvas = imports[1].default;
            } catch (importError) {
                throw new Error('Failed to load PDF generation libraries');
            }

            const styleOverride = document.createElement('style');
            styleOverride.id = 'pdf-color-override';
            styleOverride.textContent = `
                .pdf-temp-override {
                    background: white !important;
                    color: black !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .pdf-temp-override *,
                .pdf-temp-override *:before,
                .pdf-temp-override *:after {
                    color: rgb(0, 0, 0) !important;
                    background-color: transparent !important;
                    background-image: none !important;
                    box-shadow: none !important;
                    text-shadow: none !important;
                    border: none !important;
                    border-color: transparent !important;
                    outline: none !important;
                    outline-color: transparent !important;
                    --tw-text-opacity: 1 !important;
                    --tw-bg-opacity: 1 !important;
                    --tw-border-opacity: 0 !important;
                }
                .pdf-temp-override .text-blue-800,
                .pdf-temp-override .text-blue-600 {
                    color: rgb(30, 64, 175) !important;
                }
                .pdf-temp-override .text-gray-700 {
                    color: rgb(55, 65, 81) !important;
                }
                .pdf-temp-override .text-black {
                    color: rgb(0, 0, 0) !important;
                }
                .pdf-temp-override .bg-white {
                    background-color: rgb(255, 255, 255) !important;
                }
                .pdf-temp-override .bg-gray-50 {
                    background-color: rgb(249, 250, 251) !important;
                }
                .pdf-temp-override input,
                .pdf-temp-override button,
                .pdf-temp-override div,
                .pdf-temp-override span,
                .pdf-temp-override p,
                .pdf-temp-override h1,
                .pdf-temp-override h2,
                .pdf-temp-override h3,
                .pdf-temp-override label,
                .pdf-temp-override li,
                .pdf-temp-override ul,
                .pdf-temp-override img {
                    color: rgb(0, 0, 0) !important;
                    background-color: transparent !important;
                    border: none !important;
                    border-color: transparent !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .pdf-temp-override .border-b,
                .pdf-temp-override .border-gray-400 {
                    border-bottom: 1px solid rgb(0, 0, 0) !important;
                }
            `;
            document.head.appendChild(styleOverride);

            const replaceOklchColors = (element: Element) => {
                const computedStyle = window.getComputedStyle(element);
                const problematicProperties = ['color', 'background-color', 'border-color', 'outline-color'];

                problematicProperties.forEach(prop => {
                    const value = computedStyle.getPropertyValue(prop);
                    if (value.includes('oklch') || value.includes('hsl') || value.includes('lab')) {
                        (element as HTMLElement).style.setProperty(prop, 'rgb(0, 0, 0)', 'important');
                    }
                });
            };

            const allElements = formRef.current.querySelectorAll('*');
            allElements.forEach(replaceOklchColors);

            formRef.current.classList.add('pdf-temp-override');

            const elementsToHide = formRef.current.querySelectorAll('.pdf-hidden');
            const elementsToShow = formRef.current.querySelectorAll('.pdf-show');

            elementsToHide.forEach(el => {
                (el as HTMLElement).style.display = 'none';
            });

            elementsToShow.forEach(el => {
                (el as HTMLElement).style.display = 'block';
            });

            await new Promise(resolve => setTimeout(resolve, 300));

            const canvas = await html2canvas(formRef.current, {
                scale: 1.2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                width: Math.min(formRef.current.scrollWidth, 1400),
                height: formRef.current.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                logging: false,
                removeContainer: true,
                imageTimeout: 15000,
                foreignObjectRendering: false,
                ignoreElements: (element: { classList: { contains: (arg0: string) => any; }; tagName: string; }) => {
                    return element.classList.contains('pdf-hidden') ||
                        element.tagName === 'SCRIPT' ||
                        element.tagName === 'STYLE' ||
                        element.classList.contains('no-pdf');
                },
                onclone: (clonedDoc: { querySelectorAll: (arg0: string) => any; }) => {
                    const clonedElements = clonedDoc.querySelectorAll('.pdf-hidden');
                    clonedElements.forEach((el: { remove: () => any; }) => el.remove());

                    const allClonedElements = clonedDoc.querySelectorAll('*');
                    allClonedElements.forEach((el: Element) => {
                        const htmlEl = el as HTMLElement;
                        htmlEl.style.setProperty('color', 'rgb(0, 0, 0)', 'important');
                        htmlEl.style.setProperty('background-color', 'transparent', 'important');
                        htmlEl.style.setProperty('border-color', 'transparent', 'important');
                        htmlEl.style.setProperty('outline', 'none', 'important');
                        htmlEl.style.setProperty('box-shadow', 'none', 'important');
                    });
                }
            });

            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas has invalid dimensions');
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;

            const imgData = canvas.toDataURL('image/png', 0.95);

            if (!imgData || imgData === 'data:,') {
                throw new Error('Failed to convert canvas to image');
            }

            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - (margin * 2);

            const canvasWidthMM = canvas.width * 0.264583;
            const canvasHeightMM = canvas.height * 0.264583;

            const scaleX = availableWidth / canvasWidthMM;
            const minScale = 0.4;
            const scale = Math.max(Math.min(scaleX, 0.8), minScale);

            const imgWidth = canvasWidthMM * scale;
            const imgHeight = canvasHeightMM * scale;

            const maxContentHeight = availableHeight;

            if (imgHeight <= maxContentHeight) {
                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
            } else {
                let currentY = 0;
                let pageNumber = 1;

                while (currentY < canvas.height) {
                    if (pageNumber > 1) {
                        pdf.addPage();
                    }

                    const remainingSourceHeight = canvas.height - currentY;
                    const maxSourceHeightForThisPage = maxContentHeight / scale / 0.264583;
                    const sourceHeightForThisPage = Math.min(remainingSourceHeight, maxSourceHeightForThisPage);

                    const displayHeightForThisPage = sourceHeightForThisPage * 0.264583 * scale;

                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = Math.ceil(sourceHeightForThisPage);
                    const tempCtx = tempCanvas.getContext('2d');

                    if (tempCtx && sourceHeightForThisPage > 0) {
                        tempCtx.drawImage(
                            canvas,
                            0, currentY,
                            canvas.width, sourceHeightForThisPage,
                            0, 0,
                            canvas.width, sourceHeightForThisPage
                        );

                        const tempImgData = tempCanvas.toDataURL('image/png', 0.95);
                        pdf.addImage(tempImgData, 'PNG', margin, margin, imgWidth, displayHeightForThisPage);

                        tempCanvas.remove();
                    }

                    currentY += sourceHeightForThisPage;
                    pageNumber++;

                    if (pageNumber > 50) {
                        console.warn('⚠️ Too many pages, breaking to prevent infinite loop');
                        break;
                    }
                }
            }

            const pdfBlob = pdf.output('blob');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const safeName = (formData.participantName || 'participant').replace(/[^a-zA-Z0-9]/g, '_');
            const safeTitle = consentName.replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `${safeTitle}_${safeName}_${timestamp}.pdf`;

            const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });
            return pdfFile;

        } catch (error: unknown) {
            console.error('❌ Error generating PDF:', error);
            throw error;
        } finally {
            cleanup();
        }
    };

    const uploadPDF = async (pdfFile: File): Promise<void> => {
        try {
            setIsUploading(true);
            const payload = {
                ConsentFormTitle: consentName,
                PdfFile: pdfFile,
            };
            const response = await AddPdfPublic(consentId, payload);

            setUploadSuccess(true);
            toast.success(`${response.data.message}`)

        } catch (err: any) {
            console.error("❌ Upload failed:", err.response?.data || err.message);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    const createPayload = async () => {
        try {
            const timestamp = new Date().toISOString();

            let signatureBase64 = null;
            if (formData.signatureFile) {
                signatureBase64 = await convertFileToBase64(formData.signatureFile);
            }

            const payload = {
                formType: consentName,
                submissionId: `terms_${Date.now()}`,
                timestamp: timestamp,
                participantInfo: {
                    consentId: consentId,
                    name: formData.participantName || profileData?.fullName,
                    age: formData.age,
                    address: formData.address,
                    gender: formData.gender,
                    phoneNumber: formData.phoneNumber,
                    emergencyContact: formData.emergencyContact,
                    guardianName: formData.guardianName,
                    timeSlotFrom: formData.timeSlotFrom,
                    timeSlotTo: formData.timeSlotTo,
                    weekDay: formData.weekDay,
                    periodMonths: formData.periodMonths,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    feesAmount: formData.feesAmount,
                    submissionDate: formData.date
                },
                signature: {
                    fileName: formData.signatureFile?.name || null,
                    fileType: formData.signatureFile?.type || null,
                    fileSize: formData.signatureFile?.size || null,
                    base64Data: signatureBase64
                },
                termsDetails: {
                    programType: "HIGH5 Sports Performance Training",
                    organizationName: 'HIGH5 PERFORMANCE',
                    termsAccepted: true,
                    place: 'Ahmedabad',
                    conditions_agreed: [
                        'Attendance at specified time slots',
                        'Payment terms and conditions',
                        'Class duration and punctuality',
                        'Fixed schedule adherence',
                        'No accommodation for missed classes',
                        'Proper attire requirements',
                        'Personal insurance responsibility',
                        'Gym rules compliance',
                        'Instructor authority acknowledgment',
                        'Breach consequences understanding',
                        'Equipment damage liability',
                        'Dispute resolution agreement'
                    ]
                },
                metadata: {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    formVersion: '1.0'
                }
            };

            return payload;
        } catch (error: unknown) {
            console.error('❌ Error creating payload:', error);
            throw error;
        }
    };

    const handleVerify = async (): Promise<void> => {
        if (!formData.participantName || !formData.signatureFile) {
            alert('Please fill in participant name and upload signature.');
            return;
        }

        try {
            setIsGeneratingPDF(true);
            const payload = await createPayload();
            console.group('📋 TERMS & CONDITIONS SUBMISSION DATA');
            console.groupEnd();
            const pdfFile = await generatePDFFile();
            if (!pdfFile) {
                throw new Error('Failed to generate PDF file');
            }
            setIsVerified(true);
            await uploadPDF(pdfFile);
        } catch (error: unknown) {
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadPDF = async (): Promise<void> => {
        try {
            setIsGeneratingPDF(true);
            const pdfFile = await generatePDFFile();
            if (!pdfFile) {
                throw new Error('Failed to generate PDF file');
            }
            const url = URL.createObjectURL(pdfFile);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error: unknown) {
            console.error('❌ Error downloading PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleBack = () => {
        router.push('/clinicpatient');
    };

    return (
        <PublicDefault>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto pt-6 px-4">
                    {/* Header */}
                    <div className="relative flex items-center mb-6 pb-4 font-poppins-600 font-semibold">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 text-black text-sm flex items-center gap-1 hover:text-gray-600 transition-colors"
                        >
                            &lt; Back
                        </button>
                        <h1 className="mx-auto text-xl font-semibold text-blue-800 font-poppins-600 border-b-2 border-blue-600">
                            Terms & Conditions
                        </h1>
                    </div>

                    {/* Main Content - This will be captured for PDF */}
                    <div ref={formRef} className="mb-4 bg-white mx-auto p-6">
                        {/* HIGH5 Logo and Title */}
                        <div className="text-center mb-8">
                            <div className="mb-2">
                                <img
                                    src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                    alt="HIGH5 Logo"
                                    className="w-40 h-auto mx-auto"
                                />
                            </div>
                            <div className="text-2xl font-semibold text-black">
                                TERMS & CONDITIONS
                            </div>
                        </div>


                        {/* Participant Information */}
                        <div className="space-y-4 mb-6">
                            {/* First Line: Name, Age, Residing at, Gender */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-black">I,</span>
                                <div className="border-b border-gray-400 min-w-40">
                                    <input
                                        type="text"
                                        name="participantName"
                                        value={formData.participantName}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm"
                                        required
                                    />
                                    <div className="p-1 min-h-6 flex items-center pdf-show font-medium" style={{ display: 'none' }}>
                                        {formData.participantName || profileData?.fullName}
                                    </div>
                                </div>
                                <span className="text-black">, aged</span>
                                <div className="border-b border-gray-400 w-12">
                                    <input
                                        type="text"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm text-center"
                                    />
                                    <div className="p-1 min-h-6 flex items-center justify-center pdf-show" style={{ display: 'none' }}>
                                        {formData.age}
                                    </div>
                                </div>
                                <span className="text-black">, residing at</span>
                                <div className="border-b border-gray-400 flex-grow">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm"
                                    />
                                    <div className="p-1 min-h-6 flex items-center pdf-show" style={{ display: 'none' }}>
                                        {formData.address}
                                    </div>
                                </div>
                                <span className="text-black">(Gender:</span>
                                <div className="border-b border-gray-400 w-16">
                                    <input
                                        type="text"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm text-center"
                                    />
                                    <div className="p-1 min-h-6 flex items-center justify-center pdf-show" style={{ display: 'none' }}>
                                        {formData.gender}
                                    </div>
                                </div>
                                <span className="text-black">),</span>
                            </div>

                            {/* Second Line: Phone and Emergency Contact */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-black">Phone No:</span>
                                <div className="border-b border-gray-400 w-32">
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm"
                                    />
                                    <div className="p-1 min-h-6 flex items-center pdf-show" style={{ display: 'none' }}>
                                        {formData.phoneNumber}
                                    </div>
                                </div>
                                <span className="text-black">Emergency contact No:</span>
                                <div className="border-b border-gray-400 w-32">
                                    <input
                                        type="text"
                                        name="emergencyContact"
                                        value={formData.emergencyContact}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm"
                                    />
                                    <div className="p-1 min-h-6 flex items-center pdf-show" style={{ display: 'none' }}>
                                        {formData.emergencyContact}
                                    </div>
                                </div>
                                <span className="text-black">agree to the Terms and</span>
                            </div>

                            {/* Third Line */}
                            <div className="text-sm text-black">
                                Conditions of admission and use of the High5 Sports Performance Training facility as under:
                            </div>
                        </div>

                        {/* Terms and Conditions Content */}
                        <div className="space-y-3 text-sm text-black mb-6">
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">1.</span>
                                    <div className="flex flex-wrap items-center gap-1 text-sm">
                                        <span>I shall remain present to perform all activities at the time slot of</span>
                                        <div className="border-b border-gray-400 w-16 mx-1">
                                            <input
                                                type="text"
                                                name="timeSlotFrom"
                                                value={formData.timeSlotFrom}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.timeSlotFrom}
                                            </div>
                                        </div>
                                        <span>to</span>
                                        <div className="border-b border-gray-400 w-16 mx-1">
                                            <input
                                                type="text"
                                                name="timeSlotTo"
                                                value={formData.timeSlotTo}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.timeSlotTo}
                                            </div>
                                        </div>
                                        <span>as allotted to on</span>
                                        <div className="border-b border-gray-400 w-20 mx-1">
                                            <input
                                                type="text"
                                                name="weekDay"
                                                value={formData.weekDay}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.weekDay}
                                            </div>
                                        </div>
                                        <span>of the week, for a period of</span>
                                        <div className="border-b border-gray-400 w-12 mx-1">
                                            <input
                                                type="text"
                                                name="periodMonths"
                                                value={formData.periodMonths}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.periodMonths}
                                            </div>
                                        </div>
                                        <span>months, from</span>
                                        <div className="border-b border-gray-400 w-20 mx-1">
                                            <input
                                                type="text"
                                                name="startDate"
                                                value={formData.startDate}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.startDate}
                                            </div>
                                        </div>
                                        <span>to</span>
                                        <div className="border-b border-gray-400 w-20 mx-1">
                                            <input
                                                type="text"
                                                name="endDate"
                                                value={formData.endDate}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.endDate}
                                            </div>
                                        </div>
                                        <span>date.</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">2.</span>
                                    <div className="flex flex-wrap items-center gap-1 text-sm">
                                        <span>I hereby agree to pay the fees amounting to Rs</span>
                                        <div className="border-b border-gray-400 w-20 mx-1">
                                            <input
                                                type="text"
                                                name="feesAmount"
                                                value={formData.feesAmount}
                                                onChange={handleInputChange}
                                                placeholder=""
                                                className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-xs text-center"
                                            />
                                            <div className="p-1 min-h-5 flex items-center justify-center pdf-show text-xs" style={{ display: 'none' }}>
                                                {formData.feesAmount}
                                            </div>
                                        </div>
                                        <span>in advance, either in full or in two installments. No discount whatsoever shall be provided and only flat rate of fees is applicable. I understand that payment for High 5 Sports Performance programs occurs prior to program participation. I understand that all fitness classes and personal training sessions are non-transferable and non-refundable</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">3.</span>
                                    <span>Each class shall be conducted for 60 minutes at the time specified above. In case any student is late for the class, no extra or compensatory time shall be allotted post the completion of the scheduled class.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">4.</span>
                                    <span>The time and days of classes will not be changed from the above mentioned time and days. The students shall strictly adhere to and follow the said timings.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">5.</span>
                                    <span>No accommodations will be made for any number of classes missed thereafter regardless of the reason for missing the class. If the instructor has to cancel the class due to any unavoidable circumstances the said cancelled class will be rescheduled at the convenience of the student and instructor.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">6.</span>
                                    <span>The student shall be allowed entry only in proper sportswear and a clean pair of sports shoes.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">7.</span>
                                    <span>You may, at your own discretion and expense, obtain personal insurance for loss, injury or damage that you might sustain arising from use of the gym. You shall exercise at your own discretion and accept any injury or illness brought on by exercise at your own accordance.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">8.</span>
                                    <span>You hereby agree to comply with the Rules of the gym which are displayed prominently in the Gym. The rules relate to opening hours, class timings, use of facilities and your conduct. We may make reasonable changes to these Rules as displayed on the board at the Gym from time to time.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">9.</span>
                                    <span>In the event of a breach of gym rules and regulations the Instructor reserves the right of admission and may reserve the right to require any member or guest to leave the premises. Any member found in breach of rules or committing an illegal act, including theft, will be asked to permanently leave the gym and be barred indefinitely from entering the gym.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">10.</span>
                                    <span>If we take no action or let you off any breach of any of the terms and conditions or give you extra time to pay or comply of the said agreement, strictly at our sole discretion.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">11.</span>
                                    <span>In case of damage to any equipment or any loss caused by the student to the gym facility, the student shall be liable to make good any loss caused to the gym at the sole expenses of the student.</span>
                                </div>

                                <div className="flex gap-2">
                                    <span className="font-bold min-w-fit">12.</span>
                                    <span>In the event of any dispute or differences between the parties with respect to the said agreement, the parties will be governed by the prevailing laws of India and will refer the dispute/differences to Conciliation in accordance with the provisions of Arbitration and Conciliation Act, 1996 and the Employer will have the sole rights to appoint a Conciliator. In case the disputes/ differences are not amicably settled by Conciliation, the said dispute/ differences will be referred to Arbitration by a sole arbitrator in accordance with the provisions of Arbitration and Conciliation Act, 1996, and the seat and place of arbitration shall be at Ahmedabad, Gujarat only. The Employer shall have the sole rights and power to appoint the sole Arbitrator in case of any dispute or differences.</span>
                                </div>
                            </div>
                        </div>

                        {/* Signature Section */}
                        <div className="space-y-4 pt-4">
                            {/* Guardian text at top */}
                            <div className="text-right">
                                <div className="text-sm text-black">(Guardian, in case of minor)</div>
                            </div>

                            {/* Digital Signature Display - Show in both form and PDF */}
                            {formData.signatureFile && (
                                <div className="text-right space-y-2">
                                    <div className="text-sm font-medium text-black">Digital Signature</div>
                                    <div className="text-xs text-gray-600 pdf-hidden">
                                        Signature uploaded: {formData.signatureFile.name}
                                    </div>
                                    {imagePreview && (
                                        <div className="flex justify-end">
                                            <img
                                                src={imagePreview}
                                                alt="Digital Signature"
                                                className="h-16 max-w-48 object-contain border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    )}
                                    {formData.signatureFile.type === 'application/pdf' && (
                                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 text-right pdf-hidden">
                                            PDF signature uploaded. Preview not available for PDF files.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Signature Field */}
                            <div className="flex justify-end">
                                <div className="w-48">
                                    <div className="border-b border-gray-400">
                                        <input
                                            type="text"
                                            name="guardianName"
                                            value={formData.guardianName}
                                            onChange={handleInputChange}
                                            placeholder=""
                                            className="w-full p-1 border-none outline-none bg-transparent pdf-hidden text-sm text-center"
                                            required
                                        />
                                        <div className="p-1 min-h-6 flex items-center justify-center pdf-show font-medium" style={{ display: 'none' }}>
                                            {formData.guardianName}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Date and Place at bottom */}
                            <div className="flex justify-between items-center mt-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-black">Date:</span>
                                    <div className="text-black font-medium">
                                        {new Date().toLocaleDateString('en-GB')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-black">Place: Ahmedabad</div>
                                </div>
                            </div>

                            {/* Signature Upload Interface (hidden in PDF) */}
                            <div className="pdf-hidden">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Digital Signature *
                                </label>

                                {/* Show signature file info if uploaded */}
                                {formData.signatureFile && (
                                    <div className="mb-2 p-2 rounded-lg">
                                        <div className="text-sm flex items-center gap-2 mb-3">
                                            <FileText className="h-4 w-4" />
                                            <span className="font-medium">Signature uploaded:</span> {formData.signatureFile.name}
                                        </div>

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="mb-3">
                                                <img
                                                    src={imagePreview}
                                                    alt="Signature preview"
                                                    className="max-w-full max-h-30 object-contain border border-gray-300 rounded-md"
                                                />
                                            </div>
                                        )}

                                        {/* PDF Preview Notice */}
                                        {formData.signatureFile.type === 'application/pdf' && (
                                            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                                                PDF file uploaded. Preview not available for PDF files.
                                            </div>
                                        )}

                                        <button
                                            onClick={removeSignature}
                                            className="text-sm text-red-600 hover:text-red-800"
                                        >
                                            Remove signature
                                        </button>
                                    </div>
                                )}

                                {!showSignatureOptions && !formData.signatureFile ? (
                                    /* Initial Attach Signature Button */
                                    <div className="text-start mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowSignatureOptions(true)}
                                            className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                                        >
                                            Attach Signature
                                        </button>
                                    </div>
                                ) : showSignatureOptions && !showCamera ? (
                                    /* Upload Options */
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <div className="text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <div className="mb-4 space-y-2">
                                                {/* File Upload Button */}
                                                <div>
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpg,image/jpeg,application/pdf"
                                                            onChange={handleSignatureUpload}
                                                            className="hidden"
                                                        />
                                                        <span className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                                                            <Upload className="h-4 w-4" />
                                                            Upload File
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Camera Button */}
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={startCamera}
                                                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                                                    >
                                                        <Camera className="h-4 w-4" />
                                                        Take Photo
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-500">
                                                Upload signature file or take a photo.<br />
                                                <strong>Supported formats: PNG, JPG, JPEG, PDF only</strong>
                                            </p>

                                            {/* Cancel Button */}
                                            <button
                                                onClick={() => setShowSignatureOptions(false)}
                                                className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : showCamera ? (
                                    /* Camera Interface */
                                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                                        <div className="bg-gray-900 p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-white font-medium">Camera</h3>
                                                <button
                                                    onClick={stopCamera}
                                                    className="text-white hover:text-gray-300 transition-colors"
                                                >
                                                    <X className="h-6 w-6" />
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    className="w-full max-w-md mx-auto rounded-lg"
                                                    style={{ transform: 'scaleX(-1)' }}
                                                />
                                                <canvas ref={canvasRef} className="hidden" />
                                            </div>

                                            <div className="flex justify-center mt-4 space-x-4">
                                                <button
                                                    onClick={capturePhoto}
                                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    Capture
                                                </button>
                                                <button
                                                    onClick={stopCamera}
                                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end mt-8 pb-8 gap-4">
                        {isVerified && !uploadSuccess && (
                            <>
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPDF || isUploading}
                                    className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {uploadSuccess && (
                            <div className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 bg-green-100 text-green-800 border border-green-300">
                                <Check className="h-5 w-5" />
                                Uploaded Successfully
                            </div>
                        )}

                        <button
                            onClick={handleVerify}
                            disabled={isVerified || isGeneratingPDF || isUploading}
                            className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${isVerified && uploadSuccess
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                                }`}
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating PDF...
                                </>
                            ) : isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <CloudUpload className="h-4 w-4" />
                                    Uploading...
                                </>
                            ) : isVerified && uploadSuccess ? (
                                <>
                                    <Check className="h-5 w-5" />
                                    Completed
                                </>
                            ) : (
                                'Submit & Upload'
                            )}
                        </button>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </PublicDefault>
    );
};

export default ConsentForm;