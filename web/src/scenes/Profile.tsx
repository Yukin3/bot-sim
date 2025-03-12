import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Trophy, History, CircleUserRound, Calendar, ArrowUpRight, Lock } from "lucide-react";

interface Interest {
    interest: string;
    affinity: number;
  }

  interface Achievement {
    id: number;
    name: string;
    description: string;
    level: number;
    xp_reward: number;
    progress: number;
    target: number;
    unlocked: boolean;
    unlocked_at: string | null;
}

interface LockedAchievement {
  id: number;
  name: string;
  description: string;
}

  
  interface UserProfile {
    id: number;
    username: string;
    accountCreated: string;
    lastActivity: string;    
    profile_picture: string | null;
    botsCreated: number; 
    messagesSent: number; 
    totalScore: number;
    quizzesTaken: number;
    trophies: {
      id: number;
      name: string;
      description: string;
      unlocked_at: string | null;
    }[]; 
    lockedTrophies: {
      id: number;
      name: string;
      description: string;
    }[]; 
    topBots: {
      id: number;
      name: string;
      xp_points: number;
      profile_picture: string | null;
    }[];
  }
  
  interface BotProfile {
    id: number;
    name: string;
    profile_picture: string | null;
    createdAt: string;
    owner: string; 
    mood: string;
    restriction_level: number;
    personality_name: string;
    base_tone: string;
    presence_status: string;
    interests: Interest[];
    affiliated_rooms: number; 
    total_messages: number; 
    energy_level: number;
    rank: string;
    milestones: {
      id: number;
      name: string;
      description: string;
      unlocked_at: string;
  }[];
  lockedAchievements: {
      id: number;
      name: string;
      description: string;
  }[];
    current_room: { id: number; name: string } | null; 
    recent_rooms: { room_id: number; room_name: string; last_active: string }[];
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
                  //Fetch user stats
                  const statsResponse = await fetch(`http://localhost:8080/api/user/${username}/stats`);
                  const statsData = await statsResponse.json();
  
                  //Fetch user achievements
                  const achievementsResponse = await fetch(`http://localhost:8080/api/user/${data.id}/achievements`);
                  const achievementsData = await achievementsResponse.json();
  
                  const formattedUser: UserProfile = {
                      id: data.id,
                      username: data.username,
                      accountCreated: statsData.created_at, 
                      lastActivity: statsData.last_active, 
                      profile_picture: data.profile_picture || null,
                      botsCreated: statsData.bots_created || 0, 
                      messagesSent: statsData.messages_sent || 0, 
                      totalScore: statsData.totalScore || 0, 
                      quizzesTaken: statsData.quizzesTaken || 0, 
                      trophies: achievementsData.unlocked.map((a: Achievement) => ({
                          id: a.id,
                          name: a.name,
                          description: a.description,
                          unlocked_at: a.unlocked_at,
                      })), 
                      lockedTrophies: achievementsData.locked.map((a: LockedAchievement) => ({
                          id: a.id,
                          name: a.name,
                          description: a.description,
                      })), 
                      topBots: statsData.top_bots || [], 
                  };
                  console.log("Top bots: ", formattedUser.topBots)
                  setProfile(formattedUser);
              } else {
                  //Fetch bot achievements
                  const achievementsResponse = await fetch(`http://localhost:8080/api/bots/${id}/achievements`);
                  const achievementsData = await achievementsResponse.json();
  
                  const formattedBot: BotProfile = {
                      id: data.id,
                      name: data.name,
                      profile_picture: data.profile_picture,
                      createdAt: data.created_at,
                      owner: data.owner_username,
                      mood: data.mood?.state || "Neutral",
                      restriction_level: data.restriction_level,
                      personality_name: data.personality_name,
                      base_tone: data.base_tone,
                      presence_status: data.presence_status || "Inactive",
                      interests: data.interests.map((i: Interest) => ({
                          interest: i.interest,
                          affinity: i.affinity,
                      })),
                      affiliated_rooms: data.affiliated_rooms_count || 0,
                      total_messages: data.total_messages || 0,
                      energy_level: data.energy_level || 100,
                      rank: data.rank || "Unranked",
                      milestones: achievementsData.unlocked.map((a: Achievement) => ({
                          id: a.id,
                          name: a.name,
                          description: a.description,
                          unlocked_at: a.unlocked_at,
                      })), 
                      lockedAchievements: achievementsData.locked.map((a: LockedAchievement) => ({
                          id: a.id,
                          name: a.name,
                          description: a.description,
                      })),
                      current_room: data.current_room || null,
                      recent_rooms: data.recent_rooms || [],
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
              <img 
                src={isUserProfile 
                  ? (profile as UserProfile).profile_picture ?? "/default-user.png" 
                  : (profile as BotProfile).profile_picture ?? "/default-bot.png"}
                alt={(profile as BotProfile).name} 
                className="h-16 w-16 rounded-full object-cover" 
              />              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">
                {isUserProfile ? (profile as UserProfile).username : (profile as BotProfile).name}
                </h1>
                {isUserProfile && (
                  <p className="text-muted-foreground">
                    Joined {(profile as UserProfile).accountCreated}
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
                  <status-indicator
                className="scale-125" // Enlarge dot
                    {...((profile as BotProfile).presence_status === "active"
                    ? { positive: true, pulse: true }
                    : { intermediary: true, pulse: true })}
                   // @ts-expect-error sim
                ></status-indicator>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                    Status:  {(profile as BotProfile).presence_status === "active" ? "Active" : "Passive"}
                </span>
                  </Badge>
                    <Badge variant="outline" className="gap-1">
                    <CircleUserRound className="h-3 w-3" />
                    <a href={`/${(profile as BotProfile).owner}`} style={{ textDecoration: 'underline' }}>Owner: {(profile as BotProfile).owner} </a>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {new Date((profile as BotProfile).createdAt).toLocaleDateString()}
                  </Badge>
                    </>
                )}
                {isUserProfile && (
                    <>
                  <Badge variant="outline" className="gap-1">
                  <status-indicator 
                className="scale-125" // Scale dot
                    {...((profile as BotProfile).presence_status === "active"
                    ? { positive: true, pulse: true }
                    : { intermediary: true, pulse: false })}
                      // @ts-expect-error sim
                ></status-indicator>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
                    Streak: {(profile as BotProfile).name}
                </span>
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined: {new Date((profile as UserProfile).accountCreated).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <History className="h-3 w-3" />
                    Last Active: {new Date((profile as UserProfile).lastActivity).toLocaleDateString()}
                  </Badge>
                    </>
                    
                )}
                </div>
              </div>

              {/* Header buttons */}
              <div className="flex gap-2">
                {/* Bot buttons */}
                {!isUserProfile && (
                    <Link to={`/rooms/${(profile as BotProfile).id}`}>
                    <Button>Add Bot</Button>
                    </Link>
                )}

                {!isUserProfile && (
                    <Link to={`/room/${(profile as BotProfile).current_room?.id}`}>
                    <Button>Observe Bot</Button>
                    </Link>
                )}
                {/* User buttons*/}
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
                    activeTab === "trophies" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("trophies")}
                >
                  Trophies
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
                        <div className="text-3xl font-bold">{(profile as UserProfile).botsCreated}</div>
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
                        <div className="text-3xl font-bold">{(profile as UserProfile).messagesSent}</div>
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

                    {/* Featured bots */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Feautured Bots</CardTitle>
                        <CardDescription>User's top performing bots</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="space-y-4">
                    {(profile as UserProfile)?.topBots?.slice(0, 3).map((bot) => (
                      <div key={bot.id}>
                          <div className="flex items-center gap-3 mb-1">
                              <Link to={`/bot/${bot.id}`}> {/* Image */}
                              <img src={bot.profile_picture || "default-bot.png"} className="h-8 w-8 rounded-full" alt={bot.name} />
                              </Link>                              
                              <div className="flex-1"> {/* Name + xp level */}
                              <Link to={`/bot/${bot.id}`} className="hover:text-primary transition duration-200">
                                  <span className="text-sm font-medium">{bot.name}</span>
                              </Link>
                                  <span className="text-xs text-muted-foreground ml-2">({bot.xp_points} XP)</span>
                              </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">{/* XP bar */}
                              <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: `${Math.min((bot.xp_points / 200) * 100, 100)}%` }}
                              ></div>
                          </div>
                      </div>
                  ))}
                      </div>
                    </CardContent>
                    </Card>

                    {/* Trophies summary */}
                    <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Trophies</CardTitle>
                        <CardDescription>Trophies {(profile as UserProfile).username} accquired recently </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                        {(profile as UserProfile).trophies.map((trophy) => (
                          <Badge key={trophy.id} variant="secondary" className="px-3 py-1">
                              {trophy.name}
                          </Badge>
                      ))}
                        </div>
                    </CardContent>
                    </Card>
                </div>
                )}

                {/* Trophies tab */}
                {isUserProfile && activeTab === "trophies" && (
                <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                    <CardTitle>Earned</CardTitle>
                    <CardDescription>Trophies {(profile as UserProfile).username}  unlocked</CardDescription>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                    {(profile as UserProfile)?.trophies?.slice(0, 6).map((trophy) => (
                        <div key={trophy.id} className="bg-muted/50 rounded-lg p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                                <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">{trophy.name}</p>
                            <p className="text-xs text-muted-foreground">{trophy.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(trophy.unlocked_at!).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                    </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle>In Progress</CardTitle>
                    <CardDescription>Trophies left to unlock</CardDescription>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    </CardHeader>
                    <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                    {(profile as UserProfile)?.lockedTrophies?.slice(0, 6).map((trophy) => (
                        <div key={trophy.id} className="bg-muted/50 rounded-lg p-4 text-center opacity-60">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium">{trophy.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Locked </p>
                        </div>
                        ))}
                    </div>
                    
                    </CardContent>
                </Card> 
                </div>
                )}



              {/* Bot profile */}
              {!isUserProfile && (
                <div className="grid md:grid-cols-2 gap-8">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{(profile as BotProfile)?.total_messages.toLocaleString()}</div>
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
                        <div className="text-3xl font-bold">97%</div>
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
                    {(profile as BotProfile).recent_rooms?.map((room) => ( 
                    <div key={room.room_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                            <p className="font-medium">{room.room_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(room.last_active).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                        <Link to={`/room/${room.room_id}`}>
                            <Button variant="secondary" size="sm">Enter Room</Button>
                        </Link>
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
                    {(profile as BotProfile)?.milestones?.map((milestone) => (
                      <Badge key={milestone.id} variant="secondary" className="px-3 py-1">
                          <div className="bg-muted/50 rounded-lg p-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                              <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium pb-2">{milestone.name}</p>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(milestone.unlocked_at).toLocaleDateString()}
                            </p>
                          </div>
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
