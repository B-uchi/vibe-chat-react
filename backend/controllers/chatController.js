import * as admin from "../util/firebase/config.js";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

export const createChat = async (req, res) => {
  console.log("Request received to create chat");
  const { otherUserId } = req.body;
  const userId = req.uid;

  try {
    const chatQuerySnapshot = await db
      .collection("chats")
      .where("participants", "array-contains", userId)
      .get();

    let chatExists = false;
    let existingChatId = null;

    for (const doc of chatQuerySnapshot.docs) {
      const participants = doc.data().participants;
      if (participants.includes(otherUserId)) {
        chatExists = true;
        existingChatId = doc.id;
        break;
      }
    }

    if (!chatExists) {
      const userDoc = await db.collection("users").doc(userId).get();
      if (userDoc.data().blocked.includes(otherUserId)) {
        return res.status(400).json({ message: "You blocked that user." });
      }
      if (userDoc.data().blockedBy.includes(otherUserId)) {
        return res
          .status(400)
          .json({ message: "You are blocked by that user." });
      }
      const chatRef = await db.collection("chats").add({
        participants: [userId, otherUserId],
        initiatedBy: userId,
        isFriend: false,
        lastMessage: null,
        lastMessageTimeStamp: null,
      });
      const chatData = (await chatRef.get()).data();
      return res.status(201).json({ chatId: chatRef.id, chatData });
    } else {
      return res
        .status(409)
        .json({ message: "Chat already exists", chatId: existingChatId });
    }
  } catch (error) {
    console.error("Error creating or loading chat:", error);
    return res.status(500).json({ message: "Unable to create or load chat" });
  }
};

export const fetchMessages = async (req, res) => {
  console.log("req received to fetchMessages");
  const { chatId } = req.body;
  try {
    const messagesSnapshot = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("timeStamp", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const sendMessage = async (req, res) => {
  console.log("req received to sendMessage");
  const { messageBody, chatId } = req.body;
  try {
    const timeStamp = FieldValue.serverTimestamp();
    const chatRef = db.collection("chats").doc(chatId);
    await chatRef.set(
      { lastMessage: messageBody, lastMessageTimeStamp: timeStamp },
      { merge: true }
    );
    const messageRef = await chatRef.collection("messages").add({
      message: messageBody,
      senderId: req.uid,
      timeStamp,
    });

    return res.status(201).json({ messageId: messageRef.id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

export const requestDecision = async (req, res) => {
  console.log("req recieved to requestDecision");
  const { chatId, decision, participantId } = req.body;
  try {
    if (decision === "accept") {
      const chatRef = db.collection("chats").doc(chatId);
      await chatRef.set({ isFriend: true }, { merge: true });
      return res.sendStatus(200);
    } else {
      const userRef = db.collection("users").doc(req.uid);
      const participantRef = db.collection("users").doc(participantId);

      const userDoc = await userRef.get();
      const participantDoc = await participantRef.get();
      await userRef.set(
        { blocked: [...userDoc.data().blocked, participantId] },
        { merge: true }
      );
      await participantRef.set(
        { blockedBy: [...participantDoc.data().blockedBy, req.uid] },
        { merge: true }
      );
      const chatRef = db.collection("chats").doc(chatId);
      await chatRef.delete();
      return res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
