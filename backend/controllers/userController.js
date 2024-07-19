import * as admin from "../util/firebase/config.js";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

export const setUsername = async (req, res) => {
  console.log("req received to completeSignup");
  const { username, photoId } = req.body;
  try {
    const userRef = db.collection("users").doc(req.uid);
    await userRef.set(
      {
        profileData: { username, profilePhoto: photoId || null },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  console.log("req recieved to getUser");
  try {
    const userRef = db.collection("users").doc(req.uid);
    const userData = (await userRef.get()).data();
    return res.status(200).json({ userData });
  } catch (error) {
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
        otherUsers.push({
          id,
          username: doc.data().profileData.username,
          profilePhoto: doc.data().profileData.profilePhoto,
          bio: doc.data().profileData.bio,
        });
      }
    });
    return res.status(200).json({ otherUsers });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
