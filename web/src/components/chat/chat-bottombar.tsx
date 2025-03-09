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
  import { Message, loggedInUserData } from "@/data/data";
  import { EmojiPicker } from "../emoji-picker";
  import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
  import { ChatInput } from "@/components/ui/chat/chat-input";
  import useChatStore from "@/hooks/useChatStore";
  import { useAuthStore } from "@/hooks/useAuthStore";
  import { sendMessage } from "@/services/chatAPI";
  import { generateBotResponse } from "@/utils/generateBotResponse";
  import io from "socket.io-client";

  const socket = io("http://localhost:8080");


  interface ChatBottombarProps {
    isMobile: boolean;
    roomId: string;
  }
  
  export const BottombarIcons = [{ icon: FileImage }, { icon: Paperclip }];
  
  export default function ChatBottombar({ isMobile, roomId }: ChatBottombarProps) {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const setMessages = useChatStore((state) => state.setMessages);
    const [isLoading, setisLoading] = useState(false);
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
      const newMessage: Message = {
        id: message.length + 1,
        name: loggedInUserData.name,
        avatar: loggedInUserData.avatar,
        message: "👍",
      };
      sendMessage(newMessage);
      setMessage("");
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
    
        const { user, token } = useAuthStore.getState(); // Get user from Zustand
    
        if (!user || !token) {
            console.error("Cannot send message: No authenticated user.");
            console.log("Stored Token:", token);
            console.log("Stored User:", user);
            return;
        }
    
        const tempId = `temp-${Date.now()}`; 
        const newMessage = {
            id: tempId,
            roomId,
            senderType: "user",
            userId: user.id,  //Correct user ID
            botId: null,
            message: message.trim(),
            replyTo: null,
            status: "sending",
        };
    
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    
        setMessage(""); 
    
        try {
            await sendMessage(message.trim(), roomId);
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };
    
    
    




  const sendMessage = (newMessage: Message) => {
    useChatStore.setState((state) => ({
      messages: [...state.messages, newMessage],
    }));
  };
      
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  
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
              <SendHorizontal size={22} className="text-muted-foreground" />
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
  