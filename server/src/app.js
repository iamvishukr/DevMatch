const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");

const app = express();

// ---- CLEAN BASE URL ----
const BASE_URL = (process.env.BASE_URL || "https://devmatchus.vercel.app")
  .replace(/\/$/, "");

// ---- ALLOWED ORIGINS ----
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  BASE_URL
].filter(Boolean);

console.log("✨ Allowed Origins:", allowedOrigins);

// ---- EXPRESS CORS ----
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow server-to-server or curl

      const cleanOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }

      console.log("❌ BLOCKED ORIGIN:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

// ---- MIDDLEWARE ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// ---- ROUTES ----
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/api", chatRouter);

const PORT = process.env.PORT || 3001;

// ---- DATABASE + SERVER + SOCKET.IO ----
connectDB()
  .then(() => {
    console.log("✅ Database connected");

    const server = http.createServer(app);

    // ---- SOCKET.IO CORS MUST MATCH EXPRESS ----
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // ---- SOCKET.IO EVENTS ----
    io.on("connection", (socket) => {
      console.log("⚡ User connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
      });

      socket.on("sendMessage", async ({ from, to, text }) => {
        try {
          const msg = await Message.create({ from, to, text });

          const populatedMsg = await Message.findById(msg._id)
            .populate("from", "firstName lastName username photoUrl")
            .populate("to", "firstName lastName username photoUrl");

          console.log("📩 Message saved and broadcasting:", populatedMsg._id);

          io.to(from).emit("receiveMessage", populatedMsg);
          io.to(to).emit("receiveMessage", populatedMsg);
        } catch (err) {
          console.error("❌ Failed to save message:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
      });
    });

    // ---- START SERVER ----
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB connection failed", err));
