const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const allowedOrigin = process.env.BASE_URL || "http://localhost:5173";

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); 
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.BASE_URL,
      ].filter(Boolean);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const PORT = process.env.PORT || 3001;

connectDB()
  .then(() => {
    console.log(" Database connected");

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("⚡ User connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`👤 User ${userId} joined their room`);
      });

      socket.on("sendMessage", async ({ from, to, text }) => {
        try {
          const Message = require("./models/Message");
          const msg = await Message.create({ from, to, text });

          io.to(from).emit("receiveMessage", msg);
          io.to(to).emit("receiveMessage", msg);
        } catch (err) {
          console.error("❌ Failed to save message:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log(" User disconnected:", socket.id);
      });
    });

    server.listen(PORT, () =>
      console.log(` Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("DB connection failed", err));
