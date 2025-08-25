// Api EndPoints

export const API_CLINIC_DATA = "https://localhost:7227/api/";
// export const API_CLINIC_DATA = "https://hfileslabnetcorenextjsbackend-production.up.railway.app/api/";



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
        Addappointments : API_CLINIC_DATA + "appointments",
        AppointmentList : API_CLINIC_DATA + "appointments/clinic",
        FollowUp : (clinicId:number) => `${API_CLINIC_DATA}appointments/clinics/${clinicId}/follow-up`,
        VerifyHFID : API_CLINIC_DATA + "users/hfid",
        UpdateAppoinment: (clinicId:number ,appointmentId:number) =>`${API_CLINIC_DATA}appointments/clinic/${clinicId}/appointment/${appointmentId }/status`,
        PatientList : (clinicId:number) => `${API_CLINIC_DATA}appointments/clinics/${clinicId}/patients`,
        BookAppoinment : (clinicId:number) => `${API_CLINIC_DATA}appointments/clinics/${clinicId}/appointments/follow-up`
    },

    ConsentForm : {
        ConsentList : API_CLINIC_DATA + "consent/forms",
        PublicConsent : API_CLINIC_DATA + "consent",
        VerifyConsent : (visitConsentFormId :number) => `${API_CLINIC_DATA}consent/${visitConsentFormId }/verify`,
        Profile: API_CLINIC_DATA + "patient/details",
        AttechImges : API_CLINIC_DATA + "clinic/patient/records/upload"
    },

    TreatmentPlane : {
        AddTreatment : API_CLINIC_DATA + "clinic/treatment",
        GetDetailsTreaatment : (clinicId:number) => `${API_CLINIC_DATA}clinic/${clinicId}/treatments`,
        updateTreatment : (clinicId:number,treatmentId:number) =>`${API_CLINIC_DATA}clinic/${clinicId}/treatment/${treatmentId}`

    },

    CommonAddJson : {
        AddJson : API_CLINIC_DATA + "clinic/patient/records",
        GetJsonDataList : (clinicId:number,patientId:number,clinicVisitId:number) => `${API_CLINIC_DATA}clinic/${clinicId}/patient/${patientId}/visit/${clinicVisitId}/records`,
        FinalUploade : API_CLINIC_DATA + "clinic/patient/documents/upload"
    },

    Prescrition :{
        AddPrescripation : API_CLINIC_DATA + "clinic/prescription",
        GetPrescripationList : (clinicId:number) => `${API_CLINIC_DATA}clinic/${clinicId}/prescriptions`,
        PrescriptionClinic : (clinicId:number, prescriptionId :number) => `${API_CLINIC_DATA}clinic/${clinicId}/prescription/${prescriptionId}`
    } 
};