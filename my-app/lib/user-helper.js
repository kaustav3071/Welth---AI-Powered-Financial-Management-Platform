"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

/**
 * Get or create a user in the database based on Clerk authentication
 * This is a centralized function to ensure consistent user handling
 * 
 * @param {Object} options - Options for user retrieval
 * @param {boolean} options.createIfMissing - Whether to create user if not found (default: true)
 * @param {boolean} options.useCurrentUser - Use currentUser() instead of auth() (default: false)
 * @returns {Promise<Object|null>} User object or null if not authenticated
 * @throws {Error} If user creation fails or required data is missing
 */
export async function getOrCreateUser({ createIfMissing = true, useCurrentUser = false } = {}) {
  try {
    // Get Clerk user data
    let clerkUserId;
    let clerkUserData;

    if (useCurrentUser) {
      // Use currentUser() for cases where we need full user data
      clerkUserData = await currentUser();
      if (!clerkUserData) {
        return null;
      }
      clerkUserId = clerkUserData.id;
    } else {
      // Use auth() for most cases (faster)
      const authData = await auth();
      clerkUserId = authData.userId;
      if (!clerkUserId) {
        return null;
      }
    }

    // Try to find existing user
    let user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (user) {
      return user;
    }

    // User doesn't exist - create if allowed
    if (!createIfMissing) {
      return null;
    }

    // If we used auth(), we need to get full user data for creation
    if (!clerkUserData) {
      clerkUserData = await currentUser();
      if (!clerkUserData) {
        throw new Error("Unable to retrieve Clerk user data for user creation");
      }
    }

    // Safely extract user data with fallbacks
    const firstName = clerkUserData.firstName || "";
    const lastName = clerkUserData.lastName || "";
    const name = [firstName, lastName].filter(Boolean).join(" ").trim() || "User";
    
    // Safely get email
    const emailAddresses = clerkUserData.emailAddresses || [];
    if (emailAddresses.length === 0) {
      throw new Error("User email is required but not found in Clerk data");
    }
    const email = emailAddresses[0].emailAddress;

    // Create new user
    try {
      user = await db.user.create({
        data: {
          clerkUserId,
          name,
          email,
          imageUrl: clerkUserData.imageUrl || null,
        },
      });

      return user;
    } catch (createError) {
      // Handle specific database errors
      if (createError.code === "P2002") {
        // Unique constraint violation - user might have been created by another request
        // Try to fetch again
        user = await db.user.findUnique({
          where: { clerkUserId },
        });
        if (user) {
          return user;
        }
        throw new Error("User already exists but could not be retrieved");
      }
      
      // Re-throw with more context
      throw new Error(`Failed to create user: ${createError.message}`);
    }
  } catch (error) {
    console.error("Error in getOrCreateUser:", {
      message: error.message,
      stack: error.stack,
      ...(process.env.NODE_ENV === "development" && { error }),
    });
    throw error;
  }
}

/**
 * Get authenticated user (throws error if not found)
 * Use this in server actions where user must exist
 * 
 * @returns {Promise<Object>} User object
 * @throws {Error} If user is not authenticated or not found
 */
export async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await getOrCreateUser({ createIfMissing: true });
  if (!user) {
    throw new Error("User not found. Please try signing in again.");
  }

  return user;
}

