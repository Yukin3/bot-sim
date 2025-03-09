import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessagesSquare, Trophy, BarChart3, Calendar, ArrowUpRight } from "lucide-react";

//Interest structure
interface Interest {
    interest: string;
    affinity: number;
  }
  
  interface UserProfile {
    id: number;
    username: string;
    joinDate: string;
    profile_picture: string | null;
    totalScore: number;
    quizzesTaken: number;
    badges: string[];
  }
  
  interface BotProfile {
    id: number;
    name: string;
    profile_picture: string | null;
    mood: string;
    restriction_level: number;
    personality_name: string;
    base_tone: string;
    presence_status: string;
    interests: Interest[]; // Interest + affinity
    affiliated_rooms: number; // Room counts
    total_messages: number; //Total messages counts
    energy_level: number;
    rank: string;
    milestones: string[];
  }
  
export default function Profile() {
  const location = useLocation(); 
  const { id } = useParams<{ id: string }>(); //Get bot ID from URL
  const [profile, setProfile] = useState<UserProfile | BotProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const isUserProfile = !id; //No ID if user
  const username = isUserProfile ? location.pathname.split("/")[1] : null; // Extract username from URL
    console.log("Username: ",username)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = isUserProfile
          ? `http://localhost:8080/api/user/${username}`
          : `http://localhost:8080/api/bots/${id}`;
  
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Profile not found");
  
        const data = await response.json();
  
        if (isUserProfile) {
          //Format user data
          const formattedUser: UserProfile = {
            id: data.id,
            username: data.username,
            joinDate: data.joinDate,
            profile_picture: data.profile_picture || null,
            totalScore: data.totalScore || 0,
            quizzesTaken: data.quizzesTaken || 0,
            badges: data.badges || [],
          };
          setProfile(formattedUser);
        } else {
          //Format bot data
          const formattedBot: BotProfile = {
            id: data.id,
            name: data.name,
            profile_picture: data.profile_picture,
            mood: data.mood?.state || "Neutral",
            restriction_level: data.restriction_level,
            personality_name: data.personality_name,
            base_tone: data.base_tone,
            presence_status: data.presence_status || "Inactive",
            interests: data.interests.map((i: any) => ({
              interest: i.interest,
              affinity: i.affinity,
            })), //Map interests to affinity
            affiliated_rooms: data.affiliated_rooms_count || 0, //Store room count
            total_messages: data.total_messages || 0, //Store message count
            energy_level: data.energy_level || 100,
            rank: data.rank || "Unranked",
            milestones: data.milestones || [],
          };
          setProfile(formattedBot);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, [id, username, isUserProfile]);
  
  

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading profile...</p>;
  if (!profile) return <p className="text-center mt-10 text-red-500">Profile not found.</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Profile header */}
            <div className="bg-card rounded-xl p-6 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <img src={isUserProfile ? (profile as UserProfile).profile_picture : (profile as BotProfile).profile_picture} alt={(profile as BotProfile).name} className="h-16 w-16 rounded-full object-cover" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">
                {isUserProfile ? (profile as UserProfile).username : (profile as BotProfile).name}
                </h1>
                {isUserProfile && (
                  <p className="text-muted-foreground">
                    Joined {(profile as UserProfile).joinDate}
                  </p>
                )}
                {!isUserProfile && (
                  <p className="text-muted-foreground">
                    Mood: {(profile as BotProfile).mood || "Unknown"}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                {!isUserProfile && (
                    <>
                    <Badge variant="outline" className="gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Owner: {(profile as BotProfile).name}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {(profile as BotProfile).id}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                  <status-indicator
                className="scale-125" // Slightly enlarge dot
                    {...((profile as BotProfile).presence_status === "active"
                    ? { positive: true, pulse: true }
                    : { intermediary: true, pulse: true })}
                ></status-indicator>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                    Status:  {(profile as BotProfile).presence_status === "active" ? "Active" : "Passive"}
                </span>
                  </Badge>
                    </>
                )}
                {isUserProfile && (
                    <>
                    <Badge variant="outline" className="gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Status: {(profile as BotProfile).name}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined: {(profile as BotProfile).id}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Trophy className="h-3 w-3" />
                    Last Active: {(profile as BotProfile).presence_status?.toLocaleString()} 
                  </Badge>
                    </>
                    
                )}
                </div>
              </div>

              {/* Header buttons */}
              <div className="flex gap-2">
                {/* Bot */}
                {!isUserProfile && (
                    <Link to={`/rooms/${(profile as UserProfile).id}`}>
                    <Button>Add Bot</Button>
                    </Link>
                )}

                {!isUserProfile && (
                    <Link to={`/rooms/${(profile as UserProfile).id}`}>
                    <Button>Observe Bot</Button>
                    </Link>
                )}
                {/* User */}
                {isUserProfile && (
                    <>
                    <Link to={`/friends/add/${(profile as UserProfile).id}`}>
                        <Button>Add Friend</Button>
                    </Link>
                    <Link to={`/room/new/${(profile as UserProfile).id}`}>
                        <Button>Message User</Button>
                    </Link>
                    </>
                )}
              </div>
            </div>

            {/* Tabs */}
            {isUserProfile && (
              <div className="flex border-b mb-8">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "overview" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "creations" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("creations")}
                >
                  Creations
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "achievements" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("achievements")}
                >
                  Achievements
                </button>
              </div>
            )}

                <div className="rounded-xl p-6 shadow-sm mb-8">
                {/*User profile tabs*/}
                {isUserProfile && activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Bots Created</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="text-3xl font-bold">{(profile as UserProfile).totalScore.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Creator Level</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="text-3xl font-bold">{(profile as UserProfile).quizzesTaken}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="text-3xl font-bold">{(profile as UserProfile).id}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Global Rank</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <div className="text-3xl font-bold"># {(profile as UserProfile).id}</div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Bot info */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Feautured Bots</CardTitle>
                        <CardDescription>User's top performing bots</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-4">
                        {(profile as BotProfile).interests?.map((interest) => (
                        <div key={interest.interest}>
                            <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{interest.interest}</span>
                            <span className="text-sm font-medium">{interest.affinity}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${interest.affinity}%` }}
                            ></div>
                          </div>
                        </div>
                          ))}
                      </div>
                    </CardContent>
                    </Card>

                    {/* Achievements summary */}
                    <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                        <CardDescription>Badges you've earned through engagement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                        {(profile as UserProfile).badges.map((badge) => (
                            <Badge key={badge} variant="secondary" className="px-3 py-1">
                            {badge}
                            </Badge>
                        ))}
                        </div>
                    </CardContent>
                    </Card>
                </div>
                )}

                {/* Achievements full */}
                {isUserProfile && activeTab === "achievements" && (
                <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Earned Badges</CardTitle>
                    <CardDescription>Achievements you've unlocked</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {profile?.badges?.map((badge) => (
                        <div key={badge} className="bg-muted/50 rounded-lg p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">{badge}</p>
                            <p className="text-xs text-muted-foreground mt-1">Earned on Feb 28, 2023</p>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle>Available Badges</CardTitle>
                    <CardDescription>Achievements to unlock</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {["Geography Pro", "Music Maestro", "Entertainment Guru", "100 Quizzes"].map((badge) => (
                        <div key={badge} className="bg-muted/50 rounded-lg p-4 text-center opacity-60">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <Trophy className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">{badge}</p>
                            <p className="text-xs text-muted-foreground mt-1">Not yet earned</p>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>
                </div>
                )}



              {/* Bot profile profile */}
              {!isUserProfile && (
                <div className="grid md:grid-cols-2 gap-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(profile as BotProfile).total_messages.toLocaleString()}</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Affiliated Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                        {(profile as BotProfile).affiliated_rooms}
                        </div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Energy Level</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{97-(profile as UserProfile).id?.toLocaleString()}%</div>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Simulation Rank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(profile as UserProfile).id?.toLocaleString()}</div>
                    </CardContent>
                    </Card>
                </div>

                {/*Interest levls */}
                <Card>
                    <CardHeader>
                    <CardTitle>Bot Interests</CardTitle>
                    <CardDescription>Bot's interests by affinity level</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-4">
                        {(profile as BotProfile).interests.map((interest) => (
                        <div key={interest.interest}>
                            <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{interest.interest}</span>
                            <span className="text-sm font-medium">{interest.affinity}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${interest.affinity}%` }}
                            ></div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>

                {/* Recent rooms */}
                <Card className="md:col-span-2">
                    <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Recent Rooms</CardTitle>
                        <Link to="/rooms/history">
                        <Button variant="ghost" size="sm" className="gap-1">
                            View All
                            <ArrowUpRight className="h-4 w-4" />
                        </Button>
                        </Link>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-4">
                        {profile?.recentQuizzes?.map((quiz: any) => (
                        <div key={quiz.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                            <p className="font-medium">{quiz.interest}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(quiz.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                })}
                            </p>
                            </div>
                            <div className="text-right">
                            <p className="font-bold">
                                {quiz.score}/{quiz.total}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {Math.round((quiz.score / quiz.total) * 100)}%
                            </p>
                            </div>
                        </div>
                        ))}
                    </div>
                    </CardContent>
                </Card>

                {/* Milestones */}
                <Card className="md:col-span-2">
                    <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                    <CardDescription>Milestones bot reached through evolution</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {profile?.milestones?.map((milestones: string) => (
                        <Badge key={milestones} variant="secondary" className="px-3 py-1">
                            {milestones}
                        </Badge>
                        ))}
                    </div>
                    </CardContent>
                </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
