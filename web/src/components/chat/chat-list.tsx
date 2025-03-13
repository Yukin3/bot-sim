// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
// import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
// import { ChatBubbleAction } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleActionWrapper, ChatBubble, ChatBubbleTimestamp, ChatBubbleMessage, ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"; 
import TypingIndicator from "@/components/ui/chat/typing-indicator";
// import { useAutoScroll } from "@/components/ui/chat/useAutoScroll"; //TODO: Implement auto scroll
import { useAuthStore } from "@/hooks/useAuthStore";
import { Message } from "@/hooks/useChatStore"; 
import { fetchProtectedRoomConversations } from "@/services/roomAPI";
import { EllipsisVertical, Forward, Heart } from "lucide-react";


interface ChatListProps {
  messages: Message[];
  roomId: string;
  // isMobile: boolean; //TODO: handle mobile support
}

const socket = io("http://3.92.185.156/:8080", {
  transports: ["websocket"],  // Enable websocket
});


export function ChatList({
  roomId,
  // isMobile, //TODO: handle mobile support
}: ChatListProps) {
  const { token } = useAuthStore(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingBotAvatar, setTypingBotAvatar] = useState("https://api.dicebear.com/9.x/big-ears/svg?seed=tiff");
  const [isBotTyping, setIsBotTyping] = useState(false);
  console.log("Rendering messages:", messages);
  const actionIcons = [
    { icon: EllipsisVertical, type: "More" },
    { icon: Forward, type: "Like" },
    { icon: Heart, type: "Share" },
  ];
  const API_URL = import.meta.env.VITE_BACKEND_URL;


  
  useEffect(() => {
    if (!roomId) {
      console.error("No room ID found!");
      return;
    }
  
    console.log("Connecting to room:", roomId);
    socket.emit("joinRoom", roomId);
  
    const fetchMessages = async () => {
      try {
        let data: Message[] = [];
        
        if (token) { 
          console.log("Fetching protected messages...");
          data = await fetchProtectedRoomConversations(Number(roomId), token); // Fetch protected messages if logged in
        } else {
          console.log("Fetching public messages...");
          const response = await fetch(`${API_URL}/rooms/${roomId}/conversations`);
          data = await response.json(); // Fetch public messages if not logged in
        }
  
        console.log("Fetched messages:", data);
        setMessages(data); //Update state w fetched messages
  
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
  
    fetchMessages(); //Call when roomId changes
  
  }, [roomId, token]); // Re-run when roomId/token changes

useEffect(() => {
    if (!roomId) return;

    console.log("🔗Connecting to room:", roomId);
    socket.emit("joinRoom", roomId);

    // Ensure old listeners are removed
    socket.off("receive_message");

    // Append new messages
    socket.on("receive_message", async (newMessage) => {
      console.log("📩 Live message received:", newMessage);
  
      try {
          let data;
  
          if (token) {
              // console.log("🔒 Fetching protected messages after new message...");
              data = await fetchProtectedRoomConversations(Number(roomId), token);
          } else {
              // console.log("🔓 Fetching public messages after new message...");
              const response = await fetch(`${API_URL}/rooms/${roomId}/conversations`);
              data = await response.json();
          }
  
          // console.log("📥 Updated Messages from Fetch:", data);
  
          if (!Array.isArray(data)) {
              console.error("API returned an unexpected response:", data); //Handle error object
              return;
          }
  
          setMessages(data);
      } catch (error) {
          console.error("Error fetching messages after update:", error);
      }
  });
  

    // Listen for typing emit
    socket.on("bot_typing", (botData) => {
        console.log("🟢 Bot is typing...");
        setIsBotTyping(true);
        setTypingBotAvatar(botData.avatar || "https://api.dicebear.com/9.x/big-ears/svg?seed=tiff");
    });

    socket.on("bot_stopped_typing", () => {
        console.log("🛑 Bot stopped typing.");
        setIsBotTyping(false);
    });

    return () => {
        socket.off("receive_message");
        socket.off("bot_typing");
        socket.off("bot_stopped_typing");
    };
}, [roomId]); // Re-run when room changes




  return (
    <div className="w-full overflow-y-hidden h-full flex flex-col">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-gray-400">Start a conversation</h1>
        </div>  
      ) : (
      <ChatMessageList>
      <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2 p-4"
              >
                <ChatBubble variant={message.senderType === "bot" ? "received" : "sent"}>
                  <ChatBubbleAvatar src={message.sender_avatar || "default-avatar.png"}/>
                  <ChatBubbleMessage>
                    {message.message}
                    <ChatBubbleTimestamp timestamp={message.timestamp} />

                    {/* Handle failed messages */}
                    {/* {message.status === "failed" && (
                        <button 
                            className="text-red-500 ml-2 text-xs"
                            onClick={() => handleSend(message)}
                        >
                            Retry 🔄
                        </button>
                    )} */}

                    {/* Pending indicator */}
                    {message.status === "sending" && (
                        <span className="text-gray-400 ml-2 text-xs">Sending...</span>
                    )}
                  </ChatBubbleMessage>
                  <ChatBubbleActionWrapper>
                  {actionIcons.map((action, index) => (
                  <button key={index} className="p-2">
                    <action.icon className="h-5 w-5" />
                  </button>
                ))}
                  </ChatBubbleActionWrapper>
                </ChatBubble>
              </motion.div>
            ))}

            {/* Typing indicator*/}
              {isBotTyping && (
                <motion.div
                    key="typing-indicator"
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-2 p-4"
                >
                    <ChatBubble variant="received">
                        <ChatBubbleAvatar src={typingBotAvatar}/>
                        <ChatBubbleMessage>
                            {/* {isBotTyping ? (  //TODO: set false for text indicator | make dynamic w settings
                                <TypingIndicator />
                            ) : (
                                <span className="text-gray-500 italic">Typing...</span>
                            )} */}
                            {isBotTyping && (
                                <TypingIndicator />
                              )}
                        </ChatBubbleMessage>
                    </ChatBubble>
                </motion.div>
            )}

          </AnimatePresence>
      </ChatMessageList>
      )}

    </div>
  );
}

