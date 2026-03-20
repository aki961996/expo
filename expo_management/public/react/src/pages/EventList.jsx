import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { getPublishedEvents } from '../api/frappe'
import { useAuth } from '../context/AuthContext'

const STATUSES   = ['All', 'Upcoming', 'Ongoing', 'Completed']
const CATEGORIES = ['All', 'Trade Fair', 'Expo', 'Conference', 'Product Launch', 'Seminar']

const USE_MOCK = false

const MOCK = [
  {
    name: 'KTE2026', event_name: 'Kerala Tech Expo 2026', event_short_code: 'KTE2026',
    category: 'Trade Fair', business_type: 'Information Technology',
    organizer_name: 'Kerala IT Mission',
    start_date: '2026-04-10', end_date: '2026-04-14',
    venue_name: 'Rajiv Gandhi Indoor Stadium', city: 'Kochi',
    status: 'Upcoming', visitor_capacity: 50000, exhibitor_capacity: 500,
    has_wifi: 1, has_ac: 1, has_food_court: 1, has_atm: 1, has_first_aid: 1,
  },
  {
    name: 'BCON2026', event_name: 'Bangalore Build & Construction Expo', event_short_code: 'BCON2026',
    category: 'Expo', business_type: 'Construction & Real Estate',
    organizer_name: 'CREDAI Karnataka',
    start_date: '2026-03-11', end_date: '2026-03-15',
    venue_name: 'BIEC Convention Centre', city: 'Bangalore',
    status: 'Ongoing', visitor_capacity: 40000, exhibitor_capacity: 400,
    has_wifi: 1, has_ac: 1, has_food_court: 1, has_atm: 1, has_prayer_room: 1,
  },
  {
    name: 'SIFS2026', event_name: 'South India Food Summit 2026', event_short_code: 'SIFS2026',
    category: 'Expo', business_type: 'Food & Beverage',
    organizer_name: 'FSSAI South India',
    start_date: '2026-05-10', end_date: '2026-05-13',
    venue_name: 'CODISSIA Trade Fair Complex', city: 'Coimbatore',
    status: 'Upcoming', visitor_capacity: 30000, exhibitor_capacity: 300,
    has_wifi: 1, has_ac: 1, has_food_court: 1,
  },
]

export default function EventList() {
  const navigate = useNavigate()
  const { exhibitor, logout } = useAuth()

  const [events, setEvents]         = useState([])
  const [total, setTotal]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [status, setStatus]         = useState('All')
  const [category, setCategory]     = useState('All')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showDropdown, setShowDropdown]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 600))
        let data = [...MOCK]
        if (status !== 'All')   data = data.filter(e => e.status === status)
        if (category !== 'All') data = data.filter(e => e.category === category)
        if (search) data = data.filter(e =>
          e.event_name.toLowerCase().includes(search.toLowerCase()) ||
          e.city.toLowerCase().includes(search.toLowerCase())
        )
        setEvents(data); setTotal(data.length)
      } else {
        const res = await getPublishedEvents({ status, category, search })
        setEvents(res.events || []); setTotal(res.total ?? 0)
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [status, category, search])

  useEffect(() => { load() }, [load])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setShowDropdown(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes bgMove    { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0F0F0F; }
        ::-webkit-scrollbar-thumb { background: #2F2F2F; border-radius: 3px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1A1A1A',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="white" />
              <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 800, fontSize: '1rem',
            letterSpacing: '-0.03em', color: '#F5F5F5',
          }}>ExpoMgmt</span>
        </div>

        {/* Auth section */}
        {exhibitor ? (
          // ── Logged in ──
          <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowDropdown(d => !d)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px 6px 6px', borderRadius: 10,
                border: '1px solid #1F1F1F', background: '#141414',
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2F2F2F'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1F1F1F'}
            >
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#F59E0B20', border: '1px solid #F59E0B50',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '0.75rem', color: '#F59E0B',
                flexShrink: 0,
              }}>
                {exhibitor.exhibitor_name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#E5E7EB', lineHeight: 1.2 }}>
                  {exhibitor.exhibitor_name || exhibitor.company_name}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#4B5563', lineHeight: 1.2 }}>
                  {exhibitor.company_name}
                </div>
              </div>
              {/* Chevron */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round"
                style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                minWidth: 180, background: '#0F0F0F',
                border: '1px solid #1F1F1F', borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                animation: 'slideDown 0.15s ease both',
                zIndex: 200,
              }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #1A1A1A' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
                    {exhibitor.mobile || exhibitor.email}
                  </div>
                </div>
                <DropdownItem
                  icon="🏠"
                  label="My Dashboard"
                  onClick={() => { navigate('/dashboard'); setShowDropdown(false) }}
                />
                <DropdownItem
                  icon="📋"
                  label="My Bookings"
                  onClick={() => { navigate('/my-bookings'); setShowDropdown(false) }}
                />
                <DropdownItem
                  icon="👤"
                  label="My Profile"
                  onClick={() => { navigate('/profile'); setShowDropdown(false) }}
                />
                <div style={{ height: 1, background: '#1A1A1A' }} />
                <DropdownItem
                  icon="🚪"
                  label="Logout"
                  color="#F87171"
                  onClick={async () => { await logout(); setShowDropdown(false) }}
                />
              </div>
            )}
          </div>
        ) : (
          // ── Not logged in ──
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '7px 18px', borderRadius: 8,
              background: '#F59E0B', border: 'none',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.82rem', fontWeight: 600,
              color: '#000', cursor: 'pointer',
              letterSpacing: '0.01em',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Exhibitor Login
          </button>
        )}
      </nav>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 140, paddingBottom: 80,
        paddingLeft: '2rem', paddingRight: '2rem',
        maxWidth: 1200, margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 60, left: '50%',
          transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, #F59E0B08 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 14px', borderRadius: 100,
          border: '1px solid #F59E0B30', background: '#F59E0B10',
          marginBottom: 28, animation: 'slideDown 0.5s ease both',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#F59E0B',
            animation: 'pulse 2s infinite',
            boxShadow: '0 0 8px #F59E0B',
          }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.1em' }}>
            INDIA'S EXPO PLATFORM
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          letterSpacing: '-0.04em', lineHeight: 1.0,
          color: '#F5F5F5', marginBottom: 24,
          animation: 'fadeIn 0.6s ease 0.1s both',
        }}>
          Discover<br />
          <span style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #A855F7 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', animation: 'bgMove 4s ease infinite',
          }}>India's Best</span><br />
          Trade Expos
        </h1>

        <p style={{
          fontSize: '1.05rem', color: '#6B7280',
          maxWidth: 480, lineHeight: 1.7, marginBottom: 48,
          fontFamily: 'DM Sans, sans-serif',
          animation: 'fadeIn 0.6s ease 0.2s both',
        }}>
          Explore, connect and book stalls at premier industry expos, trade fairs and conferences across India.
        </p>

        <div style={{
          display: 'flex', gap: 40, flexWrap: 'wrap',
          animation: 'fadeIn 0.6s ease 0.3s both', marginBottom: 56,
        }}>
          {[['500+', 'Exhibitors'], ['50K+', 'Annual Visitors'], ['12', 'Cities']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#F5F5F5', letterSpacing: '-0.03em' }}>{v}</div>
              <div style={{ fontSize: '0.78rem', color: '#4B5563', marginTop: 2, letterSpacing: '0.04em' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ animation: 'fadeIn 0.6s ease 0.35s both' }}>
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 560 }}>
            <svg style={{
              position: 'absolute', left: 16, top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none',
              color: searchFocused ? '#F59E0B' : '#4B5563', transition: 'color 0.2s',
            }} width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search events, cities, industries…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: '100%', padding: '13px 16px 13px 46px',
                background: '#0F0F0F',
                border: `1.5px solid ${searchFocused ? '#F59E0B50' : '#1F1F1F'}`,
                borderRadius: 12, fontSize: '0.9rem', color: '#F5F5F5',
                outline: 'none', fontFamily: 'DM Sans, sans-serif',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: searchFocused ? '0 0 0 3px #F59E0B10' : 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map(s => (
                <FilterChip key={s} label={s} active={status === s}
                  activeColor={s === 'Ongoing' ? '#00FF87' : s === 'Upcoming' ? '#60A5FA' : '#F59E0B'}
                  onClick={() => setStatus(s)} />
              ))}
            </div>
            <div style={{ width: 1, height: 20, background: '#1F1F1F' }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <FilterChip key={c} label={c} active={category === c}
                  activeColor="#F59E0B" onClick={() => setCategory(c)} />
              ))}
            </div>
            {total != null && (
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#4B5563', fontFamily: 'DM Sans, sans-serif' }}>
                {total} event{total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 6rem' }}>
        {loading ? <SkeletonGrid />
          : error ? <ErrorState message={error} onRetry={load} />
          : events.length === 0 ? <EmptyState />
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {events.map((ev, i) => <EventCard key={ev.name} event={ev} index={i} />)}
            </div>
          )}
      </section>
    </div>
  )
}

// ── Dropdown Item ─────────────────────────────────────────────
function DropdownItem({ icon, label, onClick, color }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '10px 14px',
        background: hov ? '#141414' : 'transparent',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: '0.82rem', fontWeight: 500,
        color: color || (hov ? '#E5E7EB' : '#9CA3AF'),
        fontFamily: 'DM Sans, sans-serif',
        transition: 'all 0.15s', textAlign: 'left',
      }}
    >
      <span>{icon}</span>{label}
    </button>
  )
}

// ── Filter Chip ───────────────────────────────────────────────
function FilterChip({ label, active, activeColor, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '5px 13px', borderRadius: 100,
        border: `1px solid ${active ? activeColor + '60' : hov ? '#2F2F2F' : '#1A1A1A'}`,
        background: active ? activeColor + '15' : hov ? '#141414' : 'transparent',
        color: active ? activeColor : hov ? '#9CA3AF' : '#4B5563',
        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.18s ease', fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.02em',
      }}
    >
      {active && <span style={{ marginRight: 5, fontSize: '0.55rem' }}>●</span>}
      {label}
    </button>
  )
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid #1A1A1A', background: '#0F0F0F' }}>
          <div style={{ height: 200, background: 'linear-gradient(90deg, #141414 25%, #1A1A1A 50%, #141414 75%)', backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[180, 120, 140].map((w, j) => (
              <div key={j} style={{ height: 12, width: w, borderRadius: 6, background: 'linear-gradient(90deg, #141414 25%, #1A1A1A 50%, #141414 75%)', backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem', color: '#4B5563' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.3 }}>◎</div>
      <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '1.5rem', color: '#6B7280', fontWeight: 700, marginBottom: 8 }}>No events found</h3>
      <p style={{ fontSize: '0.88rem' }}>Try adjusting your filters or search</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠</div>
      <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '1.5rem', color: '#F87171', fontWeight: 700, marginBottom: 8 }}>{message}</h3>
      <button onClick={onRetry} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, background: '#F59E0B', border: 'none', fontWeight: 600, cursor: 'pointer', color: '#000' }}>
        Try Again
      </button>
    </div>
  )
}
