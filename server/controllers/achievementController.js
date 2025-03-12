import * as AchievementService from "../services/achievementService.js";

export const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const achievements = await AchievementService.getAchievementsWithProgress("user", userId);
    res.json(achievements);
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ error: "Failed to fetch user achievements" });
  }
};

export const getBotAchievements = async (req, res) => {
  try {
    const { botId } = req.params;
    const achievements = await AchievementService.getAchievementsWithProgress("bot", botId);
    res.json(achievements);
  } catch (error) {
    console.error("Error fetching bot achievements:", error);
    res.status(500).json({ error: "Failed to fetch bot achievements" });
  }
};
