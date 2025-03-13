import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Info, Grip } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { ExpandableChatHeader } from "@/components/ui/chat/expandable-chat";

interface Room {
    id: number;
    name: string;
    last_updated: string;
  }

// Placeholder room images
const roomImages = [
    "https://source.unsplash.com/200x200/?city",
    "https://source.unsplash.com/200x200/?interior",
    "https://source.unsplash.com/200x200/?architecture",
  ];

export const TopbarIcons = [
  { icon: Grip, route: "/" }, //Temp goes home
//   { icon: Video, route: "/video" }, //* Future dideo call route
  { icon: Info, route: (roomId: string) => `/room/${roomId}/info` },
];

export default function ChatTopbar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const roomId = id ?? ""; // ✅ Ensures `roomId` is always a string
  const [room, setRoom] = useState<Room | null>(null);

const API_URL = "http://localhost:8080/api"

  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const res = await fetch(`${API_URL}/rooms/${roomId}`);
        const data = await res.json();
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room info:", error);
      }
    };

    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId]);


  return (
    <ExpandableChatHeader>
      {/* Chat info*/}
      <div className="flex items-center gap-2 w-full justify-center">
        <button
          onClick={() => navigate(`/room/${roomId}/info`)}
          className="focus:outline-none"
        >
          <Avatar className="flex justify-center items-center">
            <AvatarImage
              src={roomImages[Number(roomId) % roomImages.length]} // Chat image
              alt={room?.name || "Room"}
              className="w-10 h-10"
            />
          </Avatar>
        </button>
        <div className="flex flex-col text-center">
          <span className="font-medium">{room?.name || "Loading..."}</span>
          <span className="text-xs text-muted-foreground">
            Last updated: {room?.last_updated ? new Date(room.last_updated).toLocaleString() : "Unknown"}
          </span>
        </div>
      </div>

      {/* Topbar nav icons */}
      <div className="flex gap-2">
        {TopbarIcons.map((item, index) => (
          <button
            key={index}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}
            onClick={() => {
              if (typeof item.route === "function") {
                navigate(item.route(roomId ?? "" )); 
              } else if (item.route !== "#") {
                navigate(item.route); 
              }
            }}
          >
            <item.icon size={20} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </ExpandableChatHeader>
  );
}
