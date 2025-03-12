import * as AchievementModel from "../models/achievementModel.js";

export const getAchievementsWithProgress = async (category, entityId) => {
  const achievements = await AchievementModel.fetchAchievementsWithProgress(category, entityId);

  return {
    unlocked: achievements.filter((a) => a.unlocked),
    locked: achievements.filter((a) => !a.unlocked),
  };
};
