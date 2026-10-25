import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { exportItineraryPdf } from "../utils/exportItineraryPdf";
import { Download } from "lucide-react";
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
import { Nav } from "@/components/japan/Nav";
import { useAuth } from "../context/AuthContext";
import {
  DESTINATION_PRESETS,
  INTEREST_CATEGORIES,
  FOOD_PREFERENCE_OPTIONS,
  INDIVIDUAL_FOOD_ITEMS,
  EXTRA_FOOD_PREFS,
  generateFullItinerary,
} from "../utils/generateItinerary";
import "./Planner.css";

const ICON_MAP = {
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
  "Fetching attractions & tourist places from Supabase database...",
  "Planning practical daily routes to avoid backtracking...",
  "Matching restaurants to your dietary choices & allergies...",
  "Calculating realistic daily budgets and transportation...",
];

export default function Planner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const { user, savePlan, getPlan } = useAuth();

  // Form State
  const [travellers, setTravellers] = useState(2);
  const [duration, setDuration] = useState(5);
  const [destination, setDestination] = useState("Golden Route (Tokyo, Kyoto & Osaka)");
  const [customDestination, setCustomDestination] = useState("");
  const [startingCity, setStartingCity] = useState("Tokyo");
  const [travelSeason, setTravelSeason] = useState("Spring (Sakura)");
  const [pace, setPace] = useState("balanced");

  // Interests state (default selections)
  const [selectedInterests, setSelectedInterests] = useState([
    "temples",
    "food",
    "culture",
    "photography",
  ]);

  // Food preferences state
  const [dietary, setDietary] = useState(user?.dietary || "Vegetarian");
  const [foodChoices, setFoodChoices] = useState({
    eggs: "eat",
    chicken: "avoid",
    fish: "avoid",
    mutton: "avoid",
    pork: "avoid",
    beef: "avoid",
    other_meats: "avoid",
  });
  const [extraFoodPrefs, setExtraFoodPrefs] = useState(["street_food"]);
  const [allergies, setAllergies] = useState("");

  // Budget state
  const [budgetTier, setBudgetTier] = useState("mid");
  const [customBudgetJPY, setCustomBudgetJPY] = useState("");

  // Generation & Loading state
  const [loading, setLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

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
          const match = DESTINATION_PRESETS.find((d) => d.name === p.destination);
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

  const handleBroadDietaryChange = (optId) => {
    setDietary(optId);
    if (optId === "Vegetarian" || optId === "Eggetarian") {
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

  const handleFoodChoiceItem = (itemId, choice) => {
    setFoodChoices((prev) => ({
      ...prev,
      [itemId]: choice,
    }));
  };

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExploreAll = () => {
    if (selectedInterests.length === INTEREST_CATEGORIES.length) {
      setSelectedInterests(["temples", "food"]);
    } else {
      setSelectedInterests(INTEREST_CATEGORIES.map((c) => c.id));
    }
  };

  const toggleExtraFoodPref = (id) => {
    setExtraFoodPrefs((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

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

  // Live Budget Preview calculation
  const liveBudgetEstimate = useMemo(() => {
    const rates = { budget: 7500, mid: 15500, premium: 29000 };
    const baseDaily = rates[budgetTier] || 15500;
    const totalJPY = customBudgetJPY ? Number(customBudgetJPY) : baseDaily * duration * travellers;
    const totalINR = Math.round(totalJPY * 0.56);
    return {
      totalJPY,
      totalINR,
      perPersonJPY: Math.round(totalJPY / travellers),
      perPersonINR: Math.round(totalINR / travellers),
      customWarning: null,
    };
  }, [budgetTier, customBudgetJPY, duration, travellers]);

  // Form Submission with Database integration (`await`)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalDestination =
      destination === "custom" && customDestination.trim()
        ? customDestination.trim()
        : destination;

    if (!finalDestination) {
      alert("Please choose or enter a destination in Japan.");
      return;
    }

    setLoading(true);
    setLoadingStepIndex(0);

    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 700);

    try {
      // Calling asynchronous generateFullItinerary which fetches from Supabase tourist_places table
      const generatedTrip = await generateFullItinerary({
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

      clearInterval(interval);

      if (isEditMode && editId) {
        generatedTrip.id = editId;
      }

      const saved = savePlan(generatedTrip);
      setLoading(false);
      navigate(`/itinerary/${saved.id}`);
    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      console.error("Itinerary generation error:", err);
      alert("Itinerary generate karne mein error aaya hai. Kripya apna backend aur database connection check karein.");
    }
  };

  return (
    <main className="planner-page">
      <Nav />

      <section className="planner-hero-section">
        <div className="planner-hero-content">
          <h1>
            Craft your personalized
            <br />
            <span>Japan Itinerary.</span>
          </h1>
          <p>
            Tell us your travel group, dietary preferences, and interests. We'll generate a realistic, day-by-day plan with transit routes, attractions, and food guidance.
          </p>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "12px" }}>
            <button
              type="button"
              onClick={() => {
                const form = document.querySelector(".planner-form-card");
                if (form) form.requestSubmit();
              }}
              className="button-primary"
              style={{
                background: "#CF3A24",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "30px",
                fontSize: "15px",
                fontWeight: 600,
                boxShadow: "0 6px 20px rgba(207, 58, 36, 0.35)",
                border: "none",
                cursor: "pointer"
              }}
            >
              <Sparkles size={18} /> Quick Create Itinerary
            </button>
          </div>

          {isEditMode && (
            <div className="planner-edit-alert">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} />
                <span>Editing saved itinerary <strong>#{editId}</strong>.</span>
              </div>
              <Link to={`/itinerary/${editId}`} style={{ color: "inherit", textDecoration: "underline", fontWeight: 600 }}>
                Cancel Edit
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="planner-form-container">
        <form className="planner-form-card" onSubmit={handleSubmit}>
          {/* Section 1 */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">01</span>
              <div>
                <h2>Trip Details & Destinations</h2>
                <p>Define your party size, length of stay, and destinations in Japan.</p>
              </div>
            </div>

            <div className="planner-controls-row">
              <div className="planner-control-card">
                <div className="planner-control-top">
                  <label htmlFor="travellers-slider">Number of Travellers</label>
                  <span className="planner-value-tag">{travellers} People</span>
                </div>
                <div className="planner-stepper-wrap">
                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setTravellers((v) => Math.max(1, v - 1))}
                    disabled={travellers <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    id="travellers-slider"
                    type="range"
                    min="1"
                    max="50"
                    className="planner-range-slider"
                    value={travellers}
                    onChange={(e) => setTravellers(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setTravellers((v) => Math.min(50, v + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

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
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    id="duration-slider"
                    type="range"
                    min="2"
                    max="30"
                    className="planner-range-slider"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="planner-step-btn"
                    onClick={() => setDuration((v) => Math.min(30, v + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="planner-field-group" style={{ marginBottom: "18px" }}>
              <label>Choose Primary Destination or Region</label>
              <div className="planner-destination-presets">
                {DESTINATION_PRESETS.map((dest) => (
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
                  placeholder="Enter Japanese city or prefecture"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  autoFocus
                />
              )}
            </div>

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
                  <option value="Fukuoka">Fukuoka</option>
                  <option value="Sapporo">Sapporo</option>
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
                  <option value="Spring (Sakura)">Spring (Sakura · Mar-May)</option>
                  <option value="Summer (Festivals)">Summer (Festivals · Jun-Aug)</option>
                  <option value="Autumn (Foliage)">Autumn (Foliage · Sep-Nov)</option>
                  <option value="Winter (Snow & Onsen)">Winter (Snow · Dec-Feb)</option>
                </select>
              </div>

              <div className="planner-field-group">
                <label>Travel Pace</label>
                <select
                  className="planner-select-input"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                >
                  <option value="relaxed">Relaxed</option>
                  <option value="balanced">Balanced</option>
                  <option value="packed">Packed</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">02</span>
              <div>
                <h2>Interests & Experiences</h2>
                <p>Pick what excites you about Japan to shape your schedule.</p>
              </div>
            </div>

            <div className="planner-interests-header-row">
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                Selected: <strong>{selectedInterests.length}</strong> of {INTEREST_CATEGORIES.length}
              </span>
              <button type="button" className="planner-explore-all-btn" onClick={handleExploreAll}>
                <Compass size={14} />
                <span>Toggle All</span>
              </button>
            </div>

            <div className="planner-interests-grid">
              {INTEREST_CATEGORIES.map((cat) => {
                const Icon = ICON_MAP[cat.icon] || Compass;
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    className={`planner-interest-card ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleInterest(cat.id)}
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

          {/* Section 3 */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">03</span>
              <div>
                <h2>Food Preferences & Dietary Care</h2>
                <p>Never worry about hidden meat or fish dashi.</p>
              </div>
            </div>

            <div className="planner-field-group" style={{ marginBottom: "20px" }}>
              <label>Primary Dietary Identity</label>
              <div className="planner-dietary-pills-row">
                {FOOD_PREFERENCE_OPTIONS.map((opt) => (
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

            <div className="planner-matrix-section">
              <div className="planner-matrix-header">
                <strong>Individual Food Choices</strong>
              </div>
              <div className="planner-food-items-grid">
                {INDIVIDUAL_FOOD_ITEMS.map((item) => {
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="planner-allergies-box">
              <label htmlFor="allergies-field">
                <span>Allergies & Restrictions</span>
              </label>
              <textarea
                id="allergies-field"
                rows="2"
                className="planner-allergies-input"
                placeholder="e.g. Peanut allergy, shellfish allergy"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>
          </section>

          {/* Section 4 */}
          <section className="planner-form-section">
            <div className="planner-section-header">
              <span className="planner-step-number-badge">04</span>
              <div>
                <h2>Budget & Travel Comfort</h2>
                <p>Choose an experience tier covering your entire group.</p>
              </div>
            </div>

            <div className="planner-budget-tiers-grid">
              <div
                className={`planner-budget-card ${budgetTier === "budget" ? "selected" : ""}`}
                onClick={() => setBudgetTier("budget")}
              >
                <div>
                  <div className="planner-budget-tier-title">Budget Explorer</div>
                  <div className="planner-budget-tier-cost">~¥7,500/day/person</div>
                </div>
              </div>

              <div
                className={`planner-budget-card ${budgetTier === "mid" ? "selected" : ""}`}
                onClick={() => setBudgetTier("mid")}
              >
                <div>
                  <div className="planner-budget-tier-title">Balanced Experience</div>
                  <div className="planner-budget-tier-cost">~¥15,500/day/person</div>
                </div>
              </div>

              <div
                className={`planner-budget-card ${budgetTier === "premium" ? "selected" : ""}`}
                onClick={() => setBudgetTier("premium")}
              >
                <div>
                  <div className="planner-budget-tier-title">Premium Experience</div>
                  <div className="planner-budget-tier-cost">~¥29,000/day/person</div>
                </div>
              </div>
            </div>

            <div className="planner-estimator-box">
              <div className="planner-estimator-top">
                <div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)" }}>
                    ESTIMATED TOTAL TRIP EXPENDITURE
                  </span>
                  <div className="planner-est-total">
                    ¥{liveBudgetEstimate.totalJPY?.toLocaleString()}
                    <span>(~₹{liveBudgetEstimate.totalINR?.toLocaleString()})</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="planner-submit-section" id="planner-submit-btn">
            <button
              type="submit"
              className="planner-create-cta-btn"
              disabled={loading}
              style={{
                background: "#CF3A24",
                padding: "16px 36px",
                fontSize: "18px",
                borderRadius: "40px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                boxShadow: "0 8px 30px rgba(207, 58, 36, 0.35)",
                cursor: "pointer"
              }}
            >
              <Sparkles size={20} />
              <span>{isEditMode ? "Update Itinerary" : "Create Itinerary"}</span>
              <ArrowRight size={20} />
            </button>
            <p style={{ marginTop: "12px", fontSize: "14px", color: "#78716C" }}>
              Customized routes, dietary safety & realistic budget calculations
            </p>
          </div>
        </form>
      </div>

      {/* Floating Quick Action Bar */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "8px 12px 8px 18px",
          borderRadius: "50px",
          boxShadow: "0 10px 35px rgba(0, 0, 0, 0.15)",
          border: "1px solid #E8E2D5",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1C1917" }}>
          {destination === "custom" ? (customDestination || "Custom") : destination.split(" ")[0]} · {durationLabel}
        </div>
        <button
          type="button"
          onClick={() => {
            const form = document.querySelector(".planner-form-card");
            if (form) form.requestSubmit();
          }}
          disabled={loading}
          style={{
            background: "#CF3A24",
            color: "#fff",
            border: "none",
            borderRadius: "30px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 4px 15px rgba(207, 58, 36, 0.3)",
          }}
        >
          <Sparkles size={16} /> Create Itinerary
        </button>
      </div>

      {loading && (
        <div className="planner-modal-overlay">
          <div className="planner-generation-modal">
            <div className="planner-spinner-ring" />
            <h3>Building Your Custom Itinerary</h3>
            <div className="planner-progress-track">
              <div
                className="planner-progress-bar"
                style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
              />
            </div>
            <p className="planner-step-text">{LOADING_STEPS[loadingStepIndex]}</p>
          </div>
        </div>
      )}

    </main>
  );
}