import { findUserById } from "../models/userModel.js";
import * as UserModel from "../models/userModel.js";

export const fetchUserById = async (id) => {
    return await findUserById(id);
};

export const fetchUserByUsername = async (username) => {
    return await UserModel.findUserByUsername(username);
};

export const fetchUserStats = async (username) => {
    return await UserModel.findUserStats(username);
};
