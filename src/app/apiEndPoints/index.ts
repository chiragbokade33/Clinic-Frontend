// Api EndPoints

export const API_CLINIC_DATA = "https://localhost:7227/api/";



export const endPoints = {
    Clinc_SignUP: {
        Add_SignUp: API_CLINIC_DATA + "clinics",
        SignUp_OTP: API_CLINIC_DATA + "clinics/signup/otp"
    },
    Clinic_Login: {
        PhoneEmailLogin: API_CLINIC_DATA + "clinics/login",
        PassswordLogin: API_CLINIC_DATA + "clinics/login/password",
        OTPLogin: API_CLINIC_DATA + "clinics/login/otp"
    },
    SuperAdminCreate: {
        AdminCreate: API_CLINIC_DATA + "clinics/super-admins",
        HFID: API_CLINIC_DATA + "users/hfid",
        UserLogin: API_CLINIC_DATA + "clinics/users/login",
        ClinicUserList: (userId: number) => `${API_CLINIC_DATA}clinics/${userId}/users`
    },
    ClinicHFid: {
        SideHfid: API_CLINIC_DATA + "clinics/hfid"
    },

    ADDMember: {
        CreateMember: API_CLINIC_DATA + "clinics/members",
        SuperAdminPromote :API_CLINIC_DATA +"clinics/admin/promote",
        AdminPromote :API_CLINIC_DATA + "clinics/members/promote",
        RemoveMemberAdmin : API_CLINIC_DATA +"clinics/members"
    },
    ClinicProfile :{
        ProfileUpdate : API_CLINIC_DATA +"clinics/update"
    },
    ClinicBranch :{
        Clinics : API_CLINIC_DATA +"clinics",
        PINCODE : API_CLINIC_DATA + "labs/branches",
        BranchCreate : API_CLINIC_DATA + "clinics/branches",
        DeleteBranch : API_CLINIC_DATA +"clinics/branches",
        BranchOTPVerify : API_CLINIC_DATA + "clinics/branches/verify/otp"
    },

    ForgotPassword : {
        AdminForgot: API_CLINIC_DATA +"clinics/password-reset/request",
        OTPVerify: API_CLINIC_DATA +"clinics/password-reset/verify/otp",
        ResetPassword :  API_CLINIC_DATA + "clinics/password-reset",
        UserForgot : API_CLINIC_DATA + "clinics/users/password-reset/request",
        UserPassword : API_CLINIC_DATA + "clinics/users/password-reset"
    },

    RevertBranchMember : {
        DeleteBranch : API_CLINIC_DATA + "clinics/deleted-branches",
        revertBranch : API_CLINIC_DATA + "clinics/revert-branch",
        MemberList : (clinicId:number) => `${API_CLINIC_DATA}clinics/${clinicId}/deleted-users`,
        Revertmember: API_CLINIC_DATA + "clinics/revert-user",
        ParmanetDelete: API_CLINIC_DATA +"clinics/remove-user"
    },

    Appointments :{
        Addappointments : API_CLINIC_DATA + "appointments"
    }
};