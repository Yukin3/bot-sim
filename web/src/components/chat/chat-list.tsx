import { Message, UserData } from "@/app/data";
import { cn } from "@/lib/utils";
import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import { ChatBubbleAvatar } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleTimestamp } from "@/components/ui/chat/chat-bubble";
import { ChatBubble } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleAction } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleActionWrapper } from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list"; 
import TypingIndicator from "@/components/ui/chat/typing-indicator";
import { useAutoScroll } from "@/components/ui/chat/useAutoScroll";
import { useAuthStore } from "@/hooks/useAuthStore";
import { fetchProtectedRoomConversations } from "@/services/roomAPI";
import { DotsVerticalIcon, HeartIcon, Share1Icon } from "@radix-ui/react-icons";
import { Forward, Heart } from "lucide-react";


interface ChatListProps {
  messages: any[];
  roomId: string;
  isMobile: boolean;
}

const socket = io("http://localhost:8080", {
  transports: ["websocket"],  // Enable websocket
});


export function ChatList({
  roomId,
  isMobile,
}: ChatListProps) {
  const { token } = useAuthStore(); 
  const [messages, setMessages] = useState([]);
  const [typingBotAvatar, setTypingBotAvatar] = useState("https://api.dicebear.com/9.x/big-ears/svg?seed=tiff");
  const [isBotTyping, setIsBotTyping] = useState(false);
  console.log("Rendering messages:", messages);
  const actionIcons = [
    { icon: DotsVerticalIcon, type: "More" },
    { icon: Forward, type: "Like" },
    { icon: Heart, type: "Share" },
  ];

  
  useEffect(() => {
    if (!roomId) {
      console.error("No room ID found!");
      return;
    }
  
    console.log("Connecting to room:", roomId);
    socket.emit("joinRoom", roomId);
  
    const fetchMessages = async () => {
      try {
        let data;
        
        if (token) { 
          console.log("Fetching protected messages...");
          data = await fetchProtectedRoomConversations(roomId, token); // Fetch protected messages if logged in
        } else {
          console.log("Fetching public messages...");
          const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/conversations`);
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
              data = await fetchProtectedRoomConversations(roomId, token);
          } else {
              // console.log("🔓 Fetching public messages after new message...");
              const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/conversations`);
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
                <ChatBubble variant={message.sender_type === "bot" ? "received" : "sent"}>
                  <ChatBubbleAvatar src={message.sender_avatar || "default-avatar.png"}/>
                  <ChatBubbleMessage>
                    {message.message}
                    <ChatBubbleTimestamp timestamp={message.timestamp} />

                    {/* Handle failed messages */}
                    {message.status === "failed" && (
                        <button 
                            className="text-red-500 ml-2 text-xs"
                            onClick={() => handleSend(message)}
                        >
                            Retry 🔄
                        </button>
                    )}

                    {/* Pending indicator */}
                    {message.status === "sending" && (
                        <span className="text-gray-400 ml-2 text-xs">Sending...</span>
                    )}
                  </ChatBubbleMessage>
                  <ChatBubbleActionWrapper>
                    <ChatBubbleAction className="size-7" icon={<DotsVerticalIcon className="size-4" />} />
                    <ChatBubbleAction className="size-7" icon={<Forward className="size-4" />} />
                    <ChatBubbleAction className="size-7" icon={<Heart className="size-4" />} />
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
                            {true ? (  //TODO: set false for text indicator | make dynamic w settings
                                <TypingIndicator />
                            ) : (
                                <span className="text-gray-500 italic">Typing...</span>
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

