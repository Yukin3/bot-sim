import express from "express";
import * as BotController from "../controllers/botController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import * as AchievementController from "../controllers/achievementController.js";


const router = express.Router();

router.get("/all", BotController.getAllBots); // All bots 
router.get("/public", BotController.getPublicBots); //All public bots
router.get("/:id", BotController.getBotById); //Id lookup
router.get("/user", authenticate, BotController.getUserBots); //All user's bots
router.get("/user/public", authenticate, BotController.getUserPublicBots); //User's public bots
router.get("/user/private", authenticate, BotController.getUserPrivateBots); //User's private bot
router.get("/:botId/achievements", AchievementController.getBotAchievements); //Milestones

// router.get("/rooms/:id/bots", BotController.getBotsInRoom);


export default router;
