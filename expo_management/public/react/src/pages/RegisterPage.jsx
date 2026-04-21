import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useThemeStyles } from '../hooks/useThemeStyles'

const INDUSTRIES = [
  'Information Technology', 'Food & Beverage', 'Manufacturing',
  'Construction & Real Estate', 'Automotive', 'Textile & Apparel',
  'Healthcare & Pharma', 'Electronics & Hardware', 'Retail & FMCG',
  'Education', 'Agriculture', 'Chemical & Petrochemical',
  'Logistics & Supply Chain', 'Financial Services', 'Other',
]

const PURPOSES = [
  'Business Networking', 'Product Sourcing',
  'Investment Opportunity', 'Learning & Knowledge', 'General Interest',
]

export default function RegisterPage() {
  const t        = useThemeStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, registerVisitor } = useAuth()

  // 'select' | 'exhibitor' | 'visitor'
  const [mode, setMode]     = useState('select')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [fieldErrors, setFE]    = useState({})

  // ── Exhibitor form ─────────────────────────────────────────
  const [ex, setEx] = useState({
    exhibitor_name: '', company_name: '', contact_person: '',
    mobile: '', email: '', industry: '',
    gst_number: '', annual_turnover: '',
    website: '', address: '', product_categories: '', description: '',
  })

  // ── Visitor form ───────────────────────────────────────────
  const [vi, setVi] = useState({
    visitor_name: '', mobile: '', email: '',
    company_name: '', industry: '', designation: '',
    city: '', purpose_of_visit: '', interests: '',
  })

  const setExField = (k, v) => { setEx(f => ({ ...f, [k]: v })); setFE(e => ({ ...e, [k]: '' })); setError('') }
  const setViField = (k, v) => { setVi(f => ({ ...f, [k]: v })); setFE(e => ({ ...e, [k]: '' })); setError('') }

  // ── Validation ─────────────────────────────────────────────
  const validateEx = () => {
    const errs = {}
    if (!ex.exhibitor_name.trim()) errs.exhibitor_name = 'Required'
    if (!ex.company_name.trim())   errs.company_name   = 'Required'
    if (!ex.contact_person.trim()) errs.contact_person = 'Required'
    if (!ex.mobile || ex.mobile.replace(/\D/g,'').length < 10) errs.mobile = 'Enter valid 10-digit number'
    if (!ex.email || !/\S+@\S+\.\S+/.test(ex.email)) errs.email = 'Enter valid email'
    if (!ex.industry) errs.industry = 'Select industry'
    setFE(errs)
    return Object.keys(errs).length === 0
  }

  const validateVi = () => {
    const errs = {}
    if (!vi.visitor_name.trim()) errs.visitor_name = 'Required'
    if (!vi.mobile || vi.mobile.replace(/\D/g,'').length < 10) errs.mobile = 'Enter valid 10-digit number'
    setFE(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmitEx = async (e) => {
    e.preventDefault()
    if (!validateEx()) return
    setLoading(true); setError('')
    try {
      const res = await register({ ...ex, mobile: ex.mobile.replace(/\D/g, '') })
      if (res.success) { setSuccess(true) }
      else {
        if (res.error === 'mobile_exists') setFE(f => ({ ...f, mobile: 'Already registered' }))
        else if (res.error === 'email_exists') setFE(f => ({ ...f, email: 'Already registered' }))
        else setError(res.message || 'Registration failed')
      }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleSubmitVi = async (e) => {
    e.preventDefault()
    if (!validateVi()) return
    setLoading(true); setError('')
    try {
      const res = await registerVisitor({ ...vi, mobile: vi.mobile.replace(/\D/g, '') })
      if (res.success) { setSuccess(true) }
      else {
        if (res.error === 'mobile_exists') setFE(f => ({ ...f, mobile: 'Already registered' }))
        else setError(res.message || 'Registration failed')
      }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const isExhibitor = mode === 'exhibitor'
  const accent      = isExhibitor ? '#F59E0B' : '#60A5FA'

  // ── Success screen ─────────────────────────────────────────
  if (success) return (
    <div style={{ minHeight: '100vh', background: t.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
      <div style={{ textAlign: 'center', maxWidth: 380, animation: 'fadeUp 0.4s ease both' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#00FF8715', border: '2px solid #00FF8740', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>✅</div>
        <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: t.textPrimary, letterSpacing: '-0.03em', marginBottom: 10 }}>
          {isExhibitor ? 'Registration Submitted!' : 'Registration Successful!'}
        </h2>
        <p style={{ color: t.textMuted, lineHeight: 1.7, marginBottom: 28, fontSize: '0.9rem' }}>
          {isExhibitor
            ? <>Your registration is <span style={{ color: '#F59E0B', fontWeight: 600 }}>pending admin approval</span>. You'll be notified once approved.</>
            : <>You can now <span style={{ color: '#60A5FA', fontWeight: 600 }}>login as a visitor</span> using your mobile number.</>
          }
        </p>
        <button onClick={() => navigate('/login')}
          style={{ padding: '12px 28px', borderRadius: 10, background: accent, border: 'none', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: isExhibitor ? '#000' : '#fff', cursor: 'pointer' }}>
          Go to Login
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: t.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: ${t.textFaint}; }
        input:focus, textarea:focus, select:focus { outline: none; }
        select option { background: #1A1A1A; color: #F5F5F5; }
        .reg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        @media (max-width: 480px) { .reg-grid-2 { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ width: '100%', maxWidth: mode === 'select' ? 440 : 520, background: t.bgSurface, border: `1px solid ${t.borderSubtle}`, borderRadius: 20, overflow: 'hidden', animation: 'fadeUp 0.4s ease both', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', margin: '20px 0' }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${mode === 'select' ? '#F59E0B' : accent}, transparent)`, transition: 'background 0.4s' }} />

        <div style={{ padding: '1.75rem' }}>

          {/* ── SELECT MODE ── */}
          {mode === 'select' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: t.textFaint, fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 5 }}>
                ← Back to Login
              </button>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: t.textPrimary, marginBottom: 6 }}>
                Create Account
              </h1>
              <p style={{ fontSize: '0.85rem', color: t.textFaint, marginBottom: '1.75rem', lineHeight: 1.6 }}>
                How would you like to register?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button onClick={() => setMode('exhibitor')}
                  style={{ padding: '16px 20px', borderRadius: 12, border: '1.5px solid #F59E0B30', background: '#F59E0B08', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B60'; e.currentTarget.style.background = '#F59E0B12' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F59E0B30'; e.currentTarget.style.background = '#F59E0B08' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: '#F59E0B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🏢</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: t.textPrimary, marginBottom: 2 }}>Register as Exhibitor</div>
                      <div style={{ fontSize: '0.75rem', color: t.textFaint }}>Book stalls & showcase your products · Admin approval required</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </button>

                <button onClick={() => setMode('visitor')}
                  style={{ padding: '16px 20px', borderRadius: 12, border: '1.5px solid #60A5FA30', background: '#60A5FA08', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#60A5FA60'; e.currentTarget.style.background = '#60A5FA12' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#60A5FA30'; e.currentTarget.style.background = '#60A5FA08' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: '#60A5FA20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🎟️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: t.textPrimary, marginBottom: 2 }}>Register as Visitor</div>
                      <div style={{ fontSize: '0.75rem', color: t.textFaint }}>Explore events & exhibitors · Instant access</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.82rem', color: t.textFaint, marginTop: 20 }}>
                Already registered?{' '}
                <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#F59E0B', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}>
                  Login here →
                </button>
              </p>
            </div>
          )}

          {/* ── EXHIBITOR FORM ── */}
          {mode === 'exhibitor' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <button onClick={() => { setMode('select'); setFE({}); setError('') }}
                style={{ background: 'none', border: 'none', color: t.textFaint, fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                ← Back
              </button>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#F59E0B15', border: '1px solid #F59E0B30', marginBottom: 14 }}>
                <span style={{ fontSize: '0.85rem' }}>🏢</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', letterSpacing: '0.06em' }}>EXHIBITOR REGISTRATION</span>
              </div>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em', color: t.textPrimary, marginBottom: 4 }}>
                Exhibitor Details
              </h1>
              <p style={{ fontSize: '0.82rem', color: t.textFaint, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Admin approval required before login.
              </p>

              <form onSubmit={handleSubmitEx}>
                <SectionLabel label="Basic Information" t={t} />
                <div className="reg-grid-2">
                  <Field label="Your Name *" error={fieldErrors.exhibitor_name}>
                    <Input t={t} placeholder="Full name" value={ex.exhibitor_name} onChange={v => setExField('exhibitor_name', v)} error={fieldErrors.exhibitor_name} />
                  </Field>
                  <Field label="Company Name *" error={fieldErrors.company_name}>
                    <Input t={t} placeholder="Company Ltd." value={ex.company_name} onChange={v => setExField('company_name', v)} error={fieldErrors.company_name} />
                  </Field>
                </div>
                <Field label="Contact Person *" error={fieldErrors.contact_person} style={{ marginBottom: 12 }}>
                  <Input t={t} placeholder="Primary contact person" value={ex.contact_person} onChange={v => setExField('contact_person', v)} error={fieldErrors.contact_person} />
                </Field>
                <div className="reg-grid-2">
                  <Field label="Mobile Number *" error={fieldErrors.mobile}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ padding: '10px', background: t.bgElevated, border: `1px solid ${t.borderDefault}`, borderRadius: 8, fontSize: '0.82rem', color: t.textSecondary, flexShrink: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>🇮🇳 +91</div>
                      <Input t={t} type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210" value={ex.mobile} onChange={v => setExField('mobile', v.replace(/\D/g,'').slice(0,10))} error={fieldErrors.mobile} style={{ flex: '1 1 0', minWidth: 0 }} />
                    </div>
                  </Field>
                  <Field label="Email *" error={fieldErrors.email}>
                    <Input t={t} type="email" placeholder="you@company.com" value={ex.email} onChange={v => setExField('email', v)} error={fieldErrors.email} />
                  </Field>
                </div>
                <Field label="Industry *" error={fieldErrors.industry} style={{ marginBottom: 12 }}>
                  <Select t={t} value={ex.industry} onChange={v => setExField('industry', v)} placeholder="Select industry" error={fieldErrors.industry} options={INDUSTRIES} />
                </Field>

                <SectionLabel label="Business Details" t={t} style={{ marginTop: 16 }} />
                <div className="reg-grid-2">
                  <Field label="GST Number">
                    <Input t={t} placeholder="22AAAAA0000A1Z5" value={ex.gst_number} onChange={v => setExField('gst_number', v.toUpperCase())} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                  </Field>
                  <Field label="Annual Turnover">
                    <Select t={t} value={ex.annual_turnover} onChange={v => setExField('annual_turnover', v)} placeholder="Select range" options={['Below 1 Cr','1-5 Cr','5-25 Cr','25-100 Cr','Above 100 Cr']} />
                  </Field>
                </div>
                <Field label="Website" style={{ marginBottom: 12 }}>
                  <Input t={t} placeholder="https://yourcompany.com" value={ex.website} onChange={v => setExField('website', v)} />
                </Field>
                <Field label="Address" style={{ marginBottom: 12 }}>
                  <Textarea t={t} placeholder="Full address..." value={ex.address} onChange={v => setExField('address', v)} rows={2} />
                </Field>
                <Field label="Product Categories" style={{ marginBottom: 12 }}>
                  <Input t={t} placeholder="e.g. Electronics, Solar Panels" value={ex.product_categories} onChange={v => setExField('product_categories', v)} />
                </Field>
                <Field label="Company Description" style={{ marginBottom: 20 }}>
                  <Textarea t={t} placeholder="Brief about your company..." value={ex.description} onChange={v => setExField('description', v)} rows={3} />
                </Field>

                {error && <ErrorBox>{error}</ErrorBox>}
                <SubmitBtn loading={loading} accent="#F59E0B" textColor="#000">Submit Registration →</SubmitBtn>
                <p style={{ textAlign: 'center', fontSize: '0.73rem', color: t.textFaint, marginTop: 12 }}>By registering you agree to our Terms & Privacy Policy</p>
              </form>
            </div>
          )}

          {/* ── VISITOR FORM ── */}
          {mode === 'visitor' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <button onClick={() => { setMode('select'); setFE({}); setError('') }}
                style={{ background: 'none', border: 'none', color: t.textFaint, fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                ← Back
              </button>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: '#60A5FA15', border: '1px solid #60A5FA30', marginBottom: 14 }}>
                <span style={{ fontSize: '0.85rem' }}>🎟️</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#60A5FA', letterSpacing: '0.06em' }}>VISITOR REGISTRATION</span>
              </div>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.03em', color: t.textPrimary, marginBottom: 4 }}>
                Visitor Details
              </h1>
              <p style={{ fontSize: '0.82rem', color: t.textFaint, marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Quick registration — instant access to all events.
              </p>

              <form onSubmit={handleSubmitVi}>
                <SectionLabel label="Basic Info" t={t} accent="#60A5FA" />
                <div className="reg-grid-2">
                  <Field label="Your Name *" error={fieldErrors.visitor_name}>
                    <Input t={t} placeholder="Full name" value={vi.visitor_name} onChange={v => setViField('visitor_name', v)} error={fieldErrors.visitor_name} accent="#60A5FA" />
                  </Field>
                  <Field label="Company / Organisation">
                    <Input t={t} placeholder="Company name (optional)" value={vi.company_name} onChange={v => setViField('company_name', v)} accent="#60A5FA" />
                  </Field>
                </div>
                <div className="reg-grid-2">
                  <Field label="Mobile Number *" error={fieldErrors.mobile}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ padding: '10px', background: t.bgElevated, border: `1px solid ${t.borderDefault}`, borderRadius: 8, fontSize: '0.82rem', color: t.textSecondary, flexShrink: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>🇮🇳 +91</div>
                      <Input t={t} type="tel" inputMode="numeric" maxLength={10} placeholder="9876543210" value={vi.mobile} onChange={v => setViField('mobile', v.replace(/\D/g,'').slice(0,10))} error={fieldErrors.mobile} style={{ flex: '1 1 0', minWidth: 0 }} />
                    </div>
                  </Field>
                  <Field label="Email">
                    <Input t={t} type="email" placeholder="you@email.com (optional)" value={vi.email} onChange={v => setViField('email', v)} />
                  </Field>
                </div>

                <SectionLabel label="Visit Preferences" t={t} accent="#60A5FA" style={{ marginTop: 16 }} />
                <div className="reg-grid-2">
                  <Field label="Industry">
                    <Select t={t} value={vi.industry} onChange={v => setViField('industry', v)} placeholder="Your industry" options={INDUSTRIES} accent="#60A5FA" />
                  </Field>
                  <Field label="Designation">
                    <Input t={t} placeholder="e.g. Manager, Director" value={vi.designation} onChange={v => setViField('designation', v)} />
                  </Field>
                </div>
                <div className="reg-grid-2">
                  <Field label="City">
                    <Input t={t} placeholder="Your city" value={vi.city} onChange={v => setViField('city', v)} />
                  </Field>
                  <Field label="Purpose of Visit">
                    <Select t={t} value={vi.purpose_of_visit} onChange={v => setViField('purpose_of_visit', v)} placeholder="Select purpose" options={PURPOSES} accent="#60A5FA" />
                  </Field>
                </div>
                <Field label="Areas of Interest" style={{ marginBottom: 20 }}>
                  <Input t={t} placeholder="e.g. Electronics, Agriculture, Manufacturing" value={vi.interests} onChange={v => setViField('interests', v)} />
                </Field>

                {error && <ErrorBox>{error}</ErrorBox>}
                <SubmitBtn loading={loading} accent="#60A5FA" textColor="#fff">Register & Login →</SubmitBtn>
                <p style={{ textAlign: 'center', fontSize: '0.73rem', color: t.textFaint, marginTop: 12 }}>By registering you agree to our Terms & Privacy Policy</p>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Shared UI components ──────────────────────────────────────

function SectionLabel({ label, t, accent = '#F59E0B', style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, ...style }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: accent, flexShrink: 0 }} />
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em' }}>{label.toUpperCase()}</span>
      <div style={{ flex: 1, height: 1, background: t.borderSubtle }} />
    </div>
  )
}

function Field({ label, error, children, style }) {
  return (
    <div style={style}>
      {label && <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: error ? '#F87171' : '#6B7280', letterSpacing: '0.06em', marginBottom: 6 }}>{label.toUpperCase()}</label>}
      {children}
      {error && <div style={{ fontSize: '0.72rem', color: '#F87171', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function Input({ t, value, onChange, error, accent = '#F59E0B', style, ...props }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '10px 14px', background: t.bgElevated, border: `1px solid ${error ? '#F87171' : t.borderDefault}`, borderRadius: 8, fontSize: '0.88rem', color: t.textPrimary, fontFamily: 'DM Sans, sans-serif', transition: 'border-color 0.2s', ...style }}
      onFocus={e => e.target.style.borderColor = error ? '#F87171' : `${accent}50`}
      onBlur={e  => e.target.style.borderColor = error ? '#F87171' : t.borderDefault}
      {...props}
    />
  )
}

function Select({ t, value, onChange, placeholder, options, error, accent = '#F59E0B' }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '10px 14px', background: t.bgElevated, border: `1px solid ${error ? '#F87171' : t.borderDefault}`, borderRadius: 8, fontSize: '0.88rem', color: value ? t.textPrimary : t.textFaint, appearance: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
      onFocus={e => e.target.style.borderColor = `${accent}50`}
      onBlur={e  => e.target.style.borderColor = error ? '#F87171' : t.borderDefault}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Textarea({ t, value, onChange, rows = 2, placeholder }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 14px', background: t.bgElevated, border: `1px solid ${t.borderDefault}`, borderRadius: 8, fontSize: '0.88rem', color: t.textPrimary, resize: 'none', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}
      onFocus={e => e.target.style.borderColor = '#F59E0B50'}
      onBlur={e  => e.target.style.borderColor = t.borderDefault}
    />
  )
}

function ErrorBox({ children }) {
  return (
    <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F871711A', border: '1px solid #F8717130', fontSize: '0.8rem', color: '#F87171', marginBottom: 16 }}>
      {children}
    </div>
  )
}

function SubmitBtn({ loading, accent, textColor, children }) {
  return (
    <button type="submit" disabled={loading}
      style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: accent, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: textColor, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s' }}>
      {loading
        ? <div style={{ width: 18, height: 18, border: `2px solid ${textColor}40`, borderTopColor: textColor, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        : children}
    </button>
  )
}