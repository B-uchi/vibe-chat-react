import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5555;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://vibe-chat-react.vercel.app"],
    methods: ["GET", "POST"]
  }
});

// Make io accessible to routes/controllers
app.set('io', io);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://vibe-chat-react.vercel.app"],
  })
);
app.options("*", cors());
app.use(bodyParser.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.get("/", (req, res) => {
  return res.status(200).send("Active");
});

// Store connected users
const connectedUsers = new Map();

// Make connectedUsers accessible to routes/controllers
app.set('connectedUsers', connectedUsers);


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("user_connected", (userId) => {
    connectedUsers.set(userId, socket.id);
    io.emit("user_status", { userId, status: "online" });
  });

  socket.on("typing", ({ chatId, userId, otherParticipantId, isTyping }) => {
    const recipientSocket = connectedUsers.get(otherParticipantId);

    if (recipientSocket) {
      io.to(recipientSocket).emit("typing_status", { chatId, userId, isTyping });
    }
  });

  socket.on("is_online", (userId) => {
    const recipientSocket = connectedUsers.get(userId);
    if (recipientSocket) {
      io.emit("user_status", { userId, status: "online" });
    }
  });

  socket.on("disconnect", () => {
    let disconnectedUserId;
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }
    
    if (disconnectedUserId) {
      connectedUsers.delete(disconnectedUserId);
      io.emit("user_status", { userId: disconnectedUserId, status: "offline" });
      
      // Remove socket instance when user disconnects
      app.set(`socket:${disconnectedUserId}`, null);
    }
    
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
