import * as admin from "../util/firebase/config.js";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const db = getFirestore();
const auth = getAuth();

/**
 * Creates a new chat between two users or returns existing chat
 * @param {Object} req - Request object containing otherUserId in body and uid of requester
 * @param {Object} res - Response object
 * @returns {Object} Chat data or error message
 */
export const createChat = async (req, res) => {
  console.log("Request received to create chat");
  const { otherUserId } = req.body;
  const userId = req.uid;

  try {
    // Check if chat already exists between these users
    const chatQuerySnapshot = await db
      .collection("chats")
      .where("participants", "array-contains", userId)
      .get();

    // Look for existing chat with these participants
    const existingChat = chatQuerySnapshot.docs.find(doc => 
      doc.data().participants.includes(otherUserId)
    );

    if (existingChat) {
      return res.status(409).json({ 
        message: "Chat already exists", 
        chatId: existingChat.id 
      });
    }

    // Get user document to check block status
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    // Check if either user has blocked the other
    if (userData.connections[otherUserId] === "blocked") {
      return res.status(400).json({ message: "You blocked that user." });
    }
    if (userData.blockedBy.includes(otherUserId)) {
      return res.status(400).json({ message: "You are blocked by that user." });
    }

    // Create new chat document
    const chatRef = await db.collection("chats").add({
      participants: [userId, otherUserId],
      initiatedBy: userId,
      isFriend: false,
      lastMessage: null,
      lastMessageTimeStamp: null,
      createdAt: FieldValue.serverTimestamp()
    });

    const chatData = (await chatRef.get()).data();
    return res.status(201).json({ chatId: chatRef.id, chatData });

  } catch (error) {
    console.error("Error creating or loading chat:", error);
    return res.status(500).json({ message: "Unable to create or load chat" });
  }
};

/**
 * Fetches messages for a specific chat
 * @param {Object} req - Request object containing chatId in body
 * @param {Object} res - Response object
 * @returns {Object} Array of messages or error
 */
export const fetchMessages = async (req, res) => {
  console.log("Request received to fetch messages");
  const { chatId } = req.body;

  try {
    // Get messages ordered by timestamp
    const messagesSnapshot = await db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .orderBy("timeStamp", "asc")
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Unable to fetch messages" });
  }
};

/**
 * Sends a new message in a chat
 * @param {Object} req - Request object containing messageBody and chatId in body
 * @param {Object} res - Response object
 * @returns {Object} Message ID or error
 */
export const sendMessage = async (req, res) => {
  console.log("Request received to send message");
  const { messageBody, chatId } = req.body;
  const senderId = req.uid;

  try {
    const timeStamp = FieldValue.serverTimestamp();
    const chatRef = db.collection("chats").doc(chatId);

    // Update chat with last message info
    await chatRef.set({
      lastMessage: messageBody,
      lastMessageTimeStamp: timeStamp,
      lastSender: senderId
    }, { merge: true });

    // Add new message to messages subcollection
    const messageRef = await chatRef.collection("messages").add({
      message: messageBody,
      senderId,
      timeStamp,
      status: "sent"
    });

    return res.status(201).json({ messageId: messageRef.id });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Unable to send message" });
  }
};

/**
 * Handles accepting or rejecting a chat request
 * @param {Object} req - Request object containing chatId, decision and participantId
 * @param {Object} res - Response object
 * @returns {Object} Success status or error
 */
export const requestDecision = async (req, res) => {
  console.log("Request received to handle chat request decision");
  const { chatId, decision, participantId } = req.body;
  const userId = req.uid;

  try {
    if (decision === "accept") {
      // Update both users' connections and chat status
      const batch = db.batch();
      
      const userRef = db.collection("users").doc(userId);
      const participantRef = db.collection("users").doc(participantId);
      const chatRef = db.collection("chats").doc(chatId);

      const userDoc = await userRef.get();
      const userData = userDoc.data();

      // Update user's connections
      batch.set(userRef, {
        connections: {
          ...userData.connections,
          [participantId]: "friends"
        }
      }, { merge: true });

      // Update chat status
      batch.set(chatRef, { 
        isFriend: true,
        acceptedAt: FieldValue.serverTimestamp()
      }, { merge: true });

      await batch.commit();
      return res.status(200).json({ message: "Chat request accepted" });

    } else {
      // Handle rejection by blocking user and deleting chat
      const batch = db.batch();
      
      const userRef = db.collection("users").doc(userId);
      const participantRef = db.collection("users").doc(participantId);
      const chatRef = db.collection("chats").doc(chatId);

      const [userDoc, participantDoc] = await Promise.all([
        userRef.get(),
        participantRef.get()
      ]);

      // Update user's connections to block participant
      batch.set(userRef, {
        connections: {
          ...userDoc.data().connections,
          [participantId]: "blocked"
        }
      }, { merge: true });

      // Add user to participant's blockedBy array
      batch.set(participantRef, {
        blockedBy: [...participantDoc.data().blockedBy, userId]
      }, { merge: true });

      // Delete the chat
      batch.delete(chatRef);

      await batch.commit();
      return res.status(200).json({ message: "Chat request rejected" });
    }
  } catch (error) {
    console.error("Error handling chat request decision:", error);
    return res.status(500).json({ message: "Unable to process request" });
  }
};

/**
 * Deletes a message by updating its content
 * @param {Object} req - Request object containing messageId and chatId
 * @param {Object} res - Response object
 * @returns {Object} Success message or error
 */
export const deleteMessage = async (req, res) => {
  console.log("Request received to delete message");
  const { messageId, chatId } = req.body;
  const userId = req.uid;

  try {
    // Get reference to the message
    const messageRef = db
      .collection("chats")
      .doc(chatId)
      .collection("messages")
      .doc(messageId);

    // Get the message data
    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify the message belongs to the requesting user
    const messageData = messageDoc.data();
    if (messageData.senderId !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Update message content to show it was deleted
    await messageRef.update({
      content: "This message was deleted",
      isDeleted: true,
      deletedAt: FieldValue.serverTimestamp()
    });

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Error deleting message" });
  }
};

