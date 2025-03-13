"use client";

import React, { useEffect, useState } from "react";
import { useParams, } from "react-router-dom";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "../sidebar";
import { Chat } from "@/components/chat/chat";
// import { userData } from "@/data/data";

interface ChatLayoutProps {
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function ChatLayout({
  defaultLayout = [320, 480],
  defaultCollapsed = false,
  navCollapsedSize,
}: ChatLayoutProps) {
  const { id } = useParams();
  // const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const API_URL = "http://localhost:8080/api"
//   console.log("Chat ID from URL:", id); 

  // const chatId = Number(id);
  // const selectedUser = userData.find((user) => user.id === chatId);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);



    // Fetch convos
    useEffect(() => {
        const fetchConversations = async () => {
          try {
            const response = await fetch(`${API_URL}/rooms/${id}/conversations`);
            const data = await response.json();
            console.log("Fetched messages:", data);
            setMessages(data); // Store in state
          } catch (error) {
            console.error("Error fetching conversations:", error);
          }
        };
    
        if (id) fetchConversations(); // Fetch if room ID exists
      }, [id]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
      }}
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible
        minSize={isMobile ? 0 : 24}
        maxSize={isMobile ? 8 : 30}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className={cn(isCollapsed && "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out")}
      >
        <Sidebar isCollapsed={isCollapsed || isMobile}  isMobile={isMobile} />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Chat messages={messages} roomId={id ?? ""}  isMobile={isMobile} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
