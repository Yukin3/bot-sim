import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwtUtils.js";
import { findUserByEmail, findUserByProviderId, createUser, findUserById } from "../models/userModel.js";

export const googleAuthCallback = async (req, res) => {
  try {
    const { id, username, name, email, avatar, provider } = req.user;
    // console.log("Extracted Data:", { id, username, name, email, avatar, provider });

    
    const finalUsername = username || safeDisplayName.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
    const safeName = name || `GhUser${id}`;

    // console.log("Creating ", provider, " user !");

    let user = await findUserByProviderId(provider, id);
    if (!user) {
        user = await createUser(safeName, finalUsername, email, avatar, provider, id);
    }

    // console.log("User successfully created:", user);

    const token = generateToken(user); // Generate JWT

    // Redirect to frontend w token
    return res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
    
  } catch (error) {
    console.error("Error in Google callback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const githubAuthCallback = async (req, res) => {
    try {
        const { id, username, name, email, avatar, provider } = req.user;

    
    // console.log("Extracted Data:", { id, username, name, email, avatar, provider });

    const finalUsername = username || safeDisplayName.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
   const safeName = name || `GhUser${id}`;

    // console.log("Creating ", provider, " user !");


    let user = await findUserByProviderId(provider, id);
    if (!user) {
        user = await createUser(safeName, finalUsername, email, avatar, provider, id);
    }

    console.log("User successfully created:", user);
    const token = generateToken(user);

    return res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
     
    } catch (error) {
      console.error("Error in GitHub OAuth callback:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
};

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Check if existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    //  Hash passwords
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = await createUser(name, username, email, hashedPassword, "email", null);

    // console.log("New user ", user, " registered");

    const token = generateToken(user);  //Generate JWT Token

    if (!token) {
        console.error("Token generation failed!");
        return res.status(500).json({ error: "Internal server error." });
    }
  
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.status(201).json({ message: "User registered successfully!", token, user });
  } catch (error) {
    console.error("Error in user registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Compare password input
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // console.log("User authenticated:", user);

    const token = generateToken(user); // Generate JWT


    if (!token) {
        console.error("Token generation failed!");
        return res.status(500).json({ error: "Internal server error." });
    }

    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.status(200).json({ message: "Login successful!", token, user });
  } catch (error) {
    console.error("Error in user login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getUserProfile = async (req, res) => {
    try {
      const userId = req.user.id; 
  
      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Return user details
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        provider: user.provider,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  