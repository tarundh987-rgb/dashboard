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

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

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

  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.id})`);

    userSockets.set(socket.userId, socket.id);

    const onlineUserIds = Array.from(userSockets.keys());
    socket.emit("online_users_list", { userIds: onlineUserIds });

    io.emit("user_online", { userId: socket.userId });

    socket.on("join_conversation", ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
      console.log(
        `User ${socket.userId} joined conversation ${conversationId}`,
      );
    });

    socket.on("leave_conversation", ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

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

    socket.on("typing", ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", {
        userId: socket.userId,
        isTyping,
      });
    });

    socket.on("mark_read", ({ conversationId, messageId }) => {
      socket.to(`conversation:${conversationId}`).emit("message_read", {
        messageId,
        readBy: socket.userId,
      });
    });

    socket.on("send_invite", ({ receiverId, invitation }) => {
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("invite:received", invitation);
      }
    });

    socket.on("accept_invite", ({ senderId, invitation }) => {
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("invite:accepted", invitation);
      }
    });

    socket.on("reject_invite", ({ senderId, invitation }) => {
      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("invite:rejected", invitation);
      }
    });

    socket.on("conversation_created", ({ conversation, otherUserId }) => {
      socket.emit("new_conversation", conversation);

      const otherSocketId = userSockets.get(otherUserId);
      if (otherSocketId) {
        io.to(otherSocketId).emit("new_conversation", conversation);
      }
    });

    // --- WebRTC Signaling for Voice Calls ---

    // 1. Call Session Initiation
    socket.on("call:initiate", ({ receiverId, callerInfo }) => {
      const receiverSocketId = userSockets.get(receiverId);
      console.log(
        `[SERVER] call:initiate from ${socket.userId} to ${receiverId}. CallerInfo:`,
        callerInfo,
      );
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call:incoming", {
          callerId: socket.userId,
          callerInfo,
        });
      } else {
        socket.emit("call:error", { message: "User is offline" });
      }
    });

    socket.on("call:accept", ({ callerId, receiverInfo }) => {
      const callerSocketId = userSockets.get(callerId);
      if (callerSocketId) {
        console.log(
          `Call accepted by ${socket.userId} for caller ${callerId}. ReceiverInfo:`,
          receiverInfo,
        );
        io.to(callerSocketId).emit("call:accepted", {
          receiverId: socket.userId,
          receiverInfo,
        });
      }
    });

    socket.on("call:reject", ({ callerId }) => {
      const callerSocketId = userSockets.get(callerId);
      if (callerSocketId) {
        console.log(`Call rejected by ${socket.userId} for caller ${callerId}`);
        io.to(callerSocketId).emit("call:rejected", {
          receiverId: socket.userId,
        });
      }
    });

    // 2. WebRTC Handshake
    socket.on("webrtc:offer", ({ to, offer }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:offer", {
          from: socket.userId,
          offer,
        });
      }
    });

    socket.on("webrtc:answer", ({ to, answer }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:answer", {
          from: socket.userId,
          answer,
        });
      }
    });

    socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc:ice-candidate", {
          from: socket.userId,
          candidate,
        });
      }
    });

    // 3. Call Termination
    socket.on("call:end", ({ to }) => {
      const targetSocketId = userSockets.get(to);
      if (targetSocketId) {
        console.log(`Call ended by ${socket.userId} with ${to}`);
        io.to(targetSocketId).emit("call:ended", { from: socket.userId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId} (${socket.id})`);
      userSockets.delete(socket.userId);

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

  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
});
