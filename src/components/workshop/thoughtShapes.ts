// Closed paths let the moving dots follow every composition without a new
// animation implementation. Coordinates share the same 520 × 485 canvas.
type ThoughtShape = {
  name: string
  curiosity: string
  tools: string
  overlap: string
  core: string
  curiosityLabelX?: number
  toolsLabelX?: number
}

function tiltedOrbit(angle: number) {
  const radians = angle * Math.PI / 180
  const radiusX = 176, radiusY = 90
  const curve = 4 * (Math.sqrt(2) - 1) / 3
  const point = (x: number, y: number) => `${(260 + x * Math.cos(radians) - y * Math.sin(radians)).toFixed(2)} ${(235 + x * Math.sin(radians) + y * Math.cos(radians)).toFixed(2)}`
  return `M${point(radiusX, 0)}C${point(radiusX, curve * radiusY)} ${point(curve * radiusX, radiusY)} ${point(0, radiusY)}C${point(-curve * radiusX, radiusY)} ${point(-radiusX, curve * radiusY)} ${point(-radiusX, 0)}C${point(-radiusX, -curve * radiusY)} ${point(-curve * radiusX, -radiusY)} ${point(0, -radiusY)}C${point(curve * radiusX, -radiusY)} ${point(radiusX, -curve * radiusY)} ${point(radiusX, 0)}Z`
}

export const thoughtShapes: readonly ThoughtShape[] = [
  {
    name: 'Overlapping circles',
    curiosity: 'M194 102a133 133 0 1 1 0 266 133 133 0 1 1 0-266',
    tools: 'M326 102a133 133 0 1 1 0 266 133 133 0 1 1 0-266',
    overlap: 'M260 120c78 35 104 148 0 230-104-82-78-195 0-230Z',
    core: 'm260 187 9 28 25-15-15 25 28 10-28 9 15 25-25-15-9 29-10-29-25 15 15-25-28-9 28-10-15-25 25 15Z',
  },
  {
    name: 'Soft corners',
    curiosity: 'M109 102H279Q327 102 327 150V320Q327 368 279 368H109Q61 368 61 320V150Q61 102 109 102Z',
    tools: 'M241 102H411Q459 102 459 150V320Q459 368 411 368H241Q193 368 193 320V150Q193 102 241 102Z',
    overlap: 'M244 122H276Q307 122 307 153V317Q307 348 276 348H244Q213 348 213 317V153Q213 122 244 122Z',
    core: 'M239 198H281Q297 198 297 214V256Q297 272 281 272H239Q223 272 223 256V214Q223 198 239 198Z',
  },
  {
    name: 'Diamond connections',
    curiosity: 'M194 88L341 235 194 382 47 235Z',
    tools: 'M326 88L473 235 326 382 179 235Z',
    overlap: 'M260 170L325 235 260 300 195 235Z',
    core: 'M260 192L303 235 260 278 217 235Z',
  },
  {
    name: 'Organic loops',
    curiosity: 'M194 100C255 73 327 125 319 199C351 259 308 353 227 365C158 395 69 338 70 267C37 200 100 113 194 100Z',
    tools: 'M326 100C265 73 193 125 201 199C169 259 212 353 293 365C362 395 451 338 450 267C483 200 420 113 326 100Z',
    overlap: 'M260 129C308 155 289 186 314 224C338 271 292 309 260 341C219 317 189 276 208 226C228 185 210 155 260 129Z',
    core: 'M260 190C275 211 292 202 290 224C315 234 297 248 283 251C291 279 270 273 260 265C244 287 230 263 237 251C207 246 220 227 233 224C223 199 249 206 260 190Z',
  },
  {
    name: 'Crossing orbits',
    curiosity: tiltedOrbit(38),
    tools: tiltedOrbit(-38),
    curiosityLabelX: 90,
    toolsLabelX: 430,
    overlap: 'M260 150C337 192 337 278 260 320C183 278 183 192 260 150Z',
    core: 'M260 192L297 213V257L260 278 223 257V213Z',
  },
]
