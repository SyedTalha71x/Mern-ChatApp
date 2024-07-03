import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const loggedInUserId = req.user._id;

		const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

		res.status(200).json(filteredUsers);
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};


export const BlockUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const loggedInUserId = req.user._id;

		// Check if the user to block exists and is not the logged-in user
		const userToBlock = await User.findOne({ _id: userId });
		if (!userToBlock) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (userToBlock._id.toString() === loggedInUserId.toString()) {
			return res.status(400).json({ error: 'You cannot block yourself' });
		}

		// Block the user
		const currentUser = await User.findById(loggedInUserId);
		if (!currentUser.blockedUsers.includes(userToBlock._id.toString())) {
			currentUser.blockedUsers.push(userToBlock._id);
			await currentUser.save();
		} else {
			return res.status(400).json({ error: 'User is already blocked' });
		}

		res.status(200).json({ message: 'User blocked successfully' });
	} catch (error) {
		console.error('Error in blockUser:', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export const UnblockUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const loggedInUserId = req.user._id;

		console.log(`Request to unblock user with ID: ${userId}`);
		console.log(`Logged-in user ID: ${loggedInUserId}`);

		// Verify the `userId` and `loggedInUserId`
		if (!userId || !loggedInUserId) {
			console.log('Invalid request parameters');
			return res.status(400).json({ error: 'Invalid request parameters' });
		}

		// Log the query parameters
		console.log('Query parameters:', { _id: userId, $and: [{ _id: userId }, { _id: { $ne: loggedInUserId } }] });

		// Check if the user exists and is not the logged-in user
		const userToUnblock = await User.findOne({ $and: [{ _id: userId }, { _id: { $ne: loggedInUserId } }] });
		if (!userToUnblock) {
			console.log(`User with ID ${userId} not found or is the logged-in user.`);
			return res.status(404).json({ error: 'User not found' });
		}

		// Log the userToUnblock details
		console.log('User to unblock details:', userToUnblock);

		// Unblock the user
		const currentUser = await User.findById(loggedInUserId);
		if (!currentUser) {
			console.log(`Logged-in user with ID ${loggedInUserId} not found.`);
			return res.status(404).json({ error: 'Logged-in user not found' });
		}

		// Convert ObjectIDs to strings for comparison
		const userToUnblockIdStr = userToUnblock._id.toString();
		const blockedUsersIds = currentUser.blockedUsers.map(id => id.toString());

		// Debugging logs
		console.log('Blocked users IDs:', blockedUsersIds);
		console.log('User to unblock ID:', userToUnblockIdStr);

		// Check if userToUnblockIdStr is in blockedUsersIds
		if (blockedUsersIds.includes(userToUnblockIdStr)) {
			// Remove userToUnblockIdStr from blockedUsers
			currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userToUnblockIdStr);
			await currentUser.save();
			console.log(`User ${userToUnblockIdStr} unblocked successfully.`);
			return res.status(200).json({ message: 'User unblocked successfully' });
		} else {
			console.log(`User ${userToUnblockIdStr} is not currently blocked.`);
			return res.status(400).json({ error: 'User is not currently blocked' });
		}
	} catch (error) {
		console.error('Error in UnblockUser:', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
};









export const isUserBlocked = async (req, res) => {
	try {
		const { userId } = req.params;
		const loggedInUserId = req.user._id;

		// Find the logged-in user
		const currentUser = await User.findById(loggedInUserId);

		// Check if the user is blocked
		const isBlocked = currentUser.blockedUsers.includes(userId);

		res.status(200).json({ isBlocked, message: 'User is' });
	} catch (error) {
		console.error('Error in checkBlockStatus:', error.message);
		res.status(500).json({ error: 'Internal server error' });
	}
}



