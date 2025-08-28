import axios from "axios";
import { endPoints } from "../apiEndPoints";
import axiosInstance from "../utils/axiosClient";


// SignUp Clinic 

export const SignUp = async (payloade: any) => {
    return axios.post(`${endPoints.Clinc_SignUP.Add_SignUp}`, payloade);
};

export const OTPSignUp = async (payloade: any) => {
    return axios.post(`${endPoints.Clinc_SignUP.SignUp_OTP}`, payloade)
}

// login Clinic 

export const PhoneLoginEmail = async (payloade: any) => {
    return axios.post(`${endPoints.Clinic_Login.PhoneEmailLogin}`, payloade)
}

export const LoginPassword = async (payloade: any) => {
    return axios.post(`${endPoints.Clinic_Login.PassswordLogin}`, payloade)
}

export const LoginWithOtp = async (payloade: any) => {
    return axios.post(`${endPoints.Clinic_Login.OTPLogin}`, payloade)
}

//  Admin create 

export const CreateAdmin = async (Payloade: any) => {
    return axios.post(`${endPoints.SuperAdminCreate.AdminCreate}`, Payloade)
}

export const HfidCheck = async (hfid: any) => {
    return axios.post(`${endPoints.SuperAdminCreate.HFID}`, hfid)
}

export const LoginUser = async (payloade: any) => {
    return axios.post(`${endPoints.SuperAdminCreate.UserLogin}`, payloade)
}

export const ListUser = async (userId: number) => {
    return axios.get(endPoints.SuperAdminCreate.ClinicUserList(userId))
}



// HFID Sidebar 

export const HfidSidebar = async (email: string) => {
    return axiosInstance.get(`${endPoints.ClinicHFid.SideHfid}?email=${email}`)
}

// Member add 

export const AddMember = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.ADDMember.CreateMember}`, payloade)
}

export const PromoteSuperAdmin = async (memberId: number) => {
    return axiosInstance.post(`${endPoints.ADDMember.SuperAdminPromote}`, { memberId })
}

export const PromoteAdmin = async (data: any) => {
    return axiosInstance.post(`${endPoints.ADDMember.AdminPromote}`, data)
}

export const DeleteMember = async (memberId: number) => {
    return axiosInstance.put(`${endPoints.ADDMember.RemoveMemberAdmin}/${memberId}`)
}
// profile Update 

export const UpdateProfile = async (formData: FormData) => {
    return axiosInstance.patch(`${endPoints.ClinicProfile.ProfileUpdate}`, formData)
}

// Clinic Branches 

export const ListBranchData = async () => {
    return axiosInstance.get(`${endPoints.ClinicBranch.Clinics}`)
}

export const Pincode = async (pincode: string) => {
    return axiosInstance.get(`${endPoints.ClinicBranch.PINCODE}/${pincode}`);
}

export const CreateBranch = async (data: any) => {
    return axiosInstance.post(`${endPoints.ClinicBranch.BranchCreate}`, data)
}

export const DeleteBranch = async (branchId: number) => {
    return axiosInstance.put(`${endPoints.ClinicBranch.DeleteBranch}/${branchId}`);
}

export const OTpVeirfyBranch = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.ClinicBranch.BranchOTPVerify}`, payloade)
}

// Forgot password

export const ForgotPasswordReq = async (data: any) => {
    return axiosInstance.post(`${endPoints.ForgotPassword.AdminForgot}`, data)
}

export const UserOTPVerify = async (data: any) => {
    return axiosInstance.post(`${endPoints.ForgotPassword.OTPVerify}`, data)
}

export const passwordForgot = async (data: any) => {
    return axiosInstance.put(`${endPoints.ForgotPassword.ResetPassword}`, data)
}

export const UserForgotPassword = async (data: any) => {
    return axiosInstance.post(`${endPoints.ForgotPassword.UserForgot}`, data)
}

export const ForgotPasswordUser = async (data: any) => {
    return axiosInstance.put(`${endPoints.ForgotPassword.UserPassword}`, data)
}


// Revert Branch ANd MEmber

export const DeleteBrnaches = async () => {
    return axiosInstance.get(`${endPoints.RevertBranchMember.DeleteBranch}`)
}

export const RevertBranch = async (data: any) => {
    return axiosInstance.patch(`${endPoints.RevertBranchMember.revertBranch}`, data)
}

export const GetMemberList = async (clinicId: number) => {
    return axiosInstance.get(`${endPoints.RevertBranchMember.MemberList(clinicId)}`);
}

export const RevertUser = async (data: any) => {
    return axiosInstance.patch(`${endPoints.RevertBranchMember.Revertmember}`, data);
}

export const RemoveUserList = async (data: any) => {
    return axiosInstance.delete(`${endPoints.RevertBranchMember.ParmanetDelete}`, {
        data: data,
    });
}


// Appointments 

export const CreateAppointments = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.Appointments.Addappointments}`, payloade)
}

export const ListAppointment = async (
    clinicId: number,
    startDate?: string,
    endDate?: string
) => {
    return axiosInstance.get(
        `${endPoints.Appointments.AppointmentList}/${clinicId}`,
        {
            params: {
                startDate,
                endDate,
            },
        }
    );
};


export const AddFolllowUp = async (clinicId: number, payloade: any) => {
    return axiosInstance.post(`${endPoints.Appointments.FollowUp(clinicId)}`, payloade)
}

export const HFID = async (paylaode: any) => {
    return axiosInstance.post(`${endPoints.Appointments.VerifyHFID}`, paylaode)
}

export const AppoinmentUpdate = async (clinicId: number, appointmentId: number, payloade: any) => {
    return axiosInstance.put(`${endPoints.Appointments.UpdateAppoinment(clinicId, appointmentId)}`, payloade)
}

export const ListPatients = async (clinicId: number, startDate?: string, endDate?: string) => {
    const params: any = {};

    if (startDate) {
        params.startDate = startDate;
    }

    if (endDate) {
        params.endDate = endDate;
    }

    return axiosInstance.get(`${endPoints.Appointments.PatientList(clinicId)}`, {
        params
    });
}

export const BookFolllowUp = async (clinicId: number, payloade: any) => {
    return axiosInstance.post(`${endPoints.Appointments.BookAppoinment(clinicId)}`, payloade)
}


// Consent forms details 

export const Listconsent = async (clinicId: number, payload: any) => {
    return axiosInstance.post(
        `${endPoints.ConsentForm.ConsentList}/${clinicId}`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
};

// api call
export const AddPdfPublic = async (visitConsentFormId: number, payload: { ConsentFormTitle: string; PdfFile: File }) => {
    const formData = new FormData();
    formData.append("ConsentFormTitle", payload.ConsentFormTitle);
    formData.append("PdfFile", payload.PdfFile); // must be File or Blob

    return axios.post(
        `${endPoints.ConsentForm.PublicConsent}/${visitConsentFormId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

export const ListProfile = async (hfId: any) => {
    return axiosInstance.get(`${endPoints.ConsentForm.Profile}?hfId=${hfId}`)
}


export const ConsentVerify = async (visitConsentFormId: number, consentFormTitle: number) => {
    return axiosInstance.put(`${endPoints.ConsentForm.VerifyConsent(visitConsentFormId)}?consentFormTitle=${consentFormTitle}`)
}

export const Uploaebulk = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.ConsentForm.AttechImges}`, payloade)
}


// Treament plane 

export const Treatment = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.TreatmentPlane.AddTreatment}`, payloade)
}

export const ListTreatemnet = async (clinicId: number) => {
    return axiosInstance.get(`${endPoints.TreatmentPlane.GetDetailsTreaatment(clinicId)}`)
}

export const UpdateData = async (clinicId: number, treatmentId: number, payloade: any) => {
    return axiosInstance.patch(`${endPoints.TreatmentPlane.updateTreatment(clinicId, treatmentId)}`, payloade)
}


// Common Json Add 

export const JsonAdded = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.CommonAddJson.AddJson}`, payloade)
}

export const ListJsondata = async (clinicId: number, patientId: number, clinicVisitId: number) => {
    return axiosInstance.get(`${endPoints.CommonAddJson.GetJsonDataList(clinicId, patientId, clinicVisitId)}`)
}
// api.ts
export const UploadeallData = async (payload: FormData) => {
    try {
        console.log("🚀 Sending request to:", endPoints.CommonAddJson.FinalUploade);

        const response = await axiosInstance.post(
            `${endPoints.CommonAddJson.FinalUploade}`,
            payload
            // Don't set Content-Type header - let browser handle it with boundary
        );

        return response;
    } catch (error: any) {
        console.error("API Error Details:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
        });

        throw error;
    }
};


export const HistoryList = async (clinicId: number, patientId: number) => {
    return axiosInstance.get(`${endPoints.CommonAddJson.ClinicHistory(clinicId, patientId)}`)
}


//  Prescripation Added

export const AddPrescripation = async (payloade: any) => {
    return axiosInstance.post(`${endPoints.Prescrition.AddPrescripation}`, payloade)
}

export const GetListData = async (clinicId: number) => {
    return axiosInstance.get(`${endPoints.Prescrition.GetPrescripationList(clinicId)}`)
}

export const UpdatePrescipation = async (clinicId: number, prescriptionId: number, payloade: any) => {
    return axiosInstance.patch(`${endPoints.Prescrition.PrescriptionClinic(clinicId, prescriptionId)}`, payloade)
}

// MEdicalHistory 

export const ListMedical = async (clinicId: number, patientId: number) => {
    return axiosInstance.get(`${endPoints.ClinicMedicalHistory.GetMedicalList(clinicId, patientId)}`)
}