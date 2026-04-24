import { useState, useEffect } from "react";

const CATEGORIES = ["ყველა", "ეკონომიკა", "ინფრასტრუქტურა", "სოციალური", "კანონმდებლობა", "გარემო"];

const STATUS_STEPS = [
  { id: "collecting", label: "ხმების კრება" },
  { id: "sent", label: "გაგზავნილია" },
  { id: "received", label: "მიღებულია" },
  { id: "numbered", label: "დარეგისტრირდა" },
  { id: "scheduled", label: "განხილვა დაინიშნა" },
  { id: "resolved", label: "გადაწყდა" },
];

const MOCK_INITIATIVES = [
  {
    id: "GEO-2025-001",
    title: "საწვავის გადასახადის გადახედვა",
    description: "საწვავზე აქციზის გადასახადის 2023 წლის დონეზე დაბრუნება. ბოლო 18 თვეში ფასი 47%-ით გაიზარდა, რაც პირდაპირ ზეგავლენას ახდენს ყველა სფეროზე — სოფლის მეურნეობიდან სატრანსპორტო ხარჯებამდე.",
    category: "ეკონომიკა",
    votes: 8420,
    limit: 10000,
    against: 312,
    status: "collecting",
    date: "2025-03-12",
    region: "საქართველო",
  },
  {
    id: "GEO-2025-002",
    title: "ადმინისტრაციული ჯარიმების კოდექსის გადახედვა",
    description: "2024 წლის ივლისის ცვლილებებით ჯარიმები 3–8-ჯერ გაიზარდა. ვითხოვთ ახსნა-განმარტებითი ნოტის გამოქვეყნებას და საჯარო კონსულტაციის პროცედურის გამართვას.",
    category: "კანონმდებლობა",
    votes: 12850,
    limit: 15000,
    against: 540,
    status: "sent",
    date: "2025-02-28",
    region: "საქართველო",
  },
  {
    id: "GEO-2025-003",
    title: "თბილისი — ბათუმი სარკინიგზო მიმართულება",
    description: "სარკინიგზო ინფრასტრუქტურის ტექნიკური მდგომარეობის დეტალური ანგარიშის გამოქვეყნება და 2026–2028 წლების სარემონტო გეგმის საჯაროდ წარდგენა.",
    category: "ინფრასტრუქტურა",
    votes: 4100,
    limit: 5000,
    against: 98,
    status: "numbered",
    date: "2025-01-15",
    region: "დასავლეთ საქართველო",
  },
  {
    id: "GEO-2025-004",
    title: "ფარმაცევტული ფასების მონიტორინგი",
    description: "სახელმწიფო ჯანდაცვის სამინისტრომ შექმნას ფარმაცევტული ბაზრის ფასების ყოველთვიური გამჭვირვალე მონიტორინგის სისტემა.",
    category: "სოციალური",
    votes: 6700,
    limit: 8000,
    against: 201,
    status: "collecting",
    date: "2025-03-20",
    region: "საქართველო",
  },
  {
    id: "GEO-2025-005",
    title: "მტკვრის აუზის დაბინძურება — კახეთი",
    description: "სამრეწველო ობიექტების მიერ მდინარე მტკვარში ნარჩენების ჩაშვების შემოწმება და ეკოლოგიური ექსპერტიზის ჩატარება კახეთის რეგიონში.",
    category: "გარემო",
    votes: 2890,
    limit: 5000,
    against: 67,
    status: "scheduled",
    date: "2025-02-05",
    region: "კახეთი",
  },
];

const statusColor = {
  collecting: "#e8a020",
  sent: "#3b82f6",
  received: "#8b5cf6",
  numbered: "#8b5cf6",
  scheduled: "#10b981",
  resolved: "#059669",
};

const statusBg = {
  collecting: "#fef3c7",
  sent: "#dbeafe",
  received: "#ede9fe",
  numbered: "#ede9fe",
  scheduled: "#d1fae5",
  resolved: "#a7f3d0",
};

function ProgressBar({ votes, limit }) {
  const pct = Math.min((votes / limit) * 100, 100);
  const color = pct >= 90 ? "#10b981" : pct >= 60 ? "#e8a020" : "#3b82f6";
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
        <span>{votes.toLocaleString("ka-GE")} ხმა</span>
        <span>ლიმიტი: {limit.toLocaleString("ka-GE")}</span>
      </div>
      <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <div style={{ fontSize: 10, color, marginTop: 3, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>
        {pct.toFixed(1)}% შესრულებული
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const step = STATUS_STEPS.find(s => s.id === status);
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 4,
      color: statusColor[status], background: statusBg[status],
      fontFamily: "'IBM Plex Mono', monospace"
    }}>
      {step?.label}
    </span>
  );
}

function StatusTracker({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.id === status);
  return (
    <div style={{ display: "flex", gap: 0, alignItems: "center", flexWrap: "wrap", rowGap: 8 }}>
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: done ? "#1a1a2e" : active ? statusColor[status] : "#e5e7eb",
                color: done || active ? "#fff" : "#9ca3af",
                fontSize: 11, fontWeight: 800, fontFamily: "'IBM Plex Mono', monospace",
                border: active ? `2px solid ${statusColor[status]}` : "2px solid transparent",
                boxShadow: active ? `0 0 0 3px ${statusBg[status]}` : "none",
                transition: "all 0.3s"
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 9, color: active ? statusColor[status] : done ? "#374151" : "#9ca3af", fontWeight: active ? 700 : 500, textAlign: "center", maxWidth: 52, lineHeight: 1.2 }}>
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ width: 20, height: 2, background: done ? "#1a1a2e" : "#e5e7eb", margin: "0 2px", marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InitiativeCard({ item, onVote, onSelect }) {
  const [voted, setVoted] = useState(null);
  const [localVotes, setLocalVotes] = useState(item.votes);
  const [pop, setPop] = useState(false);

  const handleVote = (type) => {
    if (voted) return;
    setVoted(type);
    if (type === "up") {
      setLocalVotes(v => v + 1);
      setPop(true);
      setTimeout(() => setPop(false), 400);
    }
    onVote(item.id, type);
  };

  const pct = Math.min((localVotes / item.limit) * 100, 100);
  const isHot = pct >= 85;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,26,46,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
      onClick={() => onSelect(item)}
    >
      {isHot && (
        <div style={{ position: "absolute", top: 0, right: 0, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "3px 10px", borderBottomLeftRadius: 8, letterSpacing: "0.1em", fontFamily: "'IBM Plex Mono', monospace" }}>
          🔥 ᲐᲮᲚᲝᲡ
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "'IBM Plex Mono', monospace", background: "#f3f4f6", padding: "2px 7px", borderRadius: 4 }}>
            {item.id}
          </span>
          <span style={{ fontSize: 10, color: "#374151", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
            {item.category}
          </span>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 700, color: "#111827", fontFamily: "'Noto Serif Georgian', Georgia, serif", lineHeight: 1.4 }}>
        {item.title}
      </h3>
      <p style={{ margin: "0 0 12px 0", fontSize: 12.5, color: "#6b7280", lineHeight: 1.6, fontFamily: "'Noto Sans Georgian', sans-serif" }}>
        {item.description.length > 120 ? item.description.slice(0, 120) + "…" : item.description}
      </p>

      <ProgressBar votes={localVotes} limit={item.limit} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono', monospace" }}>
          📍 {item.region} · {item.date}
        </span>
        <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleVote("up")}
            disabled={!!voted}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 8, border: "none",
              background: voted === "up" ? "#1a1a2e" : "#f3f4f6",
              color: voted === "up" ? "#fff" : "#374151",
              cursor: voted ? "default" : "pointer",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700,
              transform: pop ? "scale(1.15)" : "scale(1)",
              transition: "all 0.15s",
              opacity: voted && voted !== "up" ? 0.4 : 1,
            }}
          >
            👍 <span style={{ fontSize: 12 }}>{localVotes.toLocaleString()}</span>
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={!!voted}
            style={{
              padding: "6px 12px", borderRadius: 8, border: "none",
              background: voted === "down" ? "#fee2e2" : "#f3f4f6",
              cursor: voted ? "default" : "pointer",
              fontSize: 15,
              opacity: voted && voted !== "down" ? 0.4 : 1,
              transition: "all 0.15s",
            }}
            title="მხოლოდ შიდა სტატისტიკა"
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, onClose, onVote }) {
  const [voted, setVoted] = useState(null);
  const [localVotes, setLocalVotes] = useState(item.votes);

  const handleVote = (type) => {
    if (voted) return;
    setVoted(type);
    if (type === "up") setLocalVotes(v => v + 1);
    onVote(item.id, type);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", padding: "28px 28px 24px" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: "#6b7280", background: "#f3f4f6", padding: "2px 7px", borderRadius: 4 }}>{item.id}</span>
            <span style={{ fontSize: 10, color: "#374151", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>{item.category}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#9ca3af", lineHeight: 1 }}>✕</button>
        </div>

        <h2 style={{ margin: "0 0 12px 0", fontSize: 19, fontWeight: 800, color: "#111827", fontFamily: "'Noto Serif Georgian', Georgia, serif", lineHeight: 1.4 }}>
          {item.title}
        </h2>

        <p style={{ margin: "0 0 18px 0", fontSize: 13.5, color: "#374151", lineHeight: 1.7, fontFamily: "'Noto Sans Georgian', sans-serif" }}>
          {item.description}
        </p>

        <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em", marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
            პეტიციის სტატუსი
          </div>
          <StatusTracker status={item.status} />
        </div>

        <ProgressBar votes={localVotes} limit={item.limit} />

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button
            onClick={() => handleVote("up")}
            disabled={!!voted}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: voted === "up" ? "#1a1a2e" : "#f3f4f6",
              color: voted === "up" ? "#fff" : "#374151",
              cursor: voted ? "default" : "pointer",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700,
              transition: "all 0.15s",
              opacity: voted && voted !== "up" ? 0.5 : 1,
            }}
          >
            👍 მხარი დავუჭირო · {localVotes.toLocaleString()}
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={!!voted}
            style={{
              padding: "12px 16px", borderRadius: 10, border: "none",
              background: voted === "down" ? "#fee2e2" : "#f3f4f6",
              cursor: voted ? "default" : "pointer",
              fontSize: 18,
              opacity: voted && voted !== "down" ? 0.5 : 1,
              transition: "all 0.15s",
            }}
            title="შიდა სტატისტიკა"
          >
            👎
          </button>
        </div>

        {voted && (
          <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: 12, color: "#166534", fontFamily: "'Noto Sans Georgian', sans-serif", textAlign: "center" }}>
            ✓ თქვენი ხმა დაფიქსირდა
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 10, color: "#9ca3af", fontFamily: "'IBM Plex Mono', monospace", display: "flex", justifyContent: "space-between" }}>
          <span>📍 {item.region}</span>
          <span>📅 {item.date}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [initiatives, setInitiatives] = useState(MOCK_INITIATIVES);
  const [activeCategory, setActiveCategory] = useState("ყველა");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [votes, setVotes] = useState({});
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    let last = 0;
    const handler = () => {
      setHeaderVisible(window.scrollY < last || window.scrollY < 60);
      last = window.scrollY;
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleVote = (id, type) => {
    setVotes(v => ({ ...v, [id]: type }));
  };

  const filtered = initiatives.filter(i => {
    const catMatch = activeCategory === "ყველა" || i.category === activeCategory;
    const searchMatch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const stats = {
    total: initiatives.length,
    resolved: initiatives.filter(i => i.status === "resolved").length,
    totalVotes: initiatives.reduce((a, b) => a + b.votes, 0),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Georgian:wght@400;700;800&family=Noto+Sans+Georgian:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; font-family: 'Noto Sans Georgian', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "#1a1a2e", color: "#fff",
        padding: "0 20px",
        transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s",
        boxShadow: "0 2px 20px rgba(0,0,0,0.2)"
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #e8a020, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              📜
            </div>
            <div>
              <div style={{ fontFamily: "'Noto Serif Georgian', serif", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>
                მოქალაქე
              </div>
              <div style={{ fontSize: 9, color: "#9ca3af", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em" }}>
                MOKALAKE.GE
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>
            <span><span style={{ color: "#e8a020", fontWeight: 700 }}>{stats.total}</span> ინიციატივა</span>
            <span><span style={{ color: "#10b981", fontWeight: 700 }}>{stats.totalVotes.toLocaleString()}</span> ხმა</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: "#1a1a2e", padding: "28px 20px 32px", marginBottom: 0 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <p style={{ fontFamily: "'Noto Sans Georgian', sans-serif", fontSize: 12.5, color: "#6b7280", marginBottom: 14, lineHeight: 1.6 }}>
            კანონით გათვალისწინებული სამოქალაქო პეტიციების პლატფორმა. ხელი მოაწერე, თვალყური ადევნე, შეიტყვე.
          </p>
          {/* SEARCH */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, pointerEvents: "none" }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="მოძებნე ინიციატივა..."
              style={{
                width: "100%", padding: "11px 12px 11px 36px",
                borderRadius: 10, border: "1px solid #374151",
                background: "#111827", color: "#f9fafb",
                fontFamily: "'Noto Sans Georgian', sans-serif", fontSize: 13,
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div style={{ background: "#1a1a2e", borderBottom: "1px solid #374151", position: "sticky", top: 56, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px", display: "flex", gap: 4, overflowX: "auto", paddingBottom: 10, paddingTop: 10 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 14px", borderRadius: 20, border: "none", whiteSpace: "nowrap",
                background: activeCategory === cat ? "#e8a020" : "#111827",
                color: activeCategory === cat ? "#1a1a2e" : "#9ca3af",
                fontFamily: "'Noto Sans Georgian', sans-serif", fontSize: 11, fontWeight: activeCategory === cat ? 700 : 500,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
          {filtered.length} ინიციატივა · {activeCategory !== "ყველა" ? activeCategory : "ყველა კატეგორია"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(item => (
            <InitiativeCard
              key={item.id}
              item={item}
              onVote={handleVote}
              onSelect={setSelected}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", fontFamily: "'Noto Sans Georgian', sans-serif", fontSize: 13 }}>
              ინიციატივა ვერ მოიძებნა
            </div>
          )}
        </div>

        {/* INFO FOOTER */}
        <div style={{ marginTop: 40, padding: "18px 20px", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 8, letterSpacing: "0.05em" }}>
            ℹ️ როგორ მუშაობს
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.7, fontFamily: "'Noto Sans Georgian', sans-serif" }}>
            ყოველ პეტიციას აქვს ხმების ლიმიტი. ლიმიტის მიღწევისას, პეტიცია ავტომატურად გარდაიქმნება
            იურიდიული ძალის მქონე დოკუმენტად და ეგზავნება შესაბამის სახელმწიფო უწყებას.
            ყველა ეტაპი — გამჭვირვალე.
          </div>
        </div>
      </main>

      {/* MODAL */}
      {selected && (
        <DetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onVote={handleVote}
        />
      )}
    </>
  );
}
