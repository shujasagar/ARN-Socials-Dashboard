import { useState, useEffect, useRef } from "react";

const PLATFORMS = [
  { key: "youtube", label: "YouTube", icon: "▶", accent: "#FF3B30", bg: "rgba(255,59,48,0.08)" },
  { key: "facebook", label: "Facebook", icon: "f", accent: "#1877F2", bg: "rgba(24,119,242,0.07)" },
  { key: "linkedin", label: "LinkedIn", icon: "in", accent: "#0066FF", bg: "rgba(0,102,255,0.07)" },
  { key: "instagram", label: "Instagram", icon: "◎", accent: "#E1306C", bg: "rgba(225,48,108,0.07)" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CONTENT_TYPES = {
  youtube: ["Video", "Short", "Community Post", "Live"],
  facebook: ["Post", "Reel", "Story", "Live"],
  linkedin: ["Post", "Article", "Comment", "Share"],
  instagram: ["Reel", "Story", "Post", "Carousel"],
};

const INITIAL_DATA = () => {
  const data = {};
  PLATFORMS.forEach((p) => {
    data[p.key] = {};
    DAYS.forEach((d) => {
      data[p.key][d] = [];
    });
  });
  // seed some sample data
  data.youtube["Mon"] = ["Video"];
  data.youtube["Wed"] = ["Short", "Community Post"];
  data.youtube["Fri"] = ["Video"];
  data.facebook["Mon"] = ["Post", "Post"];
  data.facebook["Tue"] = ["Reel"];
  data.facebook["Wed"] = ["Post"];
  data.facebook["Thu"] = ["Post", "Story"];
  data.facebook["Fri"] = ["Post"];
  data.facebook["Sat"] = ["Live"];
  data.linkedin["Tue"] = ["Post"];
  data.linkedin["Thu"] = ["Article"];
  data.linkedin["Fri"] = ["Comment", "Share"];
  data.instagram["Mon"] = ["Reel"];
  data.instagram["Wed"] = ["Story", "Story", "Post"];
  data.instagram["Sat"] = ["Carousel"];
  data.instagram["Sun"] = ["Reel", "Story"];
  return data;
};

const WEEKLY_GOALS = {
  youtube: 4,
  facebook: 10,
  linkedin: 4,
  instagram: 5,
};

function AnimatedNumber({ value, delay = 0 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += Math.ceil(value / 12);
        if (start >= value) {
          setDisplay(value);
          return;
        }
        setDisplay(start);
        requestAnimationFrame(step);
      };
      step();
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return <span>{display}</span>;
}

function MiniBar({ current, goal, accent, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const pct = Math.min((current / goal) * 100, 100);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div style={{
      width: "100%", height: 6, borderRadius: 3,
      background: "var(--track)", overflow: "hidden",
    }}>
      <div style={{
        height: "100%", borderRadius: 3,
        width: `${width}%`,
        background: accent,
        transition: "width 0.9s cubic-bezier(0.22,1,0.36,1)",
      }} />
    </div>
  );
}

function HeatCell({ items, accent, onClick, isToday }) {
  const count = items.length;
  const opacity = count === 0 ? 0 : Math.min(0.2 + count * 0.2, 1);
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: 10,
        border: isToday ? `2px solid ${accent}` : "1.5px solid var(--border)",
        background: count > 0 ? accent : "var(--cell-empty)",
        opacity: count > 0 ? opacity : 1,
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: count > 0 ? "#fff" : "var(--muted)",
        transition: "all 0.2s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {count > 0 ? count : "·"}
    </button>
  );
}

function DropdownMenu({ types, onSelect, onClose, accent }) {
  return (
    <div style={{
      position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
      marginTop: 6, background: "var(--card)", border: "1.5px solid var(--border)",
      borderRadius: 12, padding: 6, zIndex: 100, minWidth: 140,
      boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
      animation: "dropIn 0.2s ease",
    }}>
      {types.map((t) => (
        <button key={t} onClick={() => { onSelect(t); onClose(); }} style={{
          display: "block", width: "100%", padding: "8px 14px",
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 500, color: "var(--text)",
          borderRadius: 8, textAlign: "left",
          transition: "background 0.15s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = accent + "18"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >{t}</button>
      ))}
      <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
      <button onClick={onClose} style={{
        display: "block", width: "100%", padding: "8px 14px",
        background: "transparent", border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: 500, color: "var(--muted)",
        borderRadius: 8, textAlign: "left",
      }}>Cancel</button>
    </div>
  );
}

function PlatformRow({ platform, data, goals, setData, setGoals, animDelay }) {
  const [openDay, setOpenDay] = useState(null);
  const [editGoal, setEditGoal] = useState(false);
  const [visible, setVisible] = useState(false);
  const total = DAYS.reduce((s, d) => s + data[d].length, 0);
  const goal = goals[platform.key];
  const pct = goal > 0 ? Math.round((total / goal) * 100) : 0;
  const todayIdx = new Date().getDay();
  const todayLabel = DAYS[(todayIdx + 6) % 7]; // JS Sunday=0 → shift

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), animDelay);
    return () => clearTimeout(t);
  }, [animDelay]);

  const addContent = (day, type) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[platform.key][day] = [...next[platform.key][day], type];
      return next;
    });
  };

  const removeLastFromDay = (day) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[platform.key][day] = next[platform.key][day].slice(0, -1);
      return next;
    });
  };

  return (
    <div style={{
      background: "var(--card)",
      borderRadius: 20,
      padding: "28px 30px",
      border: "1.5px solid var(--border)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.6s cubic-bezier(0.22,1,0.36,1)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: platform.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: platform.key === "twitter" ? 22 : 20,
            fontWeight: 800, color: platform.accent,
            fontFamily: platform.key === "linkedin" ? "'Instrument Serif', Georgia, serif" : "inherit",
            fontStyle: platform.key === "linkedin" ? "italic" : "normal",
          }}>
            {platform.icon}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
              {platform.label}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, fontWeight: 500 }}>
              {total} of{" "}
              {editGoal ? (
                <input
                  type="number"
                  min={1}
                  defaultValue={goal}
                  autoFocus
                  onBlur={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    setGoals((prev) => ({ ...prev, [platform.key]: v }));
                    setEditGoal(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.target.blur();
                  }}
                  style={{
                    width: 40, border: "none", borderBottom: `2px solid ${platform.accent}`,
                    background: "transparent", fontSize: 12, fontWeight: 700,
                    color: platform.accent, outline: "none", textAlign: "center",
                    fontFamily: "inherit",
                  }}
                />
              ) : (
                <span
                  onClick={() => setEditGoal(true)}
                  style={{ cursor: "pointer", borderBottom: "1px dashed var(--muted)", fontWeight: 600 }}
                  title="Click to edit goal"
                >
                  {goal} goal
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 32, fontWeight: 800, color: platform.accent,
              letterSpacing: "-0.04em", lineHeight: 1,
              fontFamily: "'Space Mono', 'DM Mono', monospace",
            }}>
              <AnimatedNumber value={pct} delay={animDelay + 200} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>%</span>
            </div>
          </div>
          {pct >= 100 && (
            <div style={{
              fontSize: 22, animation: "pulse 2s ease infinite",
            }}>✦</div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <MiniBar current={total} goal={goal} accent={platform.accent} delay={animDelay + 300} />

      {/* Heatmap row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        marginTop: 20, gap: 6,
      }}>
        {DAYS.map((day) => (
          <div key={day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: day === todayLabel ? platform.accent : "var(--muted)",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>{day}</span>
            <HeatCell
              items={data[day]}
              accent={platform.accent}
              isToday={day === todayLabel}
              onClick={() => setOpenDay(openDay === day ? null : day)}
            />
            {openDay === day && (
              <DropdownMenu
                types={CONTENT_TYPES[platform.key]}
                accent={platform.accent}
                onSelect={(type) => addContent(day, type)}
                onClose={() => setOpenDay(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 16, minHeight: 28 }}>
        {DAYS.flatMap((day) =>
          data[day].map((item, i) => (
            <span key={`${day}-${i}`}
              onClick={() => removeLastFromDay(day)}
              title={`${day} — click to remove`}
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px",
                borderRadius: 20, cursor: "pointer",
                background: platform.accent + "14",
                color: platform.accent,
                border: `1px solid ${platform.accent}30`,
                transition: "all 0.15s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = platform.accent + "28"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = platform.accent + "14"; }}
            >
              {item}
              <span style={{ marginLeft: 4, opacity: 0.5 }}>·{day}</span>
            </span>
          ))
        )}
        {total === 0 && (
          <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
            No content yet — click a day to add
          </span>
        )}
      </div>
    </div>
  );
}

export default function ContentDashboard() {
  const [data, setData] = useState(INITIAL_DATA);
  const [goals, setGoals] = useState({ ...WEEKLY_GOALS });
  const [theme, setTheme] = useState("dark");

  const totalPosts = PLATFORMS.reduce(
    (s, p) => s + DAYS.reduce((ss, d) => ss + data[p.key][d].length, 0), 0
  );
  const totalGoal = Object.values(goals).reduce((s, g) => s + g, 0);
  const overallPct = totalGoal > 0 ? Math.round((totalPosts / totalGoal) * 100) : 0;
  const activeDays = new Set(
    PLATFORMS.flatMap((p) => DAYS.filter((d) => data[p.key][d].length > 0))
  ).size;

  const resetWeek = () => {
    if (confirm("Reset all content for this week?")) {
      setData(INITIAL_DATA());
    }
  };

  const clearWeek = () => {
    if (confirm("Clear all entries?")) {
      const empty = {};
      PLATFORMS.forEach((p) => {
        empty[p.key] = {};
        DAYS.forEach((d) => { empty[p.key][d] = []; });
      });
      setData(empty);
    }
  };

  const light = {
    "--bg": "#F5F3EF",
    "--card": "#FFFFFF",
    "--border": "#E8E4DC",
    "--text": "#1A1A1A",
    "--muted": "#9A9488",
    "--track": "#EDE9E3",
    "--cell-empty": "#F8F6F2",
    "--subtle": "#F0ECE5",
  };

  const dark = {
    "--bg": "#0E0E12",
    "--card": "#18181F",
    "--border": "#2A2A35",
    "--text": "#F0EDE8",
    "--muted": "#6B6878",
    "--track": "#252530",
    "--cell-empty": "#1E1E28",
    "--subtle": "#14141A",
  };

  const vars = theme === "dark" ? dark : light;

  return (
    <div style={{
      ...vars,
      background: "var(--bg)",
      minHeight: "100vh",
      fontFamily: "'DM Sans', 'Satoshi', 'General Sans', -apple-system, sans-serif",
      color: "var(--text)",
      padding: "32px 24px 60px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800&family=Space+Mono:wght@400;700&family=Instrument+Serif:ital@1&display=swap');
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 36,
          animation: "fadeUp 0.5s ease",
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.14em", color: "var(--muted)", marginBottom: 6,
            }}>
              Weekly Content Tracker
            </div>
            <h1 style={{
              fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.1,
            }}>
              Week of {new Date(Date.now() - (new Date().getDay() - 1) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{
                padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--border)",
                background: "var(--card)", cursor: "pointer", fontSize: 14,
                color: "var(--text)", fontWeight: 600,
              }}
            >
              {theme === "dark" ? "☀" : "●"}
            </button>
            <button onClick={clearWeek} style={{
              padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--border)",
              background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: "var(--muted)",
            }}>
              Clear
            </button>
            <button onClick={resetWeek} style={{
              padding: "8px 14px", borderRadius: 10, border: "1.5px solid var(--border)",
              background: "var(--card)", cursor: "pointer", fontSize: 12, fontWeight: 600,
              color: "var(--muted)",
            }}>
              Reset Demo
            </button>
          </div>
        </div>

        {/* Summary strip */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12, marginBottom: 28,
          animation: "fadeUp 0.6s ease",
        }}>
          {[
            { label: "Total Posts", value: totalPosts, suffix: "" },
            { label: "Active Days", value: activeDays, suffix: "/7" },
            { label: "Overall", value: overallPct, suffix: "%" },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              background: "var(--card)", borderRadius: 16, padding: "20px 22px",
              border: "1.5px solid var(--border)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted)", marginBottom: 6 }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em",
                fontFamily: "'Space Mono', monospace",
              }}>
                <AnimatedNumber value={stat.value} delay={200 + i * 100} />
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--muted)" }}>{stat.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Platform rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PLATFORMS.map((platform, i) => (
            <PlatformRow
              key={platform.key}
              platform={platform}
              data={data[platform.key]}
              goals={goals}
              setData={setData}
              setGoals={setGoals}
              animDelay={300 + i * 120}
            />
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          textAlign: "center", marginTop: 32, fontSize: 12,
          color: "var(--muted)", fontWeight: 500,
          animation: "fadeUp 1.2s ease",
        }}>
          Click any day cell to log content · Click goal number to edit · Click a tag to remove it
        </div>
      </div>
    </div>
  );
}
