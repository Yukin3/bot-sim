import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
// import React, { useEffect, useState } from "react";
import  { Message } from "@/hooks/useChatStore";
import ChatBottombar from "./chat-bottombar";
// import { generateBotResponse } from "@/utils/generateBotResponse";

interface ChatProps {
  messages?: Message[];
  roomId: string;
  isMobile: boolean;
}

export function Chat({ messages, roomId, isMobile }: ChatProps) {
  // const messagesState = useChatStore((state) => state.messages);

  // const sendMessage = (newMessage: Message) => {
  //   console.log("sendMessage called with:", newMessage);

  //   useChatStore.setState((state) => ({
  //     messages: [...state.messages, newMessage],
  //   }));
  //   // console.log("User message stored:", useChatStore.getState().messages);

  //   // console.log("User message sent:", newMessage.message); 

  //   //TODO: swap for actual bot resposne
  //   //Simulate bot response
  //   setTimeout(() => {
  //       console.log("Bot response triggered!");

  //       const botReply: Message = {
  //       id: newMessage.id + 1,
  //       name: "Bot",
  //       avatar: "https://i.pravatar.cc/40?img=68", // Bot avatar
  //       message: newMessage.message ? generateBotResponse(newMessage.message) : "Hmm, I didn't catch that.",
  //   };
  

  //   // console.log("Bot is replying with:", botReply.message);

  //   useChatStore.setState((state) => {
  //       const updatedMessages = [...state.messages, botReply];
  //       // console.log("Updated messages with bot reply:", updatedMessages); 
  //       return { messages: updatedMessages };
  //     });


  //   //   console.log("Final messages state:", useChatStore.getState().messages);

  //   }, 2000); // Simulate delay
  // };

  
  

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar />

      <ChatList messages={messages ?? []} roomId={roomId}/> 

      <ChatBottombar isMobile={isMobile} roomId={roomId}/>
    </div>
  );
}
