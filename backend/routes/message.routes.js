import express from "express";
import { getMessages, sendMessage, deleteMessageForYou, deleteMessageForEveryone, markAsDelivered, markAsRead, sendGroupMessage, getGroupMessages } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

router.delete("/deleteForMe/:messageId", protectRoute, deleteMessageForYou);
router.delete("/deleteForEveryone/:messageId", protectRoute, deleteMessageForEveryone);
router.put('/delivered/:messageId', protectRoute, markAsDelivered);
router.put('/read/:messageId', protectRoute, markAsRead);

router.post('/sendGroupMessages/:groupId', protectRoute, sendGroupMessage);
router.get('/getGroupMessages/:groupId', protectRoute, getGroupMessages);

export default router;
