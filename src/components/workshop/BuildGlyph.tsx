export default function BuildGlyph({ slug }: { slug: string }) {
  return (
    <svg className="build-glyph" viewBox="0 0 100 78" aria-hidden="true">
      <rect className="glyph-paper" x="1" y="1" width="98" height="76" rx="2" />
      {slug === 'conversql' ? <>
        <path className="glyph-ink" d="M12 15h35v20H24l-9 6v-6h-3zM56 40h32v23H56zM56 47h32m-32 8h32M67 40v23" />
        <text x="21" y="28">ASK</text>
        <path className="glyph-flow" d="M45 26h24v9m-4-4 4 4 4-4" />
      </> : slug === 'eldridge-morgan' ? <>
        <rect className="glyph-ink" x="20" y="12" width="50" height="49" />
        <path className="glyph-ink" d="M27 48h33m-33 6h24m26-34h6v46H34v-4" />
        <text className="glyph-serif" x="28" y="41">Aa</text>
        <path className="glyph-flow" d="M65 8v58" />
      </> : <>
        <path className="glyph-ink" d="M17 19h49v12H17zm0 19h49v12H17zm0 19h49v9H17zM22 25h19m-19 19h29m-29 18h14" />
        <path className="glyph-flow" d="M72 22c20 0 20 34 0 34m4-5-5 5 5 5" />
      </>}
      <circle className="glyph-tick" cx="87" cy="12" r="3" />
    </svg>
  )
}
