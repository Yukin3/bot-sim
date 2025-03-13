import express from 'express';
import cors from 'cors';
import http from "http";
import cron from 'node-cron';
import { Server } from "socket.io";
import session from "express-session";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";
import pool from './config/db.js';
import roomRoutes from "./routes/roomRoutes.js";
import botRoutes from "./routes/botRoutes.js";
import authRoutes from "./routes/authRotes.js"; 
import userRoutes from "./routes/userRoutes.js"; 
import conversationRoutes from "./routes/conversationRoutes.js";
import { insertMessage } from "./models/conversationModel.js";
import { handleBotResponse, initiateBotConversations } from './services/conversationService.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [ // Allow frontend connection
            "http://localhost:5173", 
            "https://bot-sim.vercel.app"
        ],
        methods: ["GET", "POST"]
    }
});


//middleware
app.use(cors({
    origin: [
         process.env.FRONTEND_URL,
        "http://localhost:5173",    // Local dev
        "https://bot-sim.vercel.app" //Prod url
    ],
    credentials: true }));
app.use(express.json());
app.use(cookieParser());


// Express Session for Oauth
app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.set("io", io);



io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`👋🏾User joined room: ${roomId}`);
    });

    socket.on("send_message", async (messageData) => {
        console.log("New message received:", messageData);

        //Save message to db
        const savedMessage = await saveMessageToDatabase(messageData);

        if (savedMessage) {
            console.log("Message saved, broadcasting to room...");
            
            //Emit message after save
            io.to(messageData.roomId).emit("receive_message", savedMessage);
        }

        // Trigger bot response to user
        if (messageData.senderType === "user") {
            await handleBotResponse(messageData.roomId, io);
        }
    });
    
    

    socket.on("disconnect", () => {
        console.log(`🚪Client disconnected: ${socket.id}`);
    });
});

// Save messages to DB
async function saveMessageToDatabase(messageData) {
    try {
        console.log("🔹 Received Message:", messageData);
        // Assume your model's `insertMessage()` correctly saves and returns the message
        return await insertMessage(messageData);
    } catch (error) {
        console.error("❌ Error saving message:", error);
        return null;
    }
}

// Cron job for bot chime ins
cron.schedule("0 */1,4,7,10,13,16,18,22 * * *", () => {
    console.log("🕒Bot convo initiated on schedule...");
    initiateBotConversations(io);
});


app.get("/", (req, res) => {
    res.send(`<h1>Bot Sim Backend</h1>`)
});

app.use("/api/auth", authRoutes); 
app.use("/api/rooms", roomRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/user", userRoutes);
app.use("/api/conversations", conversationRoutes);


const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
});