import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getEventDetail } from '../api/frappe'
import { useAuth } from '../context/AuthContext'
import { useThemeStyles } from '../hooks/useThemeStyles'
import StallPickerModal from '../components/StallPickerModal'

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
  // Relative path — prepend server origin
  if (path.startsWith('/files/') || path.startsWith('/public/')) {
    return window.location.origin + path
  }
  return path
}
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}
function getDimKey(hall, dim) {
  return `${hall.hall_code || hall.name || hall.hall_name}__${dim.dimension_label}`
}
function getDimPrice(dim) {
  const area = dim.area || ((dim.width || 0) * (dim.depth || 0))
  return (dim.base_price || 0) * area
}

// ─── LAYOUT CONSTANTS ───────────────────────────────────────
const MAX_W   = 1200
const SIDEBAR = 300
const GAP     = 32
const PX      = '2rem'

export default function EventDetail() {
  const { code }      = useParams()
  const navigate      = useNavigate()
  const { exhibitor } = useAuth()
  const location      = useLocation()
  const t             = useThemeStyles()

  const [detail, setDetail]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('services')
  const [selected, setSelected]         = useState(new Map())
  const [showStallPicker, setShowStallPicker] = useState(false)

  useEffect(() => {
    if (exhibitor) setActiveTab('halls')
    else           setActiveTab('services')
  }, [exhibitor])

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    getEventDetail(code)
      .then(d => {
        setDetail(d)
        setLoading(false)
        const allEntries = (d.halls || []).flatMap(hall =>
          (hall.dimensions || []).map(dim => ({ dim, hall }))
        )
        const toRestore = location.state?.restoreSelected
        if (toRestore?.length > 0) {
          const restoredMap = new Map()
          toRestore.forEach(({ hallCode, dimLabel }) => {
            const hall = (d.halls || []).find(h => h.hall_code === hallCode || h.name === hallCode)
            if (!hall) return
            const dim = (hall.dimensions || []).find(x => x.dimension_label === dimLabel)
            if (!dim) return
            restoredMap.set(getDimKey(hall, dim), { dim, hall })
          })
          if (restoredMap.size > 0) { setSelected(restoredMap); return }
        }
        if (allEntries.length > 0) {
          const cheapest = allEntries.reduce((m, x) => getDimPrice(x.dim) < getDimPrice(m.dim) ? x : m)
          setSelected(new Map([[getDimKey(cheapest.hall, cheapest.dim), cheapest]]))
        }
      })
      .catch(() => setLoading(false))
  }, [code])

  const toggleDim = (hall, dim) => {
    const key = getDimKey(hall, dim)
    setSelected(prev => {
      const next = new Map(prev)
      next.has(key) ? next.delete(key) : next.set(key, { dim, hall })
      return next
    })
  }

  const handleBookStall = () => {
    if (!exhibitor) navigate('/login', { state: { redirect: `/event/${code}` } })
    else if (selected.size === 0) setActiveTab('halls')
    else setShowStallPicker(true)
  }

  const handleStallPickerConfirm = (pickedStalls) => {
    setShowStallPicker(false)
    navigate(`/book/${code}`, { state: { selected: pickedStalls } })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: t.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid ' + t.borderDefault, borderTopColor: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!detail) return (
    <div style={{ minHeight: '100vh', background: t.bgBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ fontSize: '4rem', marginBottom: 20, opacity: 0.2 }}>◎</div>
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: t.textPrimary, marginBottom: 8 }}>Event not found</h2>
      <p style={{ color: t.textFaint, marginBottom: 28 }}>The event you're looking for doesn't exist</p>
      <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 10, background: '#F59E0B', border: 'none', fontWeight: 700, color: '#000', cursor: 'pointer' }}>← All Events</button>
    </div>
  )

  const { event, halls = [], services = [], exhibitors = [] } = detail
  const accent     = CAT_ACCENT[event.category] || '#F59E0B'
  const st         = STATUS[event.status] || STATUS.Upcoming
  const banner     = getFrappeImageUrl(event.banner)
  const logo       = getFrappeImageUrl(event.logo)
  const facilities = FACILITY_MAP.filter(([key]) => event[key])

  const selectedArr  = [...selected.values()]
  const hasSelection = selectedArr.length > 0
  const totalPrice   = selectedArr.reduce((s, x) => s + getDimPrice(x.dim), 0)
  const statAvail    = selectedArr.reduce((s, x) => s + (x.dim.available_stalls || 0), 0)
  const statTotal    = selectedArr.reduce((s, x) => s + (x.dim.total_stalls || 0), 0)

  const tabs = [
    ...(exhibitor ? [{ id: 'halls',      label: 'Halls & Stalls', count: halls.length }] : []),
    { id: 'services',   label: 'Services',   count: services.length },
    { id: 'exhibitors', label: 'Exhibitors', count: exhibitors.length },
    { id: 'facilities', label: 'Facilities', count: facilities.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: t.bgBase, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.7)} }
        @keyframes flash     { 0%{opacity:0;transform:translateY(4px)} 100%{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2F2F2F; border-radius: 3px; }
        .event-desc p { margin: 0 0 10px 0; }
        .event-desc p:last-child { margin-bottom: 0; }
        .event-desc ul, .event-desc ol { padding-left: 20px; margin: 0 0 10px 0; }
        .event-desc li { margin-bottom: 4px; }
      `}</style>

      <StallPickerModal
        open={showStallPicker}
        onClose={() => setShowStallPicker(false)}
        selectedDims={[...selected.values()]}
        eventCode={code}
        accent={accent}
        onConfirm={handleStallPickerConfirm}
      />

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${PX}`, background: t.navBg, backdropFilter: 'blur(20px)', borderBottom: '1px solid ' + t.borderSubtle }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, border: '1px solid ' + t.borderDefault, background: 'transparent', color: t.textSecondary, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderHover; e.currentTarget.style.color = t.textPrimary }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.borderDefault; e.currentTarget.style.color = t.textSecondary }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          All Events
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {event.status === 'Ongoing' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: '#00FF8715', border: '1px solid #00FF8730' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00FF87', animation: 'livePulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#00FF87', letterSpacing: '0.1em' }}>LIVE NOW</span>
            </div>
          )}
          <button onClick={handleBookStall}
            style={{ padding: '8px 20px', borderRadius: 8, background: exhibitor ? accent : 'transparent', border: exhibitor ? 'none' : `1px solid ${accent}50`, fontSize: '0.82rem', fontWeight: 700, color: exhibitor ? '#000' : accent, cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {exhibitor ? 'Express Interest →' : '🔒 Login to Book'}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ position: 'relative', height: 400, overflow: 'hidden', marginTop: 60 }}>
        {banner
          ? <img src={banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} onError={e => e.target.style.display = 'none'} />
          : <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 20% 60%, ${accent}18 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, ${accent}10 0%, transparent 50%)` }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${accent}05 1px, transparent 1px), linear-gradient(90deg, ${accent}05 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
            </div>
        }
        {/* gradient fade to page bg */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 55%, rgba(8,8,8,1) 100%)' }} />
        {/* accent line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)` }} />

        {/* Hero content — aligned with main grid */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `0 ${PX} 36px` }}>
          <div style={{ maxWidth: MAX_W, margin: '0 auto' }}>
            {/* Status + category badges */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', border: `1px solid ${st.color}40` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, animation: st.pulse ? 'livePulse 1.5s infinite' : 'none' }} />
                <span style={{ fontSize: '0.63rem', fontWeight: 700, color: st.color, letterSpacing: '0.1em' }}>{st.label}</span>
              </div>
              <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 100, background: accent + '22', border: `1px solid ${accent}45`, fontSize: '0.63rem', fontWeight: 700, color: accent, letterSpacing: '0.08em', backdropFilter: 'blur(10px)' }}>{event.category?.toUpperCase()}</div>
              <div style={{ display: 'inline-flex', padding: '4px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.63rem', fontWeight: 500, color: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(10px)' }}>{event.business_type}</div>
            </div>

            {/* Logo + title */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                {logo
                  ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} onError={e => e.target.style.display = 'none'} />
                  : <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: accent }}>{getInitials(event.event_name)}</span>}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(1.8rem, 3.8vw, 2.8rem)', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#FFFFFF', margin: '0 0 6px' }}>{event.event_name}</h1>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Organised by <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{event.organizer_name}</span></p>
              </div>
            </div>

            {/* Pills row */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                ['📅', `${fmtDate(event.start_date)} — ${fmtDate(event.end_date)}`],
                ['📍', `${event.venue_name}, ${event.city}`],
                ['👥', `${event.visitor_capacity?.toLocaleString() || '—'} visitors`],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 100, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
                  <span style={{ fontSize: 14 }}>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: MAX_W, margin: '0 auto', padding: `28px ${PX} 80px`, display: 'grid', gridTemplateColumns: `1fr ${SIDEBAR}px`, gap: GAP, alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div>
          {/* About */}
          {event.description && (
            <div style={{ background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 16, padding: '22px 24px', marginBottom: 20, animation: 'fadeUp 0.4s ease 0.05s both' }}>
              <SectionTitle title="About this Event" accent={accent} />
              <div className="event-desc" style={{ color: t.textSecondary, lineHeight: 1.8, fontSize: '0.91rem' }} dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>
          )}

          {/* Tabs */}
          <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
            <div style={{ display: 'flex', gap: 4, background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 12, padding: 4, marginBottom: 18 }}>
              {tabs.filter(tab => tab.count > 0).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ flex: 1, padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: activeTab === tab.id ? accent + '20' : 'transparent', color: activeTab === tab.id ? accent : t.textFaint, borderBottom: activeTab === tab.id ? `2px solid ${accent}` : '2px solid transparent' }}>
                  {tab.label}
                  <span style={{ padding: '1px 7px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, background: activeTab === tab.id ? accent + '25' : t.bgHover, color: activeTab === tab.id ? accent : t.textFaint }}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Tab: Halls */}
            {activeTab === 'halls' && exhibitor && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.72rem', color: t.textFaint, padding: '4px 2px' }}>
                  👆 Click a stall size to select · Select multiple to compare prices
                </div>
                {halls.map((hall, i) => (
                  <HallCard key={i} hall={hall} accent={accent} selected={selected} onToggleDim={toggleDim} />
                ))}
              </div>
            )}

            {/* Tab: Services */}
            {activeTab === 'services' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {services.map((svc, i) => <ServiceCard key={i} svc={svc} isLoggedIn={!!exhibitor} />)}
              </div>
            )}

            {/* Tab: Exhibitors */}
            {activeTab === 'exhibitors' && (
              <div>
                <div style={{ fontSize: '0.74rem', color: t.textFaint, marginBottom: 14 }}>
                  <span style={{ color: accent, fontWeight: 700 }}>{exhibitors.filter(e => e.has_digital_booth).length}</span>
                  {' '}of {exhibitors.length} exhibitors have a digital booth
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {exhibitors.map((ex, i) => <ExhibitorRow key={i} ex={ex} accent={accent} onOpenBooth={() => navigate(`/booth/${code}/${ex.name}`)} />)}
                </div>
              </div>
            )}

            {/* Tab: Facilities */}
            {activeTab === 'facilities' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {facilities.map(([, icon, label]) => <FacilityCard key={label} icon={icon} label={label} accent={accent} />)}
                {event.parking_cars > 0 && <FacilityCard icon="🚗" label={`${event.parking_cars} Car Parks`} accent={accent} />}
                {event.washrooms_male > 0 && <FacilityCard icon="🚻" label={`${event.washrooms_male + (event.washrooms_female || 0)} Washrooms`} accent={accent} />}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — SIDEBAR */}
        <div style={{ position: 'sticky', top: 76, animation: 'fadeIn 0.5s ease 0.15s both' }}>
          {!exhibitor ? (
            /* Not logged in */
            <div style={{ background: t.bgSurface, border: `1px solid ${accent}30`, borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '28px 22px 24px', background: `linear-gradient(160deg, ${accent}12, transparent)`, textAlign: 'center', borderBottom: '1px solid ' + t.borderSubtle }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: accent + '15', border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.3rem' }}>🏢</div>
                <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: t.textPrimary, marginBottom: 8, letterSpacing: '-0.02em' }}>Express Interest</h3>
                <p style={{ fontSize: '0.81rem', color: t.textMuted, lineHeight: 1.65, marginBottom: 22 }}>
                  Login to view stall availability and book your spot at {event.event_name}.
                </p>
                <button onClick={() => navigate('/login', { state: { redirect: `/event/${code}` } })}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: accent, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.92rem', color: '#000', cursor: 'pointer', marginBottom: 10 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Login to Book →
                </button>
                <button onClick={() => navigate('/register')}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'transparent', border: `1px solid ${accent}35`, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: accent, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = accent + '10'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  Register as Exhibitor
                </button>
              </div>
              <div style={{ padding: '14px 20px' }}>
                {[['Opens', event.start_date], ['Closes', event.end_date], event.setup_start_date ? ['Setup', event.setup_start_date] : null].filter(Boolean).map(([label, date]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid ' + t.borderSubtle }}>
                    <span style={{ fontSize: '0.74rem', color: t.textFaint, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '0.74rem', color: t.textSecondary, fontWeight: 600 }}>{fmtDate(date)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Logged in — stall selection sidebar */
            <div style={{ background: t.bgSurface, border: `1px solid ${accent}30`, borderRadius: 18, overflow: 'hidden' }}>
              {/* Price header */}
              <div style={{ padding: '20px 22px 18px', background: `linear-gradient(160deg, ${accent}15, transparent)`, borderBottom: '1px solid ' + t.borderSubtle }}>
                <div style={{ fontSize: '0.65rem', color: t.textFaint, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
                  {selected.size > 1 ? `${selected.size} TYPES SELECTED` : hasSelection ? 'SELECTED STALL' : 'STARTING FROM'}
                </div>
                <div key={totalPrice} style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2.1rem', color: t.textPrimary, letterSpacing: '-0.03em', animation: 'flash 0.2s ease both' }}>
                  {hasSelection ? `₹${totalPrice.toLocaleString()}` : '—'}
                </div>
                {hasSelection && selected.size === 1 && (() => {
                  const [{ dim, hall }] = selectedArr
                  return <div style={{ fontSize: '0.7rem', color: t.textFaint, marginTop: 3 }}>{dim.dimension_label} m · {hall?.hall_name?.split('–')[0]?.trim()} · excl. GST</div>
                })()}
                {hasSelection && selected.size > 1 && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedArr.map(({ dim, hall }) => (
                      <div key={getDimKey(hall, dim)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: t.textMuted }}>
                        <span>{dim.dimension_label} m · {hall?.hall_name?.split('–')[0]?.trim()}</span>
                        <span style={{ color: accent, fontWeight: 600 }}>₹{getDimPrice(dim).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid ' + t.borderDefault, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ color: t.textFaint }}>excl. GST</span>
                      <span style={{ color: t.textSecondary, fontWeight: 700 }}>₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid ' + t.borderSubtle }}>
                {[[statAvail, 'Available'], [statTotal, 'Total'], [selected.size || 0, selected.size > 1 ? 'Types' : 'Type']].map(([v, l], i) => (
                  <div key={l} style={{ padding: '13px 8px', textAlign: 'center', borderRight: i < 2 ? '1px solid ' + t.borderSubtle : 'none' }}>
                    <div key={String(v)} style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: i === 0 ? accent : t.textPrimary, animation: 'flash 0.2s ease both' }}>{v}</div>
                    <div style={{ fontSize: '0.62rem', color: t.textFaint, marginTop: 2, letterSpacing: '0.05em' }}>{l.toUpperCase()}</div>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid ' + t.borderSubtle }}>
                {[['Opens', event.start_date], ['Closes', event.end_date], event.setup_start_date ? ['Setup', event.setup_start_date] : null].filter(Boolean).map(([label, date]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid ' + t.borderSubtle }}>
                    <span style={{ fontSize: '0.73rem', color: t.textFaint, fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: '0.73rem', color: t.textSecondary, fontWeight: 600 }}>{fmtDate(date)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: '18px 20px' }}>
                <button onClick={handleBookStall}
                  style={{ width: '100%', padding: '13px', borderRadius: 11, background: accent, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#000', cursor: 'pointer', border: 'none', transition: 'transform 0.15s, opacity 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.opacity = '0.92' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1' }}>
                  Express Interest →
                </button>
                <p style={{ fontSize: '0.68rem', color: t.textGhost, textAlign: 'center', marginTop: 10 }}>Free to register · Secure payment</p>
              </div>
            </div>
          )}

          {/* Event Details card */}
          <div style={{ marginTop: 14, background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: '0.62rem', color: t.textGhost, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14 }}>EVENT DETAILS</div>
            {[
              ['Venue',     event.venue_name],
              ['City',      `${event.city}, ${event.country || 'India'}`],
              ['Visitors',  event.visitor_capacity?.toLocaleString()],
              ['Exhibitors',event.exhibitor_capacity],
              ['Industry',  event.business_type],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid ' + t.borderSubtle, fontSize: '0.77rem', gap: 8 }}>
                <span style={{ color: t.textFaint, flexShrink: 0 }}>{k}</span>
                <span style={{ color: t.textSecondary, fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SUB-COMPONENTS ───────────────────────────────────────────

function SectionTitle({ title, accent }) {
  const t = useThemeStyles()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: t.textSecondary, letterSpacing: '-0.01em', margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: t.borderSubtle }} />
    </div>
  )
}

function FloorPlanLightbox({ url, hallName, accent, onClose }) {
  const [zoom, setZoom]   = useState(1)
  const [pan, setPan]     = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const containerRef      = { current: null }
  const dragOrigin        = { current: null }
  const panRef            = { current: { x: 0, y: 0 } }

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 4))
      if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.5))
      if (e.key === '0') { setZoom(1); setPan({ x: 0, y: 0 }); panRef.current = { x: 0, y: 0 } }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  // Attach non-passive wheel listener to container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = e => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.15 : 0.15
      setZoom(z => Math.min(Math.max(z + delta, 0.5), 4))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  })

  const handleMouseDown = e => {
    dragOrigin.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y }
    setDragging(true)
  }
  const handleMouseMove = e => {
    if (!dragOrigin.current) return
    const nx = e.clientX - dragOrigin.current.x
    const ny = e.clientY - dragOrigin.current.y
    panRef.current = { x: nx, y: ny }
    setPan({ x: nx, y: ny })
  }
  const handleMouseUp = () => { dragOrigin.current = null; setDragging(false) }

  const btnStyle = (active) => ({
    width: 36, height: 36, borderRadius: 8,
    border: active ? `1px solid ${accent}60` : '1px solid rgba(255,255,255,0.15)',
    background: active ? accent + '25' : 'rgba(255,255,255,0.08)',
    color: active ? accent : 'rgba(255,255,255,0.7)',
    cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '1rem', fontWeight: 700,
    transition: 'all 0.15s', userSelect: 'none',
  })

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', animation: 'fadeIn 0.2s ease both' }}>

      {/* Header */}
      <div style={{ width: '100%', maxWidth: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>🗺 {hallName} — Floor Plan</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Zoom controls */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '4px 8px' }}>
            <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} style={btnStyle(false)}>−</button>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', minWidth: 40, textAlign: 'center', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.25, 4))} style={btnStyle(false)}>+</button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} style={{ ...btnStyle(false), fontSize: '0.65rem', width: 'auto', padding: '0 8px' }}>Reset</button>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: `1px solid ${accent}60`, background: accent + '20', color: accent, fontSize: '0.76rem', fontWeight: 700, textDecoration: 'none' }}>
            ↗ Full
          </a>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✕</button>
        </div>
      </div>

      {/* Image container with zoom/pan */}
      <div
        ref={el => { containerRef.current = el }}
        onClick={e => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ width: '100%', maxWidth: 1000, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: 'calc(82vh - 80px)', cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in', userSelect: 'none' }}>
        <img
          src={url}
          alt={hallName + ' Floor Plan'}
          draggable={false}
          style={{ width: '100%', height: 'auto', maxHeight: 'calc(82vh - 80px)', objectFit: 'contain', display: 'block', transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`, transformOrigin: 'center center', transition: dragging ? 'none' : 'transform 0.2s ease', pointerEvents: 'none' }}
          onError={e => { e.target.parentElement.innerHTML = '<div style="padding:60px;color:#6B7280;text-align:center;min-height:200px;display:flex;align-items:center;justify-content:center">⚠️ Floor plan unavailable</div>' }}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}>
        Scroll to zoom · Drag to pan · ESC to close · Press 0 to reset
      </div>
    </div>
  )
}

function HallCard({ hall, accent, selected, onToggleDim }) {
  const t = useThemeStyles()
  const [open, setOpen]               = useState(true)
  const [showFloorPlan, setShowFloorPlan] = useState(false)
  const [lightbox, setLightbox]       = useState(false)
  const floorPlanUrl = hall.floor_plan || null

  return (
    <div style={{ background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = accent + '35'}
      onMouseLeave={e => e.currentTarget.style.borderColor = t.borderSubtle}>

      {lightbox && floorPlanUrl && <FloorPlanLightbox url={floorPlanUrl} hallName={hall.hall_name} accent={accent} onClose={() => setLightbox(false)} />}

      {/* Hall header */}
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', background: open ? accent + '07' : 'transparent', borderBottom: open ? '1px solid ' + t.borderSubtle : 'none', transition: 'background 0.2s' }}>
        <div>
          <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '0.92rem', color: t.textSecondary, marginBottom: 4 }}>{hall.hall_name}</h3>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {!!hall.area         && <span style={{ fontSize: '0.7rem', color: t.textFaint }}>{hall.area.toLocaleString()} sqft</span>}
            {!!hall.ceiling_height && <span style={{ fontSize: '0.7rem', color: t.textFaint }}>↕ {hall.ceiling_height}ft</span>}
            {!!hall.power_capacity && <span style={{ fontSize: '0.7rem', color: t.textFaint }}>⚡ {hall.power_capacity}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '3px 9px', borderRadius: 6, fontSize: '0.66rem', fontWeight: 700, background: hall.hall_type === 'AC' ? '#60A5FA20' : '#F59E0B15', color: hall.hall_type === 'AC' ? '#60A5FA' : '#F59E0B' }}>{hall.hall_type}</span>
          {floorPlanUrl && (
            <button onClick={e => { e.stopPropagation(); setShowFloorPlan(s => !s) }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, border: `1px solid ${accent}40`, background: showFloorPlan ? accent + '18' : 'transparent', color: accent, fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              🗺 {showFloorPlan ? 'Hide' : 'Floor Plan'}
            </button>
          )}
          <span style={{ color: t.textFaint, fontSize: '0.75rem', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </div>

      {/* Inline floor plan preview */}
      {open && floorPlanUrl && showFloorPlan && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid ' + t.borderSubtle, background: t.bgElevated }}>
          <div style={{ fontSize: '0.67rem', color: t.textFaint, marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em' }}>
            FLOOR PLAN · <span style={{ color: accent, cursor: 'pointer', fontWeight: 700 }} onClick={() => setLightbox(true)}>click to expand ↗</span>
          </div>
          <div onClick={() => setLightbox(true)} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid ' + t.borderDefault, background: '#0D1117', cursor: 'zoom-in', position: 'relative' }}>
            <img src={floorPlanUrl} alt={hall.hall_name + ' Floor Plan'}
              style={{ width: '100%', height: 'auto', maxHeight: 280, minHeight: 100, objectFit: 'contain', display: 'block', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              onError={e => { e.target.parentElement.innerHTML = '<div style="padding:20px;text-align:center;color:#6B7280;font-size:0.8rem">Floor plan unavailable</div>' }}
            />
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.65)', borderRadius: 6, padding: '3px 9px', fontSize: '0.62rem', color: '#9CA3AF', fontWeight: 600 }}>🔍 Click to expand</div>
          </div>
        </div>
      )}

      {/* Dimension cards */}
      {open && (hall.dimensions || []).length > 0 && (
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 10 }}>
          {(hall.dimensions || []).map((dim, di) => (
            <DimCard key={di} dim={dim} accent={accent} isSelected={selected.has(getDimKey(hall, dim))} onClick={() => onToggleDim(hall, dim)} />
          ))}
        </div>
      )}
    </div>
  )
}

function DimCard({ dim, accent, isSelected, onClick }) {
  const t = useThemeStyles()
  const [hov, setHov] = useState(false)
  const available  = dim.available_stalls || 0
  const total      = dim.total_stalls || 0
  const pct        = total > 0 ? (available / total) * 100 : 0
  const stallArea  = dim.area || ((dim.width || 0) * (dim.depth || 0))
  const totalPrice = (dim.base_price || 0) * stallArea
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: isSelected ? accent + '12' : hov ? accent + '08' : t.bgElevated, border: `1.5px solid ${isSelected ? accent : hov ? accent + '40' : t.borderDefault}`, borderRadius: 10, padding: '14px 14px 13px', transition: 'all 0.15s', cursor: 'pointer', boxShadow: isSelected ? `0 0 0 1px ${accent}30` : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: t.textPrimary }}>{dim.dimension_label} m</div>
        {isSelected && <div style={{ fontSize: '0.58rem', fontWeight: 700, color: accent, background: accent + '20', padding: '2px 7px', borderRadius: 100 }}>✓</div>}
      </div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: accent, marginBottom: 2 }}>₹{totalPrice.toLocaleString()}</div>
      <div style={{ fontSize: '0.68rem', color: t.textFaint, marginBottom: 10 }}>₹{dim.base_price?.toLocaleString()}/sqft · {stallArea} sqm</div>
      <div style={{ height: 3, background: t.bgActive || t.bgHover, borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: pct > 50 ? accent : pct > 20 ? '#F59E0B' : '#F87171', transition: 'width 0.3s ease' }} />
      </div>
      <div style={{ fontSize: '0.68rem', color: t.textMuted }}>
        <span style={{ color: pct > 20 ? accent : '#F87171', fontWeight: 700 }}>{available}</span>
        <span> / {total} available</span>
      </div>
      {dim.corner_premium > 0 && <div style={{ fontSize: '0.63rem', color: t.textGhost, marginTop: 5 }}>+{dim.corner_premium}% corner premium</div>}
    </div>
  )
}

function ExhibitorRow({ ex, accent, onOpenBooth }) {
  const t = useThemeStyles()
  const [hov, setHov] = useState(false)
  const hasBooth = !!ex.has_digital_booth
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '13px 16px', borderRadius: 12, background: hov ? (hasBooth ? accent + '07' : t.bgHover) : t.bgSurface, border: `1px solid ${hov ? (hasBooth ? accent + '40' : t.borderHover) : t.borderSubtle}`, transition: 'all 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: hasBooth ? accent + '18' : t.bgHover, border: `1px solid ${hasBooth ? accent + '35' : t.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.82rem', color: hasBooth ? accent : t.textFaint }}>
          {ex.company_name?.charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: t.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.company_name}</div>
          <div style={{ fontSize: '0.7rem', color: t.textFaint, marginTop: 1 }}>{ex.industry}</div>
          {hasBooth && ex.booth_tagline && <div style={{ fontSize: '0.68rem', color: accent, marginTop: 3, opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>"{ex.booth_tagline}"</div>}
        </div>
      </div>
      {hasBooth
        ? <button onClick={onOpenBooth} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 8, border: 'none', background: accent + '18', color: accent, fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s', whiteSpace: 'nowrap' }} onMouseEnter={e => e.currentTarget.style.background = accent + '30'} onMouseLeave={e => e.currentTarget.style.background = accent + '18'}>
            🏪 View Booth
          </button>
        : <span style={{ fontSize: '0.67rem', color: t.textFaint, padding: '4px 10px', borderRadius: 6, background: t.bgElevated, border: '1px solid ' + t.borderDefault, flexShrink: 0, whiteSpace: 'nowrap' }}>No booth yet</span>
      }
    </div>
  )
}

function ServiceCard({ svc, isLoggedIn = false }) {
  const t = useThemeStyles()
  const color = SVC_CATEGORY_COLOR[svc.category] || '#9CA3AF'
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', gap: 13, alignItems: 'flex-start', background: hov ? t.bgElevated : t.bgSurface, border: `1px solid ${hov ? color + '30' : t.borderSubtle}`, borderRadius: 12, padding: '13px 15px', transition: 'all 0.15s' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '15', border: `1px solid ${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{SVC_ICON[svc.category] || '🔧'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: t.textSecondary, marginBottom: 3 }}>{svc.service_name}</div>
        <div style={{ fontSize: '0.7rem', color: t.textFaint, marginBottom: svc.description ? 4 : 0 }}>
          <span style={{ color, fontWeight: 600 }}>{svc.category}</span> · {svc.charge_type}
        </div>
        {svc.description && <div style={{ fontSize: '0.73rem', color: t.textMuted }}>{svc.description}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {isLoggedIn ? (
          <>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color, fontSize: '0.95rem' }}>₹{svc.price?.toLocaleString()}</div>
            <div style={{ fontSize: '0.62rem', color: t.textGhost, marginTop: 2 }}>+{svc.tax_percent}% GST</div>
            {!!svc.is_mandatory && <div style={{ fontSize: '0.6rem', color: '#F87171', fontWeight: 700, marginTop: 3 }}>MANDATORY</div>}
          </>
        ) : (
          <div style={{ fontSize: '0.72rem', color: t.textFaint, whiteSpace: 'nowrap' }}>Login to see price</div>
        )}
      </div>
    </div>
  )
}

function FacilityCard({ icon, label, accent }) {
  const t = useThemeStyles()
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? accent + '07' : t.bgSurface, border: `1px solid ${hov ? accent + '30' : t.borderSubtle}`, borderRadius: 10, padding: '14px 10px', textAlign: 'center', transition: 'all 0.15s' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '0.7rem', color: t.textMuted, fontWeight: 500 }}>{label}</div>
    </div>
  )
}