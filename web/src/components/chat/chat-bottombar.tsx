import {
    FileImage,
    Mic,
    Paperclip,
    PlusCircle,
    SendHorizontal,
    ThumbsUp,
  } from "lucide-react";
  import { Link } from "react-router-dom";
  import React, { useEffect, useRef, useState } from "react";
  import { Button, buttonVariants } from "../ui/button";
  import { cn } from "@/lib/utils";
  import { AnimatePresence, motion } from "framer-motion";
  // import { Message, loggedInUserData } from "@/data/data";
  import { EmojiPicker } from "../emoji-picker";
  import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
  import { ChatInput } from "@/components/ui/chat/chat-input";
  import useChatStore from "@/hooks/useChatStore";
  import { useAuthStore } from "@/hooks/useAuthStore";
  // import { sendMessage } from "@/services/chatAPI";
  // import { generateBotResponse } from "@/utils/generateBotResponse";
  import io from "socket.io-client";

  const socket = io("http://localhost:8080");


  interface ChatBottombarProps {
    isMobile: boolean;
    roomId: string;
  }

  interface Message {
    id: string;
    roomId: string;
    senderType: "user" | "bot";
    userId?: number;
    botId?: number | null;
    message: string;
    replyTo?: number | null;
    status?: "sending" | "failed" | "sent";
    sender_avatar?: string;
    avatar: string;
    name: string;
    timestamp: string;
}

  
  export const BottombarIcons = [{ icon: FileImage }, { icon: Paperclip }];
  
  export default function ChatBottombar({ isMobile, roomId }: ChatBottombarProps) {
    const [message, setMessage] = useState<string>("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const setMessages = useChatStore((state) => state.setMessages );
    const [isLoading, setIsLoading] = useState(false);
    const API_URL = "http://localhost:8080/api/conversations";

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          handleSend();
        }
    
        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault();
          setMessage((prev) => prev + "\n");
        }
      };
  
      const handleThumbsUp = () => {
        const { currentUser } = useChatStore.getState(); // ✅ Get user from Zustand
      
        if (!currentUser) {
          console.error("Cannot send thumbs up: No user is logged in.");
          return;
        }
      
        const newMessage: Message = {
          id: `temp-${Date.now()}`, // ✅ Generates a unique string ID
          roomId, // ✅ Room ID from props
          senderType: "user",
          userId: currentUser.id,
          botId: null,
          message: "👍",
          replyTo: null,
          status: "sent", // ✅ Can also be "sending"
          sender_avatar: currentUser.profile_picture || "default-avatar.png",
          avatar: currentUser.profile_picture || "default-avatar.png",
          name: currentUser.username || "Unknown User",
          timestamp: new Date().toISOString(),
        };
      
        sendMessage(newMessage);
        setMessage(""); // ✅ Reset input field after sending
      };
  

    useEffect(() => {
        // Join room on mount
        socket.emit("joinRoom", roomId);
    
        return () => {
          // Leave room on unmount
          socket.emit("leaveRoom", roomId);
        };
    }, [roomId]);
    
    const handleSend = async () => {
      if (!message.trim()) return;
    
      const { user, token } = useAuthStore.getState();
    
      if (!user || !token) {
        console.error("Cannot send message: No authenticated user.");
        return;
      }

      setIsLoading(true);
    
      const tempId = `temp-${Date.now()}`;
    
      // const tempMessage = {
      //   id: tempId,
      //   roomId,
      //   senderType: "user",
      //   userId: user.id,
      //   botId: null,
      //   message: message.trim(),
      //   replyTo: null,
      //   status: "sending",
      //   sender_avatar: user.profile_picture || "default-avatar.png",
      //   timestamp: new Date().toISOString(),
      // };
      const tempMessage: Message = {
        id: tempId,
        roomId,
        senderType: "user",
        userId: user.id,
        botId: null,
        message: message.trim(),
        replyTo: null,
        status: "sending",
        sender_avatar: user.profile_picture || "default-avatar.png",
        avatar: user.profile_picture || "default-avatar.png", // Ensure avatar is included
        name: user.name || "Unknown User", // Ensure name is included
        timestamp: new Date().toISOString(),
    };
    
      //TODO:FIX Optimistic UI update
      setMessages((prevMessages: Message[]) => [...prevMessages, tempMessage]);
      setMessage("");
    
      try {
        const response = await fetch(`${API_URL}/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId,
            senderType: "user",
            userId: user.id,
            botId: null,
            message: message.trim(),
            replyTo: null,
          }),
        });
    
        if (!response.ok) throw new Error("Failed to send message.");
    
        const savedMessage = await response.json();
    
        // Replace temp message
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === tempId ? savedMessage : msg))
        );
      } catch (error) {
        console.error("Failed to send message:", error);
    
        // Mark failed message
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === tempId ? { ...msg, status: "failed" } : msg
          )
        );
      }
    };
    

    const sendMessage = (newMessage: Message) => {
      useChatStore.setState((state) => ({
        messages: [...state.messages, newMessage],
      }));
    };
        
    // const formattedTime = new Date().toLocaleTimeString("en-US", {
    //   hour: "numeric",
    //   minute: "2-digit",
    //   hour12: true,
    // });

  
    return (
      <div className="px-2 py-4 flex justify-between w-full items-center gap-2">
        <div className="flex">
          <Popover>
            <PopoverTrigger asChild>
              <Link
                to="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9",
                  "shrink-0",
                )}
              >
                <PlusCircle size={22} className="text-muted-foreground" />
              </Link>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-full p-2">
              {message.trim() || isMobile ? (
                <div className="flex gap-2">
                  <Link
                    to="#"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-9 w-9",
                      "shrink-0",
                    )}
                  >
                    <Mic size={22} className="text-muted-foreground" />
                  </Link>
                  {BottombarIcons.map((icon, index) => (
                    <Link
                      key={index}
                      to="#"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-9 w-9",
                        "shrink-0",
                      )}
                    >
                      <icon.icon size={22} className="text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  to="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "shrink-0",
                  )}
                >
                  <Mic size={22} className="text-muted-foreground" />
                </Link>
              )}
            </PopoverContent>
          </Popover>
          {!message.trim() && !isMobile && (
            <div className="flex">
              {BottombarIcons.map((icon, index) => (
                <Link
                  key={index}
                  to="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "shrink-0",
                  )}
                >
                  <icon.icon size={22} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
  
        <AnimatePresence initial={false}>
          <motion.div
            key="input"
            className="w-full relative"
            layout
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              opacity: { duration: 0.05 },
              layout: {
                type: "spring",
                bounce: 0.15,
              },
            }}
          >
            <ChatInput
              value={message}
              ref={inputRef}
              onKeyDown={handleKeyPress}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="rounded-full"
            />
            <div className="absolute right-4 bottom-2  ">
              <EmojiPicker
                onChange={(value) => {
                  setMessage(message + value);
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              />
            </div>
          </motion.div>
  
          {message.trim() ? (
            <Button
              className="h-9 w-9 shrink-0"
              onClick={handleSend}
              disabled={isLoading}
              variant="ghost"
              size="icon"
            >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
            ) : (
              <SendHorizontal size={22} className="text-muted-foreground" />
            )}     
            </Button>
          ) : (
            <Button
              className="h-9 w-9 shrink-0"
              onClick={handleThumbsUp}
              disabled={isLoading}
              variant="ghost"
              size="icon"
            >
              <ThumbsUp size={22} className="text-muted-foreground" />
            </Button>
          )}
        </AnimatePresence>
      </div>
    );
  }
  