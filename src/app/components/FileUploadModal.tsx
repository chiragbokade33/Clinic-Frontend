import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, File, Image, FileText, Trash2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Uploaebulk } from '../services/ClinicServiceApi';
import { getUserId } from '../hooks/GetitemsLocal';
import { toast } from 'react-toastify';

interface FileData {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string | null;
}

interface FileUploadModalProps {
  clinicId?: number; // Optional since we'll get from getUserId
  patientId?: number; // Optional since we'll get from search params
  clinicVisitId?: number; // Optional since we'll get from search params  
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  onUploadSuccess,
  onUploadError
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [patientId, setPatientId] = useState<number>();
  const [clinicVisitId, setClinicVisitId] = useState<number>();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  // Extract parameters from URL on component mount
  useEffect(() => {
    const extractedLastVisitId = searchParams.get("visitId");
    const extractedPatientId = searchParams.get('patientId');

    console.log('URL Parameters:', {
      visitId: extractedLastVisitId,
      patientId: extractedPatientId
    });


    if (extractedLastVisitId) {
      setClinicVisitId(parseInt(extractedLastVisitId));
    }
    if (extractedPatientId) {
      setPatientId(parseInt(extractedPatientId));
    }
  }, [searchParams]);

  // Accepted file types
  const acceptedTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setUploadedFiles([]);
    setIsDragging(false);
    setIsUploading(false);
  };

  const handleFileSelection = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: FileData[] = [];

    fileArray.forEach((file: File) => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        return;
      }

      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return;
      }

      const fileData: FileData = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null
      };

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          setUploadedFiles((prev: FileData[]) =>
            prev.map((f: FileData) =>
              f.id === fileData.id
                ? { ...f, preview: e.target?.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      validFiles.push(fileData);
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelection(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelection(files);
    }
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  // Upload function that creates payload and calls API
  const uploadFilesToServer = async (files: FileData[], clinicId: number, patientId: number, clinicVisitId: number, type: string = "Images") => {
    // Create FormData payload
    const payload = new FormData();

    // Add required fields to payload
    payload.append('ClinicId', clinicId.toString());
    payload.append('PatientId', patientId.toString());
    payload.append('ClinicVisitId', clinicVisitId.toString());
    payload.append('Type', type);

    // Add files to payload
    files.forEach((fileObj) => {
      payload.append('Files', fileObj.file);
    });

    // Log payload info for debugging
    console.log('Creating upload payload:');
    console.log('ClinicId:', clinicId);
    console.log('PatientId:', patientId);
    console.log('ClinicVisitId:', clinicVisitId);
    console.log('Type:', type);
    console.log('Files:', files.map(f => f.name));

    // Call the API with payload
    const response = await Uploaebulk(payload);
    return response;
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    // Check if required data is available
    if (!currentUserId || !patientId || !clinicVisitId) {
      console.error('Missing required parameters:', {
        currentUserId,
        patientId,
        clinicVisitId
      });
      alert('Missing required information. Please ensure patientId and visitId are in the URL parameters.');
      return;
    }

    setIsUploading(true);

    try {
      // Call upload function with proper parameters
      const response = await uploadFilesToServer(
        uploadedFiles,
        currentUserId, // Using currentUserId as clinicId
        patientId,
        clinicVisitId,
        "Images" // Fixed type as "Images"
      );
      toast.success(response.data.message)
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
      closeModal();

    } catch (error) {
      console.error('Upload failed:', error);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="">
      {/* Original Card Component */}
      <div className="bg-white rounded-lg p-4 max-w-md mx-auto">
        <div className="h-45 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <img
            src="/3baffcaa27d289975ae5cb09f5eefe58b1e8d129.png"
            alt="High5 Logo"
            className="max-w-20 max-h-20 rounded"
          />
        </div>
        <button
          onClick={openModal}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors"
        >
          Attach Images
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Upload Files</h2>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Drag & Drop Files Here
                </h3>
                <p className="text-gray-500 mb-4">
                  or click to browse files
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={isUploading}
                />
                <p className="text-sm text-gray-500 mt-4">
                  Supported formats: PNG, JPG, GIF, WebP, PDF, TXT, DOC, DOCX (Max 10MB each)
                </p>
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    Selected Files ({uploadedFiles.length})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploadedFiles.map((file: FileData) => (
                      <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            getFileIcon(file.type)
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFile(file.id)}
                          disabled={isUploading}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Progress Info */}
              {isUploading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-blue-700">
                      Uploading {uploadedFiles.length} file(s)...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadedFiles.length === 0 || isUploading}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${uploadedFiles.length > 0 && !isUploading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>
                  {isUploading
                    ? 'Uploading...'
                    : `Upload ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}`
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadModal;