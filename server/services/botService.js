import * as BotModel from "../models/botModel.js";

export const fetchBotsInRoom = async (roomId) => {
    // console.log("Fetching bots in room:", roomId); 
    // console.log("Bots Fetched:", BotModel.getBotsInRoom(roomId)); 

    return await BotModel.getBotsInRoom(roomId);
};

export const fetchBotById = async (id) => {
    return await BotModel.getBotById(id);
};

export const fetchAllBots = async () => {
    return await BotModel.getAllBots();
};

export const fetchPublicBots = async () => {
    return await BotModel.getPublicBots();
};

export const fetchUserPrivateBots = async (userId) => {
    return await BotModel.getUserPrivateBots(userId);
};

export const fetchUserPublicBots = async (userId) => {
    return await BotModel.getUserPublicBots(userId);
};

export const fetchUserBots = async (userId) => {
    return await BotModel.getUserBots(userId);
};