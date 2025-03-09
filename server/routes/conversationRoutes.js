import express from "express";
import * as ConversationController from "../controllers/conversationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", ConversationController.getAllConversations);
// router.get("/rooms/:id/conversations", ConversationController.getRoomConversations);
router.post("/", ConversationController.createMessage);
// router.get("/:id/last-message", ConversationController.getLastMessage);
router.post("/send", verifyToken, ConversationController.createMessage);


export default router;
