export type Track = {
  rank: number
  title: string
  artist: string
  album: string
  duration: string
  plays: string
  accent: 'hot' | 'cyan' | 'lime' | 'violet'
}

// edit this list whenever your taste evolves.
export const tracks: Track[] = [
  { rank: 1, title: 'Softcore', artist: 'The Neighbourhood', album: 'Hard to Imagine', duration: '4:09', plays: '312', accent: 'hot' },
  { rank: 2, title: 'There Is a Light That Never Goes Out', artist: 'The Smiths', album: 'The Queen Is Dead', duration: '3:52', plays: '248', accent: 'violet' },
  { rank: 3, title: 'The Lazy Song', artist: 'Bruno Mars', album: 'Doo-Wops & Hooligans', duration: '3:15', plays: '201', accent: 'lime' },
  { rank: 4, title: '11k', artist: 'Seedhe Maut', album: 'Nayaab', duration: '3:28', plays: '178', accent: 'cyan' },
  { rank: 5, title: 'The Hills', artist: 'The Weeknd', album: 'Beauty Behind the Madness', duration: '4:02', plays: '162', accent: 'hot' },
  { rank: 6, title: 'Sunflower', artist: 'Post Malone & Swae Lee', album: 'Spider-Man: Into the Spider-Verse', duration: '2:38', plays: '144', accent: 'lime' },
  { rank: 7, title: 'Apocalypse', artist: 'Cigarettes After Sex', album: 'Cigarettes After Sex', duration: '4:50', plays: '128', accent: 'violet' },
]

export const vibe = {
  mood: 'late-night debugging, 2am walks, the good kind of melancholy',
  lastUpdated: '2026 — check back when i get tired of these',
}
