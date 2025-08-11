'use client'
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import ClinicHome from "../components/ClinicHome";
import { getEmailId, getToken, getUserId } from "../hooks/GetitemsLocal";
import { decodeAndStoreJWT } from "../utils/jwtHelpers";
import { LoginUser } from "../services/ClinicServiceApi";
import { encryptData } from "../utils/cryptoHelpers";

interface CardData {
  userId: string;
  name: string;
  email: string;
  role: string;
  hfid: string;
  profilePhoto: string;
}



const AdminLogins = () => {
  const router = useRouter();
  const [selectedHfid, setSelectedHfid] = useState<string | null>(null);
  const [cardListData, setCardListData] = useState<CardData[]>([]) as any;
  const [memberListData, setMemberListData] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
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


  const formik = useFormik({
    initialValues: {
      userId: 0,
      email: "",
      hfid: "",
      role: "",
      password: "",
    },
    validationSchema: Yup.object({
      hfid: Yup.string().required("HFID is required"),
      role: Yup.string().required("Role is required"),
      password: Yup.string().required("Password is required").min(8, "Min 8 chars").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, "Must include upper, lower, number & special char"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          userId: currentUserId,
          email: email,
          hfid: values.hfid,
          role: values.role,
          password: values.password,
        };
        const response = await LoginUser(payload);
        toast.success(`${response.data.message}`);
        localStorage.setItem("authToken",await encryptData(response.data.data.token));
        localStorage.setItem("username",await encryptData(response.data.data.username));
        router.push("/dashboard");
        resetForm();
      } catch (error) {
        console.error("Error logging in:", error);
        const err = error as any;
        toast.error(`${err.response.data.message}`);
      }
    },
  });

  // const token = localStorage.getItem("authToken");

  // if (token) {
  //   try {
  //     const base64Url = token.split('.')[1];
  //     const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //     const jsonPayload = decodeURIComponent(
  //       atob(base64)
  //         .split('')
  //         .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
  //         .join('')
  //     );
  //     const data = JSON.parse(jsonPayload);
  //     localStorage.setItem("LabAdminId", data.LabAdminId);
  //     localStorage.setItem("role", data.role);
  //   } catch (error) {
  //     console.error("Failed to decode JWT token:", error);
  //   }
  // } else {
  //   console.log("No authToken found in localStorage.");
  // }

  const BASE_URL = "https://hfiles.in/upload/";

  const CardList = async () => {
    // const res = await UserCardList(Number(userId));
    // setCardListData(res.data.data.superAdmin);
    // setMemberListData(res.data.data.members);
  }

  useEffect(() => {
    CardList();
  }, [])

  const handleForgotPassword = async (email: string) => {
    try {
      const payload = {
        email,
        labId: currentUserId,
      };

    //   const response = await UserForgotPassword(payload);
    //   localStorage.setItem("recipientEmail", email);
    //   toast.success(response.data.message);
      router.push("/forgotUserPassword");
    } catch (error) {
      console.error("Error during forgot password:", error);
    }
  };


  return (
    <ClinicHome>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] sm:h-[calc(100vh-90px)]  md:h-[calc(100vh-100px)] lg:h-[calc(100vh-139px)]" style={{ background: 'linear-gradient(to bottom, white 70%, #67e8f9 100%)' }}>
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-4 md:p-4 lg:p-4 2xl:p-4 order-first lg:order-last h-full">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl 2xl:max-w-2xl border p-4 sm:p-4 md:p-4 h-full overflow-y-auto custom-scrollbar">

            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl 2xl:text-3xl font-bold text-blue-700 text-center mb-2">
              Select your profile to login
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-black text-center mb-4 sm:mb-6">
              Click on your profile to verify and access the lab dashboard securely.
            </p>
            <hr className="mb-4 sm:mb-6" />

            {/* Admins Section */}
            <h2 className="text-base sm:text-lg md:text-lg lg:text-xl font-semibold text-blue-700 mb-3 sm:mb-4">
              Admins
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div
                key={cardListData.userId}
                className={`rounded-lg flex flex-col border p-3 sm:p-4 cursor-pointer transition-all duration-200 ${selectedHfid === cardListData.hfid ? 'border-gray-300 bg-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => {
                  setSelectedHfid(cardListData.hfid);
                  formik.setFieldValue("hfid", cardListData.hfid);
                  formik.setFieldValue("role", cardListData.role);
                }}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-200 rounded-full border border-gray-300 overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                    {cardListData.profilePhoto !== "No image preview available" ? (
                      <img
                        src={`${BASE_URL}${cardListData.profilePhoto}`}
                        alt={cardListData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src="/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                        alt="Fallback"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
                      {cardListData.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-black truncate">
                      {cardListData.email}
                    </p>
                  </div>
                </div>

                {selectedHfid === cardListData.hfid && (
                  <form onSubmit={formik.handleSubmit} className="mt-3 sm:mt-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Password"
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.password}
                          className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500"
                        />
                        <FontAwesomeIcon
                          icon={showPassword ? faEye : faEyeSlash}
                          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm sm:text-base"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full sm:w-auto primary text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition"
                      >
                        Login
                      </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="text-red-600 text-xs sm:text-sm mt-1">{formik.errors.password}</div>
                    )}
                  </form>
                )}
              </div>

              {selectedHfid === cardListData.hfid && (
                <div
                  className="text-xs sm:text-sm font-bold text-blue-700 flex justify-end pr-1 sm:pr-2 cursor-pointer hover:text-blue-800 transition-colors"
                  onClick={() => {
                    if (!cardListData.email) {
                      toast.error("Email not found for this user.");
                      return;
                    }
                    handleForgotPassword(cardListData.email);
                  }}
                >
                  Forgot password
                </div>
              )}
            </div>

            {/* Team Members Section */}
            <h2 className="text-base sm:text-lg md:text-lg lg:text-xl font-semibold text-blue-700 mb-3 sm:mb-4 mt-4 sm:mt-6">
              Team Members
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {memberListData.map((user) => (
                <div key={user.userId}>
                  <div
                    className={`rounded-lg flex flex-col border p-3 sm:p-4 cursor-pointer transition-all duration-200 ${selectedHfid === user.hfid ? 'border-gray-300 bg-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => {
                      setSelectedHfid(user.hfid);
                      formik.setFieldValue("hfid", user.hfid);
                      formik.setFieldValue("role", user.role);
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gray-200 rounded-full border border-gray-300 overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                        {user.profilePhoto !== "No image preview available" ? (
                          <img
                            src={`${BASE_URL}${user.profilePhoto}`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src="/3d77b13a07b3de61003c22d15543e99c9e08b69b.jpg"
                            alt="Fallback"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
                          {user.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-black truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {selectedHfid === user.hfid && (
                      <form onSubmit={formik.handleSubmit} className="mt-3 sm:mt-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                          <div className="relative flex-1">
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              placeholder="Password"
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              value={formik.values.password}
                              className="w-full p-2 sm:p-2.5 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 bg-white focus:ring-blue-500"
                            />
                            <FontAwesomeIcon
                              icon={showPassword ? faEye : faEyeSlash}
                              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm sm:text-base"
                              onClick={() => setShowPassword(!showPassword)}
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full sm:w-auto primary text-white px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition"
                          >
                            Login
                          </button>
                        </div>
                        {formik.touched.password && formik.errors.password && (
                          <div className="text-red-600 text-xs sm:text-sm mt-1">{formik.errors.password}</div>
                        )}
                      </form>
                    )}
                  </div>

                  {selectedHfid === user.hfid && (
                    <div className="text-xs sm:text-sm font-bold text-blue-700 flex justify-end mt-1 pr-1 cursor-pointer hover:text-blue-800 transition-colors"
                      onClick={() => {
                        if (!user.email) {
                          toast.error("Email not found for this user.");
                          return;
                        }
                        handleForgotPassword(user.email);
                      }}>
                      Forgot password
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-4 md:p-4 lg:p-4 2xl:p-4 order-first lg:order-last">
          <h1 className="text-xl sm:text-sm md:text-sm lg:text-xl 2xl:text-xl font-bold text-blue-700 mb-3 sm:mb-4 md:mb-6 text-center leading-tight">
            Welcome back!
          </h1>
          <div className=" max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-md ">
            <img
              src="/f02ab4b2b4aeffe41f18ff4ece3c64bd20e9a0f4.png"
              alt="Welcome Illustration"
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-black text-center mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base lg:text-base 2xl:text-lg max-w-md lg:max-w-lg 2xl:max-w-xl leading-relaxed">
            It's good to have you back. Let's get started with your day.
          </p>
        </div>
      </div>

      <ToastContainer />
    </ClinicHome>
  );
};

export default AdminLogins;