// import {
//     ChatBotMessages,
//     Message,
//     UserData,
//     userData,
//     Users,
//   } from "@/data/data";
  import { create } from "zustand";
  
  export interface Example {
    name: string;
    url: string;
  }

  export interface Message {
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

  interface User {
    id: number;
    username: string;
    email: string;
    profile_picture: string; // Avatar
    provider: string;
  }
  
  interface State {
    currentUser: User | null;
    selectedExample: Example;
    examples: Example[];
    input: string;
    chatBotMessages: Message[];
    messages: Message[];
    hasInitialAIResponse: boolean;
    hasInitialResponse: boolean;
  }
  
  interface Actions {
    setCurrentUser: (user: User) => void;
    setSelectedExample: (example: Example) => void;
    setExamples: (examples: Example[]) => void;
    setInput: (input: string) => void;
    handleInputChange: (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>,
    ) => void;
    setchatBotMessages: (fn: (chatBotMessages: Message[]) => Message[]) => void;
    setMessages: (fn: (messages: Message[]) => Message[]) => void;
    setHasInitialAIResponse: (hasInitialAIResponse: boolean) => void;
    setHasInitialResponse: (hasInitialResponse: boolean) => void;
  }
  
  const useChatStore = create<State & Actions>()((set) => ({
    currentUser: null, // ✅ This is the actual user object (can be null initially)
  
    setCurrentUser: (user: User) => set({ currentUser: user }), // ✅ Correct type
    
    selectedExample: { name: "Messenger example", url: "/" },
  
    examples: [
      { name: "Messenger example", url: "/" },
      { name: "Chatbot example", url: "/chatbot" },
      { name: "Chatbot2 example", url: "/chatbot2" },
    ],
  
    input: "",
  
    setSelectedExample: (selectedExample) => set({ selectedExample }),
  
    setExamples: (examples) => set({ examples }),
  
    setInput: (input) => set({ input }),
    handleInputChange: (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>,
    ) => set({ input: e.target.value }),
  
    chatBotMessages: [],
    setchatBotMessages: (fn) =>
      set(({ chatBotMessages }: State) => ({ chatBotMessages: fn(chatBotMessages) })),
      // set(({ chatBotMessages }) => ({ chatBotMessages: fn(chatBotMessages) })),
  
    messages:[],
    setMessages: (fn) =>
      // set(({ messages }) => {
      set(({ messages }: State) => {
        const updatedMessages = typeof fn === "function" ? fn(messages) : fn;
        return { messages: [...updatedMessages] };
      }),
        
    hasInitialAIResponse: false,
    setHasInitialAIResponse: (hasInitialAIResponse) =>
      set({ hasInitialAIResponse }),
  
    hasInitialResponse: false,
    setHasInitialResponse: (hasInitialResponse) => set({ hasInitialResponse }),
  }));
  
  export default useChatStore;
  