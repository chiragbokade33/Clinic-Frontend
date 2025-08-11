'use client'
import React, { useState, useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { Upload, FileText, Check, Camera, X } from 'lucide-react';
import DefaultLayout from '../components/DefaultLayout';
import { useRouter } from 'next/navigation';

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

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const handleVerify = (): void => {
        if (formData.patientName && formData.signatureFile) {
            setIsVerified(true);
            alert('Form verified successfully!');
        } else {
            alert('Please fill in all required fields and upload signature.');
        }
    };

    const handleBack = () => {
        router.push('/clinicpatient');
    };

    return (
        <DefaultLayout>
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


                    {/* Main Content */}
                    <div className="mb-4 border bg-white mx-auto shadow-sm">
                        <div className='flex justify-end mx-3 mt-4'>
                            <img
                                src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
                                alt="ARTHRONE Logo"
                                className="w-24 h-auto"
                            />
                        </div>
                        <div className="flex items-center justify-between p-2 mt-2 mb-2">
                            <div className="text-center w-full">
                                <h2 className="text-xl text-black font-semibold mb-1 font-poppins-600">Consent form</h2>
                                <p className="text-black font-semibold text-xl font-poppins-600 ">TMD/TMJP Treatment Protocol</p>
                            </div>
                        </div>

                        {/* Consent Content */}
                        <div className="space-y-4 text-sm text-gray-700 mb-8 mx-3">
                            <div className="font-montserrat-300">
                                <strong className="text-black font-bold">  1:  Ankit Kuchara</strong> understand that the treatment of dental conditions
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
                                <input
                                    type="text"
                                    name="guardianName"
                                    value={formData.guardianName}
                                    onChange={handleInputChange}
                                    placeholder="Name . . ."
                                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className='text-black flex justify-end'>
                                18 - 07 - 2026
                            </div>

                            {/* Signature Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Digital Signature *
                                </label>

                                {/* Show signature file info if uploaded */}
                                {formData.signatureFile && (
                                    <div className="mb-4 p-4  rounded-lg">
                                        <div className="text-sm  flex items-center gap-2 mb-3">
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
                    <div className="flex justify-end mt-8 pb-8">
                        <button
                            onClick={handleVerify}
                            disabled={isVerified}
                            className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${isVerified
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isVerified ? (
                                <>
                                    <Check className="h-5 w-5" />
                                    Verified
                                </>
                            ) : (
                                'Verify'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default ConsentForm;