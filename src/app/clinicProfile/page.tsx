"use client";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencil,
    faSearch,
    faInfoCircle,
    faCircleMinus,
    faUserPlus,
    faUsers
} from "@fortawesome/free-solid-svg-icons";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import Tooltip from "../components/Tooltip";
import Drawer from "../components/clinicInfoDrawer";
import ProfileEditModal from "../components/ProfileEditModal";
import GenericConfirmModal from "../components/GenericConfirmModal";
import AddTeamMemberModal from "../components/AddTeamMemberModal";
import { ListUser } from "../services/ClinicServiceApi";


interface Admin {
    adminId: number;
    name: string;
    email: string;
    hfid: string;
    profilePhoto: string;
    status: string;
}

interface Member {
    memberId: number;
    name: string;
    email: string;
    hfid: string;
    profilePhoto: string;
    status: string;
    promotedByName: string;
}

const page = () => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    //   const [branchList, setBranchList] = useState([]) as any;
    const [hasSwitched, setHasSwitched] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedAddress, setEditedAddress] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState('branches');
    const [adminsList, setAdminsList] = useState<Admin[]>([]) as any;
    const [memberList, setMemberList] = useState<Member[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [branchCount, setBranchCount] = useState() as any;
    const [userCount, setUserCount] = useState() as any;
    const [selectedLab, setSelectedLab] = useState<any>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false) as any;
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<Number | null>(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState<Number | null>(null);
    const [adminMode, setAdminMode] = useState(false);
    const [manageMode, setManageMode] = useState(false);
    const [isModalOpens, setIsModalOpens] = useState(false);
    const [submitType, setSubmitType] = useState<'admin' | 'superAdmin' | null>(null);
    const [superCheckBox, setSuperCheckBox] = useState(false)



    const userId = localStorage.getItem("userId");


    // Formik & Yup schema
    const formik = useFormik({
        initialValues: {
            labName: "North Star",
            email: "",
            phoneNumber: "",
            pincode: "",
        },
        validationSchema: Yup.object({
            labName: Yup.string().required("Branch Name is required"),
            email: Yup.string()
                .matches(
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    "Please enter a valid email address"
                )
                .required("Email is required"),
            phoneNumber: Yup.string()
                .matches(
                    /^[0-9]{10}$/,
                    "Phone number must be exactly 10 digits and contain only numbers"
                )
                .required("Phone number is required"),
            pincode: Yup.string()
                .matches(/^\d{6}$/, "Pin-code must be exactly 6 digits and contain only numbers")
                .required("Pin-code is required"),
        }),
        onSubmit: async (values) => {
            try {
                const payload = {
                    labName: values.labName,
                    email: values.email,
                    phoneNumber: values.phoneNumber,
                    pincode: values.pincode,
                };

                // const response = await CreateBranch(payload);
                // toast.success(`${response.data.message}`)
                setIsModalOpen(false);
                formik.resetForm();
                await ListBranch();
            } catch (error) {
                console.error("Error creating branch:", error);
            }
        },
    });


    const ListBranch = async () => {
        // const res = await ListBranchData();
        // setBranchList(res?.data?.data?.labs);
        // setBranchCount(res.data.data.labCounts)
    }


    useEffect(() => {
        ListBranch();
    }, [])


    const BASE_URL = "https://d7cop3y0lcg80.cloudfront.netreports/";

    useEffect(() => {
        if (hasSwitched) {
            window.location.reload(); // Full UI refresh
        }
    }, [hasSwitched]);

    const handleRemoveBranch = async (labId: number) => {
        try {
            //   const response = await DeleteBranch(Number(labId))
            //   toast.success(`${response.data.message}`);
            await ListBranch();
            formik.resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditClick = (lab: any) => {
        setIsEditing(true);
        setEditedAddress(lab.address || "");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile(file);
            console.log("Uploaded Profile Photo:", file);
        }
    };

    const handleSave = async (lab: any) => {
        const formData = new FormData();
        formData.append("Id", lab.labId);
        formData.append("Address", editedAddress);
        if (uploadedFile) {
            formData.append("ProfilePhoto", uploadedFile);
        }
        try {
            //   const response = await UpdateProfile(formData);
            //   toast.success(`${response.data.message}`);
            setIsEditing(false);
            await ListBranch();
        } catch (error) {
            console.error("Update failed:", error);
        }
    };


    const CardList = async () => {
        const res = await ListUser(Number(3));
        console.log(res.data.data);

        setAdminsList(res?.data?.data?.superAdmin);
        //   setMemberList(res?.data?.data?.members);
        //   setUserCount(res?.data?.data?.userCounts);
    };

    useEffect(() => {
        CardList();
    }, []);

    // const filteredData = activeTab === 'branches'
    //   ? branchList?.filter((branch: any) =>
    //       branch.hfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //       branch.labName.toLowerCase().includes(searchQuery.toLowerCase())
    //     )
    //   : memberList?.filter((member: any) =>
    //       member.hfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //       member.name.toLowerCase().includes(searchQuery.toLowerCase())
    //     );

    const branchList = [
        {
            labId: 1,
            address: "Arthrose, Mumbai-400007.",
            profilePhoto: "/98c4113b37688d826fc939709728223539f249dd.jpg", // Replace with a real path or leave empty for default
            labName: "Arthrose",
            emails: ["ankithfiles@gmail.com", "xyzxyz@gmail.com"],
            phone: "123456789012",
            fullAddress: "5-A, Ravi Pushp Apartment, Ahmedabad - 380052, Gujarat",
            hfId: "HF120624RAN1097",
        },
    ];

    const dummyMemberList = [
        {
            memberId: 1,
            name: "Ankit Hfiles",
            email: "ankithfiles@gmail.com",
            hfid: "HF120624RAN1097",
            profilePhoto: "/98c4113b37688d826fc939709728223539f249dd.jpg",
            status: "active",
            role: "member",
        },

        {
            memberId: 5,
            name: "Rahul Kumar",
            email: "rahul.kumar@gmail.com",
            hfid: "HF120624RAN1101",
            profilePhoto: "/98c4113b37688d826fc939709728223539f249dd.jpg",
            status: "active",
            role: "Member",
            promotedByName: "Ankit",
            createdByName: "Priya"
        },
        {
            memberId: 6,
            name: "Sneha Gupta",
            email: "sneha.gupta@gmail.com",
            hfid: "HF120624RAN1102",
            profilePhoto: "/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg",
            status: "active",
            role: "Member",
            promotedByName: "Ankit",
            createdByName: "Ankit"
        },

        {
            memberId: 8,
            name: "Neha Agarwal",
            email: "neha.agarwal@gmail.com",
            hfid: "HF120624RAN1104",
            profilePhoto: "/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg",
            status: "active",
            role: "Member",
            promotedByName: "Ankit",
            createdByName: "Vikram"
        }
    ];




    const handleAddTeamMember = async (formData: any) => {
        try {
            await CardList();
            setShowAddMemberModal(false);
        } catch (error) {
            console.error("Add team member error:", error);
        }
    };



    const handleRemoveMember = async (memberId: number) => {
        try {
            //   const response = await DeleteMember(memberId)
            //   toast.success(`${response.data.message}`);
            await CardList();
            formik.resetForm();
            //   setManageMode(false);
        } catch (error) {
            toast.error("Admin cannot be deleted.");
            console.error(error);
        }
    };


    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
    }, []);

    const mainAdmin = dummyMemberList.find(member => member.role === "Admin");

    return (
        <DefaultLayout>
            <div className="p-2 sm:p-4">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="text-xl font-bold text-black mx-3">Profile:</div>
                        <div className="relative w-full sm:w-auto mx-3">
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-2 pr-10 py-1 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute right-0 top-0 text-white bg-black p-2 rounded-full hover:bg-gray-800 cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="border-b mx-3"></div>
                </div>



                {/* Profile Card */}
                <div className="flex justify-between w-full gap-4">
                    {/* Left section - Account Details */}
                    <div className="w-full lg:max-w-2xl p-2 sm:p-4">
                        {branchList
                            .filter((lab) => lab.labId === 1)
                            .map((lab) => (
                                <div key={lab.labId}>
                                    <div className="mb-2 px-2 text-blue-800 font-semibold text-lg sm:text-base">
                                        Account:{" "}
                                        <span className="text-gray-800">
                                            {lab.address || "Address not available"}
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-3xl shadow-md flex flex-col sm:flex-row border mb-2">
                                        {/* Profile Image */}
                                        <div className="relative mb-3 mt-3 mx-3 flex justify-center">
                                            <img
                                                src={
                                                    lab.profilePhoto ||
                                                    "/98c4113b37688d826fc939709728223539f249dd.jpg"
                                                }
                                                alt={lab.labName}
                                                className="w-32 h-32 sm:w-[224px] sm:h-[180px] rounded-full object-cover"
                                            />
                                            <div
                                                className="absolute bottom-2 right-4 p-2 bg-blue-900 w-[30px] h-[30px] rounded-full cursor-pointer"
                                                onClick={() => {
                                                    setSelectedLab(lab);
                                                    setIsProfileModalOpen(true);
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faPencil}
                                                    size="sm"
                                                    className="text-white mb-1"
                                                />
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="ml-6 mb-5 flex flex-col justify-between">
                                            <div className="text-sm bg-gray-800 text-white px-2 py-2 rounded-bl-md rounded-tr-2xl sm:ml-[220px] mb-2">
                                                HF_id: {lab.hfId}
                                            </div>
                                            <div className="text-sm sm:text-base">
                                                <h2 className="text-lg sm:text-xl font-bold text-blue-800">
                                                    {lab.labName}
                                                </h2>
                                                <p>
                                                    <span className="font-semibold">E-mail:</span> {lab.emails[0]}
                                                </p>
                                                {lab.emails[1] && (
                                                    <ul className="list-disc ml-13">
                                                        <li>{lab.emails[1]}</li>
                                                    </ul>
                                                )}
                                                <p>
                                                    <span className="font-semibold">Phone:</span> {lab.phone}
                                                </p>
                                                <p className="break-words">
                                                    <span className="font-semibold">Address:</span> {lab.fullAddress}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <ProfileEditModal
                                        isOpen={isProfileModalOpen}
                                        onClose={() => setIsProfileModalOpen(false)}
                                        lab={selectedLab}
                                        onSave={async (formData: FormData) => {
                                            try {
                                                await ListBranch();
                                            } catch (error) {
                                                console.error("Update failed:", error);
                                            }
                                        }}
                                        BASE_URL={""}
                                    />
                                </div>
                            ))}
                    </div>

                    {/* Right section - Info Icon */}
                    <div className="flex items-start mt-3">
                        <div className="ml-2 bg-green-700 text-white rounded-sm w-8 h-8 flex items-center justify-center cursor-pointer">
                            <Tooltip content="Information about this page" position="bottom right-2">
                                <FontAwesomeIcon icon={faInfoCircle} onClick={() => setIsDrawerOpen(true)} />
                            </Tooltip>
                        </div>

                        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                            hii
                        </Drawer>
                    </div>
                </div>



                <div className="p-2 sm:p-4">

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-blue-600 mb-4 mt-4">Admins:</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-1/2 space-y-4">
                                {adminsList && (
                                    <div key={adminsList.memberId} className="relative flex items-start gap-4 border rounded-lg p-4 bg-white">
                                        <img
                                            src={
                                                adminsList.profilePhoto && adminsList.profilePhoto !== "No image preview available"
                                                    ? `${adminsList.profilePhoto}`
                                                    :
                                                    "/98c4113b37688d826fc939709728223539f249dd.jpg"
                                            }
                                            alt={adminsList.name}
                                            className="w-20 h-20 rounded-sm object-cover"
                                        />
                                        <div className="gap-3 p-2">
                                            <p className="text-sm"><span className="font-semibold">Name:</span> {adminsList.name}</p>
                                            <p className="text-sm"><span className="font-semibold">E-mail:</span> {adminsList.email}</p>
                                            <p className="text-sm"><span className="font-semibold">HF_id:</span> {adminsList.hfid}</p>
                                        </div>
                                        <span className="absolute top-0 right-0 text-xs text-white px-2 py-1 rounded bg-green-600">
                                            Main
                                        </span>
                                    </div>
                                )}


                                {dummyMemberList
                                    ?.filter((member: any) => member.role === "Admin")
                                    .map((member: any) => {
                                        const isChecked = formik.values.selectedMembers?.includes(member.memberId);

                                        return (
                                            <div key={member.memberId} className="flex flex-col">
                                                {/* Member Card */}
                                                <div className="relative flex flex-col sm:flex-row items-start gap-4 border rounded-lg p-4 bg-white shadow">
                                                    <div className="relative w-20 h-20">
                                                        <img
                                                            src={
                                                                member.profilePhoto && member.profilePhoto !== "No image preview available"
                                                                    ? `${BASE_URL}${member.profilePhoto}`
                                                                    : "/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                                                            }
                                                            alt={member.name}
                                                            className={`w-full h-full object-cover rounded ${showCheckboxes || superCheckBox ? 'opacity-40' : ''}`}
                                                        />
                                                        {(showCheckboxes || superCheckBox) &&
                                                            (superCheckBox ? true : member.role !== "Admin") && (
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => {
                                                                            if (superCheckBox) {
                                                                                formik.setFieldValue('selectedMembers', [member.memberId]);
                                                                            } else {
                                                                                const selected = formik.values.selectedMembers;
                                                                                if (selected.includes(member.memberId)) {
                                                                                    formik.setFieldValue(
                                                                                        'selectedMembers',
                                                                                        selected.filter(id => id !== member.memberId)
                                                                                    );
                                                                                } else {
                                                                                    formik.setFieldValue('selectedMembers', [...selected, member.memberId]);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="w-6 h-6 bg-green-600 text-white accent-green-600 rounded border-2 border-white shadow-lg"
                                                                    />
                                                                </div>
                                                            )}

                                                    </div>

                                                    <div className="flex-1 gap-3 p-2">
                                                        <p className="text-sm"><span className="font-semibold">Name:</span> {member.name}</p>
                                                        <p className="text-sm"><span className="font-semibold">E-mail:</span> {member.email}</p>
                                                        <p className="text-sm"><span className="font-semibold">HF_id:</span> {member.hfid}</p>
                                                    </div>

                                                    <span className="absolute top-0 right-0 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                        By {member.promotedByName}
                                                    </span>
                                                </div>

                                                {/* Remove Member Button */}
                                                {adminMode && member.role === "Admin" && role !== "Member" && (
                                                    <div className="flex justify-end mt-2">

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedMemberId(member.memberId);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                                                        >
                                                            Remove Admin
                                                            <FontAwesomeIcon icon={faCircleMinus} />
                                                        </button>
                                                    </div>
                                                )}
                                                <GenericConfirmModal
                                                    isOpen={isModalOpen}
                                                    onClose={() => {
                                                        setIsModalOpen(false);
                                                        setSelectedMemberId(null);
                                                    }}
                                                    imageSrc="/Vector (1).png"
                                                    title="Remove Admin"
                                                    message="They will lose access to the system. You can retrieve it from the system at any time."
                                                    type="warning"
                                                    onConfirm={() => {
                                                        if (selectedMemberId) {
                                                            handleRemoveMember(Number(selectedMemberId));
                                                        }
                                                        setIsModalOpen(false);
                                                        setSelectedMemberId(null);
                                                    }}
                                                />

                                            </div>
                                        );
                                    })}

                            </div>
                        </div>

                        <div className="mt-2 flex justify-end mb-4 gap-3">
                            {role !== "Member" &&
                                <button
                                    className="primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
                                    onClick={() => {
                                        setSuperCheckBox(prev => !prev);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
                                    {superCheckBox ? "Cancel" : "Super Admin"}
                                </button>
                            }
                            {role !== "Member" &&
                                <button
                                    className="primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer"
                                    onClick={() => {
                                        setShowCheckboxes(prev => !prev);
                                        setAdminMode(prev => !prev);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faUserPlus} className="h-4 w-4" />
                                    {showCheckboxes ? "Cancel" : "Add Admin "}
                                </button>
                            }

                        </div>

                        <div className="border"></div>

                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-blue-600">Team:</h2>
                                {role !== "Member" &&
                                    <button
                                        type="button"
                                        className="bg-yellow-300 text-black px-4 py-2 rounded font-medium flex items-center gap-2 shadow hover:bg-yellow-400 cursor-pointer"
                                        onClick={() => setManageMode(!manageMode)}
                                    >
                                        <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
                                        {manageMode ? "Cancel" : "Manage Team"}
                                    </button>
                                }
                            </div>

                            <form onSubmit={formik.handleSubmit}>
                                {formik.errors.selectedMembers && formik.touched.selectedMembers && (
                                    <p className="text-red-500 text-sm mt-2 text-center">{formik.errors.selectedMembers}</p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dummyMemberList?.map((member: any) => {
                                        if (member.role === "Admin") return null;
                                        const isChecked = formik.values.selectedMembers?.includes(member.memberId);
                                        return (
                                            <div key={member.memberId} className="flex flex-col">
                                                {/* Member Card */}
                                                <div className="relative flex flex-col sm:flex-row items-start gap-4 border rounded-lg p-4 bg-white shadow">
                                                    <div className="relative w-20 h-20">
                                                        <img
                                                            src={
                                                                member.profilePhoto && member.profilePhoto !== "No image preview available"
                                                                    ? `${BASE_URL}${member.profilePhoto}`
                                                                    : "/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                                                            }
                                                            alt={member.name}
                                                            className={`w-full h-full object-cover rounded ${showCheckboxes || superCheckBox ? 'opacity-40' : ''}`}
                                                        />
                                                        {(showCheckboxes || superCheckBox) && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    // onChange={() => {
                                                                    //   const selected = formik.values.selectedMembers;
                                                                    //   if (selected.includes(member.memberId)) {
                                                                    //     formik.setFieldValue(
                                                                    //       'selectedMembers',
                                                                    //       selected.filter(id => id !== member.memberId)
                                                                    //     );
                                                                    //   } else {
                                                                    //     formik.setFieldValue(
                                                                    //       'selectedMembers',
                                                                    //       [...selected, member.memberId]
                                                                    //     );
                                                                    //   }
                                                                    // }}
                                                                    onChange={() => {
                                                                        if (superCheckBox) {
                                                                            // When superCheckBox is active, only select one member (replace selectedMembers)
                                                                            formik.setFieldValue('selectedMembers', [member.memberId]);
                                                                        } else {
                                                                            // Normal multiple selection toggle
                                                                            const selected = formik.values.selectedMembers;
                                                                            if (selected.includes(member.memberId)) {
                                                                                formik.setFieldValue(
                                                                                    'selectedMembers',
                                                                                    selected.filter(id => id !== member.memberId)
                                                                                );
                                                                            } else {
                                                                                formik.setFieldValue('selectedMembers', [...selected, member.memberId]);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="w-6 h-6 bg-green-600 text-white accent-green-600 rounded border-2 border-white shadow-lg"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 gap-3 p-2">
                                                        <p className="text-sm"><span className="font-semibold">Name:</span> {member.name}</p>
                                                        <p className="text-sm"><span className="font-semibold">E-mail:</span> {member.email}</p>
                                                        <p className="text-sm"><span className="font-semibold">HF_id:</span> {member.hfid}</p>
                                                    </div>

                                                    {member.role === "Member" ? (
                                                        <span className="absolute top-0 right-0 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                            By {member.createdByName}
                                                        </span>
                                                    ) : (
                                                        <span className="absolute top-0 right-0 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                                            By {member.promotedByName}
                                                        </span>
                                                    )}

                                                </div>

                                                {/* Remove Member Button - Outside the card, centered below */}
                                                {manageMode && role !== "Member" && (
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            type="button"
                                                            // onClick={() => handleRemoveMember(member.memberId)}
                                                            onClick={() => {
                                                                setSelectedMemberIds(member.memberId);
                                                                setIsModalOpens(true);
                                                            }}
                                                            className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                                                        >
                                                            Remove Member
                                                            <FontAwesomeIcon icon={faCircleMinus} />
                                                        </button>
                                                    </div>
                                                )}

                                                <GenericConfirmModal
                                                    isOpen={isModalOpens}
                                                    onClose={() => {
                                                        setIsModalOpens(false);
                                                        setSelectedMemberIds(null);
                                                    }}
                                                    imageSrc="/Vector (1).png"
                                                    title="Remove Member?"
                                                    message="They will lose access to the system. You can retrieve it from the system at any time."
                                                    type="warning"
                                                    onConfirm={() => {
                                                        if (selectedMemberIds) {
                                                            handleRemoveMember(Number(selectedMemberIds));
                                                        }
                                                        setIsModalOpens(false);
                                                        setSelectedMemberIds(null);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                {manageMode && role !== "Member" && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddMemberModal(true)}
                                            className="bg-blue-800 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-900 transition cursor-pointer"
                                        >
                                            Add Team Member
                                        </button>
                                    </div>
                                )}

                                {showCheckboxes && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            type="submit"
                                            onClick={() => setSubmitType('admin')}
                                            className="bg-blue-800 text-white px-8 py-2 rounded-md text-lg font-semibold hover:bg-blue-900 transition cursor-pointer"
                                        >
                                            Admin Submit
                                        </button>
                                    </div>
                                )}

                                {superCheckBox && (
                                    <div className="flex justify-center mt-6">
                                        <button
                                            type="submit"
                                            onClick={() => setSubmitType('superAdmin')}
                                            className="bg-blue-800 text-white px-8 py-2 rounded-md text-lg font-semibold hover:bg-blue-900 transition cursor-pointer"
                                        >
                                            Super Admin Submit
                                        </button>
                                    </div>
                                )}

                            </form>
                        </div>
                    </div>

                    <AddTeamMemberModal
                        isOpen={showAddMemberModal}
                        onClose={() => setShowAddMemberModal(false)}
                        onSubmit={handleAddTeamMember}
                    />

                </div>


                <ToastContainer />
            </div>
        </DefaultLayout>
    );
};

export default page;
