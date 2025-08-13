import axios from "axios";
import { endPoints } from "../apiEndPoints";
import { Asul } from "next/font/google";
import axiosInstance from "../utils/axiosClient";


// SignUp Clinic 

export const SignUp = async (payloade: any) => {
  return axios.post(`${endPoints.Clinc_SignUP.Add_SignUp}`, payloade);
};

export const OTPSignUp = async (payloade:any) =>{
    return axios.post(`${endPoints.Clinc_SignUP.SignUp_OTP}`, payloade)
}

// login Clinic 

export const PhoneLoginEmail = async (payloade:any) =>{
    return axios.post(`${endPoints.Clinic_Login.PhoneEmailLogin}`, payloade)
}

export const LoginPassword = async (payloade:any) =>{
    return axios.post(`${endPoints.Clinic_Login.PassswordLogin}`,payloade)
}

export const LoginWithOtp = async (payloade:any) =>{
    return axios.post(`${endPoints.Clinic_Login.OTPLogin}`, payloade)
}

//  Admin create 

export const CreateAdmin = async (Payloade:any) =>{
    return axios.post(`${endPoints.SuperAdminCreate.AdminCreate}`, Payloade)
}

export const HfidCheck = async (hfid:any) =>{
    return axios.post(`${endPoints.SuperAdminCreate.HFID}`,hfid)
}

export const LoginUser = async (payloade:any) =>{
    return axios.post(`${endPoints.SuperAdminCreate.UserLogin}`, payloade)
}

export const ListUser = async (userId:number) =>{
    return axios.get(endPoints.SuperAdminCreate.ClinicUserList(userId))
}



// HFID Sidebar 

export const HfidSidebar = async (email:string) =>{
    return axiosInstance.get(`${endPoints.ClinicHFid.SideHfid}?email=${email}`)
}

// Member add 

export const AddMember = async (payloade:any) =>{
    return axiosInstance.post(`${endPoints.ADDMember.CreateMember}`, payloade)
}