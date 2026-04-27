import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getMyBookings } from '../api/frappe'

const STATUS_CONFIG = {
  'Pending':   { color: '#F59E0B', bg: '#F59E0B15', label: 'Payment Pending', icon: '⏳' },
  'Paid':      { color: '#00FF87', bg: '#00FF8715', label: 'Paid',            icon: '✓'  },
  'Partial':   { color: '#60A5FA', bg: '#60A5FA15', label: 'Partial Payment', icon: '◑'  },
  'Cancelled': { color: '#F87171', bg: '#F8717115', label: 'Cancelled',       icon: '✕'  },
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}
function numWords(n) {
  if (!n) return 'Zero'
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  function hw(n) {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '')
    return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + hw(n%100) : '')
  }
  const cr = Math.floor(n/10000000), rem1 = n%10000000
  const lakh = Math.floor(rem1/100000), rem2 = rem1%100000
  const th = Math.floor(rem2/1000), rem3 = rem2%1000
  let w = ''
  if (cr)   w += hw(cr) + ' Crore '
  if (lakh) w += hw(lakh) + ' Lakh '
  if (th)   w += hw(th) + ' Thousand '
  if (rem3) w += hw(rem3)
  return w.trim() + ' Rupees Only'
}

function buildInvoiceHTML(b, exhibitor) {
  const stalls = b.stall_number?.split('|').map(s => s.trim()).filter(Boolean) || []
  const svcs   = b.services || []
  const today  = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })
  const svcTotal = svcs.reduce((s, x) => s + (x.amount || 0), 0)

  const rows = stalls.map(s => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${s}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">1</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(b.base_amount||0).toLocaleString()}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">18%</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(b.total_amount||0).toLocaleString()}</td>
    </tr>`).join('')

  const svcRows = svcs.map(s => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${s.service_name}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">1</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(s.amount||0).toLocaleString()}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">${s.tax_percent||18}%</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(s.amount||0).toLocaleString()}</td>
    </tr>`).join('')

  const grandTotal = (b.total_amount||0) + svcTotal

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Invoice ${b.name}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 32px; color: #111; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #F59E0B; padding-bottom: 20px; }
  .logo-block h1 { font-size: 1.8rem; font-weight: 900; color: #111; margin: 0; letter-spacing: -0.03em; }
  .logo-block p { color: #6b7280; font-size: 0.82rem; margin: 4px 0 0; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 1.4rem; font-weight: 900; color: #F59E0B; margin: 0 0 6px; }
  .invoice-meta p { color: #6b7280; font-size: 0.8rem; margin: 2px 0; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .party-box { background: #f9fafb; border-radius: 10px; padding: 16px; }
  .party-box h4 { font-size: 0.65rem; color: #9ca3af; letter-spacing: 0.1em; font-weight: 700; margin: 0 0 8px; }
  .party-box p { margin: 2px 0; font-size: 0.85rem; color: #374151; }
  .party-box .name { font-weight: 700; font-size: 0.95rem; color: #111; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead th { background: #111; color: #fff; padding: 10px; font-size: 0.75rem; text-align: left; }
  thead th:not(:first-child) { text-align: right; }
  thead th:nth-child(2) { text-align: center; }
  tbody tr:last-child td { border-bottom: none; }
  .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
  .totals-box { min-width: 280px; }
  .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
  .totals-row.grand { font-weight: 800; font-size: 1rem; color: #111; border-bottom: none; border-top: 2px solid #111; padding-top: 10px; margin-top: 4px; }
  .totals-row.deposit { color: #059669; }
  .totals-row.balance { color: #d97706; font-weight: 700; }
  .words { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px; font-size: 0.78rem; color: #92400e; margin-bottom: 24px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em; }
  .footer { border-top: 1px solid #e5e7eb; padding-top: 16px; text-align: center; color: #9ca3af; font-size: 0.75rem; }
  .section-label { font-size: 0.65rem; color: #9ca3af; font-weight: 700; letter-spacing: 0.1em; margin: 20px 0 8px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-block">
      <h1>ExpoMgmt</h1>
      <p>India's Expo Platform</p>
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>${b.name}</strong></p>
      <p>Date: ${today}</p>
      <p>Event: ${b.expo_event}</p>
      <span class="status-badge" style="background:${STATUS_CONFIG[b.payment_status]?.bg||'#f3f4f6'};color:${STATUS_CONFIG[b.payment_status]?.color||'#374151'};">
        ${b.payment_status?.toUpperCase() || 'PENDING'}
      </span>
    </div>
  </div>
  <div class="parties">
    <div class="party-box">
      <h4>BILLED TO</h4>
      <p class="name">${exhibitor?.company_name || exhibitor?.exhibitor_name || '—'}</p>
      <p>${exhibitor?.exhibitor_name || ''}</p>
      ${exhibitor?.gst_number ? `<p>GSTIN: ${exhibitor.gst_number}</p>` : ''}
      <p>${exhibitor?.email || ''}</p>
      <p>${exhibitor?.mobile || ''}</p>
    </div>
    <div class="party-box">
      <h4>BOOKING DETAILS</h4>
      <p class="name">${b.expo_event}</p>
      <p>Booking: ${b.name}</p>
      <p>Date: ${fmtDate(b.booking_date)} ${fmtTime(b.booking_date)}</p>
      <p>Stalls: ${stalls.length}</p>
    </div>
  </div>
  <div class="section-label">STALL DETAILS</div>
  <table>
    <thead><tr>
      <th>Stall / Description</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Base Amount</th>
      <th style="text-align:right">GST</th>
      <th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${svcs.length > 0 ? `
  <div class="section-label">ADDITIONAL SERVICES</div>
  <table>
    <thead><tr>
      <th>Service</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Amount</th>
      <th style="text-align:right">GST</th>
      <th style="text-align:right">Total</th>
    </tr></thead>
    <tbody>${svcRows}</tbody>
  </table>` : ''}
  <div class="totals">
    <div class="totals-box">
      <div class="totals-row"><span>Stall Amount (excl. GST)</span><span>₹${(b.base_amount||0).toLocaleString()}</span></div>
      <div class="totals-row"><span>GST (18%)</span><span>₹${(b.tax_amount||0).toLocaleString()}</span></div>
      ${svcTotal > 0 ? `<div class="totals-row"><span>Services Total</span><span>₹${svcTotal.toLocaleString()}</span></div>` : ''}
      <div class="totals-row grand"><span>Grand Total</span><span>₹${grandTotal.toLocaleString()}</span></div>
      <div class="totals-row deposit"><span>Deposit Paid (25%)</span><span>− ₹${(b.deposit_paid||0).toLocaleString()}</span></div>
      <div class="totals-row balance"><span>Balance Due</span><span>₹${((b.balance_due||0) + svcTotal).toLocaleString()}</span></div>
    </div>
  </div>
  <div class="words">Amount in words: <strong>${numWords(Math.round(grandTotal))}</strong></div>
  <div class="footer">
    <p>This is a computer-generated invoice. Payment is subject to terms agreed at booking.</p>
    <p>For queries: contact your expo organizer · ExpoMgmt Platform</p>
  </div>
</body>
</html>`
}

function downloadInvoice(b, exhibitor) {
  const html = buildInvoiceHTML(b, exhibitor)
  const blob = new Blob([html], { type: 'text/html' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `Invoice_${b.name}.html`
  a.click()
  URL.revokeObjectURL(url)
}

function printInvoice(b, exhibitor) {
  const html = buildInvoiceHTML(b, exhibitor)
  const win  = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}

export default function MyBookings() {
  const navigate      = useNavigate()
  const { exhibitor } = useAuth()
  const { isDark }    = useTheme()

  const [bookings, setBookings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [expanded, setExpanded]       = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch]           = useState('')

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
    inputBg:   isDark ? '#111' : '#fff',
  }

  useEffect(() => {
    if (!exhibitor) { navigate('/login'); return }
    getMyBookings()
      .then(data => { setBookings(data || []); setLoading(false) })
      .catch(e   => { setError(e.message);    setLoading(false) })
  }, [exhibitor])

  // ── Filter + Search logic ─────────────────────────────────
  const filteredBookings = bookings.filter(b => {
    const matchStatus = filterStatus === 'All' || b.payment_status === filterStatus
    const q = search.trim().toLowerCase()
    const matchSearch = !q
      || b.name?.toLowerCase().includes(q)
      || b.expo_event?.toLowerCase().includes(q)
      || b.stall_number?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const counts = {
    All:       bookings.length,
    Pending:   bookings.filter(b => b.payment_status === 'Pending').length,
    Paid:      bookings.filter(b => b.payment_status === 'Paid').length,
    Partial:   bookings.filter(b => b.payment_status === 'Partial').length,
    Cancelled: bookings.filter(b => b.payment_status === 'Cancelled').length,
  }

  const filterTabs = [
    { key: 'All',       label: 'All',       color: c.textMuted },
    { key: 'Pending',   label: 'Pending',   color: '#F59E0B'   },
    { key: 'Paid',      label: 'Paid',      color: '#00FF87'   },
    { key: 'Partial',   label: 'Partial',   color: '#60A5FA'   },
    { key: 'Cancelled', label: 'Cancelled', color: '#F87171'   },
  ].filter(t => t.key === 'All' || counts[t.key] > 0)

  return (
    <div style={{ minHeight: '100vh', background: c.bg, fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .filter-tab:hover { opacity: 0.85; }
        .search-input:focus { outline: none; border-color: #F59E0B !important; }
      `}</style>

      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 60, padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.navBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${c.border}` }}>
        <button onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.textMuted, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to Events
        </button>
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: c.text, letterSpacing: '-0.02em' }}>My Bookings</span>
        <div style={{ width: 100 }} />
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 1.5rem 4rem' }}>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '-0.03em', color: c.text, marginBottom: 6 }}>
            Your Stall Bookings
          </h1>
          <p style={{ color: c.textDim, fontSize: '0.88rem' }}>
            {exhibitor?.company_name || exhibitor?.exhibitor_name} · Track your reservations and payment status
          </p>
        </div>

        {/* ── FILTER + SEARCH BAR ── */}
        {!loading && !error && bookings.length > 0 && (
          <div style={{ marginBottom: 20, animation: 'fadeUp 0.35s ease 0.05s both' }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.textFaint} strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search by booking ID, event, stall number…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 10, border: `1px solid ${c.border}`, background: c.inputBg, color: c.text, fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s' }}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: c.textFaint, cursor: 'pointer', fontSize: '1rem', padding: '2px 6px' }}>
                  ✕
                </button>
              )}
            </div>

            {/* Status filter tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {filterTabs.map(tab => {
                const isActive = filterStatus === tab.key
                return (
                  <button
                    key={tab.key}
                    className="filter-tab"
                    onClick={() => setFilterStatus(tab.key)}
                    style={{
                      padding: '5px 14px', borderRadius: 100, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700,
                      transition: 'all 0.15s', fontFamily: 'DM Sans, sans-serif',
                      background: isActive ? (tab.key === 'All' ? c.text : tab.color) : c.card,
                      border: `1.5px solid ${isActive ? (tab.key === 'All' ? c.text : tab.color) : c.border}`,
                      color: isActive ? (tab.key === 'All' ? (isDark ? '#000' : '#fff') : '#000') : tab.color === c.textMuted ? c.textMuted : tab.color,
                    }}>
                    {tab.label}
                    <span style={{ marginLeft: 5, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800 }}>
                      {counts[tab.key]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Results count */}
            {(filterStatus !== 'All' || search) && (
              <div style={{ marginTop: 8, fontSize: '0.72rem', color: c.textFaint }}>
                {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
                {search && <span> for "<span style={{ color: c.textMuted }}>{search}</span>"</span>}
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ borderRadius: 16, border: `1px solid ${c.border}`, background: c.card, overflow: 'hidden', height: 120 }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, ${c.btnBg} 25%, ${c.cardHov} 50%, ${c.btnBg} 75%)`, backgroundSize: '400px', animation: 'shimmer 1.4s infinite' }} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠</div>
            <p style={{ color: '#F87171', fontWeight: 600, marginBottom: 16 }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ padding: '8px 20px', borderRadius: 8, background: '#F59E0B', border: 'none', fontWeight: 600, cursor: 'pointer', color: '#000' }}>Retry</button>
          </div>
        )}

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

        {/* No results after filter */}
        {!loading && !error && bookings.length > 0 && filteredBookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', animation: 'fadeUp 0.3s ease both' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }}>🔍</div>
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: c.textDim, marginBottom: 8 }}>No results found</h3>
            <p style={{ color: c.textFaint, fontSize: '0.82rem', marginBottom: 16 }}>Try changing the filter or search term</p>
            <button onClick={() => { setFilterStatus('All'); setSearch('') }}
              style={{ padding: '8px 20px', borderRadius: 8, background: c.btnBg, border: `1px solid ${c.border}`, fontSize: '0.82rem', color: c.textMuted, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filteredBookings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredBookings.map((b, idx) => {
              const st     = STATUS_CONFIG[b.payment_status] || STATUS_CONFIG['Pending']
              const isOpen = expanded === b.name
              const stalls = b.stall_number?.split('|').map(s => s.trim()).filter(Boolean) || []
              const svcs   = b.services || []
              const svcTotal = svcs.reduce((s, x) => s + (x.amount || 0), 0)

              return (
                <div key={b.name}
                  style={{ background: c.card, border: `1px solid ${isOpen ? st.color + '40' : c.border}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: isOpen ? c.shadow : 'none', animation: `fadeUp 0.4s ease ${idx * 0.05}s both` }}>

                  {/* Card header */}
                  <div onClick={() => setExpanded(isOpen ? null : b.name)}
                    style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, background: st.bg, border: `1px solid ${st.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, marginTop: 2 }}>
                      {st.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: c.text, letterSpacing: '-0.01em' }}>{b.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: st.bg, border: `1px solid ${st.color}40`, fontSize: '0.68rem', fontWeight: 700, color: st.color, letterSpacing: '0.04em', flexShrink: 0 }}>
                          {st.label.toUpperCase()}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: c.textMuted, marginBottom: 6 }}>
                        {stalls.length > 0
                          ? stalls.map((s, i) => <span key={i} style={{ display: 'inline-block', marginRight: 8, marginBottom: 2 }}><span style={{ color: '#F59E0B', fontWeight: 700 }}>🏢</span> {s}</span>)
                          : <span style={{ color: c.textFaint }}>—</span>
                        }
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: c.textFaint }}>📅 {fmtDate(b.booking_date)} {fmtTime(b.booking_date)}</span>
                        <span style={{ fontSize: '0.72rem', color: c.textFaint }}>📁 {b.expo_event}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#F59E0B' }}>₹{(b.total_amount || 0).toLocaleString()}</div>
                      <div style={{ fontSize: '0.65rem', color: c.textFaint }}>Stall Total</div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.textFaint} strokeWidth="2.5" strokeLinecap="round"
                        style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', marginTop: 4 }}>
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${c.border}`, padding: '16px 20px', background: c.elevated, animation: 'fadeUp 0.2s ease both' }}>

                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.6rem', color: c.textFaint, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10 }}>STALL PAYMENT BREAKDOWN</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            ['Stall Amount',  b.base_amount,  c.textMuted],
                            ['GST (18%)',     b.tax_amount,   c.textMuted],
                            ['Stall Total',   b.total_amount, '#F59E0B'],
                            ['Deposit Paid',  b.deposit_paid, '#00FF87'],
                            ['Balance Due',   b.balance_due,  b.balance_due > 0 ? '#F59E0B' : '#00FF87'],
                            ...(svcTotal > 0 ? [['Total Payable', (b.balance_due||0) + svcTotal, '#F87171']] : []),
                          ].map(([label, val, color]) => (
                            <div key={label} style={{ background: c.card, borderRadius: 10, padding: '10px 12px', border: `1px solid ${c.border}` }}>
                              <div style={{ fontSize: '0.62rem', color: c.textFaint, marginBottom: 3 }}>{label.toUpperCase()}</div>
                              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color }}>₹{(val || 0).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {svcs.length > 0 && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: '0.6rem', color: c.textFaint, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 }}>ADDITIONAL SERVICES</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {svcs.map((s, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: c.card, borderRadius: 10, border: `1px solid ${c.border}` }}>
                                <div>
                                  <div style={{ fontSize: '0.82rem', color: c.textMuted, fontWeight: 600 }}>🔧 {s.service_name}</div>
                                  {s.charge_type && <div style={{ fontSize: '0.68rem', color: c.textFaint, marginTop: 2 }}>{s.charge_type}</div>}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  {s.amount > 0 ? (
                                    <>
                                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#60A5FA' }}>₹{s.amount.toLocaleString()}</div>
                                      <div style={{ fontSize: '0.62rem', color: c.textFaint }}>+{s.tax_percent||18}% GST</div>
                                    </>
                                  ) : (
                                    <div style={{ fontSize: '0.68rem', color: c.textFaint, fontStyle: 'italic' }}>Invoice pending</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {svcTotal > 0 && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: '#60A5FA10', borderRadius: 8, border: '1px solid #60A5FA25' }}>
                                <span style={{ fontSize: '0.75rem', color: c.textMuted, fontWeight: 600 }}>Services Total</span>
                                <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: '#60A5FA', fontSize: '0.9rem' }}>₹{svcTotal.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {svcTotal > 0 && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#F59E0B10', border: '1px solid #F59E0B30', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B' }}>Grand Total (Stall + Services)</div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, color: '#F59E0B', fontSize: '1.1rem' }}>
                            ₹{((b.total_amount||0) + svcTotal).toLocaleString()}
                          </div>
                        </div>
                      )}

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

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => navigate(`/event/${b.expo_event}`)}
                          style={{ flex: 1, minWidth: 100, padding: '9px 14px', borderRadius: 9, background: 'transparent', border: `1px solid ${c.border}`, fontSize: '0.78rem', fontWeight: 600, color: c.textMuted, cursor: 'pointer' }}>
                          View Event
                        </button>
                        <button onClick={() => printInvoice(b, exhibitor)}
                          style={{ flex: 1, minWidth: 100, padding: '9px 14px', borderRadius: 9, background: '#60A5FA15', border: '1px solid #60A5FA40', fontSize: '0.78rem', fontWeight: 700, color: '#60A5FA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          🖨️ Print Invoice
                        </button>
                        <button onClick={() => downloadInvoice(b, exhibitor)}
                          style={{ flex: 1, minWidth: 100, padding: '9px 14px', borderRadius: 9, background: '#00FF8715', border: '1px solid #00FF8740', fontSize: '0.78rem', fontWeight: 700, color: '#00FF87', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                          ⬇️ Download
                        </button>
                        <button onClick={() => navigate(`/booth/${b.expo_event}/${exhibitor?.name}`)}
                          style={{ flex: 1, minWidth: 100, padding: '9px 14px', borderRadius: 9, background: '#F59E0B15', border: '1px solid #F59E0B40', fontSize: '0.78rem', fontWeight: 700, color: '#F59E0B', cursor: 'pointer' }}>
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