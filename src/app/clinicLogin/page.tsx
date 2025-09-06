"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import ClinicHome from "../components/ClinicHome";
import { ForgotPasswordReq, LoginPassword, LoginWithOtp, PhoneLoginEmail } from "../services/ClinicServiceApi";
import { encryptData } from "../utils/cryptoHelpers";

const ClinicLogin = () => {
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingOTP, setIsSubmittingOTP] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [timers, setTimers] = useState(300);


  const formatTimes = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval = null;
    if (showOtp && timers > 0) {
      interval = setInterval(() => {
        setTimers((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timers === 0) {
      setIsResendDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showOtp, timers]);

  const isEmail = (input: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(input);
  };

  const isPhoneNumber = (input: string) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(input.replace(/\s/g, ''));
  };

  const emailValidationSchema = Yup.object({
    emailOrPhone: Yup.string()
      .required("Email or Phone number is required")
      .test('email-or-phone', 'Please enter a valid email address or phone number', function (value) {
        if (!value) return false;
        return isEmail(value) || isPhoneNumber(value);
      }),
  });


  const otpValidationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d+$/, "OTP must contain only digits")
      .length(6, "OTP must be exactly 6 digits")
      .required("OTP is required"),
  });

  const passwordLoginValidationSchema = Yup.object({
    email: Yup.string().required("Email ID / Contact No. is required"),
    password: Yup.string().required("Password is required").min(8, "Min 8 chars").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, "Must include upper, lower, number & special char"),
  });

  const emailFormik = useFormik({
    initialValues: {
      emailOrPhone: "",
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values) => {
      setIsSubmittingOTP(true);
      try {
        const payload: { email?: string; phoneNumber?: string } = {};

        if (isEmail(values.emailOrPhone)) {
          payload.email = values.emailOrPhone;
        } else {
          payload.phoneNumber = values.emailOrPhone;
        }
        const res = await LoginWithOtp(payload);
        toast.success(`${res.data.message}`);
        localStorage.setItem("emailId", await encryptData(res.data.data.email));
      } catch (error) {
        const err = error as any;
        toast.error(`${err.res.data.message}`);
        console.error("Failed to send OTP:", error);
      } finally {
        setIsSubmittingOTP(false);
      }
      console.log("Form submitted with:", values);
    },
  });

  const otpFormik = useFormik({
    initialValues: {
      emailOrPhone: "",
      otp: "",
    },
    validationSchema: otpValidationSchema,
    onSubmit: async (values) => {
      try {
        const isEmail = emailFormik.values.emailOrPhone.includes('@');
        const response = await PhoneLoginEmail({
          ...(isEmail
            ? { email: emailFormik.values.emailOrPhone }
            : { phoneNumber: emailFormik.values.emailOrPhone }),
          otp: values.otp,
        });
        toast.success(`${response.data.message}`);
        localStorage.setItem("userId", await encryptData(response.data.data.userId.toString()));
        localStorage.setItem("emailId", await encryptData(response.data.data.email));
        if (response.data.data.isSuperAdmin) {
          router.push("/clinicAdminLogin");
        } else {
          router.push("/clinicAdminCreate");
        }

      } catch (error) {
        const err = error as any;
        toast.error(`${err.response.data.message}`);
        console.error("Login failed:", error);
      }
      console.log("OTP submitted:", values.otp);
    },
  });

  const passwordLoginFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: passwordLoginValidationSchema,
    onSubmit: async (values) => {
      try {
        const response = await LoginPassword({
          email: values.email,
          password: values.password,
        });
        toast.success(`${response.data.message}`);
        localStorage.setItem("userId", await encryptData(response.data.data.userId.toString()));
        localStorage.setItem("emailId", await encryptData(response.data.data.email));
        if (response.data.data.isSuperAdmin) {
          router.push("/clinicAdminLogin");
        } else {
          router.push("/clinicAdminCreate");
        }

      } catch (error) {
        const err = error as any;
        toast.error(`${err.response.data.message}`);
        console.error("Login failed:", error);
      }
      console.log("Password login submitted:", values);
    },
  });

  const handleGetOTP = async () => {
    const errors = await emailFormik.validateForm();

    if (Object.keys(errors).length === 0) {
      try {
        const res = await emailFormik.submitForm();
        setShowOtp(true);
        setTimers(300);
        setShowPasswordLogin(false);
        setIsResendDisabled(true);
      } catch (error) {
        const err = error as any;
        console.error(`${err.res.data.message}`);
      }
    } else {
      emailFormik.setTouched({ emailOrPhone: true });
    }
  };

  const handlePasswordLogin = () => {
    emailFormik.validateForm().then((errors) => {
      if (Object.keys(errors).length === 0) {
        passwordLoginFormik.setFieldValue("email", emailFormik.values.emailOrPhone);
        setShowPasswordLogin(true);
        setShowOtp(false);
      } else {
        emailFormik.setTouched({ emailOrPhone: true });
      }
    });
  };

  const handleResendOTP = async () => {
    try {
      const res = await emailFormik.submitForm();
      toast.success(`${res.data.message}`);
      setTimers(300);
      setIsResendDisabled(true);
    } catch (error) {
      const err = error as any;
      console.error(`${err.res.data.message}`);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  // Handle Forgot Password
  const handleForgotPassword = async () => {
    let email = showPasswordLogin
      ? passwordLoginFormik.values.email
      : emailFormik.values.emailOrPhone;

    const emailSchema = Yup.string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address"
      )
      .required("Email is required");

    try {
      await emailSchema.validate(email);
      const payload = { email };
      const res = await ForgotPasswordReq(payload);
      toast.success(`${res.data.message}`);
      localStorage.setItem("recipientEmail", res.data.data.recipientEmail);
      router.push("/forgotPassword");
    } catch (error) {
      const err = error as any;
      toast.error(
        error instanceof Yup.ValidationError
          ? error.message
          : `${err.res.data.message}`
      );
      console.error("Forgot password error:", error);
    }
  };


  return (
    <ClinicHome>
      <div className="w-full h-[calc(100vh-112px)] h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)]  md:h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] flex flex-col items-center justify-center " style={{
        background: 'linear-gradient(to bottom, white 70%, #67e8f9 100%)'
      }}>
        <h1 className="text-xl md:text-lg font-semibold text-red-600  text-center">
          Streamline <span className="text-gray-800">your Clinic services with ease and efficiency</span>

        </h1>
        <div className="w-70 mx-auto my-3 border-b border-black"></div>


        <div className=" overflow-hidden flex flex-col md:flex-row max-w-6xl mb-3 w-full relative border border-black rounded-lg">
          <div className="md:w-1/2 flex items-center justify-center  relative ">
            <img
               src="\Clinic.png"
              alt="Chemistry Lab Illustration"
              width={700}
              height={500}
              className="max-h-96 md:max-h-full -mr-50 -mb-4"
            />
          </div>

          <div className="md:w-1/2 p-4 md:p-8 flex flex-col justify-center bg-white shadow-[0_0_18px_6px_rgba(0,0,0,0.2)]" style={{ borderTopLeftRadius: "10%" }}>
            <div className="flex justify-center mb-6">
              <img
                src="/c58406b5f7677a1dfe6229727edf59accdc4b368.png"
                alt="Logo"
                width={80}
                height={80}
                className="p-2"
              />
            </div>
            <h2 className="text-center text-xl font-bold text-blue-800 mb-6">
              {showOtp || showPasswordLogin ? "Welcome Back!" : "Welcome Back!"}
              <div className="w-24 border-t border-blue-800 mx-auto"></div>
            </h2>

            {!showOtp && !showPasswordLogin && (
              <form onSubmit={emailFormik.handleSubmit} className="w-full px-6">
                <div className="w-full mb-2">
                  <input
                    type="text"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    placeholder="Email ID / Phone Number"
                    value={emailFormik.values.emailOrPhone}
                    onChange={emailFormik.handleChange}
                    onBlur={emailFormik.handleBlur}
                    className={`w-full px-4 py-3 rounded-md text-gray-800 focus:outline-none border ${emailFormik.touched.emailOrPhone && emailFormik.errors.emailOrPhone
                      ? "border-red-500"
                      : "border-black"
                      }`}
                  />
                </div>
                {emailFormik.touched.emailOrPhone && emailFormik.errors.emailOrPhone && (
                  <div className="text-red-500 text-xs mb-2">
                    {emailFormik.errors.emailOrPhone}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGetOTP}
                  disabled={isSubmittingOTP}
                  className={`w-full text-blue-900 font-medium py-3 rounded-md mb-2 transition duration-300
                    ${isSubmittingOTP
                      ? "bg-yellow-300 cursor-not-allowed"
                      : "primary hover:bg-blue-700 text-white"
                    }`}
                >
                  {isSubmittingOTP ? "Sending..." : "Get OTP"}
                </button>

                <div className="text-gray-600 text-sm my-2 text-center">or</div>
                <p className="text-sm text-center">
                  <a
                    href="#"
                    onClick={handlePasswordLogin}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4"
                  >
                    Click here
                  </a>{" "}
                  to log in with Password
                </p>
              </form>
            )}

            {showOtp && (
              <form onSubmit={otpFormik.handleSubmit} className="w-full px-6">
                <div className="w-full mb-4 bg-gray-100 px-4 py-3 rounded-md text-gray-800 border border-gray-300">
                  {emailFormik.values.emailOrPhone}
                </div>

                <div className="w-full mb-2">
                  <div className="md:col-span-2 flex flex-col items-center mt-1 border rounded-md px-4 py-3 w-full">
                    <div className="flex flex-wrap justify-center gap-3 mb-2">

                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          className={`w-10 h-12 text-center border-b text-lg focus:outline-none focus:border-blue-500 sm:w-10 md:w-10 mx-1 ${otpFormik.touched.otp && otpFormik.errors.otp ? 'border-red-500' : ''
                            }`}
                          value={otpFormik.values.otp[index] || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d?$/.test(val)) {
                              const otp = otpFormik.values.otp.split("");
                              otp[index] = val;
                              otpFormik.setFieldValue("otp", otp.join(""));

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

                </div>
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <div className="text-red-500 text-xs mb-2">
                    {otpFormik.errors.otp}
                  </div>
                )}

                <div className="font-medium px-2">
                  Time left: {formatTimes(timers)}
                </div>

                <div className="text-end mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`text-blue-800 text-sm font-medium mt-2 mb-3 md:col-span-2 flex justify-end md:self-end cursor-pointer`}
                  >
                    Resend OTP
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full primary text-white font-medium py-3 rounded-md mb-4 hover:bg-blue-700 transition duration-300 cursor-pointer"
                >
                  Login
                </button>

                <div className="w-24 border-t border-gray-600 mx-auto mb-2"></div>

                <p className="text-sm text-center">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePasswordLogin();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4"
                  >
                    Click here
                  </a>{" "}
                  to log in with Password
                </p>
              </form>
            )}

            {showPasswordLogin && (
              <form
                onSubmit={passwordLoginFormik.handleSubmit}
                className="w-full px-6"
              >
                <div className="w-full mb-4">
                  <input
                    type="text"
                    id="email"
                    name="email"
                    placeholder="Email Id / Contact No."
                    value={passwordLoginFormik.values.email}
                    onChange={passwordLoginFormik.handleChange}
                    onBlur={passwordLoginFormik.handleBlur}
                    className={`w-full px-4 py-3 rounded-md text-gray-800 focus:outline-none  border  ${passwordLoginFormik.touched.email &&
                      passwordLoginFormik.errors.email
                      ? "border-red-500"
                      : "border-black"
                      }`}
                  />
                </div>
                {passwordLoginFormik.touched.email &&
                  passwordLoginFormik.errors.email && (
                    <div className="text-red-500 text-xs mb-2">
                      {passwordLoginFormik.errors.email}
                    </div>
                  )}

                <div className="w-full mb-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={passwordLoginFormik.values.password}
                    onChange={passwordLoginFormik.handleChange}
                    onBlur={passwordLoginFormik.handleBlur}
                    className={`w-full px-4 py-3 rounded-md text-gray-800 focus:outline-none border ${passwordLoginFormik.touched.password &&
                      passwordLoginFormik.errors.password
                      ? "border-red-500"
                      : "border-black"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      {showPassword ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {passwordLoginFormik.touched.password &&
                  passwordLoginFormik.errors.password && (
                    <div className="text-red-500 text-xs mb-2">
                      {passwordLoginFormik.errors.password}
                    </div>
                  )}

                <div className="text-right mb-4">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-blue-800 text-sm hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full primary text-white font-medium py-3 rounded-md mb-4 hover:bg-blue-700 transition duration-300 cursor-pointer"
                >
                  Login
                </button>

                <div className="w-24 border-t border-gray-600 mx-auto"></div>

                <div className="text-center mt-2">
                  <p className="text-sm">
                    <a
                      href="#"
                      onClick={async (e) => {
                        e.preventDefault();
                        setShowOtp(true);
                        setShowPasswordLogin(false);
                        await emailFormik.submitForm();
                        setTimers(60);
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-4"
                    >
                      Click here
                    </a>{" "}
                    to log in with OTP
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>
        <ToastContainer />
      </div>
    </ClinicHome>
  );
};

export default ClinicLogin;
