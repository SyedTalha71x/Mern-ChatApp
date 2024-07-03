import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST"],
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId) {
		userSocketMap[userId] = socket.id;
	}

	// Emit the list of online users to the connected client
	io.emit("getOnlineUsers", Object.keys(userSocketMap));

	// Listen for disconnect events
	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		for (let [key, value] of Object.entries(userSocketMap)) {
			if (value === socket.id) {
				delete userSocketMap[key];
				break;
			}
		}
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	});

	// Handle message deletion events
	socket.on("messageDeletedForUser", ({ messageId, userId }) => {
		io.to(userSocketMap[userId]).emit("messageDeletedForUser", { messageId });
	});

	socket.on("messageDeletedForEveryone", ({ messageId }) => {
		io.emit("messageDeletedForEveryone", { messageId });
	});
});

export { app, io, server };
