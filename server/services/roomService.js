import * as RoomModel from "../models/roomModel.js";

export const fetchAllRooms = async () => {
    return await RoomModel.getAllRooms();
};

export const fetchRoomById = async (id) => {
    return await RoomModel.getRoomById(id);
};

export const createNewRoom = async (data) => {
    return await RoomModel.createRoom(data.name, data.description, data.status, data.restriction_level);
};

export const modifyRoom = async (id, data) => {
    return await RoomModel.updateRoom(id, data.name, data.description, data.status, data.restriction_level);
};

export const removeRoom = async (id) => {
    return await RoomModel.deleteRoom(id);
};
