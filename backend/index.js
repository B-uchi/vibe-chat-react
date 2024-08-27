import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5555;

const app = express();
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
