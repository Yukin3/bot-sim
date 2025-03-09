import db from "../config/db.js";

export const getAllRooms = async () => {
    const result = await db.query(`
        SELECT 
            r.*, 
            COUNT(br.bot_id) AS bot_count  
        FROM rooms r
        LEFT JOIN bot_rooms br ON r.id = br.room_id
        GROUP BY r.id
        ORDER BY r.id ASC
    `);
    return result.rows;
};


export const getRoomById = async (id) => {
    console.log("Querying Room ID:", id); 

    const result = await db.query(`
        SELECT 
            r.*, 
            COUNT(br.bot_id) AS bot_count  
        FROM rooms r
        LEFT JOIN bot_rooms br ON r.id = br.room_id
        WHERE r.id = $1
        GROUP BY r.id
    `, [id]);

    console.log("Query Result:", result.rows[0]);

    return result.rows[0] || null; // Null if room not found
};


export const createRoom = async (name, description, status, restriction_level) => {
    const result = await db.query(
        "INSERT INTO rooms (name, description, status, restriction_level) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, description, status, restriction_level]
    );
    return result.rows[0];
};

export const updateRoom = async (id, name, description, status, restriction_level) => {
    const result = await db.query(
        "UPDATE rooms SET name = $1, description = $2, status = $3, restriction_level = $4, last_updated = NOW() WHERE id = $5 RETURNING *",
        [name, description, status, restriction_level, id]
    );
    return result.rows[0];
};

export const deleteRoom = async (id) => {
    const result = await db.query("DELETE FROM rooms WHERE id = $1 RETURNING *", [id]);
    return result.rows[0];
};
