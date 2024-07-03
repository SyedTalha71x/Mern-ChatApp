// MessageInput.jsx
import { useState } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ disabled }) => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();
	const [open, setOpen] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;
		await sendMessage(message);
		setMessage("");
	};

	const handleEmoji = (e) => {
		setMessage((prev) => prev + e.emoji);
		setOpen(false);
	};

	return (
		<div className="">
			<form className='px-4 my-3' onSubmit={handleSubmit}>
				<div className='w-full relative flex items-center'>
					<input
						type='text'
						className='border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 text-white'
						placeholder={disabled ? 'You cannot Message the person' : 'Send a Message'}
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						disabled={disabled}
					/>
					<div className="relative flex items-center ml-1">
						<MdOutlineEmojiEmotions
							className="text-2xl mr-1 text-white cursor-pointer"
							onClick={() => setOpen(!open)}
						/>
						{open && (
							<div className="absolute bottom-10 right-5 z-10">
								<EmojiPicker onEmojiClick={handleEmoji} />
							</div>
						)}
					</div>
					<button type='submit' className='ml-1 flex items-center' disabled={disabled}> {/* Disable button based on disabled prop */}
						{loading ? (
							<div className='loading loading-spinner'></div>
						) : (
							<BsSend className="text-white" />
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default MessageInput;
