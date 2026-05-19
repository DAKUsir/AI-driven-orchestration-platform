const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/db");

// ── Route imports ──
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const streakRoutes = require("./routes/streakRoutes");
const competitionRoutes = require("./routes/competitionRoutes");
const sheetRoutes = require("./routes/sheetRoutes");
const dailyReviewRoutes = require("./routes/dailyReviewRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const integrationRoutes = require("./routes/integrationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const groupChatRoutes = require("./routes/groupChatRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const courseRoutes = require("./routes/courseRoutes");
const aiRoutes = require("./routes/aiRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const GroupChat = require("./models/GroupChat");
const User = require("./models/User");



// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Passport config
require("./config/passport")(passport);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan("dev"));
app.use(cookieParser());

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/streaks", streakRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/sheets", sheetRoutes);
app.use("/api/daily-reviews", dailyReviewRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupChatRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/integrations/youtube", youtubeRoutes);

app.get("/", (req, res) => {
  res.send("FinishIt API Running");
});

// ── Socket.IO Authentication & Events ────────────────────────────────
const onlineUsers = new Map();
const voiceRooms = new Map(); // groupId -> Set(socket.id)

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.userId;

  try {
    const user = await User.findById(userId).select("name email avatar");
    if (user) {
      onlineUsers.set(socket.id, {
        userId: user._id.toString(),
        userName: user.name,
      });
    }
  } catch (e) {
    console.error("[Socket] Error fetching user:", e.message);
  }

  console.log(`[Socket] User connected: ${userId}`);

  // Join a group room
  socket.on("join-room", async (groupId) => {
    socket.join(groupId);
    const userInfo = onlineUsers.get(socket.id);
    if (userInfo) {
      socket.to(groupId).emit("user-joined", {
        userId: userInfo.userId,
        userName: userInfo.userName,
      });
    }

    const roomSockets = await io.in(groupId).fetchSockets();
    const onlineMembers = roomSockets
      .map((s) => onlineUsers.get(s.id))
      .filter(Boolean);
    socket.emit("online-members", onlineMembers);
  });

  // Leave a group room
  socket.on("leave-room", (groupId) => {
    socket.leave(groupId);
    const userInfo = onlineUsers.get(socket.id);
    if (userInfo) {
      socket.to(groupId).emit("user-left", {
        userId: userInfo.userId,
        userName: userInfo.userName,
      });
    }
  });

  // Send a message
  socket.on("send-message", async ({ groupId, content }) => {
    try {
      const group = await GroupChat.findById(groupId);
      if (!group || !group.members.includes(userId)) return;

      const message = {
        sender: userId,
        content,
        type: "text",
        timestamp: new Date(),
      };

      group.messages.push(message);
      await group.save();

      const sender = await User.findById(userId).select("name email avatar");

      io.to(groupId).emit("new-message", {
        _id: group.messages[group.messages.length - 1]._id,
        sender: {
          _id: sender._id,
          name: sender.name,
          email: sender.email,
          avatar: sender.avatar,
        },
        content,
        type: "text",
        timestamp: message.timestamp,
      });
    } catch (err) {
      console.error("[Socket] Send message error:", err.message);
    }
  });

  // Typing indicator
  socket.on("typing", ({ groupId, isTyping }) => {
    const userInfo = onlineUsers.get(socket.id);
    if (userInfo) {
      socket.to(groupId).emit("user-typing", {
        userId: userInfo.userId,
        userName: userInfo.userName,
        isTyping,
      });
    }
  });

  // ── WebRTC Voice Channel Events ──
  socket.on("join-voice", (groupId) => {
    if (!voiceRooms.has(groupId)) {
      voiceRooms.set(groupId, new Set());
    }
    const room = voiceRooms.get(groupId);
    room.add(socket.id);

    const userInfo = onlineUsers.get(socket.id);
    // Tell others in the voice room that this user joined
    for (let peerSocketId of room) {
      if (peerSocketId !== socket.id) {
        io.to(peerSocketId).emit("user-joined-voice", {
          socketId: socket.id,
          userId: userInfo?.userId,
          userName: userInfo?.userName
        });
      }
    }
    
    // Tell the joining user who is already in the room
    const currentMembers = Array.from(room).filter(id => id !== socket.id).map(id => {
      const uInfo = onlineUsers.get(id);
      return { socketId: id, userId: uInfo?.userId, userName: uInfo?.userName };
    });
    socket.emit("voice-room-users", currentMembers);
  });

  socket.on("webrtc-offer", ({ targetSocketId, offer }) => {
    const userInfo = onlineUsers.get(socket.id);
    io.to(targetSocketId).emit("webrtc-offer", {
      fromSocketId: socket.id,
      fromUserId: userInfo?.userId,
      fromUserName: userInfo?.userName,
      offer
    });
  });

  socket.on("webrtc-answer", ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit("webrtc-answer", {
      fromSocketId: socket.id,
      answer
    });
  });

  socket.on("webrtc-ice-candidate", ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit("webrtc-ice-candidate", {
      fromSocketId: socket.id,
      candidate
    });
  });

  socket.on("leave-voice", (groupId) => {
    if (voiceRooms.has(groupId)) {
      const room = voiceRooms.get(groupId);
      room.delete(socket.id);
      for (let peerSocketId of room) {
        io.to(peerSocketId).emit("user-left-voice", { socketId: socket.id });
      }
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    // Remove from voice rooms
    voiceRooms.forEach((room, groupId) => {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        for (let peerSocketId of room) {
          io.to(peerSocketId).emit("user-left-voice", { socketId: socket.id });
        }
      }
    });

    onlineUsers.delete(socket.id);
    console.log(`[Socket] User disconnected: ${userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`FinishIt API running on port ${PORT}`);
});

module.exports = app;
