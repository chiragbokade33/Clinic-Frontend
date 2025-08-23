'use client'
export const runtime = "edge";           // ✅ Run on Edge runtime
export const dynamic = "force-dynamic";
import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { Upload, FileText, Check, Camera, X, Download, CloudUpload } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import PublicDefault from '../components/publicDefault';
import { AddPdfPublic } from '../services/ClinicServiceApi';
import { toast, ToastContainer } from 'react-toastify';

// Type definitions
interface FormData {
    patientName: string;
    guardianName: string;
    signatureFile: File | null;
    date: string;
}

interface ConsentFormProps {
    // Add any props here if needed in the future
}

const ConsentForm: React.FC<ConsentFormProps> = () => {
    const [formData, setFormData] = useState<FormData>({
        patientName: '',
        guardianName: '',
        signatureFile: null,
        date: new Date().toISOString().split('T')[0]
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Extract URL parameters
    // Expected URL format: /publicConsentForm?ConsentId=5&ConsentName=DTR%20Consent
    const getUrlParams = () => {
        const params = Object.fromEntries(searchParams.entries());
        // Extract ConsentId and ConsentName from URL parameters
        const consentId = params.ConsentId ? Number(params.ConsentId) : 121212; // fallback to default
        const consentName = params.ConsentName ? decodeURIComponent(params.ConsentName) : "TMD/TMJP Treatment Protocol - Consent Form";
        
        return { consentId, consentName };
    };

    // Update the component to use the new parameter names
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

    // Cleanup camera stream and object URLs on component unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            // Clean up object URL to prevent memory leaks
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
            // Validate file type
            const allowedTypes: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'application/pdf'];
            const fileType: string = file.type.toLowerCase();

            if (!allowedTypes.includes(fileType)) {
                alert('Please upload only PNG, JPG, JPEG, or PDF files.');
                e.target.value = ''; // Clear the input
                return;
            }

            // Clean up previous preview URL
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }

            // Create preview URL for images (not for PDFs)
            let previewUrl: string | null = null;
            if (file.type.startsWith('image/')) {
                previewUrl = URL.createObjectURL(file);
            }

            setFormData(prev => ({
                ...prev,
                signatureFile: file
            }));
            setImagePreview(previewUrl);
            setShowSignatureOptions(false); // Hide options after file upload
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
        setShowSignatureOptions(true); // Return to options menu
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

                // Clean up previous preview URL
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                }

                // Create preview URL for captured photo
                const previewUrl: string = URL.createObjectURL(file);

                setFormData(prev => ({
                    ...prev,
                    signatureFile: file
                }));
                setImagePreview(previewUrl);
                stopCamera();
                setShowSignatureOptions(false); // Hide options after successful capture
            }, 'image/jpeg', 0.9);
        }
    }, [stream, imagePreview]);

    const removeSignature = (): void => {
        // Clean up object URL
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setFormData(prev => ({ ...prev, signatureFile: null }));
        setImagePreview(null);
        setShowSignatureOptions(false);
        setShowCamera(false);
    };

    // Convert file to base64 for payload
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    // UPDATED: Generate PDF and return as File object for upload
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

            // Style override for PDF generation
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
                    border-bottom: none !important;
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

                (element as HTMLElement).style.setProperty('border', 'none', 'important');
                (element as HTMLElement).style.setProperty('outline', 'none', 'important');
                (element as HTMLElement).style.setProperty('box-shadow', 'none', 'important');
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
                scale: 1.5,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                width: Math.min(formRef.current.scrollWidth, 1600),
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
                        htmlEl.style.setProperty('border', 'none', 'important');
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
            const minScale = 0.5;
            const scale = Math.max(Math.min(scaleX, 1), minScale);

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

            // UPDATED: Get PDF as blob and convert to File
            const pdfBlob = pdf.output('blob');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const safeName = (formData.guardianName || 'patient').replace(/[^a-zA-Z0-9]/g, '_');
            const safeTitle = consentName.replace(/[^a-zA-Z0-9]/g, '_'); // FIXED: Use consentName
            const filename = `${safeTitle}_${safeName}_${timestamp}.pdf`;

            // Convert blob to File object
            const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

            
            return pdfFile;

        } catch (error: unknown) {
            console.error('❌ Error generating PDF:', error);
            throw error;
        } finally {
            cleanup();
        }
    };

    // UPDATED: Upload PDF to server
    const uploadPDF = async (pdfFile: File): Promise<void> => {
        try {
            setIsUploading(true);
            const payload = {
                ConsentFormTitle: consentName, // Use the extracted consent name
                PdfFile: pdfFile,
            };
            // Pass the extracted consentId instead of hardcoded patientId
            const response = await AddPdfPublic(consentId, payload);
            
            setUploadSuccess(true);
            toast.success('PDF uploaded successfully!')

        } catch (err: any) {
            console.error("❌ Upload failed:", err.response?.data || err.message);
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    // UPDATED: Create payload for form data
    const createPayload = async () => {
        try {
            const timestamp = new Date().toISOString();

            let signatureBase64 = null;
            if (formData.signatureFile) {
                signatureBase64 = await convertFileToBase64(formData.signatureFile);
            }

            const payload = {
                formType: consentName, // FIXED: Use consentName
                submissionId: `consent_${Date.now()}`,
                timestamp: timestamp,
                patientInfo: {
                    consentId: consentId, // FIXED: Use consentId
                    name: formData.patientName || 'Ankit Kuchara',
                    guardianName: formData.guardianName,
                    submissionDate: formData.date
                },
                signature: {
                    fileName: formData.signatureFile?.name || null,
                    fileType: formData.signatureFile?.type || null,
                    fileSize: formData.signatureFile?.size || null,
                    base64Data: signatureBase64
                },
                consentDetails: {
                    treatmentType: consentName, // FIXED: Use consentName
                    clinicName: 'ARTHRONE',
                    consentGiven: true,
                    risks_acknowledged: [
                        'TMJ treatment difficulty',
                        'Treatment length variation',
                        'Possible side effects',
                        'Patient cooperation required',
                        'Referral to other professionals',
                        'Diagnostic evaluation requirements',
                        'No guarantee of results'
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

    // UPDATED: Handle form submission with PDF generation and upload
    const handleVerify = async (): Promise<void> => {
        if (!formData.guardianName || !formData.signatureFile) {
            alert('Please fill in guardian name and upload signature.');
            return;
        }

        try {
            setIsGeneratingPDF(true);
            const payload = await createPayload();
            console.group('📋 CONSENT FORM SUBMISSION DATA');
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

    // Download PDF separately if needed
    const handleDownloadPDF = async (): Promise<void> => {
        try {
            setIsGeneratingPDF(true);
            const pdfFile = await generatePDFFile();
            if (!pdfFile) {
                throw new Error('Failed to generate PDF file');
            }
            // Create download link
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
                <div className="max-w-3xl mx-auto pt-6 px-4">
                    {/* Header */}
                    <div className="relative flex items-center mb-6 pb-4 font-poppins-600 font-semibold">
                        <button
                            onClick={handleBack}
                            className="absolute left-0 text-black text-sm flex items-center gap-1 hover:text-gray-600 transition-colors"
                        >
                            &lt; Back
                        </button>
                        <h1 className="mx-auto text-xl font-semibold text-blue-800 font-poppins-600 border-b-2 border-blue-600">
                            Consent form
                        </h1>
                    </div>

                    {/* Main Content - This will be captured for PDF */}
                    <div ref={formRef} className="mb-4 bg-white mx-auto">
                        <div className='flex justify-end mx-3 mt-4'>
                            <img
                                src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
                                alt="ARTHRONE Logo"
                                className="w-24 h-auto"
                            />
                        </div>
                        <div className="flex items-center justify-between p-2 ">
                            <div className="text-center w-full">
                                <h2 className="text-xl text-black font-semibold mb-1 font-poppins-600">{consentName}</h2>
                            </div>
                        </div>

                        {/* Consent Content */}
                        <div className="space-y-4 text-sm text-gray-700 mb-8 mx-3">
                            <div className="font-montserrat-300">
                                <strong className="text-black font-bold">I: {formData.patientName || 'Ankit Kuchara'}</strong> understand that the treatment of dental conditions
                                pertaining to the Temporomandibular joint (TMJ) includes certain risks. I
                                willingly accept to undergo the following for successful treatment:
                            </div>

                            <ul className="space-y-3 ml-4">
                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>The treatment of TMJ disorder is perhaps the most difficult procedure in
                                        Dentistry. The disorders of TMJ can mimic other dental and medical problems.
                                        Hence, it is important to inform this office of any change in the health history
                                        from before.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>The length of the treatment may vary according to the complexity of the
                                        condition. Estimated time for treatment depends on severity of the case and
                                        how long symptoms have existed.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>As with any medical or dental treatment, unusual occurrences can and do
                                        happen like minor tooth movement, sore mouth, ulcers, muscle spasms, neck
                                        pain, dizziness, ear ache, persistent pain, dyskinetic movements etc. It is the
                                        patient's responsibility to immediately seek attention should any undue or
                                        unexpected problems occur and to immediately notify this office if treatment
                                        cannot be continued in a timely manner or if any appointment cannot be
                                        attended.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>Good communication is essential to successful treatment. Please feel free to
                                        discuss any questions you may have regarding any aspect of treatment.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>Referral to other professionals such as physiotherapists, nutritionists,
                                        chiropractors, medical doctors, neurologists, ENT Specialists, psychologists,
                                        psychiatrists etc., may be indicated and necessary for successful treatment.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>With any medical or dental treatment, the success depends to a large extent
                                        on the degree of adaptability and cooperation of the patient in following the
                                        prescribed treatment plan. This treatment doesn't claim to cure TMD; it will
                                        help in management of condition and it may not work in few cases. Failure to
                                        comply with instructions will delay the treatment time and significantly affect
                                        success of the treatment.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>Comprehensive diagnostic evaluation which may include radiographs, study
                                        models, periodontal evaluation, patient photographs, sleep study, cone beam
                                        CT, MRIs, TENS application, Laser & ultrasound application, Jaw tracking,
                                        Axiography, Telescan, EMGs, Joint vibration studies etc., may be essential to aid
                                        in the mode of treatment which is to be followed.</span>
                                </li>

                                <li className="flex gap-2 font-montserrat-300">
                                    <span className="text-black text-2xl">•</span>
                                    <span>I have been given the opportunity to ask any questions regarding the
                                        nature and purpose of TMJ treatment, and I have received answers to my
                                        satisfaction. I voluntarily assume any and all possible risks, if any, which
                                        may be associated with any phase of this treatment in hopes of obtaining
                                        the desired results. No guarantee or promise has been made to me
                                        concerning the results.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6 pt-6 mx-3">

                            {/* Name & Signature Input */}
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Name & Signature (Patient/Relative or Guardian):
                                </label>
                                {/* Input field for editing */}
                                <input
                                    type="text"
                                    name="guardianName"
                                    value={formData.guardianName}
                                    onChange={handleInputChange}
                                    placeholder="Name . . ."
                                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pdf-hidden"
                                    required
                                />
                                {/* Display field for PDF */}
                                <div className="flex-grow p-2 min-h-8 flex items-center pdf-show font-medium" style={{ display: 'none' }}>
                                    {formData.guardianName || 'Name . . .'}
                                </div>
                            </div>

                            {/* Signature Display for PDF */}
                            {formData.signatureFile && imagePreview && (
                                <div className="flex items-center gap-4 mt-4 pdf-show" style={{ display: 'none' }}>
                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                        Digital Signature:
                                    </label>
                                    <div className="flex-grow flex justify-start">
                                        <img
                                            src={imagePreview}
                                            alt="Digital Signature"
                                            className="h-16 max-w-48 object-contain"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className='text-black flex justify-end font-medium'>
                                Date: {new Date().toLocaleDateString('en-GB')}
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
                <ToastContainer/>
            </div>
        </PublicDefault>
    );
};

export default ConsentForm;