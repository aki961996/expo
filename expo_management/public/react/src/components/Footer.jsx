export default function Footer({ isDark }) {
  const c = {
    bg:        isDark ? '#080808' : '#F8F7F4',
    border:    isDark ? '#1A1A1A' : '#E5E4E0',
    text:      isDark ? '#F5F5F5' : '#111111',
    textMuted: isDark ? '#9CA3AF' : '#4B5563',
    textDim:   isDark ? '#6B7280' : '#9CA3AF',
    textFaint: isDark ? '#4B5563' : '#B0AFA9',
    card:      isDark ? '#0F0F0F' : '#FFFFFF',
    btnBg:     isDark ? '#141414' : '#F0EFEC',
  }

  const links = {
    Platform: ['Browse Events', 'Book a Stall', 'Visitor Registration', 'Organizer Portal'],
    Support:  ['Help Center', 'Contact Us', 'Cancellation Policy', 'Terms of Service'],
    Company:  ['About Faircode', 'Careers', 'Press Kit', 'Privacy Policy'],
  }

  const socials = [
    {
      label: 'Twitter',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      ),
    },
    {
      label: 'Instagram',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
      ),
    },
  ]

  return (
    <footer style={{ background: c.bg, borderTop: `1px solid ${c.border}`, fontFamily: 'DM Sans, sans-serif' }}>

      {/* ── TOP BAND ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 2rem 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, flexWrap: 'wrap' }}>

          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3"  y="3"  width="7" height="7" rx="1" fill="white"/>
                  <rect x="14" y="3"  width="7" height="7" rx="1" fill="white" opacity="0.6"/>
                  <rect x="3"  y="14" width="7" height="7" rx="1" fill="white" opacity="0.6"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.3"/>
                </svg>
              </div>
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: c.text }}>ExpoMgmt</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: c.textDim, lineHeight: 1.75, maxWidth: 260, marginBottom: 24 }}>
              India's premier platform for trade expos, exhibitions, and business conferences. Connect, discover, and grow.
            </p>

            {/* Socials */}
            <div style={{ display: 'flex', gap: 8 }}>
              {socials.map(s => (
                <button key={s.label} title={s.label}
                  style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${c.border}`, background: c.btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: c.textDim, transition: 'all 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B50'; e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.background = '#F59E0B10' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.color = c.textDim; e.currentTarget.style.background = c.btnBg }}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: c.textFaint, letterSpacing: '0.1em', marginBottom: 16 }}>{heading.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <a key={item} href="#"
                    style={{ fontSize: '0.82rem', color: c.textDim, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = c.text}
                    onMouseLeave={e => e.currentTarget.style.color = c.textDim}>
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '0.75rem', color: c.textFaint }}>
            © {new Date().getFullYear()} Faircode Technologies Pvt. Ltd. All rights reserved.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 6px #00FF87', display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: c.textFaint }}>All systems operational</span>
          </div>
        </div>
      </div>

    </footer>
  )
}