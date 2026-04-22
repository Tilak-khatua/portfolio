const ITEMS = [
  'UI/UX DESIGN', '✦', 'MACHINE LEARNING', '✦',
  'FIGMA', '✦', 'NEXT.JS', '✦', 'PYTHON', '✦',
  '3AM DEBUGGER', '✦', 'CTRL+Z ENTHUSIAST', '✦',
  'UI/UX DESIGN', '✦', 'MACHINE LEARNING', '✦',
  'FIGMA', '✦', 'NEXT.JS', '✦', 'PYTHON', '✦',
  '3AM DEBUGGER', '✦', 'CTRL+Z ENTHUSIAST', '✦',
]

export default function Marquee() {
  const items = ITEMS.map((item, i) =>
    item === '✦' ? <em key={i}>✦</em> : <span key={i}>{item}</span>
  )

  return (
    <div className="marquee-divider">
      <div className="marquee-row">{items}</div>
      <div className="marquee-row reverse">{items}</div>
    </div>
  )
}
