import * as ConversationService from "../services/conversationService.js";
import { handleBotResponse } from "../services/conversationService.js";
import * as RoomService from "../services/roomService.js"; // Import Room logic


export const getAllConversations = async (req, res) => {
    try {
        const conversations = await ConversationService.fetchAllConversations();
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ error: "Error fetching conversations" });
    }
};


export const getRoomConversations = async (req, res) => {
    try {
        // console.log("Checking User:", req.user);

        const roomId = req.params.id;

        // Fetch room details
        const room = await RoomService.fetchRoomById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found." });
        }

        // Public access
        if (room.visibility === "public") {
            const conversations = await ConversationService.fetchRoomConversations(roomId);
            return res.json(conversations);
        }

        // Auth required
        if (!req.user) {
            console.log("Unauthorized: User not found in request.");
            return res.status(403).json({ error: "Unauthorized. Token required." });
        }

        // Fetch conversations 
        console.log("Authorized User:", req.user);
        const conversations = await ConversationService.fetchRoomConversations(roomId);
        res.json(conversations);
    } catch (error) {
        console.error("Error fetching room conversations:", error);
        res.status(500).json({ error: "Error fetching conversations" });
    }
};


export const createMessage = async (req, res) => {
    try {
        const { roomId, senderType, botId, userId, message, replyTo } = req.body;

        // console.log("Received Message:", { roomId, senderType, botId, userId, message });

        // Save user message
        const savedMessage = await ConversationService.saveMessage({
            roomId,
            senderType,
            botId,
            userId,
            message,
            replyTo,
        });

        console.log("Message saved successfully:", savedMessage);

        // Trigger bot response to user
        if (senderType === "user") {
            console.log("Calling handleBotResponse...");
            await ConversationService.handleBotResponse(roomId);
        }

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Failed to save message" });
    }
};


export const getLastMessage = async (req, res) => {
    try {
        const { id: roomId } = req.params;
        const lastMessage = await ConversationService.fetchLastMessage(roomId);
        
        if (!lastMessage) {
            return res.json({ message: "No messages yet." });
        }

        res.json(lastMessage);
    } catch (error) {
        console.error("Error fetching last message:", error);
        res.status(500).json({ error: "Error fetching last message" });
    }
};


export const sendMessage = async (req, res) => {
    try {
        const { roomId, senderType, botId, userId, message } = req.body;

        // Insert user message
        const userMessage = await insertMessage({
            roomId,
            senderType,
            botId: botId || null,
            userId: userId || null,
            message,
            replyTo: null,
        });

        // Trigger bot response
        const botResponse = await handleBotResponse(roomId);
        console.log("!!!ROOM ID:",roomId)
        res.status(201).json({ userMessage, botResponse });
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ error: "Failed to save message." });
    }
};

