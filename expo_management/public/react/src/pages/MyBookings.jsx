import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getMyBookings } from '../api/frappe'

const STATUS_CONFIG = {
  'Pending':  { color: '#F59E0B', bg: '#F59E0B15', label: 'Payment Pending', icon: '⏳' },
  'Paid':     { color: '#00FF87', bg: '#00FF8715', label: 'Paid',            icon: '✓'  },
  'Partial':  { color: '#60A5FA', bg: '#60A5FA15', label: 'Partial Payment', icon: '◑'  },
  'Cancelled':{ color: '#F87171', bg: '#F8717115', label: 'Cancelled',       icon: '✕'  },
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function MyBookings() {
  const navigate  = useNavigate()
  const { exhibitor } = useAuth()
  const { isDark }    = useTheme()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [expanded, setExpanded] = useState(null)

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
    elevated:  isDark ? '#141414' : '#F8F7F4',
    shadow:    isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
  }

  useEffect(() => {
    if (!exhibitor) { navigate('/login'); return }
    getMyBookings()
      .then(data => { setBookings(data || []); setLoading(false) })
      .catch(e  => { setError(e.message); setLoading(false) })
  }, [exhibitor])

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer  { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes spin     { to{transform:rotate(360deg)} }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.border}` }}>
        <button onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.textMuted, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Events
        </button>
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: c.text, letterSpacing: '-0.02em' }}>My Bookings</span>
        <div style={{ width: 100 }} />
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 1.5rem 4rem' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.4s ease both' }}>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '-0.03em', color: c.text, marginBottom: 6 }}>
            Your Stall Bookings
          </h1>
          <p style={{ color: c.textDim, fontSize: '0.88rem' }}>
            {exhibitor?.company_name || exhibitor?.exhibitor_name} · Track your reservations and payment status
          </p>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRadius: 16, border: `1px solid ${c.border}`, background: c.card, overflow: 'hidden', height: 120 }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, ${c.btnBg} 25%, ${c.cardHov} 50%, ${c.btnBg} 75%)`, backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠</div>
            <p style={{ color: '#F87171', fontWeight: 600, marginBottom: 16 }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', borderRadius: 8, background: '#F59E0B', border: 'none', fontWeight: 600, cursor: 'pointer', color: '#000' }}>Retry</button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', animation: 'fadeUp 0.4s ease both' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16, opacity: 0.3 }}>🏢</div>
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: c.textDim, marginBottom: 8 }}>No bookings yet</h3>
            <p style={{ color: c.textFaint, fontSize: '0.85rem', marginBottom: 24 }}>Explore events and book your first stall</p>
            <button onClick={() => navigate('/')} style={{ padding: '10px 24px', borderRadius: 10, background: '#F59E0B', border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.88rem', color: '#000', cursor: 'pointer' }}>
              Browse Events →
            </button>
          </div>
        )}

        {/* ── Bookings List ── */}
        {!loading && !error && bookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Summary strip */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4, animation: 'fadeUp 0.35s ease both' }}>
              {[
                ['Total',   bookings.length,                                      c.textMuted],
                ['Pending', bookings.filter(b => b.payment_status === 'Pending').length, '#F59E0B'],
                ['Paid',    bookings.filter(b => b.payment_status === 'Paid').length,    '#00FF87'],
              ].map(([label, count, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: c.card, border: `1px solid ${c.border}`, fontSize: '0.75rem' }}>
                  <span style={{ color: c.textFaint }}>{label}</span>
                  <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color, fontSize: '0.85rem' }}>{count}</span>
                </div>
              ))}
            </div>

            {bookings.map((b, idx) => {
              const st     = STATUS_CONFIG[b.payment_status] || STATUS_CONFIG['Pending']
              const isOpen = expanded === b.name
              const stalls = b.stall_number?.split('|').map(s => s.trim()).filter(Boolean) || []

              return (
                <div key={b.name}
                  style={{ background: c.card, border: `1px solid ${isOpen ? st.color + '40' : c.border}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: isOpen ? c.shadow : 'none', animation: `fadeUp 0.4s ease ${idx * 0.05}s both` }}>

                  {/* Card header — always visible */}
                  <div onClick={() => setExpanded(isOpen ? null : b.name)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}>

                    {/* Status dot */}
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: st.bg, border: `1px solid ${st.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, marginTop: 2 }}>
                      {st.icon}
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: c.text, letterSpacing: '-0.01em' }}>
                          {b.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: st.bg, border: `1px solid ${st.color}40`, fontSize: '0.68rem', fontWeight: 700, color: st.color, letterSpacing: '0.04em', flexShrink: 0 }}>
                          {st.label.toUpperCase()}
                        </div>
                      </div>

                      {/* Stall numbers */}
                      <div style={{ fontSize: '0.82rem', color: c.textMuted, marginBottom: 6 }}>
                        {stalls.length > 0
                          ? stalls.map((s, i) => (
                              <span key={i} style={{ display: 'inline-block', marginRight: 8, marginBottom: 2 }}>
                                <span style={{ color: '#F59E0B', fontWeight: 700 }}>🏢</span> {s}
                              </span>
                            ))
                          : <span style={{ color: c.textFaint }}>—</span>
                        }
                      </div>

                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: c.textFaint }}>
                          📅 {fmtDate(b.booking_date)} {fmtTime(b.booking_date)}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: c.textFaint }}>
                          📁 {b.expo_event}
                        </span>
                      </div>
                    </div>

                    {/* Amount + chevron */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#F59E0B' }}>
                        ₹{(b.total_amount || 0).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: c.textFaint }}>Stall Total</div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.textFaint} strokeWidth="2.5" strokeLinecap="round"
                        style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', marginTop: 4 }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                  </div>

                  {/* ── Expanded detail ── */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${c.border}`, padding: '16px 20px', background: c.elevated, animation: 'fadeUp 0.2s ease both' }}>

                      {/* Payment breakdown */}
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.6rem', color: c.textFaint, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}>PAYMENT BREAKDOWN</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            ['Stall Amount',  b.base_amount,   c.textSecondary],
                            ['GST (18%)',     b.tax_amount,    c.textSecondary],
                            ['Stall Total',   b.total_amount,  '#F59E0B'],
                            ['Deposit Paid',  b.deposit_paid,  '#00FF87'],
                            ['Balance Due',   b.balance_due,   b.balance_due > 0 ? '#F59E0B' : '#00FF87'],
                          ].map(([label, val, color]) => (
                            <div key={label} style={{ background: c.card, borderRadius: 10, padding: '10px 12px', border: `1px solid ${c.border}` }}>
                              <div style={{ fontSize: '0.62rem', color: c.textFaint, marginBottom: 3 }}>{label.toUpperCase()}</div>
                              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color }}>
                                ₹{(val || 0).toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Services */}
                      {b.services?.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: '0.6rem', color: c.textFaint, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 }}>ADDITIONAL SERVICES</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {b.services.map((s, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: c.card, borderRadius: 8, border: `1px solid ${c.border}`, fontSize: '0.8rem' }}>
                                <span style={{ color: c.textMuted }}>🔧 {s.service_name}</span>
                                <span style={{ fontSize: '0.68rem', color: c.textFaint, fontStyle: 'italic' }}>Invoice pending</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Balance due alert */}
                      {b.balance_due > 0 && b.payment_status !== 'Cancelled' && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F59E0B10', border: '1px solid #F59E0B30', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B' }}>Balance Due</div>
                            <div style={{ fontSize: '0.68rem', color: c.textFaint, marginTop: 1 }}>Payable before event</div>
                          </div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: '#F59E0B', fontSize: '1.1rem' }}>
                            ₹{(b.balance_due || 0).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => navigate(`/event/${b.expo_event}`)}
                          style={{ flex: 1, minWidth: 120, padding: '9px 16px', borderRadius: 9, background: 'transparent', border: `1px solid ${c.border}`, fontSize: '0.78rem', fontWeight: 600, color: c.textMuted, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          View Event
                        </button>
                        <button onClick={() => navigate(`/booth/${b.expo_event}/${exhibitor?.name}`)}
                          style={{ flex: 1, minWidth: 120, padding: '9px 16px', borderRadius: 9, background: '#F59E0B15', border: '1px solid #F59E0B40', fontSize: '0.78rem', fontWeight: 700, color: '#F59E0B', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          🏪 Digital Booth
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}