import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getEventDetail, createBooking } from '../api/frappe'

const CAT_ACCENT = {
  'Trade Fair':     '#F59E0B',
  'Conference':     '#60A5FA',
  'Expo':           '#00FF87',
  'Seminar':        '#A78BFA',
  'Product Launch': '#FB923C',
}

const SVC_ICON = {
  Electricity: '⚡', Furniture: '🪑', Branding: '🎨',
  IT: '💻', Logistics: '🚛', Security: '🔒', Other: '🔧',
}
const SVC_COLOR = {
  Electricity: '#F59E0B', Furniture: '#60A5FA', Branding: '#A78BFA',
  IT: '#00FF87', Logistics: '#FB923C', Security: '#F87171', Other: '#9CA3AF',
}

const STEPS = ['Stall Review', 'Services', 'Checkout']

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function getDimPrice(dim) {
  const area = dim.area || ((dim.width || 0) * (dim.depth || 0))
  return (dim.base_price || 0) * area
}
function getDimArea(dim) {
  return dim.area || ((dim.width || 0) * (dim.depth || 0))
}

export default function BookingPage() {
  const { code }      = useParams()
  const navigate      = useNavigate()
  const location      = useLocation()
  const { exhibitor } = useAuth()

  // selected dims passed from EventDetail
  const passedSelected = location.state?.selected || []

  const [detail, setDetail]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [step, setStep]                 = useState(0)
  const [selectedServices, setServices] = useState(new Set())
  const [submitting, setSubmitting]     = useState(false)
  const [bookingDone, setBookingDone]   = useState(null) // booking result

  useEffect(() => {
    if (!exhibitor) {
      navigate('/login', { state: { redirect: `/book/${code}` } })
      return
    }
    getEventDetail(code)
      .then(d => { setDetail(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [code])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1F1F1F', borderTopColor: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!detail) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: '#F5F5F5' }}>
      Event not found.
    </div>
  )

  const { event, services = [] } = detail
  const accent = CAT_ACCENT[event.category] || '#F59E0B'

  // ── Price calculations ──────────────────────────────────────
  const stallTotal   = passedSelected.reduce((s, x) => s + getDimPrice(x.dim), 0)
  const selectedSvcs = services.filter(s => selectedServices.has(s.name))
  const svcTotal     = selectedSvcs.reduce((s, x) => s + (x.price || 0), 0)
  const subTotal     = stallTotal + svcTotal
  const taxAmount    = Math.round(subTotal * 0.18)
  const grandTotal   = subTotal + taxAmount
  const depositAmt   = passedSelected.reduce((s, x) => s + (x.dim.deposit || 0), 0)

  const toggleService = (name) => {
    setServices(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const handleBooking = async () => {
    setSubmitting(true)
    try {
      // Build booking payload
      const payload = {
        expo_event: code,
        selected_dims: passedSelected.map(x => ({
          dimension_label: x.dim.dimension_label,
          hall: x.hall?.hall_name,
          area: getDimArea(x.dim),
          base_price: x.dim.base_price,
          total_price: getDimPrice(x.dim),
        })),
        selected_services: selectedSvcs.map(s => ({ service: s.name, price: s.price })),
        stall_amount: stallTotal,
        service_amount: svcTotal,
        tax_amount: taxAmount,
        total_amount: grandTotal,
        deposit_paid: depositAmt,
        balance_due: grandTotal - depositAmt,
      }
      const result = await createBooking(payload)
      setBookingDone(result)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  // ── BOOKING SUCCESS SCREEN ──────────────────────────────────
  if (bookingDone) {
    return (
      <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
          @keyframes popIn { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          * { box-sizing: border-box; }
        `}</style>
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: accent + '20', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem', animation: 'popIn 0.4s ease both' }}>✓</div>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2rem', color: '#F5F5F5', marginBottom: 8 }}>Stall Blocked!</h1>
          <p style={{ color: '#6B7280', marginBottom: 28 }}>Your booking has been confirmed. Pay the deposit to secure your stall.</p>

          <div style={{ background: '#0F0F0F', border: `1px solid ${accent}30`, borderRadius: 16, padding: 24, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: '0.65rem', color: '#4B5563', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>BOOKING SUMMARY</div>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: accent, marginBottom: 16 }}>{bookingDone.booking_id}</div>

            {passedSelected.map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #141414', fontSize: '0.82rem' }}>
                <span style={{ color: '#9CA3AF' }}>{x.dim.dimension_label} m — {x.hall?.hall_name?.split('–')[0]?.trim()}</span>
                <span style={{ color: '#F5F5F5', fontWeight: 600 }}>₹{getDimPrice(x.dim).toLocaleString()}</span>
              </div>
            ))}
            {selectedSvcs.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #141414', fontSize: '0.82rem' }}>
                <span style={{ color: '#9CA3AF' }}>{s.service_name}</span>
                <span style={{ color: '#F5F5F5', fontWeight: 600 }}>₹{s.price?.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F1F', fontSize: '0.8rem' }}>
              <span style={{ color: '#4B5563' }}>GST (18%)</span>
              <span style={{ color: '#6B7280' }}>₹{taxAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '0.95rem', fontWeight: 700 }}>
              <span style={{ color: '#9CA3AF' }}>Grand Total</span>
              <span style={{ color: accent, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.2rem' }}>₹{grandTotal.toLocaleString()}</span>
            </div>
            <div style={{ background: accent + '10', border: `1px solid ${accent}30`, borderRadius: 10, padding: '10px 14px', marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>Deposit to block stall now</span>
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1rem' }}>₹{depositAmt.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
            <button style={{ padding: '14px', borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${accent}CC)`, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#000', cursor: 'pointer' }}>
              Pay Deposit ₹{depositAmt.toLocaleString()} →
            </button>
            <button onClick={() => navigate(`/booth/${code}/${exhibitor?.name}`)} style={{ padding: '12px', borderRadius: 12, background: 'transparent', border: `1px solid ${accent}40`, fontWeight: 600, fontSize: '0.88rem', color: accent, cursor: 'pointer' }}>
              🏪 Create Your Digital Booth
            </button>
            <button onClick={() => navigate(`/event/${code}`)} style={{ padding: '10px', borderRadius: 10, background: 'transparent', border: '1px solid #1F1F1F', fontSize: '0.82rem', color: '#6B7280', cursor: 'pointer' }}>
              ← Back to Event
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN BOOKING FLOW ───────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0F0F0F; }
        ::-webkit-scrollbar-thumb { background: #2F2F2F; border-radius: 3px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1A1A1A' }}>
        <button onClick={() => navigate(`/event/${code}`)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, border: '1px solid #1F1F1F', background: 'transparent', color: '#9CA3AF', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          {event.event_name}
        </button>
        <div style={{ fontSize: '0.78rem', color: '#4B5563' }}>
          Booking as <span style={{ color: '#9CA3AF', fontWeight: 600 }}>{exhibitor?.company_name || exhibitor?.exhibitor_name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 2rem 4rem' }}>

        {/* ── STEP INDICATOR ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36, animation: 'fadeUp 0.3s ease both' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < step ? accent : i === step ? accent : '#1A1A1A', border: `1px solid ${i <= step ? accent : '#2A2A2A'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: i < step ? '#000' : i === step ? '#000' : '#4B5563', flexShrink: 0 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: i === step ? 700 : 400, color: i === step ? '#F5F5F5' : i < step ? accent : '#4B5563', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? accent + '60' : '#1A1A1A', margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT: STEP CONTENT ── */}
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>

            {/* STEP 0 — Stall Review */}
            {step === 0 && (
              <div>
                <SectionTitle title="Your Selected Stalls" accent={accent} />
                {passedSelected.length === 0 ? (
                  <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏢</div>
                    <p style={{ color: '#4B5563' }}>No stalls selected.</p>
                    <button onClick={() => navigate(`/event/${code}`)} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: accent, border: 'none', fontWeight: 700, color: '#000', cursor: 'pointer' }}>← Select Stalls</button>
                  </div>
                ) : passedSelected.map((x, i) => {
                  const area  = getDimArea(x.dim)
                  const price = getDimPrice(x.dim)
                  const pct   = x.dim.total_stalls > 0 ? (x.dim.available_stalls / x.dim.total_stalls) * 100 : 0
                  return (
                    <div key={i} style={{ background: '#0F0F0F', border: `1px solid ${accent}30`, borderRadius: 14, padding: 20, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#F5F5F5', marginBottom: 2 }}>
                            {x.dim.dimension_label} m
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>{x.hall?.hall_name}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: accent }}>₹{price.toLocaleString()}</div>
                          <div style={{ fontSize: '0.7rem', color: '#4B5563' }}>₹{x.dim.base_price?.toLocaleString()}/sqft · {area} sqm</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {[['Area', `${area} sqm`], ['Available', `${x.dim.available_stalls} / ${x.dim.total_stalls}`], ['Deposit', `₹${(x.dim.deposit || 0).toLocaleString()}`]].map(([k, v]) => (
                          <div key={k} style={{ background: '#141414', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: '0.65rem', color: '#4B5563', marginBottom: 3 }}>{k.toUpperCase()}</div>
                            <div style={{ fontSize: '0.88rem', color: '#E5E7EB', fontWeight: 600 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {x.dim.corner_premium > 0 && (
                        <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#6B7280' }}>
                          Corner premium: <span style={{ color: accent }}>+{x.dim.corner_premium}%</span> ·
                          Island premium: <span style={{ color: accent }}>+{x.dim.island_premium}%</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                <button onClick={() => navigate(`/event/${code}`)} style={{ marginTop: 4, padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid #1F1F1F', fontSize: '0.78rem', color: '#6B7280', cursor: 'pointer' }}>
                  + Add / Change Stalls
                </button>
              </div>
            )}

            {/* STEP 1 — Services */}
            {step === 1 && (
              <div>
                <SectionTitle title="Add Services" accent={accent} />
                <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: 20 }}>
                  Optional services for your stall. Select what you need — you can also add more after booking.
                </p>
                {services.length === 0 ? (
                  <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 14, padding: 30, textAlign: 'center', color: '#4B5563' }}>No services available for this event.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {services.map(svc => {
                      const checked = selectedServices.has(svc.name)
                      const color   = SVC_COLOR[svc.category] || '#9CA3AF'
                      return (
                        <div key={svc.name} onClick={() => !svc.is_mandatory && toggleService(svc.name)}
                          style={{ display: 'flex', gap: 14, alignItems: 'center', background: checked ? color + '08' : '#0F0F0F', border: `1px solid ${checked ? color + '50' : '#1A1A1A'}`, borderRadius: 12, padding: '14px 16px', cursor: svc.is_mandatory ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                          {/* Checkbox */}
                          <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked || svc.is_mandatory ? color : '#2A2A2A'}`, background: checked || svc.is_mandatory ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                            {(checked || svc.is_mandatory) && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>}
                          </div>
                          <div style={{ width: 38, height: 38, borderRadius: 9, background: color + '15', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                            {SVC_ICON[svc.category] || '🔧'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#E5E7EB', marginBottom: 2 }}>
                              {svc.service_name}
                              {svc.is_mandatory && <span style={{ marginLeft: 8, fontSize: '0.62rem', fontWeight: 700, color: '#F87171', background: '#F8717115', padding: '2px 6px', borderRadius: 4 }}>MANDATORY</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>
                              <span style={{ color, fontWeight: 600 }}>{svc.category}</span> · {svc.charge_type}
                              {svc.description && <span> · {svc.description}</span>}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color, fontSize: '1rem' }}>₹{svc.price?.toLocaleString()}</div>
                            <div style={{ fontSize: '0.65rem', color: '#374151' }}>+{svc.tax_percent}% GST</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Checkout */}
            {step === 2 && (
              <div>
                <SectionTitle title="Review & Checkout" accent={accent} />

                {/* Stalls summary */}
                <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: '0.65rem', color: '#4B5563', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>STALLS</div>
                  {passedSelected.map((x, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #141414', fontSize: '0.83rem' }}>
                      <span style={{ color: '#9CA3AF' }}>{x.dim.dimension_label} m — {x.hall?.hall_name?.split('–')[0]?.trim()}</span>
                      <span style={{ color: '#F5F5F5', fontWeight: 600 }}>₹{getDimPrice(x.dim).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Services summary */}
                {selectedSvcs.length > 0 && (
                  <div style={{ background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: '0.65rem', color: '#4B5563', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>SERVICES</div>
                    {selectedSvcs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #141414', fontSize: '0.83rem' }}>
                        <span style={{ color: '#9CA3AF' }}>{s.service_name}</span>
                        <span style={{ color: '#F5F5F5', fontWeight: 600 }}>₹{s.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tax + total */}
                <div style={{ background: '#0F0F0F', border: `1px solid ${accent}30`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  {[['Stalls', `₹${stallTotal.toLocaleString()}`], ['Services', `₹${svcTotal.toLocaleString()}`], ['GST (18%)', `₹${taxAmount.toLocaleString()}`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #141414', fontSize: '0.82rem' }}>
                      <span style={{ color: '#4B5563' }}>{k}</span>
                      <span style={{ color: '#9CA3AF' }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', fontSize: '1rem' }}>
                    <span style={{ color: '#E5E7EB', fontWeight: 700 }}>Grand Total</span>
                    <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: accent }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ background: accent + '10', border: `1px solid ${accent}25`, borderRadius: 10, padding: '10px 14px', marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>Pay now to block stall</div>
                      <div style={{ fontSize: '0.68rem', color: '#4B5563' }}>Balance payable before event</div>
                    </div>
                    <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1.1rem' }}>₹{depositAmt.toLocaleString()}</span>
                  </div>
                </div>

                {/* T&C */}
                <div style={{ fontSize: '0.72rem', color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
                  By proceeding, you agree to the stall booking terms and cancellation policy of {event.event_name}. Stalls are blocked only after deposit payment.
                </div>

                <button onClick={handleBooking} disabled={submitting} style={{ width: '100%', padding: '15px', borderRadius: 12, background: submitting ? '#1A1A1A' : `linear-gradient(135deg, ${accent}, ${accent}CC)`, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: submitting ? '#4B5563' : '#000', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                  {submitting ? (
                    <>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #2A2A2A', borderTopColor: accent, animation: 'spin 0.7s linear infinite' }} />
                      Processing...
                    </>
                  ) : `Confirm & Pay Deposit ₹${depositAmt.toLocaleString()}`}
                </button>
              </div>
            )}

            {/* ── NAVIGATION BUTTONS ── */}
            {!bookingDone && step < 2 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={passedSelected.length === 0}
                  style={{ padding: '12px 28px', borderRadius: 10, background: passedSelected.length === 0 ? '#1A1A1A' : accent, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: passedSelected.length === 0 ? '#4B5563' : '#000', cursor: passedSelected.length === 0 ? 'not-allowed' : 'pointer' }}>
                  {step === 0 ? 'Continue to Services →' : 'Review & Checkout →'}
                </button>
              </div>
            )}
            {!bookingDone && step > 0 && step < 3 && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setStep(s => s - 1)} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid #1F1F1F', fontSize: '0.8rem', color: '#6B7280', cursor: 'pointer' }}>← Back</button>
              </div>
            )}
          </div>

          {/* ── RIGHT: ORDER SUMMARY (sticky) ── */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#0F0F0F', border: `1px solid ${accent}20`, borderRadius: 16, padding: 20, animation: 'fadeUp 0.4s ease 0.1s both' }}>
              <div style={{ fontSize: '0.65rem', color: '#4B5563', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14 }}>ORDER SUMMARY</div>

              {passedSelected.map((x, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.78rem' }}>
                  <span style={{ color: '#6B7280' }}>{x.dim.dimension_label} m</span>
                  <span style={{ color: '#9CA3AF', fontWeight: 600 }}>₹{getDimPrice(x.dim).toLocaleString()}</span>
                </div>
              ))}
              {selectedSvcs.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.78rem' }}>
                  <span style={{ color: '#6B7280' }}>{s.service_name}</span>
                  <span style={{ color: '#9CA3AF', fontWeight: 600 }}>₹{s.price?.toLocaleString()}</span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid #1A1A1A', marginTop: 10, paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: '#4B5563' }}>GST (18%)</span>
                  <span style={{ color: '#6B7280' }}>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: '#9CA3AF', fontWeight: 600 }}>Total</span>
                  <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1.1rem' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #1A1A1A', marginTop: 12, paddingTop: 12 }}>
                <div style={{ fontSize: '0.68rem', color: '#4B5563', marginBottom: 4 }}>Deposit to block</div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: '#F5F5F5', fontSize: '1.3rem' }}>₹{depositAmt.toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', color: '#374151', marginTop: 2 }}>Balance: ₹{(grandTotal - depositAmt).toLocaleString()}</div>
              </div>

              <div style={{ marginTop: 14, padding: '10px 12px', background: '#141414', borderRadius: 8, fontSize: '0.7rem', color: '#4B5563', lineHeight: 1.6 }}>
                📅 {event.event_name}<br />
                📍 {event.venue_name}, {event.city}<br />
                🗓 {fmtDate(event.start_date)} — {fmtDate(event.end_date)}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 20, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: '#E5E7EB', letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  )
}