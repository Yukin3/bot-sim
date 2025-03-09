import express from "express";
import * as RoomController from "../controllers/roomController.js";
import * as BotController from "../controllers/botController.js";  
import * as ConversationController from "../controllers/conversationController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", RoomController.getRooms);
router.get("/:id", RoomController.getRoom);
router.post("/", RoomController.createRoom);
router.put("/:id", RoomController.updateRoom);
router.delete("/:id", RoomController.deleteRoom);
router.get("/:id/bots", BotController.getBotsInRoom);
router.get("/:id/last-message", ConversationController.getLastMessage);
router.get("/:id/conversations", ConversationController.getRoomConversations); //Public convos
router.get("/:id/private-conversations", verifyToken, ConversationController.getRoomConversations); //Private convos
router.get("/:id/protected-conversations", verifyToken, ConversationController.getRoomConversations); //User-only convos




export default router;
