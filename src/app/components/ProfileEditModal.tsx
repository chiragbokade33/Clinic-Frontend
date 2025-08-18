// components/ProfileEditModal.tsx
"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPencil, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import { Dialog } from '@headlessui/react';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinic: any;
    BASE_URL: string;
    onSave: (formData: FormData) => Promise<void>;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
    isOpen,
    onClose,
    clinic,
    BASE_URL,
    onSave,
}) => {
    const [editedAddress, setEditedAddress] = useState(clinic?.location || "");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    useEffect(() => {
        setEditedAddress(clinic?.location || "");
        setUploadedFile(null);
    }, [clinic]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("ClinicId", clinic.clinicId);
        formData.append("Address", editedAddress);
        if (uploadedFile) {
            formData.append("ProfilePhoto", uploadedFile);
        }
        await onSave(formData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full relative max-w-md rounded-sm bg-white p-6 space-y-4 shadow-lg">
                    {/* X Close Icon */}
                    <div className="absolute top-2 right-2">
                        <button onClick={onClose} className="text-gray-600 hover:text-black cursor-pointer">
                            <FontAwesomeIcon icon={faXmark} className="text-xl" />
                        </button>
                    </div>

                    {/* The rest of your modal content below */}

                    <div className="flex justify-center">

                        <div className="relative group">
                            <img
                                src={
                                    uploadedFile
                                        ? URL.createObjectURL(uploadedFile)
                                        : clinic?.profilePhoto
                                            ? `${BASE_URL}${clinic.profilePhoto}`
                                            : "/250bd3d11edb6cfc8add2600b5bb25c75b95d560.jpg"
                                }
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover"
                            />

                            {/* ✅ Always visible overlay + faCamera icon */}
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-100">
                                <label className="cursor-pointer text-gray-300 text-center">
                                    <FontAwesomeIcon icon={faCamera} className="text-xl " />
                                    <p className="text-gray-200 text-sm">Change Profile</p>
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                    </div>
                    <p className="text-blue-800 text-center">HF_id:{clinic?.hfid}</p>
                    <div>
                        <label className="block text-sm font-medium">Clinic Name:</label>
                        <input
                            type="text"
                            value={clinic?.clinicName}
                            disabled={true}
                            className="w-full border px-2 py-1 rounded mt-1 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email:</label>
                        <input
                            type="text"
                            value={clinic?.email}
                            disabled={true}
                            className="w-full border px-2 py-1 rounded mt-1 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Pincode:</label>
                        <input
                            type="text"
                            value={clinic?.pincode}
                            disabled={true}
                            className="w-full border px-2 py-1 rounded mt-1 cursor-not-allowed"
                        />

                        <p className="text-blue-800 text-sm text-end">{clinic?.location}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Address:</label>
                        <textarea
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            className="w-full border px-2 py-1 rounded mt-1"
                        />
                    </div>


                    <div className="flex justify-center gap-2 pt-4">
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-1 primary text-white rounded cursor-pointer"
                        >
                            Save
                        </button>
                        <button onClick={onClose} className="px-4 py-1 bg-gray-300 rounded cursor-pointer">
                            Discard
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ProfileEditModal;
