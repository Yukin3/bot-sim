import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        console.log("Incoming request to a protected route...");

        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", authHeader); 

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error("No valid Authorization header found.");
            return res.status(401).json({ error: "Unauthorized. No token provided." });
        }

        // Extract token
        const token = authHeader.split(" ")[1];
        console.log(" Extracted Token:", token);

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error("Token Verification Failed:", err.message);
                return res.status(403).json({ error: "Invalid token." });
            }

            // Attach user info
            req.user = decoded;
            console.log("Token Verified ! User Info:", req.user);
            next();
        });
    } catch (error) {
        console.error("Error in verifyToken middleware:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ error: "Unauthorized. Token required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info
        next();
    } catch (error) {
        return res.status(403).json({ error: "Invalid token." });
    }
};

