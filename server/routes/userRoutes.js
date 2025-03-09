import express from "express";
import * as UserController from "../controllers/userController.js";

const router = express.Router();

router.get("/:username", UserController.getUserByUsername); // Get user by username

export default router;
