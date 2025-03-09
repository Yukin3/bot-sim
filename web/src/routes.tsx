import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Auth from "@/scenes/Auth";
import Home from "@/scenes/Home";
import Room from "@/scenes/Room";
import Profile from "./scenes/Profile";
import RoomInfo from "./scenes/RoomInfo";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import OAuthCallback from "./components/OAuthCallback";
import RoomsList from "./components/room-list";
import BotsList from "./components/bot-list";

function AppRoutes() {
    const location = useLocation(); // Get current route
    const hideNavbarFrom = ["/login", "/signup"]; 
    const showNavbar = !hideNavbarFrom.includes(location.pathname);


  return (
    <>
     {/* {showNavbar && <Navbar />} */}
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      <Route path="/bots" element={<BotsList />} />
      <Route path="/room/:id" element={<Room />} />
      <Route path="/room/new" element={<Room />} />
      <Route path="/rooms" element={<RoomsList />} />
      <Route path="/gearbox" element={<RoomsList />} />
      <Route path="/bot/:id" element={<Profile />} />
      <Route path="/:username" element={<Profile />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/home" element={<Navigate to="/" />} />
      <Route path="/room/:id/info" element={<RoomInfo />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} /> 
    </Routes>
      <Footer />
    {/* {showNavbar && <Footer />} */}
    </>
  );
}

export default AppRoutes;
