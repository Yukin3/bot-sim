import pool from "../config/db.js";


export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, username, email, profile_picture, provider FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0] || null; //Null if user not found
};

export const findUserByUsername = async (username) => {
    const result = await pool.query(
        `SELECT id, username, email, profile_picture, provider 
         FROM users 
         WHERE username = $1`,
        [username]
    );
    return result.rows[0] || null; //Null if user not found
};

export const findUserByEmail = async (email) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0];
};

export const findUserByProviderId = async (provider, providerId) => {
    const { rows } = await pool.query("SELECT * FROM users WHERE provider = $1 AND provider_id = $2", [provider, providerId]);
    return rows[0];
};

export const createUser = async (name, username, email, password_hash, provider, provider_id) => {
    try {
        // console.log("Inserting User into DB with Provider:", provider); 

        const result = await pool.query(
            `INSERT INTO users (name, username, email, password_hash, provider, provider_id)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, username, email, password_hash, provider, provider_id] 
        );
    
        // console.log("User created:", result.rows[0]);
        return result.rows[0];
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const findUserStats = async (username) => {
    const result = await pool.query(
        `WITH user_data AS (
            SELECT 
                u.id, 
                u.username,
                u.created_at,  -- Creation date
                u.last_active,  -- Last activity 
                COALESCE(bot_count, 0) AS bots_created,
                COALESCE(message_count, 0) AS messages_sent
            FROM users u
            LEFT JOIN (
                SELECT owner_id, COUNT(*) AS bot_count 
                FROM bots 
                GROUP BY owner_id
            ) b ON u.id = b.owner_id
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS message_count
                FROM conversations 
                GROUP BY user_id
            ) c ON u.id = c.user_id
            WHERE u.username = $1
        )
        SELECT 
            ud.*, 
            COALESCE(json_agg(
                jsonb_build_object(
                    'id', b.id,
                    'name', b.name,
                    'xp_points', b.xp_points,
                    'profile_picture', b.profile_picture
                )
                ORDER BY b.xp_points DESC
            ) FILTER (WHERE b.id IS NOT NULL), '[]') AS top_bots
        FROM user_data ud
        LEFT JOIN bots b ON ud.id = b.owner_id
        GROUP BY ud.id, ud.username, ud.created_at, ud.last_active, ud.bots_created, ud.messages_sent;`,
        [username]
    );

    return result.rows[0] || null;
};


