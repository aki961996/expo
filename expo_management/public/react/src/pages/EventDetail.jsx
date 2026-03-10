import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventDetail } from '../api/frappe'

// Mock detail data
const MOCK_DETAIL = {
  KIE2025: {
    event: {
      name: 'KIE2025', event_name: 'Kerala Industrial Expo 2025',
      category: 'Trade Fair', business_type: 'Manufacturing & Industry',
      organizer_name: 'Kerala Chambers of Commerce',
      description: '<p>Kerala\'s premier industrial trade fair bringing together 500+ exhibitors from manufacturing, technology, and services. A must-attend for businesses expanding in South India.</p>',
      start_date: '2025-09-10', end_date: '2025-09-14',
      setup_start_date: '2025-09-08', dismantle_date: '2025-09-15',
      venue_name: 'Rajiv Gandhi Indoor Stadium', city: 'Kochi', country: 'India',
      status: 'Upcoming', visitor_capacity: 50000, exhibitor_capacity: 500,
      has_wifi: 1, has_ac: 1, has_food_court: 1, has_atm: 1, has_first_aid: 1, has_security: 1, has_drinking_water: 1,
      parking_cars: 2000, washrooms_male: 20, washrooms_female: 20,
    },
    halls: [
      {
        hall_name: 'Hall A – Heavy Industry', hall_type: 'AC', area: 8000, ceiling_height: 14, power_capacity: '500 KW',
        dimensions: [
          { dimension_label: '3×3', width: 3, depth: 3, area: 9, base_price: 1200, total_stalls: 80, available_stalls: 32 },
          { dimension_label: '6×6', width: 6, depth: 6, area: 36, base_price: 1000, total_stalls: 40, available_stalls: 15 },
          { dimension_label: '9×9', width: 9, depth: 9, area: 81, base_price: 900, corner_premium: 15, total_stalls: 12, available_stalls: 5 },
        ],
      },
      {
        hall_name: 'Hall B – Technology', hall_type: 'AC', area: 5500, ceiling_height: 10, power_capacity: '300 KW',
        dimensions: [
          { dimension_label: '3×3', width: 3, depth: 3, area: 9, base_price: 1100, total_stalls: 60, available_stalls: 22 },
          { dimension_label: '6×3', width: 6, depth: 3, area: 18, base_price: 1000, total_stalls: 30, available_stalls: 10 },
        ],
      },
    ],
    services: [
      { service_name: 'Additional Power Load', category: 'Electricity', charge_type: 'One-time', price: 5000, tax_percent: 18, description: 'Extra power up to 5KW' },
      { service_name: 'Booth Fabrication', category: 'Branding', charge_type: 'Per stall', price: 15000, tax_percent: 18, description: 'Complete stall setup' },
      { service_name: 'Internet Line', category: 'IT', charge_type: 'Per day', price: 2000, tax_percent: 18, description: 'Dedicated broadband' },
      { service_name: 'Extra Chairs', category: 'Furniture', charge_type: 'One-time', price: 800, tax_percent: 18, description: 'Set of 4 folding chairs' },
    ],
    exhibitors: [
      { company_name: 'Kerala Motors Ltd', industry: 'Automotive' },
      { company_name: 'Infopark Technologies', industry: 'IT' },
      { company_name: 'Malabar Textiles', industry: 'Textile' },
      { company_name: 'Southern Steel Corp', industry: 'Steel' },
      { company_name: 'Cochin Chemicals', industry: 'Chemical' },
      { company_name: 'Kerala Spices Board', industry: 'F&B' },
    ],
  },
}

const USE_MOCK = false

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const FACILITY_MAP = [
  ['has_wifi', '📶', 'Wi-Fi'],
  ['has_ac', '❄️', 'Air Conditioning'],
  ['has_food_court', '🍽️', 'Food Court'],
  ['has_atm', '🏧', 'ATM'],
  ['has_first_aid', '🏥', 'Medical Room'],
  ['has_fire_safety', '🧯', 'Fire Safety'],
  ['has_security', '🔒', 'Security'],
  ['has_drinking_water', '💧', 'Drinking Water'],
  ['has_prayer_room', '🕌', 'Prayer Room'],
]

const SVC_ICON = { Electricity: '⚡', Furniture: '🪑', Branding: '🎨', IT: '💻', Logistics: '🚛' }

const STATUS_STYLE = {
  Ongoing:   { bg: 'var(--green-bg)',  color: 'var(--green)' },
  Upcoming:  { bg: 'var(--blue-bg)',   color: 'var(--blue)' },
  Completed: { bg: 'var(--cream2)',    color: 'var(--ink3)' },
}

export default function EventDetail() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    if (USE_MOCK) {
      setTimeout(() => { setDetail(MOCK_DETAIL[code] || null); setLoading(false) }, 400)
    } else {
      getEventDetail(code).then(d => { setDetail(d); setLoading(false) }).catch(() => setLoading(false))
    }
  }, [code])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!detail) return (
    <div style={{ textAlign: 'center', padding: '10rem 2rem' }}>
      <div style={{ fontSize: '3rem' }}>🔍</div>
      <h2 className="display" style={{ marginTop: '1rem' }}>Event not found</h2>
      <button onClick={() => navigate('/')} style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', borderRadius: 8, background: 'var(--ink)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
        ← Back to Events
      </button>
    </div>
  )

  const { event, halls, services, exhibitors } = detail
  const st = STATUS_STYLE[event.status] || STATUS_STYLE.Upcoming
  const facilities = FACILITY_MAP.filter(([key]) => event[key])
  const minPrice = halls.flatMap(h => h.dimensions).reduce((m, d) => Math.min(m, d.base_price * d.area), Infinity)
  const availStalls = halls.flatMap(h => h.dimensions).reduce((s, d) => s + (d.available_stalls || 0), 0)
  const totalStalls = halls.flatMap(h => h.dimensions).reduce((s, d) => s + (d.total_stalls || 0), 0)

  return (
    <div style={{ paddingTop: 64, animation: 'fadeIn 0.4s ease', minHeight: '100vh' }}>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--ink) 0%, #2D2520 100%)',
        padding: '4rem 2rem 3rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px' }} />
        <div style={{ position: 'absolute', right: '-2rem', top: '-2rem', width: 300, height: 300,
          background: 'var(--orange)', borderRadius: '50%', opacity: 0.06 }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
              All Events
            </span>
            <span>›</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{event.event_name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              {/* Status + Category */}
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.25rem 0.8rem', borderRadius: 100, background: st.bg, color: st.color, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  ● {event.status}
                </span>
                <span style={{ padding: '0.25rem 0.8rem', borderRadius: 100, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', fontWeight: 600 }}>
                  {event.category}
                </span>
              </div>

              <h1 className="display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'white', marginBottom: '0.5rem' }}>
                {event.event_name}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>
                Organised by <strong style={{ color: 'rgba(255,255,255,0.8)' }}>{event.organizer_name}</strong>
              </p>
            </div>

            {/* Quick info pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <InfoPill icon="📅" text={`${fmtDate(event.start_date)} – ${fmtDate(event.end_date)}`} />
              <InfoPill icon="📍" text={`${event.venue_name}, ${event.city}, ${event.country}`} />
              <InfoPill icon="👥" text={`${event.visitor_capacity?.toLocaleString()} visitors · ${event.exhibitor_capacity} exhibitors`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="container" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>

          {/* ── LEFT ── */}
          <div>

            {/* Description */}
            {event.description && (
              <Section title="About this Event">
                <div style={{ color: 'var(--ink2)', lineHeight: 1.8, fontSize: '0.95rem' }}
                  dangerouslySetInnerHTML={{ __html: event.description }} />
              </Section>
            )}

            {/* Halls & Stalls */}
            {halls.length > 0 && (
              <Section title="Halls & Stall Dimensions">
                {halls.map((hall, i) => (
                  <div key={i} style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{hall.hall_name}</h3>
                      <span style={{ padding: '0.2rem 0.7rem', borderRadius: 6, background: 'var(--blue-bg)', color: 'var(--blue)', fontSize: '0.72rem', fontWeight: 700 }}>{hall.hall_type}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      {hall.area && <HallStat v={`${hall.area.toLocaleString()} sqft`} l="Total Area" />}
                      {hall.ceiling_height && <HallStat v={`${hall.ceiling_height} ft`} l="Ceiling Height" />}
                      {hall.power_capacity && <HallStat v={hall.power_capacity} l="Power Capacity" />}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                      {hall.dimensions.map((dim, di) => (
                        <div key={di} style={{
                          background: 'var(--cream)', border: '1.5px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', padding: '1rem',
                          transition: 'border-color 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)' }}>{dim.dimension_label} m</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--orange)', fontWeight: 600, margin: '0.2rem 0' }}>₹{dim.base_price?.toLocaleString()}/sqft</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>
                            <strong style={{ color: 'var(--green)' }}>{dim.available_stalls}</strong> / {dim.total_stalls} available
                          </div>
                          {dim.corner_premium > 0 && <div style={{ fontSize: '0.68rem', color: 'var(--ink4)', marginTop: '0.3rem' }}>+{dim.corner_premium}% corner premium</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* Services */}
            {services.length > 0 && (
              <Section title="Available Services">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {services.map((svc, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--cream2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        {SVC_ICON[svc.category] || '🔧'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.15rem' }}>{svc.service_name}</div>
                        <div style={{ fontSize: '0.77rem', color: 'var(--ink3)', marginBottom: '0.4rem' }}>{svc.category} · {svc.charge_type}</div>
                        {svc.description && <div style={{ fontSize: '0.8rem', color: 'var(--ink3)' }}>{svc.description}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, color: 'var(--orange)', fontSize: '1rem' }}>₹{svc.price?.toLocaleString()}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ink4)' }}>+{svc.tax_percent}% GST</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <Section title="Facilities">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {facilities.map(([, icon, label]) => (
                    <div key={label} style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
                      <div style={{ fontSize: '0.77rem', color: 'var(--ink2)', fontWeight: 500 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Exhibitors */}
            {exhibitors.length > 0 && (
              <Section title={`Exhibitors (${exhibitors.length}+)`}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {exhibitors.map((ex, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: 'white', border: '1.5px solid var(--border)',
                      borderRadius: 8, padding: '0.5rem 0.9rem',
                      fontSize: '0.82rem', transition: 'border-color 0.2s', cursor: 'pointer',
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 800 }}>
                        {ex.company_name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{ex.company_name}</span>
                      <span style={{ color: 'var(--ink4)', fontSize: '0.74rem' }}>· {ex.industry}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <div style={{ position: 'sticky', top: '84px' }}>
            <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              {/* Head */}
              <div style={{ background: 'linear-gradient(135deg, var(--ink), #3D2D25)', padding: '1.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.3rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Starting from
                </div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'white' }}>
                  ₹{minPrice === Infinity ? '—' : minPrice.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>per stall (excl. GST)</div>
              </div>

              {/* Stats */}
              <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                {[
                  [availStalls, 'Available'],
                  [totalStalls, 'Total Stalls'],
                  [halls.length, 'Halls'],
                ].map(([v, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: 'var(--ink)' }}>{v}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ink4)', marginTop: '0.1rem' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                {[
                  ['Event Opens', event.start_date],
                  ['Event Closes', event.end_date],
                  event.setup_start_date && ['Setup Starts', event.setup_start_date],
                ].filter(Boolean).map(([label, date]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--ink3)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{fmtDate(date)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: '1.25rem' }}>
                <button style={{
                  width: '100%', padding: '1rem', borderRadius: 10,
                  background: 'var(--orange)', border: 'none', color: 'white',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
                  fontSize: '1rem', cursor: 'pointer', transition: 'opacity 0.2s',
                  letterSpacing: '-0.01em',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Book a Stall →
                </button>
                <p style={{ fontSize: '0.74rem', color: 'var(--ink4)', textAlign: 'center', marginTop: '0.75rem' }}>
                  Free to register · Secure checkout
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{
        fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
        fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        {title}
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </h2>
      {children}
    </div>
  )
}

function InfoPill({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.5rem 0.85rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  )
}

function HallStat({ v, l }) {
  return (
    <div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--ink)' }}>{v}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--ink4)' }}>{l}</div>
    </div>
  )
}
