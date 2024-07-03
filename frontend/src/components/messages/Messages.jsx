import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import axios from 'axios';
import { useAuthContext } from "../../context/AuthContext";

const Messages = () => {
	const { messages, loading } = useGetMessages();
	useListenMessages();
	const lastMessageRef = useRef();
	const { authUser } = useAuthContext();

	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

	const markAsDelivered = async (messageId) => {
		try {
			const response = await axios.put(`http://localhost:5000/api/messages/delivered/${messageId}`, null, {
				withCredentials: true, // Include this option to send cookies
			});
			console.log(response.data); // Optional: handle response if needed
		} catch (error) {
			console.error('Error marking message as delivered:', error);
		}
	};

	const markAsRead = async (messageId) => {
		try {
			const response = await axios.put(`http://localhost:5000/api/messages/read/${messageId}`, null, {
				withCredentials: true, // Include this option to send cookies
			});
			console.log(response.data); // Optional: handle response if needed
		} catch (error) {
			console.error('Error marking message as read:', error);
		}
	};

	useEffect(() => {
		const markMessages = async () => {
			for (const message of messages) {
				if (message.senderId !== authUser._id) {
					if (message.status !== 'delivered') {
						await markAsDelivered(message._id);
					}
					if (message.status === 'delivered' && !message.readBy.includes(authUser._id)) {
						await markAsRead(message._id);
					}
				}
			}
		};
		markMessages();
	}, [messages, authUser._id]);

	return (
		<div className='px-4 flex-1 overflow-auto'>
			{!loading &&
				messages.length > 0 &&
				messages.map((message, index) => (
					<div key={message._id} ref={index === messages.length - 1 ? lastMessageRef : null}>
						<Message message={message} />
					</div>
				))}

			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}
			{!loading && messages.length === 0 && (
				<p className='text-center text-white'>Send a message to start the conversation</p>
			)}
		</div>
	);
};

export default Messages;
