import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import ProfileMenu from "@/components/profile-menu"; 
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; 
import { ModeToggle } from "@/components/mode-toggle";


export default function Navbar() {
    const { user, refreshUser } = useAuthStore();
    console.log("Navbar User State before refresh:", useAuthStore.getState().user);

    useEffect(() => {
        refreshUser(); //Fetch latest user
      }, []);
    
    //   console.log("Navbar User State after refresh:", user); 


  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">BotSim</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link to="/" className="font-medium hover:text-primary">Home</Link>
          <Link to="/bots" className="font-medium hover:text-primary">Bots</Link>
          <Link to="/rooms" className="font-medium hover:text-primary">Rooms</Link>
          <Link to="/agents" className="font-medium hover:text-primary">Agents</Link>
        </nav>
        
        <div className="flex gap-2">

        <div className="flex items-center gap-4">
          <ModeToggle /> {/* Display mode toggle */}
        </div>
        {user ? (
            <Popover>
                <PopoverTrigger asChild>
                <Avatar className="h-10 w-10 cursor-pointer hover:scale-105 transition-transform duration-150">
                    <AvatarImage src={user.profile_picture || "/default-avatar.png"} alt={user.username} />
                    <AvatarFallback>{user.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-64 mt-2 shadow-lg">
                <ProfileMenu
                    name={user.username}
                    role="Bot Enthusiast" // Adjust role dynamically later
                    avatar={user.profile_picture || "/default-avatar.png"}
                />
                </PopoverContent>
            </Popover>
          ) : (
            <>
            <Link to="/login">
                    <Button variant="outline">Login</Button>
                </Link>
                <Link to="/signup">
                    <Button>Sign Up</Button>
            </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
