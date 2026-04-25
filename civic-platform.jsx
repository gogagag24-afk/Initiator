import { useState, useEffect } from "react";
import { colors, fonts, radii, spacing } from './lib/tokens';
import Card from './components/Card';
import Badge from './components/Badge';
import ProgressBar from './components/ProgressBar';

// ✅ FIX: წაშლილია სპეისები ID-ებიდან და ლეიბლებიდან
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
    description: "საწვავზე აქციზის გადასახადის 2023 წლის დონეზე დაბრუნება. ბოლო 18 თვეში ფასი 47%-ით გაიზარდა, რაც პირდაპირ ზეგავლენას ახდენს ყველა სფეროზე.",
    category: "ეკონომიკა",
    votes: 8420, limit: 10000, against: 312,
    status: "collecting", date: "2025-03-12", region: "საქართველო",
  },
  {
    id: "GEO-2025-002",
    title: "ადმინისტრაციული ჯარიმების კოდექსის გადახედვა",
    description: "2024 წლის ივლისის ცვლილებებით ჯარიმები 3–8-ჯერ გაიზარდა. ვითხოვთ ახსნა-განმარტებითი ნოტის გამოქვეყნებას.",
    category: "კანონმდებლობა",
    votes: 12850, limit: 15000, against: 540,
    status: "sent", date: "2025-02-28", region: "საქართველო",
  },
  {
    id: "GEO-2025-003",
    title: "თბილისი — ბათუმი სარკინიგზო მიმართულება",
    description: "სარკინიგზო ინფრასტრუქტურის ტექნიკური მდგომარეობის დეტალური ანგარიშის გამოქვეყნება.",
    category: "ინფრასტრუქტურა",
    votes: 4100, limit: 5000, against: 98,
    status: "numbered", date: "2025-01-15", region: "დასავლეთ საქართველო",
  },
  {
    id: "GEO-2025-004",
    title: "ფარმაცევტული ფასების მონიტორინგი",
    description: "სახელმწიფო ჯანდაცვის სამინისტრომ შექმნას ფარმაცევტული ბაზრის ფასების ყოველთვიური გამჭვირვალე მონიტორინგის სისტემა.",
    category: "სოციალური",
    votes: 6700, limit: 8000, against: 201,
    status: "collecting", date: "2025-03-20", region: "საქართველო",
  },
  {
    id: "GEO-2025-005",
    title: "მტკვრის აუზის დაბინძურება — კახეთი",
    description: "სამრეწველო ობიექტების მიერ მდინარე მტკვარში ნარჩენების ჩაშვების შემოწმება.",
    category: "გარემო",
    votes: 2890, limit: 5000, against: 67,
    status: "scheduled", date: "2025-02-05", region: "კახეთი",
  },
];

// ✅ StatusTracker კომპონენტი - Contributor-ის სტილში
function StatusTracker({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.id === status);
  
  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap', rowGap: 8 }}>
      {STATUS_STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? colors.bg.secondary : active ? colors.status[status] : colors.border.default,
                color: done || active ? colors.text.primary : colors.text.secondary,
                fontSize: 11, fontWeight: 800, fontFamily: fonts.mono,
                border: active ? `2px solid ${colors.status[status]}` : '2px solid transparent',
                boxShadow: active ? `0 0 0 3px ${colors.statusBg[status]}` : 'none',
                transition: transitions.normal,
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ 
                fontSize: 9, 
                color: active ? colors.status[status] : done ? colors.text.primary : colors.text.secondary, 
                fontWeight: active ? 700 : 500, 
                textAlign: 'center', 
                maxWidth: 52, 
                lineHeight: 1.2,
                fontFamily: fonts.mono 
              }}>
                {step.label}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ width: 20, height: 2, background: done ? colors.bg.secondary : colors.border.default, margin: '0 2px', marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ✅ InitiativeCard - გადაკეთებული Card კომპონენტით
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
    <Card onClick={() => onSelect(item)} style={{ position: 'relative', overflow: 'hidden' }}>
      {isHot && (
        <span style={{ 
          position: 'absolute', top: 0, right: 0, 
          background: colors.accent.red, color: '#fff', 
          fontSize: 9, fontWeight: 800, padding: '3px 10px', 
          borderBottomLeftRadius: radii.md, 
          letterSpacing: '0.1em', fontFamily: fonts.mono 
        }}>
          🔥 აქტიური
        </span>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md, gap: spacing.md }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: colors.text.secondary, fontFamily: fonts.mono, background: colors.bg.secondary, padding: '2px 7px', borderRadius: radii.sm }}>
            {item.id}
          </span>
          <span style={{ fontSize: 10, color: colors.text.primary, background: 'rgba(16,185,129,0.15)', border: `1px solid ${colors.status.scheduled}40`, padding: '2px 7px', borderRadius: radii.sm, fontWeight: 600 }}>
            {item.category}
          </span>
          <Badge status={item.status} />
        </div>
      </div>

      <h3 style={{ margin: '0 0 8px 0', fontSize: 15, fontWeight: 700, color: colors.text.primary, fontFamily: fonts.serif, lineHeight: 1.4 }}>
        {item.title}
      </h3>
      
      <p style={{ margin: '0 0 12px 0', fontSize: 12.5, color: colors.text.secondary, lineHeight: 1.6, fontFamily: fonts.georgian }}>
        {item.description.length > 120 ? item.description.slice(0, 120) + '…' : item.description}
      </p>

      <ProgressBar votes={localVotes} limit={item.limit} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.lg }}>
        <span style={{ fontSize: 10, color: colors.text.muted, fontFamily: fonts.mono }}>
          📍 {item.region} · {item.date}
        </span>
        <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => handleVote("up")}
            disabled={!!voted}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: radii.md, border: 'none',
              background: voted === "up" ? colors.bg.secondary : colors.bg.hover,
              color: voted === "up" ? colors.text.primary : colors.text.secondary,
              cursor: voted ? 'default' : 'pointer',
              fontFamily: fonts.mono, fontSize: 13, fontWeight: 700,
              transform: pop ? 'scale(1.15)' : 'scale(1)',
              transition: transitions.fast,
              opacity: voted && voted !== "up" ? 0.4 : 1,
            }}
          >
            👍 <span style={{ fontSize: 12 }}>{localVotes.toLocaleString()}</span>
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={!!voted}
            style={{
              padding: '6px 12px', borderRadius: radii.md, border: 'none',
              background: voted === "down" ? 'rgba(239,68,68,0.15)' : colors.bg.hover,
              cursor: voted ? 'default' : 'pointer',
              fontSize: 15,
              opacity: voted && voted !== "down" ? 0.4 : 1,
              transition: transitions.fast,
              color: colors.text.secondary,
            }}
            title="შიდა სტატისტიკა"
          >
            👎
          </button>
        </div>
      </div>
    </Card>
  );
}

// ✅ DetailModal - გადაკეთებული dark theme-ზე
function DetailModal({ item, onClose, onVote }) {
  const [voted, setVoted] = useState(null);
  const [localVotes, setLocalVotes] = useState(item.votes);

  const handleVote = (type) => {
    if (voted) return;
    setVoted(type);
    if (type === "up") setLocalVotes(v => v + 1);
    onVote(item.id, type);
  };

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: colors.bg.card, borderRadius: radii.xl, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', padding: `${spacing['2xl']}px ${spacing['2xl']}px ${spacing.xl}px`, border: `1px solid ${colors.border.default}` }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontFamily: fonts.mono, color: colors.text.secondary, background: colors.bg.secondary, padding: '2px 7px', borderRadius: radii.sm }}>{item.id}</span>
            <span style={{ fontSize: 10, color: colors.text.primary, background: 'rgba(16,185,129,0.15)', border: `1px solid ${colors.status.scheduled}40`, padding: '2px 7px', borderRadius: radii.sm, fontWeight: 600 }}>{item.category}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: colors.text.secondary, lineHeight: 1 }}>✕</button>
        </div>

        <h2 style={{ margin: '0 0 12px 0', fontSize: 19, fontWeight: 800, color: colors.text.primary, fontFamily: fonts.serif, lineHeight: 1.4 }}>{item.title}</h2>
        <p style={{ margin: '0 0 18px 0', fontSize: 13.5, color: colors.text.secondary, lineHeight: 1.7, fontFamily: fonts.georgian }}>{item.description}</p>

        <div style={{ background: colors.bg.secondary, borderRadius: radii.md, padding: `${spacing.lg}px ${spacing.xl}px`, marginBottom: spacing.xl }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.text.muted, letterSpacing: '0.08em', marginBottom: 10, fontFamily: fonts.mono }}>პეტიციის სტატუსი</div>
          <StatusTracker status={item.status} />
        </div>

        <ProgressBar votes={localVotes} limit={item.limit} />

        <div style={{ display: 'flex', gap: 10, marginTop: spacing.xl }}>
          <button
            onClick={() => handleVote("up")}
            disabled={!!voted}
            style={{
              flex: 1, padding: '12px', borderRadius: radii.md, border: 'none',
              background: voted === "up" ? colors.bg.secondary : colors.bg.hover,
              color: voted === "up" ? colors.text.primary : colors.text.secondary,
              cursor: voted ? 'default' : 'pointer',
              fontFamily: fonts.mono, fontSize: 14, fontWeight: 700,
              transition: transitions.fast,
              opacity: voted && voted !== "up" ? 0.5 : 1,
            }}
          >
            👍 მხარი დავუჭირო · {localVotes.toLocaleString()}
          </button>
          <button
            onClick={() => handleVote("down")}
            disabled={!!voted}
            style={{
              padding: '12px 16px', borderRadius: radii.md, border: 'none',
              background: voted === "down" ? 'rgba(239,68,68,0.15)' : colors.bg.hover,
              cursor: voted ? 'default' : 'pointer',
              fontSize: 18,
              opacity: voted && voted !== "down" ? 0.5 : 1,
              transition: transitions.fast,
              color: colors.text.secondary,
            }}
            title="შიდა სტატისტიკა"
          >
            👎
          </button>
        </div>

        {voted && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: radii.md, background: 'rgba(16,185,129,0.12)', border: `1px solid ${colors.status.scheduled}40`, fontSize: 12, color: colors.status.scheduled, fontFamily: fonts.georgian, textAlign: 'center' }}>
            ✓ თქვენი ხმა დაფიქსირდა
          </div>
        )}

        <div style={{ marginTop: spacing.xl, fontSize: 10, color: colors.text.muted, fontFamily: fonts.mono, display: 'flex', justifyContent: 'space-between' }}>
          <span>📍 {item.region}</span>
          <span>📅 {item.date}</span>
        </div>
      </div>
    </div>
  );
}

// ✅ მთავარი App კომპონენტი - გადაკეთებული
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
      {/* ✅ CSS - შესწორებული სინტაქსი */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Georgian:wght@400;700;800&family=Noto+Sans+Georgian:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${colors.bg.primary}; font-family: ${fonts.georgian}; color: ${colors.text.primary}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${colors.border.default}; border-radius: 2px; }
      `}</style>

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: colors.bg.secondary, color: colors.text.primary,
        padding: '0 20px',
        transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        borderBottom: `1px solid ${colors.border.default}`,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: radii.md, background: `linear-gradient(135deg, ${colors.accent.gold}, ${colors.accent.red})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📜</div>
            <div>
              <div style={{ fontFamily: fonts.serif, fontWeight: 800, fontSize: 15, letterSpacing: '-0.01em' }}>მოქალაქე</div>
              <div style={{ fontSize: 9, color: colors.text.muted, fontFamily: fonts.mono, letterSpacing: '0.1em' }}>MOKALAKE.GE</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 11, fontFamily: fonts.mono, color: colors.text.muted }}>
            <span><span style={{ color: colors.accent.gold, fontWeight: 700 }}>{stats.total}</span> ინიციატივა</span>
            <span><span style={{ color: colors.status.scheduled, fontWeight: 700 }}>{stats.totalVotes.toLocaleString()}</span> ხმა</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: colors.bg.secondary, padding: '28px 20px 32px', marginBottom: 0, borderBottom: `1px solid ${colors.border.default}` }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ fontFamily: fonts.georgian, fontSize: 12.5, color: colors.text.muted, marginBottom: 14, lineHeight: 1.6 }}>
            კანონით გათვალისწინებული სამოქალაქო პეტიციების პლატფორმა. ხელი მოაწერე, თვალყური ადევნე, შეიტყვე.
          </p>
          {/* SEARCH */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="მოძებნე ინიციატივა..."
              style={{
                width: '100%', padding: '11px 12px 11px 36px',
                borderRadius: radii.md, border: `1px solid ${colors.border.default}`,
                background: colors.bg.primary, color: colors.text.primary,
                fontFamily: fonts.georgian, fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div style={{ background: colors.bg.secondary, borderBottom: `1px solid ${colors.border.default}`, position: 'sticky', top: 56, zIndex: 40 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 10, paddingTop: 10 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap',
                background: activeCategory === cat ? colors.accent.gold : colors.bg.primary,
                color: activeCategory === cat ? colors.bg.secondary : colors.text.muted,
                fontFamily: fonts.georgian, fontSize: 11, fontWeight: activeCategory === cat ? 700 : 500,
                cursor: 'pointer', transition: transitions.fast,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 60px' }}>
        <div style={{ fontSize: 11, color: colors.text.muted, fontFamily: fonts.mono, marginBottom: 14 }}>
          {filtered.length} ინიციატივა · {activeCategory !== "ყველა" ? activeCategory : "ყველა კატეგორია"}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(item => (
            <InitiativeCard key={item.id} item={item} onVote={handleVote} onSelect={setSelected} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: colors.text.muted, fontFamily: fonts.georgian, fontSize: 13 }}>
              ინიციატივა ვერ მოიძებნა
            </div>
          )}
        </div>

        {/* INFO FOOTER */}
        <div style={{ marginTop: 40, padding: '18px 20px', background: colors.bg.card, borderRadius: radii.lg, border: `1px solid ${colors.border.default}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: colors.text.secondary, fontFamily: fonts.mono, marginBottom: 8, letterSpacing: '0.05em' }}>ℹ️ როგორ მუშაობს</div>
          <div style={{ fontSize: 12, color: colors.text.muted, lineHeight: 1.7, fontFamily: fonts.georgian }}>
            ყოველ პეტიციას აქვს ხმების ლიმიტი. ლიმიტის მიღწევისას, პეტიცია ავტომატურად გარდაიქმნება იურიდიული ძალის მქონე დოკუმენტად და ეგზავნება შესაბამის სახელმწიფო უწყებას. ყველა ეტაპი — გამჭვირვალე.
          </div>
        </div>
      </main>

      {/* MODAL */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} onVote={handleVote} />
      )}
    </>
  );
}
