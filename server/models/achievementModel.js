import db from "../config/db.js";

export const fetchAchievementsWithProgress = async (category, entityId) => {
    const idColumn = category === "user" ? "user_id" : "bot_id";
    const unlockedTable = category === "user" ? "user_achievements" : "bot_achievements";
  
    const achievementsResult = await db.query(
      `
      SELECT 
        a.id, a.name, a.description, a.level, a.xp_reward,
        COALESCE(ap.progress, 0) AS progress,
        COALESCE(ap.target, 0) AS target,
        CASE WHEN ua.achievement_id IS NOT NULL THEN true ELSE false END AS unlocked,
        (
          SELECT ua_inner.unlocked_at 
          FROM ${unlockedTable} ua_inner 
          WHERE ua_inner.achievement_id = a.id 
          AND ua_inner.${idColumn} = $1 
          ORDER BY ua_inner.unlocked_at DESC 
          LIMIT 1
        ) AS unlocked_at
      FROM achievements a
      LEFT JOIN achievements_progress ap 
        ON ap.achievement_id = a.id AND ap.${idColumn} = $1
      LEFT JOIN ${unlockedTable} ua 
        ON ua.achievement_id = a.id AND ua.${idColumn} = $1
      WHERE a.category = $2
      GROUP BY a.id, a.name, a.description, a.level, a.xp_reward, ap.progress, ap.target, ua.achievement_id
      ORDER BY a.level ASC, a.name ASC
    `,
      [entityId, category]
    );
  
    return achievementsResult.rows;
  };
  
