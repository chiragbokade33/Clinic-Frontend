import { decryptData } from "../utils/cryptoHelpers";

export  const getUserId = async (): Promise<number> => {
    try {
      const encryptedUserId = localStorage.getItem("userId");
      if (!encryptedUserId) {
        return 0;
      }
      const userIdStr = await decryptData(encryptedUserId);
      return parseInt(userIdStr, 10);
    } catch (error) {
      console.error("Error getting userId:", error);
      return 0;
    }
  };


export const getEmailId = async (): Promise<string> => {
  try {
    const encryptedEmail = localStorage.getItem("emailId");
    if (!encryptedEmail) {
      return "";
    }
    const emailStr = await decryptData(encryptedEmail);
    return emailStr; // keep it as string
  } catch (error) {
    console.error("Error getting email:", error);
    return "";
  }
};



export const getToken = async (): Promise<string> => {
  try {
    const encryptedToken = localStorage.getItem("authToken");
    if (!encryptedToken) {
      return "";
    }
    const tokenStr = await decryptData(encryptedToken);
    return tokenStr; // keep it as string
  } catch (error) {
    console.error("Error getting email:", error);
    return "";
  }
};