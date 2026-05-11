export type Project = {
  slug: string
  filename: string
  title: string
  tagline: string
  year: string
  role: string
  stack: string[]
  accent: 'hot' | 'cyan' | 'lime' | 'violet'
  summary: string
  problem: string
  process: string
  outcome: string
  links?: { label: string; href: string }[]
}

export const projects: Project[] = [
  {
    slug: 'recondart',
    filename: 'recondart.case',
    title: 'ReconDart',
    tagline: 'OSINT threat intel, minus the 14 open tabs.',
    year: '2026',
    role: 'design + build',
    stack: ['React', 'TypeScript', 'Flask', 'Python', 'ReactFlow', 'Gemini', 'Mandiant Capa'],
    accent: 'hot',
    summary: 'Automated threat-intelligence platform. Scan IPs, domains, emails, files — get a graph of what\'s dangerous and why.',
    problem: 'OSINT investigations mean juggling 10+ disconnected tools, copy-pasting indicators between them, and hoping you remember to map findings to MITRE ATT&CK. Analysts burn hours on plumbing instead of judgment.',
    process: 'Built a unified scanner that fans out to 10+ security APIs in parallel, runs static file analysis through Mandiant Capa, and feeds the aggregate into Google Gemini for human-readable recommendations. Frontend renders the results as an interactive attack graph via ReactFlow — you can click a node and see the chain. Python/Flask backend, React/TS frontend.',
    outcome: 'Investigations that used to take an afternoon collapse into a single scan. MITRE mappings come for free. Still a side project — but the loop works end-to-end.',
    links: [{ label: 'github', href: 'https://github.com/Tilak-khatua/Recondart' }],
  },
  {
    slug: 'conversql',
    filename: 'conversql.case',
    title: 'ConverSQL',
    tagline: 'natural language → SQL, without the prompt-engineering PhD.',
    year: '2025',
    role: 'design + build',
    stack: ['Next.js 15', 'tRPC', 'Prisma', 'AWS Bedrock', 'CDK'],
    accent: 'cyan',
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
    role: 'design + build',
    stack: ['Next.js 15', 'Payload CMS', 'Tailwind'],
    accent: 'hot',
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
    role: 'systems side project',
    stack: ['Python', 'pytest', 'fsync'],
    accent: 'lime',
    summary: 'A from-scratch WAL: append-only log, crash recovery, the whole deal.',
    problem: 'I wanted to actually understand durability. Reading papers only gets you so far — at some point you have to call `fsync` yourself.',
    process: 'Implemented append-only segments, CRC per record, checkpoint + recovery, and a property test suite that kills the process mid-write and verifies replay correctness.',
    outcome: 'Not production software — but I can now argue about durability in a bar and lose coherently.',
  },
  {
    slug: 'little-lemon',
    filename: 'lemon.case',
    title: 'Little Lemon',
    tagline: 'a restaurant app, except it actually works.',
    year: '2024',
    role: 'coursework / built anyway',
    stack: ['Django', 'MySQL', 'DRF'],
    accent: 'violet',
    summary: 'Booking + menu + auth for a fictional restaurant. Capstone project that I took too seriously.',
    problem: 'Standard capstone brief. Could have shipped the minimum. Chose violence instead.',
    process: 'Proper Django app: auth, DRF APIs, MySQL, token auth, role-based perms, a test suite, the works.',
    outcome: 'Passed the course. More importantly, built something I could show a backend interviewer without cringing.',
  },
]

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug)
}
