import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },  // Payload
    process.env.JWT_SECRET,  // Secret key
    { expiresIn: "7d" }  //Set exp
  );
};
