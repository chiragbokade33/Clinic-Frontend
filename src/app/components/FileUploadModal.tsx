import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Trash2, Loader2, Eye, Download, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ListJsondata, Uploaebulk } from '../services/ClinicServiceApi';
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

interface ExistingAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedDate?: string;
}

interface FileUploadModalProps {
  clinicId?: number;
  patientId?: number;
  clinicVisitId?: number;
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  onUploadSuccess,
  onUploadError,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [patientId, setPatientId] = useState<number>();
  const [clinicVisitId, setClinicVisitId] = useState<number>();
  const [activeTab, setActiveTab] = useState<'upload' | 'existing'>('existing');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const [imgAttechData, setImgAttechData] = useState([]);


  const fetchDataFromAPI = useCallback(async () => {
    const extractedHfid = searchParams.get("hfid");
    const extractedLastVisitId = searchParams.get("visitId");
    const extractedPatientId = searchParams.get("patientId");

    if (!extractedHfid) return;

    const id = await getUserId();
    setCurrentUserId(id);

    try {
      const response = await ListJsondata(id, Number(extractedPatientId), Number(extractedLastVisitId));
      const apiData = response.data.data;

      // Process Images/Reports data
      const viewImgs = apiData.filter(
        (item: { type: string }) => item.type === "Images" || item.type === "Reports"
      );

      if (viewImgs.length > 0) {
        const allUrls = viewImgs.flatMap((entry: { jsonData: string }) => {
          const parsed = JSON.parse(entry.jsonData);
          if (Array.isArray(parsed)) {
            return parsed;
          } else if (parsed.images || parsed.reports) {
            return parsed.images || parsed.reports;
          }
          return [];
        });
        setImgAttechData(allUrls);
      } else {
        setImgAttechData([]);
      }

      // ... process other data types
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchDataFromAPI();
  }, [fetchDataFromAPI]);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  // Helper function to extract file info from URL
  const extractFileInfoFromUrl = (url: string, index: number): ExistingAttachment => {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || `file_${index + 1}`;

    // Extract file extension to determine type
    const extension = fileName.toLowerCase().split('.').pop() || '';
    let fileType = 'application/octet-stream';

    // Map extensions to MIME types
    const mimeTypes: { [key: string]: string } = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };

    if (mimeTypes[extension]) {
      fileType = mimeTypes[extension];
    }

    return {
      id: index + 1,
      fileName: decodeURIComponent(fileName),
      fileUrl: url,
      fileType: fileType,
      fileSize: undefined, // Will be unknown from URL alone
      uploadedDate: undefined
    };
  };

  // Load existing attachments when component mounts or imgAttechData changes
  useEffect(() => {
    if (imgAttechData && imgAttechData.length > 0) {
      // Check if it's an array of URLs or attachment objects
      if (typeof imgAttechData[0] === 'string') {
        // It's an array of URLs, convert to ExistingAttachment format
        const convertedAttachments = (imgAttechData as string[]).map((url, index) =>
          extractFileInfoFromUrl(url, index)
        );
        setExistingAttachments(convertedAttachments);
      } else {
        // It's already an array of ExistingAttachment objects
        setExistingAttachments(imgAttechData as ExistingAttachment[]);
      }
    } else {
      setExistingAttachments([]);
    }
  }, [imgAttechData]);

  // Extract parameters from URL on component mount
  useEffect(() => {
    const extractedLastVisitId = searchParams.get("visitId");
    const extractedPatientId = searchParams.get('patientId');
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

  const openModal = () => {
    setIsModalOpen(true);
    // Set default tab based on existing attachments
    setActiveTab(existingAttachments.length > 0 ? 'existing' : 'upload');
  };

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

  const getFileIconSmall = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-gray-500" />;
  };

  // Function to handle viewing existing attachments
  const viewAttachment = (attachment: ExistingAttachment) => {
    try {
      // Open in new tab
      window.open(attachment.fileUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error('Unable to open file. Please try downloading instead.');
    }
  };


  // Function to preview images inline
  const previewImage = (attachment: ExistingAttachment) => {
    if (attachment.fileType.startsWith('image/')) {
      // Create a modal or preview for images
      const imageWindow = window.open('', '_blank', 'width=800,height=600');
      if (imageWindow) {
        imageWindow.document.write(`
          <html>
            <head>
              <title>${attachment.fileName}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh; 
                  background: #f0f0f0;
                }
                img { 
                  max-width: 100%; 
                  max-height: 100vh; 
                  object-fit: contain; 
                  border-radius: 8px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
              </style>
            </head>
            <body>
              <img src="${attachment.fileUrl}" alt="${attachment.fileName}" onerror="document.body.innerHTML='<p>Unable to load image</p>'" />
            </body>
          </html>
        `);
      }
    } else {
      viewAttachment(attachment);
    }
  };

  // Upload function that creates payload and calls API
  const uploadFilesToServer = async (files: FileData[], clinicId: number, patientId: number, clinicVisitId: number, type: string = "Images") => {
    const payload = new FormData();
    payload.append('ClinicId', clinicId.toString());
    payload.append('PatientId', patientId.toString());
    payload.append('ClinicVisitId', clinicVisitId.toString());
    payload.append('Type', type);

    files.forEach((fileObj) => {
      payload.append('Files', fileObj.file);
    });

    const response = await Uploaebulk(payload);
    await fetchDataFromAPI();
    return response;
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    if (!currentUserId || !patientId || !clinicVisitId) {
      alert('Missing required information. Please ensure patientId and visitId are in the URL parameters.');
      return;
    }

    setIsUploading(true);

    try {
      const response = await uploadFilesToServer(
        uploadedFiles,
        currentUserId,
        patientId,
        clinicVisitId,
        "Images"
      );
      toast.success(response.data.message);
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
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          {existingAttachments.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {existingAttachments.length}
            </span>
          )}
          Attach Images
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">File Attachments</h2>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('existing')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'existing'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Existing Files ({existingAttachments.length})
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 font-medium transition-colors ${activeTab === 'upload'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                Upload New Files
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Existing Files Tab */}
              {activeTab === 'existing' && (
                <div>
                  {existingAttachments.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Existing Attachments ({existingAttachments.length})
                      </h4>
                      {existingAttachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                          {/* File Icon/Preview */}
                          <div className="flex-shrink-0">
                            {attachment.fileType.startsWith('image/') ? (
                              <div className="relative">
                                <img
                                  src={attachment.fileUrl}
                                  alt={attachment.fileName}
                                  className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => previewImage(attachment)}
                                  onError={(e) => {
                                    // Fallback to icon if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden">
                                  {getFileIcon(attachment.fileType)}
                                </div>
                              </div>
                            ) : (
                              getFileIcon(attachment.fileType)
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {attachment.fileName}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              {attachment.fileSize && (
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(attachment.fileSize)}
                                </p>
                              )}
                              {attachment.uploadedDate && (
                                <p className="text-sm text-gray-500">
                                  {new Date(attachment.uploadedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => attachment.fileType.startsWith('image/') ? previewImage(attachment) : viewAttachment(attachment)}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title={attachment.fileType.startsWith('image/') ? "Preview image" : "View file"}
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => viewAttachment(attachment)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments found</h3>
                      <p className="text-gray-500 mb-4">There are no existing files for this visit.</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Upload Files
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Upload New Files Tab */}
              {activeTab === 'upload' && (
                <div>
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
                    <p className="text-gray-500 mb-4">or click to browse files</p>
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
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
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
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
              {activeTab === 'upload' && (
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
                      : `Upload ${uploadedFiles.length > 0 ? `(${uploadedFiles.length})` : ''}`}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadModal;