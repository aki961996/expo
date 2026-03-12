import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventDetail } from '../api/frappe'

// ── Constants ─────────────────────────────────────────────────
const USE_MOCK = false

const CAT_ACCENT = {
  'Trade Fair':     '#F59E0B',
  'Conference':     '#60A5FA',
  'Expo':           '#00FF87',
  'Seminar':        '#A78BFA',
  'Product Launch': '#FB923C',
}

const STATUS = {
  Ongoing:   { label: 'LIVE NOW', color: '#00FF87', pulse: true },
  Upcoming:  { label: 'UPCOMING', color: '#60A5FA', pulse: false },
  Completed: { label: 'ENDED',    color: '#6B7280', pulse: false },
}

const FACILITY_MAP = [
  ['has_wifi',         '📶', 'Wi-Fi'],
  ['has_ac',           '❄️', 'Air Conditioning'],
  ['has_food_court',   '🍽️', 'Food Court'],
  ['has_atm',          '🏧', 'ATM'],
  ['has_first_aid',    '🏥', 'Medical Room'],
  ['has_fire_safety',  '🧯', 'Fire Safety'],
  ['has_security',     '🔒', 'Security'],
  ['has_drinking_water','💧', 'Drinking Water'],
  ['has_prayer_room',  '🕌', 'Prayer Room'],
]

const SVC_CATEGORY_COLOR = {
  Electricity: '#F59E0B',
  Furniture:   '#60A5FA',
  Branding:    '#A78BFA',
  IT:          '#00FF87',
  Logistics:   '#FB923C',
  Security:    '#F87171',
  Other:       '#9CA3AF',
}

const SVC_ICON = {
  Electricity: '⚡', Furniture: '🪑', Branding: '🎨',
  IT: '💻', Logistics: '🚛', Security: '🔒', Other: '🔧',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

function getFrappeImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/private/')) return null
  return path
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ── Main Component ────────────────────────────────────────────
export default function EventDetail() {
  const { code } = useParams()
  const navigate  = useNavigate()
  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('halls')

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    getEventDetail(code)
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [code])

  // ── Loading ──────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '2px solid #1F1F1F',
        borderTopColor: '#F59E0B',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Not found ────────────────────────────────────────────────
  if (!detail) return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: 20, opacity: 0.2 }}>◎</div>
      <h2 style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 800, fontSize: '1.8rem',
        color: '#F5F5F5', marginBottom: 8,
      }}>Event not found</h2>
      <p style={{ color: '#4B5563', marginBottom: 28 }}>The event you're looking for doesn't exist</p>
      <button onClick={() => navigate('/')} style={{
        padding: '10px 24px', borderRadius: 10,
        background: '#F59E0B', border: 'none',
        fontWeight: 700, color: '#000', cursor: 'pointer',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        ← All Events
      </button>
    </div>
  )

  const { event, halls = [], services = [], exhibitors = [] } = detail
  const accent   = CAT_ACCENT[event.category] || '#F59E0B'
  const st       = STATUS[event.status] || STATUS.Upcoming
  const banner   = getFrappeImageUrl(event.banner)
  const logo     = getFrappeImageUrl(event.logo)
  const facilities = FACILITY_MAP.filter(([key]) => event[key])

  const minPrice   = halls.flatMap(h => h.dimensions || []).reduce((m, d) => Math.min(m, (d.base_price || 0) * (d.area || 0)), Infinity)
  const availStalls = halls.flatMap(h => h.dimensions || []).reduce((s, d) => s + (d.available_stalls || 0), 0)
  const totalStalls = halls.flatMap(h => h.dimensions || []).reduce((s, d) => s + (d.total_stalls || 0), 0)

  const tabs = [
    { id: 'halls',      label: 'Halls & Stalls', count: halls.length },
    { id: 'services',   label: 'Services',        count: services.length },
    { id: 'exhibitors', label: 'Exhibitors',       count: exhibitors.length },
    { id: 'facilities', label: 'Facilities',       count: facilities.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        @keyframes bgMove  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0F0F0F; }
        ::-webkit-scrollbar-thumb { background: #2F2F2F; border-radius: 3px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid #1F1F1F', background: 'transparent',
            color: '#9CA3AF', fontSize: '0.82rem', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2F2F2F'; e.currentTarget.style.color = '#F5F5F5' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F1F'; e.currentTarget.style.color = '#9CA3AF' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            All Events
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live indicator */}
          {event.status === 'Ongoing' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 100,
              background: '#00FF8715', border: '1px solid #00FF8730',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF87', animation: 'livePulse 1.5s infinite', boxShadow: '0 0 8px #00FF87' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00FF87', letterSpacing: '0.1em' }}>LIVE NOW</span>
            </div>
          )}
          <button style={{
            padding: '7px 18px', borderRadius: 8,
            background: accent, border: 'none',
            fontSize: '0.82rem', fontWeight: 700,
            color: '#000', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            Book a Stall
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden', marginTop: 60 }}>
        {/* Banner */}
        {banner ? (
          <img src={banner} alt="" style={{
            width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35,
          }} onError={e => e.target.style.display = 'none'} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse at 20% 50%, ${accent}15 0%, transparent 60%),
              radial-gradient(ellipse at 80% 30%, ${accent}08 0%, transparent 50%)
            `,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }} />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,1) 100%)',
        }} />

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }} />

        {/* Hero content */}
        <div style={{
          position: 'absolute', bottom: 40, left: 0, right: 0,
          padding: '0 2rem', maxWidth: 1200, margin: '0 auto',
          animation: 'fadeUp 0.5s ease both',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            {/* Badges row */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {/* Status */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 100,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                border: `1px solid ${st.color}40`,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: st.color, flexShrink: 0,
                  animation: st.pulse ? 'livePulse 1.5s infinite' : 'none',
                  boxShadow: st.pulse ? `0 0 8px ${st.color}` : 'none',
                }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: st.color, letterSpacing: '0.1em' }}>
                  {st.label}
                </span>
              </div>

              {/* Category */}
              <div style={{
                padding: '4px 12px', borderRadius: 100,
                background: accent + '20', border: `1px solid ${accent}40`,
                fontSize: '0.65rem', fontWeight: 700,
                color: accent, letterSpacing: '0.08em',
                backdropFilter: 'blur(10px)',
              }}>
                {event.category?.toUpperCase()}
              </div>

              {/* Industry */}
              <div style={{
                padding: '4px 12px', borderRadius: 100,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '0.65rem', fontWeight: 600,
                color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em',
                backdropFilter: 'blur(10px)',
              }}>
                {event.business_type}
              </div>
            </div>

            {/* Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
              {/* Logo */}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
              }}>
                {logo ? (
                  <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }}
                    onError={e => e.target.style.display = 'none'} />
                ) : (
                  <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: accent }}>
                    {getInitials(event.event_name)}
                  </span>
                )}
              </div>

              <div>
                <h1 style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                  letterSpacing: '-0.03em', lineHeight: 1.1,
                  color: '#F5F5F5', marginBottom: 6,
                }}>
                  {event.event_name}
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#6B7280' }}>
                  Organised by <span style={{ color: '#9CA3AF', fontWeight: 500 }}>{event.organizer_name}</span>
                </p>
              </div>
            </div>

            {/* Info pills row */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <HeroPill icon="📅" text={`${fmtDate(event.start_date)} — ${fmtDate(event.end_date)}`} />
              <HeroPill icon="📍" text={`${event.venue_name}, ${event.city}`} />
              <HeroPill icon="👥" text={`${event.visitor_capacity?.toLocaleString() || '—'} visitors`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 6rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

        {/* ── LEFT CONTENT ── */}
        <div>
          {/* Description */}
          {event.description && (
            <div style={{
              background: '#0F0F0F', border: '1px solid #1A1A1A',
              borderRadius: 16, padding: 24, marginBottom: 20,
              animation: 'fadeUp 0.5s ease 0.1s both',
            }}>
              <SectionTitle title="About this Event" accent={accent} />
              <div style={{
                color: '#9CA3AF', lineHeight: 1.8, fontSize: '0.92rem',
              }} dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>
          )}

          {/* ── TABS ── */}
          <div style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}>
            {/* Tab bar */}
            <div style={{
              display: 'flex', gap: 4,
              background: '#0F0F0F', border: '1px solid #1A1A1A',
              borderRadius: 12, padding: 4, marginBottom: 16,
            }}>
              {tabs.filter(t => t.count > 0).map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8,
                    border: 'none', cursor: 'pointer',
                    background: activeTab === tab.id ? accent + '20' : 'transparent',
                    color: activeTab === tab.id ? accent : '#4B5563',
                    fontSize: '0.78rem', fontWeight: 600,
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    borderBottom: activeTab === tab.id ? `2px solid ${accent}` : '2px solid transparent',
                  }}
                >
                  {tab.label}
                  <span style={{
                    padding: '1px 7px', borderRadius: 100,
                    background: activeTab === tab.id ? accent + '25' : '#1A1A1A',
                    fontSize: '0.68rem', fontWeight: 700,
                    color: activeTab === tab.id ? accent : '#4B5563',
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── TAB: Halls & Stalls ── */}
            {activeTab === 'halls' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {halls.map((hall, i) => (
                  <HallCard key={i} hall={hall} accent={accent} />
                ))}
              </div>
            )}

            {/* ── TAB: Services ── */}
            {activeTab === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {services.map((svc, i) => (
                  <ServiceCard key={i} svc={svc} />
                ))}
              </div>
            )}

            {/* ── TAB: Exhibitors ── */}
            {activeTab === 'exhibitors' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {exhibitors.map((ex, i) => (
                  <ExhibitorChip key={i} ex={ex} accent={accent} />
                ))}
              </div>
            )}

            {/* ── TAB: Facilities ── */}
            {activeTab === 'facilities' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {facilities.map(([, icon, label]) => (
                  <FacilityCard key={label} icon={icon} label={label} accent={accent} />
                ))}
                {/* Parking */}
                {event.parking_cars > 0 && (
                  <FacilityCard icon="🚗" label={`${event.parking_cars} Car Parks`} accent={accent} />
                )}
                {event.washrooms_male > 0 && (
                  <FacilityCard icon="🚻" label={`${event.washrooms_male + (event.washrooms_female || 0)} Washrooms`} accent={accent} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR ── */}
        <div style={{ position: 'sticky', top: 76, animation: 'fadeIn 0.5s ease 0.2s both' }}>

          {/* Booking card */}
          <div style={{
            background: '#0F0F0F', border: `1px solid ${accent}30`,
            borderRadius: 18, overflow: 'hidden',
            boxShadow: `0 0 40px ${accent}08`,
          }}>
            {/* Price header */}
            <div style={{
              padding: '22px 22px 18px',
              background: `linear-gradient(135deg, ${accent}15, transparent)`,
              borderBottom: '1px solid #1A1A1A',
            }}>
              <div style={{ fontSize: '0.68rem', color: '#4B5563', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
                STARTING FROM
              </div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '2.2rem',
                color: '#F5F5F5', letterSpacing: '-0.03em',
              }}>
                {minPrice === Infinity ? '—' : `₹${minPrice.toLocaleString()}`}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: 2 }}>per stall · excl. GST</div>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid #1A1A1A',
            }}>
              {[
                [availStalls, 'Available'],
                [totalStalls, 'Total'],
                [halls.length, 'Halls'],
              ].map(([v, l], i) => (
                <div key={l} style={{
                  padding: '14px 10px', textAlign: 'center',
                  borderRight: i < 2 ? '1px solid #1A1A1A' : 'none',
                }}>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontWeight: 800, fontSize: '1.3rem',
                    color: i === 0 ? accent : '#F5F5F5',
                  }}>{v}</div>
                  <div style={{ fontSize: '0.65rem', color: '#4B5563', marginTop: 2, letterSpacing: '0.05em' }}>
                    {l.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>

            {/* Dates */}
            <div style={{ padding: '16px 22px', borderBottom: '1px solid #1A1A1A' }}>
              {[
                ['Opens', event.start_date],
                ['Closes', event.end_date],
                event.setup_start_date ? ['Setup', event.setup_start_date] : null,
              ].filter(Boolean).map(([label, date]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '6px 0',
                  borderBottom: '1px solid #141414',
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>{fmtDate(date)}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ padding: 20 }}>
              <button style={{
                width: '100%', padding: '14px',
                borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${accent}, ${accent}CC)`,
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '1rem',
                color: '#000', cursor: 'pointer',
                letterSpacing: '-0.01em',
                boxShadow: `0 8px 24px ${accent}30`,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}40` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}30` }}
              >
                Book a Stall →
              </button>
              <p style={{ fontSize: '0.7rem', color: '#374151', textAlign: 'center', marginTop: 10 }}>
                Free to register · Secure payment
              </p>
            </div>
          </div>

          {/* Quick facts */}
          <div style={{
            marginTop: 14, background: '#0F0F0F',
            border: '1px solid #1A1A1A', borderRadius: 14, padding: 16,
          }}>
            <div style={{ fontSize: '0.65rem', color: '#374151', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>
              EVENT DETAILS
            </div>
            {[
              ['Venue', `${event.venue_name}`],
              ['City', `${event.city}, ${event.country || 'India'}`],
              ['Visitors', event.visitor_capacity?.toLocaleString()],
              ['Exhibitors', event.exhibitor_capacity],
              ['Industry', event.business_type],
            ].map(([k, v]) => v ? (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: '1px solid #141414',
                fontSize: '0.78rem',
              }}>
                <span style={{ color: '#4B5563' }}>{k}</span>
                <span style={{ color: '#9CA3AF', fontWeight: 500, textAlign: 'right', maxWidth: 150 }}>{v}</span>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function HeroPill({ icon, text }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 100,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      fontSize: '0.78rem', color: '#9CA3AF',
    }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  )
}

function SectionTitle({ title, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
    }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <h2 style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 700, fontSize: '1rem', color: '#E5E7EB',
        letterSpacing: '-0.01em',
      }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
    </div>
  )
}

function HallCard({ hall, accent }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{
      background: '#0F0F0F', border: '1px solid #1A1A1A',
      borderRadius: 14, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = accent + '30'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1A1A1A'}
    >
      {/* Hall header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', cursor: 'pointer',
          background: open ? accent + '08' : 'transparent',
          borderBottom: open ? '1px solid #1A1A1A' : 'none',
          transition: 'background 0.2s',
        }}
      >
        <div>
          <h3 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 700, fontSize: '0.95rem', color: '#E5E7EB',
            marginBottom: 4,
          }}>{hall.hall_name}</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {hall.area && <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>{hall.area?.toLocaleString()} sqft</span>}
            {hall.ceiling_height && <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>↕ {hall.ceiling_height}ft</span>}
            {hall.power_capacity && <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>⚡ {hall.power_capacity}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 6,
            background: hall.hall_type === 'AC' ? '#60A5FA20' : '#F59E0B15',
            color: hall.hall_type === 'AC' ? '#60A5FA' : '#F59E0B',
            fontSize: '0.68rem', fontWeight: 700,
          }}>
            {hall.hall_type}
          </span>
          <span style={{ color: '#4B5563', fontSize: '0.8rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </div>
      </div>

      {/* Dimensions grid */}
      {open && (hall.dimensions || []).length > 0 && (
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {(hall.dimensions || []).map((dim, di) => (
            <DimCard key={di} dim={dim} accent={accent} />
          ))}
        </div>
      )}
    </div>
  )
}

function DimCard({ dim, accent }) {
  const [hov, setHov] = useState(false)
  const available = dim.available_stalls || 0
  const total     = dim.total_stalls || 0
  const pct       = total > 0 ? (available / total) * 100 : 0

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? accent + '0A' : '#141414',
        border: `1px solid ${hov ? accent + '40' : '#1F1F1F'}`,
        borderRadius: 10, padding: '14px 14px 12px',
        transition: 'all 0.2s', cursor: 'default',
      }}
    >
      <div style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 800, fontSize: '1.2rem', color: '#F5F5F5',
        marginBottom: 2,
      }}>{dim.dimension_label} m</div>

      <div style={{ fontSize: '0.78rem', color: accent, fontWeight: 600, marginBottom: 8 }}>
        ₹{dim.base_price?.toLocaleString()}<span style={{ color: '#4B5563', fontWeight: 400 }}>/sqft</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#1F1F1F', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          width: `${pct}%`,
          background: pct > 50 ? accent : pct > 20 ? '#F59E0B' : '#F87171',
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
        <span style={{ color: pct > 20 ? accent : '#F87171', fontWeight: 700 }}>{available}</span>
        <span> / {total} available</span>
      </div>

      {dim.corner_premium > 0 && (
        <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: 5 }}>
          +{dim.corner_premium}% corner
        </div>
      )}
    </div>
  )
}

function ServiceCard({ svc }) {
  const color = SVC_CATEGORY_COLOR[svc.category] || '#9CA3AF'
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', gap: 14, alignItems: 'flex-start',
        background: hov ? '#141414' : '#0F0F0F',
        border: `1px solid ${hov ? color + '30' : '#1A1A1A'}`,
        borderRadius: 12, padding: '14px 16px',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: color + '15', border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0,
      }}>
        {SVC_ICON[svc.category] || '🔧'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#E5E7EB', marginBottom: 2 }}>{svc.service_name}</div>
        <div style={{ fontSize: '0.72rem', color: '#4B5563', marginBottom: svc.description ? 4 : 0 }}>
          <span style={{ color, fontWeight: 600 }}>{svc.category}</span> · {svc.charge_type}
        </div>
        {svc.description && <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{svc.description}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color, fontSize: '1rem' }}>
          ₹{svc.price?.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: 2 }}>+{svc.tax_percent}% GST</div>
        {svc.is_mandatory ? (
          <div style={{ fontSize: '0.62rem', color: '#F87171', fontWeight: 700, marginTop: 3 }}>MANDATORY</div>
        ) : null}
      </div>
    </div>
  )
}

function ExhibitorChip({ ex, accent }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', borderRadius: 10,
        background: hov ? accent + '10' : '#0F0F0F',
        border: `1px solid ${hov ? accent + '40' : '#1A1A1A'}`,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: accent + '20', border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 800, fontSize: '0.75rem', color: accent, flexShrink: 0,
      }}>
        {ex.company_name?.charAt(0)}
      </div>
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E5E7EB' }}>{ex.company_name}</div>
        <div style={{ fontSize: '0.68rem', color: '#4B5563' }}>{ex.industry}</div>
      </div>
    </div>
  )
}

function FacilityCard({ icon, label, accent }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? accent + '08' : '#0F0F0F',
        border: `1px solid ${hov ? accent + '30' : '#1A1A1A'}`,
        borderRadius: 10, padding: '14px 10px',
        textAlign: 'center', transition: 'all 0.2s',
      }}
    >
      <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 500 }}>{label}</div>
    </div>
  )
}
