import * as admin from "../util/firebase/config.js";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

const checkDuplicateUsername = async (username) => {
  const usersRef = db
    .collection("users")
    .where("profileData.username", "==", username);
  const snapshot = await usersRef.get();
  if (snapshot.empty) {
    return false;
  }
  return true;
};

export const updateProfile = async (req, res) => {
  console.log("Req received to updateProfile");
  const { bio, username, profilePhotoUrl } = req.body;
  try {
    const userRef = db.collection("users").doc(req.uid);
    let updateData = { updatedAt: FieldValue.serverTimestamp() };

    if (bio) {
      updateData.profileData = { ...updateData.profileData, bio: bio.trim() };
    }

    if (username) {
      if (await checkDuplicateUsername(username)) {
        return res.status(409).json({ message: "Username already exists" });
      } else {
        updateData.profileData = {
          ...updateData.profileData,
          username: username.trim(),
        };
      }
    }

    if (profilePhotoUrl) {
      updateData.profileData = { ...updateData.profileData, profilePhotoUrl };
    }

    await userRef.set(updateData, { merge: true });

    const userData = (await userRef.get()).data();
    return res.status(200).json({ userData });
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setUsername = async (req, res) => {
  console.log("req received to completeSignup");
  const { username, photoId } = req.body;
  try {
    if (checkDuplicateUsername(username)) {
      return res.status(409).json({ message: "Username already exists" });
    } else {
      const userRef = db.collection("users").doc(req.uid);
      await userRef.set(
        {
          profileData: {
            username: username.trim(),
            profilePhoto: photoId || null,
            bio: "I am a vibe user, i bring the vibe.",
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  console.log("req recieved to getUser");
  try {
    const userRef = db.collection("users").doc(req.uid);
    await userRef.set(
      {
        onlineStatus: true,
        lastOnline: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    const userData = (await userRef.get()).data();
    return res.status(200).json({ userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getOtherUsers = async (req, res) => {
  console.log("req received to getOtherUsers");
  const otherUsers = [];
  try {
    const usersSnapshot = await db.collection("users").get();
    usersSnapshot.forEach((doc) => {
      if (doc.data().id != req.uid) {
        if (doc.data().profileData.username) {
          otherUsers.push({
            id: doc.data().id,
            username: doc.data().profileData.username,
            profilePhoto: doc.data().profileData.profilePhoto,
            onlineStatus: doc.data().onlineStatus,
            bio: doc.data().profileData.bio,
          });
        }
      }
    });
    return res.status(200).json({ otherUsers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserChats = async (req, res) => {
  console.log("req received to getuserchats");
  try {
    const userChatQuery = db
      .collection("chats")
      .where("participants", "array-contains", req.uid);
    const querySnapshot = await userChatQuery.get();
    const chats = [];

    for (const doc of querySnapshot.docs) {
      const chatData = doc.data();
      const chatId = doc.id;
      const otherParticipant = chatData.participants.filter(
        (id) => id != req.uid
      );
      const participantsDataPromise = otherParticipant.map(
        async (participantId) => {
          const userDoc = await db.collection("users").doc(participantId).get();
          return {
            username: userDoc.data().profileData.username,
            profilePhoto: userDoc.data().profileData.profilePhoto,
            onlineStatus: userDoc.data().onlineStatus,
            id: userDoc.data().id,
          };
        }
      );
      const participantsData = await Promise.all(participantsDataPromise);

      chats.push({
        ...chatData,
        chatId,
        participantsData: { ...participantsData[0] },
      });
    }

    return res.status(200).json({ chats });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chats" });
  }
};
