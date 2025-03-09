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
            p.name AS personality_name, 
            p.base_tone, 
            br.status AS presence_status,

            -- Fetch interests + affinity lvls
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
            ) AS total_messages

        FROM bots b
        JOIN personalities p ON b.personality_id = p.id
        LEFT JOIN bot_rooms br ON br.bot_id = b.id 
        LEFT JOIN bot_interests bi ON bi.bot_id = b.id
        LEFT JOIN interests i ON bi.interest_id = i.id  
        WHERE b.id = $1
        GROUP BY b.id, p.id, br.status`,
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
            COALESCE(
                json_agg(DISTINCT i.name) FILTER (WHERE i.name IS NOT NULL), 
                '[]'
            ) AS interests
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
