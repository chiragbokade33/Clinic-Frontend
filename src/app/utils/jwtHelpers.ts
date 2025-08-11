// utils/jwtHelpers.ts

export interface DecodedTokenData {
  LabAdminId?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export const decodeJWT = (token: string): DecodedTokenData | null => {
  if (!token || token === "" || token === "undefined") {
    console.log("No valid token provided for decoding");
    return null;
  }

  try {
    // Split the token and get the payload part
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error("Invalid JWT format");
      return null;
    }

    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the base64 payload
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decodedData: DecodedTokenData = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (decodedData.exp && decodedData.exp < Math.floor(Date.now() / 1000)) {
      console.warn("Token has expired");
      return null;
    }
    
    return decodedData;
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
};

/**
 * Decodes JWT token and stores relevant data in localStorage
 * @param token - The JWT token to decode and store
 * @returns Promise<boolean> - Success status
 */
export const decodeAndStoreJWT = async (token: string): Promise<boolean> => {
  const decodedData = decodeJWT(token);
  
  if (!decodedData) {
    return false;
  }

  try {
    // Store the decoded data in localStorage
    if (decodedData.LabAdminId) {
      localStorage.setItem("LabAdminId", decodedData.LabAdminId);
    }
    
    if (decodedData.role) {
      localStorage.setItem("role", decodedData.role);
    }
    
    console.log("JWT data stored successfully:", {
      LabAdminId: decodedData.LabAdminId,
      role: decodedData.role
    });
    
    return true;
  } catch (error) {
    console.error("Error storing JWT data:", error);
    return false;
  }
};

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @returns boolean - True if expired, false if valid
 */
export const isTokenExpired = (token: string): boolean => {
  const decodedData = decodeJWT(token);
  
  if (!decodedData || !decodedData.exp) {
    return true; // Consider invalid tokens as expired
  }
  
  return decodedData.exp < Math.floor(Date.now() / 1000);
};

/**
 * Gets the remaining time until token expiration
 * @param token - The JWT token to check
 * @returns number - Remaining seconds until expiration, or 0 if expired/invalid
 */
export const getTokenExpirationTime = (token: string): number => {
  const decodedData = decodeJWT(token);
  
  if (!decodedData || !decodedData.exp) {
    return 0;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const remainingTime = decodedData.exp - currentTime;
  
  return Math.max(0, remainingTime);
};