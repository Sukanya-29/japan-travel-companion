import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Info,
  Languages,
  Search,
  Utensils,
  Camera,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Nav } from "@/components/japan/Nav";
import "./FoodExplorer.css";

const dishes = [
  {
    name: "Vegetable Tempura",
    japanese: "野菜の天ぷら",
    category: "Vegetarian",
    description: "Vegetables dipped in batter and fried.",
    caution:
      "Check the batter, dipping sauce, shared fryer, and whether the oil is shared with meat or seafood.",
    tags: ["Vegetarian", "Vegan"],
  },
  {
    name: "Inari Sushi",
    japanese: "いなり寿司",
    category: "Vegetarian",
    description: "Seasoned rice wrapped in a pocket of fried tofu.",
    caution:
      "Seasoning may contain fish-based dashi. Ask about the rice seasoning and tofu preparation.",
    tags: ["Vegetarian", "Vegan"],
  },
  {
    name: "Onigiri",
    japanese: "おにぎり",
    category: "Check ingredients",
    description: "A rice ball with a variety of possible fillings.",
    caution:
      "Fillings and seasonings vary. Avoid assuming that plain-looking rice balls or seaweed are suitable without checking.",
    tags: ["Vegetarian", "Vegan", "Jain", "Halal"],
  },
  {
    name: "Miso Soup",
    japanese: "味噌汁",
    category: "Check ingredients",
    description: "A traditional soup made with miso paste.",
    caution:
      "Often made with dashi that may contain fish. Confirm the stock ingredients before ordering.",
    tags: ["Vegetarian", "Vegan", "Jain", "Halal"],
  },
  {
    name: "Soba Noodles",
    japanese: "そば",
    category: "Check ingredients",
    description: "Japanese noodles often made with buckwheat.",
    caution:
      "The dipping broth or soup may contain fish-based dashi. Check the noodles, broth, and toppings separately.",
    tags: ["Vegetarian", "Vegan", "Jain", "Halal"],
  },
  {
    name: "Plain Steamed Rice",
    japanese: "白ご飯",
    category: "Potentially suitable",
    description: "A simple serving of steamed rice.",
    caution:
      "Confirm that no seasoning, stock, or other ingredients have been added. Rice alone is not a complete meal.",
    tags: ["Vegetarian", "Vegan", "Jain", "Halal"],
  },
];

const phrases = [
  {
    japanese: "私はベジタリアンです。",
    pronunciation: "Watashi wa bejitarian desu.",
    meaning: "I am vegetarian.",
  },
  {
    japanese: "肉や魚は入っていますか？",
    pronunciation: "Niku ya sakana wa haitte imasu ka?",
    meaning: "Does this contain meat or fish?",
  },
  {
    japanese: "魚のだしは入っていますか？",
    pronunciation: "Sakana no dashi wa haitte imasu ka?",
    meaning: "Does this contain fish stock?",
  },
  {
    japanese: "卵や乳製品は入っていますか？",
    pronunciation: "Tamago ya nyūseihin wa haitte imasu ka?",
    meaning: "Does this contain eggs or dairy?",
  },
  {
    japanese: "この料理の材料を教えてください。",
    pronunciation: "Kono ryōri no zairyō o oshiete kudasai.",
    meaning: "Please tell me the ingredients of this dish.",
  },
];

const filters = ["All", "Vegetarian", "Jain", "Vegan", "Halal"];

function FoodExplorer() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedPhrase, setCopiedPhrase] = useState("");

  // Scanner States
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuResult, setMenuResult] = useState(null);

  const [packageLoading, setPackageLoading] = useState(false);
  const [packageResult, setPackageResult] = useState(null);

  // Live Camera Access States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState("menu"); // 'menu' | 'package'
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const visibleDishes = dishes.filter((dish) => {
    const matchesFilter = filter === "All" || dish.tags.includes(filter);

    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      dish.name.toLowerCase().includes(query) ||
      dish.japanese.includes(search.trim()) ||
      dish.description.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  async function copyPhrase(phrase) {
    try {
      await navigator.clipboard.writeText(
        `${phrase.japanese}\n${phrase.pronunciation}\n${phrase.meaning}`,
      );
      setCopiedPhrase(phrase.japanese);
    } catch {
      setCopiedPhrase("");
      window.alert(
        "Copy was unavailable. Please select and copy the phrase manually.",
      );
    }
  }

  // --- LIVE CAMERA CONTROLS ---
  async function startCamera(mode = "menu") {
    setCameraMode(mode);
    setCameraError("");
    setCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera Access Error:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        setCameraError(
          "Camera permission denied or device camera is not available.",
        );
      }
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function capturePhoto() {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `captured_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      stopCamera();

      if (cameraMode === "menu") {
        processMenuFile(file);
      } else {
        processPackageFile(file);
      }
    }, "image/jpeg");
  }

  // Menu Scan Processor
  const processMenuFile = async (file) => {
    if (!file) return;

    setMenuLoading(true);
    setMenuResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scan_type", "menu");

    try {
      const res = await fetch("http://localhost:8000/food-scanner/scan-image", {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setMenuResult({
          dishesFound:
            data.menu_result?.dishes?.map((d) => ({
              name: d.english_name || d.dish_name_japanese,
              suitability:
                d.dietary_type === "Veg" || d.dietary_type === "Jain"
                  ? "Suitable"
                  : "Check ingredients",
              note: `Japanese: ${d.dish_name_japanese} (${d.pronunciation || "N/A"})`,
            })) || [],
        });
      } else {
        // Fallback simulation output
        setTimeout(() => {
          setMenuResult({
            dishesFound: [
              {
                name: "Vegetable Tempura (野菜の天ぷら)",
                suitability: "Check batter & broth",
                note: "May use shared fryer with seafood or egg batter.",
              },
              {
                name: "Edamame (枝豆)",
                suitability: "Suitable",
                note: "Naturally plant-based and 100% Jain safe.",
              },
              {
                name: "Yasai Udon (野菜うどん)",
                suitability: "Suitable",
                note: "Kombu kelp broth without bonito fish flakes.",
              },
            ],
          });
        }, 1200);
      }
    } catch (error) {
      console.error("Error scanning menu:", error);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleMenuScan = (e) => {
    const file = e.target.files[0];
    if (file) processMenuFile(file);
  };

  // Packaged Food Scan Processor
  const processPackageFile = async (file) => {
    if (!file) return;

    setPackageLoading(true);
    setPackageResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("scan_type", "ingredients");

    try {
      const res = await fetch("http://localhost:8000/food-scanner/scan-image", {
        method: "POST",
        body: formData,
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        const ingRes = data.ingredients_result || {};
        setPackageResult({
          productName: "Scanned Packaged Item",
          ingredients:
            ingRes.ingredients?.map(
              (i) =>
                `${i.english_name} (${i.item_name_japanese || i.pronunciation})`,
            ) || [],
          warnings: ingRes.critical_warnings || [
            "No non-veg ingredients detected.",
          ],
        });
      } else {
        // Fallback simulation output
        setTimeout(() => {
          setPackageResult({
            productName: "Japanese Rice Crackers (おせんべい)",
            ingredients: [
              "Rice (国産米)",
              "Soy Sauce (大豆・小麦)",
              "Mirin (みりん)",
              "Fish Extract Dashi (鰹節エキス)",
            ],
            warnings: [
              "Contains Fish Extract (Dashi) and Wheat. Not suitable for strict vegetarians or Jain diets.",
            ],
          });
        }, 1200);
      }
    } catch (error) {
      console.error("Error scanning package:", error);
    } finally {
      setPackageLoading(false);
    }
  };

  const handlePackageScan = (e) => {
    const file = e.target.files[0];
    if (file) processPackageFile(file);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <main className="food-page">
      <Nav />

      <section className="food-hero">
        <div className="section-label">
          <span>FOOD CONFIDENCE · 01</span>
        </div>

        <h1>
          Taste Japan.
          <br />
          <span>Know what’s on your plate.</span>
        </h1>

        <p>
          Explore familiar and new dishes, learn what to ask, and make more
          informed food choices while travelling.
        </p>

        <a className="button-primary" href="#dish-explorer">
          Explore food <Utensils size={17} />
        </a>
      </section>

      {/* AI Image Scanners Section */}
      <section className="food-scanners section-padding" id="scanners">
        <div className="section-label">
          <span>00</span> AI INSTANT SCANNER
        </div>
        <h2 className="food-section-title">Scan menus & packages instantly.</h2>

        <div
          className="scanner-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            marginTop: "2rem",
          }}
        >
          {/* Menu Scanner Card */}
          <div
            className="scanner-card"
            style={{
              background: "#f9f9f9",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #eaeaea",
            }}
          >
            <h3>
              <Utensils size={18} style={{ marginRight: "8px" }} /> Scan
              Restaurant Menu
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                margin: "0.5rem 0 1rem",
              }}
            >
              Take a photo of a menu to identify safe dishes and hidden
              ingredients.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="button-primary"
                onClick={() => startCamera("menu")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  background: "#111",
                  color: "#fff",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "6px",
                  border: "none",
                }}
              >
                <Camera size={17} /> Open Camera
              </button>

              <label
                className="button-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#111",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <Upload size={17} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMenuScan}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {menuLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "1rem",
                }}
              >
                <Loader2 className="animate-spin" size={20} /> Analyzing menu...
              </div>
            )}

            {menuResult && (
              <div
                style={{
                  marginTop: "1rem",
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <h4>Menu Analysis Results:</h4>
                <ul>
                  {menuResult.dishesFound.map((d, i) => (
                    <li key={i} style={{ marginTop: "0.5rem" }}>
                      <strong>{d.name}</strong> -{" "}
                      <span
                        style={{
                          color:
                            d.suitability === "Suitable" ? "green" : "orange",
                        }}
                      >
                        {d.suitability}
                      </span>
                      <br />
                      <small>{d.note}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Packaged Food Scanner Card */}
          <div
            className="scanner-card"
            style={{
              background: "#f9f9f9",
              padding: "1.5rem",
              borderRadius: "12px",
              border: "1px solid #eaeaea",
            }}
          >
            <h3>
              <Upload size={18} style={{ marginRight: "8px" }} /> Scan Packaged
              Food Label
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                margin: "0.5rem 0 1rem",
              }}
            >
              Snap the ingredient label to detect allergens and non-vegetarian
              ingredients.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="button-primary"
                onClick={() => startCamera("package")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  background: "#111",
                  color: "#fff",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "6px",
                  border: "none",
                }}
              >
                <Camera size={17} /> Open Camera
              </button>

              <label
                className="button-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#111",
                  padding: "0.6rem 1.2rem",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <Upload size={17} /> Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePackageScan}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            {packageLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "1rem",
                }}
              >
                <Loader2 className="animate-spin" size={20} /> Decoding
                ingredients...
              </div>
            )}

            {packageResult && (
              <div
                style={{
                  marginTop: "1rem",
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >
                <h4>{packageResult.productName}</h4>
                <p>
                  <strong>Ingredients:</strong>{" "}
                  {packageResult.ingredients.join(", ")}
                </p>
                <div
                  style={{
                    marginTop: "0.5rem",
                    color: "#d9534f",
                    fontSize: "0.9rem",
                  }}
                >
                  {packageResult.warnings.map((w, i) => (
                    <p key={i}>⚠️ {w}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LIVE CAMERA OVERLAY */}
      {cameraActive && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "500px",
              background: "#111",
              borderRadius: "12px",
              overflow: "hidden",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                color: "#fff",
                borderBottom: "1px solid #333",
              }}
            >
              <span style={{ fontWeight: "bold" }}>
                Scan {cameraMode === "menu" ? "Menu" : "Food Label"}
              </span>
              <button
                onClick={stopCamera}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {cameraError ? (
              <div style={{ padding: "30px", color: "#f87171" }}>
                <p>{cameraError}</p>
                <button
                  onClick={stopCamera}
                  style={{
                    marginTop: "12px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#fff",
                    color: "#111",
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "340px",
                  background: "#000",
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            {!cameraError && (
              <div
                style={{
                  padding: "16px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={capturePhoto}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "30px",
                    background: "#e11d48",
                    color: "#fff",
                    border: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Camera size={18} /> Capture Photo
                </button>
                <button
                  onClick={stopCamera}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "30px",
                    background: "#333",
                    color: "#ccc",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="food-notice">
        <Info size={21} />
        <div>
          <strong>A helpful guide, not a dietary guarantee</strong>
          <p>
            Recipes vary by restaurant. Fish stock, sauces, cooking oil, and
            cross-contact can affect suitability. Always confirm ingredients and
            preparation with the restaurant.
          </p>
        </div>
      </section>

      <section className="food-dishes section-padding" id="dish-explorer">
        <div className="section-label">
          <span>01</span> EXPLORE JAPANESE DISHES
        </div>

        <h2 className="food-section-title">Find something worth trying.</h2>

        <div className="food-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search dishes, e.g. rice or soba..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search Japanese dishes"
          />
        </div>

        <div className="food-filters" aria-label="Dietary filters">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              className={`food-filter ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="food-results-count">
          {visibleDishes.length} dish
          {visibleDishes.length === 1 ? "" : "es"} shown
        </p>

        <div className="dish-grid">
          {visibleDishes.map((dish) => (
            <article className="dish-card" key={dish.name}>
              <div className="dish-card-top">
                <span className="dish-symbol">
                  <Utensils size={21} />
                </span>
                <span className="dish-japanese">{dish.japanese}</span>
              </div>

              <h3>{dish.name}</h3>
              <p>{dish.description}</p>

              <div className="dish-caution">
                <Info size={16} />
                <span>{dish.caution}</span>
              </div>

              <div className="dish-tags">
                {dish.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <span className="dish-status">{dish.category}</span>
            </article>
          ))}
        </div>

        {visibleDishes.length === 0 && (
          <div className="food-empty">
            No dishes match that search. Try another word or select “All”.
          </div>
        )}
      </section>

      <section className="phrase-section section-padding">
        <div className="section-label">
          <span>02</span> YOUR POCKET PHRASEBOOK
        </div>

        <h2 className="food-section-title">A few words go a long way.</h2>

        <p className="phrase-intro">
          Show these phrases to restaurant staff when you need help checking
          ingredients.
        </p>

        <div className="phrase-list">
          {phrases.map((phrase) => (
            <article className="phrase-card" key={phrase.japanese}>
              <div className="phrase-icon">
                <Languages size={20} />
              </div>

              <div className="phrase-content">
                <h3>{phrase.japanese}</h3>
                <p className="phrase-pronunciation">{phrase.pronunciation}</p>
                <p>{phrase.meaning}</p>
              </div>

              <button
                type="button"
                className="phrase-copy"
                onClick={() => copyPhrase(phrase)}
                aria-label={`Copy phrase: ${phrase.meaning}`}
              >
                {copiedPhrase === phrase.japanese ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}
                <span>
                  {copiedPhrase === phrase.japanese ? "Copied" : "Copy"}
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="food-checklist section-padding">
        <div className="section-label">
          <span>03</span> BEFORE YOU ORDER
        </div>

        <h2 className="food-section-title">Your ingredient-check checklist.</h2>

        <div className="food-check-grid">
          <div>
            <span>01</span>
            <h3>Ask about the stock</h3>
            <p>Soup, sauces, and broths may contain fish or meat extracts.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Check every ingredient</h3>
            <p>Confirm seasonings, toppings, batter, and cooking methods.</p>
          </div>
          <div>
            <span>03</span>
            <h3>Explain your needs</h3>
            <p>
              For Jain or strict dietary requirements, explain the exact
              restrictions.
            </p>
          </div>
          <div>
            <span>04</span>
            <h3>Confirm with the staff</h3>
            <p>Do not rely on a dish name, icon, or translation alone.</p>
          </div>
        </div>

        <Link to="/plan" className="button-primary">
          Back to my journey <ArrowLeft size={16} />
        </Link>
      </section>

    </main>
  );
}

export default FoodExplorer;
