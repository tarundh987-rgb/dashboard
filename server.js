const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;


  if (!cookieHeader) {
    return next(new Error("No cookies found"));
  }

  const token = cookieHeader
    .split("; ")
    .find((row) => row.startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) {
    return next(new Error("No auth token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});


  // Store active socket connections (userId -> socketId mapping)
  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.id})`);

    // Store user's socket connection
    userSockets.set(socket.userId, socket.id);

    // Emit online status to all users
    io.emit("user_online", { userId: socket.userId });

    // Join a conversation room
    socket.on("join_conversation", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
      console.log(
        `User ${socket.userId} joined conversation ${conversationId}`,
      );
    });

    // Leave a conversation room
    socket.on("leave_conversation", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on("send_message", async (data) => {
      const { conversationId, message } = data;
      console.log(`User ${socket.userId} sent message in ${conversationId}`);

      const payload = {
        ...message,
      };

      if (!payload.sender) {
        payload.sender = socket.userId;
      }

      io.to(`conversation:${conversationId}`).emit("new_message", payload);
    });

    // Handle typing indicator
    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping,
      });
    });

    // Handle message read
    socket.on("mark_read", ({ conversationId, messageId }) => {
      socket.to(`conversation:${conversationId}`).emit("message_read", {
        messageId,
        readBy: socket.userId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId} (${socket.id})`);
      userSockets.delete(socket.userId);

      // Emit offline status
      io.emit("user_offline", { userId: socket.userId });
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.IO server is running`);
    });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
});
