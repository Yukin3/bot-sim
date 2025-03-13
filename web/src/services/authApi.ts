export const fetchUserProfile = async (token: string) => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await fetch(`${API_URL}/auth/me`, { 
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` //Send token
        }
      });
  
      if (!response.ok) {
        throw new Error("Unauthorized or invalid token");
      }
  
      return await response.json(); //Return user data
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  };
  