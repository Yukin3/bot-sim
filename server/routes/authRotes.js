import express from "express";
import passport from "passport";
import { registerUser, loginUser } from "../controllers/authController.js";
import { googleAuthCallback, githubAuthCallback } from "../controllers/authController.js";
import { getUserProfile } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();


router.get("/me", verifyToken, getUserProfile); //User details
router.post("/register", registerUser); //Register 
router.post("/login", loginUser); //Login 
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] })); // Google OAuth login
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleAuthCallback); // Google OAuth callback
router.get("/github", passport.authenticate("github", { scope: ["user:email"] })); // GitHub OAuth login
router.get("/github/callback",passport.authenticate("github", { failureRedirect: "/" }), githubAuthCallback); // GitHub OAuth callback
router.get("/logout", (req, res) => { // Logout
    res.clearCookie("token");
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to logout" });
        }
        res.redirect("/");
    });
});


export default router;