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

