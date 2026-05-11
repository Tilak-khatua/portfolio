import { motion } from 'framer-motion'
import { tracks, vibe } from '../../data/tracks'
import './rotation.css'

export default function Rotation() {
  const total = tracks.length

  return (
    <section id="play" className="rot">
      <div className="rot-intro mono">
        <div className="rot-label">[ ROTATION / top_tracks.m3u ]</div>
        <h2 className="rot-heading display">on rotation</h2>
        <div className="rot-sub">
          what's been living in my head lately.{' '}
          <span style={{ opacity: 0.55 }}>handpicked, not algorithmic.</span>
        </div>
      </div>

      <div className="rot-grid">
        <motion.div
          className="rot-list win"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="win-bar">
            <div className="win-dots">
              <span className="win-dot red" />
              <span className="win-dot yellow" />
              <span className="win-dot green" />
            </div>
            <div className="win-title">winamp.playlist — tilak's top {total}</div>
            <div className="win-actions">
              <span className="win-action">_</span>
              <span className="win-action">□</span>
              <span className="win-action">×</span>
            </div>
          </div>

          <div className="rot-table" role="list">
            <div className="rot-row rot-row-head mono" aria-hidden>
              <span>#</span>
              <span>title / artist</span>
              <span className="rot-col-album">album</span>
              <span className="rot-col-plays">plays</span>
              <span className="rot-col-len">len</span>
            </div>

            {tracks.map((t) => (
              <motion.div
                key={t.rank}
                className="rot-row"
                role="listitem"
                style={{ ['--accent' as never]: `var(--${t.accent})` }}
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <span className="rot-rank mono">{String(t.rank).padStart(2, '0')}</span>

                <span className="rot-title-cell">
                  <span className="rot-art">
                    <span className="rot-art-inner" />
                  </span>
                  <span className="rot-title-text">
                    <span className="rot-title-song">{t.title}</span>
                    <span className="rot-title-artist mono">{t.artist}</span>
                  </span>
                </span>

                <span className="rot-album mono rot-col-album">{t.album}</span>

                <span className="rot-plays mono rot-col-plays">
                  <span className="rot-plays-bar">
                    <span
                      className="rot-plays-fill"
                      style={{ width: `${(parseInt(t.plays, 10) / 320) * 100}%` }}
                    />
                  </span>
                  <span className="rot-plays-num">{t.plays}</span>
                </span>

                <span className="rot-len mono rot-col-len">{t.duration}</span>
              </motion.div>
            ))}
          </div>

          <div className="rot-status mono">
            <span>▮▮ paused · {total} tracks · mood: {vibe.mood}</span>
          </div>
        </motion.div>

        <motion.aside
          className="rot-side win"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="win-bar win-bar-light">
            <div className="win-dots">
              <span className="win-dot red" />
              <span className="win-dot yellow" />
              <span className="win-dot green" />
            </div>
            <div className="win-title">vibe.txt</div>
          </div>
          <div className="rot-side-body">
            <div className="label">current mood</div>
            <p className="rot-side-mood serif">{vibe.mood}</p>

            <div className="label" style={{ marginTop: 18 }}>last updated</div>
            <p className="rot-side-updated mono">{vibe.lastUpdated}</p>

            <div className="rot-side-foot mono">
              <span>♪ not a spotify wrapped — just taste</span>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  )
}
