import * as BotService from "../services/botService.js";

export const getBotsInRoom = async (req, res) => {
    try {
        const bots = await BotService.fetchBotsInRoom(req.params.id);
        res.json(bots);
    } catch (error) {
        console.error("Error fetching bots in room:", error);
        res.status(500).json({ error: "Error fetching bots in room" });
    }
};

export const getBotById = async (req, res) => {
    try {
        const bot = await BotService.fetchBotById(req.params.id);
        if (!bot) return res.status(404).json({ error: "Bot not found" });
        res.json(bot);
    } catch (error) {
        console.error("Error fetching bot:", error);
        res.status(500).json({ error: "Error fetching bot" });
    }
};

export const getAllBots = async (req, res) => {
    try {
        const bots = await BotService.fetchAllBots();
        res.json(bots);
    } catch (error) {
        console.error("Error fetching all bots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getPublicBots = async (req, res) => {
    try {
        const bots = await BotService.fetchPublicBots();
        res.json(bots);
    } catch (error) {
        console.error("Error fetching public bots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserPrivateBots = async (req, res) => {
    try {
        const userId = req.user.id;
        const bots = await BotService.fetchUserPrivateBots(userId);
        res.json(bots);
    } catch (error) {
        console.error("Error fetching user's private bots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserPublicBots = async (req, res) => {
    try {
        const userId = req.user.id;
        const bots = await BotService.fetchUserPrivateBots(userId);
        res.json(bots);
    } catch (error) {
        console.error("Error fetching user's private bots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getUserBots = async (req, res) => {
    try {
        const userId = req.user.id;
        const bots = await BotService.fetchUserPrivateBots(userId);
        res.json(bots);
    } catch (error) {
        console.error("Error fetching user's private bots:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};