import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const INDUSTRIES = [
  'Information Technology', 'Food & Beverage', 'Manufacturing',
  'Construction & Real Estate', 'Automotive', 'Textile & Apparel',
  'Healthcare & Pharma', 'Electronics & Hardware', 'Retail & FMCG',
  'Education', 'Agriculture', 'Chemical & Petrochemical',
  'Logistics & Supply Chain', 'Financial Services', 'Other',
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    exhibitor_name: '',
    company_name: '',
    mobile: '',
    email: '',
    industry: '',
    gst_number: '',
    annual_turnover: '',
    website: '',
    address: '',
    product_categories: '',
    description: '',
  })

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setFieldErrors(e => ({ ...e, [key]: '' }))
    setError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.exhibitor_name.trim()) errs.exhibitor_name = 'Required'
    if (!form.company_name.trim())   errs.company_name   = 'Required'
    if (!form.mobile || form.mobile.replace(/\D/g,'').length < 10) errs.mobile = 'Enter valid mobile'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter valid email'
    if (!form.industry) errs.industry = 'Select industry'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      const res = await register({
        ...form,
        mobile: form.mobile.replace(/\D/g, ''),
      })
      if (res.success) {
        setSuccess(true)
      } else {
        if (res.error === 'mobile_exists') setFieldErrors(f => ({ ...f, mobile: 'Already registered' }))
        else if (res.error === 'email_exists') setFieldErrors(f => ({ ...f, email: 'Already registered' }))
        else setError(res.message || 'Registration failed')
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ────────────────────────────────────────
  if (success) return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'DM Sans, sans-serif',
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
      <div style={{
        textAlign: 'center', maxWidth: 400,
        animation: 'fadeUp 0.4s ease both',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#00FF8715', border: '2px solid #00FF8740',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '2rem',
        }}>✅</div>
        <h2 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '1.8rem',
          color: '#F5F5F5', letterSpacing: '-0.03em', marginBottom: 10,
        }}>Registration Submitted!</h2>
        <p style={{ color: '#6B7280', lineHeight: 1.7, marginBottom: 28, fontSize: '0.9rem' }}>
          Your registration is <span style={{ color: '#F59E0B', fontWeight: 600 }}>pending admin approval</span>.
          You'll be notified on your mobile once approved.
        </p>
        <button onClick={() => navigate('/login')} style={{
          padding: '12px 28px', borderRadius: 10,
          background: '#F59E0B', border: 'none',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '0.95rem',
          color: '#000', cursor: 'pointer',
        }}>
          Back to Login
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: 'DM Sans, sans-serif',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        input::placeholder,textarea::placeholder,select::placeholder{color:#374151}
        input:focus,textarea:focus,select:focus{outline:none}
        select option{background:#1A1A1A;color:#F5F5F5}
      `}</style>

      <div style={{
        width: '100%', maxWidth: 520,
        background: '#0F0F0F',
        border: '1px solid #1A1A1A',
        borderRadius: 20, overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        marginTop: 20,
      }}>
        {/* Top accent */}
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'none', border: 'none',
              color: '#4B5563', fontSize: '0.8rem',
              cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: 5,
              marginBottom: 16,
            }}>
              ← Back to Login
            </button>
            <h1 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: '1.6rem',
              letterSpacing: '-0.03em', color: '#F5F5F5', marginBottom: 6,
            }}>Exhibitor Registration</h1>
            <p style={{ fontSize: '0.83rem', color: '#4B5563', lineHeight: 1.6 }}>
              Fill in your details. Admin approval required before login.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Section: Basic Info */}
            <SectionLabel label="Basic Information" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Your Name *" error={fieldErrors.exhibitor_name}>
                <Input
                  placeholder="Full name"
                  value={form.exhibitor_name}
                  onChange={v => set('exhibitor_name', v)}
                  error={fieldErrors.exhibitor_name}
                />
              </Field>
              <Field label="Company Name *" error={fieldErrors.company_name}>
                <Input
                  placeholder="Company Ltd."
                  value={form.company_name}
                  onChange={v => set('company_name', v)}
                  error={fieldErrors.company_name}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Mobile Number *" error={fieldErrors.mobile}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div style={{
                    padding: '10px 10px', background: '#141414',
                    border: '1px solid #1F1F1F', borderRadius: 8,
                    fontSize: '0.82rem', color: '#9CA3AF', flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                  }}>🇮🇳 +91</div>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={form.mobile}
                    onChange={v => set('mobile', v.replace(/\D/g, '').slice(0, 10))}
                    error={fieldErrors.mobile}
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
              </Field>
              <Field label="Email Address *" error={fieldErrors.email}>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={v => set('email', v)}
                  error={fieldErrors.email}
                />
              </Field>
            </div>

            <Field label="Industry / Business Type *" error={fieldErrors.industry} style={{ marginBottom: 12 }}>
              <select
                value={form.industry}
                onChange={e => set('industry', e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#141414',
                  border: `1px solid ${fieldErrors.industry ? '#F87171' : '#1F1F1F'}`,
                  borderRadius: 8, fontSize: '0.88rem',
                  color: form.industry ? '#F5F5F5' : '#374151',
                  appearance: 'none',
                }}
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>

            {/* Section: Business Details */}
            <SectionLabel label="Business Details" style={{ marginTop: 20 }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="GST Number">
                <Input
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst_number}
                  onChange={v => set('gst_number', v.toUpperCase())}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </Field>
           
<Field label="Annual Turnover">
  <select
    value={form.annual_turnover}
    onChange={e => set('annual_turnover', e.target.value)}
    style={{
      width: '100%', padding: '10px 14px',
      background: '#141414', border: '1px solid #1F1F1F',
      borderRadius: 8, fontSize: '0.88rem',
      color: form.annual_turnover ? '#F5F5F5' : '#374151',
      appearance: 'none',
    }}
  >
    <option value="">Select turnover range</option>
    <option value="Below 1 Cr">Below 1 Cr</option>
    <option value="1-5 Cr">1-5 Cr</option>
    <option value="5-25 Cr">5-25 Cr</option>
    <option value="25-100 Cr">25-100 Cr</option>
    <option value="Above 100 Cr">Above 100 Cr</option>
  </select>
</Field>
            </div>

            <Field label="Website" style={{ marginBottom: 12 }}>
              <Input
                placeholder="https://yourcompany.com"
                value={form.website}
                onChange={v => set('website', v)}
              />
            </Field>

            <Field label="Communication Address" style={{ marginBottom: 12 }}>
              <textarea
                placeholder="Full address..."
                value={form.address}
                onChange={e => set('address', e.target.value)}
                rows={2}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#141414', border: '1px solid #1F1F1F',
                  borderRadius: 8, fontSize: '0.88rem',
                  color: '#F5F5F5', resize: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = '#F59E0B50'}
                onBlur={e => e.target.style.borderColor = '#1F1F1F'}
              />
            </Field>

            <Field label="Product Categories" style={{ marginBottom: 12 }}>
              <Input
                placeholder="e.g. Electronics, Solar Panels, EV Chargers"
                value={form.product_categories}
                onChange={v => set('product_categories', v)}
              />
            </Field>

            <Field label="Company Description" style={{ marginBottom: 20 }}>
              <textarea
                placeholder="Brief about your company and products..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: '#141414', border: '1px solid #1F1F1F',
                  borderRadius: 8, fontSize: '0.88rem',
                  color: '#F5F5F5', resize: 'none',
                  fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = '#F59E0B50'}
                onBlur={e => e.target.style.borderColor = '#1F1F1F'}
              />
            </Field>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#F871711A', border: '1px solid #F8717130',
                fontSize: '0.8rem', color: '#F87171', marginBottom: 16,
              }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 10, border: 'none',
                background: '#F59E0B',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '0.95rem',
                color: '#000', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? (
                <div style={{ width: 18, height: 18, border: '2px solid #00000040', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              ) : 'Submit Registration →'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#374151', marginTop: 12 }}>
              By registering you agree to our Terms & Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────

function SectionLabel({ label, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      marginBottom: 12, ...style,
    }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: '#F59E0B', flexShrink: 0 }} />
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.1em' }}>
        {label.toUpperCase()}
      </span>
      <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
    </div>
  )
}

function Field({ label, error, children, style }) {
  return (
    <div style={style}>
      {label && (
        <label style={{
          display: 'block', fontSize: '0.7rem', fontWeight: 700,
          color: error ? '#F87171' : '#6B7280',
          letterSpacing: '0.06em', marginBottom: 6,
        }}>
          {label.toUpperCase()}
        </label>
      )}
      {children}
      {error && <div style={{ fontSize: '0.72rem', color: '#F87171', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function Input({ value, onChange, error, style, ...props }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '10px 14px',
        background: '#141414',
        border: `1px solid ${error ? '#F87171' : '#1F1F1F'}`,
        borderRadius: 8, fontSize: '0.88rem',
        color: '#F5F5F5', fontFamily: 'DM Sans, sans-serif',
        transition: 'border-color 0.2s',
        ...style,
      }}
      onFocus={e => e.target.style.borderColor = error ? '#F87171' : '#F59E0B50'}
      onBlur={e => e.target.style.borderColor = error ? '#F87171' : '#1F1F1F'}
      {...props}
    />
  )
}
