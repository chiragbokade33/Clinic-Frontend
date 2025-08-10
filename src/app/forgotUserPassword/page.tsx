
'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faLock } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import ClinicHome from '../components/ClinicHome';
// import {  LoginOTP,  UserForgotPassword , ForgotPasswordUser , UserOTPVerify} from '@/services/labServiceApi';

const getStoredUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};
const getStoredRecipientEmail = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem('recipientEmail');
  }
  return null;
};

const ForgotPasswordUserPage = () => {
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [email, setEmail] = useState('') as any; 
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
    // const userId = localStorage.getItem("userId");
     const [userId] = useState<string | null>(getStoredUserId);
     const [email] = useState<string | null>(getStoredRecipientEmail);

  const [timer, setTimer] = useState(300);
  const router = useRouter();

  // useEffect(() => {
  //   const storedEmail = localStorage.getItem('recipientEmail');
  //   if (storedEmail) {
  //     setEmail(storedEmail);
  //   }
  // }, []);

  const otpFormik = useFormik({
    initialValues: {
      email: "",
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
        // const response = await UserOTPVerify({
        //   email: email,
        //   otp: values.otp,
        // });
        toast.success(`OTP Verify successfully...`);
        setStep(2);
        setIsOtpVerified(true);
      } catch (error) {
        const err = error as any;
        toast.error(`${err.response?.data?.message}`);
        console.error("OTP verification failed:", error);
        setIsOtpVerified(false);
      } finally {
        setIsVerifyingOtp(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      newPassword: Yup.string()
        .min(8, "Min 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Use upper, lower, number & special char")
        .required("New password required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm password required')
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        // const res = await ForgotPasswordUser({ email: email, labId:userId , newPassword: values.newPassword, confirmPassword: values.confirmPassword });
        // toast.success(`${res.data.message}`);
        // router.push('/labAdminLogin');
        // localStorage.removeItem("recipientEmail");
      } catch (error) {
        const err = error as any;
        toast.error(`${err.response?.data?.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const val = e.target.value;
    const otpArray = otpFormik.values.otp.split('');
    otpArray[i] = val;
    const newOtp = otpArray.join('').slice(0, 6);
    otpFormik.setFieldValue('otp', newOtp);
    if (val && i < 5) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData('Text').trim().slice(0, 6);
    const digits = pastedData.split('');
    digits.forEach((digit, i) => {
      otpFormik.setFieldValue('otp', pastedData);
      if (inputRefs.current[i]) {
        inputRefs.current[i]!.value = digit;
      }
    });
    inputRefs.current[digits.length - 1]?.focus();
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) clearInterval(countdown);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 4) return `${username[0]}***@${domain}`;
    return `${username.slice(0, 2)}${'*'.repeat(username.length - 4)}${username.slice(-2)}@${domain}`;
  };

    const handleForgotPassword = async () => {
       try {
          const payload = {
            email,
            labId: userId,
          };
      
        //   const response = await UserForgotPassword(payload);
        //     localStorage.setItem("recipientEmail", email || ""); 
        //     toast.success(response.data.message);
        } catch (error) {
          console.error("Error during forgot password:", error);
        }
    };


  return (
   <ClinicHome>
  <div className="min-h-xl flex items-center justify-center px-4">
    <div className="flex flex-col lg:flex-row items-center justify-start w-full max-w-6xl mt-9">
      
      <div className="flex justify-center w-full lg:w-1/2 mb-8 lg:mb-0">
        <img
          src="/Group 680.png"
          alt="Branch Illustration"
          className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg object-cover rounded-lg"
        />
      </div>

      <div className="p-6 sm:p-8 w-full lg:w-1/2 max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-left text-gray-800 mb-2">Forgot</h1>
        <h1 className="text-3xl sm:text-4xl font-bold text-left text-gray-800 mb-6">Password?</h1>
        <p className="text-left text-sm text-black mb-4">
          An OTP has been sent to your email: <span className="text-blue-900">{maskEmail(email || "")}</span>
        </p>

        {step === 1 ? (
          <form onSubmit={otpFormik.handleSubmit} className="space-y-6">

            <div className="flex justify-between gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 border text-center rounded-lg text-xl"
                  value={otpFormik.values.otp[i] || ''}
                  onChange={(e) => handleChange(e, i)}
                  onPaste={handlePaste}
                  ref={(el) => {
                    if (el) inputRefs.current[i] = el;
                  }}
                />
              ))}
            </div>

            {otpFormik.touched.otp && otpFormik.errors.otp && (
              <p className="text-red-500 text-sm">{otpFormik.errors.otp}</p>
            )}

            <div className="flex justify-between items-center text-sm text-gray-600">
              <div className="font-medium">
                Time left: {formatTime(timer)}
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await handleForgotPassword();
                    setTimer(300);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="text-blue-800 hover:underline font-bold"
              >
                Resend OTP
              </button>
            </div>

            <button
              type="submit"
              disabled={otpFormik.isSubmitting}
              className="w-full py-3 bg-yellow-300 rounded-lg text-black font-semibold border hover:bg-yellow-500"
            >
              {otpFormik.isSubmitting ? 'Verifying...' : 'Next'}
            </button>
          </form>
        ) : (
          <form onSubmit={passwordFormik.handleSubmit} className="space-y-6">

            <div className="relative">
              <label className="text-black block">Please Create New password:</label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="Create New Password"
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                value={passwordFormik.values.newPassword}
                className="w-full py-3 px-4 border rounded-lg"
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-9">
                <FontAwesomeIcon icon={showNewPassword ? faEye : faEyeSlash} />
              </button>
              {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.newPassword}</p>
              )}
            </div>

            <div className="relative">
              <label className="text-black mb-1 block">Please Confirm password:</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                value={passwordFormik.values.confirmPassword}
                className="w-full py-3 px-4 border rounded-lg"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-9">
                <FontAwesomeIcon icon={showConfirmPassword ? faEye : faEyeSlash} />
              </button>
              {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{passwordFormik.errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 primary rounded-lg text-white font-semibold hover:bg-blue-800"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>

      <ToastContainer />
    </div>
  </div>
</ClinicHome>


  );
};

export default ForgotPasswordUserPage;
