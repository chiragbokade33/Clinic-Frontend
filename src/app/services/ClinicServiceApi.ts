import axios from "axios";
import { endPoints } from "../apiEndPoints";
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

export const PromoteSuperAdmin = async (memberId: number) =>{
    return axiosInstance.post(`${endPoints.ADDMember.SuperAdminPromote}`, { memberId })
}

export const PromoteAdmin = async (data:any) => {
    return axiosInstance.post(`${endPoints.ADDMember.AdminPromote}`,data)
}

export const DeleteMember = async (memberId:number) => {
    return axiosInstance.put(`${endPoints.ADDMember.RemoveMemberAdmin}/${memberId}`)
}
// profile Update 

export const UpdateProfile = async (formData: FormData) =>{
    return axiosInstance.patch(`${endPoints.ClinicProfile.ProfileUpdate}`,formData)
}

// Clinic Branches 

export const ListBranchData = async () =>{
    return axiosInstance.get(`${endPoints.ClinicBranch.Clinics}`)
}

export const Pincode = async (pincode:string) => {
  return axiosInstance.get(`${endPoints.ClinicBranch.PINCODE}/${pincode}`);
}

export const CreateBranch = async (data:any) => {
 return axiosInstance.post(`${endPoints.ClinicBranch.BranchCreate}`, data)
}

export const DeleteBranch = async (branchId:number) => {
  return axiosInstance.put(`${endPoints.ClinicBranch.DeleteBranch}/${branchId}`);
}

export const OTpVeirfyBranch = async (payloade:any) => {
    return axiosInstance.post(`${endPoints.ClinicBranch.BranchOTPVerify}`,payloade)
}