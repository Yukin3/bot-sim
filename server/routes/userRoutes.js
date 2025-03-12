import express from "express";
import * as UserController from "../controllers/userController.js";
import * as AchievementController from "../controllers/achievementController.js";


const router = express.Router();

router.get("/:username", UserController.getUserByUsername); //username lookup
router.get("/:username/stats", UserController.getUserStats); //Stats
router.get("/:userId/achievements", AchievementController.getUserAchievements); //Trophies



export default router;
