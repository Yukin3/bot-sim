import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, PencilRuler } from "lucide-react"; 
import { SearchBar } from "@/components/search-bar";


interface Bot {
    id: number;
    name: string;
    profile_picture: string;
    mood: string;
    restriction_level: string;
    personality_name: string;
    base_tone: string;
    interests: string[]; // Array of interests
    current_room: { id: number; name: string } | null; 
  }
  

export default function BotsList() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const API_URL = import.meta.env.VITE_BACKEND_URL;


  // Fetch bots
useEffect(() => {
    const fetchBots = async () => {
        try {
            const response = await fetch(`${API_URL}/bots/public`);
            if (!response.ok) throw new Error("Failed to fetch bots");
            const data: Bot[] = await response.json();

            const formattedBots = data.map(bot => ({
                ...bot,
                current_room: bot.current_room || null  //Structure current room
            }));

            setBots(formattedBots);
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

    fetchBots();
}, []);


  const filteredBots = bots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-bold mb-4">Browse Bots</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse pre-designed bots, or hop into the Gearbox and build your own.
            </p>
            <div className="w-1/2 max-w-2xl mr-[300px] mt-2 mb-8 mx-auto" >
              <SearchBar
                placeholder="Search bots..."
                data={bots.map((bot) => ({
                  id: bot.id,
                  label: bot.name,
                  avatar: bot.profile_picture,
                }))}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSelect={(bot) => console.log("Selected Bot:", bot)}
              />
            </div>
          </div>
            <div className="mb-4">
            <Link to="/gearbox">
              <Button size="default" variant="secondary" className="gap-2">
                <PencilRuler className="h-5 w-5" />
                Build a Custom Bot
              </Button>
            </Link>
            </div>

          {/* Handle loading + error */}
          {loading && <p className="text-center text-gray-500">Loading bots...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/*Bots list */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBots.map((bot) => (
              <Card key={bot.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-blue-100 dark:bg-blue-900 className=h-36 bg-cover bg-center text-white flex flex-col justify-between pt-2 -mt-6">
                  <div className="flex justify-between items-start">
                  <Bot className="h-8 w-8 text-stone-200" />
                  <img src={bot.profile_picture} alt={bot.name} className="h-16 w-16 rounded-full object-cover" />
                  <Badge variant="secondary">Rank {bot.restriction_level}</Badge>
                  </div>
                  <CardTitle className="mt-4">{bot.name}</CardTitle>
                  <CardDescription className="text-foreground/70">Personality: {bot.personality_name}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <p className="text-left text-gray-500 -mt-2 pb-2">
                        Interests:
                    </p>
                  <div className="flex flex-wrap gap-2">
                    {bot.interests.length > 0 ? (
                        bot.interests.map((interest, index) => (
                        <Badge key={index} variant="outline">{interest}</Badge>
                        ))
                    ) : (
                        <Badge variant="outline">No Interests</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/bot/${bot.id}`} className="w-full">
                    <Button className="w-full">Bot Profile</Button>
                  </Link>
                    <div className="m-2" />
                    {bot.current_room ? (
                        <Link to={`/room/${bot.current_room.id}`} className="w-full">
                            <Button className="w-full">Observe</Button>
                        </Link>
                    ) : (
                        <Button className="w-full" disabled>No Active Room</Button>
                    )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
