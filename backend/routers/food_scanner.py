"""
Food Scanner Router for VoiceBridge AI
Connects to Supabase to support:
  1. Menu Scanning (Dishes) -> Veg / Non-Veg / Jain + Pronunciation + English Name + View Ingredients
  2. Packed Food Scanning (Ingredients) -> Scans packaged food ingredients list -> Item Name (Japanese), Pronunciation (Romaji), English Name, Dietary Type (Veg/Non-Veg/Jain)
"""

import os
import json
import time
import re
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel
import requests

router = APIRouter(
    tags=["Food Scanner"],
)

# Supabase configuration
SUPABASE_URL = "https://eybhidywrtabikqeawzd.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5YmhpZHl3cnRhYmlrcWVhd3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1NjU1NjcsImV4cCI6MjEwODE0MTU2N30.TvHOaOClt5X8YeGA2dgo-fPBx18Ojp2LdZ6xU9kcOzQ"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Root vegetables & alliums prohibited in Jain diet
ROOT_VEGETABLES_KEYWORDS = [
    "onion", "tamanegi", "garlic", "ninniku", "negi", "scallion", "green onion",
    "ginger", "shoga", "potato", "jagaimo", "carrot", "ninjin", "radish", "daikon",
    "lotus", "renkon", "bamboo", "takenoko", "menma", "mushroom", "kinoko", "shiitake"
]

# In-memory cache to guarantee fast response times
CACHE = {
    "dishes": [],
    "ingredients": [],
    "last_updated": 0,
    "ttl_seconds": 600  # 10 minutes cache
}


def fetch_all_from_supabase() -> tuple[list, list]:
    """Fetch dishes and ingredients from Supabase with caching and local fallback."""
    now = time.time()
    if CACHE["dishes"] and CACHE["ingredients"] and (now - CACHE["last_updated"] < CACHE["ttl_seconds"]):
        return CACHE["dishes"], CACHE["ingredients"]

    try:
        r_dishes = requests.get(
            f"{SUPABASE_URL}/rest/v1/dishes?select=*",
            headers=HEADERS,
            timeout=8
        )
        r_dishes.raise_for_status()
        dishes_data = r_dishes.json()

        r_ing = requests.get(
            f"{SUPABASE_URL}/rest/v1/ingredients?select=*&limit=500",
            headers=HEADERS,
            timeout=8
        )
        r_ing.raise_for_status()
        ingredients_data = r_ing.json()

        CACHE["dishes"] = dishes_data
        CACHE["ingredients"] = ingredients_data
        CACHE["last_updated"] = now
        return dishes_data, ingredients_data
    except Exception as e:
        if CACHE["dishes"] and CACHE["ingredients"]:
            return CACHE["dishes"], CACHE["ingredients"]

        # Check multiple fallback locations for dishes_backup.json and ingredients_backup.json
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(curr_dir)
        grandparent_dir = os.path.dirname(parent_dir)
        cwd = os.getcwd()

        f_dishes = None
        for p in [curr_dir, parent_dir, grandparent_dir, cwd]:
            cand = os.path.join(p, "dishes_backup.json")
            if os.path.exists(cand):
                f_dishes = cand
                break

        f_ing = None
        for p in [curr_dir, parent_dir, grandparent_dir, cwd]:
            cand = os.path.join(p, "ingredients_backup.json")
            if os.path.exists(cand):
                f_ing = cand
                break

        if f_dishes and f_ing and os.path.exists(f_dishes) and os.path.exists(f_ing):
            try:
                with open(f_dishes, "r", encoding="utf-8") as f:
                    dishes_data = json.load(f)
                with open(f_ing, "r", encoding="utf-8") as f:
                    ingredients_data = json.load(f)
                CACHE["dishes"] = dishes_data
                CACHE["ingredients"] = ingredients_data
                CACHE["last_updated"] = now
                return dishes_data, ingredients_data
            except Exception:
                pass

        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch data from Supabase and backup files not found: {str(e)}"
        )


def classify_dish(dish: dict) -> str:
    """Classify dish into Jain, Veg, or Non-Veg."""
    if dish.get("is_jain_safe"):
        return "Jain"
    elif dish.get("is_veg"):
        return "Veg"
    return "Non-Veg"


def classify_ingredient(ing: dict) -> str:
    """Classify ingredient into Jain, Veg, or Non-Veg."""
    if ing.get("contains_meat") or ing.get("contains_seafood") or ing.get("contains_egg"):
        return "Non-Veg"

    # Check for root vegetables / alliums / alcohol for Jain restriction
    eng = ing.get("english_name", "").lower()
    rom = ing.get("romaji", "").lower()
    cat = ing.get("category", "").lower()

    if ing.get("contains_alcohol") or "alcohol" in cat:
        return "Veg"

    for root_kw in ROOT_VEGETABLES_KEYWORDS:
        if root_kw in eng or root_kw in rom:
            return "Veg"  # Veg but not Jain-safe

    return "Jain"


def parse_dish_ingredients(dish: dict, all_ingredients: list) -> list:
    """Breakdown ingredients_text of a dish into structured records with pronunciation and type."""
    raw_text = dish.get("ingredients_text") or ""
    parts = [p.strip() for p in raw_text.split(",") if p.strip()]

    structured = []
    for part in parts:
        part_clean = re.sub(r"[^\w\s-]", "", part).lower().strip()
        matched = None

        # Search in ingredients table
        for ing in all_ingredients:
            ing_eng = ing.get("english_name", "").lower()
            ing_rom = ing.get("romaji", "").lower()
            if part_clean == ing_eng or part_clean in ing_eng or ing_eng in part_clean or part_clean == ing_rom:
                matched = ing
                break

        if matched:
            structured.append({
                "item_name_japanese": matched.get("japanese_kanji") or "",
                "pronunciation": matched.get("romaji") or "",
                "english_name": matched.get("english_name") or part,
                "dietary_type": classify_ingredient(matched),
                "category": matched.get("category") or "General",
                "contains_meat": matched.get("contains_meat", False),
                "contains_seafood": matched.get("contains_seafood", False),
                "contains_egg": matched.get("contains_egg", False),
                "contains_dairy": matched.get("contains_dairy", False),
                "contains_alcohol": matched.get("contains_alcohol", False),
            })
        else:
            # Fallback when exact ingredient row isn't mapped
            is_nonveg = any(kw in part_clean for kw in ["pork", "chicken", "beef", "meat", "fish", "dashi", "seafood", "egg", "shrimp"])
            is_root = any(kw in part_clean for kw in ROOT_VEGETABLES_KEYWORDS)
            d_type = "Non-Veg" if is_nonveg else ("Veg" if is_root else "Jain")
            structured.append({
                "item_name_japanese": "",
                "pronunciation": "",
                "english_name": part,
                "dietary_type": d_type,
                "category": "Ingredient",
                "contains_meat": is_nonveg,
                "contains_seafood": "fish" in part_clean or "dashi" in part_clean or "seafood" in part_clean,
                "contains_egg": "egg" in part_clean,
                "contains_dairy": "milk" in part_clean or "cheese" in part_clean,
                "contains_alcohol": "mirin" in part_clean or "sake" in part_clean or "alcohol" in part_clean,
            })

    return structured


# ------------------ Request / Response Models ------------------

class MenuScanRequest(BaseModel):
    scanned_text: str
    dietary_filter: Optional[str] = "all"  # 'all', 'veg', 'non-veg', 'jain'


class PackedFoodScanRequest(BaseModel):
    scanned_text: str  # text read from packaged food ingredients label


# ------------------ API Endpoints ------------------

@router.get("/health")
def food_scanner_health():
    """Verify Supabase connection and row counts."""
    dishes, ingredients = fetch_all_from_supabase()
    return {
        "status": "healthy",
        "dishes_count": len(dishes),
        "ingredients_count": len(ingredients),
        "cached": bool(CACHE["dishes"])
    }


@router.get("/dishes")
def get_all_dishes(
    q: Optional[str] = Query(None, description="Search by dish name (Japanese, Romaji, or English)"),
    dietary: Optional[str] = Query("all", description="Filter by: all, veg, non-veg, jain")
):
    """List or search dishes from database."""
    dishes, all_ingredients = fetch_all_from_supabase()

    results = []
    dietary_filter = (dietary or "all").lower()

    for d in dishes:
        d_type = classify_dish(d)
        if dietary_filter != "all" and d_type.lower() != dietary_filter:
            continue

        if q:
            query = q.lower().strip()
            name_jp = (d.get("dish_name_japanese") or "").lower()
            name_ro = (d.get("dish_name_romaji") or "").lower()
            name_en = (d.get("dish_name_english") or "").lower()
            if query not in name_jp and query not in name_ro and query not in name_en:
                continue

        results.append({
            "id": d.get("id"),
            "dish_name_japanese": d.get("dish_name_japanese"),
            "pronunciation": d.get("dish_name_romaji"),
            "english_name": d.get("dish_name_english"),
            "dietary_type": d_type,
            "flags": {
                "contains_meat": d.get("contains_meat", False),
                "contains_seafood": d.get("contains_seafood", False),
                "contains_egg": d.get("contains_egg", False),
                "contains_alcohol": d.get("contains_alcohol", False),
            },
            "ingredients_summary": d.get("ingredients_text"),
            "ingredients": parse_dish_ingredients(d, all_ingredients)
        })

    return {
        "total": len(results),
        "dishes": results
    }


@router.get("/dishes/{dish_id}")
def get_dish_details(dish_id: int):
    """Get single dish details with full ingredients for 'View Ingredients' screen."""
    dishes, all_ingredients = fetch_all_from_supabase()
    dish = next((d for d in dishes if d.get("id") == dish_id), None)
    if not dish:
        raise HTTPException(status_code=404, detail=f"Dish with ID {dish_id} not found")

    return {
        "id": dish.get("id"),
        "dish_name_japanese": dish.get("dish_name_japanese"),
        "pronunciation": dish.get("dish_name_romaji"),
        "english_name": dish.get("dish_name_english"),
        "dietary_type": classify_dish(dish),
        "flags": {
            "contains_meat": dish.get("contains_meat", False),
            "contains_seafood": dish.get("contains_seafood", False),
            "contains_egg": dish.get("contains_egg", False),
            "contains_alcohol": dish.get("contains_alcohol", False),
        },
        "ingredients": parse_dish_ingredients(dish, all_ingredients)
    }


def extract_text_from_image_bytes(image_bytes: bytes, filename: str = "image.png") -> str:
    """Extract text from image bytes using OCR Space API with Japanese (Engine 2 & 1) and English support."""
    ext = os.path.splitext(filename)[1].lower() if filename else ".jpg"
    mime_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".gif": "image/gif"
    }
    mime_type = mime_map.get(ext, "image/jpeg")

    # Try Japanese OCR: Engine 2 (specialized for Asian text & Kanji) then Engine 1
    for engine in ["2", "1"]:
        try:
            response = requests.post(
                "https://api.ocr.space/parse/image",
                files={"file": (filename or "image.jpg", image_bytes, mime_type)},
                data={
                    "apikey": "helloworld",
                    "language": "jpn",
                    "OCREngine": engine,
                    "isOverlayRequired": False,
                    "detectOrientation": True,
                    "scale": True,
                },
                timeout=25
            )
            if response.status_code == 200:
                res_json = response.json()
                parsed_results = res_json.get("ParsedResults") or []
                if parsed_results:
                    text = (parsed_results[0].get("ParsedText") or "").strip()
                    if text:
                        return text
        except Exception:
            pass

    # Fallback to English OCR
    try:
        response = requests.post(
            "https://api.ocr.space/parse/image",
            files={"file": (filename or "image.jpg", image_bytes, mime_type)},
            data={
                "apikey": "helloworld",
                "language": "eng",
                "OCREngine": "2",
                "isOverlayRequired": False,
                "detectOrientation": True,
                "scale": True,
            },
            timeout=20
        )
        if response.status_code == 200:
            res_json = response.json()
            parsed_results = res_json.get("ParsedResults") or []
            if parsed_results:
                text = (parsed_results[0].get("ParsedText") or "").strip()
                if text:
                    return text
    except Exception:
        pass

    return ""


# Famous Japanese chain restaurants and their signature specialty dishes
BRAND_DISH_MAP = {
    "ichiran": 4,           # Tonkotsu Ramen
    "ippudo": 4,            # Tonkotsu Ramen
    "sukiya": 6,            # Gyudon (Beef Rice Bowl)
    "yoshinoya": 6,         # Gyudon (Beef Rice Bowl)
    "matsuya": 6,           # Gyudon (Beef Rice Bowl)
    "coco ichibanya": 54,   # Katsu Curry (Curry Rice with Cutlet)
    "coco ichi": 54,
    "curry house": 54,
    "saizeriya": 55,        # Milanese Doria (Italian Rice Gratin)
    "tenya": 56,            # Tendon (Tempura Rice Bowl)
    "sushiro": 9,           # Nigiri Sushi
    "kura sushi": 9,        # Nigiri Sushi
    "hamazushi": 9,         # Nigiri Sushi
    "genki sushi": 9        # Nigiri Sushi
}


def process_menu_text(text: str, dietary_filter: str = "all") -> dict:
    dishes, all_ingredients = fetch_all_from_supabase()
    text_lower = text.lower()
    filter_type = (dietary_filter or "all").lower()

    matched_items = []  # tuple: (first_pos, dish_dict)

    # 1. Match famous restaurant brands & chains
    for brand, dish_id in BRAND_DISH_MAP.items():
        idx = text_lower.find(brand)
        if idx != -1:
            dish = next((d for d in dishes if d["id"] == dish_id), None)
            if dish and not any(d["id"] == dish_id for _, d in matched_items):
                matched_items.append((idx, dish))

    # 2. Match dishes by exact Kanji, Romaji, English name, or key terms
    for d in dishes:
        if any(d["id"] == item[1]["id"] for item in matched_items):
            continue

        name_jp = (d.get("dish_name_japanese") or "").strip()
        name_ro = (d.get("dish_name_romaji") or "").strip().lower()
        name_en = (d.get("dish_name_english") or "").strip().lower()

        pos = -1
        if name_jp and name_jp in text:
            pos = text.find(name_jp)
        elif name_ro and len(name_ro) >= 4 and re.search(r"\b" + re.escape(name_ro) + r"\b", text_lower):
            pos = text_lower.find(name_ro)
        elif name_en and len(name_en) >= 4 and re.search(r"\b" + re.escape(name_en) + r"\b", text_lower):
            pos = text_lower.find(name_en)
        else:
            # Match specific distinctive dish words
            core_words = [w for w in re.split(r"[\s,\-\(\)/]+", name_ro) if len(w) >= 5 and w not in ["house", "style", "plate", "bowl", "with", "rice", "soup"]]
            for cw in core_words:
                if re.search(r"\b" + re.escape(cw) + r"\b", text_lower):
                    pos = text_lower.find(cw)
                    break

        if pos != -1:
            matched_items.append((pos, d))

    # Sort strictly in order of appearance in the menu (line by line)
    matched_items.sort(key=lambda x: x[0])

    matched_dishes = []
    serial = 1

    for _, d in matched_items:
        d_type = classify_dish(d)
        if filter_type != "all" and d_type.lower() != filter_type:
            continue

        matched_dishes.append({
            "serial_no": serial,
            "id": d.get("id"),
            "dish_name_japanese": d.get("dish_name_japanese"),
            "pronunciation": d.get("dish_name_romaji"),
            "english_name": d.get("dish_name_english"),
            "dietary_type": d_type,
            "flags": {
                "contains_meat": d.get("contains_meat", False),
                "contains_seafood": d.get("contains_seafood", False),
                "contains_egg": d.get("contains_egg", False),
                "contains_alcohol": d.get("contains_alcohol", False),
            },
            "ingredients": parse_dish_ingredients(d, all_ingredients)
        })
        serial += 1

    return {
        "query": text,
        "matched_count": len(matched_dishes),
        "dishes": matched_dishes
    }


@router.post("/scan-menu")
def scan_menu(req: MenuScanRequest):
    text = (req.scanned_text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Please provide scanned menu text.")
    return process_menu_text(text, req.dietary_filter or "all")


def process_ingredients_text(text: str) -> dict:
    _, all_ingredients = fetch_all_from_supabase()
    text_lower = text.lower()

    # Extract candidate ingredient tokens from text
    cleaned = text.strip()
    if "原材料名" in cleaned:
        cleaned = cleaned.split("原材料名", 1)[1]
        cleaned = re.sub(r"^[:：\s]*", "", cleaned)
    elif "原材料" in cleaned:
        cleaned = cleaned.split("原材料", 1)[1]
        cleaned = re.sub(r"^[:：\s]*", "", cleaned)
    elif "【原材料名】" in cleaned:
        cleaned = cleaned.split("【原材料名】", 1)[1]
        cleaned = re.sub(r"^[:：\s]*", "", cleaned)

    # Normalize delimiters and newlines
    cleaned = re.sub(r"[、,／/]\s*[\n\r]", "、", cleaned)
    cleaned = re.sub(r"[\n\r]\s*[、,／/]", "、", cleaned)

    tokens = []
    current = []
    depth = 0
    for ch in cleaned:
        if ch in "（(":
            depth += 1
            current.append(ch)
        elif ch in "）)":
            depth = max(0, depth - 1)
            current.append(ch)
        elif depth == 0 and (ch in "、,／/;\t" or ch == "\n"):
            tok = "".join(current).strip()
            tok = re.sub(r"^[\s、,／/・;:\.\-]+|[\s、,／/・;:\.\-]+$", "", tok)
            if tok and len(tok) >= 1:
                tokens.append(tok)
            current = []
        else:
            current.append(ch)
    if current:
        tok = "".join(current).strip()
        tok = re.sub(r"^[\s、,／/・;:\.\-]+|[\s、,／/・;:\.\-]+$", "", tok)
        if tok and len(tok) >= 1:
            tokens.append(tok)

    detected = []
    warnings = []
    has_meat = False
    has_seafood = False
    has_egg = False
    has_alcohol = False
    has_root_or_non_jain = False

    serial = 1
    seen_names = set()

    for tok in tokens:
        tok_clean = tok.strip()
        if not tok_clean or tok_clean.lower() in seen_names:
            continue
        seen_names.add(tok_clean.lower())

        tok_lower = tok_clean.lower()
        matched_ing = None

        # Search best match in all_ingredients
        for ing in all_ingredients:
            kanji = (ing.get("japanese_kanji") or "").strip()
            rom = (ing.get("romaji") or "").strip().lower()
            eng = (ing.get("english_name") or "").strip().lower()

            if kanji and (kanji == tok_clean or kanji in tok_clean):
                matched_ing = ing
                break
            elif rom and len(rom) >= 3 and (rom == tok_lower or rom in tok_lower):
                matched_ing = ing
                break
            elif eng and len(eng) >= 3 and (eng == tok_lower or eng in tok_lower):
                matched_ing = ing
                break

        if matched_ing:
            ing_type = classify_ingredient(matched_ing)
            kanji = matched_ing.get("japanese_kanji") or tok_clean

            if matched_ing.get("contains_meat") or "pork" in matched_ing.get("english_name", "").lower() or "beef" in matched_ing.get("english_name", "").lower() or "chicken" in matched_ing.get("english_name", "").lower():
                has_meat = True
                warnings.append(f"Contains Meat: {matched_ing.get('english_name')} ({kanji})")
            if matched_ing.get("contains_seafood") or "fish" in matched_ing.get("english_name", "").lower() or "shrimp" in matched_ing.get("english_name", "").lower():
                has_seafood = True
                warnings.append(f"Contains Seafood / Fish: {matched_ing.get('english_name')} ({kanji})")
            if matched_ing.get("contains_egg"):
                has_egg = True
                warnings.append(f"Contains Egg: {matched_ing.get('english_name')} ({kanji})")
            if matched_ing.get("contains_alcohol"):
                has_alcohol = True
                warnings.append(f"Contains Alcohol: {matched_ing.get('english_name')} ({kanji})")
            if ing_type == "Veg":
                has_root_or_non_jain = True

            detected.append({
                "serial_no": serial,
                "id": matched_ing.get("id"),
                "item_name_japanese": kanji,
                "pronunciation": matched_ing.get("romaji") or "—",
                "english_name": matched_ing.get("english_name") or "—",
                "dietary_type": ing_type,
                "category": matched_ing.get("category") or "—",
                "is_unknown": False,
                "flags": {
                    "contains_meat": matched_ing.get("contains_meat", False),
                    "contains_seafood": matched_ing.get("contains_seafood", False),
                    "contains_egg": matched_ing.get("contains_egg", False),
                    "contains_dairy": matched_ing.get("contains_dairy", False),
                    "contains_alcohol": matched_ing.get("contains_alcohol", False),
                }
            })
        else:
            # Ingredient not in database: show its name and dash-dash '—' everywhere else
            is_nonveg = any(kw in tok_lower for kw in ["pork", "beef", "chicken", "meat", "fish", "shrimp", "seafood", "gelatin", "lard", "豚", "鶏", "牛", "肉", "魚", "海老", "蟹"])
            if is_nonveg:
                has_meat = True
                warnings.append(f"Potential Non-Veg indicator: {tok_clean}")

            detected.append({
                "serial_no": serial,
                "id": f"unknown_{serial}",
                "item_name_japanese": tok_clean,
                "pronunciation": "—",
                "english_name": "—",
                "dietary_type": "—",
                "category": "—",
                "is_unknown": True,
                "flags": {
                    "contains_meat": is_nonveg,
                    "contains_seafood": False,
                    "contains_egg": False,
                    "contains_dairy": False,
                    "contains_alcohol": False,
                }
            })
        serial += 1

    # Fallback to direct substring search if tokenizer found nothing
    if not detected:
        for ing in all_ingredients:
            kanji = (ing.get("japanese_kanji") or "").strip()
            rom = (ing.get("romaji") or "").strip().lower()
            eng = (ing.get("english_name") or "").strip().lower()

            if (kanji and kanji in text) or (rom and len(rom) >= 3 and rom in text_lower) or (eng and len(eng) >= 3 and eng in text_lower):
                ing_type = classify_ingredient(ing)
                detected.append({
                    "serial_no": serial,
                    "id": ing.get("id"),
                    "item_name_japanese": kanji or eng,
                    "pronunciation": ing.get("romaji") or "—",
                    "english_name": ing.get("english_name") or "—",
                    "dietary_type": ing_type,
                    "category": ing.get("category") or "—",
                    "is_unknown": False,
                    "flags": ing.get("flags", {})
                })
                serial += 1

    # Direct safety keywords check
    for meat_kw in ["pork", "beef", "chicken", "meat", "bacon", "ham", "lard", "gelatin", "dashi", "fish", "shrimp", "seafood"]:
        if re.search(r"\b" + meat_kw + r"\b", text_lower):
            has_meat = True
            warnings.append(f"Contains Non-Veg indicator: '{meat_kw.capitalize()}' detected in text")

    if has_meat or has_seafood or has_egg:
        overall_type = "Non-Veg"
    elif has_root_or_non_jain or has_alcohol:
        overall_type = "Veg"
    elif detected:
        overall_type = "Jain"
    else:
        overall_type = "Unknown"

    return {
        "scanned_text": text,
        "overall_dietary_type": overall_type,
        "is_safe_for_veg": overall_type in ["Veg", "Jain"],
        "is_safe_for_jain": overall_type == "Jain",
        "critical_warnings": list(set(warnings)),
        "detected_count": len(detected),
        "ingredients": detected
    }


@router.post("/scan-ingredients")
def scan_ingredients(req: PackedFoodScanRequest):
    text = (req.scanned_text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Please provide scanned ingredient text.")
    return process_ingredients_text(text)


@router.post("/scan-image")
async def scan_image(
    file: UploadFile = File(...),
    scan_type: str = Form("auto"),
    dietary_filter: Optional[str] = Form("all")
):
    """
    Upload an image (photo of restaurant menu or packaged food ingredients label).
    Extracts text using OCR and analyzes dietary suitability (Veg, Jain, Non-Veg).
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    extracted_text = extract_text_from_image_bytes(image_bytes, file.filename or "uploaded.png")

    if not extracted_text:
        return {
            "success": False,
            "filename": file.filename,
            "extracted_text": "",
            "message": "Could not recognize clear text from the image. Please ensure the photo is sharp and well lit, or type the text manually.",
            "menu_result": {"matched_count": 0, "dishes": []},
            "ingredients_result": {"overall_dietary_type": "Unknown", "detected_count": 0, "ingredients": [], "critical_warnings": []}
        }

    menu_res = process_menu_text(extracted_text, dietary_filter or "all")
    ing_res = process_ingredients_text(extracted_text)

    effective_mode = scan_type
    if scan_type == "auto":
        if menu_res["matched_count"] > 0 and ing_res["detected_count"] == 0:
            effective_mode = "menu"
        elif ing_res["detected_count"] > 0 and menu_res["matched_count"] == 0:
            effective_mode = "ingredients"
        else:
            effective_mode = "menu" if menu_res["matched_count"] >= ing_res["detected_count"] else "ingredients"

    return {
        "success": True,
        "filename": file.filename,
        "scan_type": scan_type,
        "effective_mode": effective_mode,
        "extracted_text": extracted_text,
        "menu_result": menu_res,
        "ingredients_result": ing_res
    }
