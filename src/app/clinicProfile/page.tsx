"use client";
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faSearch,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
// import { ListBranchData, CreateBranch, DeleteBranch, UpdateProfile, UserCardList } from "@/services/labServiceApi";
import { toast, ToastContainer } from "react-toastify";

import Tooltip from './../components/Tooltip';
import Drawer from "../components/clinicInfoDrawer";
import BranchInformation from "../components/pageInfomations/BranchInformation";
import MemberInformation from "../components/pageInfomations/MemberInformation";
import ProfileEditModal from "../components/ProfileEditModal";
import BranchData from "../components/BranchData";
import LabAllMemberPage from "../components/LabAllMemberPage";


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

const getStoredUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};

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
    const [branchCount , setBranchCount] = useState()as any;
    const [userCount, setUserCount] = useState() as any;
    const [selectedLab, setSelectedLab] = useState<any>(null);
const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

const [userId] = useState<string | null>(getStoredUserId);
    // const userId = localStorage.getItem("userId");
  

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
        // setIsModalOpen(false);
        // formik.resetForm();
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



  useEffect(() => {
    if (hasSwitched) {
      window.location.reload(); // Full UI refresh
    }
  }, [hasSwitched]);

  const handleRemoveBranch = async (labId: number) => {
    try {
    //   const response = await DeleteBranch(Number(labId))
    //   toast.success(`${response.data.message}`);
    //   await ListBranch();
    //   formik.resetForm();
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
    //   setIsEditing(false);
    //   await ListBranch();
    } catch (error) {
      console.error("Update failed:", error);
    }
  };


    const CardList = async () => {
    //   const res = await UserCardList(Number(userId));
    //   setAdminsList(res?.data?.data?.superAdmin);
    //   setMemberList(res?.data?.data?.members);
    //   setUserCount(res?.data?.data?.userCounts);
    };
  
    useEffect(() => {
      CardList();
    }, []);

const filteredData = activeTab === 'branches'
  ? branchList?.filter((branch: any) =>
      branch.hfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.labName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  : memberList?.filter((member: any) =>
      member.hfid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


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

      

        {/*Tabs */}
        <div className="relative flex items-center justify-between w-full">
          {/* Toggle Buttons */}
          <div className="border p-2 rounded-full">
            <div className="flex rounded-full gap-2 overflow-hidden text-sm font-semibold w-fit">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-1 transition-all duration-200 rounded-full cursor-pointer ${activeTab === 'members' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900'
                  }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`px-4 py-1 transition-all duration-200 rounded-full cursor-pointer ${activeTab === 'branches' ? 'bg-blue-900 text-white' : 'bg-white text-blue-900'
                  }`}
              >
                Branches
              </button>
            </div>
          </div>

          {/* Info Icon */}
         <div className="absolute right-0 ml-2 bg-green-700 text-white rounded-sm w-8 h-8 flex items-center justify-center cursor-pointer">
            <Tooltip content="Information about this page" position="bottom right-2">
              <FontAwesomeIcon icon={faInfoCircle} onClick={() => setIsDrawerOpen(true)} />
            </Tooltip>
          </div>


           <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
               {activeTab === 'branches' ? <BranchInformation /> : <MemberInformation />}
              </Drawer>
        </div>

        {/* Profile Card */}
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
        <div className="flex justify-end mx-4 mb-2">
          <p className="text-base">
            <span className="font-bold">
              {activeTab === 'branches' ? 'Total Branches :' : 'Total Members :'}
            </span> {activeTab === 'branches' ? branchCount : userCount}
          </p>
        </div>
        <div className="border-b mb-4"></div>


        {activeTab === 'branches' && (
          <BranchData
            setIsModalOpen={setIsModalOpen}
            filteredData={filteredData}
            setHasSwitched={setHasSwitched}
            ListBranch={ListBranch}
            hasSwitched={hasSwitched}
            handleRemoveBranch={handleRemoveBranch}
            isModalOpen={isModalOpen}
            formik={formik} BASE_URL={""}          />
        )}

        {activeTab === 'members' && <LabAllMemberPage  filteredData={filteredData} CardList={CardList} adminsList={adminsList}/>}
        <ToastContainer />
      </div>
    </DefaultLayout>
  );
};

export default page;
