import * as ConversationModel from "../models/conversationModel.js";
import { getBotById } from "../models/botModel.js";
import { fetchBotsInRoom } from "../services/botService.js";
import { generateBotMessage } from "./aiService.js";


export const fetchAllConversations = async () => {
    return await ConversationModel.getAllConversations();
};

export const fetchRoomConversations = async (roomId) => {
    return await ConversationModel.getConversationsByRoomId(roomId);
};

export const fetchLastMessage = async (roomId) => {
    return await ConversationModel.getLastMessage(roomId);
}; 


export const saveMessage = async (messageData) => {
    const { roomId, message, senderType, botId, userId, replyTo } = messageData;

    return await ConversationModel.insertMessage({
        roomId,
        senderType, 
        botId: botId || null,  //Null if user
        userId: userId || null, //Null if bot
        message,
        replyTo: replyTo || null
    });
};


const conversationContexts = new Map();
const MAX_CONTEXT_MESSAGES = 5;

const getContext = (roomId) => {
    if (!conversationContexts.has(roomId)) {
        conversationContexts.set(roomId, []);
    }
    return conversationContexts.get(roomId);
};

const updateContext = (roomId, senderType, message, botId = null) => {
    const context = getContext(roomId);
    context.push({ senderType, message, botId });
    if (context.length > MAX_CONTEXT_MESSAGES) {
        context.shift();
    }
};

export const handleBotResponse = async (roomId, io = null) => {
    if (!io) {
        console.error("Socket.io instance is missing.");
        return;
    }

    const context = getContext(roomId);
    const lastMessage = await ConversationModel.getLastMessage(roomId);
    if (!lastMessage) {
        console.log("No messages in room, skipping bot response.");
        return;
    }

    updateContext(roomId, lastMessage.sender_type, lastMessage.message, lastMessage.bot_id || null);

    const botsInRoom = await fetchBotsInRoom(roomId);
    if (!botsInRoom.length) return;

    if (botsInRoom.length === 1 && lastMessage.sender_type === "user") {
        const bot = botsInRoom[0];
        await replyAsBot(bot, roomId, lastMessage, context, io);
    } else if (botsInRoom.length > 1) {
        for (const bot of botsInRoom) {
            const shouldRespond = await botDecidesToRespond(bot, context, lastMessage);
            if (shouldRespond) {
                await replyAsBot(bot, roomId, lastMessage, context, io);
            }
        }
    }
};

const botDecidesToRespond = async (bot, context, lastMessage) => {
    const prompt = `
        Given the conversation context:
        ${context.map(msg => `${msg.senderType}: ${msg.message}`).join("\n")}
        
        The latest message was: "${lastMessage.message}"
        You're ${bot.name}. Should you respond? Reply strictly with "yes" or "no".
    `;

    const decision = await generateBotMessage(bot, { message: prompt });
    return decision.toLowerCase().includes("yes");
};

const replyAsBot = async (bot, roomId, lastMessage, context, io) => {
    io.to(roomId).emit("bot_typing", { botId: bot.id });

    const prompt = `
        Conversation context:
        ${context.map(msg => `${msg.senderType}: ${msg.message}`).join("\n")}

        You're ${bot.name}. Reply uniquely, contextually, and naturally without repeating previous messages.
    `;

    const botReply = await generateBotMessage(bot, { message: prompt });

    const savedMessage = await ConversationModel.insertMessage({
        roomId,
        senderType: "bot",
        botId: bot.id,
        userId: null,
        message: botReply,
        replyTo: lastMessage.id,
    });

    updateContext(roomId, "bot", botReply, bot.id);

    io.to(roomId).emit("receive_message", savedMessage);
    io.to(roomId).emit("bot_stopped_typing", { botId: bot.id });
};

// Choose random interest by affinity 
const selectWeightedInterest = (interests) => {
    const totalWeight = interests.reduce((acc, curr) => acc + curr.affinity, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const interest of interests) {
        randomWeight -= interest.affinity;
        if (randomWeight <= 0) return interest.interest;
    }
    return interests[0].interest;
};

export const initiateBotConversations = async (io) => {
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour >= 24) {
        console.log("Outside social hours. Skipping bot initiation.");
        return;
    }

    const allRooms = await ConversationModel.getAllRooms(); 
    const roomsToInitiate = allRooms.filter(() => Math.random() < 0.75); // ~75% of rooms

    for (const room of roomsToInitiate) {
        const botsInRoom = await fetchBotsInRoom(room.id);
        if (!botsInRoom.length) continue;

        const initiatingBotBasic = botsInRoom[Math.floor(Math.random() * botsInRoom.length)];
        const initiatingBot = await getBotById(initiatingBotBasic.id);
        if (!initiatingBot || !initiatingBot.interests.length) continue;

        const selectedInterest = selectWeightedInterest(initiatingBot.interests);
        const mood = initiatingBot.mood?.state || "content";

        const otherBots = botsInRoom.filter(bot => bot.id !== initiatingBot.id);
        const shouldAddressBot = otherBots.length && Math.random() < 0.5;
        const addressedBotName = shouldAddressBot
            ? otherBots[Math.floor(Math.random() * otherBots.length)].name
            : null;

        const now = new Date();
        const formattedTime = now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
        });
        const formattedDate = now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        });

        const initiationPrompt = `
            Today is ${formattedDate}, and it's currently ${formattedTime}.
            You're ${initiatingBot.name}. You're feeling ${mood}. Your main interest right now is ${selectedInterest}.
            Start a casual conversation naturally and contextually about your interest.
            ${addressedBotName ? `Address your conversation specifically to ${addressedBotName}. Mention them by name.` : ""}
            Keep it engaging and brief.
        `;

        const botInitiationMessage = await generateBotMessage(initiatingBot, {
            message: initiationPrompt,
        });

        const savedMessage = await ConversationModel.insertMessage({
            roomId: room.id,
            senderType: "bot",
            botId: initiatingBot.id,
            userId: null,
            message: botInitiationMessage,
            replyTo: null,
        });

        io.to(room.id).emit("receive_message", savedMessage);
    }

    console.log("Random bot conversations successfully initiated.");
};
