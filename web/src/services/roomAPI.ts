export const fetchProtectedRoomConversations = async (roomId: number, token: string) => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      console.log("🪙Sending Token in Request:", token); 

      const response = await fetch(`${API_URL}/rooms/${roomId}/protected-conversations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, //Token in header
        },
        credentials: "include", // Cookie credentials
      });

      if (!response.ok) {
        throw new Error("Unauthorized or invalid token");
      }

      return await response.json(); //Return convos
    } catch (error) {
      console.error("Error fetching protected room conversations:", error);
      throw error;
    }
};
