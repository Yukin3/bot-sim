
import dotenv from 'dotenv';
dotenv.config();import OpenAI from "openai";
import * as ConversationModel from "../models/conversationModel.js";
import * as RoomModel from "../models/roomModel.js";
import * as BotModel from "../models/botModel.js";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateBotMessage = async (bot, lastMessage) => {
    console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);
    console.log("AI responding");

    // Fetch room info
    const room = await RoomModel.getRoomById(lastMessage.room_id);
    const roomName = room ? room.name : "an unknown location";

    // Fetch bots in room
    const botsInRoom = await BotModel.getBotsInRoom(lastMessage.room_id);
    const otherBots = botsInRoom.filter(b => b.id !== bot.id);
    const otherBotNames = otherBots.length > 0 
        ? otherBots.map(b => b.name).join(", ")
        : "no other bots";

    // Fetch convo history
    const conversationHistory = await ConversationModel.getConversationsByRoomId(lastMessage.room_id);
    const recentMessages = conversationHistory.slice(-5).map(msg => ({
        role: msg.sender_type === "bot" ? "assistant" : "user",
        content: msg.message
    }));

    // Find last speaker
    const lastBotMessage = conversationHistory.reverse().find(msg => msg.sender_type === "bot");
    const lastBotName = lastBotMessage ? (await BotModel.getBotById(lastBotMessage.bot_id)).name : null;
    
    // Context prompt
    const systemPrompt = `
        You are ${bot.name}, a bot with a ${bot.personality_name} personality.
        You are in ${roomName} with ${otherBotNames}.
        Your current mood is: ${bot.mood.state}.
        Your speech tone is ${bot.base_tone}.
        
        The last thing said was: "${lastMessage.message}". Vary in you reesponse.
        ${lastBotName ? `The last bot that spoke was ${lastBotName}.` : ""}
        
        Simulate natural conversation. Avoid over adressing topics, try to add a new point to the conversation to keep exciting(if appropiate).
        Reply using good spelling, and english but in a manner resmbling text conversation. Respond in a way that reflects your personlity and identity.
    `;

    // Message array 
    const messages = [
        { role: "user", content: systemPrompt }, // Set bot context
        ...recentMessages, //Append recent chats
    ];

    // Call OpenAI API
    const response = await openai.chat.completions.create({
        model: "o1-mini",
        messages,
    });

    // console.log("AI Response:", response.choices[0].message.content);
    return response.choices[0].message.content;
};

