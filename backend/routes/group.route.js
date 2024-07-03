import { createGroupwithMembers } from "../controllers/group.controller.js";
import protectRoute from '../middleware/protectRoute.js'
import express from 'express';

const router = express.Router();
router.post("/creategroup", protectRoute, createGroupwithMembers);


export default router;