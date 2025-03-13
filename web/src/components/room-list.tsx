import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare, MessageSquareLock, MapPlus } from "lucide-react"; 
import { SearchBar } from "./search-bar";
import StatusIndicator from "./status-indicator";


interface Room {
    id: number;
    name: string;
    description: string;
    restriction_level: number; 
    bot_count: number; 
    status: string; 
    visibility: string; 
    image_url?: string | null; 
  }
  

export default function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = import.meta.env.VITE_BACKEND_URL;


  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms`);
        if (!response.ok) throw new Error("Failed to fetch rooms");
        const data: Room[] = await response.json();

        //Match response to interface
        const formattedRooms: Room[] = data.map((room) => ({
          ...room,
          bot_count: Number(room.bot_count), // Convert string to number
        }));
    
        setRooms(formattedRooms); //Store transformed data
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
      } else {
          setError("An unknown error occurred"); //Handle unexpected error
      }
        } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter((room) =>
    room?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-bold mb-4">Explore Rooms</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join rooms to interact with AI bots and other users in real-time discussions.
            </p>
                <div className="w-1/2 max-w-2xl mr-[300px] mt-2 mb-8 mx-auto" >
                    <SearchBar
                    placeholder="Search bots..."
                    data={rooms.map((room) => ({
                      id: room.id,
                      label: room.name,
                      description: room.description,
                    }))}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSelect={(room) => console.log("Selected Room:", room)}
                    />
                </div>
          </div>
          <div className="mb-4">
                <Link to="/room/new"> 
                <Button size="default" variant="secondary" className="gap-2">
                    <MapPlus  className="h-5 w-5" />
                    Create a New Room
                </Button>
                </Link>
          </div>

          {loading && <p className="text-center text-gray-500">Loading rooms...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* Rooms list */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-md transition-shadow"> 
                <CardHeader
                    className="h-32 bg-cover bg-center text-white flex flex-col justify-between pt-2 -mt-6"
                    style={{
                        backgroundImage: `url(https://api.dicebear.com/9.x/glass/svg?seed=Pelix&d&size=128)`,
                    }}>

                  <div className="flex justify-between items-start">
                    {room.visibility === "public" ? (
                      <MessagesSquare className="h-8 w-8" />
                    ) : (
                      <MessageSquareLock className="h-8 w-8" />
                    )}
                    <Badge variant="secondary">{room.bot_count}  {room.bot_count !== 1 ? 'Members' : 'Member'}</Badge>
                  </div>
                  <CardTitle className="mt-4 pb-2">{room.name}</CardTitle>
                  <CardDescription className="text-foreground/70 -mt-2 pb-3">{room.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0.5">
                    {/* Status indicator */}
                    <div className="flex items-center gap-2 pb-5">
                      {/* //TODO: FIX status indicator */}
                        {/* <status-indicator
                        className="scale-125" // Scale up size
                        {...(room.status === "active"
                        ? { positive: true, pulse: true }
                        : { intermediary: true })}
                        ></status-indicator> */}
                        <StatusIndicator
                          className="scale-125" // Scale up size
                          {...(room.status === "active"
                            ? { positive: true, pulse: true }
                            : { intermediary: true })}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {room.status === "active" ? "Active" : "Passive"}
                        </span>
                    </div>
                    <p className="text-left text-gray-500 -mt-2 pb-2">
                        Topics:
                    </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{room.bot_count} topics</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/room/${room.id}`} className="w-full">
                    <Button className="w-full">Join Room</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
