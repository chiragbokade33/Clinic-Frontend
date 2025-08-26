'use client';
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faEyeSlash, faLock, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from "react-toastify";
import { AddMember, HfidCheck, ListBranchData } from '../services/ClinicServiceApi';
import { getUserId } from '../hooks/GetitemsLocal';

type AddTeamMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
};


const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [showAssignPassword, setShowAssignPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username: string; userEmail: string; } | null>(null)
  const [isHFIDValid, setIsHFIDValid] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number>();
  const [ListBranchs, setListBranchs] = useState();

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      formik.setFieldValue('branchId', currentUserId.toString());
    }
  }, [currentUserId]);

  const ListBranch = async () => {
    const res = await ListBranchData();
    setListBranchs(res?.data?.data?.clinics);
  }


  useEffect(() => {
    ListBranch();
  }, [])


  const validateHFID = async (hfid: string) => {
    try {
      const res = await HfidCheck({ hfid });
      setUserInfo({
        username: res.data.data.username,
        userEmail: res.data.data.userEmail
      })
      if (res?.data) {
        toast.success(`${res.data.message}`);
        setIsHFIDValid(true);
      } else {
        toast.error('Invalid hfid');
        setIsHFIDValid(false);
      }
    } catch (error) {
      const err = error as any;
      toast.error(`${err.res.data.message}`);
    } finally {
    }
  };

  // Formik validation schema
  const validationSchema = Yup.object({
    hfid: Yup.string()
      .required('HF ID is required')
      .min(3, 'HF ID must be at least 3 characters'),
    branchId: Yup.string()
      .required('branchId  is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const formik = useFormik({
    initialValues: {
      hfid: '',
      branchId: currentUserId ? currentUserId.toString() : '',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          hfid: values.hfid,
          branchId: parseInt(values.branchId, 10),
          password: values.password,
          confirmPassword: values.confirmPassword
        };
        const res = await AddMember(payload)
        toast.success(`${res.data.message}`)
        await onSubmit(payload);
        handleClose();
      } catch (error) {
        console.error('Error while submitting:', error);
        const err = error as any;
        toast.error(`${err.res.data.message}`);
      }
    }

  });

  const handleClose = () => {
    formik.resetForm();
    setShowAssignPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className='flex justify-end mx-2 mt-2'>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl flex justify-end"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        {/* Header */}
        <div className="flex items-center justify-center p-3 border-b">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSquarePlus} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-600">Add a Team Member</h2>
          </div>

        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 mx-3">
            {/* HF ID Field with Icon */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white px-3 py-2 rounded font-semibold text-sm cursor-pointer" onClick={() => validateHFID(formik.values.hfid)}>HF</div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  name="hfid"
                  value={formik.values.hfid}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Member's HF id."
                  className={`flex-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${formik.touched.hfid && formik.errors.hfid ? 'border-red-500' : 'border-gray-300'
                    }`}

                />
                {formik.touched.hfid && formik.errors.hfid && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.hfid}</p>
                )}
              </div>
            </div>

            {/* Branch Selection */}
            <div className="relative">
              <select
                name="branchId"
                value={formik.values.branchId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`flex-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${formik.touched.branchId && formik.errors.branchId
                  ? 'border-red-500'
                  : 'border-gray-300'
                  }`}
              >
                <option value="">Select Branch</option>
                {ListBranchs && ListBranchs?.map((clinic: any) => (
                  <option key={clinic.clinicId} value={clinic.clinicId.toString()}>
                    {clinic.clinicName}
                  </option>
                ))}
              </select>

              {formik.touched.branchId && formik.errors.branchId && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.branchId}</p>
              )}
            </div>


            {/* Assign Password */}
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faLock} className="text-gray-600 px-3 py-2" />
              <div className="flex-1 relative">
                <input
                  type={showAssignPassword ? 'text' : 'password'}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Assign Password"
                  className={`flex-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowAssignPassword(!showAssignPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={showAssignPassword ? faEye : faEyeSlash} />
                </button>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Confirm Password"
                  className={`flex-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500  ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 items-center top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
                </button>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col md:flex-row justify-between items-start p-3 border-t gap-2 mx-3">
            {/* Left Column: Profile + Add Button */}
            <div className="flex flex-col items-center md:items-start w-full sm:w-auto max-w-lg">
              {/* User Profile Card */}
              <div className="bg-blue-100 rounded-lg flex flex-col sm:flex-row sm:items-center border w-full p-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mx-auto sm:mx-0 sm:mr-4">
                  <img
                    src="/199252fb761b753127d3ca8360be7b85a4128097.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left mt-3 sm:mt-0">
                  <h2 className="text-blue-800 text-xl font-bold">{userInfo?.username}</h2>
                  <p className="text-black">{userInfo?.userEmail}</p>

                  {/* Validation Error Message */}
                </div>
              </div>
              {!formik.isValid && !isHFIDValid && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> Please verify name and email before adding.
                </p>
              )}


              {/* Add Button Below Card */}
              <button
                type="button"
                onClick={() => formik.handleSubmit()}
                disabled={!isHFIDValid || formik.isSubmitting}
                className={`mt-4 w-full sm:w-full px-6 py-2 rounded-md text-sm font-medium transition cursor-pointer ${!isHFIDValid || formik.isSubmitting
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-800 text-white hover:bg-blue-900'
                  }`}
              >
                {formik.isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>

            {/* Right Illustration */}
            <div className="hidden md:block">
              <img
                src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4.png"
                alt="Illustration"
                className="w-[200px] h-[200px] object-cover"
              />
            </div>
          </div>

        </form>

      </div>
      <ToastContainer />
    </div>
  );
};

export default AddTeamMemberModal;