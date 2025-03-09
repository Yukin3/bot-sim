import * as ConversationModel from "../models/conversationModel.js";
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


export const handleBotResponse = async (roomId, io) => {
    // console.log("Bot response triggered for Room ID:", roomId);

    let lastMessage = await fetchLastMessage(roomId);
    if (!lastMessage) {
        console.log("No last message found. Skipping bot response.");
        return null;
    }

    // console.log("Last Message:", lastMessage);

    const botsInRoom = await fetchBotsInRoom(roomId);
    // console.log("Bots in Room:", botsInRoom);

    if (!botsInRoom.length) {
        console.log("No bots found in room. Skipping response.");
        return null;
    }

    let responseCount = 0;

    while (responseCount < 3) {
        const lastBotId = lastMessage.bot_id;

        let respondingBot;
        if (lastBotId) {
            const lastSpeakerIndex = botsInRoom.findIndex(bot => bot.id === lastBotId);
            const nextSpeakerIndex = (lastSpeakerIndex + 1) % botsInRoom.length;
            respondingBot = botsInRoom[nextSpeakerIndex];
        } else {
            respondingBot = botsInRoom[Math.floor(Math.random() * botsInRoom.length)];
        }

        console.log("Responding bot selected:", respondingBot.name);

        // Emit bot typing event
        io.to(roomId).emit("bot_typing", { botId: respondingBot.id });

        const botResponse = await generateBotMessage(respondingBot, lastMessage, botsInRoom);

        if (!botResponse) {
            console.log("Bot response was empty. Stopping chain.");
            return null;
        }

        console.log("Bot is replying:", botResponse);

        let savedBotMessage = await saveMessage({
            roomId,
            senderType: "bot",
            botId: respondingBot.id,
            userId: null,
            message: botResponse,
            replyTo: lastMessage.id,
        });

        lastMessage = savedBotMessage; // Update last message reference
        responseCount++;

        //Emit bot response
        io.to(roomId).emit("receive_message", savedBotMessage);

        // Emit bot stopped_typing
        io.to(roomId).emit("bot_stopped_typing", { botId: respondingBot.id });

        
        //Delay for typing simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("Bot conversation ended after", responseCount, "replies.");
};



