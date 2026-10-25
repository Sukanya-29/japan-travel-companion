import { createContext, useContext, useState, useEffect } from "react";
import { generateFullItinerary } from "../utils/generateItinerary";
import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);

const STORAGE_KEY = "nihon_traveler_user";
const SAVED_PLANS_KEY = "nihon_saved_itineraries";

const SAMPLE_1 = generateFullItinerary({
  destination: "Golden Route (Tokyo, Kyoto & Osaka)",
  travellers: 2,
  duration: 5,
  pace: "balanced",
  interests: ["temples", "food", "photography", "culture"],
  dietary: "Vegetarian",
  foodChoices: { eggs: "eat", chicken: "avoid", fish: "avoid", mutton: "avoid", pork: "avoid", beef: "avoid" },
  extraFoodPrefs: ["street_food", "veg_restaurants"],
  allergies: "Peanuts (mild)",
  budgetTier: "mid",
});
SAMPLE_1.id = "plan_sample_1";
SAMPLE_1.title = "Golden Route: Tokyo & Kyoto Autumn Walk";

const SAMPLE_2 = generateFullItinerary({
  destination: "Kyoto & Kansai Cultural Journey",
  travellers: 3,
  duration: 7,
  pace: "relaxed",
  interests: ["nature", "culture", "cafes", "architecture"],
  dietary: "Vegetarian",
  foodChoices: { eggs: "avoid", chicken: "avoid", fish: "avoid", mutton: "avoid", pork: "avoid", beef: "avoid" },
  extraFoodPrefs: ["jain", "fine_dining"],
  allergies: "None",
  budgetTier: "premium",
});
SAMPLE_2.id = "plan_sample_2";
SAMPLE_2.title = "Culinary & Onsen Retreat: Osaka & Hakone";

const DEFAULT_SAVED_PLANS = [SAMPLE_1, SAMPLE_2];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [savedPlans, setSavedPlans] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_PLANS_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SAVED_PLANS;
    } catch {
      return DEFAULT_SAVED_PLANS;
    }
  });

  // Keep storage synced
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(savedPlans));
  }, [savedPlans]);

  // Sign In function connected with Supabase Auth
  const login = async ({ email, password, remember = true }) => {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    });

    if (error) throw error;

    const authUser = data.user;
    const formattedName = authUser.user_metadata?.full_name || email.split("@")[0]
      .split(/[^a-zA-Z]/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Traveler";

    const initials = formattedName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const loggedUser = {
      id: authUser.id,
      name: formattedName,
      email: authUser.email,
      avatar: authUser.user_metadata?.avatar_url || null,
      initials: initials || "JP",
      homeCity: "India",
      dietary: "Vegetarian",
      travelStyle: "Balanced comfort",
      memberSince: "October 2026",
      savedTripsCount: savedPlans.length,
      savedDishesCount: 4,
    };

    setUser(loggedUser);
    return loggedUser;
  };

  // Sign Up function connected with Supabase Auth
  const signup = async ({ name, email, password, travelStyle = "Balanced comfort" }) => {
    if (!name || name.trim().length < 2) {
      throw new Error("Please provide your full name.");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const trimmedName = name.trim();

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: trimmedName,
        },
      },
    });

    if (error) throw error;

    const authUser = data.user;
    const initials = trimmedName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const newUser = {
      id: authUser ? authUser.id : `user_${Date.now()}`,
      name: trimmedName,
      email: email.toLowerCase(),
      avatar: null,
      initials: initials || "NI",
      homeCity: "India",
      dietary: "Vegetarian",
      travelStyle,
      memberSince: "October 2026",
      savedTripsCount: 0,
      savedDishesCount: 0,
    };

    setUser(newUser);
    return newUser;
  };

  // Sign out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    setUser(null);
  };

  // Update profile
  const updateProfile = (updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Save an itinerary (creates new or updates if id exists)
  const savePlan = (plan) => {
    const existingIndex = savedPlans.findIndex((p) => p.id === plan.id);
    let finalizedPlan;

    if (existingIndex >= 0) {
      finalizedPlan = {
        ...savedPlans[existingIndex],
        ...plan,
        updatedAt: new Date().toISOString(),
      };
      setSavedPlans((prev) => {
        const next = [...prev];
        next[existingIndex] = finalizedPlan;
        return next;
      });
    } else {
      finalizedPlan = {
        id: plan.id || `trip_${Date.now()}`,
        savedAt: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...plan,
      };
      setSavedPlans((prev) => [finalizedPlan, ...prev]);
      if (user) {
        setUser((prev) => ({
          ...prev,
          savedTripsCount: (prev.savedTripsCount || 0) + 1,
        }));
      }
    }
    return finalizedPlan;
  };

  // Update existing itinerary
  const updatePlan = (planId, updatedFields) => {
    let updatedTrip = null;
    setSavedPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          updatedTrip = { ...p, ...updatedFields, updatedAt: new Date().toISOString() };
          return updatedTrip;
        }
        return p;
      })
    );
    return updatedTrip;
  };

  // Get plan by ID
  const getPlan = (planId) => {
    return savedPlans.find((p) => p.id === planId) || null;
  };

  // Remove saved itinerary
  const removePlan = (planId) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
    if (user) {
      setUser((prev) => ({
        ...prev,
        savedTripsCount: Math.max(0, (prev.savedTripsCount || 1) - 1),
      }));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    savedPlans,
    savePlan,
    updatePlan,
    getPlan,
    removePlan,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}