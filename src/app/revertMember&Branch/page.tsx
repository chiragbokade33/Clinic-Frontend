'use client';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import GenericConfirmModal from "../components/GenericConfirmModal";
import Link from 'next/link';
import PanelLayout from '../components/PanelLayout';
import { DeleteBrnaches, GetMemberList, RemoveUserList, RevertBranch, RevertUser } from '../services/ClinicServiceApi';
import { getUserId } from '../hooks/GetitemsLocal';


const AdminPanel = () => {
    const [isMembersExpanded, setIsMembersExpanded] = useState(true);
    const [isLabsExpanded, setIsLabsExpanded] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
    const [branchList, setBranchList] = useState() as any;
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [listMember, setListMember] = useState() as any;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<{ id: number; labId: number } | null>(null);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number>();

    useEffect(() => {
        const fetchUserId = async () => {
            const id = await getUserId();
            setCurrentUserId(id);
        };
        fetchUserId();
    }, []);
    const [selectedRestoreMember, setSelectedRestoreMember] = useState<{
        id: number;
        labId: number;
        role: string;
    } | null>(null);

    // This is Delete Branch List Api
    const BranchList = async () => {
        try {
            const response = await DeleteBrnaches();
            setBranchList(response?.data?.data || []);
        } catch (error) {
            console.error("Failed to fetch branches:", error);
            setBranchList([]);
        }
    }

    useEffect(() => {
        BranchList();
    }, [])

    // This handle is rever Beranch
    const handleRevertBranch = async (id: number) => {
        const payload = {
            id: id
        };
        try {
            const response = await RevertBranch(payload);
            toast.success(`${response.data.message}`)
            await BranchList();
        } catch (error) {
            console.error("Error reverting branch:", error);
        }
    };

    // This api for Delete Member
    const DeletedMember = async () => {
        const id = await getUserId();
        setCurrentUserId(id);
        const response = await GetMemberList(Number(id));
        setListMember(response?.data?.data?.deletedMembers);
    }

    useEffect(() => {
        DeletedMember();
    }, [])

    // This is for Restore the user
    const handleRestore = async (id: number, role: string) => {
        const clinicId = await getUserId();
        setCurrentUserId(clinicId);
        const payload = {
            id,
            clinicId,
            role,
        };

        try {
            const response = await RevertUser(payload);
            toast.success(`${response.data.message}`);
            await DeletedMember();
        } catch (error) {
            console.error("Restore failed", error);
        }
    };

    // This is Pramanetly remove 
    const handleRemovePermanently = async (id: number) => {
        const clinicId = await getUserId();
        setCurrentUserId(clinicId);
        const payload = { id, clinicId };
        try {
            const response = await RemoveUserList(payload);
            toast.success(`${response.data.message}`);
            await DeletedMember();
        } catch (error) {
            console.error("Restore failed", error);
        }
    };



    return (
        <PanelLayout>
            <div className="w-full  h-[calc(100vh-222px)] flex flex-col ">
                <div className="min-w-5xl mx-2 flex gap-8">
                    <Link href="/dashboard">
                        <p className="text-blue-600 font-semibold cursor-pointer hover:underline hover:text-blue-800">
                            ← Back Home
                        </p>
                    </Link>

                    <div className=" items-center justify-center bg-white relative ">

                        <div className="relative z-10">
                            <img
                                src="/86d6da8763537d75129226caabec832819c2c2e5.png"
                                alt="Image 1"
                                className="w-64 h-auto"
                            />

                            <img
                                src="/ac3693f001558bc88aa841575eb986cffb650260.png"
                                alt="Image 2"
                                className="w-64 h-auto absolute left-1 right-0 mx-auto -bottom-59 "
                            />
                        </div>
                    </div>

                    <div className="flex-1 mx-4 space-y-4 mt-2">
                        <div className="bg-white rounded-lg border border-black shadow-sm">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 mx-3"
                                onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                            >
                                <h2 className="text-blue-800 font-semibold text-xl">Removed Members & Admins :</h2>
                                <div className="ml-auto">
                                    <FontAwesomeIcon
                                        icon={isMembersExpanded ? faChevronUp : faChevronDown}
                                        className=" ml-2"
                                    />
                                </div>

                            </div>


                            {/* Card Grid */}
                            {isMembersExpanded && (
                                <div className="p-4 pt-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <div className="border-b-2 mx-3 mb-2"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {listMember?.map((member: any) => (
                                            <div key={member.id} className="rounded-xl border border-black shadow-sm ">
                                                {/* Top Banner */}
                                                <div className="bg-blue-100 rounded-tr-xl rounded-tl-xl border-b px-4 py-1 flex items-center justify-between text-sm">
                                                    <span>
                                                        <span className="text-red-600 font-semibold">Remove By:</span>{" "}
                                                        <span className="text-gray-800 font-medium">{member.deletedByUser}</span>
                                                    </span>
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            onClick={() =>
                                                                setMenuOpenId((prev) => (prev === member.id ? null : member.id))
                                                            }
                                                            className="text-gray-600 hover:text-gray-800 cursor-pointer"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>

                                                        {menuOpenId === member.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-black rounded-md shadow-lg z-50">
                                                                <p className="px-4 py-2 text-blue-800 font-semibold text-sm border-black">
                                                                    Restore as
                                                                </p>

                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm border border-gray-200 cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedRestoreMember({ id: member.id, labId: member.labId, role: "Admin" });
                                                                        setIsRestoreModalOpen(true);
                                                                    }}
                                                                >
                                                                    Admin
                                                                </button>

                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm border border-gray-200 cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedRestoreMember({ id: member.id, labId: member.labId, role: "Member" });
                                                                        setIsRestoreModalOpen(true);
                                                                    }}
                                                                >
                                                                    Team
                                                                </button>

                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-semibold border border-gray-200 cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedMember({ id: member.id, labId: member.labId });
                                                                        setIsDeleteModalOpen(true);
                                                                    }}
                                                                >
                                                                    Remove Permanently
                                                                </button>

                                                            </div>
                                                        )}
                                                    </div>
                                                    <GenericConfirmModal
                                                        isOpen={isDeleteModalOpen}
                                                        onClose={() => {
                                                            setIsDeleteModalOpen(false);
                                                            setSelectedMember(null);
                                                        }}
                                                        imageSrc="/Vector.png"
                                                        title={`Permanently Remove`}
                                                        dynamicName={`${member.name}`}
                                                        message="You're about to permanently delete {name}. This action is irreversible."
                                                        type="warning"
                                                        confirmText='Remove Anyway'
                                                        onConfirm={() => {
                                                            if (selectedMember) {
                                                                handleRemovePermanently(selectedMember.id);
                                                            }
                                                            setIsDeleteModalOpen(false);
                                                            setSelectedMember(null);
                                                        }}
                                                    />

                                                    <GenericConfirmModal
                                                        isOpen={isRestoreModalOpen}
                                                        onClose={() => {
                                                            setIsRestoreModalOpen(false);
                                                            setSelectedRestoreMember(null);
                                                        }}
                                                        imageSrc="/Vector.png"
                                                        title={`Restore ${selectedRestoreMember?.role ?? "Member"}`}
                                                        dynamicName={`${member.name}`}
                                                        message={`This action will restore the ${selectedRestoreMember?.role ?? "member"} back to the system. Are you sure you want to proceed?`}
                                                        onConfirm={() => {
                                                            if (selectedRestoreMember) {
                                                                handleRestore(
                                                                    selectedRestoreMember.id,
                                                                    selectedRestoreMember.role
                                                                );
                                                            }
                                                            setIsRestoreModalOpen(false);
                                                            setSelectedRestoreMember(null);
                                                        }}
                                                    />

                                                </div>

                                                {/* Member Details */}
                                                <div className="flex gap-4 p-4 items-start">
                                                    <img
                                                        src={
                                                            member?.profilePhoto !== ""
                                                                ? `${member?.profilePhoto}`
                                                                : "/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                                                        }
                                                        alt={member.name}
                                                        className="w-16 h-16 rounded-md object-cover border"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-black font-semibold">
                                                            Name: <span className="font-normal text-gray-800">{member.name}</span>
                                                        </p>
                                                        <p className="text-sm text-black font-semibold">
                                                            E-mail: <span className="font-normal text-gray-800">{member.email}</span>
                                                        </p>
                                                        <p className="text-sm text-black font-semibold">
                                                            HF_id: <span className="font-normal text-gray-800">{member.hfid}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Remove Labs Section */}
                        <div className="bg-white rounded-lg border border-black shadow-sm">
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 mx-3"
                                onClick={() => setIsLabsExpanded(!isLabsExpanded)}
                            >
                                <h2 className="text-blue-800 font-semibold text-xl">Remove Labs :</h2>
                                <div className="ml-auto">
                                    <FontAwesomeIcon
                                        icon={isLabsExpanded ? faChevronUp : faChevronDown}
                                        className=" ml-2"
                                    />
                                </div>
                            </div>

                            {isLabsExpanded && (
                                <div className="p-4 pt-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    <div className="border-b-2 mx-3 mb-2"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {branchList.map((lab: any) => (
                                            <div key={lab.id} className="rounded-xl border border-black shadow-sm ">
                                                {/* Top Banner */}
                                                <div className="bg-blue-100 rounded-tr-xl rounded-tl-xl border-b px-4 py-1 flex items-center justify-between text-sm">
                                                    <span>
                                                        <span className="text-red-600 font-semibold">Remove By:</span>{" "}
                                                        <span className="text-gray-800 font-medium">{lab.deletedByUser}</span>
                                                    </span>
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            onClick={() =>
                                                                setMenuOpenId((prevId) => (prevId === lab.id ? null : lab.id))
                                                            }
                                                            className="text-gray-600 hover:text-gray-800 cursor-pointer"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                            </svg>
                                                        </button>

                                                        {menuOpenId === lab.id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white border border-black rounded-md shadow-lg z-50">
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 text-sm cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedBranchId(lab.id);
                                                                        setIsModalOpen(true);
                                                                        setMenuOpenId(null);
                                                                    }}
                                                                >
                                                                    Restore Branch
                                                                </button>

                                                            </div>
                                                        )}
                                                        <GenericConfirmModal
                                                            isOpen={isModalOpen}
                                                            onClose={() => {
                                                                setIsModalOpen(false);
                                                                setSelectedBranchId(null);
                                                            }}
                                                            imageSrc="/Vector.png"
                                                            title="Restore Branch"
                                                            message="The selected branch was removed earlier. Confirm to reactivate it in the system"
                                                            type="warning"
                                                            onConfirm={async () => {
                                                                if (selectedBranchId !== null) {
                                                                    await handleRevertBranch(selectedBranchId);
                                                                }
                                                                setIsModalOpen(false);
                                                                setSelectedBranchId(null);
                                                                BranchList();
                                                            }}
                                                        />

                                                    </div>

                                                </div>

                                                {/* lab Details */}
                                                <div className="flex gap-4 p-4 items-start">
                                                    <img
                                                        src={
                                                            lab.profilePhoto !== null
                                                                ? `${lab.profilePhoto}`
                                                                : "/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                                                        }

                                                        alt={lab.labName}
                                                        className="w-16 h-16 rounded-md object-cover border"
                                                    />
                                                    <div>
                                                        <p className="text-sm text-black font-semibold">
                                                            Name: <span className="font-normal text-gray-800">{lab.labName}</span>
                                                        </p>
                                                        <p className="text-sm text-black font-semibold">
                                                            E-mail: <span className="font-normal text-gray-800">{lab.email}</span>
                                                        </p>
                                                        <p className="text-sm text-black font-semibold">
                                                            HF_id: <span className="font-normal text-gray-800">{lab.hfid}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </PanelLayout>
    );
};

export default AdminPanel;