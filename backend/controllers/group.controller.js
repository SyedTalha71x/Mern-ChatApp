import Group from '../models/group.model.js';
import User from '../models/user.model.js'

export const createGroupwithMembers = async (req, res) => {
    try {
        const { name, memberIds } = req.body; // Expect name and memberIds array in request body
        const creatorId = req.user._id; // Assuming the logged-in user is the creator

        // Validate input
        if (!name || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ error: 'Name and non-empty memberIds array must be provided' });
        }

        // Ensure all memberIds are unique
        const uniqueMemberIds = Array.from(new Set(memberIds));

        // Include creator in the members list
        const allMembers = [...new Set([...uniqueMemberIds, creatorId])];

        // Create the group with the creator and initial members
        const group = new Group({
            name,
            creator: creatorId,
            members: allMembers
        });

        await group.save();

        // Add group reference to users
        await User.updateMany(
            { _id: { $in: allMembers } },
            { $push: { groups: group._id } }
        );

        res.status(201).json({ group, message: 'Group created successfully with members' });
    } catch (error) {
        console.log("Error in createGroupwithMembers:", error);
        res.status(500).json({ error: 'Failed to create group with members' });
    }
}

