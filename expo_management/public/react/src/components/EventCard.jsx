import { useNavigate } from 'react-router-dom'

const STATUS_STYLE = {
  Ongoing:   { bg: '#E8F5EE', color: '#1A7A4A', dot: '#1A7A4A' },
  Upcoming:  { bg: '#E8EEF8', color: '#1A4A8A', dot: '#1A4A8A' },
  Completed: { bg: '#F0EDEA', color: '#7A6F68', dot: '#B5ADA6' },
  Cancelled: { bg: '#FEE8E8', color: '#8A1A1A', dot: '#C0392B' },
}

const CATEGORY_COLORS = {
  'Trade Fair':     ['#FEF0E8', '#E8531A'],
  'Conference':     ['#E8EEF8', '#1A4A8A'],
  'Expo':           ['#E8F5EE', '#1A7A4A'],
  'Seminar':        ['#F8F0FE', '#6A1A8A'],
  'Product Launch': ['#FEF8E8', '#8A6A1A'],
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// Frappe file path fix — private → public URL
function getFrappeImageUrl(path) {
  if (!path) return null
  // Already a full URL
  if (path.startsWith('http')) return path
  // Private files — can't display directly, return null
  if (path.startsWith('/private/')) return null
  // Public files — prepend site URL
  return path
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function EventCard({ event, index }) {
  const navigate = useNavigate()
  const st = STATUS_STYLE[event.status] || STATUS_STYLE.Upcoming
  const [catBg, catColor] = CATEGORY_COLORS[event.category] || ['#F0EDEA', '#7A6F68']

  const bannerUrl = getFrappeImageUrl(event.banner)
  const logoUrl   = getFrappeImageUrl(event.logo)

  return (
    <article
      onClick={() => navigate(`/event/${event.name}`)}
      style={{
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
        animation: 'fadeUp 0.4s ease forwards',
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(26,22,18,0.14)'
        e.currentTarget.style.borderColor = '#B5ADA6'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* ── BANNER ── */}
      <div style={{
        height: 160,
        position: 'relative',
        overflow: 'hidden',
        background: bannerUrl
          ? 'var(--cream2)'
          : `linear-gradient(135deg, ${catBg} 0%, white 100%)`,
      }}>
        {/* Banner image */}
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={event.event_name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          // Fallback pattern when no banner
          <>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `radial-gradient(circle at 20% 50%, ${catColor}20 0%, transparent 60%),
                                radial-gradient(circle at 80% 20%, ${catColor}15 0%, transparent 50%)`,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: '4.5rem',
              color: catColor, opacity: 0.06,
              letterSpacing: '-0.05em', userSelect: 'none',
            }}>
              {event.event_short_code}
            </div>
          </>
        )}

        {/* Dark overlay on banner image for badge readability */}
        {bannerUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)',
          }} />
        )}

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: '0.875rem', right: '0.875rem',
          padding: '0.25rem 0.75rem', borderRadius: 100,
          background: st.bg, color: st.color,
          fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: st.dot, flexShrink: 0,
            ...(event.status === 'Ongoing' ? { animation: 'pulse 2s infinite' } : {}),
          }} />
          {event.status}
        </div>

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '0.875rem', left: '0.875rem',
          padding: '0.2rem 0.65rem', borderRadius: 6,
          background: 'rgba(255,255,255,0.92)', color: catColor,
          fontSize: '0.68rem', fontWeight: 700,
          letterSpacing: '0.04em',
          backdropFilter: 'blur(8px)',
        }}>
          {event.category}
        </div>

        {/* Logo — bottom left corner of banner */}
        {logoUrl && (
          <div style={{
            position: 'absolute', bottom: '0.875rem', left: '0.875rem',
            width: 44, height: 44, borderRadius: 10,
            background: 'white', overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img
              src={logoUrl}
              alt="logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
              onError={e => { e.target.parentElement.style.display = 'none' }}
            />
          </div>
        )}

        {/* No logo — show initials */}
        {!logoUrl && (
          <div style={{
            position: 'absolute', bottom: '0.875rem', left: '0.875rem',
            width: 40, height: 40, borderRadius: 10,
            background: catColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 800, fontSize: '0.95rem', color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {getInitials(event.event_name)}
          </div>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700, fontSize: '1.05rem',
          letterSpacing: '-0.02em', color: 'var(--ink)',
          marginBottom: '0.2rem', lineHeight: 1.3,
        }}>
          {event.event_name}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginBottom: '1rem' }}>
          {event.organizer_name}
        </p>

        {/* Meta info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.1rem' }}>
          <MetaRow icon="📅" text={`${fmtDate(event.start_date)} — ${fmtDate(event.end_date)}`} />
          <MetaRow icon="📍" text={`${event.venue_name}, ${event.city}`} />
          <MetaRow icon="🏭" text={event.business_type} />
        </div>

        {/* Facility tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1.1rem' }}>
          {event.has_wifi     && <FacilityTag icon="📶" label="Wi-Fi" />}
          {event.has_ac       && <FacilityTag icon="❄️" label="AC" />}
          {event.has_food_court && <FacilityTag icon="🍽️" label="Food" />}
          {event.has_atm      && <FacilityTag icon="🏧" label="ATM" />}
          {event.has_first_aid && <FacilityTag icon="🏥" label="Medical" />}
          {event.has_prayer_room && <FacilityTag icon="🕌" label="Prayer" />}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '1rem', borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Stat
              value={event.visitor_capacity?.toLocaleString() || '—'}
              label="Visitor Cap."
            />
            <Stat
              value={event.exhibitor_capacity || '—'}
              label="Exhibitors"
            />
          </div>
          <span style={{
            fontSize: '0.8rem', fontWeight: 600,
            color: 'var(--orange)',
            display: 'flex', alignItems: 'center', gap: '0.2rem',
          }}>
            View →
          </span>
        </div>
      </div>
    </article>
  )
}

function MetaRow({ icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      fontSize: '0.82rem', color: 'var(--ink2)',
    }}>
      <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{icon}</span>
      <span style={{
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{text}</span>
    </div>
  )
}

function FacilityTag({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.55rem', borderRadius: 100,
      background: 'var(--cream2)', border: '1px solid var(--border)',
      fontSize: '0.7rem', color: 'var(--ink3)', fontWeight: 500,
    }}>
      {icon} {label}
    </span>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 700, fontSize: '1rem', color: 'var(--ink)',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--ink4)', marginTop: '0.05rem' }}>
        {label}
      </div>
    </div>
  )
}
