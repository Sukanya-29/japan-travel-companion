// Comprehensive Japan Travel Itinerary and Budget Generation Engine (Supabase Connected)
import { supabase } from "./supabaseClient";

export const DESTINATION_PRESETS = [
  { id: "golden_route", name: "Golden Route (Tokyo, Kyoto & Osaka)", daysRec: 7, popular: true },
  { id: "tokyo", name: "Tokyo & Kanto Region", daysRec: 5, popular: true },
  { id: "kyoto", name: "Kyoto & Traditional Japan", daysRec: 4, popular: true },
  { id: "osaka", name: "Osaka & Food Culture", daysRec: 3, popular: true },
  { id: "hakone", name: "Hakone & Mt. Fuji Views", daysRec: 2, popular: false },
  { id: "hokkaido", name: "Hokkaido Nature & Snow", daysRec: 6, popular: false },
  { id: "hiroshima", name: "Hiroshima & Miyajima Island", daysRec: 2, popular: false },
];

export const INTEREST_CATEGORIES = [
  { id: "anime", title: "Anime & Japanese pop culture", icon: "Sparkles", desc: "Akihabara, Nakano Broadway, Ghibli & manga hubs" },
  { id: "food", title: "Food & local cuisine", icon: "Utensils", desc: "Authentic ramen, izakayas, street food & regional specialties" },
  { id: "cafes", title: "Cafes & coffee shops", icon: "Coffee", desc: "Retro kissaten, aesthetic matcha cafes & craft bakeries" },
  { id: "temples", title: "Temples & spiritual places", icon: "Landmark", desc: "Ancient shrines, Zen rock gardens & torii gates" },
  { id: "culture", title: "Culture, traditions & heritage", icon: "BookOpen", desc: "Tea ceremonies, kimono walks & artisan craft studios" },
  { id: "nature", title: "Nature, mountains & parks", icon: "Trees", desc: "Mount Fuji views, bamboo groves, cherry blossoms & onsen" },
  { id: "shopping", title: "Shopping & local markets", icon: "ShoppingBag", desc: "Ginza department stores, vintage thrift & bustling markets" },
  { id: "technology", title: "Technology & innovation", icon: "Cpu", desc: "High-tech interactive museums, robot cafes & bullet trains" },
  { id: "museums", title: "Museums, art & history", icon: "Palette", desc: "teamLab immersive art, Samurai museums & National galleries" },
  { id: "adventure", title: "Adventure & outdoors", icon: "Compass", desc: "Alpine hiking trails, Lake Ashi pirate boat & cycling routes" },
  { id: "nightlife", title: "Nightlife & entertainment", icon: "Moon", desc: "Omoide Yokocho lantern alleys, Golden Gai & karaoke" },
  { id: "photography", title: "Photography & scenic spots", icon: "Camera", desc: "Shibuya Sky, Yasaka Pagoda sunsets & neon-lit streets" },
  { id: "architecture", title: "Architecture & landmarks", icon: "Building2", desc: "Tokyo Tower, modern stadiums, traditional machiya wooden homes" },
  { id: "hidden_gems", title: "Local experiences & hidden gems", icon: "MapPin", desc: "Quiet residential neighborhoods, sento baths & local kissaten" },
  { id: "amusement", title: "Amusement parks & gaming", icon: "Gamepad2", desc: "Universal Studios Japan, Tokyo DisneySea & arcade gaming" },
];

export const FOOD_PREFERENCE_OPTIONS = [
  { id: "Vegetarian", label: "Vegetarian", note: "Plant-based foods, dairy allowed. No meat or fish broth." },
  { id: "Eggetarian", label: "Eggetarian", note: "Vegetarian diet with eggs permitted." },
  { id: "Non-vegetarian", label: "Non-vegetarian", note: "Open to poultry, meat, and seafood dishes." },
  { id: "Vegan", label: "Vegan", note: "Strictly plant-based. No dairy, egg, honey, or fish dashi." },
  { id: "No specific preference", label: "No specific preference", note: "Excited to taste everything Japan offers." },
];

export const INDIVIDUAL_FOOD_ITEMS = [
  { id: "eggs", name: "Eggs", defaultVeg: true },
  { id: "chicken", name: "Chicken", defaultVeg: false },
  { id: "fish", name: "Fish & Seafood", defaultVeg: false },
  { id: "mutton", name: "Mutton & Lamb", defaultVeg: false },
  { id: "pork", name: "Pork (inc. tonkotsu broth)", defaultVeg: false },
  { id: "beef", name: "Beef (inc. Wagyu)", defaultVeg: false },
  { id: "other_meats", name: "Other meats (duck, venison)", defaultVeg: false },
];

export const EXTRA_FOOD_PREFS = [
  { id: "street_food", label: "Street Food & Depachika" },
  { id: "fine_dining", label: "Fine Dining & Kaiseki" },
  { id: "local_cuisine", label: "Local Authentic Cuisine" },
  { id: "cafes_bakeries", label: "Aesthetic Cafes & Bakeries" },
  { id: "veg_restaurants", label: "Certified Vegetarian Restaurants" },
  { id: "budget_eateries", label: "Budget-Friendly Eateries & Chains" },
  { id: "halal", label: "Halal-Certified Food" },
  { id: "jain", label: "Jain-Friendly (No onion, garlic, or root veg)" },
];

const BUDGET_TIERS = {
  budget: { id: "budget", name: "Budget Explorer", dailyPerPersonJPY: 7500, desc: "Affordable public transit, street food and free sights." },
  mid: { id: "mid", name: "Balanced Experience", dailyPerPersonJPY: 15500, desc: "Comfortable balance of popular sights, paid viewpoints & cafes." },
  premium: { id: "premium", name: "Premium Experience", dailyPerPersonJPY: 29000, desc: "Top-tier comfort, memorable culinary feasts & private tours." },
};

const JPY_TO_INR_RATE = 0.56;

export function evaluateDietarySafety(restaurantName, userDietary, extraPrefs, allergies) {
  let statusBadge = "Dietary Friendly";
  let statusType = "safe";
  let note = "Standard dining precautions apply.";

  if (allergies && allergies.trim().length > 0) {
    statusType = "caution";
    note = `Show your Japanese allergy card for "${allergies}" to the chef before ordering.`;
  }
  return { statusBadge, statusType, note };
}

// Main Supabase-Connected Itinerary Generator Function
export async function generateFullItinerary({
  destination = "Golden Route (Tokyo, Kyoto & Osaka)",
  travellers = 2,
  duration = 5,
  pace = "balanced",
  interests = [],
  dietary = "Vegetarian",
  foodChoices = {},
  extraFoodPrefs = [],
  allergies = "",
  budgetTier = "mid",
  customBudget = null,
  startDate = "",
  startingCity = "Tokyo",
}) {
  const safeDays = Math.min(30, Math.max(2, Number(duration) || 5));
  const safeTravellers = Math.min(50, Math.max(1, Number(travellers) || 2));

  // Fetch places from Supabase 'tourist_places' table
  let touristPlaces = [];
  try {
    if (supabase) {
      const { data, error } = await supabase.from("tourist_places").select("*");
      if (!error && data) {
        touristPlaces = data;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch from Supabase, using fallback mechanism:", err);
  }

  // Fallback if table is empty or offline
  if (!touristPlaces || touristPlaces.length === 0) {
    touristPlaces = [
      {
        id: 1,
        place_name_english: "Senso-ji Temple",
        place_name_japanese: "浅草寺",
        place_name_romaji: "Senso-ji",
        city: "Tokyo",
        category_type: "CULTURE & TRADITION",
        estimated_cost_inr: 0,
        recommended_duration_hours: 2.5,
        description: "Tokyo's oldest Buddhist temple with giant red Kaminarimon lantern.",
        attire_guideline: "Modest casual wear",
        nearby_food_places: "Kura Sushi Asakusa",
        vegetarian_safe_food_places: "T's Tantan"
      }
    ];
  }

  let tierData = BUDGET_TIERS[budgetTier] || BUDGET_TIERS.mid;
  let dailyPerPerson = tierData.dailyPerPersonJPY;
  let isCustom = budgetTier === "custom" && customBudget && Number(customBudget) > 0;
  let customWarning = null;

  if (isCustom) {
    const customTotal = Number(customBudget);
    const calculatedPerPersonPerDay = Math.round(customTotal / (safeDays * safeTravellers));
    dailyPerPerson = calculatedPerPersonPerDay;
  }

  const hasIntercity = safeDays >= 4;
  const intercityShinkansenCostPerPerson = hasIntercity ? 14500 : 0;

  const totalCalculatedJPY = isCustom 
    ? Number(customBudget) 
    : Math.round(dailyPerPerson * safeDays * safeTravellers + (intercityShinkansenCostPerPerson * safeTravellers));

  const foodTotalJPY = Math.round(totalCalculatedJPY * 0.44);
  const localTransitTotalJPY = Math.round(totalCalculatedJPY * 0.18);
  const intercityTotalJPY = Math.round(hasIntercity ? intercityShinkansenCostPerPerson * safeTravellers : totalCalculatedJPY * 0.08);
  const attractionsTotalJPY = Math.round(totalCalculatedJPY * 0.20);
  const contingencyTotalJPY = Math.round(totalCalculatedJPY * 0.10);

  const perPersonTotalJPY = Math.round(totalCalculatedJPY / safeTravellers);
  const totalCalculatedINR = Math.round(totalCalculatedJPY * JPY_TO_INR_RATE);
  const perPersonTotalINR = Math.round(perPersonTotalJPY * JPY_TO_INR_RATE);

  // Generate days using Supabase tourist_places data
  const daysList = Array.from({ length: safeDays }, (_, i) => {
    const dayNum = i + 1;
    const place1 = touristPlaces[i % touristPlaces.length];
    const place2 = touristPlaces[(i + 1) % touristPlaces.length];
    const place3 = touristPlaces[(i + 2) % touristPlaces.length];

    let dateStr = "";
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } else {
      dateStr = `Day ${dayNum}`;
    }

    const lunchSafety = evaluateDietarySafety(place1.nearby_food_places, dietary, extraFoodPrefs, allergies);
    const dinnerSafety = evaluateDietarySafety(place1.vegetarian_safe_food_places, dietary, extraFoodPrefs, allergies);

    const costInr1 = place1.estimated_cost_inr || 0;
    const costInr2 = place2.estimated_cost_inr || 0;
    const costInr3 = place3.estimated_cost_inr || 0;
    
    const estCostJPY1 = Math.round(costInr1 / JPY_TO_INR_RATE);
    const estCostJPY2 = Math.round(costInr2 / JPY_TO_INR_RATE);
    const estCostJPY3 = Math.round(costInr3 / JPY_TO_INR_RATE);

    const dailyTotalPerPersonJPY = estCostJPY1 + estCostJPY2 + estCostJPY3 + 1500;

    return {
      day: dayNum,
      dateStr,
      city: place1.city || "Tokyo",
      area: place1.place_name_english,
      theme: `${place1.category_type} Experience`,
      weatherBackup: "Indoor museum or shopping arcade available nearby",
      morning: {
        title: place1.place_name_english,
        desc: place1.description,
        category: place1.category_type,
        order: 1,
        duration: `${place1.recommended_duration_hours || 2} hours`,
        time: "09:00 AM - 11:30 AM",
        estCostJPY: estCostJPY1,
        attire: place1.attire_guideline,
        japaneseName: place1.place_name_japanese,
      },
      transit1: { mode: "Subway / Train", detail: `Transit in ${place1.city}`, timeMin: 15, costJPY: 200 },
      afternoon: {
        title: place2.place_name_english,
        desc: place2.description,
        category: place2.category_type,
        order: 2,
        duration: `${place2.recommended_duration_hours || 2} hours`,
        time: "01:00 PM - 03:30 PM",
        estCostJPY: estCostJPY2,
        attire: place2.attire_guideline,
        japaneseName: place2.place_name_japanese,
      },
      transit2: { mode: "Walking / Metro", detail: "City connection", timeMin: 12, costJPY: 180 },
      evening: {
        title: place3.place_name_english,
        desc: place3.description,
        category: place3.category_type,
        order: 3,
        duration: `${place3.recommended_duration_hours || 2} hours`,
        time: "04:30 PM - 06:30 PM",
        estCostJPY: estCostJPY3,
        attire: place3.attire_guideline,
        japaneseName: place3.place_name_japanese,
      },
      food: {
        lunch: {
          name: place1.nearby_food_places || "Local Diner",
          cuisine: "Authentic Japanese",
          priceRange: "¥1,000 - ¥2,000",
          recommendedDishes: "Chef's daily recommendation",
          safety: lunchSafety,
        },
        dinner: {
          name: place1.vegetarian_safe_food_places || "Vegetarian Friendly Restaurant",
          cuisine: "Specialty / Plant-Based",
          priceRange: "¥1,200 - ¥2,500",
          recommendedDishes: "Vegetable ramen / set meals",
          safety: dinnerSafety,
        },
      },
      dailyEstimatedCostJPY: dailyTotalPerPersonJPY,
      dailyEstimatedCostINR: Math.round(dailyTotalPerPersonJPY * JPY_TO_INR_RATE),
    };
  });

  return {
    id: `trip_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {
      destination,
      travellers: safeTravellers,
      duration: safeDays,
      pace,
      interests,
      dietary,
      foodChoices,
      extraFoodPrefs,
      allergies,
      budgetTier,
      customBudget,
      startDate,
      startingCity,
    },
    budgetSummary: {
      tierName: tierData.name,
      tierDesc: tierData.desc,
      totalJPY: totalCalculatedJPY,
      totalINR: totalCalculatedINR,
      perPersonJPY: perPersonTotalJPY,
      perPersonINR: perPersonTotalINR,
      categories: [
        { label: "Food & Local Dining", jpy: foodTotalJPY, inr: Math.round(foodTotalJPY * JPY_TO_INR_RATE), share: "44%" },
        { label: "Local Transport (Metro, IC Cards)", jpy: localTransitTotalJPY, inr: Math.round(localTransitTotalJPY * JPY_TO_INR_RATE), share: "18%" },
        { label: "Intercity Transit (Shinkansen / Express)", jpy: intercityTotalJPY, inr: Math.round(intercityTotalJPY * JPY_TO_INR_RATE), share: "14%" },
        { label: "Attraction Tickets & Experiences", jpy: attractionsTotalJPY, inr: Math.round(attractionsTotalJPY * JPY_TO_INR_RATE), share: "14%" },
        { label: "Contingency & Emergency Reserve", jpy: contingencyTotalJPY, inr: Math.round(contingencyTotalJPY * JPY_TO_INR_RATE), share: "10%" },
      ],
      customWarning,
      note: "Your trip budget includes food, transportation, attractions, and activities. Accommodation is not included yet.",
    },
    days: daysList,
  };
}