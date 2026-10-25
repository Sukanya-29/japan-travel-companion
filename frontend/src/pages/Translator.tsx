import { useEffect, useRef, useState, type JSX, type KeyboardEvent } from "react";
import {
  Check,
  Copy,
  Languages,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  VolumeX,
  Loader2,
  ArrowLeftRight,
} from "lucide-react";
import { Nav } from "@/components/japan/Nav";
import "./Translator.css";

// TypeScript Interfaces
interface Phrase {
  hindi?: string;
  english: string;
  japanese: string;
  romaji: string;
}

interface PhraseCategory {
  category: string;
  phrases: Phrase[];
}

interface TranslationResult {
  translatedText?: string;
  japanese: string;
  english: string;
  romaji: string;
  targetLang: string;
  query: string;
  notFound?: boolean;
}

// Extend Window interface for Web Speech API types cross-browser
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const PHRASE_CATEGORIES: PhraseCategory[] = [
  {
    category: "Dietary needs",
    phrases: [
      {
        hindi: "मैं शाकाहारी हूँ।",
        english: "I am vegetarian.",
        japanese: "私はベジタリアンです。",
        romaji: "Watashi wa bejitarian desu.",
      },
      {
        hindi: "मैं जैन हूँ — कोई माँस, मछली, अंडे या जड़ वाली सब्जी नहीं।",
        english: "I am Jain — no meat, fish, eggs, or root vegetables.",
        japanese: "私はジャイナ教徒で、肉・魚・卵・根菜類はいっさい食べられません。",
        romaji:
          "Watashi wa Jaina-kyōto de, niku, sakana, tamago, konkai-rui wa issai tabe raremasen.",
      },
      {
        hindi: "क्या इसमें माँस या मछली है?",
        english: "Does this contain meat or fish?",
        japanese: "肉や魚は入っていますか？",
        romaji: "Niku ya sakana wa haitte imasu ka?",
      },
      {
        hindi: "क्या इसमें मछली का शोरबा (दशी) है?",
        english: "Does this contain fish stock (dashi)?",
        japanese: "魚のだしは入っていますか？",
        romaji: "Sakana no dashi wa haitte imasu ka?",
      },
      {
        hindi: "क्या शाकाहारी विकल्प उपलब्ध है?",
        english: "Is there a vegetarian option available?",
        japanese: "ベジタリアン向けのメニューはありますか？",
        romaji: "Bejitarian muke no menyu wa arimasu ka?",
      },
      {
        hindi: "क्या इसमें सूअर का माँस है?",
        english: "Does this contain pork?",
        japanese: "豚肉は入っていますか？",
        romaji: "Butaniku wa haitte imasu ka?",
      },
      {
        hindi: "क्या इसमें गोमाँस है?",
        english: "Does this contain beef?",
        japanese: "牛肉は入っていますか？",
        romaji: "Gyūniku wa haitte imasu ka?",
      },
    ],
  },
  {
    category: "Asking for help",
    phrases: [
      {
        hindi: "कृपया अंग्रेजी मेनू दें।",
        english: "Please give me an English menu.",
        japanese: "英語のメニューをいただけますか？",
        romaji: "Eigo no menyu o itadakemasu ka?",
      },
      {
        hindi: "मुझे माफ करें, क्या आप अंग्रेजी बोलते हैं?",
        english: "Excuse me, do you speak English?",
        japanese: "すみません、英語は話せますか？",
        romaji: "Sumimasen, eigo wa hanasemasu ka?",
      },
      {
        hindi: "यह कहाँ है?",
        english: "Where is this?",
        japanese: "これはどこですか？",
        romaji: "Kore wa doko desu ka?",
      },
      {
        hindi: "मुझे अस्पताल जाना है।",
        english: "I need to go to a hospital.",
        japanese: "病院に行く必要があります。",
        romaji: "Byōin ni iku hitsuyō ga arimasu.",
      },
    ],
  },
  {
    category: "Transport & directions",
    phrases: [
      {
        hindi: "क्या यह ट्रेन ____ जाती है?",
        english: "Does this train go to ____?",
        japanese: "この電車は____行きですか？",
        romaji: "Kono densha wa ____ yuki desu ka?",
      },
      {
        hindi: "____ स्टेशन कितना दूर है?",
        english: "How far is ____ station?",
        japanese: "____駅まで何分かかりますか？",
        romaji: "____ eki made nanpun kakarimasu ka?",
      },
      {
        hindi: "टिकट कहाँ मिलेगा?",
        english: "Where can I buy a ticket?",
        japanese: "切符はどこで買えますか？",
        romaji: "Kippu wa doko de kaemasu ka?",
      },
    ],
  },
  {
    category: "Greetings & courtesy",
    phrases: [
      {
        hindi: "धन्यवाद।",
        english: "Thank you.",
        japanese: "ありがとうございます。",
        romaji: "Arigatō gozaimasu.",
      },
      {
        hindi: "माफ कीजिए।",
        english: "I'm sorry / Excuse me.",
        japanese: "すみません。",
        romaji: "Sumimasen.",
      },
      {
        hindi: "मुझे समझ नहीं आया।",
        english: "I don't understand.",
        japanese: "わかりません。",
        romaji: "Wakarimasen.",
      },
      {
        hindi: "कृपया धीरे बोलें।",
        english: "Please speak slowly.",
        japanese: "もっとゆっくり話してください。",
        romaji: "Motto yukkuri hanashite kudasai.",
      },
    ],
  },
];

export default function Translator(): JSX.Element {
  const [inputText, setInputText] = useState<string>("");
  const [translated, setTranslated] = useState<TranslationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingPhrase, setSpeakingPhrase] = useState<string>("");
  const [direction, setDirection] = useState<"en-ja" | "ja-en">("en-ja");

  const recognitionRef = useRef<any>(null);

  const sourceLang = direction === "en-ja" ? "en" : "ja";
  const targetLang = direction === "en-ja" ? "ja" : "en";

  function handleSwapDirection(): void {
    const nextDirection = direction === "en-ja" ? "ja-en" : "en-ja";
    setDirection(nextDirection);
    if (translated?.translatedText) {
      setInputText(translated.translatedText);
      setTranslated(null);
    }
  }

  // Translation API Call (Direct calling in frontend with fallbacks)
  async function handleTranslate(textToTranslate: string = inputText): Promise<void> {
    const text = (textToTranslate || "").trim();
    if (!text) return;

    setIsLoading(true);
    setTranslated(null);

    let resultData: TranslationResult | null = null;

    <nav />
    // 1. Direct Frontend API: Google Translate single endpoint
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
      const response = await fetch(gtxUrl);
      if (response.ok) {
        const data = await response.json();
        let translatedText = "";
        let romaji = "";

        if (Array.isArray(data?.[0])) {
          data[0].forEach((item: any) => {
            if (item) {
              if (typeof item[0] === "string") {
                translatedText += item[0];
              }
              if (item[2] && typeof item[2] === "string" && !romaji) {
                romaji = item[2];
              }
            }
          });
        }

        if (translatedText.trim()) {
          resultData = {
            translatedText: translatedText.trim(),
            japanese: targetLang === "ja" ? translatedText.trim() : "",
            english: targetLang === "en" ? translatedText.trim() : "",
            romaji: targetLang === "ja" ? romaji.trim() : "",
            targetLang: targetLang,
            query: text,
          };
        }
      }
    } catch (err) {
      console.warn("Direct Google Translate fetch failed:", err);
    }

    // 2. Direct Frontend API Fallback: MyMemory API
    if (!resultData) {
      try {
        const memUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
        const response = await fetch(memUrl);
        if (response.ok) {
          const data = await response.json();
          let translatedText = data?.responseData?.translatedText;
          if ((!translatedText || !translatedText.trim()) && Array.isArray(data?.matches)) {
            const match = data.matches.find((m: any) => m.translation && m.translation.trim());
            if (match) translatedText = match.translation;
          }

          if (translatedText && translatedText.trim()) {
            resultData = {
              translatedText: translatedText.trim(),
              japanese: targetLang === "ja" ? translatedText.trim() : "",
              english: targetLang === "en" ? translatedText.trim() : "",
              romaji: "",
              targetLang: targetLang,
              query: text,
            };
          }
        }
      } catch (err) {
        console.warn("Direct MyMemory fetch failed:", err);
      }
    }

    // 3. Local Backend Fallback (Port 8000 / FastAPI translate router)
    if (!resultData) {
      try {
        const response = await fetch("http://localhost:8000/translate/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            source_language: sourceLang,
            target_language: targetLang,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const translatedText = data.translated_text || data.japanese;
          if (translatedText) {
            resultData = {
              translatedText: translatedText,
              japanese: targetLang === "ja" ? translatedText : "",
              english: targetLang === "en" ? translatedText : "",
              romaji: data.romaji || "",
              targetLang: targetLang,
              query: text,
            };
          }
        }
      } catch (err) {
        console.warn("Local backend translate fallback failed:", err);
      }
    }

    if (resultData) {
      setTranslated(resultData);
    } else {
      setTranslated({
        notFound: true,
        query: text,
        japanese: "",
        english: "",
        romaji: "",
        targetLang: targetLang,
      });
    }
    setIsLoading(false);
  }

  function handleReset(): void {
    setInputText("");
    setTranslated(null);
  }

  function startListening(): void {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        /* ignore */
      }
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = direction === "en-ja" ? "en-US" : "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      if (currentText) {
        setInputText(currentText);
      }

      if (finalTranscript && finalTranscript.trim()) {
        setIsListening(false);
        handleTranslate(finalTranscript.trim());
      }
    };

    recognition.onerror = (err: any) => {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopListening(): void {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        /* ignore */
      }
    }
    setIsListening(false);
    if (inputText.trim() && !translated && !isLoading) {
      handleTranslate(inputText.trim());
    }
  }

  function speakText(text: string, locale: string, key: string): void {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.85;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingPhrase(key);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingPhrase("");
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingPhrase("");
    };
    window.speechSynthesis.speak(utterance);
  }

  async function copyPhrase(text: string, key: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2500);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <div className="app-container">
      <Nav />
      <main className="planner-page">
        <section className="food-hero">
          {/* <div className="section-label">
            <span>TRANSLATOR · 02</span>
          </div> */}
          <h1>
            Speak Japan.
            <br />
            <span>Without the barrier.</span>
          </h1>
          <p>
            Instant two-way translation between English and Japanese with high-quality audio
            pronunciations.
          </p>
        </section>

        {/* Translator widget */}
        <section className="food-dishes section-padding" id="translator-widget">
          <div className="section-label">
            <span>01</span> TWO-WAY TRANSLATOR
          </div>
          <h2 className="food-section-title">Type or speak to translate.</h2>

          <div className="tr-widget">
            {/* Direction toggle / swap bar */}
            <div className="tr-direction-bar">
              <div className="tr-direction-indicator">
                <span className="tr-lang-tag">
                  {direction === "en-ja" ? "English" : "Japanese (日本語)"}
                </span>
                <span className="tr-arrow-sign">→</span>
                <span className="tr-lang-tag">
                  {direction === "en-ja" ? "Japanese (日本語)" : "English"}
                </span>
              </div>

              <button
                type="button"
                className="tr-swap-btn"
                onClick={handleSwapDirection}
                title="Click to swap between English ⇄ Japanese"
                aria-label="Swap translation direction"
              >
                <ArrowLeftRight size={16} />
                <span>Swap (⇄)</span>
              </button>
            </div>

            <div className="tr-input-row">
              <div className="food-search" style={{ flex: 1 }}>
                <Languages size={20} />
                <input
                  type="text"
                  placeholder={
                    isListening
                      ? "Listening to your voice..."
                      : direction === "en-ja"
                        ? "Type or speak in English..."
                        : "Type or speak in Japanese (日本語)..."
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                    e.key === "Enter" && handleTranslate()
                  }
                  aria-label="Text to translate"
                />
                {inputText && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="tr-clear-btn"
                    aria-label="Clear"
                  >
                    <RotateCcw size={17} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className={`tr-mic-btn ${isListening ? "listening" : ""}`}
                onClick={isListening ? stopListening : startListening}
                aria-label={isListening ? "Stop listening" : "Start speech recognition"}
                title={direction === "en-ja" ? "Speak in English" : "Speak in Japanese (日本語)"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                <span>{isListening ? "Listening…" : "Speak"}</span>
              </button>

              <button
                type="button"
                className="button-primary"
                onClick={() => handleTranslate()}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? <Loader2 size={19} className="animate-spin" /> : "Translate"}
              </button>
            </div>

            {/* Loader or Translation Results */}
            {isLoading ? (
              <div className="tr-result" style={{ textAlign: "center", padding: "24px" }}>
                <p style={{ fontSize: "16px", color: "var(--muted)" }}>Translating...</p>
              </div>
            ) : (
              translated && (
                <div className="tr-result" aria-live="polite">
                  {translated.notFound ? (
                    <div className="tr-not-found">
                      <p style={{ fontSize: "16px" }}>
                        Could not translate "<strong>{translated.query}</strong>".
                      </p>
                      <p className="planner-note" style={{ fontSize: "14px" }}>
                        Please check your connection or backend API response.
                      </p>
                    </div>
                  ) : (
                    <div className="tr-found">
                      {direction === "en-ja" ? (
                        <>
                          <div className="tr-lang-label">Japanese (Kanji / Kana)</div>
                          <div className="tr-japanese">{translated.translatedText}</div>

                          {translated.romaji && (
                            <>
                              <div className="tr-lang-label" style={{ marginTop: 14 }}>
                                Romaji (Pronunciation)
                              </div>
                              <div className="tr-romaji">{translated.romaji}</div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="tr-lang-label">English Translation</div>
                          <div
                            className="tr-japanese"
                            style={{ fontSize: "clamp(26px, 4vw, 42px)" }}
                          >
                            {translated.translatedText}
                          </div>
                        </>
                      )}

                      <div className="tr-actions">
                        <button
                          type="button"
                          className="tr-action-btn"
                          onClick={() =>
                            speakText(
                              translated.translatedText || "",
                              direction === "en-ja" ? "ja-JP" : "en-US",
                              "result",
                            )
                          }
                          aria-label="Speak Translation"
                        >
                          {isSpeaking && speakingPhrase === "result" ? (
                            <VolumeX size={18} />
                          ) : (
                            <Volume2 size={18} />
                          )}
                          <span>
                            {isSpeaking && speakingPhrase === "result"
                              ? "Speaking…"
                              : `Speak ${direction === "en-ja" ? "Japanese" : "English"}`}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="tr-action-btn"
                          onClick={() =>
                            copyPhrase(
                              direction === "en-ja" && translated.romaji
                                ? `${translated.translatedText}\n${translated.romaji}`
                                : translated.translatedText || "",
                              "result",
                            )
                          }
                          aria-label="Copy translation"
                        >
                          {copiedKey === "result" ? <Check size={18} /> : <Copy size={18} />}
                          <span>{copiedKey === "result" ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </section>

        {/* Phrase library */}
        <section className="phrase-section section-padding">
          <div className="section-label">
            <span>02</span> ESSENTIAL PHRASES
          </div>
          <h2 className="food-section-title">Phrases every traveler needs.</h2>
          <p className="phrase-intro">
            Tap the speaker icon to hear the Japanese pronunciation. Copy to show staff.
          </p>

          {/* Category tabs */}
          <div className="food-filters" style={{ marginBottom: 28 }}>
            {PHRASE_CATEGORIES.map((cat, i) => (
              <button
                key={cat.category}
                type="button"
                className={`food-filter ${activeCategory === i ? "active" : ""}`}
                onClick={() => setActiveCategory(i)}
                aria-pressed={activeCategory === i}
              >
                {cat.category}
              </button>
            ))}
          </div>

          <div className="phrase-list">
            {PHRASE_CATEGORIES[activeCategory].phrases.map((phrase) => (
              <article className="phrase-card" key={phrase.japanese}>
                <div className="phrase-icon">
                  <Languages size={22} />
                </div>
                <div className="phrase-content">
                  {phrase.hindi && (
                    <p
                      className="phrase-hindi"
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "var(--ink)",
                        marginBottom: 5,
                        lineHeight: 1.5,
                      }}
                    >
                      {phrase.hindi}
                    </p>
                  )}
                  <p
                    style={{
                      fontSize: 15,
                      marginBottom: 7,
                      color: "#4f5249",
                      lineHeight: 1.5,
                    }}
                  >
                    {phrase.english}
                  </p>
                  <h3>{phrase.japanese}</h3>
                  <p className="phrase-pronunciation">{phrase.romaji}</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button
                    type="button"
                    className="phrase-copy"
                    onClick={() => speakText(phrase.japanese, "ja-JP", phrase.japanese)}
                    aria-label={`Speak: ${phrase.english}`}
                    title="Listen to Japanese pronunciation"
                  >
                    {isSpeaking && speakingPhrase === phrase.japanese ? (
                      <VolumeX size={18} />
                    ) : (
                      <Volume2 size={18} />
                    )}
                    <span>{isSpeaking && speakingPhrase === phrase.japanese ? "…" : "Speak"}</span>
                  </button>
                  <button
                    type="button"
                    className="phrase-copy"
                    onClick={() =>
                      copyPhrase(
                        `${phrase.japanese}\n${phrase.romaji}\n${phrase.english}`,
                        phrase.japanese + "_copy",
                      )
                    }
                    aria-label={`Copy: ${phrase.english}`}
                  >
                    {copiedKey === phrase.japanese + "_copy" ? (
                      <Check size={18} />
                    ) : (
                      <Copy size={18} />
                    )}
                    <span>{copiedKey === phrase.japanese + "_copy" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
