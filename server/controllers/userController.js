import * as UserService from "../services/userService.js";

export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await UserService.fetchUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Error fetching user by username:", error);
        res.status(500).json({ message: "Server error" });
    }
};
