import { faArrowRightArrowLeft, faBuilding, faCircleMinus, faEnvelope, faLocationDot, faPhone, faTimes, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
// import { CreateBranch, LoginOTP, otpGenerate, Pincode, BranchOTP } from "@/services/labServiceApi";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import GenericConfirmModal from '../components/GenericConfirmModal';

interface BranchDataProps {
  setIsModalOpen: (open: boolean) => void;
  filteredData: any[];
  BASE_URL: string;
  setHasSwitched: (value: boolean) => void;
  ListBranch: any;
  hasSwitched: boolean;
  handleRemoveBranch: any;
  isModalOpen: boolean;
  formik: any;
}
const getStoredRole = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role");
  }
  return null;
};


const BranchData: React.FC<BranchDataProps> = ({
  setIsModalOpen,
  filteredData,
  BASE_URL,
  setHasSwitched,
  ListBranch,
  hasSwitched,
  handleRemoveBranch,
  isModalOpen,
  formik
}) => {
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [pincodeData, setPincodeData] = useState<string>("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isModalOpens, setIsModalOpens] = useState(false);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  // const Role = localStorage.getItem("role");
  const [Role] = useState<string | null>(getStoredRole);




  // OTP Formik setup
  const otpFormik = useFormik({
    initialValues: {
      email: formik.values.email,
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^\d{4,6}$/, "OTP must be 4-6 digits")
        .required("OTP is required"),
    }),
    onSubmit: async (values) => {
      try {
        setIsVerifyingOtp(true);
        // const response = await BranchOTP({
        //   email: formik.values.email,
        //   otp: values.otp,
        // });
        // toast.success(`${response.data.message}`);
        setIsOtpVerified(true);
      } catch (error) {
        const err = error as any;
        toast.error(`${err.response?.data?.Message}`);
        console.error("OTP verification failed:", error);
        setIsOtpVerified(false);
      } finally {
        setIsVerifyingOtp(false);
      }
    },
  });

  // Handle OTP generation
  const handleGetOtp = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({
      labName: true,
      email: true,
      phoneNumber: true,
    });

    const requiredFieldsValid = !errors.labName && !errors.email && !errors.phoneNumber;

    if (requiredFieldsValid && formik.values.labName && formik.values.email && formik.values.phoneNumber) {
      try {
        setIsOtpSending(true);
        // const response = await otpGenerate({
        //   labName: formik.values.labName,
        //   email: formik.values.email,
        //   phoneNumber: formik.values.phoneNumber,
        // });
        // setOtpVisible(true);
        // setIsOtpVerified(false);
        // toast.success(`${response.data.message}`);
      } catch (error) {
        console.error("OTP Error:", error);
        const err = error as any;
        toast.error(`${err.response?.data?.Message}`);
      } finally {
        setIsOtpSending(false);
      }
    } else {
      toast.error("Please fill all required fields correctly before getting OTP");
    }
  };

  // Fetch pincode data on blur
  const fetchPincodeData = async (pincode: string) => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      try {
        setIsPincodeLoading(true);
        // const response = await Pincode(pincode);
        // setPincodeData(
        //   `${response.data.data.location}-${pincode}`
        // );
      } catch (error) {
        console.error("Pincode fetch error:", error);
        setPincodeData("");
        toast.error("Invalid pincode or failed to fetch location data");
      } finally {
        setIsPincodeLoading(false);
      }
    } else {
      setPincodeData("");
    }
  };

  useEffect(() => {
    otpFormik.setFieldValue("email", formik.values.email);
  }, [formik.values.email]);

  useEffect(() => {
    if (!isModalOpen) {
      setOtpVisible(false);
      setIsOtpVerified(false);
      setPincodeData("");
      otpFormik.resetForm();
    }
  }, [isModalOpen]);

  return (
    <div>
      {/* All Branches Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-2 sm:px-4 py-2 gap-2">
        <div>
          <p className="text-blue-900 font-bold text-base sm:text-lg">
            All Branches:
          </p>
          <div className="border-b-2 border-gray-400 w-30 "></div>
        </div>
        <div className="w-full sm:w-auto">
          {Role !== "Member" &&
            <button
              className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded flex items-center gap-2 border w-full sm:w-auto justify-center cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUserPlus} size="sm" />
              <span>Add Branch</span>
            </button>
          }
        </div>
      </div>

      {/* Branch Card */}
      {filteredData.map((branch: any, index: number) => (
        <div
          key={branch.labId || index}
          className="group flex flex-col md:flex-row justify-between items-start md:items-center px-2 md:px-4 py-2 gap-4 relative"
        >
          <div className="w-full md:max-w-2xl lg:max-w-2xl p-2 md:p-4">
            <div className="bg-white rounded-3xl shadow-md flex flex-col md:flex-row border mb-2">
              <div className="border border-gray-300 rounded w-32 h-32 flex flex-col items-center gap-4 mb-5 relative mx-auto md:mx-3 mt-3">
                <img
                  src={
                    branch.profilePhoto && branch.profilePhoto !== "No image preview available"
                      ? `${BASE_URL}${branch.profilePhoto}`
                      : "/c320115f6850bb4e112784af2aaf059259d7bfe9.jpg"
                  }
                  alt={branch.labName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="ml-0 md:ml-6 mb-5 flex flex-col justify-between">
                <div className="text-sm bg-yellow-300 text-black px-2 py-2 rounded-full w-fit md:ml-[160px] lg:ml-[282px] mb-2">
                  HF_id: {branch.hfid}
                </div>
                <div className="text-sm md:text-base px-2 md:px-0">
                  <p><span className="font-semibold">Name:</span> {branch.labName}</p>
                  <p><span className="font-semibold">E-mail:</span> {branch.email}</p>
                  <p className="break-words">
                    <span className="font-semibold">Address:</span> {branch.address || "Address not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto px-2 md:px-0">
            <button
              className="bg-gradient-to-r from-white to-blue-300 px-4 py-2 rounded flex items-center gap-2 border w-full md:w-auto justify-center cursor-pointer"
              onClick={() => {
                localStorage.removeItem("userId");
                localStorage.removeItem("emailId");

                localStorage.setItem("userId", branch.labId);
                localStorage.setItem("emailId", branch.email);
                localStorage.setItem("switch", "true");

                toast.success("Switched to selected branch!");
                setHasSwitched(true);
                ListBranch();
              }}
            >
              <FontAwesomeIcon icon={faArrowRightArrowLeft} size="sm" />
              <span>{hasSwitched ? "You have changed the branch" : "Switch Branch"}</span>
            </button>
          </div>

          <div className="absolute -bottom-0 left-1/2 transform -translate-x-1/2 hidden group-hover:flex">
            {Role !== "Member" &&
              <button
                type="button"
                onClick={() => {
                  setSelectedLabId(String(branch.labId));
                  setIsModalOpens(true);
                }}
                className="text-red-500 text-sm font-medium hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Remove Branch
                <FontAwesomeIcon icon={faCircleMinus} />
              </button>
            }
          </div>
        </div>
      ))}

      <GenericConfirmModal
        isOpen={isModalOpens}
        onClose={() => setIsModalOpens(false)}
        imageSrc="/Vector (1).png"
        title="Remove Branch"
        message="Are you sure you want to remove this branch? This action cannot be undone."
        dynamicName={selectedLabId ?? ""}
        type="warning"
        onConfirm={() => {
          if (selectedLabId) {
            handleRemoveBranch(selectedLabId);
          }
          setIsModalOpens(false);
        }}
      />


      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-4 sm:p-6 w-2/3 max-w-lg sm:max-w-4xl relative shadow-2xl overflow-y-auto max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>

            {/* Header */}
            <div className="text-center mb-2 sm:mb-2">
              <div className="flex justify-center items-center text-blue-600 gap-2 sm:gap-3 mb-3 sm:mb-2">
                <FontAwesomeIcon icon={faLocationDot} />
                <h2 className="text-xl sm:text-lg font-bold text-blue-600">Add New Branch</h2>
              </div>
              <div className="w-16  h-1 bg-blue-600 mx-auto rounded mb-2"></div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
              {/* Form Section */}
              <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-8">
                <form onSubmit={formik.handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
                  {/* Branch Name */}
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faBuilding} className="text-gray-600 mt-3" />
                    <div className="flex-1">
                      <input
                        type="text"
                        id="labName"
                        name="labName"
                        value={formik.values.labName}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter Branch Name"
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formik.touched.labName && formik.errors.labName
                          ? "focus:ring-red-500 border-red-500"
                          : "focus:ring-blue-500 border-gray-300"
                          }`}
                        required
                      />
                      {formik.touched.labName && formik.errors.labName && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.labName}</p>
                      )}
                    </div>
                  </div>

                  {/* Lab Email */}
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faEnvelope} className="text-gray-600 mt-3" />
                    <div className="flex-1">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Enter Lab Email"
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formik.touched.email && formik.errors.email
                          ? "focus:ring-red-500 border-red-500"
                          : "focus:ring-blue-500 border-gray-300"
                          }`}
                        required
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Lab Number */}
                  <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-600 mt-3" />
                    <div className="flex-1">
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Lab Number"
                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formik.touched.phoneNumber && formik.errors.phoneNumber
                          ? "focus:ring-red-500 border-red-500"
                          : "focus:ring-blue-500 border-gray-300"
                          }`}
                        required
                      />
                      {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.phoneNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Get OTP Button */}
                  {!otpVisible && (
                    <button
                      type="button"
                      onClick={handleGetOtp}
                      disabled={isOtpSending}
                      className={`w-full font-bold py-3 rounded-md border-2 border-black ${isOtpSending
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-yellow-300 hover:bg-yellow-400 text-black cursor-pointer"
                        } transition-colors duration-200`}
                    >
                      {isOtpSending ? "Sending OTP..." : "Get OTP"}
                    </button>
                  )}

                  {/* OTP Section - Only show after OTP is sent */}
                  {otpVisible && !isOtpVerified && (
                    <>
                      <div className="md:col-span-2 flex flex-col items-center mt-1 border rounded-md px-4 py-3 w-full">
                        <div className="flex flex-wrap justify-center gap-3 mb-2">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                              key={index}
                              id={`otp-${index}`}
                              type="text"
                              maxLength={1}
                              className={`w-10 h-12 text-center border-b text-lg focus:outline-none focus:border-blue-500 sm:w-6 md:w-6 mx-1 ${otpFormik.touched.otp && otpFormik.errors.otp ? 'border-red-500' : ''
                                }`}
                              value={otpFormik.values.otp[index] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d?$/.test(val)) {
                                  const otp = otpFormik.values.otp.split(""); // convert to array
                                  otp[index] = val;
                                  otpFormik.setFieldValue("otp", otp.join("")); // update full OTP

                                  if (val && index < 5) {
                                    const nextInput = document.getElementById(`otp-${index + 1}`);
                                    nextInput?.focus();
                                  }
                                }
                              }}
                              onBlur={otpFormik.handleBlur}
                            />
                          ))}

                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          formik.setFieldValue("otp", "");
                          await handleGetOtp();
                        }}
                        className="text-blue-800 text-sm font-medium mt-2 mb-3 md:col-span-2 flex justify-end md:self-end"
                      >
                        Resend OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => otpFormik.handleSubmit()}
                        disabled={isVerifyingOtp}
                        className={`w-full font-bold py-3 px-6 rounded-md transition-colors duration-200 ${isVerifyingOtp
                          ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                          : "bg-yellow-300 hover:bg-yellow-400 text-black"
                          }`}
                      >
                        {isVerifyingOtp ? "Verifying..." : "Verify"}
                      </button>

                    </>
                   
                  )}

                  {/* Pin Code - Only show after OTP is verified */}
                  {isOtpVerified && (
                    <div className="flex items-start gap-3">
                      <FontAwesomeIcon icon={faLocationDot} className="text-gray-600 mt-3" />
                      <div className="flex-1">
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={formik.values.pincode}
                          onChange={formik.handleChange}
                          onBlur={(e) => {
                            formik.handleBlur(e);
                            fetchPincodeData(e.target.value);
                          }}
                          placeholder="Enter Pin-Code"
                          className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${formik.touched.pincode && formik.errors.pincode
                            ? "focus:ring-red-500 border-red-500"
                            : "focus:ring-blue-500 border-gray-300"
                            }`}
                          required
                        />
                        {formik.touched.pincode && formik.errors.pincode && (
                          <p className="text-red-500 text-sm mt-1">{formik.errors.pincode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location Text */}
                  {pincodeData && (
                    <div className="text-center text-blue-600 text-sm mt-4">
                      {isPincodeLoading ? "Fetching location..." : pincodeData}
                    </div>
                  )}

                  {/* Save Button - Only show after OTP is verified */}
                  {isOtpVerified && (
                    <div className="text-center pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full sm:w-40 font-semibold py-2 rounded-xl text-lg ${isSubmitting
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                          } transition-colors`}
                      >
                        {isSubmitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Image Section */}
              <div className="flex-shrink-0 flex justify-center w-full lg:w-auto">
                <img
                  src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4.png"
                  alt="Branch Illustration"
                  className="w-full max-w-xs sm:max-w-sm object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchData;