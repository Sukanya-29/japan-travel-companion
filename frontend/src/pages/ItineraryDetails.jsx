import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  Compass,
  Utensils,
  Wallet,
  Download,
  Edit3,
  Bookmark,
  Share2,
  CheckCircle2,
  MapPin,
  Clock,
  Train,
  Footprints,
  CloudRain,
  ExternalLink,
  Sparkles,
  Info,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { Nav } from "@/components/japan/Nav";
import { useAuth } from "../context/AuthContext";
import { exportItineraryPdf } from "../utils/exportItineraryPdf";
import "./ItineraryDetails.css";

export default function ItineraryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlan, savedPlans, savePlan, isAuthenticated } = useAuth();

  const [trip, setTrip] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // 1. Try getPlan by route param
    if (id) {
      const found = getPlan(id);
      if (found) {
        setTrip(found);
        return;
      }
    }

    // 2. Fallback to latest saved plan if any
    if (savedPlans && savedPlans.length > 0) {
      setTrip(savedPlans[0]);
    }
  }, [id, getPlan, savedPlans]);

  const handleExportPdf = () => {
    if (!trip) return;
    setExporting(true);
    try {
      exportItineraryPdf(trip);
    } catch (err) {
      console.error("PDF export error", err);
      alert("Could not generate PDF. Please try again.");
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  const handleSaveToProfile = () => {
    if (!trip) return;
    savePlan(trip);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2500);
  };

  const scrollToDay = (dayNum) => {
    setActiveDay(dayNum);
    const el = document.getElementById(`day-${dayNum}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!trip) {
    return (
      <main className="itinerary-details-page">
        <Nav />
        <div style={{ maxWidth: "600px", margin: "100px auto", textAlign: "center", padding: "0 20px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "28px", color: "var(--ink)", marginBottom: "12px" }}>
            No Itinerary Found
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "15px", marginBottom: "24px" }}>
            We couldn't locate this specific travel itinerary. Create your custom Japan trip in minutes!
          </p>
          <Link to="/plan" className="itinerary-btn-primary" style={{ display: "inline-flex" }}>
            <Compass size={17} />
            <span>Create My Travel Profile</span>
          </Link>
        </div>
      </main>
    );
  }

  const { profile, budgetSummary, days } = trip;
  const destination = profile?.destination || "Japan";
  const duration = profile?.duration || days?.length || 5;
  const travellers = profile?.travellers || 2;
  const pace = profile?.pace || "Balanced";
  const dietary = profile?.dietary || "Vegetarian";

  return (
    <main className="itinerary-details-page">
      <Nav />

      {/* TOP OVERVIEW HERO */}
      <section className="itinerary-hero-section">
        <div className="itinerary-hero-container">
          <div className="itinerary-breadcrumb-row">
            <Link to="/plan" className="itinerary-back-link">
              <ArrowLeft size={16} />
              <span>Back to Journey Planner</span>
            </Link>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="itinerary-badge-tag">
                <Sparkles size={12} />
                Custom AI Companion Itinerary
              </span>
              <span className="itinerary-badge-tag" style={{ background: "rgba(41, 43, 39, 0.05)", borderColor: "var(--line)", color: "var(--ink)" }}>
                ID: #{trip.id.slice(-6)}
              </span>
            </div>
          </div>

          <div className="itinerary-title-block">
            <h1>
              {duration} Days in <span>{destination}</span>
            </h1>
            <p>
              Tailored specifically for {travellers} traveler{travellers > 1 ? "s" : ""}, curated with {dietary} dining guidance, realistic daily travel routes, and comprehensive budget calculations.
            </p>
          </div>

          {/* Key Stats Bar */}
          <div className="itinerary-stats-grid">
            <div className="itinerary-stat-card">
              <span className="itinerary-stat-label">
                <Users size={14} /> Travellers
              </span>
              <span className="itinerary-stat-value">{travellers} People</span>
              <span className="itinerary-stat-sub">Group size</span>
            </div>

            <div className="itinerary-stat-card">
              <span className="itinerary-stat-label">
                <Calendar size={14} /> Duration
              </span>
              <span className="itinerary-stat-value">{duration} Days</span>
              <span className="itinerary-stat-sub">{profile?.startDate || "Flexible season"}</span>
            </div>

            <div className="itinerary-stat-card">
              <span className="itinerary-stat-label">
                <Compass size={14} /> Travel Pace
              </span>
              <span className="itinerary-stat-value" style={{ textTransform: "capitalize" }}>
                {pace}
              </span>
              <span className="itinerary-stat-sub">Geographically clustered</span>
            </div>

            <div className="itinerary-stat-card">
              <span className="itinerary-stat-label">
                <Utensils size={14} /> Food Care
              </span>
              <span className="itinerary-stat-value">{dietary}</span>
              <span className="itinerary-stat-sub">
                {profile?.allergies ? `Allergy: ${profile.allergies}` : "Allergies checked"}
              </span>
            </div>

            <div className="itinerary-stat-card highlight">
              <span className="itinerary-stat-label" style={{ color: "var(--red)" }}>
                <Wallet size={14} /> Estimated Total
              </span>
              <span className="itinerary-stat-value">
                ¥{budgetSummary?.totalJPY?.toLocaleString() || "0"}
              </span>
              <span className="itinerary-stat-sub">
                ~₹{budgetSummary?.totalINR?.toLocaleString() || "0"} (Group total)
              </span>
            </div>
          </div>

          {/* Actions Row */}
          <div className="itinerary-actions-bar">
            <div className="itinerary-action-btn-group">
              <Link to={`/plan?edit=${trip.id}`} className="itinerary-btn-secondary">
                <Edit3 size={16} />
                <span>Edit Preferences</span>
              </Link>

              <button
                type="button"
                className="itinerary-btn-primary"
                onClick={handleExportPdf}
                disabled={exporting}
              >
                <Download size={16} />
                <span>{exporting ? "Generating PDF..." : "Export Itinerary as PDF"}</span>
              </button>

              <button
                type="button"
                className="itinerary-btn-secondary"
                onClick={handleSaveToProfile}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 size={16} style={{ color: "#2a9d8f" }} />
                    <span style={{ color: "#2a9d8f" }}>Saved to Profile!</span>
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    <span>Save to Profile</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="itinerary-btn-secondary"
                onClick={handleShare}
              >
                {shareSuccess ? (
                  <>
                    <CheckCircle2 size={16} style={{ color: "#2a9d8f" }} />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>

            <div style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>
              Last updated: {new Date(trip.updatedAt || trip.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>

          {/* Accommodation Notice Banner */}
          <div className="itinerary-notice-banner">
            <Info size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Note:</strong> Your trip budget includes food, transportation, attractions, and activities. Accommodation is not included yet.
            </span>
          </div>
        </div>
      </section>

      {/* STICKY DAY JUMP NAV */}
      <nav className="itinerary-nav-strip" aria-label="Day by day jump navigation">
        <div className="itinerary-nav-container">
          <div className="itinerary-day-pills">
            {days?.map((d) => (
              <button
                type="button"
                key={d.day}
                className={`itinerary-day-pill ${activeDay === d.day ? "active" : ""}`}
                onClick={() => scrollToDay(d.day)}
              >
                Day {d.day} ({d.city})
              </button>
            ))}
          </div>

          <div className="itinerary-nav-tools">
            <a href="#budget-breakdown" className="itinerary-section-pill">
              Budget Breakdown
            </a>
            <a href="#transit-tips" className="itinerary-section-pill">
              Transit Guide
            </a>
          </div>
        </div>
      </nav>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="itinerary-main-container">
        {/* LEFT COLUMN: DAILY ITINERARY CARDS */}
        <div className="itinerary-days-column">
          {days?.map((day) => (
            <article className="itinerary-day-card" id={`day-${day.day}`} key={day.day}>
              {/* Day Header */}
              <div className="itinerary-day-header">
                <div className="itinerary-day-title-wrap">
                  <div className="itinerary-day-badge">
                    <span>DAY</span>
                    <strong>{String(day.day).padStart(2, "0")}</strong>
                  </div>
                  <div>
                    <span className="itinerary-day-region">
                      {day.city} · {day.area}
                    </span>
                    <h3>{day.theme}</h3>
                  </div>
                </div>

                <div className="itinerary-day-cost-badge">
                  Est. Daily: ¥{day.dailyEstimatedCostJPY?.toLocaleString()} (~₹{day.dailyEstimatedCostINR?.toLocaleString()})
                </div>
              </div>

              {/* Activities Timeline */}
              <div className="itinerary-activities-timeline">
                {/* 1. MORNING */}
                <div className="itinerary-activity-item">
                  <div className="itinerary-slot-icon">
                    <Compass size={18} />
                  </div>
                  <div className="itinerary-activity-body">
                    <div className="itinerary-activity-top">
                      <span className="itinerary-slot-tag">Morning · {day.morning.time}</span>
                      <span className="itinerary-category-pill">{day.morning.category}</span>
                    </div>
                    <h4>{day.morning.title}</h4>
                    <p>{day.morning.desc}</p>
                    <div className="itinerary-activity-meta">
                      <span><Clock size={13} style={{ verticalAlign: "middle" }} /> {day.morning.duration}</span>
                      <span><DollarSign size={13} style={{ verticalAlign: "middle" }} /> Entry: {day.morning.estCostJPY === 0 ? "Free" : `¥${day.morning.estCostJPY}`}</span>
                    </div>
                  </div>
                </div>

                {/* TRANSIT LEG 1 */}
                {day.transit1 && (
                  <div className="itinerary-transit-card">
                    {day.transit1.mode.toLowerCase().includes("walk") ? (
                      <Footprints size={16} />
                    ) : (
                      <Train size={16} />
                    )}
                    <div className="itinerary-transit-info">
                      <span>
                        <strong className="itinerary-transit-mode">{day.transit1.mode}:</strong>{" "}
                        {day.transit1.detail} (~{day.transit1.timeMin} mins)
                      </span>
                      <span className="itinerary-transit-cost">
                        {day.transit1.costJPY === 0 ? "Free Walk" : `¥${day.transit1.costJPY}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* LUNCH RECOMMENDATION */}
                {day.food?.lunch && (
                  <div className="itinerary-food-card">
                    <div className="itinerary-food-header">
                      <span className="itinerary-meal-type">
                        <Utensils size={13} /> Lunch Recommendation
                      </span>
                      <span className={`itinerary-food-safety-pill ${day.food.lunch.safety?.statusType || "safe"}`}>
                        <ShieldCheck size={13} />
                        {day.food.lunch.safety?.statusBadge || "Dietary Friendly"}
                      </span>
                    </div>

                    <div className="itinerary-food-title">
                      <strong>{day.food.lunch.name}</strong>
                      <span>{day.food.lunch.cuisine} · {day.food.lunch.priceRange}</span>
                    </div>

                    <div className="itinerary-food-dishes">
                      <strong>Recommended:</strong> {day.food.lunch.recommendedDishes}
                    </div>

                    <div className="itinerary-food-actions">
                      <span className="itinerary-food-note">
                        {day.food.lunch.safety?.note || "Confirm ingredients upon ordering."}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          day.food.lunch.mapQuery || `${day.food.lunch.name} ${day.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="itinerary-maps-link"
                      >
                        <span>Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {/* 2. AFTERNOON */}
                <div className="itinerary-activity-item">
                  <div className="itinerary-slot-icon">
                    <MapPin size={18} />
                  </div>
                  <div className="itinerary-activity-body">
                    <div className="itinerary-activity-top">
                      <span className="itinerary-slot-tag">Afternoon · {day.afternoon.time}</span>
                      <span className="itinerary-category-pill">{day.afternoon.category}</span>
                    </div>
                    <h4>{day.afternoon.title}</h4>
                    <p>{day.afternoon.desc}</p>
                    <div className="itinerary-activity-meta">
                      <span><Clock size={13} style={{ verticalAlign: "middle" }} /> {day.afternoon.duration}</span>
                      <span><DollarSign size={13} style={{ verticalAlign: "middle" }} /> Entry: {day.afternoon.estCostJPY === 0 ? "Free" : `¥${day.afternoon.estCostJPY}`}</span>
                    </div>
                  </div>
                </div>

                {/* TRANSIT LEG 2 */}
                {day.transit2 && (
                  <div className="itinerary-transit-card">
                    {day.transit2.mode.toLowerCase().includes("walk") ? (
                      <Footprints size={16} />
                    ) : (
                      <Train size={16} />
                    )}
                    <div className="itinerary-transit-info">
                      <span>
                        <strong className="itinerary-transit-mode">{day.transit2.mode}:</strong>{" "}
                        {day.transit2.detail} (~{day.transit2.timeMin} mins)
                      </span>
                      <span className="itinerary-transit-cost">
                        {day.transit2.costJPY === 0 ? "Free Walk" : `¥${day.transit2.costJPY}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. EVENING */}
                <div className="itinerary-activity-item">
                  <div className="itinerary-slot-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="itinerary-activity-body">
                    <div className="itinerary-activity-top">
                      <span className="itinerary-slot-tag">Evening · {day.evening.time}</span>
                      <span className="itinerary-category-pill">{day.evening.category}</span>
                    </div>
                    <h4>{day.evening.title}</h4>
                    <p>{day.evening.desc}</p>
                    <div className="itinerary-activity-meta">
                      <span><Clock size={13} style={{ verticalAlign: "middle" }} /> {day.evening.duration}</span>
                      <span><DollarSign size={13} style={{ verticalAlign: "middle" }} /> Entry: {day.evening.estCostJPY === 0 ? "Free" : `¥${day.evening.estCostJPY}`}</span>
                    </div>
                  </div>
                </div>

                {/* DINNER RECOMMENDATION */}
                {day.food?.dinner && (
                  <div className="itinerary-food-card">
                    <div className="itinerary-food-header">
                      <span className="itinerary-meal-type">
                        <Utensils size={13} /> Dinner Recommendation
                      </span>
                      <span className={`itinerary-food-safety-pill ${day.food.dinner.safety?.statusType || "safe"}`}>
                        <ShieldCheck size={13} />
                        {day.food.dinner.safety?.statusBadge || "Dietary Friendly"}
                      </span>
                    </div>

                    <div className="itinerary-food-title">
                      <strong>{day.food.dinner.name}</strong>
                      <span>{day.food.dinner.cuisine} · {day.food.dinner.priceRange}</span>
                    </div>

                    <div className="itinerary-food-dishes">
                      <strong>Recommended:</strong> {day.food.dinner.recommendedDishes}
                    </div>

                    <div className="itinerary-food-actions">
                      <span className="itinerary-food-note">
                        {day.food.dinner.safety?.note || "Confirm ingredients upon ordering."}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          day.food.dinner.mapQuery || `${day.food.dinner.name} ${day.city}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="itinerary-maps-link"
                      >
                        <span>Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}

                {/* RAINY DAY BACKUP */}
                {day.weatherBackup && (
                  <div className="itinerary-weather-card">
                    <CloudRain size={16} />
                    <span>
                      <strong>Rainy Day / Bad Weather Alternative:</strong> {day.weatherBackup}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* RIGHT COLUMN: SIDEBAR (BUDGET SUMMARY & TRANSIT CARD) */}
        <aside className="itinerary-sidebar-column">
          {/* Budget Breakdown Card */}
          <div className="itinerary-side-card" id="budget-breakdown">
            <h3>
              <Wallet size={18} style={{ color: "var(--red)" }} />
              Estimated Budget
            </h3>

            <div className="itinerary-per-person-callout">
              <span>Per-Person Approximate Cost:</span>
              <strong>
                ¥{budgetSummary?.perPersonJPY?.toLocaleString()} (~₹{budgetSummary?.perPersonINR?.toLocaleString()})
              </strong>
            </div>

            <div className="itinerary-budget-table">
              {budgetSummary?.categories?.map((cat) => (
                <div className="itinerary-budget-row" key={cat.label}>
                  <span>{cat.label} ({cat.share})</span>
                  <strong>¥{cat.jpy?.toLocaleString()}</strong>
                </div>
              ))}

              <div className="itinerary-budget-row total-row">
                <span>Total ({travellers} travellers):</span>
                <strong>¥{budgetSummary?.totalJPY?.toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.45, borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
              *Accommodation is excluded. Estimated based on {budgetSummary?.tierName || "Balanced Experience"} tier in {destination}.
            </div>
          </div>

          {/* Practical Transit Advice Card */}
          <div className="itinerary-side-card" id="transit-tips">
            <h3>
              <Train size={18} style={{ color: "var(--red)" }} />
              Transit & Route Tips
            </h3>

            <div className="itinerary-transit-tips-list">
              <div className="itinerary-transit-tip-item">
                <Train size={15} />
                <div>
                  <strong>Get a Welcome Suica or Pasmo IC:</strong>
                  Tap in/out on all subways, local trains, and even convenience stores across Tokyo, Kyoto & Osaka.
                </div>
              </div>

              <div className="itinerary-transit-tip-item">
                <Compass size={15} />
                <div>
                  <strong>Tokyo Subway 24/48/72h Ticket:</strong>
                  Unlimited rides on Tokyo Metro & Toei Subway for ~¥800/day. High value for Days in Tokyo.
                </div>
              </div>

              <div className="itinerary-transit-tip-item">
                <Footprints size={15} />
                <div>
                  <strong>Geographical Order:</strong>
                  Morning, afternoon, and evening sights are arranged sequentially along logical metro corridors to avoid backtracking.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="itinerary-side-card" style={{ textAlign: "center" }}>
            <button
              type="button"
              className="itinerary-btn-primary"
              style={{ width: "100%", justifyContent: "center", marginBottom: "8px" }}
              onClick={handleExportPdf}
              disabled={exporting}
            >
              <Download size={16} />
              <span>{exporting ? "Generating PDF..." : "Export as Clean PDF"}</span>
            </button>
            <Link
              to={`/plan?edit=${trip.id}`}
              className="itinerary-btn-secondary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Edit3 size={15} />
              <span>Modify Trip Preferences</span>
            </Link>
          </div>
        </aside>
      </div>

    </main>
  );
}
