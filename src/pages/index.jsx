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
    description: "საწვავზე აქციზის გადასახადის 2023 წლის დონეზე დაბრუნება. ბოლო 18 თვეში ფასი 47%-ით გაიზარდა.",
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
    description: "2024 წლის ივლისის ცვლილებებით ჯარიმები 3–8-ჯერ გაიზარდა.",
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
    description: "სარკინიგზო ინფრასტრუქტურის ტექნიკური მდგომარეობის დეტალური ანგარიში.",
    category: "ინფრასტრუქტურა",
    votes: 4100,
    limit: 5000,
    against: 98,
    status: "numbered",
    date: "2025-01-15",
    region: "დასავლეთ საქართველო",
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
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      padding: "3px 8px",
      borderRadius: 4,
      color: statusColor[status],
      background: `${statusColor[status]}20`,
      fontFamily: "'IBM Plex Mono', monospace"
    }}>
      {step?.label}
    </span>
  );
}

function InitiativeCard({ item, onVote, onSelect }) {
  const [voted, setVoted] = useState(null);
  const [localVotes, setLocalVotes] = useState(item.votes);
  
  const handleVote = (type) => {
    if (voted) return;
    setVoted(type);
    if (type === "up") {
      setLocalVotes(v => v + 1);
    }
    onVote(item.id, type);
  };
  
  const pct = Math.min((localVotes / item.limit) * 100, 100);
  
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,26,46,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
      onClick={() => onSelect(item)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "'IBM Plex Mono', monospace", background: "#f3f4f6", padding: "2px 7px", borderRadius: 4 }}>
            {item.id}
          </span>
          <StatusBadge status={item.status} />
        </div>
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
        <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleVote("up")}
            disabled={!!voted}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 14px",
              borderRadius: 8,
              border: "none",
              background: voted === "up" ? "#1a1a2e" : "#f3f4f6",
              color: voted === "up" ? "#fff" : "#374151",
              cursor: voted ? "default" : "pointer",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            👍 <span style={{ fontSize: 12 }}>{localVotes.toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [initiatives] = useState(MOCK_INITIATIVES);
  const [activeCategory, setActiveCategory] = useState("ყველა");
  const [selected, setSelected] = useState(null);
  const [votes, setVotes] = useState({});
  
  const handleVote = (id, type) => {
    setVotes(v => ({ ...v, [id]: type }));
  };
  
  const filtered = initiatives.filter(i => {
    const catMatch = activeCategory === "ყველა" || i.category === activeCategory;
    return catMatch;
  });
  
  const stats = {
    total: initiatives.length,
    totalVotes: initiatives.reduce((a, b) => a + b.votes, 0),
  };
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Georgian:wght@400;700;800&family=Noto+Sans+Georgian:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f0f2f5; font-family: 'Noto Sans Georgian', sans-serif; }
      `}</style>
      
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#1a1a2e",
        color: "#fff",
        padding: "0 20px",
        boxShadow: "0 2px 20px rgba(0,0,0,0.2)"
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #e8a020, #ef4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              📜
            </div>
            <div>
              <div style={{ fontFamily: "'Noto Serif Georgian', serif", fontWeight: 800, fontSize: 15 }}>
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
      
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 }}>
          {filtered.length} ინიციატივა
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
        </div>
      </main>
    </>
  );
}
