import { useNavigate } from 'react-router-dom'

const STATUS_STYLE = {
  Ongoing:   { bg: 'var(--green-bg)',  color: 'var(--green)',  dot: '#1A7A4A' },
  Upcoming:  { bg: 'var(--blue-bg)',   color: 'var(--blue)',   dot: '#1A4A8A' },
  Completed: { bg: 'var(--cream2)',    color: 'var(--ink3)',   dot: '#B5ADA6' },
  Cancelled: { bg: '#FEE8E8',         color: '#8A1A1A',       dot: '#C0392B' },
}

const CATEGORY_COLORS = {
  'Trade Fair':  ['#FEF0E8', '#E8531A'],
  'Conference':  ['#E8EEF8', '#1A4A8A'],
  'Expo':        ['#E8F5EE', '#1A7A4A'],
  'Seminar':     ['#F8F0FE', '#6A1A8A'],
  'Product Launch': ['#FEF8E8', '#8A6A1A'],
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventCard({ event, index }) {
  const navigate = useNavigate()
  const st = STATUS_STYLE[event.status] || STATUS_STYLE.Upcoming
  const [catBg, catColor] = CATEGORY_COLORS[event.category] || ['var(--cream2)', 'var(--ink3)']

  return (
    <article
      onClick={() => navigate(`/event/${event.name}`)}
      style={{
        background: 'white',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
        animation: `fadeUp 0.4s ease forwards`,
        animationDelay: `${index * 0.06}s`,
        opacity: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
        e.currentTarget.style.borderColor = 'var(--ink3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Card Top Banner */}
      <div style={{
        height: 140,
        background: `linear-gradient(135deg, ${catBg} 0%, white 100%)`,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}>
        {/* Big watermark text */}
        <div style={{
          position: 'absolute', fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '5rem', letterSpacing: '-0.05em',
          color: catColor, opacity: 0.07, userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          {event.event_short_code}
        </div>

        {/* Logo or initials */}
        {event.logo ? (
          <img src={event.logo} alt="" style={{ maxHeight: 60, maxWidth: 160, objectFit: 'contain', position: 'relative', zIndex: 1 }} />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: catColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem',
            color: 'white', position: 'relative', zIndex: 1,
          }}>
            {event.event_name?.charAt(0)}
          </div>
        )}

        {/* Status badge */}
        <div style={{
          position: 'absolute', top: '0.875rem', right: '0.875rem',
          padding: '0.25rem 0.7rem', borderRadius: 100,
          background: st.bg, color: st.color,
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
          {event.status}
        </div>

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '0.875rem', left: '0.875rem',
          padding: '0.2rem 0.65rem', borderRadius: 6,
          background: 'white', color: catColor,
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
          border: `1px solid ${catColor}30`,
        }}>
          {event.category}
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em',
          color: 'var(--ink)', marginBottom: '0.2rem', lineHeight: 1.3,
        }}>
          {event.event_name}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--ink3)', marginBottom: '1rem' }}>
          {event.organizer_name}
        </p>

        {/* Meta rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.1rem' }}>
          <MetaRow icon="📅" text={`${fmtDate(event.start_date)} — ${fmtDate(event.end_date)}`} />
          <MetaRow icon="📍" text={`${event.venue_name}, ${event.city}`} />
          <MetaRow icon="🏭" text={event.business_type} />
        </div>

        {/* Footer stats + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '1rem', borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Stat value={event.exhibitor_count || 0} label="Exhibitors" />
            <Stat value={`${((event.visitor_capacity || 0) / 1000).toFixed(0)}K`} label="Capacity" />
          </div>
          <span style={{
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--orange)',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            View Details →
          </span>
        </div>
      </div>
    </article>
  )
}

function MetaRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--ink2)' }}>
      <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>{icon}</span>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--ink4)', marginTop: '0.05rem' }}>{label}</div>
    </div>
  )
}
