// app.jsx — Veridian Node-7 personal HUD
// Built to match refs/room-warm.png exactly. Every UI panel sits on top
// of a baked-in panel in the image, with opaque dark glass to cover it.

const { useState, useEffect, useMemo, useRef } = React;

/* ── Stage scaler ────────────────────────────────────────────── */
function StageScaler({ scene, children }) {
  const wrapRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    function fit() {
      const vw = window.innerWidth, vh = window.innerHeight;
      const sw = 1538, sh = 1026;
      // "contain" — keep the WHOLE scene visible. .stage-wrap is position:fixed
      // (proven to position correctly), centered via explicit pixel offsets with
      // transform-origin at 0,0.
      const scale = Math.min(vw / sw, vh / sh);
      wrap.style.transform = `scale(${scale})`;
      wrap.style.left = `${Math.round((vw - sw * scale) / 2)}px`;
      wrap.style.top  = `${Math.round((vh - sh * scale) / 2)}px`;
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="viewport">
      {/* Blurred room fills the letterbox area so there are no dead black bars */}
      <div className="viewport-bg" data-scene={scene} />
      <div className="stage-wrap" ref={wrapRef}>
        <div className="stage" data-scene={scene} />
        <div className="grain" />
        {children}
      </div>
    </div>
  );
}

/* ── Clock ─────────────────────────────────────────────────── */
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/* ── Sparkline ─────────────────────────────────────────────── */
function Sparkline({ width = 100, height = 14, seed = 1, dense = false }) {
  const data = useMemo(() => {
    const arr = [];
    let v = 0.5;
    const n = dense ? 40 : 20;
    for (let i = 0; i < n; i++) {
      v += (Math.sin(i * (0.3 + (seed % 5) * 0.07)) + (Math.random() - 0.5)) * 0.18;
      v = Math.max(0.1, Math.min(0.9, v));
      arr.push(v);
    }
    return arr;
  }, [seed, dense]);
  const stepX = width / (data.length - 1);
  const path = data.map((v, i) => {
    const x = i * stepX;
    const y = height - v * height;
    return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ display: "block" }} preserveAspectRatio="none">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.9" />
    </svg>
  );
}

/* ── Constellation ─────────────────────────────────────────── */
function Constellation({ n = 28, w = 200, h = 60, accent = [] }) {
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.5,
        o: Math.random() * 0.6 + 0.3,
        kind: accent.length && Math.random() < 0.18
          ? accent[Math.floor(Math.random() * accent.length)]
          : "default",
      });
    }
    return arr;
  }, [n, w, h, accent.join("|")]);
  const links = useMemo(() => {
    const out = [];
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        if (dx*dx + dy*dy < 26*26) {
          out.push({ x1: dots[i].x, y1: dots[i].y, x2: dots[j].x, y2: dots[j].y });
        }
      }
    }
    return out;
  }, [dots]);
  const kindColor = { default: "currentColor", paused: "#d9a86a", completed: "#7d8590" };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      {links.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" strokeWidth="0.35" opacity="0.20" />
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={kindColor[d.kind]} opacity={d.o} />
      ))}
    </svg>
  );
}

/* ── Isometric layer stack (OPERATIONAL OVERVIEW) ──────────── */
function IsoStack() {
  // 4 stacked planes with named nodes
  const planes = [
    { y: 25,  name: "INGESTION",  count: "12 nodes" },
    { y: 60,  name: "COMPUTE",    count: "26 nodes" },
    { y: 95,  name: "STORAGE",    count: "42 nodes" },
    { y: 130, name: "ARCHIVE",    count: "34 nodes" },
  ];
  return (
    <svg viewBox="0 0 360 160" width="100%" height="100%" preserveAspectRatio="xMinYMid meet">
      {planes.map((p, idx) => {
        const cx = 100, half = 80, ht = 16;
        return (
          <g key={idx} opacity="0.9">
            <path
              d={`M ${cx} ${p.y - ht} L ${cx + half} ${p.y} L ${cx} ${p.y + ht} L ${cx - half} ${p.y} Z`}
              fill="none" stroke="rgba(180,200,220,0.55)" strokeWidth="0.7"
            />
            {/* grid */}
            <line x1={cx - half + 5} y1={p.y - 1} x2={cx + half - 5} y2={p.y - 1} stroke="rgba(180,200,220,0.18)" strokeWidth="0.4" />
            <line x1={cx} y1={p.y - ht + 3} x2={cx} y2={p.y + ht - 3} stroke="rgba(180,200,220,0.18)" strokeWidth="0.4" />
            {/* nodes */}
            {[[cx-30,p.y-3],[cx+20,p.y+4],[cx-8,p.y+7],[cx+40,p.y-2]].map(([x,y], j) => (
              <circle key={j} cx={x} cy={y} r="1.4" fill="#6fbfd6" opacity={0.7 + Math.random()*0.3} />
            ))}
            {/* label rect */}
            <rect x={cx - half - 4} y={p.y - 18} width="78" height="14" fill="rgba(0,0,0,0.55)" stroke="rgba(180,200,220,0.18)" strokeWidth="0.4" />
            <text x={cx - half} y={p.y - 9} fill="#aab2bc" fontFamily="IBM Plex Mono" fontSize="6" letterSpacing="1.4">{p.name}</text>
            <text x={cx - half} y={p.y - 2} fill="#555c66" fontFamily="IBM Plex Mono" fontSize="5" letterSpacing="0.6">{p.count}</text>
          </g>
        );
      })}
      {/* MCP ROUTER label off to the side */}
      <g>
        <rect x="190" y="115" width="78" height="22" fill="rgba(0,0,0,0.55)" stroke="rgba(180,200,220,0.18)" strokeWidth="0.4" />
        <text x="194" y="124" fill="#aab2bc" fontFamily="IBM Plex Mono" fontSize="6" letterSpacing="1.4">MCP ROUTER</text>
        <text x="194" y="132" fill="#555c66" fontFamily="IBM Plex Mono" fontSize="5" letterSpacing="0.6">8 modules</text>
        {/* connector */}
        <line x1="190" y1="126" x2="160" y2="60" stroke="rgba(180,200,220,0.20)" strokeWidth="0.4" />
      </g>
    </svg>
  );
}

/* ── Nav icons ─────────────────────────────────────────────── */
const NAV_GLYPHS = {
  overview:     <svg viewBox="0 0 14 14"><path d="M2 2 H6 V6 H2 Z M8 2 H12 V6 H8 Z M2 8 H6 V12 H2 Z M8 8 H12 V12 H8 Z" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  research:     <svg viewBox="0 0 14 14"><circle cx="6" cy="6" r="3.5" fill="none" stroke="currentColor" strokeWidth="0.8"/><line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="0.8"/></svg>,
  infrastructure: <svg viewBox="0 0 14 14"><path d="M2 11 L7 7 L12 11 M2 7 L7 3 L12 7" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  observability:<svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="0.8"/><circle cx="7" cy="7" r="2" fill="currentColor" /></svg>,
  mcp:          <svg viewBox="0 0 14 14"><path d="M3 3 H11 V7 H3 Z M5 7 V11 M9 7 V11 M3 11 H6 M8 11 H11" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  projects:     <svg viewBox="0 0 14 14"><circle cx="3" cy="11" r="1.6" fill="currentColor"/><circle cx="11" cy="3" r="1.6" fill="currentColor"/><circle cx="11" cy="11" r="1.6" fill="none" stroke="currentColor" strokeWidth="0.8"/><line x1="3" y1="11" x2="11" y2="3" stroke="currentColor" strokeWidth="0.5"/></svg>,
  archive:      <svg viewBox="0 0 14 14"><path d="M2 4 H12 V11 H2 Z M2 4 L4 2 H10 L12 4" fill="none" stroke="currentColor" strokeWidth="0.8"/><line x1="6" y1="7" x2="8" y2="7" stroke="currentColor" strokeWidth="0.8"/></svg>,
  notebooks:    <svg viewBox="0 0 14 14"><path d="M3 2 V12 H11 V2 Z M5 2 V12 M5 5 H11 M5 8 H11" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  fieldlogs:    <svg viewBox="0 0 14 14"><path d="M2 2 H10 L12 4 V12 H2 Z M5 6 H10 M5 8 H10 M5 10 H8" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  histories:    <svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="0.8"/><path d="M7 4 V7 L9.5 8.5" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  diagrams:     <svg viewBox="0 0 14 14"><path d="M3 11 L7 4 L11 11 M5 8 H9" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  memory:       <svg viewBox="0 0 14 14"><path d="M2 4 H12 M2 7 H12 M2 10 H12" fill="none" stroke="currentColor" strokeWidth="0.8"/></svg>,
  config:       <svg viewBox="0 0 14 14"><circle cx="7" cy="7" r="2" fill="none" stroke="currentColor" strokeWidth="0.8"/><path d="M7 1 V3 M7 11 V13 M1 7 H3 M11 7 H13 M2.5 2.5 L4 4 M10 10 L11.5 11.5 M11.5 2.5 L10 4 M4 10 L2.5 11.5" stroke="currentColor" strokeWidth="0.8"/></svg>,
};

const NAV = [
  { id: "overview",       n: "OVERVIEW",       s: "home",                 icon: "overview" },
  { id: "research",       n: "RESEARCH",       s: "active systems",       icon: "research" },
  { id: "infrastructure", n: "INFRASTRUCTURE", s: "systems & services",   icon: "infrastructure" },
  { id: "observability",  n: "OBSERVABILITY",  s: "traces & metrics",     icon: "observability" },
  { id: "mcp",            n: "MCP PROTOCOL",   s: "modules & endpoints",  icon: "mcp" },
  { id: "projects",       n: "PROJECTS",       s: "long-term traces",     icon: "projects" },
  { id: "archive",        n: "ARCHIVE",        s: "essays & papers",      icon: "archive" },
  { id: "notebooks",      n: "NOTEBOOKS",      s: "research notes",       icon: "notebooks" },
  { id: "fieldlogs",      n: "FIELD LOGS",     s: "observations & logs",  icon: "fieldlogs" },
  { id: "histories",      n: "HISTORIES",      s: "operational records",  icon: "histories" },
  { id: "diagrams",       n: "DIAGRAMS",       s: "maps & schematics",    icon: "diagrams" },
  { id: "memory",         n: "MEMORY LAYERS",  s: "hidden archives",      icon: "memory" },
  { id: "config",         n: "CONFIGURATION",  s: "environment",          icon: "config" },
];

/* ── Top status bar ────────────────────────────────────────── */
function TopBar() {
  const time = useClock();
  return (
    <div className="topbar">
      <div className="node">
        <span className="k">PRAGUE // DISTRICT 7</span>
        <span className="v">SYS.NODE / PRG-7</span>
      </div>
      <div>
        <span className="k">LOCAL TIME</span>
        <span className="v cyan tab">{time}</span>
      </div>
      <div>
        <span className="k">WEATHER</span>
        <span className="v">8°C · LIGHT RAIN</span>
      </div>
      <div>
        <span className="k">AIR QUALITY</span>
        <span className="v">42 · GOOD</span>
      </div>
      <div>
        <span className="k">NOISE INDEX</span>
        <span className="v">36 · LOW</span>
      </div>
      <div className="health">
        <span className="k">SYSTEM HEALTH</span>
        <span className="v cyan">NOMINAL</span>
      </div>
      <div className="net">
        <span className="k">NETWORK STATUS</span>
        <span className="v">STABLE · 98.6%</span>
      </div>
      <div className="user">
        <span className="k role">USER · OPERATOR</span>
        <span className="v">CLEARANCE L4</span>
      </div>
    </div>
  );
}

/* ── Left rail with nav + terminal ─────────────────────────── */
const TERMINAL_BANNER = [
  { kind: "out", text: "VERIDIAN // NODE-7 — operational shell" },
  { kind: "out", text: "Welcome, operator. Type `help` for commands." },
];

const TERMINAL_HELP = [
  "available commands:",
  "  whoami          — operator identity",
  "  ls              — list archive sections",
  "  ls /essays      — list essays",
  "  ls /projects    — list active projects",
  "  ls /repos       — list repositories",
  "  cat /now        — what i'm working on",
  "  cat /contact    — open channels",
  "  goto <section>  — jump to a section",
  "  clear           — clear terminal",
  "  exit            — lock session",
];

function runTerminalCommand(raw, onNav) {
  const cmd = raw.trim();
  if (!cmd) return [];
  if (cmd === "help") return TERMINAL_HELP.map(l => ({ kind: "out", text: l }));
  if (cmd === "whoami") return [
    { kind: "out", text: "ritwik srivastava — operator" },
    { kind: "out", text: "  4y · TPM / PM / platform — observability, MCP, AI-native infra" },
    { kind: "out", text: "  node: prg-7 · clearance: L4" },
    { kind: "out", text: "  current: metrics zero — observability cost optimization" },
  ];
  if (cmd === "ls" || cmd === "ls /") {
    return [
      { kind: "out", text: "/essays      /projects    /repos       /record" },
      { kind: "out", text: "/fieldlogs   /notebooks   /diagrams    /contact" },
    ];
  }
  if (cmd === "ls /essays") return ESSAYS.map(e => ({
    kind: "out",
    text: `${e.date.padEnd(10)}  ${e.title}  (${e.wc !== "—" ? e.wc + "w" : "draft"})`,
  }));
  if (cmd === "ls /projects") return PROJECTS.map(p => ({
    kind: "out",
    text: `[${p.num}] ${p.status.padEnd(7)} ${p.title}`,
  }));
  if (cmd === "ls /repos") return REPOS.map(r => ({
    kind: "out",
    text: `${r.n}`,
  }));
  if (cmd === "cat /now") return [
    { kind: "out", text: "current ops:" },
    { kind: "out", text: "  · metrics zero — TPM, observability cost optimization" },
    { kind: "out", text: "  · demogen — gemini vision integration pass" },
    { kind: "out", text: "  · job-search-mcp — fastmcp upgrade pending" },
    { kind: "out", text: "  · rp-eval — method docs v0.4" },
    { kind: "out", text: "  · homelab — uptime 28d 14h" },
  ];
  if (cmd === "cat /contact") return CHANNELS.map(c => ({
    kind: "out",
    text: `  ${c.n.padEnd(10)}  ${c.h}`,
  }));
  if (cmd.startsWith("goto ")) {
    const target = cmd.slice(5).trim();
    const item = NAV.find(n => n.id === target || n.n.toLowerCase() === target.toUpperCase().toLowerCase());
    if (item) {
      onNav && onNav(item.id);
      return [{ kind: "out", text: `→ opening ${item.n.toLowerCase()}…` }];
    }
    return [{ kind: "err", text: `unknown section: ${target}` }];
  }
  if (cmd === "clear") return "CLEAR";
  if (cmd === "exit") return [{ kind: "err", text: "lock session — pretend mode (no real auth here)" }];
  return [{ kind: "err", text: `command not found: ${cmd}. type 'help'.` }];
}

function Terminal({ onNav }) {
  const [lines, setLines] = useState(TERMINAL_BANNER);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState([]);
  const [hi, setHi] = useState(-1);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  function submit() {
    const raw = input;
    if (!raw.trim()) return;
    const result = runTerminalCommand(raw, onNav);
    if (result === "CLEAR") {
      setLines([]);
    } else {
      setLines(prev => [
        ...prev,
        { kind: "cmd", text: raw },
        ...result,
      ]);
    }
    setHist(prev => [raw, ...prev].slice(0, 30));
    setHi(-1);
    setInput("");
  }

  function onKey(e) {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(hist.length - 1, hi + 1);
      if (next >= 0) { setHi(next); setInput(hist[next]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = hi - 1;
      if (next < 0) { setHi(-1); setInput(""); } else { setHi(next); setInput(hist[next]); }
    }
  }

  return (
    <div className="terminal" onClick={() => inputRef.current && inputRef.current.focus()}>
      <div className="terminal-head">
        <span>TERMINAL</span>
        <span className="active">ACTIVE</span>
      </div>
      <div className="connect">// connect: localhost:1337</div>
      <div className="scroll" ref={scrollRef}>
        {lines.map((l, i) => (
          <div key={i} className={"line " + l.kind}>
            {l.kind === "cmd"
              ? <React.Fragment><span className="prompt">operator@sys.node:~$</span> {l.text}</React.Fragment>
              : l.text}
          </div>
        ))}
        <div className="prompt-row">
          <span className="prompt">operator@sys.node:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck="false"
            autoComplete="off"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}

function LeftRail({ active, onNav, node, subtitle }) {
  const time = useClock();
  return (
    <aside className="leftrail">
      <div className="lr-head">
        <span className="n">{node || "VERIDIAN // NODE-7"}</span>
        <span className="s">{subtitle || "PERSONAL OPERATIONAL ENVIRONMENT"}</span>
        <span className="v">v3.7.2 / 2026.05.19</span>
      </div>

      <div className="lr-nav">
        {NAV.map(item => (
          <div
            key={item.id}
            className={"lr-item" + (active === item.id ? " is-active" : "")}
            onClick={() => onNav(item.id)}
          >
            <span className="ic">{NAV_GLYPHS[item.icon]}</span>
            <div className="lbl">
              <span className="n">{item.n}</span>
              <span className="s">{item.s}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="lr-meta">
        <div className="row">
          <span className="k">SYSTEM TIME</span>
          <span className="v cyan">{time}</span>
        </div>
        <div className="row">
          <span className="k">LOCATION</span>
          <span className="v">PRAGUE // DISTRICT 7</span>
        </div>
        <div className="row">
          <span className="k">WEATHER</span>
          <span className="v">8°C // LIGHT RAIN</span>
        </div>
        <div className="row">
          <span className="k">AIR QUALITY</span>
          <span className="v">42 // GOOD</span>
        </div>
      </div>

      <button className="lr-lock">LOCK SESSION</button>

      <Terminal onNav={onNav} />
    </aside>
  );
}

/* ── Center wall panels ──────────────────────────────────── */
function PanelOverview() {
  return (
    <div className="panel p-overview">
      <h5 className="panel-h"><span>OPERATIONAL OVERVIEW</span></h5>
      <div className="iso"><IsoStack /></div>
      <div className="legend">
        <span className="lg nom">NOMINAL</span>
        <span className="lg deg">DEGRADED</span>
        <span className="lg maint">MAINTENANCE</span>
      </div>
    </div>
  );
}

const LIVE_SERVICES = [
  { n: "auth.service",    ms: "96",  seed: 11 },
  { n: "mcp.router",      ms: "102", seed: 22 },
  { n: "vector.db",       ms: "512", seed: 33 },
  { n: "semantic.index",  ms: "127", seed: 44 },
  { n: "storage.gateway", ms: "89",  seed: 55 },
];

function PanelObservability() {
  return (
    <div className="panel p-obs">
      <h5 className="panel-h">
        <span>LIVE OBSERVABILITY</span>
        <span className="live">LIVE</span>
      </h5>
      <div className="rows">
        {LIVE_SERVICES.map(s => (
          <div className="row" key={s.n}>
            <span className="s">{s.n}</span>
            <span className="sp"><Sparkline seed={s.seed} dense /></span>
            <span className="ms">{s.ms}ms</span>
          </div>
        ))}
      </div>
      <div className="view">VIEW ALL TRACES</div>
    </div>
  );
}

function PanelHealth() {
  return (
    <div className="panel p-health" style={{ display: "flex", flexDirection: "column" }}>
      <h5 className="panel-h"><span>SYSTEM HEALTH</span></h5>
      <div className="big">NOMINAL</div>
      <div className="sm" style={{ height: 16 }}><Sparkline seed={9} dense /></div>
      <div className="net">
        <div className="sm">NETWORK STATUS</div>
        <div className="stable">STABLE</div>
        <div className="pct">98.6%</div>
      </div>
      <div className="alerts">
        <div className="sm">ACTIVE ALERTS</div>
        <div className="big" style={{ fontSize: 28 }}>0</div>
      </div>
      <div className="view">VIEW FULL STATUS</div>
    </div>
  );
}

const OP_NOTES = [
  { ts: "MAY 19 // 20:12", tx: "Updated semantic index (+12.4M vectors)" },
  { ts: "MAY 19 // 17:33", tx: "MCP experiment: context-bridge results available" },
  { ts: "MAY 19 // 16:02", tx: "Infrastructure map updated — district 7" },
];

function PanelNotes() {
  return (
    <div className="panel p-notes">
      <h5 className="panel-h"><span>OPERATIONAL NOTES</span></h5>
      {OP_NOTES.map((n, i) => (
        <div className="entry" key={i}>
          <div className="ts">{n.ts}</div>
          <div className="tx">{n.tx}</div>
        </div>
      ))}
      <div className="view">VIEW ALL NOTES</div>
    </div>
  );
}

const RESEARCH = [
  { n: "graph-reasoner",  s: "TRAINING",      pct: 72 },
  { n: "infra-simulator", s: "RUNNING",       pct: 61 },
  { n: "policy-evolver",  s: "EVALUATING",    pct: 38 },
  { n: "semantic-layer",  s: "INDEXING",      pct: 84 },
  { n: "memory-bridge",   s: "SYNCHRONIZING", pct: 54 },
];

function PanelResearch() {
  return (
    <div className="panel p-research air">
      <h5 className="panel-h"><span>CURRENT RESEARCH</span></h5>
      <div className="bars">
        {RESEARCH.map(b => (
          <div className="bar" key={b.n}>
            <span className="n">{b.n}</span>
            <span className="pct">{b.pct}%</span>
            <span className="s">{b.s}</span>
            <div className="track"><i style={{ width: b.pct + "%" }} /></div>
          </div>
        ))}
      </div>
      <div className="view">VIEW RESEARCH DASHBOARD</div>
    </div>
  );
}

function PanelQuote({ headline }) {
  const text = headline || "Infrastructure is the layer that remembers even when we don't.";
  return (
    <div className="p-quote">
      "{text}"
      <cite>— operational note · MAY 19</cite>
    </div>
  );
}

function PanelFieldLog() {
  return (
    <div className="panel p-log air">
      <h5 className="panel-h"><span>FIELD LOG SNAPSHOT</span></h5>
      <div className="ts">MAY 19 // 19:58</div>
      <p>Observed anomaly in metro signal dropouts between Florenc and Vltavská. Correlated with weather pattern and power load shift.</p>
      <div className="view">VIEW FULL LOG</div>
    </div>
  );
}

/* ── Bottom panels ────────────────────────────────────────── */
function PanelEssays({ onNav }) {
  return (
    <div className="panel p-essays">
      <h5 className="panel-h"><span>LATEST ESSAYS</span></h5>
      <ul>
        {ESSAYS.slice(0, 5).map((e, i) => (
          <li key={i}>
            <span className="d">{e.date.slice(0, 6)}</span>
            <span className="t">{e.title}</span>
            <span className="w">{e.wc === "—" ? "draft" : e.wc + "w"}</span>
          </li>
        ))}
      </ul>
      <div className="view" onClick={() => onNav("archive")}>VIEW ALL ESSAYS</div>
    </div>
  );
}

function PanelProjectMap({ onNav }) {
  return (
    <div className="panel p-projects">
      <h5 className="panel-h"><span>PROJECT TRACE MAP</span></h5>
      <div className="constellation"><Constellation n={32} w={220} h={105} accent={["paused","completed"]} /></div>
      <div className="legend">
        <span className="l active">ACTIVE</span>
        <span className="l paused">PAUSED</span>
        <span className="l completed">COMPLETED</span>
      </div>
    </div>
  );
}

const REPO_ACTIVITY = [
  { n: "job-search-mcp",         t: "synced 2h" },
  { n: "demogen",                t: "synced 5h" },
  { n: "observability-cost-lab", t: "synced 14h" },
  { n: "homelab",                t: "synced 1d" },
  { n: "rp-eval-notes",          t: "synced 2d" },
];

function PanelRepos({ onNav }) {
  return (
    <div className="panel p-repos">
      <h5 className="panel-h"><span>REPOSITORY ACTIVITY</span><span>LAST 24H</span></h5>
      <ul>
        {REPO_ACTIVITY.map(r => (
          <li key={r.n}>
            <span className="ic">▸</span>
            <span className="n">ritw237<span>/</span>{r.n}</span>
            <span className="t">{r.t}</span>
          </li>
        ))}
      </ul>
      <div className="view" onClick={() => onNav("archive")}>VIEW REPOSITORIES</div>
    </div>
  );
}

function PanelAmbient() {
  return (
    <div className="panel p-ambient">
      <h5 className="panel-h"><span>AMBIENT CONTEXT</span></h5>
      <div className="grid">
        <div className="row"><span className="k">TEMP</span><span className="v">8.2°C</span></div>
        <div className="row"><span className="k">PRESSURE</span><span className="v">1012 hPa</span></div>
        <div className="row"><span className="k">HUMIDITY</span><span className="v">91%</span></div>
        <div className="row"><span className="k">UV INDEX</span><span className="v">0.6</span></div>
        <div className="row"><span className="k">WIND</span><span className="v">12 km/h</span></div>
        <div className="row"><span className="k">VISIBILITY</span><span className="v cyan">7.4 km</span></div>
      </div>
      <div className="view">VIEW METRICS</div>
    </div>
  );
}

/* ── Bottom strip ──────────────────────────────────────── */
function BottomStrip() {
  // 19 dots, mostly active
  const dots = Array.from({ length: 19 }, (_, i) => i % 5 === 4);
  return (
    <div className="bottomstrip">
      <div className="bg-proc">
        <h6><span>BACKGROUND PROCESSES</span><span className="live">19 ACTIVE</span></h6>
        <div className="count">19 <small>active</small></div>
        <div className="dots">
          {dots.map((idle, i) => <span key={i} className={"dot" + (idle ? " idle" : "")} />)}
        </div>
      </div>
      <div className="sys-out">
        <h6><span>SYSTEM OUTPUT</span><span className="live">LIVE</span></h6>
        <div className="log">
          <div><span className="ts">[20:47:18]</span> <span className="ok">indexer:</span> committed 128 docs</div>
          <div><span className="ts">[20:47:17]</span> <span className="ok">sync:</span> repositories up to date</div>
          <div><span className="ts">[20:47:15]</span> <span className="ok">backup:</span> incremental snapshot</div>
          <div><span className="ts">[20:47:10]</span> <span className="ok">metrics:</span> pipeline healthy</div>
        </div>
        <div className="view">VIEW FULL LOG →</div>
      </div>
      <div className="mi-layer">
        <h6><span>MACHINE INTELLIGENCE LAYER</span><span style={{ color: "var(--cyan)" }}>NOMINAL</span></h6>
        <div className="rows">
          <div className="row"><span className="n">semantic understanding</span><span className="sp" style={{ color: "var(--cyan)" }}><Sparkline seed={5} /></span><span className="st active">ACTIVE</span></div>
          <div className="row"><span className="n">pattern recognition</span>   <span className="sp" style={{ color: "var(--cyan)" }}><Sparkline seed={6} /></span><span className="st active">ACTIVE</span></div>
          <div className="row"><span className="n">anomaly detection</span>     <span className="sp" style={{ color: "var(--cyan)" }}><Sparkline seed={7} /></span><span className="st active">ACTIVE</span></div>
          <div className="row"><span className="n">inference engine</span>      <span className="sp" style={{ color: "var(--ink-4)" }}><Sparkline seed={8} /></span><span className="st idle">IDLE</span></div>
        </div>
        <div className="view">VIEW DETAILS →</div>
      </div>
      <div className="memory">
        <h6><span>MEMORY LAYERS</span><span>2 HIDDEN</span></h6>
        <div className="meta" style={{ marginBottom: 6 }}>tier 0 / tier 1 visible · 2 hidden</div>
        <div className="lvls">
          <div className="lvl"><span className="ic">●</span><span>TIER 0 · HOT</span></div>
          <div className="lvl"><span className="ic" style={{ color: "var(--ink-3)" }}>●</span><span>TIER 1 · WARM</span></div>
          <div className="lvl"><span className="ic" style={{ color: "var(--ink-4)" }}>◌</span><span>TIER 2 · COLD · hidden</span></div>
          <div className="lvl"><span className="ic" style={{ color: "var(--ink-4)" }}>◌</span><span>TIER 3 · FROZEN · hidden</span></div>
        </div>
        <div className="access">ACCESS LAYERS →</div>
      </div>
    </div>
  );
}

/* ── DRAWER (full-section view) ─────────────────────────── */
function Drawer({ section, onClose }) {
  const isOpen = !!section;
  const def = NAV.find(n => n.id === section);
  // Pick content based on section
  let body = null;
  if (section === "archive") {
    body = (
      <div>
        {ESSAYS.map((e, i) => (
          <div className="row" key={i} style={e.placeholder ? { opacity: 0.55 } : null}>
            <span className="d">{e.date}</span>
            <div>
              <h3>{e.title}</h3>
              <p>{e.sub}</p>
            </div>
            <span className="m">{e.wc !== "—" ? e.wc + " words" : "draft"}</span>
          </div>
        ))}
      </div>
    );
  } else if (section === "projects" || section === "infrastructure") {
    body = (
      <div>
        {PROJECTS.map(p => (
          <div className="row" key={p.num}>
            <span className="d">PRJ · {p.num}<br/><span className="dim">{p.status.toUpperCase()}</span></span>
            <div>
              <h3>{p.title}</h3>
              <span className="ko">{p.ko}</span>
              <p>{p.blurb}</p>
              <div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
            </div>
            <span className="m"><span className="y">{p.year}</span><br/>{p.href ? p.href.replace(/^https?:\/\//,"") : ""}</span>
          </div>
        ))}
      </div>
    );
  } else if (section === "histories") {
    body = (
      <div>
        {RECORD.map((e, i) => (
          <div className="row" key={i}>
            <span className="d">{e.dates}<br/><span className="dim">{e.loc}</span></span>
            <div>
              <h3>{e.role}</h3>
              <span className="ko">{e.co}</span>
              <p dangerouslySetInnerHTML={{ __html: e.bullets[0] }} />
              {e.bullets[1] && <p dangerouslySetInnerHTML={{ __html: e.bullets[1] }} />}
            </div>
            <span className="m">{e.ref}</span>
          </div>
        ))}
      </div>
    );
  } else if (section === "fieldlogs" || section === "notebooks") {
    body = (
      <div>
        {NOTEBOOKS.map((n, i) => (
          <div className="row" key={i}>
            <span className="d">{n.ts}<br/><span className="dim">{n.tag}</span></span>
            <div>
              <h3 style={{ fontStyle: "italic" }}>{n.title}</h3>
              <p>{n.body}</p>
            </div>
            <span className="m">{n.foot}</span>
          </div>
        ))}
      </div>
    );
  } else if (section === "config") {
    body = (
      <div className="signal-grid">
        <div>
          <h2>Open a <em>channel.</em></h2>
          <p>
            The fastest way to reach me is email. If you're working on observability,
            platform engineering, MCP tooling, or AI-native developer infrastructure,
            I'd like to hear from you.
          </p>
          <p style={{ marginTop: 8, color: "var(--ink-3)", fontSize: 13 }}>
            Especially open to: infra/devtools startups, observability companies,
            platform teams, implementation engineering, developer experience,
            AI-native internal tooling.
          </p>
        </div>
        <div className="channels">
          {CHANNELS.map(c => (
            <a key={c.n} href={c.href || "#"}
               target={c.href && c.href.startsWith("http") ? "_blank" : null}
               rel="noreferrer">
              <span className="k">{c.k}</span>
              <span className="n">{c.n}</span>
              <span className="h">{c.h}</span>
              <span className="arr">→</span>
            </a>
          ))}
        </div>
      </div>
    );
  } else {
    body = (
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
        // section <b style={{ color: "var(--cyan)" }}>{def ? def.n.toLowerCase() : section}</b> placeholder
        <br/><br/>
        the room shows your current state. open any section by clicking the nav
        — or just type a command into the terminal in the bottom-left.
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className={"drawer-scrim" + (isOpen ? " is-open" : "")} onClick={onClose} />
      <aside className={"drawer" + (isOpen ? " is-open" : "")}>
        {def && (
          <div className="drawer-head">
            <span className="num">/{def.id}</span>
            <span className="ttl">{def.n.toLowerCase()}</span>
            <span className="close" onClick={onClose}>CLOSE  ⨯</span>
          </div>
        )}
        {body}
      </aside>
    </React.Fragment>
  );
}

/* ── Headline options ────────────────────────────────────── */
const HEADLINES = [
  { k: "remembers",     text: "Infrastructure is the layer that remembers even when we don't." },
  { k: "observability", text: "Observability is how systems learn to remember themselves." },
  { k: "context",       text: "Context is the most expensive resource. Build accordingly." },
  { k: "translation",   text: "Failures are narratives. Observability is translation." },
  { k: "tools",         text: "We shape our tools, and thereafter our tools shape us." },
];

function HeadlineSelect({ label, value, options, onChange }) {
  return (
    <div className="twk-row">
      <div className="twk-lbl"><span>{label}</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {options.map(o => (
          <button key={o.k} onClick={() => onChange(o.k)}
            style={{
              border: value === o.k ? "1px solid #29261b" : "1px solid rgba(0,0,0,.12)",
              background: value === o.k ? "rgba(0,0,0,.04)" : "transparent",
              borderRadius: 6,
              padding: "8px 10px",
              textAlign: "left",
              cursor: "default", font: "inherit", color: "inherit",
              lineHeight: 1.35,
            }}>
            {o.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────── */
function App() {
  const [t, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [drawer, setDrawer] = useState(null);

  // Esc closes drawer
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setDrawer(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Apply tweak attrs to <html>
  useEffect(() => {
    const h = document.documentElement;
    h.dataset.window   = t.windowView || "cyberpunk";
    h.dataset.lighting = t.lighting   || "medium";
  }, [t.windowView, t.lighting]);

  function onNav(id) {
    if (id === "overview") { setDrawer(null); return; }
    setDrawer(id);
  }

  const headline = (HEADLINES.find(h => h.k === t.headlineMode) || HEADLINES[0]).text;

  return (
    <React.Fragment>
      <StageScaler scene={t.scene}>
        {/* Cyberpunk Prague substituted into the window pane */}
        <div className="window-view" />
        <div className="window-glass" />

        {/* Ambient room lighting */}
        <div className="lights">
          <div className="light-fire" />
          <div className="light-lamp-l" />
          <div className="light-lamp-r" />
          <div className="light-tube" />
          <div className="light-ceil-1" />
          <div className="light-ceil-2" />
          <div className="light-ceil-3" />
        </div>

        {/* Animated fire removed — the room's own hearth reads fine. */}

        <TopBar />
        <LeftRail
          active={drawer || "overview"}
          onNav={onNav}
          node={t.node}
          subtitle={t.subtitle}
        />

        {/* the room's UI panels, always visible — they form the operational HUD */}
        <PanelOverview />
        <PanelObservability />
        <PanelHealth />
        <PanelNotes />
        <PanelResearch />
        <PanelQuote headline={headline} />
        <PanelFieldLog />
        <PanelEssays onNav={onNav} />
        <PanelProjectMap onNav={onNav} />
        <PanelRepos onNav={onNav} />
        <PanelAmbient />
        <BottomStrip />

        <Drawer section={drawer} onClose={() => setDrawer(null)} />
      </StageScaler>

      <AudioPanel />

      <TweaksPanel>
        <TweakSection label="Identity" />
        <TweakText label="Name" value={t.name} onChange={v => setTweak("name", v)} />
        <TweakText label="Node" value={t.node} onChange={v => setTweak("node", v)} />
        <TweakText label="Subtitle" value={t.subtitle} onChange={v => setTweak("subtitle", v)} />

        <TweakSection label="Scene" />
        <TweakRadio label="Backdrop"
          value={t.scene}
          options={["wall", "city"]}
          onChange={v => setTweak("scene", v)} />
        <TweakRadio label="Window view"
          value={t.windowView || "cyberpunk"}
          options={["cyberpunk", "original"]}
          onChange={v => setTweak("windowView", v)} />
        <TweakRadio label="Lighting"
          value={t.lighting || "medium"}
          options={["low", "medium", "high"]}
          onChange={v => setTweak("lighting", v)} />

        <TweakSection label="Wall quote" />
        <HeadlineSelect label="Pick one"
          value={t.headlineMode}
          options={HEADLINES}
          onChange={v => setTweak("headlineMode", v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
