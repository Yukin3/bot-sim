import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, SquarePen } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Avatar, AvatarImage } from "./ui/avatar";

interface Room {
  id: number;
  name: string;
  description: string;
  status: string;
  restriction_level: number;
}

interface SidebarProps {
  isCollapsed: boolean;
  isMobile: boolean;
}


const API_URL = "http://localhost:8080/api"


export function Sidebar({ isCollapsed, isMobile }: SidebarProps) {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms`);
        const data = await response.json();
        setRooms(data); // Store rooms in state
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div
      data-collapsed={isCollapsed}
      className="relative group flex flex-col h-full bg-muted/10 dark:bg-muted/20 gap-4 p-2 data-[collapsed=true]:p-2"
    >
      {!isCollapsed && (
        <div className="flex justify-between p-2 items-center">
          <div className="flex gap-2 items-center text-2xl">
            <p className="font-medium">Rooms</p>
            <span className="text-zinc-300">({rooms.length})</span>
          </div>
          <div>
            <button
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}
              onClick={() => console.log("More options clicked")}
            >
              <MoreHorizontal size={20} />
            </button>
            <button
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9")}
              onClick={() => console.log("New chat clicked")}
            >
              <SquarePen size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => navigate(`/room/${room.id}`)}
            className={cn(
              buttonVariants({ variant: "ghost", size: "xl" }),
              "justify-start gap-4 w-full flex items-center p-2"
            )}
          >
            <Avatar className="flex justify-center items-center">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${room.name}`} alt={room.name} className="w-10 h-10 " />
            </Avatar>
            <div className="flex flex-col max-w-28">
              <span>{room.name}</span>
              <span className="text-zinc-400 text-xs truncate">{room.description}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
}
