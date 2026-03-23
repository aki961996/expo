import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_BASE = '/api/method/expo_management.expo_management.auth'

async function apiCall(method, body = {}) {
  const res = await fetch(`${API_BASE}.${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': window.csrf_token || 'fetch',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  const data = await res.json()
  if (data.exc) throw new Error(data.exc)
  return data.message
}

export default function ProfilePage() {
  const navigate              = useNavigate()
  const { exhibitor, logout } = useAuth()
  const fileRef               = useRef(null)

  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [error, setError]           = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const [form, setForm] = useState({
    exhibitor_name:     '',
    company_name:       '',
    email:              '',
    mobile:             '',
    industry:           '',
    gst_number:         '',
    annual_turnover:    '',
    website:            '',
    product_categories: '',
    description:        '',
  })

  // ── Sync form when exhibitor loads from context ────────────
  useEffect(() => {
    if (exhibitor) {
      setForm({
        exhibitor_name:     exhibitor.exhibitor_name     || '',
        company_name:       exhibitor.company_name       || '',
        email:              exhibitor.email              || '',
        mobile:             exhibitor.mobile             || '',
        industry:           exhibitor.industry           || '',
        gst_number:         exhibitor.gst_number         || '',
        annual_turnover:    exhibitor.annual_turnover    || '',
        website:            exhibitor.website            || '',
        product_categories: exhibitor.product_categories || '',
        description:        exhibitor.description        || '',
      })
    }
  }, [exhibitor])

  // ── Redirect if not logged in ──────────────────────────────
  useEffect(() => {
    if (exhibitor === null) navigate('/login')
  }, [exhibitor, navigate])

  if (!exhibitor) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await apiCall('update_profile', {
        exhibitor_name:     form.exhibitor_name,
        company_name:       form.company_name,
        industry:           form.industry,
        gst_number:         form.gst_number,
        annual_turnover:    form.annual_turnover,
        website:            form.website,
        product_categories: form.product_categories,
        description:        form.description,
      })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await new Promise(r => setTimeout(r, 1200))
    await logout()
  }

  const initials = exhibitor.exhibitor_name
    ?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'E'

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes pulse     { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        input, textarea { font-family: 'DM Sans', sans-serif !important; }
        input:focus, textarea:focus { outline: none; }
      `}</style>

      {/* ── LOGOUT OVERLAY ── */}
      {loggingOut && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(8,8,8,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ position: 'relative', width: 52, height: 52, marginBottom: 20 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #F59E0B15' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#F59E0B', animation: 'spin 0.75s linear infinite' }} />
          </div>
          <p style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '1.1rem', color: '#F5F5F5' }}>Logging out…</p>
          <p style={{ fontSize: '0.75rem', color: '#374151', marginTop: 6 }}>See you soon!</p>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <button onClick={() => navigate('/')} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'none', border: 'none', cursor: 'pointer',
        }}>
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
          <span style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '1rem', color: '#F5F5F5', letterSpacing: '-0.03em' }}>
            ExpoMgmt
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/')} style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid #1F1F1F', background: 'transparent',
            color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer',
            fontFamily: 'DM Sans', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2F2F2F'; e.currentTarget.style.color = '#9CA3AF' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F1F'; e.currentTarget.style.color = '#6B7280' }}
          >
            ← Events
          </button>
          <button onClick={handleLogout} style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1px solid #F8717120', background: '#F8717108',
            color: '#F87171', fontSize: '0.8rem', cursor: 'pointer',
            fontFamily: 'DM Sans', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F8717115' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F8717108' }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '88px 2rem 6rem', animation: 'fadeIn 0.5s ease both' }}>

        {/* ── PROFILE HEADER ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 24,
          padding: '28px', borderRadius: 20,
          background: '#0F0F0F', border: '1px solid #1A1A1A',
          marginBottom: 20, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, #F59E0B08 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Avatar + upload */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18,
              background: exhibitor.logo ? 'transparent' : '#F59E0B15',
              border: '1.5px solid #F59E0B40',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {exhibitor.logo ? (
                <img src={exhibitor.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 6 }} />
              ) : (
                <span style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '1.6rem', color: '#F59E0B' }}>
                  {initials}
                </span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              title="Upload logo"
              style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 22, height: 22, borderRadius: '50%',
                background: '#F59E0B', border: '2px solid #080808',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: '1.4rem', color: '#F5F5F5', letterSpacing: '-0.03em' }}>
                {exhibitor.exhibitor_name}
              </h1>
              <span style={{
                padding: '2px 10px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                background: exhibitor.status === 'Active' ? '#00FF8715' : '#F59E0B15',
                border: `1px solid ${exhibitor.status === 'Active' ? '#00FF8740' : '#F59E0B40'}`,
                color: exhibitor.status === 'Active' ? '#00FF87' : '#F59E0B',
              }}>
                {exhibitor.status?.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9CA3AF', marginBottom: 4, fontFamily: 'DM Sans' }}>
              {exhibitor.company_name}
            </p>
            <p style={{ fontSize: '0.78rem', color: '#4B5563', fontFamily: 'DM Sans' }}>
              {exhibitor.industry} · {exhibitor.mobile || exhibitor.email}
            </p>
          </div>

          <button
            onClick={() => { setEditing(e => !e); setError(null) }}
            style={{
              padding: '8px 18px', borderRadius: 9, flexShrink: 0,
              border: `1px solid ${editing ? '#F59E0B60' : '#1F1F1F'}`,
              background: editing ? '#F59E0B15' : '#141414',
              color: editing ? '#F59E0B' : '#9CA3AF',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans', transition: 'all 0.2s',
            }}
          >
            {editing ? 'Cancel' : '✏ Edit'}
          </button>
        </div>

        {/* ── TOASTS ── */}
        {saved && (
          <div style={{
            padding: '12px 18px', borderRadius: 10, marginBottom: 16,
            background: '#00FF8710', border: '1px solid #00FF8730',
            color: '#00FF87', fontSize: '0.82rem', fontFamily: 'DM Sans', fontWeight: 500,
            animation: 'slideDown 0.2s ease both',
          }}>
            ✓ Profile saved successfully
          </div>
        )}
        {error && (
          <div style={{
            padding: '12px 18px', borderRadius: 10, marginBottom: 16,
            background: '#F8717110', border: '1px solid #F8717130',
            color: '#F87171', fontSize: '0.82rem', fontFamily: 'DM Sans',
          }}>
            ⚠ {error}
          </div>
        )}

        {/* ── BASIC DETAILS ── */}
        <Section title="Basic Details" icon="👤">
          <Grid>
            <Field label="Exhibitor Name"  value={form.exhibitor_name}     editing={editing} onChange={v => set('exhibitor_name', v)} />
            <Field label="Company Name"    value={form.company_name}        editing={editing} onChange={v => set('company_name', v)} />
            <Field label="Industry"        value={form.industry}            editing={editing} onChange={v => set('industry', v)} />
            <Field label="Annual Turnover" value={form.annual_turnover}     editing={editing} onChange={v => set('annual_turnover', v)} />
            <Field label="GST Number"      value={form.gst_number}          editing={editing} onChange={v => set('gst_number', v)} />
            <Field label="Website"         value={form.website}             editing={editing} onChange={v => set('website', v)} />
          </Grid>
        </Section>

        {/* ── CONTACT ── */}
        <Section title="Contact Information" icon="📞">
          <Grid>
            <Field label="Email"  value={form.email}  editing={false} />
            <Field label="Mobile" value={form.mobile} editing={false} />
          </Grid>
          <p style={{ fontSize: '0.72rem', color: '#374151', marginTop: 10, fontFamily: 'DM Sans' }}>
            * Email and mobile cannot be changed
          </p>
        </Section>

        {/* ── COMPANY PROFILE ── */}
        <Section title="Company Profile" icon="🏢">
          <Field label="Product Categories" value={form.product_categories}
            editing={editing} onChange={v => set('product_categories', v)} fullWidth />
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: '0.72rem', color: '#4B5563', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              DESCRIPTION
            </label>
            {editing ? (
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={4}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#141414', border: '1px solid #2F2F2F',
                  borderRadius: 10, color: '#E5E7EB', fontSize: '0.85rem',
                  resize: 'vertical', lineHeight: 1.6, transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#F59E0B50'}
                onBlur={e => e.target.style.borderColor = '#2F2F2F'}
              />
            ) : (
              <p style={{ fontSize: '0.85rem', color: form.description ? '#9CA3AF' : '#374151', lineHeight: 1.7, fontFamily: 'DM Sans' }}>
                {form.description || '—'}
              </p>
            )}
          </div>
        </Section>

        {/* ── SAVE ── */}
        {editing && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 28px', borderRadius: 10,
                background: saving ? '#92400E' : '#F59E0B',
                border: 'none', color: '#000',
                fontSize: '0.88rem', fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => !saving && (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {saving && (
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #00000040', borderTopColor: '#000', animation: 'spin 0.7s linear infinite' }} />
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div style={{
      background: '#0F0F0F', border: '1px solid #1A1A1A',
      borderRadius: 16, padding: '22px 24px',
      marginBottom: 16, animation: 'fadeIn 0.4s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <span style={{ fontSize: '0.9rem' }}>{icon}</span>
        <h2 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: '0.95rem', color: '#E5E7EB', letterSpacing: '-0.01em' }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function Grid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px 20px' }}>
      {children}
    </div>
  )
}

function Field({ label, value, editing, onChange, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <label style={{ fontSize: '0.72rem', color: '#4B5563', fontFamily: 'DM Sans', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        {label.toUpperCase()}
      </label>
      {editing && onChange ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '9px 13px',
            background: '#141414', border: '1px solid #2F2F2F',
            borderRadius: 9, color: '#E5E7EB', fontSize: '0.85rem',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#F59E0B50'}
          onBlur={e => e.target.style.borderColor = '#2F2F2F'}
        />
      ) : (
        <p style={{ fontSize: '0.85rem', color: value ? '#9CA3AF' : '#374151', fontFamily: 'DM Sans', lineHeight: 1.5 }}>
          {value || '—'}
        </p>
      )}
    </div>
  )
}