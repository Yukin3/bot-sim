import db from "../config/db.js";

export const getBotsInRoom = async (roomId) => {
const result = await db.query(`
        SELECT 
            b.id, 
            b.name, 
            b.profile_picture,  
            b.mood,  
            b.restriction_level, 
            p.name AS personality_name, 
            p.base_tone, 
            br.status AS presence_status 
        FROM bot_rooms br
        JOIN bots b ON br.bot_id = b.id
        JOIN personalities p ON b.personality_id = p.id 
        WHERE br.room_id = $1 AND br.status = 'active'
    `, [roomId]);

    return result.rows;
};

export const getBotById = async (id) => {
    const result = await db.query(
        `SELECT 
          b.id, 
          b.name, 
          b.profile_picture,  
          b.mood,  
          b.restriction_level, 
          b.created_at,  
          u.username AS owner_username,  
          p.name AS personality_name, 
          p.base_tone, 
          br.status AS presence_status,
    
          -- Fetch interests + affinity levels
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'interest', i.name, 
                'affinity', bi.affinity
              )
            ) FILTER (WHERE i.name IS NOT NULL), 
            '[]'
          ) AS interests,
    
          -- Count num rooms bot is in
          (
            SELECT COUNT(*) 
            FROM bot_rooms 
            WHERE bot_id = b.id
          ) AS affiliated_rooms_count,
    
          -- Count total messages by bot
          (
            SELECT COUNT(*) 
            FROM conversations 
            WHERE bot_id = b.id
          ) AS total_messages,
    
          -- Corrected recent rooms subquery (no duplicates)
          (
            SELECT COALESCE(json_agg(room_data ORDER BY last_active DESC), '[]')
            FROM (
              SELECT DISTINCT ON (br_inner.room_id)
                br_inner.room_id,
                r_inner.name AS room_name,
                br_inner.last_updated AS last_active
              FROM bot_rooms br_inner
              JOIN rooms r_inner ON br_inner.room_id = r_inner.id
              WHERE br_inner.bot_id = b.id
              ORDER BY br_inner.room_id, br_inner.last_updated DESC
              LIMIT 5
            ) room_data
          ) AS recent_rooms
    
        FROM bots b
        JOIN users u ON b.owner_id = u.id  
        JOIN personalities p ON b.personality_id = p.id
        LEFT JOIN bot_rooms br ON br.bot_id = b.id AND br.status = 'active'
        LEFT JOIN bot_interests bi ON bi.bot_id = b.id
        LEFT JOIN interests i ON bi.interest_id = i.id  
        WHERE b.id = $1
        GROUP BY b.id, p.id, br.status, u.username`,
        [id]
      );

    return result.rows[0] || null;
};



export const getAllBots = async () => {
    const result = await db.query(`
        SELECT 
            b.id, 
            b.name, 
            b.profile_picture,  
            b.mood,  
            b.restriction_level, 
            p.name AS personality_name, 
            p.base_tone, 
            COALESCE(
                json_agg(DISTINCT i.name) FILTER (WHERE i.name IS NOT NULL), 
                '[]'
            ) AS interests
        FROM bots b
        LEFT JOIN personalities p ON b.personality_id = p.id
        LEFT JOIN bot_interests bi ON b.id = bi.bot_id
        LEFT JOIN interests i ON bi.interest_id = i.id
        GROUP BY b.id, p.name, p.base_tone
    `);

    return result.rows;
};


export const getPublicBots = async () => {
    const result = await db.query(`
        SELECT 
            b.id, 
            b.name, 
            b.profile_picture,  
            b.mood,  
            b.restriction_level, 
            p.name AS personality_name, 
            p.base_tone, 
            
            -- Fetch interests
            COALESCE(
                json_agg(DISTINCT i.name) FILTER (WHERE i.name IS NOT NULL), 
                '[]'
            ) AS interests,

            -- Fetch current room 
            (
                SELECT jsonb_build_object(
                    'id', r.id,
                    'name', r.name
                )
                FROM bot_rooms br
                JOIN rooms r ON br.room_id = r.id
                WHERE br.bot_id = b.id 
                AND br.status = 'active'
                LIMIT 1
            ) AS current_room

        FROM bots b
        LEFT JOIN personalities p ON b.personality_id = p.id
        LEFT JOIN bot_interests bi ON b.id = bi.bot_id
        LEFT JOIN interests i ON bi.interest_id = i.id
        WHERE b.visibility = 'public'
        GROUP BY b.id, p.name, p.base_tone
    `);

    return result.rows;
};



export const getUserPrivateBots = async (userId) => {
    const result = await db.query(
        "SELECT * FROM bots WHERE visibility = 'private' AND owner_id = $1",
        [userId]
    );
    return result.rows;
};

export const getUserPublicBots = async (userId) => {
    const result = await db.query(
        "SELECT * FROM bots WHERE visibility = 'public' AND owner_id = $1",
        [userId]
    );
    return result.rows;
};

export const getUserBots = async (userId) => {
    const result = await db.query(
        "SELECT * FROM bots WHERE owner_id = $1",
        [userId]
    );
    return result.rows;
};
