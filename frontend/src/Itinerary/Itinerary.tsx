import { useState, useEffect, useMemo, type JSX, type FormEvent } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Sparkles,
  Compass,
  Utensils,
  Minus,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Coffee,
  Landmark,
  BookOpen,
  Trees,
  ShoppingBag,
  Cpu,
  Palette,
  Moon,
  Camera,
  Building2,
  MapPin,
  Gamepad2,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  generateFullItinerary,
  DESTINATION_PRESETS,
  INTEREST_CATEGORIES,
  FOOD_PREFERENCE_OPTIONS,
  INDIVIDUAL_FOOD_ITEMS,
  EXTRA_FOOD_PREFS,
  evaluateDietarySafety,
} from "./generateItinerary";

// TypeScript Interfaces
interface IconMapType {
  [key: string]: React.ComponentType<{
    size?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
}

const ICON_MAP: IconMapType = {
  Sparkles,
  Utensils,
  Coffee,
  Landmark,
  BookOpen,
  Trees,
  ShoppingBag,
  Cpu,
  Palette,
  Compass,
  Moon,
  Camera,
  Building2,
  MapPin,
  Gamepad2,
};

const LOADING_STEPS = [
  "Understanding your travel preferences & group pace...",
  "Finding attractions, iconic sights & hidden gems...",
  "Planning practical daily routes to avoid backtracking...",
  "Matching restaurants to your dietary choices & allergies...",
  "Calculating realistic daily budgets and transportation...",
];

type FoodChoiceStatus = "eat" | "avoid" | "not_sure";

interface FoodChoicesState {
  [key: string]: FoodChoiceStatus;
  eggs: FoodChoiceStatus;
  chicken: FoodChoiceStatus;
  fish: FoodChoiceStatus;
  mutton: FoodChoiceStatus;
  pork: FoodChoiceStatus;
  beef: FoodChoiceStatus;
  other_meats: FoodChoiceStatus;
}

export default function Planner(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, savePlan, getPlan } = useAuth();

  // Form State
  const [travellers, setTravellers] = useState<number>(2);
  const [duration, setDuration] = useState<number>(5);
  const [destination, setDestination] = useState<string>("Golden Route (Tokyo, Kyoto & Osaka)");
  const [customDestination, setCustomDestination] = useState<string>("");
  const [startingCity, setStartingCity] = useState<string>("Tokyo");
  const [travelSeason, setTravelSeason] = useState<string>("Spring (Sakura)");
  const [pace, setPace] = useState<string>("balanced");

  // Interests state (default selections)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "temples",
    "food",
    "culture",
    "photography",
  ]);

  // Food preferences state
  const [dietary, setDietary] = useState<string>(user?.dietary || "Vegetarian");
  const [foodChoices, setFoodChoices] = useState<FoodChoicesState>({
    eggs: "eat",
    chicken: "avoid",
    fish: "avoid",
    mutton: "avoid",
    pork: "avoid",
    beef: "avoid",
    other_meats: "avoid",
  });
  const [extraFoodPrefs, setExtraFoodPrefs] = useState<string[]>(["street_food"]);
  const [allergies, setAllergies] = useState<string>("");

  // Budget state
  const [budgetTier, setBudgetTier] = useState<string>("mid");
  const [customBudgetJPY, setCustomBudgetJPY] = useState<string>("");

  // Generation & Loading state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Load existing plan if editId provided
  useEffect(() => {
    if (editId) {
      const existing = getPlan(editId);
      if (existing && existing.profile) {
        setIsEditMode(true);
        const p = existing.profile;
        if (p.travellers) setTravellers(p.travellers);
        if (p.duration) setDuration(p.duration);
        if (p.destination) {
          const match = DESTINATION_PRESETS.find((d: any) => d.name === p.destination);
          if (match) {
            setDestination(p.destination);
          } else {
            setDestination("custom");
            setCustomDestination(p.destination);
          }
        }
        if (p.startingCity) setStartingCity(p.startingCity);
        if (p.startDate) setTravelSeason(p.startDate);
        if (p.pace) setPace(p.pace);
        if (p.interests) setSelectedInterests(p.interests);
        if (p.dietary) setDietary(p.dietary);
        if (p.foodChoices) setFoodChoices(p.foodChoices);
        if (p.extraFoodPrefs) setExtraFoodPrefs(p.extraFoodPrefs);
        if (p.allergies) setAllergies(p.allergies);
        if (p.budgetTier) setBudgetTier(p.budgetTier);
        if (p.customBudget) setCustomBudgetJPY(String(p.customBudget));
      }
    }
  }, [editId, getPlan]);

  // Sync user dietary preference on initial mount if not in edit mode
  useEffect(() => {
    if (!editId && user?.dietary) {
      setDietary(user.dietary);
      if (user.dietary === "Vegetarian" || user.dietary === "Vegan" || user.dietary === "Jain") {
        setFoodChoices((prev) => ({
          ...prev,
          chicken: "avoid",
          fish: "avoid",
          mutton: "avoid",
          pork: "avoid",
          beef: "avoid",
          other_meats: "avoid",
        }));
      }
    }
  }, [user, editId]);

  // Adjust food choice matrix automatically when broad dietary changes
  const handleBroadDietaryChange = (optId: string) => {
    setDietary(optId);
    if (optId === "Vegetarian") {
      setFoodChoices({
        eggs: "eat",
        chicken: "avoid",
        fish: "avoid",
        mutton: "avoid",
        pork: "avoid",
        beef: "avoid",
        other_meats: "avoid",
      });
    } else if (optId === "Vegan") {
      setFoodChoices({
        eggs: "avoid",
        chicken: "avoid",
        fish: "avoid",
        mutton: "avoid",
        pork: "avoid",
        beef: "avoid",
        other_meats: "avoid",
      });
    } else if (optId === "Eggetarian") {
      setFoodChoices({
        eggs: "eat",
        chicken: "avoid",
        fish: "avoid",
        mutton: "avoid",
        pork: "avoid",
        beef: "avoid",
        other_meats: "avoid",
      });
    } else if (optId === "Non-vegetarian" || optId === "No specific preference") {
      setFoodChoices({
        eggs: "eat",
        chicken: "eat",
        fish: "eat",
        mutton: "eat",
        pork: "eat",
        beef: "eat",
        other_meats: "not_sure",
      });
    }
  };

  const handleFoodChoiceItem = (itemId: string, choice: FoodChoiceStatus) => {
    setFoodChoices((prev) => ({
      ...prev,
      [itemId]: choice,
    }));
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleExploreAll = () => {
    if (selectedInterests.length === INTEREST_CATEGORIES.length) {
      setSelectedInterests(["temples", "food"]);
    } else {
      setSelectedInterests(INTEREST_CATEGORIES.map((c: any) => c.id));
    }
  };

  const toggleExtraFoodPref = (id: string) => {
    setExtraFoodPrefs((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  // Dynamic Duration Label
  const durationLabel = useMemo(() => {
    if (duration === 7) return "1 Week";
    if (duration === 14) return "2 Weeks";
    if (duration === 21) return "3 Weeks";
    if (duration > 7 && duration % 7 === 0) return `${duration / 7} Weeks`;
    if (duration > 7) {
      const weeks = Math.floor(duration / 7);
      const rem = duration % 7;
      return `${weeks} Week${weeks > 1 ? "s" : ""} ${rem} Day${rem > 1 ? "s" : ""}`;
    }
    return `${duration} Days`;
  }, [duration]);

  // Live Budget Calculation for Preview
  const liveBudgetEstimate = useMemo(() => {
    const activeDestination =
      destination === "custom" && customDestination.trim() ? customDestination.trim() : destination;

    const dummy = generateFullItinerary({
      destination: activeDestination,
      travellers,
      duration,
      pace,
      interests: selectedInterests,
      dietary,
      foodChoices,
      extraFoodPrefs,
      allergies,
      budgetTier,
      customBudget: customBudgetJPY ? Number(customBudgetJPY) : null,
      startDate: travelSeason,
      startingCity,
    });

    return dummy.budgetSummary;
  }, [
    destination,
    customDestination,
    travellers,
    duration,
    pace,
    selectedInterests,
    dietary,
    foodChoices,
    extraFoodPrefs,
    allergies,
    budgetTier,
    customBudgetJPY,
    travelSeason,
    startingCity,
  ]);

  // Form Submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const finalDestination =
      destination === "custom" && customDestination.trim() ? customDestination.trim() : destination;

    if (!finalDestination) {
      alert("Please choose or enter a destination in Japan.");
      return;
    }

    setLoading(true);
    setLoadingStepIndex(0);

    // Multi-step loading progression
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 600);

    setTimeout(() => {
      clearInterval(interval);

      const generatedTrip = generateFullItinerary({
        destination: finalDestination,
        travellers,
        duration,
        pace,
        interests: selectedInterests.length > 0 ? selectedInterests : ["temples", "food"],
        dietary,
        foodChoices,
        extraFoodPrefs,
        allergies,
        budgetTier,
        customBudget: customBudgetJPY ? Number(customBudgetJPY) : null,
        startDate: travelSeason,
        startingCity,
      });

      // Preserve existing ID if in edit mode so we don't create accidental duplicates
      if (isEditMode && editId) {
        generatedTrip.id = editId;
      }

      const saved = savePlan(generatedTrip);
      setLoading(false);
      navigate(`/itinerary/${saved.id}`);
    }, 3200);
  };

  return (
    <main className="planner-page">
      <Navbar backTo="/" backLabel="Back to home" />

      {/* HERO SECTION */}
      <section className="planner-hero-section">
        <div className="planner-hero-content">
          <h1>
            Craft your personalized
            <br />
            <span>Japan Itinerary.</span>
          </h1>

          <p>
            Tell us your travel group, dietary preferences, and interests. We'll generate a
            realistic, day-by-day plan with confirmed transit routes, food guidance, and budget
            breakdowns.
          </p>

          {isEditMode && (
            <div className="planner-edit-alert">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} />
                <span>
                  Editing saved itinerary <strong>#{editId}</strong>. Your modifications will update
                  this trip seamlessly.
                </span>
              </div>
              <Link
                to={`/itinerary/${editId}`}
                style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}
              >
                Cancel Edit
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FORM CONTAINER */}
      <div className="planner-form-container">
        <form className="planner-form-card" onSubmit={handleSubmit}>
          {/* ====================================================
              SECTION 1: TRIP DETAILS
              ==================================================== */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">01</span>
              <div>
                <h2>Trip Details & Destinations</h2>
                <p>Define your party size, length of stay, and destinations in Japan.</p>
              </div>
            </div>

            {/* Sliders for Travellers & Duration */}
            <div className="planner-controls-row">
              {/* Number of Travellers */}
              <div className="planner-control-card">
                <div className="planner-control-top">
                  <label htmlFor="travellers-slider">Number of Travellers</label>
                  <span className="planner-value-tag">
                    {travellers}{" "}
                    {travellers === 1
                      ? "Person (Solo)"
                      : travellers === 2
                        ? "People (Couple)"
                        : "People"}
                  </span>
                </div>

                <div className="planner-stepper-wrap">
                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setTravellers((v) => Math.max(1, v - 1))}
                    disabled={travellers <= 1}
                    aria-label="Decrease travellers"
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    id="travellers-slider"
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    className="planner-range-slider"
                    value={travellers}
                    onChange={(e) => setTravellers(Number(e.target.value))}
                  />

                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setTravellers((v) => Math.min(50, v + 1))}
                    disabled={travellers >= 50}
                    aria-label="Increase travellers"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Trip Duration */}
              <div className="planner-control-card">
                <div className="planner-control-top">
                  <label htmlFor="duration-slider">Trip Duration</label>
                  <span className="planner-value-tag">{durationLabel}</span>
                </div>

                <div className="planner-stepper-wrap">
                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setDuration((v) => Math.max(2, v - 1))}
                    disabled={duration <= 2}
                    aria-label="Decrease duration"
                  >
                    <Minus size={16} />
                  </button>

                  <input
                    id="duration-slider"
                    type="range"
                    min="2"
                    max="30"
                    step="1"
                    className="planner-range-slider"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />

                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setDuration((v) => Math.min(30, v + 1))}
                    disabled={duration >= 30}
                    aria-label="Increase duration"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Destination Selection */}
            <div className="planner-field-group" style={{ marginBottom: "18px" }}>
              <label>Choose Primary Destination or Region</label>
              <div className="planner-destination-presets">
                {DESTINATION_PRESETS.map((dest: any) => (
                  <button
                    type="button"
                    key={dest.id}
                    className={`planner-dest-chip ${destination === dest.name ? "active" : ""}`}
                    onClick={() => {
                      setDestination(dest.name);
                      setCustomDestination("");
                    }}
                  >
                    {dest.name} {dest.popular && "★"}
                  </button>
                ))}
                <button
                  type="button"
                  className={`planner-dest-chip ${destination === "custom" ? "active" : ""}`}
                  onClick={() => setDestination("custom")}
                >
                  Custom Destination +
                </button>
              </div>

              {destination === "custom" && (
                <input
                  type="text"
                  className="planner-text-input"
                  placeholder="Enter Japanese city, prefecture or route (e.g. Kanazawa, Takayama, Okinawa)"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            {/* Optional Trip Details (Starting city, Travel Season, Pace) */}
            <div className="planner-optional-grid">
              <div className="planner-field-group">
                <label htmlFor="start-city">Starting City / Airport</label>
                <select
                  id="start-city"
                  className="planner-select-input"
                  value={startingCity}
                  onChange={(e) => setStartingCity(e.target.value)}
                >
                  <option value="Tokyo">Tokyo (Narita / Haneda)</option>
                  <option value="Osaka">Osaka (Kansai KIX)</option>
                  <option value="Kyoto">Kyoto</option>
                  <option value="Fukuoka">Fukuoka (Kyushu)</option>
                  <option value="Sapporo">Sapporo (New Chitose)</option>
                </select>
              </div>

              <div className="planner-field-group">
                <label htmlFor="travel-season">Preferred Season / Dates</label>
                <select
                  id="travel-season"
                  className="planner-select-input"
                  value={travelSeason}
                  onChange={(e) => setTravelSeason(e.target.value)}
                >
                  <option value="Spring (Sakura)">Spring (Cherry Blossoms · Mar-May)</option>
                  <option value="Summer (Festivals)">
                    Summer (Festivals & Fireworks · Jun-Aug)
                  </option>
                  <option value="Autumn (Foliage)">Autumn (Red Maples & Koyo · Sep-Nov)</option>
                  <option value="Winter (Snow & Onsen)">
                    Winter (Snow & Illuminations · Dec-Feb)
                  </option>
                </select>
              </div>

              <div className="planner-field-group">
                <label>Travel Pace</label>
                <select
                  className="planner-select-input"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                >
                  <option value="relaxed">Relaxed (1-2 stops/day, ample tea breaks)</option>
                  <option value="balanced">Balanced (2-3 stops/day, optimal transit)</option>
                  <option value="packed">Packed (4+ sights/day, maximum coverage)</option>
                </select>
              </div>
            </div>
          </section>

          {/* ====================================================
              SECTION 2: INTERESTS & ACTIVITIES (15 Categories)
              ==================================================== */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">02</span>
              <div>
                <h2>Interests & Experiences</h2>
                <p>Pick what excites you about Japan to shape your daily schedule.</p>
              </div>
            </div>

            <div className="planner-interests-header-row">
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                Selected: <strong>{selectedInterests.length}</strong> of{" "}
                {INTEREST_CATEGORIES.length} categories
              </span>
              <button type="button" className="planner-explore-all-btn" onClick={handleExploreAll}>
                <Compass size={14} />
                <span>
                  {selectedInterests.length === INTEREST_CATEGORIES.length
                    ? "Reset Selection"
                    : "Explore Everything"}
                </span>
              </button>
            </div>

            <div className="planner-interests-grid">
              {INTEREST_CATEGORIES.map((cat: any) => {
                const Icon = ICON_MAP[cat.icon] || Compass;
                const isSelected = selectedInterests.includes(cat.id);

                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`planner-interest-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleInterest(cat.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="planner-interest-icon">
                      <Icon size={18} />
                    </div>
                    <div className="planner-interest-content">
                      <strong>{cat.title}</strong>
                      <p>{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ====================================================
              SECTION 3: FOOD PREFERENCES & DIETARY MATRIX
              ==================================================== */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">03</span>
              <div>
                <h2>Food Preferences & Dietary Care</h2>
                <p>Never worry about hidden meat, fish dashi, or dining confusion in Japan.</p>
              </div>
            </div>

            {/* Broad Dietary Selector */}
            <div className="planner-field-group" style={{ marginBottom: "20px" }}>
              <label>Primary Dietary Identity</label>
              <div className="planner-dietary-pills-row">
                {FOOD_PREFERENCE_OPTIONS.map((opt: any) => (
                  <button
                    type="button"
                    key={opt.id}
                    className={`planner-dietary-card-btn ${dietary === opt.id ? "selected" : ""}`}
                    onClick={() => handleBroadDietaryChange(opt.id)}
                  >
                    <strong>{opt.label}</strong>
                    <span>{opt.note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Food Choices Matrix (Eat / Avoid / Not Sure) */}
            <div className="planner-matrix-section">
              <div className="planner-matrix-header">
                <strong>Individual Food Choices (Takes Precedence)</strong>
                <span>
                  Indicate what you individually eat or avoid. For example, you may eat chicken and
                  fish but strictly avoid beef and pork.
                </span>
              </div>

              <div className="planner-food-items-grid">
                {INDIVIDUAL_FOOD_ITEMS.map((item: any) => {
                  const currentVal = foodChoices[item.id] || "avoid";

                  return (
                    <div className="planner-food-item-row" key={item.id}>
                      <span className="planner-food-item-name">{item.name}</span>
                      <div className="planner-eat-avoid-toggle">
                        <button
                          type="button"
                          className={`planner-toggle-btn eat ${currentVal === "eat" ? "active" : ""}`}
                          onClick={() => handleFoodChoiceItem(item.id, "eat")}
                        >
                          Eat
                        </button>
                        <button
                          type="button"
                          className={`planner-toggle-btn avoid ${currentVal === "avoid" ? "active" : ""}`}
                          onClick={() => handleFoodChoiceItem(item.id, "avoid")}
                        >
                          Avoid
                        </button>
                        <button
                          type="button"
                          className={`planner-toggle-btn not_sure ${currentVal === "not_sure" ? "active" : ""}`}
                          onClick={() => handleFoodChoiceItem(item.id, "not_sure")}
                        >
                          Not sure
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional dining preferences chips */}
            <div className="planner-field-group" style={{ marginBottom: "20px" }}>
              <label>Additional Dining Preferences</label>
              <div className="planner-extra-food-chips">
                {EXTRA_FOOD_PREFS.map((pref: any) => {
                  const isChecked = extraFoodPrefs.includes(pref.id);
                  return (
                    <button
                      type="button"
                      key={pref.id}
                      className={`planner-extra-chip ${isChecked ? "selected" : ""}`}
                      onClick={() => toggleExtraFoodPref(pref.id)}
                    >
                      {pref.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Medical Allergies & Restrictions */}
            <div className="planner-allergies-box">
              <label htmlFor="allergies-field">
                <span>Allergies & Medically Necessary Restrictions</span>
                <small style={{ color: "#bc4728", fontWeight: 600 }}>
                  <ShieldAlert size={13} style={{ verticalAlign: "middle" }} /> Strictly prioritized
                </small>
              </label>
              <textarea
                id="allergies-field"
                rows={2}
                className="planner-allergies-input"
                placeholder="e.g. Peanut allergy, severe shellfish allergy, gluten intolerance, lactose intolerance"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
              <span style={{ fontSize: "11.5px", color: "var(--muted)" }}>
                We will match certified restaurants and generate Japanese translation dining cards
                for you to present to kitchen staff.
              </span>
            </div>
          </section>

          {/* ====================================================
              SECTION 4: BUDGET PLANNER
              ==================================================== */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">04</span>
              <div>
                <h2>Budget & Travel Comfort</h2>
                <p>Choose an experience tier covering your entire group and duration.</p>
              </div>
            </div>

            <div className="planner-budget-tiers-grid">
              {/* 1. Budget Explorer */}
              <div
                className={`planner-budget-card ${budgetTier === "budget" ? "selected" : ""}`}
                onClick={() => setBudgetTier("budget")}
              >
                <div>
                  <div className="planner-budget-tier-title">Budget Explorer</div>
                  <div className="planner-budget-tier-cost">~¥7,500/day/person (~₹4,200)</div>
                  <div className="planner-budget-tier-desc">
                    Affordable public transit, street food & free sights. Maximum value for curious
                    travelers.
                  </div>
                </div>
                <ul className="planner-budget-bullets">
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Subways & 24h metro passes
                  </li>
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Casual ramen & bento
                    eateries
                  </li>
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Free shrines & scenic parks
                  </li>
                </ul>
              </div>

              {/* 2. Balanced Experience */}
              <div
                className={`planner-budget-card ${budgetTier === "mid" ? "selected" : ""}`}
                onClick={() => setBudgetTier("mid")}
              >
                <div>
                  <div className="planner-budget-tier-title">Balanced Experience</div>
                  <div className="planner-budget-tier-cost">~¥15,500/day/person (~₹8,600)</div>
                  <div className="planner-budget-tier-desc">
                    Balance comfort, paid viewpoints, authentic cafes & convenient express
                    transportation.
                  </div>
                </div>
                <ul className="planner-budget-bullets">
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Express trains & IC card
                    rides
                  </li>
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Sit-down izakayas & tea
                    cafes
                  </li>
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Shibuya Sky & teamLab
                    tickets
                  </li>
                </ul>
              </div>

              {/* 3. Premium Experience */}
              <div
                className={`planner-budget-card ${budgetTier === "premium" ? "selected" : ""}`}
                onClick={() => setBudgetTier("premium")}
              >
                <div>
                  <div className="planner-budget-tier-title">Premium Experience</div>
                  <div className="planner-budget-tier-cost">~¥29,000/day/person (~₹16,200)</div>
                  <div className="planner-budget-tier-desc">
                    Top-tier culinary banquets, private cultural masters & seamless Shinkansen Green
                    travel.
                  </div>
                </div>
                <ul className="planner-budget-bullets">
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Shinkansen Green Car & cabs
                  </li>
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Kaiseki banquets & Wagyu
                    dining
                  </li>
                  <li>
                    <Check size={13} style={{ color: "var(--red)" }} /> Private tea masters & guides
                  </li>
                </ul>
              </div>
            </div>

            {/* Custom Budget Toggle */}
            <div style={{ marginTop: "16px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}
              >
                <input
                  type="checkbox"
                  id="custom-budget-chk"
                  style={{ accentColor: "var(--red)", width: "16px", height: "16px" }}
                  checked={budgetTier === "custom"}
                  onChange={(e) => setBudgetTier(e.target.checked ? "custom" : "mid")}
                />
                <label
                  htmlFor="custom-budget-chk"
                  style={{ fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  I have a specific total budget in mind
                </label>
              </div>

              {budgetTier === "custom" && (
                <div style={{ maxWidth: "340px", marginTop: "8px" }}>
                  <input
                    type="number"
                    className="planner-text-input"
                    placeholder="Enter total group budget in JPY (¥)"
                    value={customBudgetJPY}
                    onChange={(e) => setCustomBudgetJPY(e.target.value)}
                  />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--muted)",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    e.g. ¥250000 (~₹1,40,000) for entire {travellers}-person group
                  </span>
                </div>
              )}
            </div>

            {/* Live Budget Estimator Box */}
            <div className="planner-estimator-box">
              <div className="planner-estimator-top">
                <div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    ESTIMATED TOTAL TRIP EXPENDITURE ({travellers} TRAVELLERS · {duration} DAYS)
                  </span>
                  <div className="planner-est-total">
                    ¥{liveBudgetEstimate.totalJPY?.toLocaleString()}
                    <span>(~₹{liveBudgetEstimate.totalINR?.toLocaleString()})</span>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                    Approx. Per-Person Cost
                  </span>
                  <strong style={{ fontSize: "16px", color: "var(--ink)" }}>
                    ¥{liveBudgetEstimate.perPersonJPY?.toLocaleString()} (~₹
                    {liveBudgetEstimate.perPersonINR?.toLocaleString()})
                  </strong>
                </div>
              </div>

              {liveBudgetEstimate.customWarning && (
                <div
                  style={{
                    background: "rgba(231, 111, 81, 0.1)",
                    border: "1px solid rgba(231, 111, 81, 0.3)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontSize: "12px",
                    color: "#bc4728",
                    marginBottom: "12px",
                  }}
                >
                  <AlertCircle size={14} style={{ verticalAlign: "middle", marginRight: "6px" }} />
                  {liveBudgetEstimate.customWarning.message}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "var(--muted)",
                  borderTop: "1px solid var(--line)",
                  paddingTop: "12px",
                }}
              >
                <Info size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
                <span>
                  <strong>Note:</strong> Your trip budget includes food, transportation,
                  attractions, and activities. Accommodation is not included yet.
                </span>
              </div>
            </div>
          </section>

          {/* ====================================================
              SECTION 5: SUBMIT CTA
              ==================================================== */}
          <div className="planner-submit-section">
            <button type="submit" className="planner-create-cta-btn" disabled={loading}>
              <span>{isEditMode ? "Update My Travel Profile" : "Create My Travel Profile"}</span>
              <ArrowRight size={18} />
            </button>
            <span
              style={{
                display: "block",
                fontSize: "12px",
                color: "var(--muted)",
                marginTop: "10px",
              }}
            >
              Generates a full day-by-day itinerary with PDF export, transit instructions & dietary
              cards.
            </span>
          </div>
        </form>
      </div>

      {/* GENERATION LOADING MODAL */}
      {loading && (
        <div className="planner-modal-overlay">
          <div className="planner-generation-modal">
            <div className="planner-spinner-ring" />
            <h3>Building Your Japan Journey</h3>
            <div className="planner-progress-track">
              <div
                className="planner-progress-bar"
                style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
            <p className="planner-step-text">{LOADING_STEPS[loadingStepIndex]}</p>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              Customizing for {travellers} traveller{travellers > 1 ? "s" : ""} · {duration} Days in{" "}
              {destination}
            </span>
          </div>
        </div>
      )}

      <Footer tagline="Made for the journey, inspired by Japan." />
    </main>
  );
}
