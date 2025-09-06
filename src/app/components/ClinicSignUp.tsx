"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { SignUpValidationsSchema } from "../type";
import Captcha from "./Captcha";
import ClinicHome from "./ClinicHome";
import { OTPSignUp, SignUp } from "../services/ClinicServiceApi";

const ClinicSignUp = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [timer, setTimer] = useState(300);

  // SignUp Form Data
  const formik = useFormik({
    initialValues: {
      clinicName: "",
      email: "",
      phone: "",
      pincode: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      otp: "",
    },
    validationSchema: SignUpValidationsSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const payload = {
        clinicName: values.clinicName,
        email: values.email,
        phoneNumber: values.phone,
        pincode: values.pincode,
        password: values.password,
        confirmPassword: values.confirmPassword,
        otp: values.otp,
      };
      try {
        const response = await SignUp(payload);
        if (response?.data?.message) {
          toast.success(`${response.data.message}`);
          router.push("/thankyou");
        }
      } catch (error) {
        console.error("Sign Up Error:", error);
        const err = error as any;
        toast.error(`${err.response.data.message}`);
      } finally {
        setIsSubmitting(false);
      }
      console.log("Submitted Data:", values);
    },
  });

  // This is OTP Generate
  const handleGetOtp = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({
      clinicName: true,
      email: true,
      phone: true,
      pincode: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(errors).length === 0) {
      try {
        setIsOtpSending(true);
        const response = await OTPSignUp({
          clinicName: formik.values.clinicName,
          email: formik.values.email,
          phoneNumber: formik.values.phone,
        });
        setOtpVisible(true);
        toast.success(`${response.data.message}`);
        setTimer(300);
      } catch (error) {
        console.error("OTP Error:", error);
        const err = error as any;
        toast.error(`${err.response.data.message}`);
      } finally {
        setIsOtpSending(false);
      }
    } else {
      console.error("Validation failed", errors);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

  return (
    <ClinicHome>
      <div className="w-full  h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)]  md:h-[calc(100vh-100px)] lg:h-[calc(100vh-140px)] flex flex-col items-center justify-center " style={{
        background: 'linear-gradient(to bottom, white 70%, #67e8f9 100%)'
      }}>
        <div className="text-center">
          <h1 className="text-lg md:text-lg font-bold">
            <span className="text-red-500">Streamline</span> your Clinic
            services with ease and efficiency
          </h1>
          <div className="w-1/2 mx-auto my-3 border-b border-black"></div>
        </div>

        <div className=" overflow-hidden flex flex-col md:flex-row max-w-6xl md:mx-3 mb-3 w-full relative border border-black rounded-lg">
          <div className="md:w-1/2 flex items-center justify-center  relative">
            <img
              src="\Clinic.png"
              alt="Chemistry Clinic Experiment"
              className="max-h-96 md:max-h-full lg:-mr-45 -mb-4 md:-mr-29"
            />
          </div>

          <div className="md:w-1/2 p-4 md:p-3 flex flex-col justify-center bg-white shadow-[0_0_18px_6px_rgba(0,0,0,0.2)]" style={{ borderTopLeftRadius: "10%" }}>
            <div className="w-full px-6">
              <h1 className="text-center text-md font-semibold mb-1">
                <span className="text-blue-600 font-bold">Sign Up</span> to
                Simplify Your Clinic Today
              </h1>
              <div className="w-1/2 mx-auto my-3 border-b-2 border-black"></div>

              <form
                onSubmit={formik.handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-2 "
              >
                <div>
                  <input
                    type="text"
                    name="clinicName"
                    placeholder="Enter Clinic Name"
                    className="w-full border border-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.clinicName}
                  />
                  {formik.touched.clinicName && formik.errors.clinicName && (
                    <p className="text-red-500 text-xs ">
                      {formik.errors.clinicName}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter Clinic Email"
                    className="w-full border border-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-xs ">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter Mobile Number"
                    className="w-full border border-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.phone}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-red-500 text-xs ">
                      {formik.errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Enter Pin-Code"
                    className="w-full border border-black rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.pincode}
                  />
                  {formik.touched.pincode && formik.errors.pincode && (
                    <p className="text-red-500 text-xs ">
                      {formik.errors.pincode}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    className="w-full border border-black rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                  </span>
                  <div className="min-h-[1.25rem] mt-1">
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>
                </div>



                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="w-full border border-black rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirmPassword}
                  />
                  <span
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                    <FontAwesomeIcon icon={showConfirm ? faEye : faEyeSlash} />
                  </span>
                  <div className="min-h-[1.25rem] mt-1">
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>


                {!otpVisible &&
                  !isCaptchaVerified &&
                  formik.values.clinicName &&
                  formik.values.email &&
                  formik.values.phone &&
                  formik.values.pincode &&
                  formik.values.password &&
                  formik.values.confirmPassword &&
                  Object.keys(formik.errors).length === 0 && (
                    <div className="md:col-span-2 flex justify-center mt-2 mb-1">
                      <Captcha onVerify={() => setIsCaptchaVerified(true)} />
                    </div>
                  )}

                {otpVisible && (
                  <>
                    <div className="md:col-span-2 flex flex-col items-center mt-1 border rounded-md px-4 py-3 w-full">
                      <div className="flex flex-wrap justify-center gap-3 mb-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-10 h-12 text-center border-b text-lg focus:outline-none focus:border-blue-500 sm:w-12 md:w-14"
                            value={formik.values.otp[index] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^\d?$/.test(val)) {
                                const newOtp =
                                  formik.values.otp.substring(0, index) +
                                  val +
                                  formik.values.otp.substring(index + 1);
                                formik.setFieldValue("otp", newOtp);

                                if (val && index < 5) {
                                  const nextInput = document.getElementById(`otp-${index + 1}`);
                                  nextInput?.focus();
                                }
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                              if (pasteData) {
                                const updatedOtp = pasteData.padEnd(6, " ");
                                formik.setFieldValue("otp", updatedOtp);

                                setTimeout(() => {
                                  for (let i = 0; i < updatedOtp.length; i++) {
                                    const input = document.getElementById(`otp-${i}`);
                                    input?.focus();
                                  }
                                }, 0);
                              }
                            }}
                          />
                        ))}

                      </div>
                    </div>

                    <div className="font-medium px-2">
                      Time left: {formatTime(timer)}
                    </div>

                    <div className='flex justify-end'>
                      <button
                        type="button"
                        onClick={async () => {
                          formik.setFieldValue("otp", "");
                          await handleGetOtp();
                          setTimer(300);
                        }}
                        className="text-blue-800 text-sm font-medium mt-2 mb-3 md:col-span-2 flex justify-end md:self-end"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </>
                )}

                {formik.touched.otp && formik.errors.otp && (
                  <div className="md:col-span-2 text-center">
                    <p className="text-red-500 text-xs ">{formik.errors.otp}</p>
                  </div>
                )}

                {otpVisible && (
                  <div className="md:col-span-2 flex justify-center gap-2 ">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      id="acceptTerms"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      checked={formik.values.acceptTerms}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <div className="text-sm text-gray-700">
                      <label htmlFor="acceptTerms" className="mr-1">
                        I Accept The
                      </label>
                      <a
                        href="https://hfiles.in/Terms&Conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 font-semibold hover:underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      &{" "}
                      <a
                        href="https://hfiles.in/privacypolicy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 font-semibold hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </div>


                  </div>
                )}
                {formik.touched.acceptTerms && formik.errors.acceptTerms && (
                  <div className="md:col-span-2 text-center">
                    <p className="text-red-500 text-xs ">
                      {formik.errors.acceptTerms}
                    </p>
                  </div>
                )}

                <div className="md:col-span-2 mt-2">
                  {!otpVisible ? (
                    <button
                      type="button"
                      onClick={handleGetOtp}
                      disabled={isOtpSending || !isCaptchaVerified}
                      className={`w-full font-bold py-3 rounded-md border-2 border-balck ${isOtpSending || !isCaptchaVerified
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-yellow-300 hover:bg-yellow-400 text-black cursor-pointer"
                        } transition-colors duration-200`}
                    >
                      {isOtpSending ? "Sending OTP..." : "Get OTP"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full font-bold py-3 rounded-md ${isSubmitting
                        ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                        : "primary hover:bg-blue-900 text-white cursor-pointer"
                        } transition-colors duration-200`}
                    >
                      {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </button>
                  )}
                </div>
              </form>
              {!otpVisible && (
                <p className="text-center mt-6 text-sm text-gray-600">
                  Already Have an Account?{" "}
                  <a
                    href="/clinicLogin"
                    className="text-blue-800 font-semibold hover:underline"
                  >
                    Log in
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </ClinicHome>
  );
};

export default ClinicSignUp;
