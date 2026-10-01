export const featuredQuestions = [
  { slug: 'third-angle', number: '01', question: 'Can you model a city?', topics: 'CITIES / DATA / SIMULATION', accent: 'teal' },
  { slug: 'recondart', number: '02', question: 'Where does the signal lead?', topics: 'THREATS / GRAPHS / INVESTIGATION', accent: 'orange' },
  { slug: 'hitl', number: '03', question: 'When should a model ask for help?', topics: 'DECISIONS / ML / PEOPLE', accent: 'violet' },
] as const

export const additionalQuestions = [
  { slug: 'conversql', number: '04', question: 'Can a question become a query?', topics: 'LANGUAGE / DATA / SQL', accent: 'teal' },
  { slug: 'eldridge-morgan', number: '05', question: 'What does quiet confidence look like?', topics: 'TYPE / COMPOSITION / MOTION', accent: 'orange' },
  { slug: 'write-ahead-log', number: '06', question: 'What survives a crash?', topics: 'RECORDS / DURABILITY / REPLAY', accent: 'lime' },
] as const

export const turnoutGroups = [
  { id: 'a', population: 120, turnout: 0.55 },
  { id: 'b', population: 80, turnout: 0.60 },
  { id: 'c', population: 100, turnout: 0.50 },
  { id: 'd', population: 100, turnout: 0.65 },
] as const

export const threatNodes = [
  { id: 'domain', label: 'Demo domain', detail: 'A fictional domain used to illustrate a scan result.', x: 75, y: 165 },
  { id: 'dns', label: 'DNS record', detail: 'A sample relationship returned by a fictional enrichment source.', x: 210, y: 75 },
  { id: 'address', label: 'Example address', detail: 'A documentation-only address. It is not a live indicator.', x: 215, y: 255 },
  { id: 'file', label: 'Sample file', detail: 'A placeholder artifact to show how evidence can connect.', x: 370, y: 145 },
  { id: 'behaviour', label: 'Behaviour tag', detail: 'A generic tag for a behaviour a real analyst would verify.', x: 505, y: 80 },
  { id: 'report', label: 'Example report', detail: 'A fictional report node that gathers related evidence.', x: 505, y: 235 },
] as const

export const threatEdges = [
  { from: 'domain', to: 'dns', relation: 'sample DNS record' },
  { from: 'domain', to: 'address', relation: 'sample resolution' },
  { from: 'dns', to: 'file', relation: 'example association' },
  { from: 'address', to: 'file', relation: 'example association' },
  { from: 'file', to: 'behaviour', relation: 'illustrative tag' },
  { from: 'file', to: 'report', relation: 'included in sample report' },
  { from: 'behaviour', to: 'report', relation: 'included in sample report' },
] as const

export const predictionConfidences = [0.99, 0.94, 0.91, 0.87, 0.82, 0.75, 0.69, 0.61, 0.54, 0.43, 0.28, 0.12]

export function getTurnout(multiplier: number) {
  const expected = turnoutGroups.reduce((total, group) => {
    return total + group.population * Math.max(0, Math.min(1, group.turnout * multiplier))
  }, 0)
  const population = turnoutGroups.reduce((total, group) => total + group.population, 0)
  return { expected, population, percent: expected / population * 100 }
}

export function seededUnit(index: number, seed: number) {
  const value = Math.sin((index + 1) * 127.1 + seed * 311.7) * 43758.5453
  return value - Math.floor(value)
}
