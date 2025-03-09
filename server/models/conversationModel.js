import db from "../config/db.js";


export const getAllConversations = async () => {
    const result = await db.query("SELECT * FROM conversations ORDER BY timestamp ASC");
    return result.rows;
};

export const getConversationsByRoomId = async (roomId) => {
    // console.log("Fetching Conversations for Room ID:", roomId);

    try {
        const result = await db.query(
            `SELECT 
                c.id, 
                c.room_id, 
                c.message, 
                c.timestamp, 
                c.sender_type, 
                c.message_type, 
                c.user_id, 
                c.bot_id, 
                c.reply_to,
                COALESCE(b.profile_picture, u.profile_picture) AS sender_avatar
            FROM conversations c
            LEFT JOIN bots b ON c.bot_id = b.id
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.room_id = $1
            ORDER BY c.timestamp ASC`, 
            [roomId]
        );

        // console.log("Conversations Fetched:", result.rows.length);
        return result.rows;
    } catch (error) {
        console.error("Database Query Failed:", error);
        throw new Error("Database error fetching conversations.");
    }
};



export const insertMessage = async ({ roomId, senderType, botId, userId, message, replyTo }) => {
    if (!userId) {
        throw new Error("User ID is required for inserting a message."); 
    }

    // console.log("Inserting message for user_id:", userId); 

    const result = await db.query(
        `INSERT INTO conversations 
        (room_id, sender_type, bot_id, user_id, message, reply_to, timestamp) 
        VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
        RETURNING *`,
        [roomId, senderType, botId || null, userId, message, replyTo || null]
    );

    return result.rows[0];
};


export const getLastMessage = async (roomId) => {
    const result = await db.query(
        `SELECT c.*, 
                COALESCE(b.profile_picture, u.profile_picture) AS sender_avatar
         FROM conversations c
         LEFT JOIN bots b ON c.bot_id = b.id
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.room_id = $1
         ORDER BY c.timestamp DESC 
         LIMIT 1`,
        [roomId]
    );
    return result.rows[0] || null; // Null if no messages
};






