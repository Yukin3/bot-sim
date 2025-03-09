export const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/me", { 
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
  