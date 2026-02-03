import { getOrCreateUser } from "./user-helper";

/**
 * Legacy checkUser function - now uses centralized getOrCreateUser
 * Maintained for backward compatibility with existing API routes
 * 
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export const checkUser = async () => {
  try {
    return await getOrCreateUser({ createIfMissing: true, useCurrentUser: true });
  } catch (error) {
    console.error("Error in checkUser:", error.message);
    // Return null instead of throwing to maintain backward compatibility
    return null;
  }
};