import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useThemeStyles } from '../hooks/useThemeStyles'
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

function normalizeSelected(raw) {
  return (raw || []).map(item => {
    if (item.dim) return item
    const { hall, stall_name, stall_number, stall_type, final_price, ...dimFields } = item
    return { dim: { ...dimFields, stall_name, stall_number, stall_type, final_price }, hall }
  })
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
  const t             = useThemeStyles()

  const [passedSelected, setPassedSelected] = useState(() => normalizeSelected(location.state?.selected))
  const removeStall = (index) => setPassedSelected(prev => prev.filter((_, i) => i !== index))

  const [detail, setDetail]             = useState(null)
  const [loading, setLoading]           = useState(true)
  const [step, setStep]                 = useState(0)
  const [selectedServices, setServices] = useState(new Set())
  const [submitting, setSubmitting]     = useState(false)
  const [bookingDone, setBookingDone]   = useState(null)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (!exhibitor) {
      navigate('/login', { state: { redirect: `/book/${code}` } })
      return
    }
    getEventDetail(code)
      .then(d => {
        setDetail(d)
        setLoading(false)
        if (d?.services) {
          setServices(new Set(d.services.filter(s => s.is_mandatory).map(s => s.name)))
        }
      })
      .catch(() => setLoading(false))
  }, [code])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: t.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid ' + t.borderDefault, borderTopColor: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!detail) return (
    <div style={{ minHeight: '100vh', background: t.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', color: t.textPrimary }}>
      Event not found.
    </div>
  )

  const { event, services = [] } = detail
  const accent = CAT_ACCENT[event.category] || '#F59E0B'

  // ── STALL-ONLY pricing ──────────────────────────────────────
  // Frontend total = stall + GST only. Service price NOT shown, NOT in total.
  // Backend fetches actual service price from Expo Service and saves to DB.
  const stallTotal   = passedSelected.reduce((s, x) => s + getDimPrice(x.dim), 0)
  const selectedSvcs = services.filter(s => selectedServices.has(s.name))
  const taxAmount    = Math.round(stallTotal * 0.18)
  const grandTotal   = stallTotal + taxAmount
  const depositAmt   = Math.round(stallTotal * 0.25)
  const balanceDue   = grandTotal - depositAmt

  const toggleService = (name) => {
    if (services.find(s => s.name === name)?.is_mandatory) return
    setServices(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const handleBooking = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        expo_event:        code,
        selected_dims:     passedSelected.map(x => ({
          dimension_label: x.dim.dimension_label,
          hall:            x.hall?.hall_name,
          area:            getDimArea(x.dim),
          base_price:      x.dim.base_price,
          total_price:     getDimPrice(x.dim),
          stall_number:    x.dim.stall_number || '',
          stall_name:      x.dim.stall_name   || '',
        })),
        // Only service name sent — backend fetches actual price from Expo Service
        selected_services: selectedSvcs.map(s => ({ service: s.name })),
        stall_amount:      stallTotal,
        service_amount:    0,       // backend recalculates from Expo Service price
        tax_amount:        taxAmount,
        total_amount:      grandTotal,
        deposit_paid:      depositAmt,
        balance_due:       balanceDue,
      }
      const result = await createBooking(payload)
      setBookingDone(result)
    } catch (e) {
      setError(e.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────
  if (bookingDone) {
    return (
      <div style={{ minHeight: '100vh', background: t.bgBase, fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
          @keyframes popIn  { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
          * { box-sizing: border-box; }
        `}</style>
        <div style={{ maxWidth: 500, width: '100%', textAlign: 'center', animation: 'fadeUp 0.4s ease both' }}>
          {/* Success icon */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: accent + '20', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem', animation: 'popIn 0.4s ease both' }}>✓</div>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: t.textPrimary, marginBottom: 6 }}>Stall Blocked!</h1>
          <p style={{ color: t.textMuted, marginBottom: 24, fontSize: '0.88rem' }}>Your booking is confirmed. Our team will contact you shortly.</p>

          {/* Booking summary card */}
          <div style={{ background: t.bgSurface, border: `1px solid ${t.borderSubtle}`, borderRadius: 16, padding: 20, marginBottom: 14, textAlign: 'left' }}>
            <div style={{ fontSize: '0.6rem', color: t.textFaint, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}>BOOKING SUMMARY</div>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: accent, marginBottom: 14 }}>{bookingDone.booking_id}</div>

            {/* Stall rows */}
            {passedSelected.map((x, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid ' + t.borderSubtle, fontSize: '0.8rem' }}>
                <span style={{ color: t.textSecondary }}>
                  {x.dim.stall_number ? `${x.dim.stall_number} · ` : ''}{x.dim.dimension_label} m — {x.hall?.hall_name?.split('–')[0]?.trim()}
                </span>
                <span style={{ color: t.textPrimary, fontWeight: 600 }}>₹{getDimPrice(x.dim).toLocaleString()}</span>
              </div>
            ))}

            {/* Services — name only */}
            {selectedSvcs.length > 0 && (
              <div style={{ padding: '8px 0', borderBottom: '1px solid ' + t.borderSubtle }}>
                <div style={{ fontSize: '0.6rem', color: t.textFaint, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 6 }}>SERVICES (INVOICE PENDING)</div>
                {selectedSvcs.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.78rem', color: t.textSecondary, paddingTop: 4 }}>· {s.service_name}</div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.78rem' }}>
              <span style={{ color: t.textFaint }}>GST (18%)</span>
              <span style={{ color: t.textMuted }}>₹{taxAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0 0', fontSize: '0.9rem', fontWeight: 700 }}>
              <span style={{ color: t.textSecondary }}>Stall Total</span>
              <span style={{ color: accent, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment action card */}
          <div style={{ background: accent + '08', border: `1.5px solid ${accent}40`, borderRadius: 14, padding: 20, marginBottom: 14, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: t.textPrimary, marginBottom: 2 }}>📞 Our team will contact you</div>
                <div style={{ fontSize: '0.7rem', color: t.textMuted }}>Deposit payment collected manually</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: t.bgSurface, borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', color: t.textSecondary, fontWeight: 600 }}>Deposit to pay now</span>
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1.2rem' }}>₹{depositAmt.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', fontSize: '0.75rem' }}>
              <span style={{ color: t.textFaint }}>Balance due before event</span>
              <span style={{ color: t.textSecondary, fontWeight: 600 }}>₹{balanceDue.toLocaleString()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
            <button onClick={() => navigate(`/booth/${code}/${exhibitor?.name}`)}
              style={{ padding: '13px', borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${accent}CC)`, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#000', cursor: 'pointer' }}>
              🏪 Create Your Digital Booth
            </button>
            <button onClick={() => navigate(`/event/${code}`)}
              style={{ padding: '11px', borderRadius: 10, background: 'transparent', border: '1px solid ' + t.borderDefault, fontSize: '0.82rem', color: t.textMuted, cursor: 'pointer' }}>
              ← Back to Event
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bgBase, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-base); }
        ::-webkit-scrollbar-thumb { background: var(--border-hover); border-radius: 3px; }
      `}</style>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 2rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.navBg, backdropFilter: 'blur(20px)', borderBottom: '1px solid ' + t.borderSubtle }}>
        <button onClick={() => navigate(`/event/${code}`)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, border: '1px solid ' + t.borderDefault, background: 'transparent', color: t.textSecondary, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          {event.event_name}
        </button>
        <div style={{ fontSize: '0.78rem', color: t.textFaint }}>
          Booking as <span style={{ color: t.textSecondary, fontWeight: 600 }}>{exhibitor?.company_name || exhibitor?.exhibitor_name}</span>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 2rem 4rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 36, animation: 'fadeUp 0.3s ease both' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= step ? accent : t.bgHover, border: `1px solid ${i <= step ? accent : t.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: i <= step ? '#000' : t.textFaint, flexShrink: 0 }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: i === step ? 700 : 400, color: i === step ? t.textPrimary : i < step ? accent : t.textFaint, whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? accent + '60' : t.borderSubtle, margin: '0 12px' }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
          <div style={{ animation: 'fadeUp 0.35s ease both' }}>

            {/* STEP 0 */}
            {step === 0 && (
              <div>
                <SectionTitle title="Your Selected Stalls" accent={accent} t={t} />
                {passedSelected.length === 0 ? (
                  <div style={{ background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 14, padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏢</div>
                    <p style={{ color: t.textFaint }}>No stalls selected.</p>
                    <button onClick={() => navigate(`/event/${code}`)} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: accent, border: 'none', fontWeight: 700, color: '#000', cursor: 'pointer' }}>← Select Stalls</button>
                  </div>
                ) : passedSelected.map((x, i) => {
                  const area = getDimArea(x.dim), price = getDimPrice(x.dim)
                  return (
                    <div key={i} style={{ background: t.bgSurface, border: `1px solid ${accent}30`, borderRadius: 14, padding: 20, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: t.textPrimary, marginBottom: 2 }}>
                            {x.dim.stall_number && <span style={{ color: accent }}>{x.dim.stall_number} · </span>}
                            {x.dim.dimension_label} m
                          </div>
                          <div style={{ fontSize: '0.78rem', color: t.textMuted }}>{x.hall?.hall_name}</div>
                          {x.dim.stall_type && <div style={{ marginTop: 4, fontSize: '0.68rem', fontWeight: 700, color: accent, background: accent + '15', padding: '2px 8px', borderRadius: 4, display: 'inline-block' }}>{x.dim.stall_type?.toUpperCase()}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: accent }}>₹{price.toLocaleString()}</div>
                            <div style={{ fontSize: '0.7rem', color: t.textFaint }}>₹{x.dim.base_price?.toLocaleString()}/sqft · {area} sqm</div>
                          </div>
                          <button onClick={() => removeStall(i)} title="Remove"
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid #F8717130', background: '#F8717108', color: '#F87171', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F8717120'; e.currentTarget.style.borderColor = '#F87171' }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#F8717108'; e.currentTarget.style.borderColor = '#F8717130' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                            Remove
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        {[['Area', `${area} sqm`], ['Available', `${x.dim.available_stalls ?? '—'} / ${x.dim.total_stalls ?? '—'}`], ['Deposit (25%)', `₹${Math.round(price * 0.25).toLocaleString()}`]].map(([k, v]) => (
                          <div key={k} style={{ background: t.bgElevated, borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: '0.65rem', color: t.textFaint, marginBottom: 3 }}>{k.toUpperCase()}</div>
                            <div style={{ fontSize: '0.88rem', color: t.textSecondary, fontWeight: 600 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => navigate(`/event/${code}`, { state: { restoreSelected: passedSelected.map(x => ({ hallCode: x.hall?.hall_code || x.hall?.name, dimLabel: x.dim?.dimension_label })) } })}
                  style={{ marginTop: 4, padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid ' + t.borderDefault, fontSize: '0.78rem', color: t.textMuted, cursor: 'pointer' }}>
                  + Add / Change Stalls
                </button>
              </div>
            )}

            {/* STEP 1 — Services */}
            {step === 1 && (
              <div>
                <SectionTitle title="Additional Services" accent={accent} t={t} />
                <p style={{ fontSize: '0.82rem', color: t.textMuted, marginBottom: 20 }}>
                  Select services for your stall. Charges will be added to your final invoice.
                </p>
                {services.length === 0 ? (
                  <div style={{ background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 14, padding: 30, textAlign: 'center', color: t.textFaint }}>No services available for this event.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {services.map(svc => {
                      const checked = selectedServices.has(svc.name)
                      const color = SVC_COLOR[svc.category] || '#9CA3AF'
                      return (
                        <div key={svc.name} onClick={() => !svc.is_mandatory && toggleService(svc.name)}
                          style={{ display: 'flex', gap: 14, alignItems: 'center', background: (checked || !!svc.is_mandatory) ? color + '08' : t.bgSurface, border: `1px solid ${(checked || !!svc.is_mandatory) ? color + '50' : t.borderSubtle}`, borderRadius: 12, padding: '14px 16px', cursor: svc.is_mandatory ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked || !!svc.is_mandatory ? color : t.borderHover}`, background: checked || !!svc.is_mandatory ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {(checked || !!svc.is_mandatory) && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 800 }}>✓</span>}
                          </div>
                          <div style={{ width: 38, height: 38, borderRadius: 9, background: color + '15', border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                            {SVC_ICON[svc.category] || '🔧'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: t.textSecondary, marginBottom: 2 }}>
                              {svc.service_name}
                              {svc.is_mandatory && <span style={{ marginLeft: 8, fontSize: '0.62rem', fontWeight: 700, color: '#F87171', background: '#F8717115', padding: '2px 6px', borderRadius: 4 }}>MANDATORY</span>}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: t.textFaint }}>
                              <span style={{ color, fontWeight: 600 }}>{svc.category}</span>{' · '}{svc.charge_type}
                              {svc.description && <span> · {svc.description}</span>}
                            </div>
                          </div>
                          <div style={{ flexShrink: 0 }}>
                            {(checked || !!svc.is_mandatory) ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color, background: color + '15', padding: '3px 10px', borderRadius: 20 }}>
                                {svc.is_mandatory ? 'Required' : 'Added'}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: t.textGhost }}>Optional</span>
                            )}
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
                <SectionTitle title="Review & Checkout" accent={accent} t={t} />

                <div style={{ background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 14, padding: 20, marginBottom: 16 }}>
                  <div style={{ fontSize: '0.65rem', color: t.textFaint, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 12 }}>STALLS</div>
                  {passedSelected.map((x, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid ' + t.borderSubtle, fontSize: '0.83rem' }}>
                      <span style={{ color: t.textSecondary }}>{x.dim.stall_number ? `${x.dim.stall_number} · ` : ''}{x.dim.dimension_label} m — {x.hall?.hall_name?.split('–')[0]?.trim()}</span>
                      <span style={{ color: t.textPrimary, fontWeight: 600 }}>₹{getDimPrice(x.dim).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {selectedSvcs.length > 0 && (
                  <div style={{ background: t.bgSurface, border: '1px solid ' + t.borderSubtle, borderRadius: 14, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: '0.65rem', color: t.textFaint, fontWeight: 700, letterSpacing: '0.1em' }}>ADDITIONAL SERVICES</div>
                      <span style={{ fontSize: '0.65rem', color: t.textGhost, fontStyle: 'italic' }}>Billed in final invoice</span>
                    </div>
                    {selectedSvcs.map((s, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < selectedSvcs.length - 1 ? '1px solid ' + t.borderSubtle : 'none', fontSize: '0.83rem' }}>
                        <span style={{ color: t.textSecondary }}>{s.service_name}</span>
                        <span style={{ fontSize: '0.7rem', color: t.textFaint }}>—</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: t.bgSurface, border: `1px solid ${accent}30`, borderRadius: 14, padding: 20, marginBottom: 20 }}>
                  {[['Stall Amount', `₹${stallTotal.toLocaleString()}`], ['GST (18%)', `₹${taxAmount.toLocaleString()}`]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid ' + t.borderSubtle, fontSize: '0.82rem' }}>
                      <span style={{ color: t.textFaint }}>{k}</span>
                      <span style={{ color: t.textSecondary }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px' }}>
                    <span style={{ color: t.textSecondary, fontWeight: 700 }}>Stall Total</span>
                    <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: accent }}>₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ background: accent + '10', border: `1px solid ${accent}25`, borderRadius: 10, padding: '10px 14px', marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: t.textSecondary, fontWeight: 600 }}>Pay now to block stall</div>
                        <div style={{ fontSize: '0.68rem', color: t.textFaint, marginTop: 2 }}>Service charges in final invoice</div>
                      </div>
                      <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1.1rem' }}>₹{depositAmt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {error && <div style={{ padding: '12px 16px', borderRadius: 10, background: '#F8717110', border: '1px solid #F8717130', color: '#F87171', fontSize: '0.82rem', marginBottom: 16 }}>⚠ {error}</div>}

                <div style={{ fontSize: '0.72rem', color: t.textGhost, lineHeight: 1.6, marginBottom: 20 }}>
                  By proceeding, you agree to the stall booking terms and cancellation policy of {event.event_name}.
                </div>

                <button onClick={handleBooking} disabled={submitting}
                  style={{ width: '100%', padding: '15px', borderRadius: 12, background: submitting ? t.bgHover : `linear-gradient(135deg, ${accent}, ${accent}CC)`, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: submitting ? t.textFaint : '#000', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s' }}>
                  {submitting ? <><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + t.borderHover, borderTopColor: accent, animation: 'spin 0.7s linear infinite' }} />Processing...</> : `Confirm & Express Interest ₹${depositAmt.toLocaleString()}`}
                </button>
              </div>
            )}

            {step < 2 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button onClick={() => setStep(s => s + 1)} disabled={passedSelected.length === 0}
                  style={{ padding: '12px 28px', borderRadius: 10, background: passedSelected.length === 0 ? t.bgHover : accent, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: passedSelected.length === 0 ? t.textFaint : '#000', cursor: passedSelected.length === 0 ? 'not-allowed' : 'pointer' }}>
                  {step === 0 ? 'Continue to Services →' : 'Review & Checkout →'}
                </button>
              </div>
            )}
            {step > 0 && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setStep(s => s - 1)} style={{ padding: '8px 16px', borderRadius: 8, background: 'transparent', border: '1px solid ' + t.borderDefault, fontSize: '0.8rem', color: t.textMuted, cursor: 'pointer' }}>← Back</button>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY sidebar — stall total only, services listed as "Invoice" */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: t.bgSurface, border: `1px solid ${accent}20`, borderRadius: 16, padding: 20, animation: 'fadeUp 0.4s ease 0.1s both' }}>
              <div style={{ fontSize: '0.65rem', color: t.textFaint, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 14 }}>ORDER SUMMARY</div>

              {passedSelected.map((x, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.78rem' }}>
                  <span style={{ color: t.textMuted }}>{x.dim.stall_number || x.dim.dimension_label} m</span>
                  <span style={{ color: t.textSecondary, fontWeight: 600 }}>₹{getDimPrice(x.dim).toLocaleString()}</span>
                </div>
              ))}

              {/* Services — name only, price NOT shown, total NOT affected */}
              {selectedSvcs.length > 0 && (
                <div style={{ borderTop: '1px dashed ' + t.borderSubtle, marginTop: 8, paddingTop: 8 }}>
                  {selectedSvcs.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.75rem' }}>
                      <span style={{ color: t.textFaint }}>{s.service_name}</span>
                      <span style={{ fontSize: '0.65rem', color: t.textGhost, fontStyle: 'italic' }}>Invoice</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid ' + t.borderSubtle, marginTop: 10, paddingTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: t.textFaint }}>GST (18%)</span>
                  <span style={{ color: t.textMuted }}>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: t.textSecondary, fontWeight: 600 }}>Stall Total</span>
                  <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1.1rem' }}>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid ' + t.borderSubtle, marginTop: 12, paddingTop: 12 }}>
                <div style={{ fontSize: '0.68rem', color: t.textFaint, marginBottom: 4 }}>Deposit <span style={{ color: accent, fontWeight: 700 }}>(25% of stall)</span></div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: accent, fontSize: '1.3rem' }}>₹{depositAmt.toLocaleString()}</div>
                <div style={{ fontSize: '0.65rem', color: t.textGhost, marginTop: 2 }}>Balance: ₹{balanceDue.toLocaleString()}</div>
              </div>

              <div style={{ marginTop: 14, padding: '10px 12px', background: t.bgElevated, borderRadius: 8, fontSize: '0.7rem', color: t.textFaint, lineHeight: 1.6 }}>
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

function SectionTitle({ title, accent, t }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 20, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: t.textSecondary, letterSpacing: '-0.01em' }}>{title}</h2>
    </div>
  )
}