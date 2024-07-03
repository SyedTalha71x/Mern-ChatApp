
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import Group from "../models/group.model.js";

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
			status: 'sent',
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		// await conversation.save();
		// await newMessage.save();

		// this will run in parallel
		await Promise.all([conversation.save(), newMessage.save()]);

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			// io.to(<socket_id>).emit() used to send events to specific client
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const deleteMessageForYou = async (req, res) => {
	try {
		const { messageId } = req.params;
		const senderId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Check if the user is the sender
		if (message.senderId.toString() !== senderId.toString()) {
			return res.status(403).json({ error: "You can only delete your own messages" });
		}

		// Add the sender to the deletedFor array if not already present
		if (!message.deletedFor.includes(senderId)) {
			message.deletedFor.push(senderId);
			await message.save();

			// Update conversation to reflect the deletion for the sender
			const conversation = await Conversation.findOneAndUpdate(
				{ _id: message.conversationId, messages: messageId },
				{ $pull: { messages: messageId } },
				{ new: true }
			);

			if (!conversation) {
				return res.status(404).json({ error: "Conversation not found" });
			}
		}

		res.status(200).json({ message: "Message deleted for sender" });
	} catch (error) {
		console.log("Error in deleteMessageForYou controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteMessageForEveryone = async (req, res) => {
	try {
		const { messageId } = req.params;
		const senderId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		if (message.senderId.toString() !== senderId.toString()) {
			return res.status(403).json({ error: "You can only delete your own messages" });
		}

		// Remove the message from the conversation
		const conversation = await Conversation.findOneAndUpdate(
			{ messages: messageId },
			{ $pull: { messages: messageId } },
			{ new: true }
		);

		if (!conversation) {
			return res.status(404).json({ error: "Conversation not found" });
		}

		// Delete the message
		await Message.findByIdAndDelete(messageId);

		// Emit a socket event to notify participants
		io.to(conversation.participants).emit("messageDeleted", messageId);

		res.status(200).json({ message: "Message deleted for everyone" });
	} catch (error) {
		console.log("Error in deleteMessageForEveryone controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const markAsDelivered = async (req, res) => {
	try {
		const { messageId } = req.params;

		const message = await Message.findByIdAndUpdate(messageId, { status: 'delivered' }, { new: true });

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		const receiverSocketId = getReceiverSocketId(message.receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageDelivered", message);
		}

		res.status(200).json(message);
	} catch (error) {
		console.log("Error in markAsDelivered controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const markAsRead = async (req, res) => {
	try {
		const { messageId } = req.params;
		const userId = req.user._id;

		const message = await Message.findById(messageId);

		if (!message) {
			return res.status(404).json({ error: "Message not found" });
		}

		if (!message.readBy.includes(userId)) {
			message.readBy.push(userId);
			message.status = 'read';
			await message.save();
		}

		const receiverSocketId = getReceiverSocketId(message.receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageRead", message);
		}

		res.status(200).json(message);
	} catch (error) {
		console.log("Error in markAsRead controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const sendGroupMessage = async (req, res) => {
	try {
		const { groupId } = req.params;
		const { message } = req.body;
		const senderId = req.user._id;

		// Attempt to find the conversation based on groupId
		let conversation = await Conversation.findById(groupId);

		if (!conversation) {
			// If conversation not found, create a new one (optional based on your app logic)
			conversation = await Conversation.create({
				_id: groupId,
				participants: [], // Ensure to define participants as needed
				messages: [] // Ensure to define messages as needed
			});

			// Alternatively, handle the case where the conversation doesn't exist
			// return res.status(404).json({ error: 'Group conversation not found' });
		}

		// Create a new message
		const newMessage = new Message({
			senderId,
			message,
			status: 'sent',
			conversationId: groupId
		});

		await newMessage.save();

		// Update the group's messages array
		await Group.findByIdAndUpdate(groupId, { $push: { messages: newMessage._id } });

		// SOCKET IO FUNCTIONALITY WILL GO HERE
		// Emit the new message to all group members except the sender
		conversation.participants.forEach(memberId => {
			if (memberId.toString() !== senderId.toString()) {
				const receiverSocketId = getReceiverSocketId(memberId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit('newGroupMessage', newMessage);
				}
			}
		});

		res.status(201).json(newMessage);
	} catch (error) {
		console.log('Error in sendGroupMessage controller: ', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getGroupMessages = async (req, res) => {
	try {
		const { groupId } = req.params;
		const senderId = req.user._id;

		// Find the conversation based on groupId
		const conversation = await Conversation.findById(groupId).populate('messages');

		if (!conversation) {
			return res.status(404).json({ error: 'Group conversation not found' });
		}

		// Ensure user is a participant in the conversation
		if (!conversation.participants.includes(senderId)) {
			return res.status(403).json({ error: 'Unauthorized access to group conversation' });
		}

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log('Error in getGroupMessages controller: ', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};


