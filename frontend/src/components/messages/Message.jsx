import { useState, useEffect } from 'react';
import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import useConversation from "../../zustand/useConversation";
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust the URL as needed

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const { selectedConversation } = useConversation();
	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "chat-end" : "chat-start";
	const profilePic = fromMe ? authUser.profilePic : selectedConversation?.profilePic;
	const bubbleBgColor = fromMe ? "bg-blue-500" : "";
	const shakeClass = message.shouldShake ? "shake" : "";

	const [showModal, setShowModal] = useState(false);

	const handleDeleteForMe = async () => {
		try {
			const response = await axios.delete(`http://localhost:5000/api/messages/deleteForMe/${message._id}`, {
				withCredentials: true, // Include this option to send cookies
			});
			console.log(response.data);
			alert("Message Deleted for Me");
			// Handle success (update UI, etc.)
		} catch (error) {
			console.error('Error deleting message for me:', error);
			alert("Failed to Delete Message for Me");
			// Handle error (display error message, etc.)
		}
	};

	const handleDeleteForEveryone = async () => {
		try {
			const response = await axios.delete(`http://localhost:5000/api/messages/deleteForEveryone/${message._id}`, {
				withCredentials: true, // Include this option to send cookies
			});
			console.log(response.data);
			alert("Message Deleted for Everyone");

			setShowModal(false);
			window.location.reload();
			// Handle success (update UI, etc.)
		} catch (error) {
			console.error('Error deleting message for everyone:', error);
			alert("Failed to Delete Message for Everyone");
			// Handle error (display error message, etc.)
		}
	};

	const handleClickMessage = () => {
		if (fromMe) {
			setShowModal(true);
		}
	};

	// Listen for socket events
	useEffect(() => {
		socket.on('messageDeleted', (messageId) => {
			if (messageId === message._id) {
				// Update the UI to reflect that the message has been deleted
				// alert("Message has been deleted for everyone");
				console.log("Message has been deleted from Socket Also")
			}
		});

		return () => {
			socket.off('messageDeleted');
		};
	}, [message._id]);

	const getStatusText = () => {
		if (message.status === 'read') {
			return 'Read';
		} else if (message.status === 'delivered') {
			return 'Delivered';
		} else {
			return 'Sent';
		}
	};

	return (
		<div className={`chat ${chatClassName}`}>
			<div className='chat-image avatar'>
				<div className='w-10 rounded-full'>
					<img alt='Profile Pic' src={profilePic} />
				</div>
			</div>
			<div
				className={`chat-bubble text-white lg:text-[17px] md:text-[16px] sm:text-[15px] text-[13px] cursor-pointer ${bubbleBgColor} ${shakeClass} pb-2`}
				onClick={handleClickMessage}
			>
				{message.message}
			</div>
			<div className='chat-footer opacity-50 cursor-pointer text-xs text-white flex gap-1 items-center' onClick={handleClickMessage}>
				<span>{formattedTime}</span>
				<span className="ml-2 text-gray-400">{getStatusText()}</span>
			</div>

			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					<div className="fixed inset-0 bg-black opacity-50"></div>
					<div className="bg-white rounded-lg p-6 max-w-sm w-full relative z-10">
						<button
							className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
							onClick={() => setShowModal(false)}
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
							</svg>
						</button>
						<p className="text-lg font-semibold mb-4">Delete Message</p>
						<p className="mb-4">Are you sure you want to delete this message?</p>
						<div className="flex justify-center items-center gap-4">
							{/* <button
								onClick={handleDeleteForMe}
								className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
							>
								Delete for Me
							</button> */}
							<button
								onClick={handleDeleteForEveryone}
								className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
							>
								Delete for Everyone
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Message;
