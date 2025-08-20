'use client'
import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { Upload, FileText, Check, Camera, X, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PublicDefault from '../components/publicDefault';

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
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [showCamera, setShowCamera] = useState<boolean>(false);
    const [showSignatureOptions, setShowSignatureOptions] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);

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

    // UPDATED: Enhanced PDF generation with perfect page sizing
    const generateSimplePDF = async (): Promise<void> => {
        try {
            setIsGeneratingPDF(true);
            console.log('🔄 Generating simple PDF as fallback...');
            
            // Dynamic import with better error handling
            const { default: jsPDF } = await import('jspdf');
            
            // Create A4 PDF format
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 20;
            
            // Add title
            pdf.setFontSize(16);
            pdf.setFont(undefined, 'bold');
            pdf.text('TMD/TMJP Treatment Protocol - Consent Form', pageWidth/2, yPosition, { align: 'center' });
            yPosition += 20;
            
            // Add patient info
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.text(`Patient Name: ${formData.patientName || 'Ankit Kuchara'}`, 20, yPosition);
            yPosition += 10;
            pdf.text(`Guardian Name: ${formData.guardianName}`, 20, yPosition);
            yPosition += 10;
            pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, yPosition);
            yPosition += 20;
            
            // Add consent text
            pdf.setFontSize(10);
            const consentText = [
                'I understand that the treatment of dental conditions pertaining to the',
                'Temporomandibular joint (TMJ) includes certain risks and I willingly accept',
                'to undergo the following for successful treatment:',
                '',
                '• TMJ disorder treatment is perhaps the most difficult procedure in Dentistry',
                '• Treatment length may vary according to the complexity of the condition',
                '• Unusual occurrences can happen like minor tooth movement, sore mouth, etc.',
                '• Good communication is essential to successful treatment',
                '• Referral to other professionals may be indicated and necessary',
                '• Success depends on the degree of adaptability and cooperation of the patient',
                '• Comprehensive diagnostic evaluation may be essential',
                '• No guarantee or promise has been made concerning the results'
            ];
            
            consentText.forEach(line => {
                if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = 20;
                }
                pdf.text(line, 20, yPosition);
                yPosition += 6;
            });
            
            // Add signature info
            yPosition += 20;
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'bold');
            pdf.text('Digital Signature Information:', 20, yPosition);
            yPosition += 10;
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(10);
            
            if (formData.signatureFile) {
                pdf.text(`Signature File: ${formData.signatureFile.name}`, 20, yPosition);
                yPosition += 8;
                pdf.text(`File Type: ${formData.signatureFile.type}`, 20, yPosition);
                yPosition += 8;
                pdf.text(`File Size: ${(formData.signatureFile.size / 1024).toFixed(2)} KB`, 20, yPosition);
            } else {
                pdf.text('No signature file attached', 20, yPosition);
            }
            
            // Generate filename and save
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const safeName = (formData.guardianName || 'patient').replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `TMD_TMJP_Consent_Form_${safeName}_${timestamp}.pdf`;
            
            pdf.save(filename);
            
            console.log('✅ Simple PDF generated successfully');
            alert('PDF generated successfully using simplified format!');
            
        } catch (error) {
            console.error('❌ Error generating simple PDF:', error);
            alert('Error generating PDF. Please try refreshing the page and trying again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // FIXED: Perfect PDF generation with exact page sizing
    const generatePDF = async (): Promise<void> => {
        try {
            setIsGeneratingPDF(true);
            console.log('🔄 Starting PDF generation...');

            // Check if form reference exists
            if (!formRef.current) {
                throw new Error('Form reference not found');
            }

            // Check if required libraries can be imported
            let jsPDF, html2canvas;
            try {
                console.log('📦 Importing PDF libraries...');
                const imports = await Promise.all([
                    import('jspdf'),
                    import('html2canvas')
                ]);
                jsPDF = imports[0].default;
                html2canvas = imports[1].default;
            } catch (importError) {
                console.error('❌ Failed to import libraries:', importError);
            }

            // Create a comprehensive style override to fix oklch() color issues
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
                    /* Override any oklch, hsl, or other modern color functions */
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
                /* Force all elements to use safe colors and no borders */
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
                /* Ensure the bottom border line is also removed */
                .pdf-temp-override .border-b,
                .pdf-temp-override .border-gray-400 {
                    border-bottom: none !important;
                }
            `;
            document.head.appendChild(styleOverride);

            // Additional step: Replace any oklch colors in computed styles and remove borders
            const replaceOklchColors = (element: Element) => {
                const computedStyle = window.getComputedStyle(element);
                const problematicProperties = ['color', 'background-color', 'border-color', 'outline-color'];
                
                problematicProperties.forEach(prop => {
                    const value = computedStyle.getPropertyValue(prop);
                    if (value.includes('oklch') || value.includes('hsl') || value.includes('lab')) {
                        // Force safe RGB color
                        (element as HTMLElement).style.setProperty(prop, 'rgb(0, 0, 0)', 'important');
                    }
                });
                
                // Remove all borders
                (element as HTMLElement).style.setProperty('border', 'none', 'important');
                (element as HTMLElement).style.setProperty('outline', 'none', 'important');
                (element as HTMLElement).style.setProperty('box-shadow', 'none', 'important');
            };

            // Apply color fixes to all elements
            const allElements = formRef.current.querySelectorAll('*');
            allElements.forEach(replaceOklchColors);

            // Add temporary class to form
            formRef.current.classList.add('pdf-temp-override');

            // Hide/show elements for PDF
            const elementsToHide = formRef.current.querySelectorAll('.pdf-hidden');
            const elementsToShow = formRef.current.querySelectorAll('.pdf-show');
            
            console.log(`🔄 Hiding ${elementsToHide.length} elements, showing ${elementsToShow.length} elements`);
            
            elementsToHide.forEach(el => {
                (el as HTMLElement).style.display = 'none';
            });
            
            elementsToShow.forEach(el => {
                (el as HTMLElement).style.display = 'block';
            });

            // Wait for DOM to update
            await new Promise(resolve => setTimeout(resolve, 300));

            console.log('📸 Capturing form content...');
            
            // Get form dimensions
            const formRect = formRef.current.getBoundingClientRect();
            console.log('📏 Form dimensions:', { 
                width: formRect.width, 
                height: formRect.height,
                scrollWidth: formRef.current.scrollWidth,
                scrollHeight: formRef.current.scrollHeight
            });

            // FIXED: Capture with optimized dimensions for A4 page breaking
            const canvas = await html2canvas(formRef.current, {
                scale: 1.5, // Reduced scale for better performance with large forms
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff',
                width: Math.min(formRef.current.scrollWidth, 1600), // Limit max width
                height: formRef.current.scrollHeight, // Use full height, we'll break into pages
                scrollX: 0,
                scrollY: 0,
                logging: false,
                removeContainer: true,
                imageTimeout: 15000,
                foreignObjectRendering: false,
                ignoreElements: (element) => {
                    return element.classList.contains('pdf-hidden') || 
                           element.tagName === 'SCRIPT' || 
                           element.tagName === 'STYLE' ||
                           element.classList.contains('no-pdf');
                },
                onclone: (clonedDoc) => {
                    // Additional cleanup in cloned document
                    const clonedElements = clonedDoc.querySelectorAll('.pdf-hidden');
                    clonedElements.forEach(el => el.remove());
                    
                    // Force safe colors and remove borders in cloned document
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

            console.log('✅ Canvas created:', { 
                width: canvas.width, 
                height: canvas.height 
            });

            // Check canvas size
            if (canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas has invalid dimensions');
            }

            // FIXED: Create PDF with proper A4 sizing
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;

            console.log('📄 PDF page dimensions:', { pageWidth, pageHeight });

            // Convert canvas to image with high quality
            const imgData = canvas.toDataURL('image/png', 0.95);
            
            // Check if image data is valid
            if (!imgData || imgData === 'data:,') {
                throw new Error('Failed to convert canvas to image');
            }

            // FIXED: Calculate image dimensions for proper A4 page breaking
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - (margin * 2);
            
            // Convert canvas dimensions to mm (1px = 0.264583mm at 96 DPI)
            const canvasWidthMM = canvas.width * 0.264583;
            const canvasHeightMM = canvas.height * 0.264583;
            
            // Calculate scale to fit width, but don't scale down too much to maintain readability
            const scaleX = availableWidth / canvasWidthMM;
            const minScale = 0.5; // Minimum scale to maintain readability
            const scale = Math.max(Math.min(scaleX, 1), minScale); // Don't scale up, but maintain minimum readability
            
            const imgWidth = canvasWidthMM * scale;
            const imgHeight = canvasHeightMM * scale;

            console.log('🖼️ Image dimensions for PDF:', { 
                imgWidth, 
                imgHeight, 
                scale,
                canvasWidthMM,
                canvasHeightMM,
                availableHeight 
            });

            // FIXED: Proper multi-page handling - break content when it exceeds A4 height
            const maxContentHeight = availableHeight;
            
            if (imgHeight <= maxContentHeight) {
                // Content fits on one page perfectly
                console.log('📄 Content fits on one page');
                pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
            } else {
                // Content needs multiple A4 pages
                console.log('📄 Content needs multiple pages');
                
                let currentY = 0; // Current Y position in the source canvas
                let pageNumber = 1;
                
                while (currentY < canvas.height) {
                    if (pageNumber > 1) {
                        pdf.addPage();
                        console.log(`📄 Adding page ${pageNumber}`);
                    }
                    
                    // Calculate how much of the source canvas fits on this page
                    const remainingSourceHeight = canvas.height - currentY;
                    const maxSourceHeightForThisPage = maxContentHeight / scale / 0.264583; // Convert back to pixels
                    const sourceHeightForThisPage = Math.min(remainingSourceHeight, maxSourceHeightForThisPage);
                    
                    // Calculate the corresponding display height in mm
                    const displayHeightForThisPage = sourceHeightForThisPage * 0.264583 * scale;
                    
                    console.log(`📄 Page ${pageNumber}:`, {
                        currentY,
                        sourceHeightForThisPage,
                        displayHeightForThisPage,
                        remainingSourceHeight
                    });
                    
                    // Create a temporary canvas for this page's content
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = Math.ceil(sourceHeightForThisPage);
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    if (tempCtx && sourceHeightForThisPage > 0) {
                        // Draw the portion of the original canvas onto the temporary canvas
                        tempCtx.drawImage(
                            canvas, 
                            0, currentY, // Source position
                            canvas.width, sourceHeightForThisPage, // Source dimensions
                            0, 0, // Destination position
                            canvas.width, sourceHeightForThisPage // Destination dimensions
                        );
                        
                        // Convert to image and add to PDF
                        const tempImgData = tempCanvas.toDataURL('image/png', 0.95);
                        pdf.addImage(tempImgData, 'PNG', margin, margin, imgWidth, displayHeightForThisPage);
                        
                        // Clean up temporary canvas
                        tempCanvas.remove();
                    }
                    
                    // Move to the next section
                    currentY += sourceHeightForThisPage;
                    pageNumber++;
                    
                    // Safety check to prevent infinite loops
                    if (pageNumber > 50) {
                        console.warn('⚠️ Too many pages, breaking to prevent infinite loop');
                        break;
                    }
                }
                
                console.log(`✅ Generated ${pageNumber - 1} pages total`);
            }

            // Generate filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
            const safeName = (formData.guardianName || 'patient').replace(/[^a-zA-Z0-9]/g, '_');
            const filename = `TMD_TMJP_Consent_Form_${safeName}_${timestamp}.pdf`;

            console.log('💾 Saving PDF:', filename);

            // Save the PDF
            pdf.save(filename);

            console.log('✅ PDF generated successfully');
            alert('PDF generated successfully!');

            // Cleanup
            cleanup();

        } catch (error) {

            cleanup();
        } finally {
            setIsGeneratingPDF(false);
        }

        // Cleanup function
        function cleanup() {
            console.log('🧹 Cleaning up...');
            
            // Remove temporary styles
            const styleOverride = document.getElementById('pdf-color-override');
            if (styleOverride && styleOverride.parentNode) {
                styleOverride.parentNode.removeChild(styleOverride);
            }
            
            // Remove temporary class
            if (formRef.current) {
                formRef.current.classList.remove('pdf-temp-override');
            }
            
            // Restore original display states
            const elementsToHide = formRef.current?.querySelectorAll('.pdf-hidden');
            const elementsToShow = formRef.current?.querySelectorAll('.pdf-show');
            
            elementsToHide?.forEach(el => {
                (el as HTMLElement).style.display = '';
            });
            
            elementsToShow?.forEach(el => {
                (el as HTMLElement).style.display = 'none';
            });
            
            console.log('✅ Cleanup completed');
        }
    };

    // Create payload and handle submission
    const createPayload = async () => {
        try {
            const timestamp = new Date().toISOString();
            
            let signatureBase64 = null;
            if (formData.signatureFile) {
                signatureBase64 = await convertFileToBase64(formData.signatureFile);
            }

            const payload = {
                formType: 'TMD_TMJP_Consent_Form',
                submissionId: `consent_${Date.now()}`,
                timestamp: timestamp,
                patientInfo: {
                    name: formData.patientName || 'Ankit Kuchara', // Default from form
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
                    treatmentType: 'TMD/TMJP Treatment Protocol',
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
        } catch (error) {
            console.error('❌ Error creating payload:', error);
            throw error;
        }
    };

    // Handle form submission
    const handleVerify = async (): Promise<void> => {
        if (!formData.guardianName || !formData.signatureFile) {
            alert('Please fill in guardian name and upload signature.');
            return;
        }

        try {
            console.log('🔄 Starting form submission process...');
            
            // Create payload
            const payload = await createPayload();
            
            // Log the complete form data
            console.group('📋 CONSENT FORM SUBMISSION DATA');
            console.log('📝 Form Data:', {
                patientName: formData.patientName,
                guardianName: formData.guardianName,
                signatureFileName: formData.signatureFile?.name,
                signatureFileType: formData.signatureFile?.type,
                signatureFileSize: formData.signatureFile?.size,
                date: formData.date
            });
            console.log('📦 Complete Payload:', payload);
            console.groupEnd();

            // Simulate API call (replace with your actual API endpoint)
            console.log('🚀 Sending payload to server...');
            
            // Example API call (uncomment and modify for your backend)
            /*
            const response = await fetch('/api/consent-forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Server response:', result);
            */

            // Set form as verified
            setIsVerified(true);
            
            // Generate PDF
            await generatePDF();
            
            // Success message
            alert('Form verified and submitted successfully! PDF has been generated.');
            console.log('✅ Form submission completed successfully');

        } catch (error) {
            console.error('❌ Error during form submission:', error);
            alert('Error submitting form. Please try again.');
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
                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                alt="ARTHRONE Logo"
                                className="w-24 h-auto"
                            />
                        </div>
                        <div className="flex items-center justify-between p-2 ">
                            <div className="text-center w-full">
                                <h2 className="text-xl text-black font-semibold mb-1 font-poppins-600">Consent form</h2>
                                <p className="text-black font-semibold text-xl font-poppins-600 ">TMD/TMJP Treatment Protocol</p>
                            </div>
                        </div>

                        {/* Consent Content */}
                        <div className="space-y-4 text-sm text-gray-700 mb-8 mx-3">
                            <div className="font-montserrat-300">
                                <strong className="text-black font-bold">  1:  {formData.patientName || 'Ankit Kuchara'}</strong> understand that the treatment of dental conditions
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
                                <div className="flex-grow p-2 min-h-8 flex items-center pdf-show font-medium" style={{display: 'none'}}>
                                    {formData.guardianName || 'Name . . .'}
                                </div>
                            </div>
                            
                            {/* Signature Display for PDF */}
                            {formData.signatureFile && imagePreview && (
                                <div className="flex items-center gap-4 mt-4 pdf-show" style={{display: 'none'}}>
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
                        {isVerified && (
                            <>
                                <button
                                    onClick={generatePDF}
                                    disabled={isGeneratingPDF}
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
                                
                                <button
                                    onClick={generateSimplePDF}
                                    disabled={isGeneratingPDF}
                                    className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 text-sm"
                                    title="Generate a simplified PDF if the main PDF generation fails"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4" />
                                            Simple PDF
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                        
                        <button
                            onClick={handleVerify}
                            disabled={isVerified || isGeneratingPDF}
                            className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                                isVerified
                                    ? 'bg-green-600 text-white cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
                            }`}
                        >
                            {isVerified ? (
                                <>
                                    <Check className="h-5 w-5" />
                                    Verified
                                </>
                            ) : isGeneratingPDF ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </PublicDefault>
    );
};

export default ConsentForm;