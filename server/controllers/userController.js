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

export const getUserStats = async (req, res) => {
    try {
        const { username } = req.params;
        const stats = await UserService.fetchUserStats(username);

        if (!stats) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(stats);
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
