import { useState, useEffect, useCallback } from 'react'
import EventCard from '../components/EventCard'
import FilterBar from '../components/FilterBar'
import { getPublishedEvents } from '../api/frappe'

// ── Mock data for development (remove when Frappe is connected) ──
const MOCK = [
  {
    name: 'KIE2025', event_name: 'Kerala Industrial Expo 2025', event_short_code: 'KIE2025',
    category: 'Trade Fair', business_type: 'Manufacturing & Industry',
    organizer_name: 'Kerala Chambers of Commerce',
    start_date: '2025-09-10', end_date: '2025-09-14',
    venue_name: 'Rajiv Gandhi Indoor Stadium', city: 'Kochi',
    status: 'Upcoming', exhibitor_count: 348, visitor_capacity: 50000,
  },
  {
    name: 'SITS2025', event_name: 'South India Tech Summit 2025', event_short_code: 'SITS2025',
    category: 'Conference', business_type: 'Information Technology',
    organizer_name: 'TechHub South India',
    start_date: '2025-11-20', end_date: '2025-11-22',
    venue_name: 'Hitex Exhibition Centre', city: 'Hyderabad',
    status: 'Upcoming', exhibitor_count: 112, visitor_capacity: 15000,
  },
  {
    name: 'AFEC2025', event_name: 'Agri-Food Expo Coimbatore 2025', event_short_code: 'AFEC2025',
    category: 'Expo', business_type: 'Agriculture & Food Processing',
    organizer_name: 'Tamil Nadu Agri Board',
    start_date: '2025-08-05', end_date: '2025-08-08',
    venue_name: 'CODISSIA Trade Fair Complex', city: 'Coimbatore',
    status: 'Ongoing', exhibitor_count: 280, visitor_capacity: 30000,
  },
  {
    name: 'BEXP2025', event_name: 'Bangalore Build Expo 2025', event_short_code: 'BEXP2025',
    category: 'Expo', business_type: 'Construction & Real Estate',
    organizer_name: 'CREDAI Karnataka',
    start_date: '2025-07-15', end_date: '2025-07-18',
    venue_name: 'BIEC Convention Centre', city: 'Bangalore',
    status: 'Completed', exhibitor_count: 420, visitor_capacity: 40000,
  },
  {
    name: 'CHEM2025', event_name: 'ChemTech India 2025', event_short_code: 'CHEM2025',
    category: 'Trade Fair', business_type: 'Chemicals & Pharma',
    organizer_name: 'FICCI Mumbai',
    start_date: '2025-12-08', end_date: '2025-12-11',
    venue_name: 'Bombay Exhibition Centre', city: 'Mumbai',
    status: 'Upcoming', exhibitor_count: 190, visitor_capacity: 25000,
  },
  {
    name: 'AUTO2026', event_name: 'Auto Expo South 2026', event_short_code: 'AUTO2026',
    category: 'Expo', business_type: 'Automotive',
    organizer_name: 'SIAM Tamil Nadu',
    start_date: '2026-02-20', end_date: '2026-02-24',
    venue_name: 'Chennai Trade Centre', city: 'Chennai',
    status: 'Upcoming', exhibitor_count: 510, visitor_capacity: 80000,
  },
]

const USE_MOCK = false //Set false when Frappe API is ready

export default function EventList() {
  const [events, setEvents]     = useState([])
  const [total, setTotal]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('All')
  const [category, setCategory] = useState('All')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (USE_MOCK) {
        await new Promise(r => setTimeout(r, 500)) // simulate network
        let data = [...MOCK]
        if (status !== 'All')   data = data.filter(e => e.status === status)
        if (category !== 'All') data = data.filter(e => e.category === category)
        if (search) data = data.filter(e =>
          e.event_name.toLowerCase().includes(search.toLowerCase()) ||
          e.city.toLowerCase().includes(search.toLowerCase()) ||
          e.organizer_name.toLowerCase().includes(search.toLowerCase())
        )
        setEvents(data)
        setTotal(data.length)
      } else {
        const res = await getPublishedEvents({ status, category, search })
        setEvents(res.events || [])
        setTotal(res.total ?? 0)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [status, category, search])

  useEffect(() => { load() }, [load])

  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        paddingTop: '100px', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, var(--cream2) 0%, var(--cream) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.3rem 0.9rem', borderRadius: 100,
            background: 'var(--orange-bg)', border: '1px solid #F5C8B0',
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--orange)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--orange)', animation: 'pulse 2s infinite' }} />
            Live Events Platform
          </div>

          <h1 className="display" style={{ fontSize: 'clamp(2.8rem, 5vw, 4.5rem)', color: 'var(--ink)', marginBottom: '1rem' }}>
            India's Premier<br />
            <span style={{ color: 'var(--orange)' }}>Expo & Trade Fair</span><br />
            Directory
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--ink3)', maxWidth: 520, lineHeight: 1.7 }}>
            Discover, explore, and participate in top industry expos, trade fairs and conferences across India.
          </p>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {[['500+', 'Exhibitors'], ['50K+', 'Visitors Annually'], ['12', 'Cities']].map(([v, l]) => (
              <div key={l}>
                <div className="display" style={{ fontSize: '1.8rem', color: 'var(--ink)' }}>{v}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink3)', marginTop: '0.1rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS SECTION ── */}
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          <FilterBar
            search={search} setSearch={setSearch}
            status={status} setStatus={setStatus}
            category={category} setCategory={setCategory}
            total={total}
          />

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <ErrorState message={error} onRetry={load} />
          ) : events.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}>
              {events.map((ev, i) => <EventCard key={ev.name} event={ev} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        @keyframes shimmer {
          0% { background-position: -400px 0 }
          100% { background-position: 400px 0 }
        }
      `}</style>
    </div>
  )
}

function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1.5px solid var(--border)' }}>
          <div style={{ height: 140, background: 'linear-gradient(90deg, var(--cream2) 25%, var(--border) 50%, var(--cream2) 75%)', backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[120, 80, 100].map((w, j) => (
              <div key={j} style={{ height: 14, width: `${w}px`, borderRadius: 6, background: 'linear-gradient(90deg, var(--cream2) 25%, var(--border) 50%, var(--cream2) 75%)', backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
      <h3 className="display" style={{ fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>No events found</h3>
      <p style={{ color: 'var(--ink3)' }}>Try adjusting your filters or search term</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 className="display" style={{ fontSize: '1.5rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>Something went wrong</h3>
      <p style={{ color: 'var(--ink3)', marginBottom: '1.5rem' }}>{message}</p>
      <button onClick={onRetry} style={{ padding: '0.6rem 1.5rem', borderRadius: 8, background: 'var(--ink)', color: 'white', border: 'none', fontWeight: 600 }}>
        Try Again
      </button>
    </div>
  )
}
