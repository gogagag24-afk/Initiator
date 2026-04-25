import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const ADMIN_PASSWORD = "admin123";
const INITIATIVES_STORAGE_KEY = "initiator.initiatives";
const VOTES_STORAGE_KEY = "initiator.votes";
const ADMIN_SESSION_KEY = "initiator.admin";

const CATEGORIES = ["ყველა", "ეკონომიკა", "ინფრასტრუქტურა", "სოციალური", "კანონმდებლობა", "გარემო"];

const STATUS_STEPS = [
  { id: "collecting", label: "ხმების კრება" },
  { id: "sent", label: "გაგზავნილია" },
  { id: "received", label: "მიღებულია" },
  { id: "numbered", label: "დარეგისტრირდა" },
  { id: "scheduled", label: "განხილვა დაინიშნა" },
  { id: "resolved", label: "გადაწყდა" },
];

const SEED_INITIATIVES = [
  {
    id: "GEO-2025-001",
    title: "საწვავის გადასახადის გადახედვა",
    description:
      "საწვავზე აქციზის გადასახადის 2023 წლის დონეზე დაბრუნება. ბოლო 18 თვეში ფასი 47%-ით გაიზარდა, რაც პირდაპირ ზეგავლენას ახდენს ყველა სფეროზე — სოფლის მეურნეობიდან სატრანსპორტო ხარჯებამდე.",
    category: "ეკონომიკა",
    votes: 8420,
    limit: 10000,
    against: 312,
    status: "collecting",
    date: "2025-03-12",
    region: "საქართველო",
    source: "seed",
  },
  {
    id: "GEO-2025-002",
    title: "ადმინისტრაციული ჯარიმების კოდექსის გადახედვა",
    description:
      "2024 წლის ივლისის ცვლილებებით ჯარიმები 3–8-ჯერ გაიზარდა. ვითხოვთ ახსნა-განმარტებითი ნოტის გამოქვეყნებას და საჯარო კონსულტაციის პროცედურის გამართვას.",
    category: "კანონმდებლობა",
    votes: 12850,
    limit: 15000,
    against: 540,
    status: "sent",
    date: "2025-02-28",
    region: "საქართველო",
    source: "seed",
  },
  {
    id: "GEO-2025-003",
    title: "თბილისი — ბათუმი სარკინიგზო მიმართულება",
    description:
      "სარკინიგზო ინფრასტრუქტურის ტექნიკური მდგომარეობის დეტალური ანგარიშის გამოქვეყნება და 2026–2028 წლების სარემონტო გეგმის საჯაროდ წარდგენა.",
    category: "ინფრასტრუქტურა",
    votes: 4100,
    limit: 5000,
    against: 98,
    status: "numbered",
    date: "2025-01-15",
    region: "დასავლეთ საქართველო",
    source: "seed",
  },
  {
    id: "GEO-2025-004",
    title: "ფარმაცევტული ფასების მონიტორინგი",
    description:
      "სახელმწიფო ჯანდაცვის სამინისტრომ შექმნას ფარმაცევტული ბაზრის ფასების ყოველთვიური გამჭვირვალე მონიტორინგის სისტემა.",
    category: "სოციალური",
    votes: 6700,
    limit: 8000,
    against: 201,
    status: "collecting",
    date: "2025-03-20",
    region: "საქართველო",
    source: "seed",
  },
  {
    id: "GEO-2025-005",
    title: "მტკვრის აუზის დაბინძურება — კახეთი",
    description:
      "სამრეწველო ობიექტების მიერ მდინარე მტკვარში ნარჩენების ჩაშვების შემოწმება და ეკოლოგიური ექსპერტიზის ჩატარება კახეთის რეგიონში.",
    category: "გარემო",
    votes: 2890,
    limit: 5000,
    against: 67,
    status: "scheduled",
    date: "2025-02-05",
    region: "კახეთი",
    source: "seed",
  },
];

const STATUS_META = {
  collecting: { tone: "amber", label: "კრება აქტიურია" },
  sent: { tone: "blue", label: "უწყებაში გაიგზავნა" },
  received: { tone: "violet", label: "ოფიციალურად მიღებულია" },
  numbered: { tone: "violet", label: "რეგისტრაციის ეტაპი" },
  scheduled: { tone: "emerald", label: "განხილვა დაინიშნა" },
  resolved: { tone: "emerald", label: "პროცესი დასრულდა" },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "ეკონომიკა",
  limit: "10000",
  region: "საქართველო",
  status: "collecting",
};

function readLocalJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function formatVotes(value) {
  return value.toLocaleString("ka-GE");
}

function getProgress(item, voteState) {
  const votes = item.votes + (voteState === "up" ? 1 : 0);
  const progress = Math.min((votes / item.limit) * 100, 100);
  return { votes, progress };
}

function usePersistentInitiatives() {
  const [initiatives, setInitiatives] = useState(() => {
    if (typeof window === "undefined") return SEED_INITIATIVES;
    return readLocalJson(INITIATIVES_STORAGE_KEY, SEED_INITIATIVES);
  });

  useEffect(() => {
    window.localStorage.setItem(INITIATIVES_STORAGE_KEY, JSON.stringify(initiatives));
  }, [initiatives]);

  return [initiatives, setInitiatives];
}

function usePersistentVotes() {
  const [votes, setVotes] = useState(() => {
    if (typeof window === "undefined") return {};
    return readLocalJson(VOTES_STORAGE_KEY, {});
  });

  useEffect(() => {
    window.localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  }, [votes]);

  return [votes, setVotes];
}

function StatusPill({ status }) {
  const meta = STATUS_META[status];
  const step = STATUS_STEPS.find((item) => item.id === status);

  return (
    <span className={`status-pill status-pill--${meta.tone}`}>
      <span className="status-pill__dot" />
      {step?.label ?? meta.label}
    </span>
  );
}

function ProgressMeter({ item, voteState }) {
  const { votes, progress } = getProgress(item, voteState);

  return (
    <div className="progress-block">
      <div className="progress-block__meta">
        <span>{formatVotes(votes)} მხარდამჭერი</span>
        <span>{item.limit.toLocaleString("ka-GE")} მიზანი</span>
      </div>
      <div className="progress-block__track">
        <div className="progress-block__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-block__footer">
        <span>{progress.toFixed(1)}% შესრულებული</span>
        <span>{formatVotes(item.against)} წინააღმდეგი</span>
      </div>
    </div>
  );
}

function StageRail({ status }) {
  const currentIndex = STATUS_STEPS.findIndex((step) => step.id === status);

  return (
    <div className="stage-rail">
      {STATUS_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;

        return (
          <div key={step.id} className="stage-rail__item">
            <div className={`stage-rail__node ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
              {done ? "✓" : index + 1}
            </div>
            <span className={`stage-rail__label ${active ? "is-active" : ""}`}>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function InitiativeCard({ item, voteState, onVote, onOpen, highlighted }) {
  const { votes, progress } = getProgress(item, voteState);

  return (
    <article className="board-card" onClick={() => onOpen(item)}>
      <div className="board-card__glow" />
      <div className="board-card__topline">
        <div className="board-card__tags">
          <span className="mono-chip">{item.id}</span>
          <span className="soft-chip">{item.category}</span>
          {item.source === "admin" && <span className="admin-chip">ადმინის მიერ შექმნილი</span>}
        </div>
        <StatusPill status={item.status} />
      </div>

      <div className="board-card__headline">
        <div>
          <p className="eyebrow">საჯარო ინიციატივა</p>
          <h3>{item.title}</h3>
        </div>
        <div className="board-card__percent">
          <strong>{progress.toFixed(0)}%</strong>
          <span>მიზანთან ახლოს</span>
        </div>
      </div>

      <p className="board-card__description">{item.description}</p>

      <ProgressMeter item={item} voteState={voteState} />

      <div className="board-card__footer">
        <div className="board-card__meta">
          <span>📍 {item.region}</span>
          <span>📅 {item.date}</span>
        </div>

        <div className="vote-actions" onClick={(event) => event.stopPropagation()}>
          <button
            className={`vote-button vote-button--up ${voteState === "up" ? "is-active" : ""} ${highlighted ? "is-popped" : ""}`}
            disabled={Boolean(voteState)}
            onClick={() => onVote(item.id, "up")}
          >
            👍 {formatVotes(votes)}
          </button>
          <button
            className={`vote-button vote-button--down ${voteState === "down" ? "is-active" : ""}`}
            disabled={Boolean(voteState)}
            onClick={() => onVote(item.id, "down")}
          >
            👎
          </button>
        </div>
      </div>
    </article>
  );
}

function DetailModal({ item, voteState, onVote, onClose }) {
  const { votes, progress } = getProgress(item, voteState);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="modal-sheet__header">
          <div>
            <div className="board-card__tags">
              <span className="mono-chip">{item.id}</span>
              <span className="soft-chip">{item.category}</span>
              {item.source === "admin" && <span className="admin-chip">ადმინის ინიციატივა</span>}
            </div>
            <h2>{item.title}</h2>
          </div>
          <button className="ghost-button" onClick={onClose}>
            დახურვა
          </button>
        </div>

        <div className="modal-sheet__grid">
          <section className="modal-panel">
            <p className="eyebrow">შინაარსი</p>
            <p className="modal-copy">{item.description}</p>
            <ProgressMeter item={item} voteState={voteState} />
          </section>

          <section className="modal-panel">
            <p className="eyebrow">მოძრაობის გზა</p>
            <StageRail status={item.status} />

            <div className="modal-stats">
              <div>
                <span>მხარდაჭერა</span>
                <strong>{formatVotes(votes)}</strong>
              </div>
              <div>
                <span>წინააღმდეგი</span>
                <strong>{formatVotes(item.against)}</strong>
              </div>
              <div>
                <span>პროგრესი</span>
                <strong>{progress.toFixed(1)}%</strong>
              </div>
            </div>

            <div className="modal-votes">
              <button className={`vote-button vote-button--up ${voteState === "up" ? "is-active" : ""}`} disabled={Boolean(voteState)} onClick={() => onVote(item.id, "up")}>
                👍 მხარი დავუჭირო
              </button>
              <button className={`vote-button vote-button--down ${voteState === "down" ? "is-active" : ""}`} disabled={Boolean(voteState)} onClick={() => onVote(item.id, "down")}>
                👎
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PublicBoard({ initiatives, votes, onVote }) {
  const [activeCategory, setActiveCategory] = useState("ყველა");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [poppedId, setPoppedId] = useState(null);

  const filtered = useMemo(() => {
    return initiatives.filter((item) => {
      const categoryMatch = activeCategory === "ყველა" || item.category === activeCategory;
      const needle = search.trim().toLowerCase();
      const searchMatch =
        !needle ||
        item.title.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.region.toLowerCase().includes(needle);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, initiatives, search]);

  const totals = useMemo(() => {
    const totalVotes = initiatives.reduce((sum, item) => sum + item.votes + (votes[item.id] === "up" ? 1 : 0), 0);
    const activeCount = initiatives.filter((item) => item.status === "collecting").length;
    const closeToGoal = initiatives.filter((item) => getProgress(item, votes[item.id]).progress >= 75).length;

    return {
      totalVotes,
      activeCount,
      closeToGoal,
      total: initiatives.length,
    };
  }, [initiatives, votes]);

  const urgentItems = useMemo(() => {
    return [...initiatives]
      .map((item) => ({ ...item, progress: getProgress(item, votes[item.id]).progress }))
      .sort((left, right) => right.progress - left.progress)
      .slice(0, 3);
  }, [initiatives, votes]);

  const handleVote = (id, type) => {
    onVote(id, type);

    if (type === "up") {
      setPoppedId(id);
      window.setTimeout(() => setPoppedId(null), 280);
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <div className="ambient ambient--three" />

      <div className="page-frame">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-lockup__mark">მ</div>
            <div>
              <p className="eyebrow">Civic Board</p>
              <h1>მოქალაქე</h1>
            </div>
          </div>

          <div className="topbar__stats">
            <span>{totals.total} ინიციატივა</span>
            <span>{formatVotes(totals.totalVotes)} ხმა</span>
            <a className="primary-button primary-button--link" href="/admin">
              ადმინ-პანელი
            </a>
          </div>
        </header>

        <section className="hero-panel">
          <div className="hero-panel__copy">
            <p className="eyebrow">საჯარო კონტროლი, ერთ დაფაზე</p>
            <p className="hero-panel__text">
              აქ მომხმარებელს შეუძლია მხოლოდ ინიციატივების დათვალიერება, გაფილტვრა და ხმების მიცემა. ახალი ინიციატივის
              შექმნა გამოყოფილია ცალკე ადმინისტრაციულ სივრცეში.
            </p>

            <div className="search-shell">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="მოძებნე ინიციატივა, რეგიონი ან საკვანძო სიტყვა" />
            </div>
          </div>

          <div className="hero-panel__aside">
            <div className="metric-card metric-card--accent">
              <span>აქტიური შეგროვება</span>
              <strong>{totals.activeCount}</strong>
              <small>ინიციატივა ახლა იღებს ხმებს</small>
            </div>
            <div className="metric-card">
              <span>მიზანთან ახლოს</span>
              <strong>{totals.closeToGoal}</strong>
              <small>75%-ს გადასცდა და მაღალ პრიორიტეტშია</small>
            </div>
            <div className="metric-card">
              <span>შეყვანილი ხმები</span>
              <strong>{formatVotes(totals.totalVotes)}</strong>
              <small>ერთიანად დათვლილი მხარდაჭერა</small>
            </div>
          </div>
        </section>

        <section className="board-toolbar">
          <div className="chip-row">
            {CATEGORIES.map((category) => (
              <button key={category} className={`filter-chip ${activeCategory === category ? "is-active" : ""}`} onClick={() => setActiveCategory(category)}>
                {category}
              </button>
            ))}
          </div>

          <div className="board-toolbar__summary">
            <span>{filtered.length} შედეგი</span>
            <span>მხოლოდ ნახვა და ხმა</span>
          </div>
        </section>

        <section className="board-layout">
          <aside className="board-sidebar">
            <div className="sidebar-panel">
              <p className="eyebrow">Priority Queue</p>
              <h3>ყველაზე ცხელი თემები</h3>
              <div className="priority-list">
                {urgentItems.map((item) => (
                  <button key={item.id} className="priority-item" onClick={() => setSelected(item)}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.category}</span>
                    </div>
                    <b>{item.progress.toFixed(0)}%</b>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-panel sidebar-panel--muted">
              <p className="eyebrow">Access Model</p>
              <h3>როლების გამიჯვნა</h3>
              <ul className="info-list">
                <li>მომხმარებელი ხედავს ინიციატივებს და აფიქსირებს ხმას.</li>
                <li>ინიციატივის შექმნა ხელმისაწვდომია მხოლოდ ადმინ-პანელიდან.</li>
                <li>ადმინის დამატებული ინიციატივებიც ავტომატურად გამოჩნდება მთავარ დაფაზე.</li>
              </ul>
            </div>
          </aside>

          <main className="board-main">
            <div className="card-grid">
              {filtered.map((item) => (
                <InitiativeCard
                  key={item.id}
                  item={item}
                  voteState={votes[item.id]}
                  onVote={handleVote}
                  onOpen={setSelected}
                  highlighted={poppedId === item.id}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state">
                <p className="eyebrow">No matches</p>
                <h3>ამ ძიებით ინიციატივა ვერ მოიძებნა</h3>
                <p>სცადე სხვა კატეგორია ან უფრო მოკლე საძიებო სიტყვა.</p>
              </div>
            )}
          </main>
        </section>
      </div>

      {selected && <DetailModal item={selected} voteState={votes[selected.id]} onVote={handleVote} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== ADMIN_PASSWORD) {
      setError("პაროლი არასწორია. საცდელი ვერსიის პაროლია: admin123");
      return;
    }

    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    onLogin(true);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />

      <div className="page-frame page-frame--narrow">
        <section className="auth-card">
          <p className="eyebrow">Admin Access</p>
          <h1 className="auth-card__title">ინიციატივების შექმნა მხოლოდ ადმინს შეუძლია</h1>
          <p className="auth-card__copy">
            ეს ცალკე ადმინისტრაციული ზონაა. public board-ზე მომხმარებელი მხოლოდ ათვალიერებს და აძლევს ხმას.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="field-label">
              ადმინის პაროლი
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="შეიყვანე პაროლი" />
            </label>

            {error && <div className="form-note form-note--error">{error}</div>}

            <div className="auth-actions">
              <button className="primary-button" type="submit">
                შესვლა
              </button>
              <a className="ghost-button ghost-button--link" href="/">
                დაბრუნება board-ზე
              </a>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

function AdminPanel({ initiatives, onCreate, onLogout }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");

  const createdByAdmin = useMemo(() => initiatives.filter((item) => item.source === "admin"), [initiatives]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextId = `ADM-${new Date().getFullYear()}-${String(createdByAdmin.length + 1).padStart(3, "0")}`;

    const newInitiative = {
      id: nextId,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      votes: 0,
      limit: Number(form.limit),
      against: 0,
      status: form.status,
      date: new Date().toISOString().slice(0, 10),
      region: form.region.trim(),
      source: "admin",
    };

    if (!newInitiative.title || !newInitiative.description || !newInitiative.region || !newInitiative.limit) {
      setMessage("ყველა ველი სავალდებულოა.");
      return;
    }

    onCreate(newInitiative);
    setForm(EMPTY_FORM);
    setMessage(`ინიციატივა "${newInitiative.title}" დაემატა და უკვე public board-ზეც ჩანს.`);
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--three" />

      <div className="page-frame">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-lockup__mark">A</div>
            <div>
              <p className="eyebrow">Admin Panel</p>
              <h1>ინიციატივების მართვა</h1>
            </div>
          </div>

          <div className="topbar__stats">
            <span>{createdByAdmin.length} ადმინის ინიციატივა</span>
            <a className="ghost-button ghost-button--link" href="/">
              საჯარო დაფა
            </a>
            <button className="primary-button" onClick={onLogout}>
              გამოსვლა
            </button>
          </div>
        </header>

        <section className="admin-layout">
          <section className="admin-panel">
            <p className="eyebrow">Create Initiative</p>
            <h2>ახალი ინიციატივის დამატება</h2>

            <form className="admin-form" onSubmit={handleSubmit}>
              <label className="field-label">
                სათაური
                <input value={form.title} onChange={(event) => handleChange("title", event.target.value)} placeholder="მაგ: მუნიციპალური ბიუჯეტის გამჭვირვალობა" />
              </label>

              <label className="field-label">
                აღწერა
                <textarea value={form.description} onChange={(event) => handleChange("description", event.target.value)} rows="5" placeholder="ჩაწერე ინიციატივის არსი, მიზანი და რატომ არის მნიშვნელოვანი." />
              </label>

              <div className="admin-form__grid">
                <label className="field-label">
                  კატეგორია
                  <select value={form.category} onChange={(event) => handleChange("category", event.target.value)}>
                    {CATEGORIES.filter((item) => item !== "ყველა").map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-label">
                  სტატუსი
                  <select value={form.status} onChange={(event) => handleChange("status", event.target.value)}>
                    {STATUS_STEPS.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-form__grid">
                <label className="field-label">
                  ხმების ლიმიტი
                  <input type="number" min="1" value={form.limit} onChange={(event) => handleChange("limit", event.target.value)} />
                </label>

                <label className="field-label">
                  რეგიონი
                  <input value={form.region} onChange={(event) => handleChange("region", event.target.value)} placeholder="მაგ: იმერეთი" />
                </label>
              </div>

              {message && <div className={`form-note ${message.includes("დაემატა") ? "form-note--success" : "form-note--error"}`}>{message}</div>}

              <button className="primary-button" type="submit">
                ინიციატივის შექმნა
              </button>
            </form>
          </section>

          <aside className="admin-sidebar">
            <section className="sidebar-panel">
              <p className="eyebrow">Permissions</p>
              <h3>წვდომების ლოგიკა</h3>
              <ul className="info-list">
                <li>საჯარო გვერდზე აღარ არის შექმნის ფუნქცია.</li>
                <li>ახალი ჩანაწერების დამატება ხდება მხოლოდ აქედან.</li>
                <li>შექმნილი ინიციატივა ინახება local storage-ში და მაშინვე ჩნდება მთავარ board-ზე.</li>
              </ul>
            </section>

            <section className="sidebar-panel">
              <p className="eyebrow">Admin Feed</p>
              <h3>ადმინის მიერ დამატებული ინიციატივები</h3>
              <div className="admin-feed">
                {createdByAdmin.length === 0 && <p className="admin-feed__empty">ჯერ ახალი ინიციატივა არ დაგიმატებია.</p>}
                {createdByAdmin.map((item) => (
                  <article key={item.id} className="admin-feed__item">
                    <div className="board-card__tags">
                      <span className="mono-chip">{item.id}</span>
                      <span className="soft-chip">{item.category}</span>
                    </div>
                    <strong>{item.title}</strong>
                    <p>{item.region}</p>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  const [initiatives, setInitiatives] = usePersistentInitiatives();
  const [votes, setVotes] = usePersistentVotes();
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  });

  const pathname = window.location.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  const handleVote = (id, type) => {
    setVotes((current) => {
      if (current[id]) return current;
      return { ...current, [id]: type };
    });
  };

  const handleCreate = (initiative) => {
    setInitiatives((current) => [initiative, ...current]);
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
  };

  if (isAdminRoute) {
    if (!isAdmin) {
      return <AdminLogin onLogin={setIsAdmin} />;
    }

    return <AdminPanel initiatives={initiatives} onCreate={handleCreate} onLogout={handleLogout} />;
  }

  return <PublicBoard initiatives={initiatives} votes={votes} onVote={handleVote} />;
}
