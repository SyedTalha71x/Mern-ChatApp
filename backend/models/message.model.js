import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		groupId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
		},
		message: {
			type: String,
			required: true,
		},
		deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		status: { type: String, default: 'sent' },
		readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
