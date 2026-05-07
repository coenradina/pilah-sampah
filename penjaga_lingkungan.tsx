import { useState, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRAINING_ITEMS = [
  { id: 1,  name: "Kulit Pisang",    icon: "🍌", category: "organik", desc: "Sisa makanan dari buah" },
  { id: 2,  name: "Botol Plastik",   icon: "🧴", category: "plastik", desc: "Wadah minuman bekas" },
  { id: 3,  name: "Kaleng Soda",     icon: "🥤", category: "logam",   desc: "Kaleng aluminium bekas" },
  { id: 4,  name: "Daun Kering",     icon: "🍂", category: "organik", desc: "Daun yang sudah gugur" },
  { id: 5,  name: "Kantong Plastik", icon: "🛍️", category: "plastik", desc: "Tas belanja sekali pakai" },
  { id: 6,  name: "Tutup Botol Besi",icon: "🔩", category: "logam",   desc: "Penutup botol dari besi" },
  { id: 7,  name: "Sisa Nasi",       icon: "🍚", category: "organik", desc: "Makanan yang tersisa" },
  { id: 8,  name: "Sedotan Plastik", icon: "🥤", category: "plastik", desc: "Sedotan minuman bekas" },
  { id: 9,  name: "Paku Berkarat",   icon: "📌", category: "logam",   desc: "Paku besi yang sudah tua" },
  { id: 10, name: "Biji Buah",       icon: "🫒", category: "organik", desc: "Biji dari buah-buahan" },
  { id: 11, name: "Kemasan Mie",     icon: "📦", category: "plastik", desc: "Bungkus mie instan" },
  { id: 12, name: "Kaleng Cat",      icon: "🥫", category: "logam",   desc: "Kaleng cat yang kosong" },
];

const TEST_ITEMS = [
  { id: 13, name: "Kulit Jeruk",      icon: "🍊", category: "organik" },
  { id: 14, name: "Gelas Plastik",    icon: "🥛", category: "plastik" },
  { id: 15, name: "Sendok Garpu Besi",icon: "🍴", category: "logam"   },
  { id: 16, name: "Ampas Kopi",       icon: "☕", category: "organik" },
  { id: 17, name: "Botol Sampo",      icon: "🧴", category: "plastik" },
  { id: 18, name: "Kawat",            icon: "🪝", category: "logam"   },
];

const CATEGORIES = [
  { id: "organik", label: "Organik", icon: "🌿", color: "#15803d", bg: "#dcfce7", accent: "#4ade80", border: "#22c55e" },
  { id: "plastik", label: "Plastik", icon: "♻️", color: "#1d4ed8", bg: "#dbeafe", accent: "#60a5fa", border: "#3b82f6" },
  { id: "logam",   label: "Logam",   icon: "⚙️", color: "#b45309", bg: "#fef3c7", accent: "#fbbf24", border: "#f59e0b" },
];

const MIN_LABELS = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const getCat = (id: string) => CATEGORIES.find(c => c.id === id)!;
const calcAccuracy = (items: { correct: boolean }[]) =>
  items.length === 0 ? 0 : Math.round(items.filter(d => d.correct).length / items.length * 100);

// ─── Animations ───────────────────────────────────────────────────────────────

const GAME_CSS = `
  @keyframes bounceIn {
    0%   { transform: scale(0.4) translateY(-24px); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1) translateY(0); }
  }
  @keyframes popCorrect {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.18); background: #bbf7d0; }
    100% { transform: scale(1); }
  }
  @keyframes shakeWrong {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 8px rgba(74,222,128,0.4); }
    50%      { box-shadow: 0 0 20px rgba(74,222,128,0.8); }
  }
  @keyframes trainPulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.08); }
  }
  @keyframes cloudDrift {
    0%   { transform: translateX(-10px); }
    50%  { transform: translateX(10px); }
    100% { transform: translateX(-10px); }
  }
  @keyframes truckRoll {
    0%   { transform: translateX(-120px); }
    100% { transform: translateX(620px); }
  }
  @keyframes titlePop {
    0%   { opacity: 0; transform: scale(0.7) translateY(20px); }
    70%  { transform: scale(1.06) translateY(-4px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes subtitleSlide {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes btnBounce {
    0%   { opacity: 0; transform: scale(0.8) translateY(12px); }
    70%  { transform: scale(1.08); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes leafSway {
    0%,100% { transform: rotate(-8deg); }
    50%      { transform: rotate(8deg); }
  }
  @keyframes birdFly {
    0%   { transform: translateX(0) translateY(0); }
    25%  { transform: translateX(12px) translateY(-6px); }
    50%  { transform: translateX(24px) translateY(0); }
    75%  { transform: translateX(12px) translateY(4px); }
    100% { transform: translateX(0) translateY(0); }
  }
  .bounce-in  { animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .fade-up    { animation: fadeUp 0.35s ease both; }
  .floating   { animation: float 3s ease-in-out infinite; }
  .bin-btn    { transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease !important; cursor: pointer !important; }
  .bin-btn:hover { transform: scale(1.1) translateY(-4px) !important; box-shadow: 0 10px 28px rgba(0,0,0,0.18) !important; }
  .game-btn   { transition: all 0.15s ease; cursor: pointer; }
  .game-btn:hover  { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
  .game-btn:active { transform: translateY(0); }
  .welcome-title    { animation: titlePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
  .welcome-subtitle { animation: subtitleSlide 0.5s ease 0.7s both; }
  .welcome-btn      { animation: btnBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 1s both; }
  .welcome-btn:hover { transform: scale(1.06) translateY(-3px) !important; box-shadow: 0 10px 32px rgba(52,211,153,0.55) !important; }
  .welcome-btn:active { transform: scale(0.97) !important; }
  .cloud1 { animation: cloudDrift 7s ease-in-out infinite; }
  .cloud2 { animation: cloudDrift 9s ease-in-out 2s infinite; }
  .truck  { animation: truckRoll 6s linear infinite; }
  .leaf1  { animation: leafSway 3s ease-in-out infinite; transform-origin: bottom center; }
  .leaf2  { animation: leafSway 3.5s ease-in-out 0.5s infinite; transform-origin: bottom center; }
  .bird   { animation: birdFly 4s ease-in-out infinite; }
`;

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, #bfefff 0%, #e0f7d4 60%, #c8e6c9 100%)",
      padding: "0", margin: "0", overflow: "hidden", position: "relative",
    }}>

      {/* Sky decorations */}
      <svg className="cloud1" style={{ position: "absolute", top: 28, left: "8%", opacity: 0.9 }} width="90" height="36" viewBox="0 0 90 36">
        <ellipse cx="45" cy="26" rx="42" ry="14" fill="white" />
        <ellipse cx="28" cy="20" rx="20" ry="16" fill="white" />
        <ellipse cx="62" cy="18" rx="18" ry="14" fill="white" />
      </svg>
      <svg className="cloud2" style={{ position: "absolute", top: 16, right: "10%", opacity: 0.75 }} width="70" height="28" viewBox="0 0 70 28">
        <ellipse cx="35" cy="20" rx="32" ry="10" fill="white" />
        <ellipse cx="22" cy="15" rx="16" ry="12" fill="white" />
        <ellipse cx="50" cy="13" rx="14" ry="11" fill="white" />
      </svg>

      {/* Birds */}
      <svg className="bird" style={{ position: "absolute", top: 60, left: "30%" }} width="32" height="14" viewBox="0 0 32 14">
        <path d="M0 8 Q8 0 16 8 Q24 0 32 8" stroke="#555" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </svg>

      {/* Sun */}
      <svg style={{ position: "absolute", top: 20, right: "22%" }} width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="12" fill="#FFD700" />
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a}
            x1={24 + 14 * Math.cos(a * Math.PI/180)}
            y1={24 + 14 * Math.sin(a * Math.PI/180)}
            x2={24 + 20 * Math.cos(a * Math.PI/180)}
            y2={24 + 20 * Math.sin(a * Math.PI/180)}
            stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
        ))}
      </svg>

      {/* Scene illustration */}
      <div style={{ width: "100%", maxWidth: 520, padding: "0 16px", marginBottom: 0 }}>
        <svg viewBox="0 0 520 200" width="100%" style={{ display: "block", overflow: "visible" }}>

          {/* Ground */}
          <rect x="0" y="158" width="520" height="42" fill="#7CB87B" />
          {/* Road */}
          <rect x="0" y="164" width="520" height="28" fill="#90A4AE" />
          {/* Road dashes */}
          {[0,60,120,180,240,300,360,420,480].map(x => (
            <rect key={x} x={x+8} y="176" width="36" height="5" rx="2" fill="#CFD8DC" opacity="0.8" />
          ))}
          {/* Sidewalk */}
          <rect x="0" y="157" width="520" height="8" fill="#B0BEC5" />

          {/* House 1 (left, green roof) */}
          <rect x="18" y="90" width="72" height="68" rx="4" fill="#FFECB3" />
          <polygon points="10,92 54,50 98,92" fill="#66BB6A" />
          <rect x="36" y="120" width="22" height="38" rx="3" fill="#8D6E63" />
          <rect x="60" y="100" width="18" height="16" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          <rect x="24" y="100" width="18" height="16" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          {/* flower box */}
          <rect x="60" y="115" width="18" height="5" rx="2" fill="#8D6E63"/>
          <circle cx="64" cy="113" r="3" fill="#FF7043"/>
          <circle cx="70" cy="112" r="3" fill="#EC407A"/>
          <circle cx="76" cy="113" r="3" fill="#FFCA28"/>

          {/* House 2 (mid-left, pink) */}
          <rect x="118" y="80" width="80" height="78" rx="4" fill="#FCE4EC" />
          <polygon points="110,82 158,38 206,82" fill="#EF5350" />
          <rect x="148" y="118" width="24" height="40" rx="3" fill="#6D4C41" />
          <rect x="122" y="96" width="22" height="18" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          <rect x="154" y="96" width="22" height="18" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          <rect x="180" y="96" width="14" height="18" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          {/* chimney */}
          <rect x="183" y="50" width="10" height="22" rx="2" fill="#BCAAA4"/>
          <ellipse cx="188" cy="48" rx="8" ry="4" fill="#8D6E63"/>

          {/* Tree 1 between house 2 and 3 */}
          <rect x="214" y="120" width="8" height="38" rx="3" fill="#8D6E63" />
          <ellipse className="leaf1" cx="218" cy="112" rx="18" ry="20" fill="#43A047" />
          <ellipse cx="210" cy="118" rx="12" ry="14" fill="#388E3C" />
          <ellipse cx="226" cy="116" rx="12" ry="15" fill="#2E7D32" />

          {/* House 3 (mid-right, blue) */}
          <rect x="248" y="85" width="78" height="73" rx="4" fill="#E3F2FD" />
          <polygon points="240,87 287,44 334,87" fill="#1E88E5" />
          <rect x="276" y="122" width="22" height="36" rx="3" fill="#795548" />
          <rect x="252" y="100" width="20" height="18" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          <rect x="306" y="100" width="16" height="18" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          {/* balcony */}
          <rect x="252" y="118" width="20" height="4" rx="1" fill="#90CAF9"/>
          <rect x="253" y="106" width="2" height="12" fill="#90CAF9"/>
          <rect x="258" y="106" width="2" height="12" fill="#90CAF9"/>
          <rect x="263" y="106" width="2" height="12" fill="#90CAF9"/>
          <rect x="268" y="106" width="2" height="12" fill="#90CAF9"/>

          {/* Trash bins on sidewalk */}
          <rect x="340" y="138" width="16" height="20" rx="3" fill="#66BB6A" />
          <rect x="338" y="135" width="20" height="5" rx="2" fill="#388E3C" />
          <rect x="345" y="140" width="2" height="14" fill="#2E7D32" opacity="0.5" />
          <rect x="360" y="140" width="15" height="18" rx="3" fill="#42A5F5" />
          <rect x="358" y="137" width="19" height="5" rx="2" fill="#1E88E5" />
          <rect x="365" y="142" width="2" height="13" fill="#1565C0" opacity="0.5" />
          <rect x="379" y="141" width="14" height="17" rx="3" fill="#FFA726" />
          <rect x="377" y="138" width="18" height="5" rx="2" fill="#F57C00" />

          {/* Tree 2 (right) */}
          <rect x="408" y="122" width="8" height="36" rx="3" fill="#8D6E63" />
          <ellipse className="leaf2" cx="412" cy="114" rx="20" ry="22" fill="#43A047" />
          <ellipse cx="402" cy="120" rx="14" ry="16" fill="#388E3C" />
          <ellipse cx="422" cy="118" rx="13" ry="15" fill="#2E7D32" />

          {/* House 4 (far right, yellow) */}
          <rect x="440" y="92" width="68" height="66" rx="4" fill="#FFF9C4" />
          <polygon points="432,94 474,56 516,94" fill="#FBC02D" />
          <rect x="456" y="122" width="20" height="36" rx="3" fill="#795548" />
          <rect x="444" y="104" width="18" height="16" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>
          <rect x="482" y="104" width="18" height="16" rx="2" fill="#81D4FA" stroke="white" strokeWidth="1.5"/>

          {/* Animated garbage truck */}
          <g className="truck">
            <rect x="0" y="138" width="72" height="28" rx="5" fill="#4CAF50" />
            <rect x="44" y="130" width="28" height="18" rx="4" fill="#388E3C" />
            <rect x="48" y="133" width="18" height="10" rx="2" fill="#B2DFDB" opacity="0.8"/>
            <circle cx="14" cy="167" r="7" fill="#37474F" />
            <circle cx="14" cy="167" r="3.5" fill="#78909C" />
            <circle cx="58" cy="167" r="7" fill="#37474F" />
            <circle cx="58" cy="167" r="3.5" fill="#78909C" />
            <text x="8" y="152" fontSize="9" fill="white" fontWeight="bold">♻️</text>
          </g>

        </svg>
      </div>

      {/* Text + button card */}
      <div style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 28,
        padding: "28px 32px 32px",
        maxWidth: 400,
        width: "calc(100% - 40px)",
        textAlign: "center",
        boxShadow: "0 8px 40px rgba(52,211,153,0.18), 0 2px 12px rgba(0,0,0,0.08)",
        border: "2px solid rgba(255,255,255,0.8)",
        marginTop: -10,
      }}>
        <div style={{ fontSize: 52, marginBottom: 4, lineHeight: 1 }}>🗑️</div>
        <h1 className="welcome-title" style={{
          fontSize: 38, fontWeight: 900, margin: "0 0 6px",
          background: "linear-gradient(135deg, #059669, #10b981, #34d399)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-1px", lineHeight: 1.1,
        }}>Pilah Sampah</h1>
        <p className="welcome-subtitle" style={{
          fontSize: 15, color: "#475569", margin: "0 0 28px",
          fontWeight: 500, lineHeight: 1.5,
        }}>
          Latih AI untuk bisa memilah<br/>sampah sendiri! ♻️🌿
        </p>
        <button
          className="welcome-btn game-btn"
          onClick={onStart}
          style={{
            width: "100%", padding: "16px 24px",
            borderRadius: 18, border: "none",
            fontWeight: 800, fontSize: 18,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            boxShadow: "0 6px 24px rgba(16,185,129,0.45)",
            letterSpacing: "0.3px",
            cursor: "pointer",
            transition: "all 0.18s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          🌟 Mulai!
        </button>
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Labeling Data", "Latih AI", "Uji Prediksi"];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <div key={n} style={{
            flex: 1, textAlign: "center", padding: "9px 4px", borderRadius: 12,
            fontSize: 12, fontWeight: 700,
            background: done ? "#bbf7d0" : active ? "#1d4ed8" : "#e2e8f0",
            color: done ? "#166534" : active ? "#fff" : "#94a3b8",
            border: `2px solid ${done ? "#4ade80" : active ? "#1d4ed8" : "transparent"}`,
            boxShadow: active ? "0 4px 14px rgba(29,78,216,0.35)" : "none",
            transition: "all 0.3s ease",
          }}>
            {done ? "✓ " : `${n}. `}{label}
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ pct, color = "#3b82f6", label }: { pct: number; color?: string; label?: string }) {
  return (
    <div>
      <div style={{ height: 14, borderRadius: 999, background: "#e2e8f0", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
      </div>
      {label && <p style={{ fontSize: 12, color: "#64748b", margin: "5px 0 0" }}>{label}</p>}
    </div>
  );
}

function GameButton({ onClick, disabled = false, children, variant = "primary" }: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode; variant?: "primary" | "ghost";
}) {
  const base: React.CSSProperties = {
    width: "100%", padding: "13px 20px", borderRadius: 14, fontWeight: 700,
    fontSize: 15, border: "none", cursor: disabled ? "not-allowed" : "pointer",
  };
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: disabled ? "#e2e8f0" : "linear-gradient(135deg, #1d4ed8, #2563eb)", color: disabled ? "#94a3b8" : "#fff", boxShadow: disabled ? "none" : "0 4px 14px rgba(29,78,216,0.35)" },
    ghost: { background: "transparent", color: "#64748b", border: "2px solid #e2e8f0" },
  };
  return (
    <button className={disabled ? "" : "game-btn"} style={{ ...base, ...styles[variant] }} onClick={disabled ? undefined : onClick}>
      {children}
    </button>
  );
}

// ─── Stage 1: Labeling ────────────────────────────────────────────────────────

type LabeledItem = typeof TRAINING_ITEMS[0] & { chosen: string; correct: boolean };

function LabelingStage({ onComplete }: { onComplete: (data: LabeledItem[], score: number) => void }) {
  const [queue]       = useState(() => shuffle(TRAINING_ITEMS));
  const [idx, setIdx] = useState(0);
  const [labeled, setLabeled]         = useState<LabeledItem[]>([]);
  const [feedback, setFeedback]       = useState<{ correct: boolean } | null>(null);
  const [highlight, setHighlight]     = useState<string | null>(null);
  const [score, setScore]             = useState(0);
  const [animKey, setAnimKey]         = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const current = queue[idx];
  const progress = Math.min(100, Math.round(labeled.length / MIN_LABELS * 100));
  const canProceed = labeled.length >= MIN_LABELS;

  function pickBin(categoryId: string) {
    if (!current || feedback) return;
    const correct = current.category === categoryId;
    if (correct) setScore(s => s + 10);
    setFeedback({ correct });
    setLabeled(prev => [...prev, { ...current, chosen: categoryId, correct }]);
    setHighlight(null);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFeedback(null);
      setIdx(i => i + 1);
      setAnimKey(k => k + 1);
    }, 900);
  }

  const correctCount = labeled.filter(d => d.correct).length;

  return (
    <div className="fade-up">
      {/* Score bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(135deg, #1e3a5f, #1e40af)",
        borderRadius: 14, padding: "12px 18px", marginBottom: 16,
        boxShadow: "0 4px 14px rgba(30,64,175,0.3)",
      }}>
        <div>
          <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>SKOR</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{score}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>BENAR</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{correctCount}/{labeled.length}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>TERSISA</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{Math.max(0, queue.length - idx)}</div>
        </div>
      </div>

      {/* Info card */}
      <div style={{ background: "#fffbeb", border: "2px solid #fcd34d", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#78350f", margin: 0 }}>
          💡 <strong>Apa ini?</strong> Kamu sedang membuat <em>training data</em> — mengajarkan AI dengan memberi contoh berlabel!
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <ProgressBar pct={progress} color="linear-gradient(90deg, #4ade80, #22c55e)"
          label={labeled.length < MIN_LABELS ? `${labeled.length}/${MIN_LABELS} data — butuh ${MIN_LABELS - labeled.length} lagi untuk lanjut` : `✅ ${labeled.length} data siap — boleh lanjut kapan saja!`} />
      </div>

      {/* Trash card */}
      {current && idx < queue.length ? (
        <>
          <div key={animKey} className="bounce-in" style={{
            textAlign: "center", padding: "28px 16px",
            background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
            borderRadius: 20, marginBottom: 16,
            border: "2px solid #e2e8f0",
            boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
            position: "relative",
            animation: feedback
              ? (feedback.correct ? "popCorrect 0.5s ease" : "shakeWrong 0.4s ease")
              : undefined,
          }}>
            {feedback && (
              <div className="fade-up" style={{
                position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
                padding: "5px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700,
                background: feedback.correct ? "#bbf7d0" : "#fecaca",
                color: feedback.correct ? "#15803d" : "#dc2626",
                border: `2px solid ${feedback.correct ? "#4ade80" : "#f87171"}`,
                whiteSpace: "nowrap", zIndex: 2,
              }}>
                {feedback.correct ? "✅ Benar! +10 poin" : "❌ Salah — tapi AI tetap belajar!"}
              </div>
            )}
            <div className="floating" style={{ fontSize: 72, lineHeight: 1, marginBottom: 10 }}>{current.icon}</div>
            <p style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>{current.name}</p>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>{current.desc}</p>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>👇 Masukkan ke tempat sampah yang benar</p>
          </div>

          {/* Bins */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className="bin-btn"
                onClick={() => pickBin(cat.id)}
                onMouseEnter={() => setHighlight(cat.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{
                  flex: 1, padding: "18px 8px", borderRadius: 18, border: "none",
                  background: highlight === cat.id
                    ? `linear-gradient(135deg, ${cat.accent}50, ${cat.bg})`
                    : "#f8fafc",
                  outline: `3px solid ${highlight === cat.id ? cat.border : "#e2e8f0"}`,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  boxShadow: highlight === cat.id ? `0 8px 24px ${cat.accent}50` : "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                <div style={{ fontSize: 30 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.label}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "32px", background: "#f0fdf4", borderRadius: 20, border: "2px solid #4ade80", marginBottom: 16 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🎉</div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "#15803d", margin: "0 0 4px" }}>Semua sampah sudah dilabeli!</p>
          <p style={{ fontSize: 14, color: "#166534", margin: 0 }}>Kamu luar biasa! Skor: {score} poin</p>
        </div>
      )}

      {/* Recent labels */}
      {labeled.length > 0 && (
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: "12px 14px", marginBottom: 16, border: "2px solid #e2e8f0" }}>
          <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#475569", letterSpacing: 0.5 }}>DATA TERLABELI:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {labeled.slice(-8).map((d, i) => {
              const cat = getCat(d.chosen);
              return (
                <div key={i} style={{
                  fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                  background: d.correct ? cat.bg : "#fef2f2",
                  border: `1.5px solid ${d.correct ? cat.border : "#fca5a5"}`,
                  padding: "3px 10px", borderRadius: 999, color: d.correct ? cat.color : "#dc2626",
                  fontWeight: 600,
                }}>
                  {d.icon} {cat.label} {d.correct ? "✓" : "✗"}
                </div>
              );
            })}
            {labeled.length > 8 && <span style={{ fontSize: 12, color: "#94a3b8", alignSelf: "center" }}>+{labeled.length - 8} lainnya</span>}
          </div>
        </div>
      )}

      <GameButton onClick={() => onComplete(labeled, score)} disabled={!canProceed}>
        {canProceed ? "⚡ Lanjut ke Latih AI →" : `Labeli ${MIN_LABELS - labeled.length} sampah lagi dulu`}
      </GameButton>
    </div>
  );
}

// ─── Stage 2: Training ────────────────────────────────────────────────────────

type LabeledItem2 = { category: string; chosen: string; correct: boolean };

function TrainingStage({ labeled, score, onComplete }: { labeled: LabeledItem2[]; score: number; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trained, setTrained]       = useState(false);

  const accuracy = calcAccuracy(labeled);

  function startTraining() {
    setIsTraining(true);
    setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => { setIsTraining(false); setTrained(true); }, 400);
      }
      setProgress(Math.round(p));
    }, 110);
  }

  const trainingPhase = progress < 30 ? "Menganalisis pola data..." : progress < 60 ? "Menyesuaikan parameter..." : progress < 90 ? "Mengoptimalkan model..." : "Hampir selesai!";

  return (
    <div className="fade-up">
      {/* Stats */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {CATEGORIES.map(cat => {
          const count = labeled.filter(d => d.chosen === cat.id).length;
          return (
            <div key={cat.id} style={{
              flex: 1, textAlign: "center", padding: "12px 8px",
              background: cat.bg, borderRadius: 14, border: `2px solid ${cat.border}`,
            }}>
              <div style={{ fontSize: 24 }}>{cat.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, marginTop: 2 }}>{cat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: cat.color }}>{count}</div>
              <div style={{ fontSize: 10, color: cat.color, opacity: 0.8 }}>sampel</div>
            </div>
          );
        })}
      </div>

      {/* Training box */}
      <div style={{
        textAlign: "center", padding: "32px 24px",
        background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
        borderRadius: 20, marginBottom: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {!trained && !isTraining && (
          <>
            <div style={{ fontSize: 56, marginBottom: 12, animation: "float 2.5s ease-in-out infinite", display: "inline-block" }}>🤖</div>
            <p style={{ fontWeight: 800, color: "#e2e8f0", fontSize: 18, marginBottom: 6 }}>AI Siap Dilatih!</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              {labeled.length} data, akurasi labelmu: <strong style={{ color: accuracy >= 70 ? "#4ade80" : "#fb923c" }}>{accuracy}%</strong>
            </p>
            <button className="game-btn" onClick={startTraining} style={{
              padding: "14px 40px", borderRadius: 14, border: "none", fontWeight: 800,
              fontSize: 16, background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.5)",
            }}>
              🚀 Latih AI Sekarang!
            </button>
          </>
        )}

        {isTraining && (
          <>
            <div style={{ fontSize: 56, marginBottom: 12, animation: "trainPulse 0.8s ease-in-out infinite", display: "inline-block" }}>🧠</div>
            <p style={{ fontWeight: 800, color: "#e2e8f0", fontSize: 18, marginBottom: 16 }}>AI sedang belajar...</p>
            <div style={{ marginBottom: 12 }}>
              <ProgressBar pct={progress} color="linear-gradient(90deg, #7c3aed, #a78bfa)" />
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>{trainingPhase} {progress}%</p>
          </>
        )}

        {trained && (
          <>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 800, color: "#e2e8f0", fontSize: 18, marginBottom: 6 }}>AI Berhasil Dilatih!</p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 20 }}>
              Akurasi labelingmu: <strong style={{ color: accuracy >= 70 ? "#4ade80" : "#fb923c", fontSize: 18 }}>{accuracy}%</strong>
              {" — "}{accuracy >= 70 ? "AI kamu akan sangat pintar! 🎉" : "Lumayan, tapi bisa lebih baik."}
            </p>
            <button className="game-btn" onClick={onComplete} style={{
              padding: "14px 40px", borderRadius: 14, border: "none", fontWeight: 800,
              fontSize: 16, background: "linear-gradient(135deg, #059669, #10b981)",
              color: "#fff", boxShadow: "0 4px 20px rgba(5,150,105,0.5)",
            }}>
              🎯 Uji AI Sekarang →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stage 3: Testing ─────────────────────────────────────────────────────────

type PredictionItem = typeof TEST_ITEMS[0] & { prediction: string; correct: boolean };

function TestingStage({ accuracy, onFinish }: { accuracy: number; onFinish: (results: PredictionItem[], score: number) => void }) {
  const [items]    = useState<PredictionItem[]>(() => {
    return shuffle(TEST_ITEMS).map(item => {
      const correct = Math.random() * 100 < accuracy;
      const prediction = correct
        ? item.category
        : CATEGORIES.filter(c => c.id !== item.category)[Math.floor(Math.random() * 2)].id;
      return { ...item, prediction, correct };
    });
  });
  const [idx, setIdx]             = useState(0);
  const [revealed, setRevealed]   = useState(false);
  const [bonusScore, setBonusScore] = useState(0);

  const current = items[idx];
  const predCat = getCat(current.prediction);
  const trueCat = getCat(current.category);

  function reveal() {
    if (current.correct) setBonusScore(s => s + 15);
    setRevealed(true);
  }

  function next() {
    if (idx + 1 >= items.length) {
      onFinish(items, bonusScore);
      return;
    }
    setRevealed(false);
    setIdx(i => i + 1);
  }

  return (
    <div className="fade-up">
      <div style={{ background: "#eff6ff", border: "2px solid #93c5fd", borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#1e40af", margin: 0 }}>
          🎯 <strong>Uji Prediksi!</strong> AI kamu akan menebak kategori sampah <em>baru</em> yang belum pernah dilihat sebelumnya.
        </p>
      </div>

      {/* Counter */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
        {items.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: "50%",
            background: i < idx ? (items[i].correct ? "#4ade80" : "#f87171") : i === idx ? "#3b82f6" : "#e2e8f0",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      {/* Item card */}
      <div style={{
        textAlign: "center", padding: "28px 20px",
        background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
        borderRadius: 20, marginBottom: 16,
        border: "2px solid #e2e8f0",
        boxShadow: "0 6px 20px rgba(0,0,0,0.07)",
      }}>
        <div className="floating" style={{ fontSize: 72, lineHeight: 1, marginBottom: 10 }}>{current.icon}</div>
        <p style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px", color: "#1e293b" }}>{current.name}</p>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Sampah baru yang belum pernah dilihat AI!</p>

        {!revealed ? (
          <button className="game-btn" onClick={reveal} style={{
            padding: "12px 32px", borderRadius: 14, border: "none", fontWeight: 800,
            fontSize: 15, background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
          }}>
            🤖 Tebak, AI!
          </button>
        ) : (
          <div className="bounce-in" style={{
            padding: "20px", borderRadius: 16,
            background: current.correct ? "#f0fdf4" : "#fef2f2",
            border: `2px solid ${current.correct ? "#4ade80" : "#f87171"}`,
          }}>
            <p style={{ fontSize: 13, margin: "0 0 6px", color: current.correct ? "#15803d" : "#dc2626", fontWeight: 600 }}>
              AI menebak:
            </p>
            <p style={{ fontSize: 28, margin: "0 0 6px" }}>{predCat.icon}</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: current.correct ? "#15803d" : "#dc2626", margin: "0 0 8px" }}>{predCat.label}</p>
            {current.correct ? (
              <p style={{ fontSize: 14, color: "#16a34a", fontWeight: 700, margin: 0 }}>✅ Benar! +15 poin bonus</p>
            ) : (
              <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>
                ❌ Salah — jawaban benar: {trueCat.icon} <strong>{trueCat.label}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <GameButton onClick={next}>
          {idx + 1 < items.length ? "Sampah Berikutnya →" : "Lihat Hasil Akhir 🏆"}
        </GameButton>
      )}
    </div>
  );
}

// ─── Stage 4: Results ─────────────────────────────────────────────────────────

const ML_CONCEPTS = [
  ["🏷️", "Labeling Data",   "Memberi tanda kategori pada data agar AI bisa belajar dari contoh"],
  ["🧠", "Training",         "Proses AI mempelajari pola dari contoh yang diberikan"],
  ["🎯", "Prediksi",         "AI menebak kategori data baru berdasarkan pola yang dipelajari"],
  ["📊", "Akurasi",          "Seberapa sering prediksi AI benar — makin banyak data bagus, makin tinggi akurasi"],
] as const;

function ResultsStage({ results, totalScore, onReplay }: { results: PredictionItem[]; totalScore: number; onReplay: () => void }) {
  const accuracy = Math.round(results.filter(r => r.correct).length / results.length * 100);
  const trophy = accuracy >= 80 ? "🏆" : accuracy >= 60 ? "🌟" : "💪";
  const message = accuracy >= 80 ? "Luar biasa! AI kamu sangat pintar!" : accuracy >= 60 ? "Bagus! AI kamu cukup andal." : "AI masih perlu belajar. Tambah data labeling!";

  return (
    <div className="fade-up">
      {/* Trophy */}
      <div style={{
        textAlign: "center", padding: "32px 24px",
        background: "linear-gradient(135deg, #1e3a5f, #1e1b4b)",
        borderRadius: 20, marginBottom: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{trophy}</div>
        <p style={{ fontSize: 14, color: "#93c5fd", fontWeight: 700, letterSpacing: 1, margin: "0 0 4px" }}>AKURASI AI</p>
        <p style={{ fontSize: 48, fontWeight: 900, color: "#fff", margin: "0 0 6px", lineHeight: 1 }}>{accuracy}%</p>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px" }}>{message}</p>

        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {results.map((r, i) => (
            <div key={i} style={{
              width: 36, height: 36, borderRadius: 10, fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: r.correct ? "#dcfce7" : "#fee2e2",
              border: `2px solid ${r.correct ? "#4ade80" : "#f87171"}`,
            }}>
              {r.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Score card */}
      <div style={{ background: "#fffbeb", border: "2px solid #fcd34d", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", letterSpacing: 1, margin: "0 0 6px" }}>TOTAL SKOR</p>
        <p style={{ fontSize: 36, fontWeight: 900, color: "#b45309", margin: 0 }}>{totalScore} <span style={{ fontSize: 16 }}>poin</span></p>
      </div>

      {/* Concepts learned */}
      <div style={{ background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: 1, margin: "0 0 12px" }}>📚 YANG KAMU PELAJARI</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ML_CONCEPTS.map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}: </span>
                <span style={{ fontSize: 13, color: "#64748b" }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GameButton onClick={onReplay}>🔄 Main Lagi dari Awal</GameButton>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

type Stage = 0 | 1 | 2 | 3 | 4;

export default function App() {
  const [stage, setStage]         = useState<Stage>(0);
  const [labeled, setLabeled]     = useState<LabeledItem[]>([]);
  const [labelScore, setLabelScore] = useState(0);
  const [testResults, setTestResults] = useState<PredictionItem[]>([]);
  const [testScore, setTestScore] = useState(0);

  function handleLabelingDone(data: LabeledItem[], score: number) {
    setLabeled(data);
    setLabelScore(score);
    setStage(2);
  }

  function handleTrainingDone() {
    setStage(3);
  }

  function handleTestingDone(results: PredictionItem[], bonus: number) {
    setTestResults(results);
    setTestScore(bonus);
    setStage(4);
  }

  function handleReplay() {
    setStage(0);
    setLabeled([]);
    setLabelScore(0);
    setTestResults([]);
    setTestScore(0);
  }

  const accuracy = calcAccuracy(labeled);

  if (stage === 0) {
    return (
      <>
        <style>{GAME_CSS}</style>
        <WelcomeScreen onStart={() => setStage(1)} />
      </>
    );
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 600, margin: "0 auto", padding: "1rem" }}>
      <style>{GAME_CSS}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px", color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
          🌿 Penjaga Lingkungan
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Latih AI untuk memilah sampah dengan benar!</p>
      </div>

      <StepIndicator step={stage} />

      {stage === 1 && <LabelingStage onComplete={handleLabelingDone} />}
      {stage === 2 && <TrainingStage labeled={labeled} score={labelScore} onComplete={handleTrainingDone} />}
      {stage === 3 && <TestingStage accuracy={accuracy} onFinish={handleTestingDone} />}
      {stage === 4 && <ResultsStage results={testResults} totalScore={labelScore + testScore} onReplay={handleReplay} />}
    </div>
  );
}
