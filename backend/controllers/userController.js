import * as admin from "../util/firebase/config.js";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

/**
 * Checks if a username already exists in the database
 * @param {string} username - The username to check
 * @returns {Promise<boolean>} True if username exists, false otherwise
 */
const checkDuplicateUsername = async (username) => {
  const usersRef = db
    .collection("users")
    .where("profileData.username", "==", username);
  const snapshot = await usersRef.get();
  return !snapshot.empty;
};

/**
 * Updates a user's profile information
 * @param {Object} req - Request object containing bio, username and/or profilePhotoUrl
 * @param {Object} res - Response object
 * @returns {Object} Updated user data or error message
 */
export const updateProfile = async (req, res) => {
  console.log("Request received to update profile");
  const { bio, username, profilePhotoUrl } = req.body;
  
  try {
    const userRef = db.collection("users").doc(req.uid);
    const updateData = { 
      updatedAt: FieldValue.serverTimestamp(),
      profileData: {}
    };

    // Handle bio update
    if (bio?.trim()) {
      updateData.profileData.bio = bio.trim();
    }

    // Handle username update
    if (username?.trim()) {
      const isDuplicate = await checkDuplicateUsername(username.trim());
      if (isDuplicate) {
        return res.status(409).json({ message: "Username already exists" });
      }
      updateData.profileData.username = username.trim();
    }

    // Handle profile photo update
    if (profilePhotoUrl) {
      updateData.profileData.profilePhotoUrl = profilePhotoUrl;
    }

    await userRef.set(updateData, { merge: true });
    const userData = (await userRef.get()).data();
    
    return res.status(200).json({ userData });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Sets initial username and profile for a new user
 * @param {Object} req - Request object containing username and optional photoId
 * @param {Object} res - Response object
 * @returns {Object} Success message or error
 */
export const setUsername = async (req, res) => {
  console.log("Request received to complete signup");
  const { username, photoId } = req.body;

  try {
    if (!username?.trim()) {
      return res.status(400).json({ message: "Username is required" });
    }

    const isDuplicate = await checkDuplicateUsername(username.trim());
    if (isDuplicate) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const userRef = db.collection("users").doc(req.uid);
    await userRef.set({
      blockedBy: [],
      connections: {},
      profileData: {
        username: username.trim(),
        profilePhoto: photoId || null,
        bio: "I am a vibe user, I bring the vibe.",
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.status(200).json({ message: "Profile setup successful" });
  } catch (error) {
    console.error("Error setting username:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Gets user data and updates online status
 * @param {Object} req - Request object containing user ID
 * @param {Object} res - Response object
 * @returns {Object} User data or error message
 */
export const getUser = async (req, res) => {
  console.log("Request received to get user");
  try {
    const userRef = db.collection("users").doc(req.uid);
    
    // Update online status
    await userRef.set({
      onlineStatus: true,
      lastOnline: FieldValue.serverTimestamp(),
    }, { merge: true });

    const userData = (await userRef.get()).data();
    return res.status(200).json({ userData });
  } catch (error) {
    console.error("Error getting user:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Gets list of all other users except requesting user
 * @param {Object} req - Request object containing user ID
 * @param {Object} res - Response object
 * @returns {Object} Array of other users or error message
 */
export const getOtherUsers = async (req, res) => {
  console.log("Request received to get other users");
  try {
    const usersSnapshot = await db.collection("users").get();
    const otherUsers = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.id !== req.uid && userData.profileData?.username) {
        otherUsers.push({
          id: userData.id,
          username: userData.profileData.username,
          profilePhoto: userData.profileData.profilePhoto,
          onlineStatus: userData.onlineStatus,
          bio: userData.profileData.bio,
          connections: userData.connections || {},
          blockedBy: userData.blockedBy || [],
        });
      }
    });

    return res.status(200).json({ otherUsers });
  } catch (error) {
    console.error("Error getting other users:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Gets all chats initiated by the user with friends
 * @param {Object} req - Request object containing user ID
 * @param {Object} res - Response object
 * @returns {Object} Array of user's chats or error message
 */
export const getUserChats = async (req, res) => {
  console.log("Request received to get user chats");
  try {
    // Get chats where user is initiator
    const userChatQuery = db
      .collection("chats")
      .where("participants", "array-contains", req.uid)
    
    const querySnapshot = await userChatQuery.get();
    console.log(querySnapshot.docs);
    const chats = [];

    // Get user's connections
    const userDoc = await db.collection("users").doc(req.uid).get();
    const userConnections = userDoc.data().connections || {};

    // Process each chat
    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      const otherParticipantId = chatData.participants.find(id => id !== req.uid);

      // Only include chats with friends
      if (userConnections[otherParticipantId] !== "friends") {
        continue;
      }

      // Get other participant's data
      const participantDoc = await db.collection("users").doc(otherParticipantId).get();
      const participantData = {
        username: participantDoc.data().profileData.username,
        profilePhoto: participantDoc.data().profileData.profilePhoto,
        onlineStatus: participantDoc.data().onlineStatus,
        id: participantDoc.data().id,
        connections: participantDoc.data().connections || {},
      };

      chats.push({
        ...chatData,
        chatId: doc.id,
        participantsData: participantData,
      });
    }

    return res.status(200).json({ chats });
  } catch (error) {
    console.error("Error getting user chats:", error);
    return res.status(500).json({ message: "Error fetching chats" });
  }
};

/**
 * Gets all pending chat requests for the user
 * @param {Object} req - Request object containing user ID
 * @param {Object} res - Response object
 * @returns {Object} Array of chat requests or error message
 */
export const getChatRequests = async (req, res) => {
  console.log("Request received to get chat requests");
  try {
    // Get user's connections
    const userDoc = await db.collection("users").doc(req.uid).get();
    const userConnections = userDoc.data().connections || {};

    // Get all chats where user is a participant
    const chatRequestQuery = db
      .collection("chats")
      .where("participants", "array-contains", req.uid);
      
    const querySnapshot = await chatRequestQuery.get();
    const chatRequests = [];

    // Process each chat
    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      
      // Skip if user initiated, chat is accepted, or participants are friends
      if (chatData.initiatedBy === req.uid || chatData.isFriend) {
        continue;
      }

      const otherParticipantId = chatData.participants.find(id => id !== req.uid);

      // Skip if connection already exists
      if (userConnections[otherParticipantId]) {
        continue;
      }

      // Get other participant's data
      const participantDoc = await db.collection("users").doc(otherParticipantId).get();
      const participantData = {
        username: participantDoc.data().profileData.username,
        profilePhoto: participantDoc.data().profileData.profilePhoto,
        onlineStatus: participantDoc.data().onlineStatus,
        id: participantDoc.data().id,
      };

      chatRequests.push({
        ...chatData,
        chatId: doc.id,
        participantsData: participantData,
      });
    }

    return res.status(200).json({ chatRequests });
  } catch (error) {
    console.error("Error getting chat requests:", error);
    return res.status(500).json({ message: "Error fetching chat requests" });
  }
};

/**
 * Unblocks a previously blocked user
 * @param {Object} req - Request object containing userToUnblockId
 * @param {Object} res - Response object
 * @returns {Object} Success message or error
 */
export const unblockUser = async (req, res) => {
  console.log("Request received to unblock user");
  const { userToUnblockId } = req.body;
  const userId = req.uid;

  try {
    const batch = db.batch();
    const userRef = db.collection("users").doc(userId);
    const blockedUserRef = db.collection("users").doc(userToUnblockId);

    // Get current user's data
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update connections for current user
    batch.update(userRef, {
      connections: {
        ...userDoc.data().connections,
        [userToUnblockId]: null
      }
    });

    // Remove current user from blocked user's blockedBy array
    batch.update(blockedUserRef, {
      blockedBy: FieldValue.arrayRemove(userId)
    });

    await batch.commit();
    return res.status(200).json({ message: "User unblocked successfully" });

  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({ message: "Error unblocking user" });
  }
};

/**
 * Blocks a user and updates both users' data
 * @param {Object} req - Request object containing userToBlockId
 * @param {Object} res - Response object
 * @returns {Object} Success message or error
 */
export const blockUser = async (req, res) => {
  console.log("Request received to block user");
  const { userToBlockId } = req.body;
  const userId = req.uid;

  try {
    const batch = db.batch();
    const userRef = db.collection("users").doc(userId);
    const blockedUserRef = db.collection("users").doc(userToBlockId);

    // Get current user's data
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update connections for current user to mark blocked user
    batch.update(userRef, {
      connections: {
        ...userDoc.data().connections,
        [userToBlockId]: "blocked"
      }
    });

    // Add current user to blocked user's blockedBy array
    batch.update(blockedUserRef, {
      blockedBy: FieldValue.arrayUnion(userId)
    });

    await batch.commit();
    return res.status(200).json({ message: "User blocked successfully" });

  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({ message: "Error blocking user" });
  }
};
