'use client';
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleMinus, faUserPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from "formik";
import * as Yup from 'yup';
import { toast, ToastContainer } from "react-toastify";
import GenericConfirmModal from "../components/GenericConfirmModal";
import AddTeamMemberModal from "./AddTeamMemberModal";
import { DeleteMember, PromoteAdmin, PromoteSuperAdmin } from "../services/ClinicServiceApi";


interface PageProps {
  filteredData: any[];
  CardList: any;
  adminsList: any;
}
const getStoredRole = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role");
  }
  return null;
};


const LabAllMemberPage: React.FC<PageProps> = ({ filteredData, CardList, adminsList }) => {
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [superCheckBox, setSuperCheckBox] = useState(false)
  const [manageMode, setManageMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false) as any;
  const [submitType, setSubmitType] = useState<'admin' | 'superAdmin' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<Number | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Number | null>(null);
  const [isModalOpens, setIsModalOpens] = useState(false);
  // const [role, setRole] = useState<string | null>(null);
  const [Role] = useState<string | null>(getStoredRole);


  //   useEffect(() => {
  //   const storedRole = localStorage.getItem("role");
  //   setRole(storedRole);
  // }, []);



  const formik = useFormik({
    initialValues: {
      selectedMembers: [] as number[],
    },
    validationSchema: Yup.object({
      selectedMembers: Yup.array()
        .min(1, 'Please Select a Member to Assign Admin Access.'),
    }),

    onSubmit: async (values) => {
      try {
        if (submitType === 'admin') {
          const payload = { ids: values.selectedMembers };
          const response = await PromoteAdmin(payload);
          toast.success(`${response.data.message}`);
        } else if (submitType === 'superAdmin') {
          if (values.selectedMembers.length !== 1) {
            toast.error("Please select exactly one member to promote as Super Admin.");
            return;
          }
          const memberId = values.selectedMembers[0];
          const response = await PromoteSuperAdmin(memberId);
          toast.success(`${response.data.message}`);
        }
        await CardList();
        formik.resetForm();
        setShowCheckboxes(false);
        setSuperCheckBox(false);
        setAdminMode(false);
      } catch (error) {
        toast.error("An error occurred. Please try again.");
        console.error(error);
      }
    },
  });


  const handleRemoveMember = async (memberId: number) => {
    try {
      const response = await DeleteMember(memberId)
      toast.success(`${response.data.message}`);
      await CardList();
      formik.resetForm();
      setManageMode(false);
    } catch (error) {
      toast.error("Admin cannot be deleted.");
      console.error(error);
    }
  };

  const handleAddTeamMember = async (formData: any) => {
    try {
      await CardList();
      setShowAddMemberModal(false);
    } catch (error) {
      console.error("Add team member error:", error);
    }
  };



  return (
    <div className="p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="text-xl font-bold text-black mx-3">All Members:</div>
      </div>

      <div className="border-b-2 border-gray-400 w-40 "></div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-blue-600 mb-4 mt-4">Admins:</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2 space-y-4">
            <div key={adminsList.adminId} className="relative flex items-start gap-4 border rounded-lg p-4 bg-white">
              <img
                src={
                  adminsList.profilePhoto && adminsList.profilePhoto !== "No image preview available"
                    ? `${adminsList.profilePhoto}`
                    : "/98c4113b37688d826fc939709728223539f249dd.jpg"
                }
                alt={adminsList.name}
                className="w-20 h-20 rounded-sm object-cover"
              />
              <div className="gap-3 p-2">
                <p className="text-sm"><span className="font-semibold">Name:</span> {adminsList.name}</p>
                <p className="text-sm"><span className="font-semibold">E-mail:</span> {adminsList.email}</p>
                <p className="text-sm"><span className="font-semibold">HF_id:</span> {adminsList.hfid}</p>
              </div>
              <span className={`absolute top-0 right-0 text-xs text-white px-2 py-1 rounded bg-green-600`}>
                Main
              </span>
            </div>

            {filteredData
              ?.filter((member: any) => member.role === "Admin")
              .map((member: any) => {
                const isChecked = formik.values.selectedMembers.includes(member.memberId);

                return (
                  <div key={member.memberId} className="flex flex-col">
                    {/* Member Card */}
                    <div className="relative flex flex-col sm:flex-row items-start gap-4 border rounded-lg p-4 bg-white shadow">
                      <div className="relative w-20 h-20">
                        <img
                          src={
                            member.profilePhoto && member.profilePhoto !== "No image preview available"
                              ? `${member.profilePhoto}`
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
                    {adminMode && member.role === "Admin" && Role !== "Member" && (
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
          {Role !== "Member" &&
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
          {Role !== "Member" &&
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
            {Role !== "Member" &&
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
              {filteredData?.map((member: any) => {
                if (member.role === "Admin") return null;
                const isChecked = formik.values.selectedMembers.includes(member.memberId);
                return (
                  <div key={member.memberId} className="flex flex-col">
                    {/* Member Card */}
                    <div className="relative flex flex-col sm:flex-row items-start gap-4 border rounded-lg p-4 bg-white shadow">
                      <div className="relative w-20 h-20">
                        <img
                          src={
                            member.profilePhoto && member.profilePhoto !== "No image preview available"
                              ? `${member.profilePhoto}`
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
                    {manageMode && Role !== "Member" && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
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
                      title="Remove Member"
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
            {manageMode && Role !== "Member" && (
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

      <ToastContainer />
    </div>
  );
};

export default LabAllMemberPage;
