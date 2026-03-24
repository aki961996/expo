import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getEventDetail } from '../api/frappe'
import { useAuth } from '../context/AuthContext'

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
  ['has_wifi',          '📶', 'Wi-Fi'],
  ['has_ac',            '❄️', 'Air Conditioning'],
  ['has_food_court',    '🍽️', 'Food Court'],
  ['has_atm',           '🏧', 'ATM'],
  ['has_first_aid',     '🏥', 'Medical Room'],
  ['has_fire_safety',   '🧯', 'Fire Safety'],
  ['has_security',      '🔒', 'Security'],
  ['has_drinking_water','💧', 'Drinking Water'],
  ['has_prayer_room',   '🕌', 'Prayer Room'],
]

const SVC_CATEGORY_COLOR = {
  Electricity: '#F59E0B', Furniture: '#60A5FA', Branding: '#A78BFA',
  IT: '#00FF87', Logistics: '#FB923C', Security: '#F87171', Other: '#9CA3AF',
}
const SVC_ICON = {
  Electricity: '⚡', Furniture: '🪑', Branding: '🎨',
  IT: '💻', Logistics: '🚛', Security: '🔒', Other: '🔧',
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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

export default function EventDetail() {
  const { code }      = useParams()
  const navigate      = useNavigate()
  const location      = useLocation()
  const { exhibitor } = useAuth()

  const [detail, setDetail]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('halls')

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    getEventDetail(code)
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [code])

  const handleBookStall = () => {
    if (!exhibitor) {
      navigate('/login', { state: { redirect: `/event/${code}` } })
    } else {
      navigate(`/book/${code}`)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1F1F1F', borderTopColor: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!detail) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: 20, opacity: 0.2 }}>◎</div>
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#F5F5F5', marginBottom: 8 }}>Event not found</h2>
      <p style={{ color: '#4B5563', marginBottom: 28 }}>The event you're looking for doesn't exist</p>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 10, background: '#F59E0B', border: 'none', fontWeight: 700, color: '#000', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
        ← All Events
      </button>
    </div>
  )

  const { event, halls = [], services = [], exhibitors = [] } = detail
  const accent     = CAT_ACCENT[event.category] || '#F59E0B'
  const st         = STATUS[event.status] || STATUS.Upcoming
  const banner     = getFrappeImageUrl(event.banner)
  const logo       = getFrappeImageUrl(event.logo)
  const facilities = FACILITY_MAP.filter(([key]) => event[key])

  // ── Price: base_price × area ──
  const minPrice = halls.flatMap(h => h.dimensions || []).reduce((m, d) => {
    const stallArea  = d.area || ((d.width || 0) * (d.depth || 0))
    const stallPrice = (d.base_price || 0) * stallArea
    return stallPrice > 0 ? Math.min(m, stallPrice) : m
  }, Infinity)

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
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
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
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          border: '1px solid #1F1F1F', background: 'transparent',
          color: '#9CA3AF', fontSize: '0.82rem', fontWeight: 500,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2F2F2F'; e.currentTarget.style.color = '#F5F5F5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F1F'; e.currentTarget.style.color = '#9CA3AF' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          All Events
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {event.status === 'Ongoing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: '#00FF8715', border: '1px solid #00FF8730' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF87', animation: 'livePulse 1.5s infinite', boxShadow: '0 0 8px #00FF87' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00FF87', letterSpacing: '0.1em' }}>LIVE NOW</span>
            </div>
          )}
          <button onClick={handleBookStall} style={{
            padding: '7px 18px', borderRadius: 8,
            background: exhibitor ? accent : '#1A1A1A',
            border: exhibitor ? 'none' : `1px solid ${accent}40`,
            fontSize: '0.82rem', fontWeight: 700,
            color: exhibitor ? '#000' : accent,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {exhibitor ? 'Book a Stall →' : '🔒 Login to Book'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: 420, overflow: 'hidden', marginTop: 60 }}>
        {banner ? (
          <img src={banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
            onError={e => e.target.style.display = 'none'} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 20% 50%, ${accent}15 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, ${accent}08 0%, transparent 50%)` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,1) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, padding: '0 2rem', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: `1px solid ${st.color}40` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, animation: st.pulse ? 'livePulse 1.5s infinite' : 'none', boxShadow: st.pulse ? `0 0 8px ${st.color}` : 'none' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: st.color, letterSpacing: '0.1em' }}>{st.label}</span>
              </div>
              <div style={{ padding: '4px 12px', borderRadius: 100, background: accent + '20', border: `1px solid ${accent}40`, fontSize: '0.65rem', fontWeight: 700, color: accent, letterSpacing: '0.08em', backdropFilter: 'blur(10px)' }}>
                {event.category?.toUpperCase()}
              </div>
              <div style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)' }}>
                {event.business_type}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {logo ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} onError={e => e.target.style.display = 'none'} />
                  : <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: accent }}>{getInitials(event.event_name)}</span>}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#F5F5F5', marginBottom: 6 }}>
                  {event.event_name}
                </h1>
                <p style={{ fontSize: '0.88rem', color: '#6B7280' }}>
                  Organised by <span style={{ color: '#9CA3AF', fontWeight: 500 }}>{event.organizer_name}</span>
                </p>
              </div>
            </div>

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

        {/* LEFT */}
        <div>
          {event.description && (
            <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 16, padding: 24, marginBottom: 20, animation: 'fadeUp 0.5s ease 0.1s both' }}>
              <SectionTitle title="About this Event" accent={accent} />
              <div style={{ color: '#9CA3AF', lineHeight: 1.8, fontSize: '0.92rem' }} dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>
          )}

          <div style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {tabs.filter(t => t.count > 0).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activeTab === tab.id ? accent + '20' : 'transparent',
                  color: activeTab === tab.id ? accent : '#4B5563',
                  fontSize: '0.78rem', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  borderBottom: activeTab === tab.id ? `2px solid ${accent}` : '2px solid transparent',
                }}>
                  {tab.label}
                  <span style={{ padding: '1px 7px', borderRadius: 100, background: activeTab === tab.id ? accent + '25' : '#1A1A1A', fontSize: '0.68rem', fontWeight: 700, color: activeTab === tab.id ? accent : '#4B5563' }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === 'halls' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {halls.map((hall, i) => <HallCard key={i} hall={hall} accent={accent} />)}
              </div>
            )}
            {activeTab === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {services.map((svc, i) => <ServiceCard key={i} svc={svc} />)}
              </div>
            )}

            {/* ── EXHIBITORS TAB ── */}
            {activeTab === 'exhibitors' && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#4B5563', marginBottom: 14 }}>
                  <span style={{ color: accent, fontWeight: 700 }}>
                    {exhibitors.filter(e => e.has_digital_booth).length}
                  </span>
                  {' '}of {exhibitors.length} exhibitors have a digital booth —{' '}
                  <span style={{ color: '#6B7280' }}>click to explore</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {exhibitors.map((ex, i) => (
                    <ExhibitorRow
                      key={i}
                      ex={ex}
                      accent={accent}
                      onOpenBooth={() => navigate(`/booth/${code}/${ex.name}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {facilities.map(([, icon, label]) => <FacilityCard key={label} icon={icon} label={label} accent={accent} />)}
                {event.parking_cars > 0 && <FacilityCard icon="🚗" label={`${event.parking_cars} Car Parks`} accent={accent} />}
                {event.washrooms_male > 0 && <FacilityCard icon="🚻" label={`${event.washrooms_male + (event.washrooms_female || 0)} Washrooms`} accent={accent} />}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: 76, animation: 'fadeIn 0.5s ease 0.2s both' }}>
          <div style={{ background: '#0F0F0F', border: `1px solid ${accent}30`, borderRadius: 18, overflow: 'hidden', boxShadow: `0 0 40px ${accent}08` }}>
            <div style={{ padding: '22px 22px 18px', background: `linear-gradient(135deg, ${accent}15, transparent)`, borderBottom: '1px solid #1A1A1A' }}>
              <div style={{ fontSize: '0.68rem', color: '#4B5563', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>STARTING FROM</div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2.2rem', color: '#F5F5F5', letterSpacing: '-0.03em' }}>
                {minPrice === Infinity ? '—' : `₹${minPrice.toLocaleString()}`}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: 2 }}>smallest stall · excl. GST</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #1A1A1A' }}>
              {[[availStalls, 'Available'], [totalStalls, 'Total'], [halls.length, 'Halls']].map(([v, l], i) => (
                <div key={l} style={{ padding: '14px 10px', textAlign: 'center', borderRight: i < 2 ? '1px solid #1A1A1A' : 'none' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: i === 0 ? accent : '#F5F5F5' }}>{v}</div>
                  <div style={{ fontSize: '0.65rem', color: '#4B5563', marginTop: 2, letterSpacing: '0.05em' }}>{l.toUpperCase()}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 22px', borderBottom: '1px solid #1A1A1A' }}>
              {[['Opens', event.start_date], ['Closes', event.end_date], event.setup_start_date ? ['Setup', event.setup_start_date] : null].filter(Boolean).map(([label, date]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #141414' }}>
                  <span style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>{fmtDate(date)}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: 20 }}>
              <button onClick={handleBookStall} style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: exhibitor ? `linear-gradient(135deg, ${accent}, ${accent}CC)` : '#141414',
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem',
                color: exhibitor ? '#000' : accent, cursor: 'pointer', letterSpacing: '-0.01em',
                boxShadow: exhibitor ? `0 8px 24px ${accent}30` : 'none',
                border: exhibitor ? 'none' : `1px solid ${accent}30`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
                onMouseEnter={e => { if (exhibitor) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}40` } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = exhibitor ? `0 8px 24px ${accent}30` : 'none' }}
              >
                {exhibitor ? 'Book a Stall →' : '🔒 Login to Book'}
              </button>

              {!exhibitor && (
                <p style={{ fontSize: '0.72rem', color: '#4B5563', textAlign: 'center', marginTop: 10 }}>
                  <button onClick={() => navigate('/login', { state: { redirect: `/event/${code}` } })}
                    style={{ background: 'none', border: 'none', color: accent, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Login
                  </button>
                  {' '}or{' '}
                  <button onClick={() => navigate('/register')}
                    style={{ background: 'none', border: 'none', color: accent, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Register
                  </button>
                  {' '}to book a stall
                </p>
              )}
              {exhibitor && (
                <p style={{ fontSize: '0.7rem', color: '#374151', textAlign: 'center', marginTop: 10 }}>
                  Free to register · Secure payment
                </p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 14, background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: '0.65rem', color: '#374151', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>EVENT DETAILS</div>
            {[['Venue', event.venue_name], ['City', `${event.city}, ${event.country || 'India'}`], ['Visitors', event.visitor_capacity?.toLocaleString()], ['Exhibitors', event.exhibitor_capacity], ['Industry', event.business_type]].map(([k, v]) => v ? (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #141414', fontSize: '0.78rem' }}>
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

// ── Exhibitor Row ─────────────────────────────────────────────
function ExhibitorRow({ ex, accent, onOpenBooth }) {
  const [hov, setHov] = useState(false)
  const hasBooth = !!ex.has_digital_booth

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, padding: '14px 16px', borderRadius: 12,
        background: hov ? (hasBooth ? accent + '08' : '#111') : '#0F0F0F',
        border: `1px solid ${hov ? (hasBooth ? accent + '40' : '#2A2A2A') : '#1A1A1A'}`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: hasBooth ? accent + '20' : '#1A1A1A',
          border: `1px solid ${hasBooth ? accent + '40' : '#2A2A2A'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
          fontSize: '0.85rem', color: hasBooth ? accent : '#4B5563',
        }}>
          {ex.company_name?.charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#E5E7EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ex.company_name}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: 1 }}>{ex.industry}</div>
          {hasBooth && ex.booth_tagline && (
            <div style={{ fontSize: '0.7rem', color: accent, marginTop: 3, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              "{ex.booth_tagline}"
            </div>
          )}
        </div>
      </div>

      {hasBooth ? (
        <button onClick={onOpenBooth} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8, border: 'none',
          background: accent + '20', color: accent,
          fontSize: '0.75rem', fontWeight: 700,
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          flexShrink: 0, transition: 'background 0.2s', whiteSpace: 'nowrap',
        }}
          onMouseEnter={e => e.currentTarget.style.background = accent + '35'}
          onMouseLeave={e => e.currentTarget.style.background = accent + '20'}
        >
          <span style={{ fontSize: '0.8rem' }}>🏪</span>
          View Digital Booth
        </button>
      ) : (
        <span style={{
          fontSize: '0.68rem', color: '#2A2A2A', fontWeight: 500,
          padding: '5px 10px', borderRadius: 6,
          background: '#141414', border: '1px solid #1F1F1F',
          flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          No booth yet
        </span>
      )}
    </div>
  )
}

// ── Other Components ──────────────────────────────────────────
function HeroPill({ icon, text }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: '#9CA3AF' }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  )
}

function SectionTitle({ title, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#E5E7EB', letterSpacing: '-0.01em' }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
    </div>
  )
}

function HallCard({ hall, accent }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = accent + '30'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1A1A1A'}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', background: open ? accent + '08' : 'transparent', borderBottom: open ? '1px solid #1A1A1A' : 'none', transition: 'background 0.2s' }}>
        <div>
          <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#E5E7EB', marginBottom: 4 }}>{hall.hall_name}</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {hall.area && <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>{hall.area?.toLocaleString()} sqft</span>}
            {hall.ceiling_height && <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>↕ {hall.ceiling_height}ft</span>}
            {hall.power_capacity && <span style={{ fontSize: '0.72rem', color: '#4B5563' }}>⚡ {hall.power_capacity}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '3px 10px', borderRadius: 6, background: hall.hall_type === 'AC' ? '#60A5FA20' : '#F59E0B15', color: hall.hall_type === 'AC' ? '#60A5FA' : '#F59E0B', fontSize: '0.68rem', fontWeight: 700 }}>{hall.hall_type}</span>
          <span style={{ color: '#4B5563', fontSize: '0.8rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
        </div>
      </div>
      {open && (hall.dimensions || []).length > 0 && (
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {(hall.dimensions || []).map((dim, di) => <DimCard key={di} dim={dim} accent={accent} />)}
        </div>
      )}
    </div>
  )
}

// ── DimCard — total price + per sqft ─────────────────────────
function DimCard({ dim, accent }) {
  const [hov, setHov] = useState(false)
  const available  = dim.available_stalls || 0
  const total      = dim.total_stalls || 0
  const pct        = total > 0 ? (available / total) * 100 : 0
  const stallArea  = dim.area || ((dim.width || 0) * (dim.depth || 0))
  const totalPrice = (dim.base_price || 0) * stallArea

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? accent + '0A' : '#141414', border: `1px solid ${hov ? accent + '40' : '#1F1F1F'}`, borderRadius: 10, padding: '14px 14px 12px', transition: 'all 0.2s' }}>

      {/* Dimension label */}
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#F5F5F5', marginBottom: 6 }}>
        {dim.dimension_label} m
      </div>

      {/* Total price — prominent */}
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: accent, marginBottom: 2 }}>
        ₹{totalPrice.toLocaleString()}
      </div>

      {/* Per sqft — subtle */}
      <div style={{ fontSize: '0.7rem', color: '#4B5563', marginBottom: 10 }}>
        ₹{dim.base_price?.toLocaleString()}/sqft · {stallArea} sqm
      </div>

      {/* Availability bar */}
      <div style={{ height: 3, background: '#1F1F1F', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: pct > 50 ? accent : pct > 20 ? '#F59E0B' : '#F87171', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
        <span style={{ color: pct > 20 ? accent : '#F87171', fontWeight: 700 }}>{available}</span>
        <span> / {total} available</span>
      </div>
      {dim.corner_premium > 0 && (
        <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: 5 }}>+{dim.corner_premium}% corner premium</div>
      )}
    </div>
  )
}

function ServiceCard({ svc }) {
  const color = SVC_CATEGORY_COLOR[svc.category] || '#9CA3AF'
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: hov ? '#141414' : '#0F0F0F', border: `1px solid ${hov ? color + '30' : '#1A1A1A'}`, borderRadius: 12, padding: '14px 16px', transition: 'all 0.2s' }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '15', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
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
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color, fontSize: '1rem' }}>₹{svc.price?.toLocaleString()}</div>
        <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: 2 }}>+{svc.tax_percent}% GST</div>
        {svc.is_mandatory && <div style={{ fontSize: '0.62rem', color: '#F87171', fontWeight: 700, marginTop: 3 }}>MANDATORY</div>}
      </div>
    </div>
  )
}

function FacilityCard({ icon, label, accent }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? accent + '08' : '#0F0F0F', border: `1px solid ${hov ? accent + '30' : '#1A1A1A'}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', transition: 'all 0.2s' }}>
      <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 500 }}>{label}</div>
    </div>
  )
}