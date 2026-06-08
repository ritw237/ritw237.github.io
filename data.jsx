// data.jsx — content from Ritwik's resume + supplied context.
// Everything here is real data unless tagged // PLACEHOLDER.

const NAV = [
  { id: "overview",     num: "01", lbl: "Overview",   sub: "the archive" },
  { id: "essays",       num: "02", lbl: "Essays",     sub: "long-form writing" },
  { id: "projects",     num: "03", lbl: "Projects",   sub: "long-term traces" },
  { id: "record",       num: "04", lbl: "Record",     sub: "work history" },
  { id: "notebooks",    num: "05", lbl: "Field notes",sub: "observations & logs" },
  { id: "repositories", num: "06", lbl: "Repos",      sub: "code & knowledge" },
  { id: "signal",       num: "07", lbl: "Signal",     sub: "open channel" },
];

const ESSAYS = [
  {
    date: "APR 2025",
    title: "The Verbal Bet",
    sub: "On taste as the durable competitive advantage in an AI-commoditized labor market. Draws on rhetoric and Nyāya philosophy.",
    wc: "3,700",
    href: "https://medium.com/@ritwik.srv237",
  },
  // Placeholders to mirror the archive structure
  { date: "DRAFT",    title: "Observability as a first-class interface", sub: "Notes toward a thesis on how organizations come to know themselves through their telemetry.", wc: "—", placeholder: true },
  { date: "DRAFT",    title: "On context: the most expensive resource in software", sub: "Why MCP-shaped tooling matters, and what it would mean for context to be cheap.", wc: "—", placeholder: true },
  { date: "DRAFT",    title: "The TPM as systems editor", sub: "An attempt to rehabilitate technical program management as a discipline of operational clarity.", wc: "—", placeholder: true },
];

const PROJECTS = [
  {
    num: "01",
    status: "active",
    title: "job-search-mcp",
    ko: "Open-source MCP server",
    blurb: "Lets AI assistants search 100K+ remote jobs via the Himalayas API. Built around FastMCP with async HTTP throughout. The point isn't the job board — it's a small, useful proof that MCP-shaped tooling shortens the distance between an assistant and a real system.",
    tags: ["Python", "FastMCP", "async HTTP", "MCP"],
    year: "2025",
    href: "github.com/ritw237/job-search-mcp",
  },
  {
    num: "02",
    status: "wip",
    title: "demogen",
    ko: "AI-native enterprise demo generator",
    blurb: "Replaces two-week proof-of-concept builds with 30-second tailored output. Uses Gemini's vision API for multi-modal inference from text briefs and uploaded images. FastAPI under the hood with OpenTelemetry traces and a Docker shipping path.",
    tags: ["Python", "Gemini", "FastAPI", "OpenTelemetry", "Docker"],
    year: "2025",
    href: "github.com/ritw237/demogen",
  },
  {
    num: "03",
    status: "active",
    title: "RP evaluation — method notes",
    ko: "Dataset / reward-model exploration",
    blurb: "Long-running research thread: what separates a good role-play session from a bad one? Documenting methodology, building toy evaluators, and feeling out a possible dataset/model/product direction.",
    tags: ["evals", "datasets", "reward models", "method docs"],
    year: "2025",
  },
  {
    num: "04",
    status: "active",
    title: "Homelab / Proxmox node",
    ko: "Personal operational environment",
    blurb: "Proxmox host — 24 cores, 125GB RAM — running observability experiments, local LLM serving, and the kind of throwaway infrastructure you can only justify on your own metal. The lab is the workbench.",
    tags: ["Proxmox", "Kubernetes", "OpenTelemetry", "local LLM"],
    year: "2024 — present",
  },
  {
    num: "05",
    status: "active",
    title: "The Verbal Bet",
    ko: "Essay & long-form writing line",
    blurb: "A slow-moving thread of essays on systems thinking, taste, and the rhetoric of building. The first piece argued for taste as the AI-resistant skill; the next ones are drafts in the field-notes section.",
    tags: ["writing", "rhetoric", "Nyāya", "essays"],
    year: "2024 — present",
    href: "medium.com/@ritwik.srv237",
  },
];

const RECORD = [
  {
    dates: "DEC 2025 — PRESENT",
    loc:   "REMOTE · US",
    ref:   "REF · 006",
    role:  "Technical Program Manager",
    co:    "Metrics Zero",
    bullets: [
      "Driving program execution for an observability cost-optimization platform serving two enterprise customers (Phenom, LILA Games), cutting monitoring spend across Datadog, CloudWatch, and New Relic by <b>40%+</b>.",
      "Coordinating OpenTelemetry Collector deployments that replace the Datadog Agent (eliminating host billing) and Vector.dev StatsD configs that compress custom-metric ingestion costs.",
      "Managing CloudWatch reduction programs delivering <b>$15–20K monthly savings</b> per customer through ingestion optimization and de-duplication across the CloudWatch / Datadog seam.",
      "Running cardinality-reduction initiatives with the ML team to identify and retire unused high-cost metrics without touching alerts or dashboards.",
    ],
  },
  {
    dates: "OCT 2025 — NOV 2025",
    loc:   "REMOTE · US",
    ref:   "REF · 005",
    role:  "Product Strategy Consultant",
    co:    "Independent contract",
    bullets: [
      "Designed the product strategy and adoption framework for an internal developer platform (IDP) at a major tech company. Platform analysis across <b>100+ engineering teams</b>; feature prioritization and a 6-month roadmap.",
      "Conducted developer pain-point analysis across the org, translated findings into prioritized requirements and success metrics (adoption rate, time-to-first-deploy, developer satisfaction).",
      "Built the migration playbook and onboarding workflow that drove platform adoption — communication strategy, rollout phases, and success criteria.",
    ],
  },
  {
    dates: "JUN 2024 — SEP 2025",
    loc:   "REMOTE · HONG KONG",
    ref:   "REF · 004",
    role:  "Product Manager",
    co:    "Goskins",
    bullets: [
      "Drove product from 0 → 1 for a digital gaming marketplace. Shipped <b>10+ marketplace features</b> across 15 months: listings, search/discovery, transactions, seller verification.",
      "Built the fraud-detection and payment-compliance program integrating Shopify backend with AWS Fraud Detector and custom Lambda functions for transaction risk scoring — PCI-DSS, SOC 2, and GDPR controls.",
      "Expanded reach from Roblox to CS:GO and Rust with Steam integration; defined KPIs for seller activation, buyer retention, and platform health.",
      "Owned CI/CD pipelines and release workflows across dev/staging/prod; ran monitoring and alerting for transaction volume, uptime, API latency, and error rates.",
    ],
  },
  {
    dates: "SEP 2023 — MAY 2024",
    loc:   "REMOTE · INDIA",
    ref:   "REF · 003",
    role:  "Operations Executive",
    co:    "Mad About Sports",
    bullets: [
      "Wrote PowerShell automation against Microsoft Graph API for M365 license management across <b>400–500 users</b>, taking a process from <b>8 team members and 4–5 hours down to under 2 minutes</b> — with batch processing, error handling, and a dry-run mode.",
      "Coordinated platform migration from WordPress to GKE with the engineering team: containerization planning, DNS cutover, post-migration validation.",
      "Established operational SOPs, runbooks, and incident response documentation for an online education platform serving sports analytics and management students.",
    ],
  },
  {
    dates: "JUN 2022 — AUG 2023",
    loc:   "REMOTE · US",
    ref:   "REF · 002",
    role:  "Project Manager",
    co:    "Dexing Data",
    bullets: [
      "Managed <b>5+ concurrent BI engagements</b> across retail, financial services, and SaaS verticals. Data warehouses on Snowflake, BigQuery, Redshift; ETL pipelines; dashboards across Power BI, Tableau, and Looker.",
      "Coordinated cloud infrastructure provisioning, CI/CD workflows, and ML deployment workflows — predictive analytics, churn prediction, and anomaly detection.",
      "Translated client business requirements into technical specs covering schema design, ML pipeline architecture, and integration workflows.",
    ],
  },
  {
    dates: "MAR 2022 — MAY 2022",
    loc:   "REMOTE · INDIA",
    ref:   "REF · 001",
    role:  "AWS Cloud Virtual Intern",
    co:    "AICTE–EduSkills · AWS Academy",
    bullets: [
      "Completed a 10-week virtual internship building a multi-region distributed application on AWS — deployment patterns, regional failover, cloud service integration.",
    ],
  },
];

const NOTEBOOKS = [
  {
    ts: "FIELD NOTE · MAY 2026",
    tag: "OBSERVABILITY",
    title: "On reducing custom-metric cardinality without breaking alerts",
    body: "The fast path is to grep for every metric name referenced in alerts and dashboards. The hard part is the implicit references — runbooks, on-call docs, the half-remembered tribal knowledge that lives in a #ops Slack channel.",
    foot: "REF/057",
  },
  {
    ts: "NOTEBOOK · APR 2026",
    tag: "MCP",
    title: "What MCP wants to be when it grows up",
    body: "Right now MCP feels like the early days of LSP — a clean protocol around a messy reality. The interesting question is whether the right primitive is the tool, the resource, or something we haven't named yet.",
    foot: "REF/049",
  },
  {
    ts: "FIELD NOTE · APR 2026",
    tag: "RHETORIC",
    title: "Nyāya, evidence, and the structure of debugging",
    body: "Six pramāṇas in classical Nyāya: perception, inference, comparison, testimony, postulation, non-apprehension. Debugging is mostly testimony and inference. The mistakes I make in production are mostly non-apprehension.",
    foot: "REF/044",
  },
  {
    ts: "LAB LOG · MAR 2026",
    tag: "HOMELAB",
    title: "Proxmox + 24 cores: what I'd build differently",
    body: "If I were standing it up again I'd give the Kubernetes nodes more RAM and less CPU, and I'd put the observability stack on its own host. The Prometheus retention story was the part I underplanned.",
    foot: "REF/038",
  },
  {
    ts: "FIELD NOTE · MAR 2026",
    tag: "EVALS",
    title: "Toward a taxonomy of bad RP sessions",
    body: "Most automatic eval frameworks are looking for the wrong thing. The interesting failure modes aren't hallucination — they're tone drift, context loss, and the slow erosion of a character into a generic helpful assistant.",
    foot: "REF/032",
  },
  {
    ts: "OBSERVATION · FEB 2026",
    tag: "PLATFORM",
    title: "The IDP adoption curve is a story about defaults",
    body: "Every internal platform I've worked on lives or dies by what's already wired up the first time a developer touches it. Documentation cannot rescue a bad default.",
    foot: "REF/026",
  },
];

const REPOS = [
  { n: "ritw237/job-search-mcp",         d: "Open-source MCP server for AI-assistant job search across 100K+ remote roles.", syn: "ACTIVE",  hl: "Python · FastMCP" },
  { n: "ritw237/demogen",                d: "AI-native enterprise demo generator. Gemini vision, FastAPI, OpenTelemetry, Docker.", syn: "WIP",     hl: "Python · Gemini" },
  { n: "ritw237/homelab",                d: "Infrastructure-as-code for the Proxmox homelab. Terraform, Ansible, K8s manifests.", syn: "ONGOING", hl: "Terraform · Ansible" },
  { n: "ritw237/rp-eval-notes",          d: "Method notes and toy evaluators for role-play session quality.", syn: "RESEARCH", hl: "method notes" },
  { n: "ritw237/observability-cost-lab", d: "Experiments around metric cardinality, OTel collector pipelines, ingest economics.", syn: "ONGOING", hl: "OpenTelemetry" },
  { n: "ritw237/verbal-bet-essays",      d: "Drafts and source for the Substack essay line.", syn: "WRITING", hl: "Markdown" },
];

const CHANNELS = [
  { k: "01", n: "Email",        h: "ritwik.srv237@gmail.com", href: "mailto:ritwik.srv237@gmail.com" },
  { k: "02", n: "GitHub",       h: "github.com/ritw237",      href: "https://github.com/ritw237" },
  { k: "03", n: "LinkedIn",     h: "linkedin.com/in/ritw237", href: "https://linkedin.com/in/ritw237" },
  { k: "04", n: "Medium",       h: "medium.com/@ritwik.srv237", href: "https://medium.com/@ritwik.srv237" },
  { k: "05", n: "Substack",     h: "(linked from Medium)" },
];

/* Right rail ambient content — rotates a little so it doesn't feel static */
const AMBIENT_FEED = {
  overview: [
    { ts: "20:47 · synced",   txt: ["Repository ", { b: "observability-cost-lab" }, " — new ingest experiment committed."] },
    { ts: "20:31 · note",     txt: ["Field log added under ", { b: "/observability" }, "."] },
    { ts: "19:58 · research", txt: ["RP-eval method doc revision ", { b: "v0.4" }, "."] },
    { ts: "18:12 · essay",    txt: [{ b: "Verbal Bet" }, " — second draft snapshot."] },
  ],
  essays: [
    { ts: "MEDIUM",  txt: ["Published essay line — ", { b: "@ritwik.srv237" }, "."] },
    { ts: "DRAFTS",  txt: ["3 essays in progress. See ", { b: "/notebooks" }, " for adjacent notes."] },
    { ts: "BACKLOG", txt: ["12 candidate topics tagged in Notion."] },
  ],
  projects: [
    { ts: "ACTIVE", txt: [{ b: "demogen" }, " — Gemini integration pass."] },
    { ts: "ACTIVE", txt: [{ b: "job-search-mcp" }, " — FastMCP upgrade pending."] },
    { ts: "LAB",    txt: ["Homelab node uptime ", { b: "28d 14h" }, "."] },
  ],
  record: [
    { ts: "CURRENT", txt: ["TPM @ ", { b: "Metrics Zero" }, " — observability cost optimization."] },
    { ts: "SCOPE",   txt: ["2 enterprise customers, ", { b: "40%+" }, " monitoring spend reduction."] },
    { ts: "NEXT",    txt: ["AWS DevOps Pro — in prep."] },
  ],
  notebooks: [
    { ts: "MOST RECENT", txt: ["Cardinality reduction notes — ", { b: "May 2026" }, "."] },
    { ts: "TAGGED",      txt: ["6 notes across observability, MCP, rhetoric, homelab."] },
  ],
  repositories: [
    { ts: "ACTIVE", txt: [{ b: "6 repos" }, " · public + sandbox."] },
    { ts: "FOCUS",  txt: ["MCP tooling, observability economics, evals."] },
  ],
  signal: [
    { ts: "RESPONSE", txt: ["~24h on weekdays."] },
    { ts: "TZ",       txt: ["IST · UTC+05:30."] },
  ],
};

const FRAGMENTS = [
  { quote: "Infrastructure is the substrate of inference.",        author: "field note 07:12" },
  { quote: "Failures are narratives. Observability is translation.", author: "operational note" },
  { quote: "Context is the most expensive resource. It decays, drifts, and fragments. Systems forget. Architectures must remember.", author: "notebook 07" },
  { quote: "We shape our tools, and thereafter our tools shape us.", author: "M. McLuhan · archived" },
];

const METRICS = [
  { k: "REPOS PUBLIC",    v: "6",        up: false },
  { k: "ESSAYS PUBLISHED",v: "1",        up: false },
  { k: "DRAFTS IN FLIGHT",v: "3",        up: false },
  { k: "FIELD NOTES",     v: "057",      up: true  },
  { k: "HOMELAB CORES",   v: "24",       up: false },
  { k: "HOMELAB RAM",     v: "125 GB",   up: false },
];

const TIMELINE = [
  { year: 2018, active: false, label: "B.Tech · KIIT" },
  { year: 2022, active: true,  label: "AWS / Dexing"  },
  { year: 2023, active: true,  label: "Mad About Sports" },
  { year: 2024, active: true,  label: "Goskins" },
  { year: 2025, active: true,  label: "Consult · Metrics Zero" },
  { year: 2026, active: true,  label: "MCP · Substack · Homelab" },
];

const REPO_STRIP = [
  { n: "ritw237/job-search-mcp",         s: "synced 2h"  },
  { n: "ritw237/demogen",                s: "synced 5h"  },
  { n: "ritw237/observability-cost-lab", s: "synced 14h" },
  { n: "ritw237/homelab",                s: "synced 1d"  },
];

const TELEMETRY = [
  { k: "node",     v: "BLR-01"    },
  { k: "uptime",   v: "28d 14h"   },
  { k: "state",    v: "nominal"   },
  { k: "tz",       v: "UTC+5:30"  },
  { k: "weather",  v: "27° HUMID" },
  { k: "session",  v: "7A21-1906" },
];

const LAYERS = [
  { k: "active threads", v: "4" },
  { k: "open drafts",    v: "3" },
  { k: "unfinished",     v: "12" },
];

Object.assign(window, {
  NAV, ESSAYS, PROJECTS, RECORD, NOTEBOOKS, REPOS, CHANNELS,
  AMBIENT_FEED, FRAGMENTS, METRICS, TIMELINE, REPO_STRIP, TELEMETRY, LAYERS,
});
