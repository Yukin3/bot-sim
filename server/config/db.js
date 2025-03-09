import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';


const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    // connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
    // ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});


pool.query("SELECT NOW()", (err, res) => { 
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Database connected at:", res.rows[0].now);
    }
});

export default pool;




