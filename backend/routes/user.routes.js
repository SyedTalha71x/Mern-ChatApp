import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, BlockUser, UnblockUser, isUserBlocked } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);

router.post("/block/:userId", protectRoute, BlockUser);
router.post("/unblock/:userId", protectRoute, UnblockUser);
router.get("/isBlocked/:userId", protectRoute, isUserBlocked);

export default router;
