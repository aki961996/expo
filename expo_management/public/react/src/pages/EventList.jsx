import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { getPublishedEvents } from '../api/frappe'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const STATUSES   = ['All', 'Upcoming', 'Ongoing', 'Completed']
const CATEGORIES = ['All', 'Trade Fair', 'Expo', 'Conference', 'Product Launch', 'Seminar']
const USE_MOCK   = false

const MOCK = [
  { name: 'KTE2026', event_name: 'Kerala Tech Expo 2026', category: 'Trade Fair', business_type: 'Information Technology', organizer_name: 'Kerala IT Mission', start_date: '2026-04-10', end_date: '2026-04-14', venue_name: 'Rajiv Gandhi Indoor Stadium', city: 'Kochi', status: 'Upcoming', visitor_capacity: 50000, has_wifi: 1, has_ac: 1, has_food_court: 1, has_atm: 1 },
  { name: 'BCON2026', event_name: 'Bangalore Build & Construction Expo', category: 'Expo', business_type: 'Construction & Real Estate', organizer_name: 'CREDAI Karnataka', start_date: '2026-03-11', end_date: '2026-03-15', venue_name: 'BIEC Convention Centre', city: 'Bangalore', status: 'Ongoing', visitor_capacity: 40000, has_wifi: 1, has_ac: 1 },
  { name: 'SIFS2026', event_name: 'South India Food Summit 2026', category: 'Expo', business_type: 'Food & Beverage', organizer_name: 'FSSAI South India', start_date: '2026-05-10', end_date: '2026-05-13', venue_name: 'CODISSIA Trade Fair Complex', city: 'Coimbatore', status: 'Upcoming', visitor_capacity: 30000, has_wifi: 1 },
]

export default function EventList() {
  const navigate = useNavigate()
  const { exhibitor, logout } = useAuth()
  const { isDark, toggle: toggleTheme } = useTheme()

  const [events, setEvents]             = useState([])
  const [total, setTotal]               = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [status, setStatus]             = useState('All')
  const [category, setCategory]         = useState('All')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [loggingOut, setLoggingOut]     = useState(false)

  // ── Theme color helpers ─────────────────────────────────────
  const c = {
    bg:        isDark ? '#080808' : '#F8F7F4',
    card:      isDark ? '#0F0F0F' : '#FFFFFF',
    cardHov:   isDark ? '#141414' : '#F5F4F1',
    border:    isDark ? '#1A1A1A' : '#E5E4E0',
    borderHov: isDark ? '#2F2F2F' : '#C4C3BF',
    text:      isDark ? '#F5F5F5' : '#111111',
    textMuted: isDark ? '#9CA3AF' : '#4B5563',
    textDim:   isDark ? '#6B7280' : '#9CA3AF',
    textFaint: isDark ? '#4B5563' : '#B0AFA9',
    navBg:     isDark ? 'rgba(8,8,8,0.88)' : 'rgba(248,247,244,0.92)',
    btnBg:     isDark ? '#141414' : '#F0EFEC',
    inputBg:   isDark ? '#0F0F0F' : '#FFFFFF',
    shadow:    isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 16px 40px rgba(0,0,0,0.1)',
    overlay:   isDark ? 'rgba(8,8,8,0.92)' : 'rgba(248,247,244,0.95)',
  }

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 600))
        let data = [...MOCK]
        if (status !== 'All')   data = data.filter(e => e.status === status)
        if (category !== 'All') data = data.filter(e => e.category === category)
        if (search) data = data.filter(e => e.event_name.toLowerCase().includes(search.toLowerCase()) || e.city.toLowerCase().includes(search.toLowerCase()))
        setEvents(data); setTotal(data.length)
      } else {
        const res = await getPublishedEvents({ status, category, search })
        setEvents(res.events || []); setTotal(res.total ?? 0)
      }
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [status, category, search])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => setShowDropdown(false)
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  const handleLogout = async () => {
    setShowDropdown(false); setLoggingOut(true)
    await new Promise(r => setTimeout(r, 1200))
    await logout(); setLoggingOut(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, transition: 'background 0.3s' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse     { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes bgMove    { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${c.bg}; }
        ::-webkit-scrollbar-thumb { background:${c.border}; border-radius:3px; }
      `}</style>

      {/* ── LOGOUT OVERLAY ── */}
      {loggingOut && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: c.overlay, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease both' }}>
          <div style={{ position: 'relative', width: 56, height: 56, marginBottom: 24 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #F59E0B15' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#F59E0B', animation: 'spin 0.75s linear infinite' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 1.2s ease-in-out infinite' }} />
          </div>
          <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: c.text, letterSpacing: '-0.03em', margin: 0, animation: 'scaleIn 0.3s ease both' }}>Logging out…</p>
          <p style={{ fontSize: '0.78rem', color: c.textFaint, marginTop: 8, animation: 'scaleIn 0.35s ease both' }}>See you soon!</p>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.border}`, transition: 'background 0.3s, border-color 0.3s' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1" fill="white"/>
              <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity="0.6"/>
              <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity="0.6"/>
              <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: c.text }}>ExpoMgmt</span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* ── THEME TOGGLE BUTTON ── */}
          <button onClick={toggleTheme} title={isDark ? 'Light Mode' : 'Dark Mode'}
            style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${c.border}`, background: c.btnBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.borderHov; e.currentTarget.style.background = isDark ? '#1A1A1A' : '#E8E7E4' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = c.btnBg }}
          >
            {isDark ? (
              /* ☀ Sun */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* ☾ Moon */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Auth */}
          {exhibitor ? (
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowDropdown(d => !d)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 10, border: `1px solid ${c.border}`, background: c.btnBg, cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = c.borderHov}
                onMouseLeave={e => e.currentTarget.style.borderColor = c.border}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F59E0B20', border: '1px solid #F59E0B50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.75rem', color: '#F59E0B', flexShrink: 0 }}>
                  {exhibitor.exhibitor_name?.charAt(0)?.toUpperCase() || 'E'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: c.text, lineHeight: 1.2 }}>{exhibitor.exhibitor_name || exhibitor.company_name}</div>
                  <div style={{ fontSize: '0.65rem', color: c.textDim, lineHeight: 1.2 }}>{exhibitor.company_name}</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.textDim} strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>

              {showDropdown && (
                <div style={{ position: 'absolute', top: '110%', right: 0, minWidth: 180, background: c.card, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden', boxShadow: c.shadow, animation: 'slideDown 0.15s ease both', zIndex: 200 }}>
                  <div style={{ padding: '12px 14px', borderBottom: `1px solid ${c.border}` }}>
                    <div style={{ fontSize: '0.75rem', color: c.textMuted, fontWeight: 500 }}>{exhibitor.mobile || exhibitor.email}</div>
                  </div>
                  <DropItem icon="🏠" label="My Dashboard" c={c} onClick={() => { navigate('/dashboard'); setShowDropdown(false) }} />
                  <DropItem icon="📋" label="My Bookings"  c={c} onClick={() => { navigate('/my-bookings'); setShowDropdown(false) }} />
                  <DropItem icon="👤" label="My Profile"   c={c} onClick={() => { navigate('/profile'); setShowDropdown(false) }} />
                  <div style={{ height: 1, background: c.border }} />
                  <DropItem icon="🚪" label="Logout" c={c} color="#F87171" onClick={handleLogout} />
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/login')}
              style={{ padding: '7px 18px', borderRadius: 8, background: '#F59E0B', border: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#000', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >Exhibitor Login</button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 80, padding: '140px 2rem 80px', maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, #F59E0B08 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, border: '1px solid #F59E0B30', background: '#F59E0B10', marginBottom: 28, animation: 'slideDown 0.5s ease both' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F59E0B', animation: 'pulse 2s infinite', boxShadow: '0 0 8px #F59E0B' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.1em' }}>INDIA'S EXPO PLATFORM</span>
        </div>

        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 1.0, color: c.text, marginBottom: 24, animation: 'fadeIn 0.6s ease 0.1s both' }}>
          Discover<br />
          <span style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 50%, #A855F7 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'bgMove 4s ease infinite' }}>India's Best</span><br />
          Trade Expos
        </h1>

        <p style={{ fontSize: '1.05rem', color: c.textDim, maxWidth: 480, lineHeight: 1.7, marginBottom: 48, fontFamily: 'DM Sans, sans-serif', animation: 'fadeIn 0.6s ease 0.2s both' }}>
          Explore, connect and book stalls at premier industry expos, trade fairs and conferences across India.
        </p>

        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', animation: 'fadeIn 0.6s ease 0.3s both', marginBottom: 56 }}>
          {[['500+', 'Exhibitors'], ['50K+', 'Annual Visitors'], ['12', 'Cities']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2rem', color: c.text, letterSpacing: '-0.03em' }}>{v}</div>
              <div style={{ fontSize: '0.78rem', color: c.textFaint, marginTop: 2, letterSpacing: '0.04em' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ animation: 'fadeIn 0.6s ease 0.35s both' }}>
          <div style={{ position: 'relative', marginBottom: 16, maxWidth: 560 }}>
            <svg style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: searchFocused ? '#F59E0B' : c.textFaint, transition: 'color 0.2s' }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search events, cities, industries…" value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              style={{ width: '100%', padding: '13px 16px 13px 46px', background: c.inputBg, border: `1.5px solid ${searchFocused ? '#F59E0B50' : c.border}`, borderRadius: 12, fontSize: '0.9rem', color: c.text, outline: 'none', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: searchFocused ? '0 0 0 3px #F59E0B10' : 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map(s => <FilterChip key={s} label={s} active={status === s} isDark={isDark} activeColor={s === 'Ongoing' ? '#00FF87' : s === 'Upcoming' ? '#60A5FA' : '#F59E0B'} onClick={() => setStatus(s)} />)}
            </div>
            <div style={{ width: 1, height: 20, background: c.border }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => <FilterChip key={cat} label={cat} active={category === cat} isDark={isDark} activeColor="#F59E0B" onClick={() => setCategory(cat)} />)}
            </div>
            {total != null && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: c.textFaint, fontFamily: 'DM Sans, sans-serif' }}>{total} event{total !== 1 ? 's' : ''}</span>}
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 6rem' }}>
        {loading    ? <SkeletonGrid c={c} />
         : error    ? <ErrorState message={error} onRetry={load} c={c} />
         : events.length === 0 ? <EmptyState c={c} />
         : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
            {events.map((ev, i) => <EventCard key={ev.name} event={ev} index={i} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function DropItem({ icon, label, onClick, color, c }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: '100%', padding: '10px 14px', background: hov ? c.cardHov : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem', fontWeight: 500, color: color || (hov ? c.text : c.textMuted), fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s', textAlign: 'left' }}>
      <span>{icon}</span>{label}
    </button>
  )
}

function FilterChip({ label, active, activeColor, onClick, isDark }) {
  const [hov, setHov] = useState(false)
  const border  = isDark ? '#1A1A1A' : '#E5E4E0'
  const bHov    = isDark ? '#2F2F2F' : '#C4C3BF'
  const txt     = isDark ? '#4B5563' : '#9CA3AF'
  const tHov    = isDark ? '#9CA3AF' : '#4B5563'
  const bgHov   = isDark ? '#141414' : '#EBEBEB'
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding: '5px 13px', borderRadius: 100, border: `1px solid ${active ? activeColor + '60' : hov ? bHov : border}`, background: active ? activeColor + '15' : hov ? bgHov : 'transparent', color: active ? activeColor : hov ? tHov : txt, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em' }}>
      {active && <span style={{ marginRight: 5, fontSize: '0.55rem' }}>●</span>}
      {label}
    </button>
  )
}

function SkeletonGrid({ c }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${c.border}`, background: c.card }}>
          <div style={{ height: 200, background: `linear-gradient(90deg, ${c.btnBg} 25%, ${c.cardHov} 50%, ${c.btnBg} 75%)`, backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[180, 120, 140].map((w, j) => <div key={j} style={{ height: 12, width: w, borderRadius: 6, background: `linear-gradient(90deg, ${c.btnBg} 25%, ${c.cardHov} 50%, ${c.btnBg} 75%)`, backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ c }) {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem', color: c.textFaint }}>
      <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.3 }}>◎</div>
      <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '1.5rem', color: c.textDim, fontWeight: 700, marginBottom: 8 }}>No events found</h3>
      <p style={{ fontSize: '0.88rem' }}>Try adjusting your filters or search</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠</div>
      <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '1.5rem', color: '#F87171', fontWeight: 700, marginBottom: 8 }}>{message}</h3>
      <button onClick={onRetry} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, background: '#F59E0B', border: 'none', fontWeight: 600, cursor: 'pointer', color: '#000' }}>Try Again</button>
    </div>
  )
}