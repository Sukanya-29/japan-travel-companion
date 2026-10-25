import heroFuji from "@/assets/hero-fuji.jpg";
import tokyo from "@/assets/place-tokyo.jpg";
import kyoto from "@/assets/place-kyoto.jpg";
import osaka from "@/assets/place-osaka.jpg";
import hokkaido from "@/assets/place-hokkaido.jpg";
import okinawa from "@/assets/place-okinawa.jpg";
import hiroshima from "@/assets/place-hiroshima.jpg";
import nara from "@/assets/place-nara.jpg";
import spring from "@/assets/season-spring.jpg";
import summer from "@/assets/season-summer.jpg";
import autumn from "@/assets/season-autumn.jpg";
import winter from "@/assets/season-winter.jpg";

export type Interest =
  "culture" | "food" | "nature" | "nightlife" | "anime" | "onsen" | "beach" | "snow";

export const INTERESTS: { id: Interest; label: string; jp: string; emoji: string }[] = [
  { id: "culture", label: "Temples & Culture", jp: "文化", emoji: "⛩️" },
  { id: "food", label: "Food & Street Eats", jp: "食", emoji: "🍜" },
  { id: "nature", label: "Nature & Hiking", jp: "自然", emoji: "🗻" },
  { id: "nightlife", label: "Cities & Nightlife", jp: "夜", emoji: "🌃" },
  { id: "anime", label: "Anime & Pop Culture", jp: "アニメ", emoji: "🎮" },
  { id: "onsen", label: "Onsen & Relaxing", jp: "温泉", emoji: "♨️" },
  { id: "beach", label: "Beaches & Islands", jp: "海", emoji: "🏝️" },
  { id: "snow", label: "Snow & Skiing", jp: "雪", emoji: "⛷️" },
];

export type Destination = {
  slug: string;
  name: string;
  jp: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  tags: Interest[];
  bestMonths: number[]; // 1-12
  mustDo: string[];
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "tokyo",
    name: "Tokyo",
    jp: "東京",
    region: "Kanto",
    tagline: "Neon future meets quiet shrines",
    description:
      "The world's biggest city hums with neon crossings, tiny 8-seat bars, anime megastores and serene gardens hidden between skyscrapers.",
    image: tokyo,
    tags: ["nightlife", "food", "anime", "culture"],
    bestMonths: [3, 4, 5, 10, 11],
    mustDo: ["Shibuya Crossing at night", "Akihabara arcades", "Tsukiji outer market sushi"],
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    jp: "京都",
    region: "Kansai",
    tagline: "A thousand years of temples",
    description:
      "Former imperial capital with 1,600 temples, geisha districts, bamboo groves and the endless vermilion gates of Fushimi Inari.",
    image: kyoto,
    tags: ["culture", "food", "nature"],
    bestMonths: [3, 4, 11],
    mustDo: ["Fushimi Inari at sunrise", "Arashiyama bamboo grove", "Tea ceremony in Gion"],
  },
  {
    slug: "osaka",
    name: "Osaka",
    jp: "大阪",
    region: "Kansai",
    tagline: "Japan's kitchen — eat until you drop",
    description:
      "Loud, friendly and obsessed with food. Takoyaki, okonomiyaki and kushikatsu glow under the Dotonbori billboards.",
    image: osaka,
    tags: ["food", "nightlife", "anime"],
    bestMonths: [3, 4, 5, 10, 11, 12],
    mustDo: ["Dotonbori street food crawl", "Osaka Castle", "Universal Studios Japan"],
  },
  {
    slug: "hokkaido",
    name: "Hokkaido",
    jp: "北海道",
    region: "North",
    tagline: "Powder snow & lavender fields",
    description:
      "Japan's wild north: world-famous powder snow in winter, rolling lavender fields in summer, and the freshest seafood anywhere.",
    image: hokkaido,
    tags: ["nature", "snow", "food", "onsen"],
    bestMonths: [1, 2, 7, 8, 12],
    mustDo: ["Sapporo Snow Festival", "Furano lavender in July", "Niseko powder skiing"],
  },
  {
    slug: "okinawa",
    name: "Okinawa",
    jp: "沖縄",
    region: "Islands",
    tagline: "Japan's tropical paradise",
    description:
      "Subtropical islands with turquoise water, coral reefs, a unique Ryukyu culture and one of the longest-living populations on earth.",
    image: okinawa,
    tags: ["beach", "nature", "onsen"],
    bestMonths: [4, 5, 6, 10],
    mustDo: ["Snorkel the Kerama Islands", "Churaumi Aquarium", "Shuri Castle"],
  },
  {
    slug: "hiroshima",
    name: "Hiroshima & Miyajima",
    jp: "広島",
    region: "Chugoku",
    tagline: "The floating torii of peace",
    description:
      "A moving city of peace and resilience, a short ferry from Miyajima's iconic torii gate that floats on the sea at high tide.",
    image: hiroshima,
    tags: ["culture", "nature", "food"],
    bestMonths: [3, 4, 5, 10, 11],
    mustDo: ["Peace Memorial Park", "Itsukushima torii at sunset", "Hiroshima-style okonomiyaki"],
  },
  {
    slug: "nara",
    name: "Nara",
    jp: "奈良",
    region: "Kansai",
    tagline: "Where deer bow to you",
    description:
      "Japan's first capital, home to the giant bronze Buddha of Todai-ji and over a thousand friendly deer that bow for crackers.",
    image: nara,
    tags: ["culture", "nature"],
    bestMonths: [3, 4, 10, 11],
    mustDo: ["Feed the bowing deer", "Todai-ji Great Buddha", "Lantern-lined Kasuga Taisha"],
  },
  {
    slug: "hakone-fuji",
    name: "Hakone & Mt. Fuji",
    jp: "富士山",
    region: "Chubu",
    tagline: "Onsen with a view of Fuji",
    description:
      "Soak in a hot spring ryokan with Mt. Fuji on the horizon, cruise Lake Ashi and hike the five lakes.",
    image: heroFuji,
    tags: ["onsen", "nature", "culture"],
    bestMonths: [1, 2, 4, 10, 11, 12],
    mustDo: ["Overnight in a ryokan", "Chureito Pagoda view", "Lake Ashi pirate ship"],
  },
];

export type SeasonId = "spring" | "summer" | "autumn" | "winter";

export type Season = {
  id: SeasonId;
  name: string;
  jp: string;
  months: string;
  monthNums: number[];
  image: string;
  headline: string;
  description: string;
  highlights: string[];
  weather: string;
  crowd: "Very busy" | "Busy" | "Moderate" | "Quiet";
};

export const SEASONS: Season[] = [
  {
    id: "spring",
    name: "Spring",
    jp: "春",
    months: "March – May",
    monthNums: [3, 4, 5],
    image: spring,
    headline: "Cherry blossom season",
    description:
      "The whole country turns pink. Locals picnic under sakura trees (hanami), and the blossom front sweeps from Okinawa to Hokkaido.",
    highlights: [
      "Sakura peak: late Mar – early Apr",
      "Hanami picnics in parks",
      "Golden Week festivals",
    ],
    weather: "10–22°C · mild & fresh",
    crowd: "Very busy",
  },
  {
    id: "summer",
    name: "Summer",
    jp: "夏",
    months: "June – August",
    monthNums: [6, 7, 8],
    image: summer,
    headline: "Fireworks & festivals",
    description:
      "Warm nights glow with lanterns, yukata and hanabi fireworks. Climb Mt. Fuji, see Hokkaido's lavender, or hit Okinawa's beaches.",
    highlights: [
      "Gion Matsuri in Kyoto (July)",
      "Mt. Fuji climbing season",
      "Fireworks festivals everywhere",
    ],
    weather: "25–35°C · humid, rainy June",
    crowd: "Busy",
  },
  {
    id: "autumn",
    name: "Autumn",
    jp: "秋",
    months: "September – November",
    monthNums: [9, 10, 11],
    image: autumn,
    headline: "Crimson maple leaves",
    description:
      "Momiji season paints temples red and gold. Clear skies, comfortable days and harvest food make this many travelers' favourite.",
    highlights: ["Koyo peak in Kyoto: mid–late Nov", "Harvest food & sake", "Clear Mt. Fuji views"],
    weather: "12–25°C · crisp & clear",
    crowd: "Busy",
  },
  {
    id: "winter",
    name: "Winter",
    jp: "冬",
    months: "December – February",
    monthNums: [12, 1, 2],
    image: winter,
    headline: "Snow, onsen & illuminations",
    description:
      "Powder snow in Hokkaido, snow monkeys in steaming hot springs, glittering city illuminations and the quietest temples of the year.",
    highlights: [
      "Sapporo Snow Festival (Feb)",
      "Snow monkeys of Nagano",
      "Winter light-ups in Tokyo",
    ],
    weather: "-5–10°C · dry & sunny",
    crowd: "Quiet",
  },
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function seasonForMonth(month: number): Season {
  return SEASONS.find((s) => s.monthNums.includes(month)) ?? SEASONS[0]!;
}

export type TravelStyle = "budget" | "comfort" | "luxury";

export const STYLE_DAILY_USD: Record<TravelStyle, number> = {
  budget: 90,
  comfort: 200,
  luxury: 500,
};

export type PlanInput = {
  interests: Interest[];
  month: number;
  days: number;
  style: TravelStyle;
};

export type PlanStop = { destination: Destination; days: number; score: number };

export type Plan = {
  stops: PlanStop[];
  season: Season;
  dailyBudget: number;
  totalBudget: number;
};

/** Scores destinations by matching interests (+2 each) and being in season (+3). */
export function scoreDestination(d: Destination, interests: Interest[], month: number): number {
  const interestScore = d.tags.filter((t) => interests.includes(t)).length * 2;
  const seasonScore = d.bestMonths.includes(month) ? 3 : 0;
  return interestScore + seasonScore;
}

export function buildPlan({ interests, month, days, style }: PlanInput): Plan {
  const stopCount = days <= 5 ? 2 : days <= 10 ? 3 : 4;
  const ranked = DESTINATIONS.map((d) => ({
    destination: d,
    score: scoreDestination(d, interests, month),
  })).sort((a, b) => b.score - a.score);

  const picked = ranked.slice(0, stopCount);
  const totalScore = picked.reduce((sum, p) => sum + Math.max(p.score, 1), 0);

  // Split days proportionally to score, each stop gets at least 1 day.
  let remaining = days;
  const stops: PlanStop[] = picked.map((p, i) => {
    const isLast = i === picked.length - 1;
    const share = isLast
      ? remaining
      : Math.max(1, Math.round((Math.max(p.score, 1) / totalScore) * days));
    const allotted = Math.min(share, remaining - (picked.length - 1 - i));
    remaining -= allotted;
    return { ...p, days: allotted };
  });

  const dailyBudget = STYLE_DAILY_USD[style];
  return {
    stops,
    season: seasonForMonth(month),
    dailyBudget,
    totalBudget: dailyBudget * days,
  };
}

export const EXPERIENCES = [
  {
    jp: "寿司",
    title: "Sushi & Ramen",
    text: "From conveyor-belt sushi to Michelin-starred ramen for under $15.",
  },
  {
    jp: "温泉",
    title: "Onsen",
    text: "Over 3,000 hot spring towns — soak outdoors under snow or stars.",
  },
  {
    jp: "新幹線",
    title: "Shinkansen",
    text: "Bullet trains at 320 km/h, famous for being on time to the second.",
  },
  {
    jp: "旅館",
    title: "Ryokan stays",
    text: "Tatami rooms, kaiseki dinners and slippers in a traditional inn.",
  },
  {
    jp: "祭り",
    title: "Matsuri",
    text: "Hundreds of festivals a year with floats, drums, lanterns and fireworks.",
  },
  {
    jp: "侘寂",
    title: "Wabi-sabi",
    text: "Zen gardens, tea ceremonies and the art of finding beauty in quiet.",
  },
];

export const STATS = [
  { value: 36.9, decimals: 1, suffix: "M", label: "international visitors in 2024 — a record" },
  { value: 25, decimals: 0, suffix: "+", label: "UNESCO World Heritage Sites" },
  { value: 320, decimals: 0, suffix: " km/h", label: "Shinkansen top speed" },
  { value: 6800, decimals: 0, suffix: "+", label: "islands to explore" },
];

export const TESTIMONIALS = [
  {
    name: "Sofia, Spain",
    text: "I cried at Fushimi Inari at sunrise. Nothing prepared me for how peaceful it felt.",
  },
  {
    name: "Arjun, India",
    text: "Every meal — even from a convenience store — was better than restaurants back home.",
  },
  {
    name: "Emma, Australia",
    text: "I lost my wallet in Tokyo and got it back with every yen inside. Unreal.",
  },
  {
    name: "Marcus, USA",
    text: "Soaking in an outdoor onsen while snow fell was the best night of my life.",
  },
  {
    name: "Lea, Germany",
    text: "The trains run like clockwork. I planned 5 cities in 10 days without a single delay.",
  },
  {
    name: "Yuna, Korea",
    text: "The deer in Nara actually bowed back at me. I'm still smiling about it.",
  },
  {
    name: "Chloé, France",
    text: "Kyoto in autumn looks like a painting. I've already booked my return.",
  },
];

export const INDIA_TESTIMONIALS = [
  {
    name: "Priya & Aarav, Mumbai",
    text: "We were scared about pure veg food — then shojin ryori in Kyoto turned out to be the best meal of our honeymoon.",
  },
  {
    name: "Vikram, Bengaluru",
    text: "Took my parents (both 70+). Lifts everywhere, spotless toilets, luggage sent ahead — easiest family trip ever.",
  },
  {
    name: "Ananya, Delhi",
    text: "Solo female traveller, walking around Shinjuku at midnight — I have never felt so safe anywhere.",
  },
  {
    name: "Hetal, Ahmedabad",
    text: "As a Jain I carried a phrase card in Japanese. Every restaurant understood and cooked without onion or garlic.",
  },
  {
    name: "Rohan, Pune",
    text: "Found dosa and paneer in Nishi-Kasai, Tokyo's Little India, after a week of ramen. Felt like home!",
  },
  {
    name: "Kavya, Chennai",
    text: "Bowing felt just like a namaste. People were so polite, we started bowing back without thinking.",
  },
];

export const VEG_FOOD = [
  {
    jp: "精進料理",
    title: "Shojin Ryori",
    text: "Buddhist temple cuisine — fully plant-based and traditionally made without onion or garlic. Ideal for Jain diets. Try it at temples in Kyoto and Koyasan.",
  },
  {
    jp: "インド",
    title: "Little India, Tokyo",
    text: "Nishi-Kasai has Indian grocers, veg thalis and South Indian tiffin. Indian restaurants are also common in every big city.",
  },
  {
    jp: "豆腐",
    title: "Tofu & Yuba feasts",
    text: "Kyoto is famous for silky tofu and yuba (tofu skin) set menus — ask for no dashi (fish stock).",
  },
  {
    jp: "コンビニ",
    title: "Konbini veg snacks",
    text: "Umeboshi or kombu onigiri, sweet potatoes, edamame, fruit and mochi at 7-Eleven, Lawson and FamilyMart.",
  },
];

export const PHRASES = [
  { en: "I am vegetarian.", jp: "私はベジタリアンです。", romaji: "Watashi wa bejitarian desu." },
  {
    en: "No meat, fish or egg, please.",
    jp: "肉、魚、卵は食べられません。",
    romaji: "Niku, sakana, tamago wa taberaremasen.",
  },
  {
    en: "No fish stock (dashi), please.",
    jp: "だしも食べられません。",
    romaji: "Dashi mo taberaremasen.",
  },
  {
    en: "No onion, garlic or root vegetables (Jain).",
    jp: "玉ねぎ、にんにく、根菜は食べられません。",
    romaji: "Tamanegi, ninniku, konsai wa taberaremasen.",
  },
];

export const COMFORT_TIPS = [
  {
    emoji: "🛂",
    title: "Easy eVisa",
    text: "Indian passport holders can apply for a tourist eVisa online — no embassy visit for most travellers. Check the official site before you go.",
  },
  {
    emoji: "🙏",
    title: "Bow = Namaste",
    text: "A small bow says hello, thank you and sorry — just like folding your hands back home.",
  },
  {
    emoji: "👟",
    title: "Shoes off indoors",
    text: "Like at home and in temples, remove shoes in homes, ryokans and some restaurants.",
  },
  {
    emoji: "🤫",
    title: "Quiet on trains",
    text: "Keep phone calls off and voices low on trains — it's the one rule everyone follows.",
  },
  {
    emoji: "🧳",
    title: "Send your bags ahead",
    text: "Takkyubin delivers suitcases hotel-to-hotel overnight, so families travel light on the bullet train.",
  },
  {
    emoji: "💴",
    title: "No tipping",
    text: "Tipping isn't expected — great service is simply part of the culture (omotenashi).",
  },
];
