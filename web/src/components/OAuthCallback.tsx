import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuthStore";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore() as { setToken: (token: string) => void };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      console.log("OAuth Token Received:", token);
      setToken(token); // Store token in Zustand
      navigate("/");  // Redirect to home after storing
    } else {
      console.error("No token found in URL!");
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate, setToken]);

  return <p>Logging you in...</p>; //Handle loading
}
