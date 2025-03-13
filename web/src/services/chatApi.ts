import { useAuthStore } from "@/hooks/useAuthStore";
import useChatStore from "@/hooks/useChatStore";import io from "socket.io-client";

const socket = io("http://3.92.185.156/:8080"); // Socket connection

export const sendMessage = async (messageText: string, roomId: number) => {
    const { user, token } = useAuthStore.getState(); // Get logged-in user + token
    const API_URL = import.meta.env.VITE_BACKEND_URL;


    if (!user || !token) {
        console.error("Cannot send message: No authenticated user.");
        return;
    }

    try {
        //Send message to server
        const response = await fetch(`${API_URL}/rooms/send-message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`, // Send token for auth
            },
            body: JSON.stringify({
                roomId,
                senderType: "user",
                userId: user.id, 
                message: messageText,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to send message.");
        }

        const newMessage = await response.json();

        // Add message to Zustand store 
        useChatStore.setState((state) => ({
            messages: [...state.messages, newMessage],
        }));

        // Emit message 
        socket.emit("send_message", newMessage);

        console.log("Message sent:", newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
    }
};
