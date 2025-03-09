import { create } from "zustand";
import { fetchUserProfile } from "@/services/authApi";

export const useAuthStore = create((set) => ({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),

    setToken: async (token) => {
        if (!token) return;
        console.log("🪙Storing Token:", token);
        localStorage.setItem("token", token);
        set({ token });

        try {
            console.log("Fetching user profile...");
            const userData = await fetchUserProfile(token);
            console.log("User Fetched:", userData);

            if (!userData || !userData.id) {
                console.error("Failed to retrieve user data.");
                return;
            }

            localStorage.setItem("user", JSON.stringify(userData)); //Store user in LocalStorage
            set({ user: userData }); //Update Zustand store
        } catch (error) {
            console.error("Failed to fetch user data:", error);
            set({ user: null });
        }
    },

    refreshUser: async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const userData = await fetchUserProfile(token);
            console.log("Refreshed User Data:", userData);
            localStorage.setItem("user", JSON.stringify(userData));
            set({ user: userData });
        } catch (error) {
            console.error("Error refreshing user:", error);
        }
    },

    logout: () => {
        console.log("🚪 Logging out, clearing local storage...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ token: null, user: null });
    },
}));


// Detect OAuth Redirect on Page Load
if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
        console.log("🪙OAuth Token Detected:", token);
        useAuthStore.getState().setToken(token);

        //Remove token from URL 
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}
