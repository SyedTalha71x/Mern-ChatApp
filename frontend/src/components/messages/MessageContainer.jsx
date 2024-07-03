// MessageContainer.jsx
import { useState, useEffect } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { useAuthContext } from "../../context/AuthContext";
import { HiDotsVertical } from "react-icons/hi";
import axios from 'axios';

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const { authUser } = useAuthContext();
	const [menuOpen, setMenuOpen] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);
	const [buttonText, setButtonText] = useState('Block User');

	useEffect(() => {
		// Cleanup function (unmounts)
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	useEffect(() => {
		const checkBlockStatus = async () => {
			if (selectedConversation) {
				try {
					const response = await axios.get(`http://localhost:5000/api/users/isBlocked/${selectedConversation._id}`, {
						withCredentials: true,
					});
					setIsBlocked(response.data.isBlocked);
					setButtonText(response.data.isBlocked ? 'Unblock User' : 'Block User');
				} catch (error) {
					console.error("Error checking block status:", error);
				}
			}
		};
		checkBlockStatus();
	}, [selectedConversation]);

	const handleBlockToggle = async () => {
		try {
			if (isBlocked) {
				await axios.post(`http://localhost:5000/api/users/unblock/${selectedConversation._id}`, {}, {
					withCredentials: true,
				});
				alert("User unblocked successfully.");
				setIsBlocked(false);
				setButtonText('Block User');
				window.location.reload();
			} else {
				await axios.post(`http://localhost:5000/api/users/block/${selectedConversation._id}`, {}, {
					withCredentials: true,
				});
				alert("User blocked successfully.");
				setIsBlocked(true);
				setButtonText('Unblock User');
				window.location.reload(); // Refresh the window
			}

		} catch (error) {
			console.error("Error toggling block status:", error);
		}
		setMenuOpen(false);
	};

	const handleMenuToggle = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<div className='md:min-w-[450px] flex flex-col'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					{/* Header */}
					<div className='bg-slate-500 px-4 py-2 mb-2 flex justify-between items-center relative'>
						<div>
							<span className='label-text'>To:</span>{" "}
							<span className='text-gray-900 font-bold'>{selectedConversation.fullName}</span>
						</div>
						<div className='relative'>
							<HiDotsVertical
								className="text-2xl text-white cursor-pointer"
								onClick={handleMenuToggle}
							/>
							{menuOpen && (
								<div className='absolute right-2 top-7 bg-slate-100 shadow-lg h-auto w-[200px] rounded-lg p-4 z-10'>
									<button
										onClick={handleBlockToggle}
										className={` w-full text-[12px] text-center rounded-lg px-10 py-1.5 ${isBlocked ? 'text-white bg-blue-600' : 'text-white bg-red-600'}`}
									>
										{buttonText}
									</button>
								</div>
							)}
						</div>
					</div>
					<Messages />
					<MessageInput disabled={isBlocked} /> {/* Pass isBlocked state */}
				</>
			)}
		</div>
	);
};

export default MessageContainer;

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='flex items-center justify-center w-full h-full'>
			<div className='px-4 text-center sm:text-lg md:text-xl text-gray-200 font-semibold flex flex-col items-center gap-2'>
				<p>Welcome 👋 {authUser.fullName} ❄</p>
				<p>Select a chat to start messaging</p>
				<TiMessages className='text-3xl md:text-6xl text-center' />
			</div>
		</div>
	);
};
