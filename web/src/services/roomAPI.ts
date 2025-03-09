export const fetchProtectedRoomConversations = async (roomId: number, token: string) => {
    try {
      console.log("🪙Sending Token in Request:", token); 

      const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/protected-conversations`, {
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
