import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useThemeStyles } from '../hooks/useThemeStyles'

const STEPS = { SELECT: 'select', MOBILE: 'mobile', OTP: 'otp' }

export default function LoginPage() {
  const t = useThemeStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const { sendOtp, verifyOtp } = useAuth()

  const redirectTo = location.state?.redirect || '/'

  const [step, setStep]               = useState(STEPS.SELECT)
  const [userType, setUserType]       = useState(null)   // 'exhibitor' | 'visitor'
  const [mobile, setMobile]           = useState('')
  const [otp, setOtp]                 = useState(['', '', '', '', '', ''])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [timer, setTimer]             = useState(0)
  const [devOtp, setDevOtp]           = useState('')
  const [redirecting, setRedirecting] = useState(false)

  const otpRefs   = useRef([])
  const mobileRef = useRef()

  useEffect(() => {
    if (timer <= 0) return
    const id = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer])

  const selectType = (type) => {
    setUserType(type)
    setStep(STEPS.MOBILE)
    setTimeout(() => mobileRef.current?.focus(), 100)
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    const clean = mobile.replace(/\s/g, '')
    if (clean.length < 10) { setError('Enter a valid 10-digit mobile number'); return }

    setLoading(true)
    try {
      const res = await sendOtp(clean, userType)
      if (!res.success) {
        if (res.error === 'pending_approval') {
          setError('⏳ Your registration is pending admin approval.')
        } else if (res.error === 'blacklisted') {
          setError('🚫 Account suspended. Contact support.')
        } else if (res.error === 'not_found') {
          setError(userType === 'visitor'
            ? '📋 No visitor account found. Please register first.'
            : '📋 No exhibitor account found. Please register first.')
        } else {
          setError(res.message || 'Failed to send OTP')
        }
        return
      }
      setDevOtp(res.dev_otp || '')
      setStep(STEPS.OTP)
      setTimer(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (newOtp.every(d => d) && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) {
      const newOtp = paste.split('')
      setOtp(newOtp)
      otpRefs.current[5]?.focus()
      handleVerifyOtp(paste)
    }
  }

  const handleVerifyOtp = async (otpValue) => {
    setError('')
    setLoading(true)
    try {
      const res = await verifyOtp(mobile.replace(/\s/g, ''), otpValue, userType)
      if (res.success) {
        setRedirecting(true)
        setTimeout(() => navigate(redirectTo, { replace: true }), 1200)
      } else {
        setError(res.message || 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
    } catch (e) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isExhibitor = userType === 'exhibitor'
  const accent = isExhibitor ? '#F59E0B' : '#60A5FA'

  return (
    <div style={{
      minHeight: '100vh', background: t.bgBase,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: 'DM Sans, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
        input::placeholder { color: ${t.textFaint}; }
        input:focus { outline: none; }
      `}</style>

      {/* Redirect loader */}
      {redirecting && (
        <div style={{ position: 'fixed', inset: 0, background: t.bgBase, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease both' }}>
          <div style={{ position: 'relative', width: 56, height: 56, marginBottom: 24 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${accent}15` }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: accent, animation: 'spin 0.75s linear infinite' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: accent, animation: 'pulse 1.2s ease-in-out infinite' }} />
          </div>
          <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: t.textPrimary, letterSpacing: '-0.03em', margin: 0 }}>
            {isExhibitor ? 'Taking you to your dashboard…' : 'Welcome, Visitor!'}
          </p>
          <p style={{ fontSize: '0.78rem', color: t.textFaint, marginTop: 8 }}>
            {isExhibitor ? 'Exhibitor portal' : 'Explore the expo'}
          </p>
        </div>
      )}

      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: `radial-gradient(ellipse, ${accent}08 0%, transparent 70%)`, pointerEvents: 'none', transition: 'background 0.4s' }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: t.bgSurface, border: `1px solid ${t.borderSubtle}`,
        borderRadius: 20, overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, transition: 'background 0.4s' }} />

        <div style={{ padding: '2rem' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3"  y="3"  width="7" height="7" rx="1" fill="white"/>
                <rect x="14" y="3"  width="7" height="7" rx="1" fill="white" opacity="0.6"/>
                <rect x="3"  y="14" width="7" height="7" rx="1" fill="white" opacity="0.6"/>
                <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: t.textPrimary }}>
              ExpoMgmt
            </span>
          </div>

          {location.state?.redirect && (
            <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 16, background: `${accent}10`, border: `1px solid ${accent}25`, fontSize: '0.75rem', color: accent }}>
              🔒 Login to continue
            </div>
          )}

          {/* ── STEP: SELECT ── */}
          {step === STEPS.SELECT && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: t.textPrimary, marginBottom: 6 }}>
                Welcome Back
              </h1>
              <p style={{ fontSize: '0.85rem', color: t.textFaint, marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Select how you'd like to sign in
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Exhibitor */}
                <button onClick={() => selectType('exhibitor')}
                  style={{ padding: '16px 20px', borderRadius: 12, border: '1.5px solid #F59E0B30', background: '#F59E0B08', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#F59E0B60'; e.currentTarget.style.background = '#F59E0B12' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F59E0B30'; e.currentTarget.style.background = '#F59E0B08' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: '#F59E0B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🏢</div>
                    <div>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: t.textPrimary, marginBottom: 2 }}>Exhibitor Login</div>
                      <div style={{ fontSize: '0.75rem', color: t.textFaint }}>Book stalls, manage your booth & bookings</div>
                    </div>
                    <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </button>

                {/* Visitor */}
                <button onClick={() => selectType('visitor')}
                  style={{ padding: '16px 20px', borderRadius: 12, border: '1.5px solid #60A5FA30', background: '#60A5FA08', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#60A5FA60'; e.currentTarget.style.background = '#60A5FA12' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#60A5FA30'; e.currentTarget.style.background = '#60A5FA08' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: '#60A5FA20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🎟️</div>
                    <div>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: t.textPrimary, marginBottom: 2 }}>Visitor Login</div>
                      <div style={{ fontSize: '0.75rem', color: t.textFaint }}>Explore events, exhibitors & digital booths</div>
                    </div>
                    <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </button>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: t.textFaint }}>New exhibitor? </span>
                <button onClick={() => navigate('/register', { state: location.state })}
                  style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: '#F59E0B', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Register here →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP: MOBILE ── */}
          {step === STEPS.MOBILE && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              {/* Back to select */}
              <button onClick={() => { setStep(STEPS.SELECT); setError(''); setMobile('') }}
                style={{ background: 'none', border: 'none', color: t.textFaint, fontSize: '0.8rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 16 }}>
                ← Back
              </button>

              {/* Type badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: `${accent}15`, border: `1px solid ${accent}30`, marginBottom: 16 }}>
                <span style={{ fontSize: '0.85rem' }}>{isExhibitor ? '🏢' : '🎟️'}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accent, letterSpacing: '0.06em' }}>
                  {isExhibitor ? 'EXHIBITOR' : 'VISITOR'}
                </span>
              </div>

              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: t.textPrimary, marginBottom: 6 }}>
                {isExhibitor ? 'Exhibitor Login' : 'Visitor Login'}
              </h1>
              <p style={{ fontSize: '0.85rem', color: t.textFaint, marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Enter your registered mobile number to receive an OTP
              </p>

              <form onSubmit={handleSendOtp}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                  MOBILE NUMBER
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div style={{ padding: '13px 14px', background: t.bgElevated, border: `1px solid ${t.borderDefault}`, borderRadius: 10, fontSize: '0.88rem', color: t.textSecondary, fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    🇮🇳 +91
                  </div>
                  <input
                    ref={mobileRef}
                    type="tel" inputMode="numeric" maxLength={10}
                    placeholder="9876543210"
                    value={mobile}
                    onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setError('') }}
                    style={{ flex: '1 1 0', minWidth: 0, padding: '13px 16px', background: t.bgElevated, border: `1px solid ${error ? '#F87171' : t.borderDefault}`, borderRadius: 10, fontSize: '1.1rem', color: t.textPrimary, letterSpacing: '0.06em', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = `${accent}50`}
                    onBlur={e => e.target.style.borderColor = error ? '#F87171' : t.borderDefault}
                  />
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F871711A', border: '1px solid #F8717130', fontSize: '0.8rem', color: '#F87171', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || mobile.length < 10}
                  style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: mobile.length >= 10 ? accent : t.bgElevated, color: mobile.length >= 10 ? (isExhibitor ? '#000' : '#fff') : t.textFaint, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', cursor: mobile.length >= 10 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {loading
                    ? <div style={{ width: 18, height: 18, border: '2px solid #00000040', borderTopColor: isExhibitor ? '#000' : '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : 'Send OTP →'}
                </button>
              </form>

              {!isExhibitor && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: t.textFaint }}>First time? </span>
                  <button onClick={() => navigate('/register-visitor', { state: location.state })}
                    style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: '#60A5FA', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Register as Visitor →
                  </button>
                </div>
              )}
              {isExhibitor && (
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: t.textFaint }}>New exhibitor? </span>
                  <button onClick={() => navigate('/register', { state: location.state })}
                    style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: '#F59E0B', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Register here →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === STEPS.OTP && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              {/* Type badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: `${accent}15`, border: `1px solid ${accent}30`, marginBottom: 16 }}>
                <span style={{ fontSize: '0.85rem' }}>{isExhibitor ? '🏢' : '🎟️'}</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accent, letterSpacing: '0.06em' }}>
                  {isExhibitor ? 'EXHIBITOR' : 'VISITOR'}
                </span>
              </div>

              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: t.textPrimary, marginBottom: 6 }}>
                Enter OTP
              </h1>
              <p style={{ fontSize: '0.85rem', color: t.textFaint, marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Sent to <span style={{ color: t.textSecondary, fontWeight: 600 }}>+91 {mobile}</span>
                <button onClick={() => { setStep(STEPS.MOBILE); setOtp(['','','','','','']); setError('') }}
                  style={{ background: 'none', border: 'none', color: accent, fontSize: '0.82rem', cursor: 'pointer', marginLeft: 8 }}>
                  Change
                </button>
              </p>

              {devOtp && (
                <div style={{ padding: '8px 14px', borderRadius: 8, background: '#00FF8710', border: '1px solid #00FF8730', fontSize: '0.78rem', color: '#00FF87', marginBottom: 16, fontFamily: 'monospace' }}>
                  🧪 Dev OTP: <strong>{devOtp}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 16, width: '100%' }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{ flex: '1 1 0', minWidth: 0, height: 54, textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, color: t.textPrimary, background: digit ? `${accent}15` : t.bgElevated, border: `1.5px solid ${digit ? `${accent}50` : error ? '#F87171' : t.borderDefault}`, borderRadius: 10, transition: 'all 0.15s', caretColor: accent }}
                    onFocus={e => e.target.style.borderColor = `${accent}80`}
                    onBlur={e => e.target.style.borderColor = digit ? `${accent}50` : t.borderDefault}
                  />
                ))}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F871711A', border: '1px solid #F8717130', fontSize: '0.8rem', color: '#F87171', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button onClick={() => handleVerifyOtp(otp.join(''))} disabled={loading || otp.some(d => !d)}
                style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: otp.every(d => d) ? accent : t.bgElevated, color: otp.every(d => d) ? (isExhibitor ? '#000' : '#fff') : t.textFaint, fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', cursor: otp.every(d => d) ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                {loading
                  ? <div style={{ width: 18, height: 18, border: '2px solid #00000040', borderTopColor: isExhibitor ? '#000' : '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : 'Verify & Login →'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: t.textFaint }}>
                {timer > 0
                  ? <span>Resend OTP in <span style={{ color: accent, fontWeight: 600 }}>{timer}s</span></span>
                  : <button onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: accent, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Resend OTP</button>
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back button */}
      <button onClick={() => navigate('/')}
        style={{ position: 'absolute', top: 24, left: 24, background: 'none', border: `1px solid ${t.borderDefault}`, borderRadius: 8, padding: '7px 14px', color: t.textFaint, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to Events
      </button>
    </div>
  )
}