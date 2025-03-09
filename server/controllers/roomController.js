import * as RoomService from "../services/roomService.js";

export const getRooms = async (req, res) => {
    try {
        const rooms = await RoomService.fetchAllRooms();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: "Error fetching rooms" });
    }
};

export const getRoom = async (req, res) => {
    try {
        const room = await RoomService.fetchRoomById(req.params.id);
        if (!room) return res.status(404).json({ error: "Room not found" });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: "Error fetching room" });
    }
};

export const createRoom = async (req, res) => {
    try {
        const newRoom = await RoomService.createNewRoom(req.body);
        res.status(201).json(newRoom);
    } catch (error) {
        res.status(500).json({ error: "Error creating room" });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const updatedRoom = await RoomService.modifyRoom(req.params.id, req.body);
        res.json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: "Error updating room" });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const deletedRoom = await RoomService.removeRoom(req.params.id);
        res.json(deletedRoom);
    } catch (error) {
        res.status(500).json({ error: "Error deleting room" });
    }
};
