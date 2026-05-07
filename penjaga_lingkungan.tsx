import { useState, useRef, useEffect } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRAINING_ITEMS = [
  { id: 1,  name: "Kulit Pisang",    icon: "🍌", category: "organik", desc: "Sisa makanan buah" },
  { id: 2,  name: "Botol Plastik",   icon: "🧴", category: "plastik", desc: "Wadah minuman bekas" },
  { id: 3,  name: "Kaleng Soda",     icon: "🥤", category: "logam",   desc: "Kaleng aluminium bekas" },
  { id: 4,  name: "Daun Kering",     icon: "🍂", category: "organik", desc: "Daun yang sudah gugur" },
  { id: 5,  name: "Kantong Plastik", icon: "🛍️", category: "plastik", desc: "Tas belanja plastik" },
  { id: 6,  name: "Tutup Botol Besi",icon: "🔩", category: "logam",   desc: "Penutup botol dari besi" },
  { id: 7,  name: "Sisa Nasi",       icon: "🍚", category: "organik", desc: "Makanan yang tersisa" },
  { id: 8,  name: "Sedotan Plastik", icon: "🥤", category: "plastik", desc: "Sedotan minuman bekas" },
  { id: 9,  name: "Paku Berkarat",   icon: "📌", category: "logam",   desc: "Paku besi yang tua" },
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
  { id: "organik", label: "Organik", icon: "🌿", color: "#00FF41" },
  { id: "plastik", label: "Plastik", icon: "♻️", color: "#00D4FF" },
  { id: "logam",   label: "Logam",   icon: "⚙️", color: "#FFD700" },
];

const MIN_LABELS = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);
const getCat = (id: string) => CATEGORIES.find(c => c.id === id)!;
const calcAccuracy = (items: { correct: boolean }[]) =>
  items.length === 0 ? 0 : Math.round(items.filter(d => d.correct).length / items.length * 100);

// ─── Animations & Global CSS ──────────────────────────────────────────────────

const GAME_CSS = `
  body {
    background-color: #0F1419;
    background-image: radial-gradient(circle at top center, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
    color: #fff;
    font-family: 'Fredoka', system-ui, sans-serif !important;
    margin: 0;
    min-height: 100vh;
  }
  @keyframes bounceIn {
    0%   { transform: scale(0.4) translateY(-24px); opacity: 0; }
    60%  { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1) translateY(0); }
  }
  @keyframes binShakeAnim {
    0%,100% { transform: scale(1) rotate(0deg); }
    25%     { transform: scale(1.1) rotate(-5deg); }
    50%     { transform: scale(1.1) rotate(5deg); }
    75%     { transform: scale(1.1) rotate(-5deg); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-8px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes titlePop {
    0%   { opacity: 0; transform: scale(0.7) translateY(20px); text-shadow: 0 0 0 transparent; }
    70%  { transform: scale(1.06) translateY(-4px); opacity: 1; text-shadow: 0 0 20px #00D4FF; }
    100% { transform: scale(1) translateY(0); opacity: 1; text-shadow: 0 0 15px #00D4FF; }
  }
  @keyframes conveyor {
    from { background-position: 0 0; }
    to { background-position: -40px 0; }
  }
  @keyframes scanLaser {
    0%   { top: 0%; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
  @keyframes neonPulse {
    0%, 100% { box-shadow: 0 0 15px rgba(0, 212, 255, 0.2), inset 0 0 10px rgba(0, 212, 255, 0.1); }
    50%      { box-shadow: 0 0 25px rgba(0, 212, 255, 0.5), inset 0 0 15px rgba(0, 212, 255, 0.3); }
  }
  
  .bounce-in  { animation: bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  .fade-up    { animation: fadeUp 0.35s ease both; }
  .floating   { animation: float 3s ease-in-out infinite; }
  .bin-shake  { animation: binShakeAnim 0.4s ease-in-out; }
  .welcome-title { animation: titlePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }

  /* Cyberpunk Glass Card */
  .neon-card {
    background: rgba(15, 20, 25, 0.65);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 3px solid #00D4FF;
    border-radius: 24px;
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.2), inset 0 0 15px rgba(0, 212, 255, 0.1);
  }

  /* Neon Buttons */
  .neon-btn {
    background: rgba(0, 212, 255, 0.05);
    border: 3px solid #00D4FF;
    color: #00D4FF;
    text-shadow: 0 0 8px rgba(0,212,255,0.6);
    box-shadow: 0 0 15px rgba(0,212,255,0.2), inset 0 0 8px rgba(0,212,255,0.2);
    border-radius: 16px;
    padding: 16px 24px;
    font-weight: 800;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    font-family: inherit;
  }
  .neon-btn:hover:not(:disabled) {
    background: rgba(0, 212, 255, 0.2);
    box-shadow: 0 0 25px rgba(0,212,255,0.5), inset 0 0 15px rgba(0,212,255,0.4);
    transform: translateY(-3px);
  }
  .neon-btn:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }
  .neon-btn:disabled {
    border-color: #475569;
    color: #64748b;
    box-shadow: none;
    text-shadow: none;
    cursor: not-allowed;
  }

  /* Bin Button */
  .bin-btn {
    background: rgba(15, 20, 25, 0.8);
    border-radius: 20px;
    transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1);
    cursor: pointer;
    font-family: inherit;
  }
  
  .laser-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 3px;
    background: #00FF41;
    box-shadow: 0 0 15px #00FF41, 0 0 25px #00FF41;
    animation: scanLaser 1.5s ease-in-out infinite;
    z-index: 50;
  }
`;

// ─── Shared SVG Components ───────────────────────────────────────────────────

function NeonBin({ color, icon }: { color: string; icon: string }) {
  return (
    <div style={{ position: "relative", width: 64, height: 80, margin: "0 auto" }}>
      <svg width="64" height="80" viewBox="0 0 64 80" style={{ display: "block", filter: `drop-shadow(0 0 8px ${color}80)` }}>
        <path d="M8,18 L56,18 L51,75 C50,78 48,80 45,80 L19,80 C16,80 14,78 13,75 Z" fill="rgba(15,20,25,0.9)" />
        <path d="M8,18 L56,18 L51,75 C50,78 48,80 45,80 L19,80 C16,80 14,78 13,75 Z" fill="none" stroke={color} strokeWidth="3" />
        <rect x="4" y="8" width="56" height="10" rx="3" fill="rgba(15,20,25,0.9)" stroke={color} strokeWidth="3" />
        <rect x="22" y="3" width="20" height="5" rx="2" fill="none" stroke={color} strokeWidth="3" />
      </svg>
      <div style={{ position: "absolute", top: 32, left: 0, width: "100%", textAlign: "center", fontSize: 26, textShadow: `0 0 10px ${color}` }}>{icon}</div>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [currentItem, setCurrentItem] = useState(TRAINING_ITEMS[0]);
  const [robotPos, setRobotPos] = useState({ x: 50, y: 30 });
  const [trashPos, setTrashPos] = useState({ x: 80, y: 78 });
  const [trashOpacity, setTrashOpacity] = useState(0);
  const [hasTrash, setHasTrash] = useState(false);
  const [binShake, setBinShake] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const playAnim = async () => {
      while (active) {
        // Move robot to center
        setRobotPos({ x: 50, y: 65 });
        setHasTrash(false);
        await new Promise(r => setTimeout(r, 400));
        if (!active) break;

        // Spawn trash from above
        const item = TRAINING_ITEMS[Math.floor(Math.random() * TRAINING_ITEMS.length)];
        setCurrentItem(item);
        setTrashPos({ x: 50, y: -20 });
        setTrashOpacity(1);
        
        // Wait a tiny bit then animate falling
        await new Promise(r => setTimeout(r, 50));
        setTrashPos({ x: 50, y: 55 });
        await new Promise(r => setTimeout(r, 500)); // Fall duration
        if (!active) break;

        // Robot catches trash
        setHasTrash(true);
        await new Promise(r => setTimeout(r, 300));
        if (!active) break;

        // Move to bin
        let targetX = 50;
        if (item.category === "organik") targetX = 18;
        if (item.category === "logam") targetX = 82;
        setRobotPos({ x: targetX, y: 40 });
        await new Promise(r => setTimeout(r, 700));
        if (!active) break;

        // Drop trash into bin
        setHasTrash(false);
        setTrashPos({ x: targetX, y: 55 });
        setTrashOpacity(0);
        setBinShake(item.category);
        await new Promise(r => setTimeout(r, 400));
        setBinShake(null);
        if (!active) break;

        // Delay before next cycle
        await new Promise(r => setTimeout(r, 600));
      }
    };
    playAnim();
    return () => { active = false; };
  }, []);

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "0", margin: "0", overflow: "hidden", position: "relative",
    }}>

      {/* Animation Area */}
      <div style={{
        position: "absolute", top: "5%", width: "100%", maxWidth: 600, height: 250,
        zIndex: 0,
      }}>
        {/* Floor Line */}
        <div style={{ position: "absolute", bottom: "5%", left: 0, right: 0, height: 2, background: "rgba(0,212,255,0.3)", boxShadow: "0 0 10px rgba(0,212,255,0.5)" }} />
        
        {/* Bins */}
        <div style={{ position: "absolute", bottom: "5%", left: "18%", transform: "translateX(-50%)", textAlign: "center" }}
             className={binShake === "organik" ? "bin-shake" : ""}>
          <NeonBin color="#00FF41" icon="🌿" />
        </div>
        <div style={{ position: "absolute", bottom: "5%", left: "50%", transform: "translateX(-50%)", textAlign: "center" }}
             className={binShake === "plastik" ? "bin-shake" : ""}>
          <NeonBin color="#00D4FF" icon="♻️" />
        </div>
        <div style={{ position: "absolute", bottom: "5%", left: "82%", transform: "translateX(-50%)", textAlign: "center" }}
             className={binShake === "logam" ? "bin-shake" : ""}>
          <NeonBin color="#FFD700" icon="⚙️" />
        </div>

        {/* Robot */}
        <div style={{
          position: "absolute", top: `${robotPos.y}%`, left: `${robotPos.x}%`,
          transform: "translate(-50%, -50%)",
          fontSize: 64, zIndex: 10, filter: "drop-shadow(0 0 10px rgba(0,212,255,0.5))",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)"
        }}>
          🤖
          {hasTrash && (
            <div style={{ position: "absolute", bottom: -15, right: -15, fontSize: 32 }}>
              {currentItem.icon}
            </div>
          )}
        </div>

        {/* Trash on ground */}
        {!hasTrash && (
          <div style={{
            position: "absolute", top: `${trashPos.y}%`, left: `${trashPos.x}%`,
            transform: "translate(-50%, -50%)",
            fontSize: 40, opacity: trashOpacity, zIndex: 5,
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
            {currentItem.icon}
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="neon-card" style={{
        padding: "40px 32px",
        maxWidth: 420,
        width: "calc(100% - 40px)",
        textAlign: "center",
        marginTop: 180,
        zIndex: 20,
        animation: "neonPulse 4s infinite"
      }}>
        <div style={{ fontSize: 56, marginBottom: 8, lineHeight: 1 }}>🗑️</div>
        <h1 className="welcome-title" style={{
          fontSize: 42, fontWeight: 900, margin: "0 0 12px", color: "#fff",
        }}>PILAH SAMPAH</h1>
        <p style={{
          fontSize: 16, color: "#94a3b8", margin: "0 0 32px",
          fontWeight: 600, lineHeight: 1.5,
        }}>
          Latih AI untuk memilah<br/>sampah secara otomatis!
        </p>
        <button className="neon-btn" onClick={onStart} style={{ width: "100%" }}>
          [ MULAI SISTEM ]
        </button>
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["PELABELAN", "PELATIHAN", "PENGUJIAN"];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        
        let color = "#475569";
        let border = "#1e293b";
        let text = "#64748b";
        let shadow = "none";
        
        if (done) {
          color = "rgba(0, 255, 65, 0.1)";
          border = "#00FF41";
          text = "#00FF41";
        } else if (active) {
          color = "rgba(0, 212, 255, 0.2)";
          border = "#00D4FF";
          text = "#00D4FF";
          shadow = "0 0 10px rgba(0, 212, 255, 0.4)";
        }

        return (
          <div key={n} style={{
            flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 8,
            fontSize: 11, fontWeight: 800, letterSpacing: 1,
            background: color,
            color: text,
            border: `2px solid ${border}`,
            boxShadow: shadow,
            transition: "all 0.3s ease",
          }}>
            {done ? "✓ " : ""}{label}
          </div>
        );
      })}
    </div>
  );
}

function NeonProgressBar({ pct, color = "#00D4FF", label }: { pct: number; color?: string; label?: string }) {
  return (
    <div>
      <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", border: "1px solid #334155", overflow: "hidden" }}>
        <div style={{ 
          height: "100%", width: `${pct}%`, background: color, 
          boxShadow: `0 0 10px ${color}, inset 0 0 5px #fff`,
          transition: "width 0.4s ease" 
        }} />
      </div>
      {label && <p style={{ fontSize: 11, color: "#94a3b8", margin: "6px 0 0", fontWeight: 600, letterSpacing: 0.5 }}>{label}</p>}
    </div>
  );
}

// ─── Stage 1: Labeling ────────────────────────────────────────────────────────

type LabeledItem = typeof TRAINING_ITEMS[0] & { chosen: string; correct: boolean };

function LabelingStage({ onComplete }: { onComplete: (data: LabeledItem[], score: number) => void }) {
  const [queue, setQueue]             = useState(() => shuffle(TRAINING_ITEMS));
  const [labeled, setLabeled]         = useState<LabeledItem[]>([]);
  const [feedback, setFeedback]       = useState<{ correct: boolean } | null>(null);
  const [highlight, setHighlight]     = useState<string | null>(null);
  const [score, setScore]             = useState(0);
  
  const [animatingItem, setAnimatingItem] = useState<{ item: LabeledItem, targetCat: string, correct: boolean } | null>(null);
  const [isFlying, setIsFlying]       = useState(false);

  const current = queue[0];
  const progress = Math.min(100, Math.round(labeled.length / MIN_LABELS * 100));
  const canProceed = labeled.length >= MIN_LABELS;

  function pickBin(categoryId: string) {
    if (!current || feedback || animatingItem) return;
    const correct = current.category === categoryId;
    
    const targetItem = { ...current, chosen: categoryId, correct };
    setAnimatingItem({ item: targetItem, targetCat: categoryId, correct });
    
    setTimeout(() => {
      setIsFlying(true);
      
      setTimeout(() => {
        if (correct) setScore(s => s + 10);
        setFeedback({ correct });
        setLabeled(prev => [...prev, targetItem]);
        setQueue(q => q.slice(1));
      }, 400);

      setTimeout(() => {
        setAnimatingItem(null);
        setIsFlying(false);
        setFeedback(null);
      }, 900);
    }, 20);
  }

  const correctCount = labeled.filter(d => d.correct).length;
  
  const flyAnimationStyles: Record<string, React.CSSProperties> = {
    organik: { transform: "translate(-120px, 160px) scale(0.3) rotate(-360deg)", opacity: 0 },
    plastik: { transform: "translate(0px, 160px) scale(0.3) rotate(360deg)", opacity: 0 },
    logam: { transform: "translate(120px, 160px) scale(0.3) rotate(720deg)", opacity: 0 },
  };

  return (
    <div className="fade-up" style={{ position: "relative" }}>
      {/* Top Bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 16, borderBottom: "2px solid #1e293b", paddingBottom: 12
      }}>
        <div>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>SKOR</div>
          <div style={{ color: "#00D4FF", fontSize: 26, fontWeight: 900, lineHeight: 1, textShadow: "0 0 10px rgba(0,212,255,0.5)" }}>{score}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>AKURASI</div>
          <div style={{ color: "#00FF41", fontSize: 26, fontWeight: 900, lineHeight: 1, textShadow: "0 0 10px rgba(0,255,65,0.5)" }}>{correctCount}/{labeled.length}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 800, letterSpacing: 1 }}>TERSISA</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{queue.length}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <NeonProgressBar pct={progress} label={labeled.length < MIN_LABELS ? `SYS: BUTUH ${labeled.length}/${MIN_LABELS} DATA` : `SYS: ${labeled.length} DATA SIAP`} />
      </div>

      {queue.length > 0 || animatingItem ? (
        <div style={{ position: "relative" }}>
          {/* Main Frame */}
          <div className="neon-card" style={{
            marginBottom: 20, position: "relative", padding: "20px 10px 10px",
            height: 220, display: "flex", flexDirection: "column", justifyContent: "flex-end",
            zIndex: 1, overflow: "hidden"
          }}>
            {/* Belt Grid */}
            <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, height: 28, background: "rgba(0,212,255,0.05)", borderTop: "2px solid #00D4FF", borderBottom: "2px solid #00D4FF", boxShadow: "0 0 15px rgba(0,212,255,0.2)" }}>
               <div style={{ width: "200%", height: "100%", background: "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,212,255,0.4) 30px, rgba(0,212,255,0.4) 32px)", animation: "conveyor 1s linear infinite" }} />
            </div>

            {/* Robot & Queue */}
            <div style={{ display: "flex", alignItems: "flex-end", position: "relative", zIndex: 5, paddingBottom: 16, paddingLeft: 20 }}>
              <div style={{ fontSize: 72, marginRight: 24, animation: "float 3s ease-in-out infinite", transformOrigin: "bottom center", filter: "drop-shadow(0 0 10px rgba(0,212,255,0.5))" }}>
                🤖
              </div>
              
              <div style={{ display: "flex", gap: 16, transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                 {queue.slice(0, 5).map((item, i) => (
                    <div key={item.id} style={{ 
                      fontSize: 56, position: "relative",
                      filter: i === 0 && !animatingItem ? "drop-shadow(0 0 15px rgba(255,255,255,0.6))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
                      transform: i === 0 && !animatingItem ? "scale(1.1) translateY(-10px)" : "scale(0.9)",
                      opacity: animatingItem && i === 0 ? 0 : 1 - (i * 0.2),
                      transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)"
                    }}>
                      {/* Chat Bubble for the first item */}
                      {i === 0 && !animatingItem && (
                         <div style={{
                           position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", zIndex: 20
                         }}>
                           <div className="fade-up" style={{
                             background: "rgba(15,20,25,0.9)", border: "2px solid #00D4FF", borderRadius: 12,
                             padding: "8px 12px", whiteSpace: "nowrap",
                             boxShadow: "0 0 15px rgba(0,212,255,0.4)", position: "relative"
                           }}>
                             <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 2, textAlign: "center" }}>{item.name}</div>
                             <div style={{ fontSize: 10, color: "#00D4FF", fontWeight: 700, textAlign: "center" }}>{item.desc}</div>
                             {/* Bubble tail */}
                             <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 10, height: 10, background: "rgba(15,20,25,0.9)", borderBottom: "2px solid #00D4FF", borderRight: "2px solid #00D4FF" }} />
                           </div>
                         </div>
                      )}
                      {item.icon}
                    </div>
                 ))}
              </div>
            </div>

            {/* Target Info (Removed in favor of Chat Bubble) */}

            {feedback && (
              <div className="bounce-in" style={{
                position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                padding: "8px 24px", borderRadius: 12, fontSize: 18, fontWeight: 900,
                background: "rgba(15,20,25,0.9)",
                color: feedback.correct ? "#00FF41" : "#FF0055",
                border: `3px solid ${feedback.correct ? "#00FF41" : "#FF0055"}`,
                boxShadow: `0 0 20px ${feedback.correct ? "rgba(0,255,65,0.4)" : "rgba(255,0,85,0.4)"}`,
                zIndex: 20, whiteSpace: "nowrap"
              }}>
                {feedback.correct ? "VALID +10" : "TIDAK VALID"}
              </div>
            )}
          </div>

          {/* Flying Item Overlay */}
          {animatingItem && (
             <div style={{
               position: "absolute", fontSize: 56, zIndex: 100,
               top: 100, left: 120,
               transition: "all 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53)",
               ...(isFlying ? flyAnimationStyles[animatingItem.targetCat] : {})
             }}>
               {animatingItem.item.icon}
             </div>
          )}

          {/* Control Buttons (Bins) */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, position: "relative", zIndex: 10 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className="bin-btn"
                onClick={() => pickBin(cat.id)}
                onMouseEnter={() => setHighlight(cat.id)}
                onMouseLeave={() => setHighlight(null)}
                style={{
                  flex: 1, padding: "16px 4px", border: `3px solid ${highlight === cat.id ? cat.color : "#334155"}`,
                  background: highlight === cat.id ? `rgba(${cat.id==='organik'?'0,255,65':cat.id==='plastik'?'0,212,255':'255,215,0'}, 0.1)` : "rgba(15,20,25,0.8)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  boxShadow: highlight === cat.id ? `0 0 15px ${cat.color}80, inset 0 0 10px ${cat.color}40` : "0 4px 6px rgba(0,0,0,0.3)",
                  transform: highlight === cat.id ? "translateY(-4px)" : "none",
                }}>
                <NeonBin color={highlight === cat.id ? cat.color : "#64748b"} icon={cat.icon} />
                <div style={{ fontSize: 13, fontWeight: 900, color: highlight === cat.id ? cat.color : "#94a3b8", letterSpacing: 1, marginTop: 4 }}>{cat.label.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="neon-card" style={{ textAlign: "center", padding: "40px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 12, textShadow: "0 0 20px #00FF41" }}>🏆</div>
          <p style={{ fontSize: 22, fontWeight: 900, color: "#00FF41", margin: "0 0 8px", textShadow: "0 0 10px rgba(0,255,65,0.5)" }}>DATA TERLABELI</p>
          <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>Skor: {score} | Siap untuk Pelatihan AI</p>
        </div>
      )}

      <button className="neon-btn" onClick={() => onComplete(labeled, score)} disabled={!canProceed} style={{ width: "100%" }}>
        {canProceed ? "MULAI PELATIHAN //" : `BUTUH ${MIN_LABELS - labeled.length} LAGI`}
      </button>
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

  const trainingPhase = progress < 30 ? "MENGANALISIS POLA..." : progress < 60 ? "MENYESUAIKAN PARAMETER..." : progress < 90 ? "MENGOPTIMALKAN JARINGAN..." : "MENYELESAIKAN...";

  return (
    <div className="fade-up">
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {CATEGORIES.map(cat => {
          const count = labeled.filter(d => d.chosen === cat.id).length;
          return (
            <div key={cat.id} className="neon-card" style={{
              flex: 1, textAlign: "center", padding: "16px 8px", borderRadius: 16,
              border: `2px solid ${cat.color}60`
            }}>
              <div style={{ fontSize: 28, textShadow: `0 0 10px ${cat.color}` }}>{cat.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginTop: 8 }}>{count}</div>
              <div style={{ fontSize: 10, color: cat.color, fontWeight: 800, letterSpacing: 1 }}>{cat.id.toUpperCase()}</div>
            </div>
          );
        })}
      </div>

      <div className="neon-card" style={{ textAlign: "center", padding: "40px 24px", marginBottom: 20 }}>
        {!trained && !isTraining && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16, filter: "drop-shadow(0 0 15px rgba(0,212,255,0.5))" }}>🤖</div>
            <p style={{ fontWeight: 900, color: "#fff", fontSize: 22, marginBottom: 8, letterSpacing: 1 }}>SISTEM AI SIAP</p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 32 }}>
              Jumlah Data: {labeled.length} | Akurasi Sumber: <strong style={{ color: accuracy >= 70 ? "#00FF41" : "#FFD700" }}>{accuracy}%</strong>
            </p>
            <button className="neon-btn" onClick={startTraining}>
              [ MULAI PELATIHAN ]
            </button>
          </>
        )}

        {isTraining && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16, filter: "drop-shadow(0 0 20px #FF0055)", animation: "neonPulse 0.8s infinite" }}>🧠</div>
            <p style={{ fontWeight: 900, color: "#fff", fontSize: 20, marginBottom: 20, letterSpacing: 1 }}>PELATIHAN BERLANGSUNG</p>
            <div style={{ marginBottom: 12 }}>
              <NeonProgressBar pct={progress} color="#FF0055" />
            </div>
            <p style={{ fontSize: 12, color: "#FF0055", fontWeight: 800, letterSpacing: 1 }}>{trainingPhase} {progress}%</p>
          </>
        )}

        {trained && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16, filter: "drop-shadow(0 0 15px #00FF41)" }}>✅</div>
            <p style={{ fontWeight: 900, color: "#fff", fontSize: 22, marginBottom: 8, letterSpacing: 1 }}>PELATIHAN SELESAI</p>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 32 }}>
              Perkiraan Akurasi Model: <strong style={{ color: accuracy >= 70 ? "#00FF41" : "#FFD700", fontSize: 18 }}>{accuracy}%</strong>
            </p>
            <button className="neon-btn" onClick={onComplete} style={{ borderColor: "#00FF41", color: "#00FF41", boxShadow: "0 0 15px rgba(0,255,65,0.2), inset 0 0 8px rgba(0,255,65,0.2)" }}>
              [ MULAI PENGUJIAN ]
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
  const [isScanning, setIsScanning] = useState(false);
  const [revealed, setRevealed]   = useState(false);
  const [bonusScore, setBonusScore] = useState(0);

  const current = items[idx];
  const predCat = getCat(current.prediction);
  const trueCat = getCat(current.category);

  function startScan() {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (current.correct) setBonusScore(s => s + 15);
      setRevealed(true);
    }, 1500); // 1.5s scanning effect
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
      {/* Target Progress */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
        {items.map((_, i) => (
          <div key={i} style={{
            width: 30, height: 6, borderRadius: 3,
            background: i < idx ? (items[i].correct ? "#00FF41" : "#FF0055") : i === idx ? "#00D4FF" : "#334155",
            boxShadow: i <= idx ? `0 0 10px ${i < idx ? (items[i].correct ? "#00FF41" : "#FF0055") : "#00D4FF"}` : "none",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      <div className="neon-card" style={{ padding: "40px 20px", textAlign: "center", marginBottom: 24, position: "relative", overflow: "hidden" }}>
        {/* Scanner Line */}
        {isScanning && <div className="laser-line" />}
        
        <div style={{ position: "relative", display: "inline-block", padding: "20px", border: "2px dashed #475569", borderRadius: 20, marginBottom: 20 }}>
           <div style={{ fontSize: 80, lineHeight: 1, filter: isScanning ? "drop-shadow(0 0 20px #00FF41) contrast(1.5)" : "drop-shadow(0 0 10px rgba(255,255,255,0.2))", transition: "all 0.3s" }}>
             {current.icon}
           </div>
        </div>
        
        <p style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", color: "#fff", letterSpacing: 1 }}>{current.name}</p>
        <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: 1, marginBottom: 30 }}>TARGET TIDAK DIKETAHUI</p>

        {!revealed && !isScanning && (
          <button className="neon-btn" onClick={startScan}>
            [ MULAI PEMINDAIAN AI ]
          </button>
        )}

        {isScanning && (
          <div style={{ padding: "16px", color: "#00FF41", fontWeight: 800, letterSpacing: 2, textShadow: "0 0 10px #00FF41", animation: "pulseSoft 0.5s infinite" }}>
            MEMINDAI...
          </div>
        )}

        {revealed && (
          <div className="bounce-in" style={{
            padding: "24px", borderRadius: 16,
            background: "rgba(15,20,25,0.9)",
            border: `2px solid ${current.correct ? "#00FF41" : "#FF0055"}`,
            boxShadow: `0 0 20px ${current.correct ? "rgba(0,255,65,0.2)" : "rgba(255,0,85,0.2)"}`,
          }}>
            <p style={{ fontSize: 12, margin: "0 0 8px", color: "#94a3b8", fontWeight: 800, letterSpacing: 1 }}>KLASIFIKASI AI:</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 32, textShadow: `0 0 15px ${predCat.color}` }}>{predCat.icon}</span>
              <span style={{ fontSize: 24, fontWeight: 900, color: predCat.color, textShadow: `0 0 10px ${predCat.color}80` }}>{predCat.label.toUpperCase()}</span>
            </div>
            
            {current.correct ? (
              <div style={{ color: "#00FF41", fontWeight: 900, fontSize: 14, letterSpacing: 1, background: "rgba(0,255,65,0.1)", padding: "8px", borderRadius: 8 }}>COCOK // BONUS +15</div>
            ) : (
              <div style={{ color: "#FF0055", fontWeight: 800, fontSize: 13, letterSpacing: 0.5, background: "rgba(255,0,85,0.1)", padding: "8px", borderRadius: 8 }}>
                GAGAL // SEHARUSNYA: {trueCat.icon} {trueCat.label.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {revealed && (
        <button className="neon-btn" onClick={next} style={{ width: "100%" }}>
          {idx + 1 < items.length ? "[ TARGET BERIKUTNYA ]" : "[ LIHAT HASIL ]"}
        </button>
      )}
    </div>
  );
}

// ─── Stage 4: Results ─────────────────────────────────────────────────────────

function ResultsStage({ results, totalScore, onReplay }: { results: PredictionItem[]; totalScore: number; onReplay: () => void }) {
  const accuracy = Math.round(results.filter(r => r.correct).length / results.length * 100);
  const color = accuracy >= 80 ? "#00D4FF" : accuracy >= 60 ? "#00FF41" : "#FFD700";

  return (
    <div className="fade-up">
      <div className="neon-card" style={{ textAlign: "center", padding: "40px 24px", marginBottom: 24, borderColor: color, boxShadow: `0 0 30px ${color}40, inset 0 0 15px ${color}20` }}>
        <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 800, letterSpacing: 2, margin: "0 0 8px" }}>TINGKAT AKURASI AI</p>
        <p style={{ fontSize: 64, fontWeight: 900, color: "#fff", margin: "0 0 24px", lineHeight: 1, textShadow: `0 0 20px ${color}` }}>{accuracy}%</p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
          {results.map((r, i) => (
            <div key={i} style={{
              width: 44, height: 44, borderRadius: 12, fontSize: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(15,20,25,0.8)",
              border: `2px solid ${r.correct ? "#00FF41" : "#FF0055"}`,
              boxShadow: `0 0 10px ${r.correct ? "rgba(0,255,65,0.3)" : "rgba(255,0,85,0.3)"}`
            }}>
              {r.icon}
            </div>
          ))}
        </div>

        <div style={{ padding: "20px", borderTop: "2px dashed #334155" }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", letterSpacing: 1, margin: "0 0 8px" }}>TOTAL SKOR SISTEM</p>
          <p style={{ fontSize: 42, fontWeight: 900, color: "#00D4FF", margin: 0, textShadow: "0 0 15px rgba(0,212,255,0.6)" }}>{totalScore}</p>
        </div>
      </div>

      <button className="neon-btn" onClick={onReplay} style={{ width: "100%", borderColor: "#FF0055", color: "#FF0055", boxShadow: "0 0 15px rgba(255,0,85,0.3), inset 0 0 8px rgba(255,0,85,0.2)" }}>
        [ MUAT ULANG SISTEM ]
      </button>
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
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "1.5rem" }}>
      <style>{GAME_CSS}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 4px", color: "#fff", letterSpacing: 1, textShadow: "0 0 10px #00D4FF" }}>
            [ OS_PILAH_SAMPAH ]
          </h1>
          <p style={{ fontSize: 12, color: "#00D4FF", fontWeight: 600, letterSpacing: 2, margin: 0 }}>EDISI NEON V1.0</p>
        </div>
        <div style={{ fontSize: 24, filter: "drop-shadow(0 0 8px #00D4FF)" }}>🤖</div>
      </div>

      <StepIndicator step={stage} />

      {stage === 1 && <LabelingStage onComplete={handleLabelingDone} />}
      {stage === 2 && <TrainingStage labeled={labeled} score={labelScore} onComplete={handleTrainingDone} />}
      {stage === 3 && <TestingStage accuracy={accuracy} onFinish={handleTestingDone} />}
      {stage === 4 && <ResultsStage results={testResults} totalScore={labelScore + testScore} onReplay={handleReplay} />}
    </div>
  );
}
