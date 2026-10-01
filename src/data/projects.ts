export type Project = {
  slug: string
  filename: string
  title: string
  tagline: string
  year: string
  /** YYYY-MM. Drives the timeline and each tech node's first-use date. */
  started: string
  role: string
  stack: string[]
  accent: 'hot' | 'cyan' | 'lime' | 'violet'
  /** Three.js geometry name for the WebGL canvas. */
  geometry: string
  /** Two or three words set large on the card panel — what the thing *is*. */
  keyword: string[]
  summary: string
  problem: string
  process: string
  outcome: string
  links?: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    slug: 'third-angle',
    filename: 'thirdangle.case',
    title: 'Third Angle',
    tagline: 'digital twins of Mumbai and Delhi you can poll like an electorate.',
    year: '2026',
    started: '2026-06',
    role: 'design + build',
    stack: ['Rust', 'axum', 'SQLite', 'Amazon Bedrock', 'OSM + DEM', 'Docker'],
    accent: 'cyan',
    geometry: 'icosahedron',
    keyword: ['Synthetic', 'Electorate'],
    summary:
      'Synthetic-population election and opinion predictors for Mumbai and Delhi — reweighted survey microdata, an India-native persona schema, and a pixel map built from real terrain.',
    problem:
      'Indian election forecasting runs on small-sample polling that travels badly across a city like Mumbai, where a seat can turn on Marathi identity, caste, religion or which faction of a split party a neighbourhood stayed loyal to. Off-the-shelf models also carry Western assumptions — a class gradient on turnout, a left-right axis — that simply do not hold here, and none of them can answer a counterfactual.',
    process:
      'Built in Rust as a two-crate workspace: a prediction engine and a map pipeline over one shared persona layer. Population comes from IHDS microdata IPF-reweighted to Census-2011 marginals, so the joint distribution is real rather than assembled from margins, and each agent carries its weight into every estimate. The persona schema is native to the context — religion, caste, language and ward, not a translated US model — and the turnout model reflects India\'s flat-to-negative class gradient instead of importing the American one. Maps are generated from OSM plus DEM data clipped per city, with UTM projection and coastal flood limits tuned per geography. Cost is held down by clustering agents into demographic archetypes so one batched Bedrock call answers many at once, with a SQLite cache keyed on model and prompt making clean runs byte-reproducible.',
    outcome:
      'Scored against 40 real Lok Sabha and Vidhan Sabha 2024 constituency results, framed as two-alliance vote share so every target is sourced ground truth with no nulls. The rubric is machine-checkable: validate exits zero only above the score gate, a pre-push hook runs tests plus a smoke validation, and an adversarial critic has to fail to prove a gain is overfit before it counts. Swapping the rubric and data source moves the whole loop to a new city — which is how Delhi followed Mumbai.',
    links: [
      {
        label: 'github',
        href: 'https://github.com/Eldridge-Morgan/thirdangle/tree/merge-delhi-mumbai',
      },
    ],
  },
  {
    slug: 'recondart',
    filename: 'recondart.case',
    title: 'ReconDart',
    tagline: 'OSINT threat intel, minus the 14 open tabs.',
    year: '2026',
    started: '2026-04',
    role: 'design + build',
    stack: ['React', 'TypeScript', 'Flask', 'Python', 'ReactFlow', 'Gemini', 'Mandiant Capa'],
    accent: 'hot',
    geometry: 'dodecahedron',
    keyword: ['Threat', 'Intelligence'],
    summary: 'Automated threat-intelligence platform. Scan IPs, domains, emails, files — get a graph of what\'s dangerous and why.',
    problem: 'OSINT investigations mean juggling 10+ disconnected tools, copy-pasting indicators between them, and hoping you remember to map findings to MITRE ATT&CK. Analysts burn hours on plumbing instead of judgment.',
    process: 'Built a unified scanner that fans out to 10+ security APIs in parallel, runs static file analysis through Mandiant Capa, and feeds the aggregate into Google Gemini for human-readable recommendations. Frontend renders the results as an interactive attack graph via ReactFlow — you can click a node and see the chain. Python/Flask backend, React/TS frontend.',
    outcome: 'Investigations that used to take an afternoon collapse into a single scan. MITRE mappings come for free. Still a side project — but the loop works end-to-end.',
    links: [{ label: 'github', href: 'https://github.com/Tilak-khatua/Recondart' }],
  },
  {
    slug: 'hitl',
    filename: 'hitl.case',
    title: 'HITL Framework',
    tagline: 'ML models that know when to ask a human.',
    year: '2026',
    started: '2026-05',
    role: 'design + build',
    stack: ['FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'React', 'TypeScript', 'scikit-learn'],
    accent: 'violet',
    geometry: 'octahedron',
    keyword: ['Human', 'In The Loop'],
    summary: 'Human-in-the-loop platform for ML pipelines. Low-confidence predictions route to human reviewers; consensus becomes training data.',
    problem: 'ML models are confidently wrong at the worst times. Teams either eat the errors or manually review everything — there\'s rarely a middle path that routes only the uncertain cases to humans and feeds their answers back into training.',
    process: 'Built a full review pipeline: predictions arrive via a Python SDK, a configurable router auto-approves high-confidence ones and queues the rest (low confidence, high uncertainty, edge cases, 5% random sample) for human review in a React UI. Multi-annotator consensus with Cohen\'s kappa; disagreements on critical tasks escalate to an admin resolution queue. Labeled output exports straight back as training data, and a Celery task adapts routing thresholds from observed model performance.',
    outcome: 'A working predict → route → review → consensus → retrain loop, hardened with rate limiting, Redis caching, Prometheus metrics, and ~170 tests. The kind of infrastructure every applied-ML team ends up rebuilding badly — built once, properly.',
    links: [{ label: 'github', href: 'https://github.com/Tilak-khatua/hitl-framework' }],
  },
  {
    slug: 'conversql',
    filename: 'conversql.case',
    title: 'ConverSQL',
    tagline: 'natural language → SQL, without the prompt-engineering PhD.',
    year: '2025',
    started: '2025-03',
    role: 'design + build',
    stack: ['Next.js 15', 'tRPC', 'Prisma', 'AWS Bedrock', 'CDK'],
    accent: 'cyan',
    geometry: 'torus',
    keyword: ['Language', 'To SQL'],
    summary: 'AI SQL assistant — type a question, get a query, get an answer.',
    problem: 'Non-technical folks on data teams wait days for analyst bandwidth to answer one-line questions. Existing text-to-SQL tools either hallucinate joins or demand perfect prompts.',
    process: 'Built a schema-aware Bedrock (Claude Sonnet) pipeline that retrieves relevant tables first, then generates a typed query, then validates it before execution. Fronted with a Next.js 15 App Router UI and tRPC for type-safe RPC. CDK for all infra.',
    outcome: 'Query accuracy on the internal benchmark jumped meaningfully when we added the retrieval step. Shipped behind a feature flag; early users stopped pinging the analyst slack channel.',
  },
  {
    slug: 'eldridge-morgan',
    filename: 'eldridge.case',
    title: 'Eldridge Morgan',
    tagline: 'a brand site that doesn\'t look like every other brand site.',
    year: '2025',
    started: '2025-08',
    role: 'design + build',
    stack: ['Next.js 15', 'Payload CMS', 'Tailwind'],
    accent: 'hot',
    geometry: 'box',
    keyword: ['Editorial', 'Brand Site'],
    summary: 'Marketing site for a boutique firm. Editorial layout, CMS-driven, quiet motion.',
    problem: 'Existing site was a generic template. Leadership wanted something that matched the quality of the work — editorial, deliberate, not AI-template-slop.',
    process: 'Typography-first design pass (Instrument Serif + a tight sans). Built on Next.js 15 with Payload CMS so the team edits content without calling me. Motion kept small and on-brand — no parallax for its own sake.',
    outcome: 'Bounce rate down, time-on-page up. Client stopped getting "who made your website?" DMs for the wrong reasons.',
  },
  {
    slug: 'write-ahead-log',
    filename: 'wal.case',
    title: 'Write-Ahead Log',
    tagline: 'a tiny durable log, because databases have all the fun.',
    year: '2024',
    started: '2024-09',
    role: 'systems side project',
    stack: ['Python', 'pytest', 'fsync'],
    accent: 'lime',
    geometry: 'cone',
    keyword: ['Durable', 'By Design'],
    summary: 'A from-scratch WAL: append-only log, crash recovery, the whole deal.',
    problem: 'I wanted to actually understand durability. Reading papers only gets you so far — at some point you have to call `fsync` yourself.',
    process: 'Implemented append-only segments, CRC per record, checkpoint + recovery, and a property test suite that kills the process mid-write and verifies replay correctness.',
    outcome: 'Not production software — but I can now argue about durability in a bar and lose coherently.',
  },
]

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
