'use client'

import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast, ToastContainer } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import ClinicHome from '../components/ClinicHome'
import { getEmailId, getToken, getUserId } from '../hooks/GetitemsLocal'
import { CreateAdmin, HfidCheck } from '../services/ClinicServiceApi'
import { encryptData, decryptData } from '../utils/cryptoHelpers'
import { decodeAndStoreJWT } from '../utils/jwtHelpers'

const AdminCreates = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{ username: string; userEmail: string; } | null>(null)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHFIDValid, setIsHFIDValid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState<string | null>();
  const [token, setToken] = useState<string | null>();
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setCurrentUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchemail = async () => {
      const fetchedEmail = await getEmailId();
      setEmail(String(fetchedEmail));
    };
    fetchemail();
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      const fetchedToken = await getToken();
      setToken(String(fetchedToken));
    };
    fetchToken();
  }, []);

  // JWT Token decoding useEffect - runs when token changes
  useEffect(() => {
    if (token) {
      decodeAndStoreJWT(token);
    }
  }, [token]); // This useEffect runs whenever token changes

  const validateHFID = async (hfid: string) => {
    try {
      setChecking(true);
      const res = await HfidCheck({ hfid });
      setUserInfo({
        username: res.data.data.username,
        userEmail: res.data.data.userEmail
      })
      if (res?.data) {
        toast.success(`${res.data.message}`);
        setIsHFIDValid(true);
      } else {
        toast.error('Invalid HFID');
        setIsHFIDValid(false);
      }
    } catch (error) {
      const err = error as any;
      toast.error(`${err.response?.data?.message || 'Error validating HFID'}`);
    } finally {
      setChecking(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      hfid: '',
      role: 'Super Admin',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      hfid: Yup.string().required('HFID is required'),
      role: Yup.string().required('Role is required'),
      password: Yup.string().required("Password is required").min(8, "Min 8 chars").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, "Must include upper, lower, number & special char"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          userId: currentUserId,
          email: email,
          hfid: values.hfid,
          role: values.role,
          password: values.password,
          confirmPassword: values.confirmPassword,
        };
        const response = await CreateAdmin(payload);
        
        // Store the new token
        const newToken = response.data.data.token;
        await localStorage.setItem("authToken", await encryptData(newToken));
        await localStorage.setItem("username", await encryptData(response.data.data.username));
        
        // Update the token state to trigger JWT decoding
        setToken(newToken);
        
        toast.success(`${response.data.message}`);
        router.push("/dashboard");
        resetForm();
      } catch (error) {
        console.error(error);
        const err = error as any;
        toast.error(`${err.response?.data?.message || 'Error creating admin'}`);
      }
    },
  });

  return (
    <ClinicHome>
      <div
        className="w-full flex items-start justify-center h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)] md:h-[calc(100vh-100px)] lg:h-[calc(100vh-139px)] relative px-2 sm:px-4 lg:px-6 overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, white 70%, #67e8f9 100%)' }}
      >
        <div className="text-center relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
          {/* Header Section */}
          <div className="text-center my-3 sm:my-4 md:my-6">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              <span className="text-red-600">Set Up </span>
              Your Super Admin Access
            </h2>
            <div className="w-24 sm:w-28 md:w-32 lg:w-36 h-[2px] bg-gray-500 border-b mx-auto mt-1 sm:mt-2"></div>

            <p className="text-xs sm:text-sm md:text-base text-black max-w-xs sm:max-w-sm md:max-w-xl mx-auto px-2">
              You're the first to log in – to ensure secure access and accountability, please
              <br className="hidden sm:block" />
              verify your HF ID and create your login password.
            </p>
          </div>

          {/* HFID Check Section */}
          <div className="bg-white rounded-lg border shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto max-h-[60vh] sm:max-h-[60vh] md:max-h-[60vh] lg:max-h-[60vh] overflow-y-auto custom-scrollbar pb-5 -mt-3">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1">
              Welcome to <span className="text-blue-700">HFiles!</span>
            </h3>
            <div className="w-20 sm:w-24 md:w-26 lg:w-28 h-[2px] bg-gray-500 border-b mx-auto mt-2 mb-2 sm:mb-3 md:mb-4"></div>

            <div className="space-y-3 sm:space-y-4">
              <input
                type="text"
                name="hfid"
                placeholder="Enter your HF_ID"
                value={formik.values.hfid}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border p-2 sm:p-3 md:p-3 lg:p-4 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isHFIDValid}
              />
              {formik.touched.hfid && formik.errors.hfid && (
                <div className="text-red-500 text-xs sm:text-sm">{formik.errors.hfid}</div>
              )}
              {!isHFIDValid && (
                <button
                  type="button"
                  onClick={() => validateHFID(formik.values.hfid)}
                  className="w-full bg-yellow-300 border text-black font-semibold py-2 sm:py-2 md:py-2 lg:py-3 rounded-lg text-sm sm:text-base hover:bg-yellow-500 transition"
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Verify HF_ID'}
                </button>
              )}
            </div>

            {/* Admin Form Section */}
            {isHFIDValid && (
              <div className="space-y-3 sm:space-y-4 md:space-y-6 mt-3 sm:mt-4 md:mt-6">
                {/* User Profile Card */}
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3 md:p-4 flex items-center border border-gray-300">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-#CAE5FF rounded-full border overflow-hidden mr-2 sm:mr-3 md:mr-4">
                    <img
                      src="/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="text-black font-semibold text-sm sm:text-base md:text-lg">{userInfo?.username || 'Not Found'}</h2>
                    <p className="text-black text-xs sm:text-sm md:text-base">{userInfo?.userEmail || 'Not Found'}</p>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border p-2 sm:p-3 md:p-3 lg:p-4 pr-8 sm:pr-10 md:pr-12 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FontAwesomeIcon
                    icon={showPassword ? faEye : faEyeSlash}
                    className="absolute right-2 sm:right-3 md:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm sm:text-base"
                    onClick={() => setShowPassword((prev) => !prev)}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-xs sm:text-sm">{formik.errors.password}</div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="relative mt-2 sm:mt-3 md:mt-4">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border p-2 sm:p-3 md:p-3 lg:p-4 pr-8 sm:pr-10 md:pr-12 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEye : faEyeSlash}
                    className="absolute right-2 sm:right-3 md:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 text-sm sm:text-base"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className="text-red-500 text-xs sm:text-sm">{formik.errors.confirmPassword}</div>
                  )}
                </div>

                <button
                  type="button"
                  className="w-full text-white font-semibold py-2 sm:py-2 md:py-3 lg:py-3 rounded-lg text-sm sm:text-base transition primary cursor-pointer"
                  onClick={() => formik.handleSubmit()}
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </div>
        <ToastContainer />

        {/* Illustration (Background Image) */}
        <div
          className="fixed right-2 sm:right-4 md:right-6 lg:right-8 bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-12 bg-cover bg-center opacity-30 sm:opacity-40 md:opacity-50 flex justify-end w-32 h-36 sm:w-40 sm:h-44 md:w-48 md:h-52 lg:w-56 lg:h-60 xl:w-64 xl:h-68 2xl:w-72 2xl:h-76"
          style={{ backgroundImage: 'url(/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4.png)' }}
        ></div>
      </div>
    </ClinicHome>
  );
};

export default AdminCreates;