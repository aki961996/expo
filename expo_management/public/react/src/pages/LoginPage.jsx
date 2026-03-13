import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STEPS = { MOBILE: 'mobile', OTP: 'otp' }

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sendOtp, verifyOtp } = useAuth()

  // ✅ Login കഴിഞ്ഞ് redirect ചെയ്യേണ്ട path
  const redirectTo = location.state?.redirect || '/dashboard'

  const [step, setStep]       = useState(STEPS.MOBILE)
  const [mobile, setMobile]   = useState('')
  const [otp, setOtp]         = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [timer, setTimer]     = useState(0)
  const [devOtp, setDevOtp]   = useState('')

  const otpRefs   = useRef([])
  const mobileRef = useRef()

  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError('')
    const clean = mobile.replace(/\s/g, '')
    if (clean.length < 10) { setError('Enter a valid 10-digit mobile number'); return }

    setLoading(true)
    try {
      const res = await sendOtp(clean)
      if (!res.success) {
        if (res.error === 'pending_approval') {
          setError('⏳ Your registration is pending admin approval.')
        } else if (res.error === 'blacklisted') {
          setError('🚫 Account suspended. Contact support.')
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
      const res = await verifyOtp(mobile.replace(/\s/g, ''), otpValue)
      if (res.success) {
        // ✅ Event page-ൽ നിന്ന് വന്നാൽ തിരിച്ചു പോകും, അല്ലെങ്കിൽ dashboard
        navigate(redirectTo, { replace: true })
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

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: 'DM Sans, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        input::placeholder { color: #374151; }
        input:focus { outline: none; }
      `}</style>

      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        width: 500, height: 300,
        background: 'radial-gradient(ellipse, #F59E0B0A 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 400,
        background: '#0F0F0F', border: '1px solid #1A1A1A',
        borderRadius: 20, overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

        <div style={{ padding: '2rem 2rem 2.5rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" fill="white" />
                <rect x="14" y="3" width="7" height="7" rx="1" fill="white" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="1" fill="white" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="1" fill="white" opacity="0.3" />
              </svg>
            </div>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#F5F5F5' }}>ExpoMgmt</span>
          </div>

          {/* ✅ Redirect hint — event page-ൽ നിന്ന് വന്നാൽ */}
          {location.state?.redirect && (
            <div style={{
              padding: '8px 12px', borderRadius: 8, marginBottom: 16,
              background: '#F59E0B10', border: '1px solid #F59E0B25',
              fontSize: '0.75rem', color: '#F59E0B',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              🔒 Login to continue booking
            </div>
          )}

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
            {[STEPS.MOBILE, STEPS.OTP].map((s, i) => (
              <div key={s} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: step === s || (i === 0 && step === STEPS.OTP) ? '#F59E0B' : '#1F1F1F',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {/* STEP 1: Mobile */}
          {step === STEPS.MOBILE && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: '#F5F5F5', marginBottom: 6 }}>
                Exhibitor Login
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Enter your registered mobile number to receive an OTP
              </p>

              <form onSubmit={handleSendOtp}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                  MOBILE NUMBER
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div style={{ padding: '12px 14px', background: '#141414', border: '1px solid #1F1F1F', borderRadius: 10, fontSize: '0.88rem', color: '#9CA3AF', fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🇮🇳 +91
                  </div>
                  <input
                    ref={mobileRef}
                    type="tel" inputMode="numeric" maxLength={10}
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setError('') }}
                    autoFocus
                    style={{
                      flex: 1, padding: '12px 16px', background: '#141414',
                      border: `1px solid ${error ? '#F87171' : '#1F1F1F'}`,
                      borderRadius: 10, fontSize: '1.1rem', color: '#F5F5F5',
                      letterSpacing: '0.08em', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = '#F59E0B50'}
                    onBlur={e => e.target.style.borderColor = error ? '#F87171' : '#1F1F1F'}
                  />
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F871711A', border: '1px solid #F8717130', fontSize: '0.8rem', color: '#F87171', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || mobile.length < 10} style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: mobile.length >= 10 ? '#F59E0B' : '#1A1A1A',
                  color: mobile.length >= 10 ? '#000' : '#374151',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem',
                  cursor: mobile.length >= 10 ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {loading
                    ? <div style={{ width: 18, height: 18, border: '2px solid #00000040', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : 'Send OTP →'}
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: '#4B5563' }}>New exhibitor? </span>
                {/* ✅ Register-ലേക്കും redirect state pass ചെയ്യുക */}
                <button
                  onClick={() => navigate('/register', { state: location.state })}
                  style={{ background: 'none', border: 'none', fontSize: '0.82rem', color: '#F59E0B', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Register here →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === STEPS.OTP && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.03em', color: '#F5F5F5', marginBottom: 6 }}>
                Enter OTP
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                Sent to <span style={{ color: '#9CA3AF', fontWeight: 600 }}>+91 {mobile}</span>
                <button
                  onClick={() => { setStep(STEPS.MOBILE); setOtp(['','','','','','']); setError('') }}
                  style={{ background: 'none', border: 'none', color: '#F59E0B', fontSize: '0.82rem', cursor: 'pointer', marginLeft: 8 }}
                >
                  Change
                </button>
              </p>

              {devOtp && (
                <div style={{ padding: '8px 14px', borderRadius: 8, background: '#00FF8710', border: '1px solid #00FF8730', fontSize: '0.78rem', color: '#00FF87', marginBottom: 16, fontFamily: 'monospace' }}>
                  🧪 Dev OTP: <strong>{devOtp}</strong>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }} onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{
                      flex: 1, height: 54, textAlign: 'center',
                      fontSize: '1.4rem', fontWeight: 700, color: '#F5F5F5',
                      background: digit ? '#F59E0B15' : '#141414',
                      border: `1.5px solid ${digit ? '#F59E0B50' : error ? '#F87171' : '#1F1F1F'}`,
                      borderRadius: 10, transition: 'all 0.15s', caretColor: '#F59E0B',
                    }}
                    onFocus={e => e.target.style.borderColor = '#F59E0B80'}
                    onBlur={e => e.target.style.borderColor = digit ? '#F59E0B50' : '#1F1F1F'}
                  />
                ))}
              </div>

              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F871711A', border: '1px solid #F8717130', fontSize: '0.8rem', color: '#F87171', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button
                onClick={() => handleVerifyOtp(otp.join(''))}
                disabled={loading || otp.some(d => !d)}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: otp.every(d => d) ? '#F59E0B' : '#1A1A1A',
                  color: otp.every(d => d) ? '#000' : '#374151',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem',
                  cursor: otp.every(d => d) ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14,
                }}
              >
                {loading
                  ? <div style={{ width: 18, height: 18, border: '2px solid #00000040', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  : 'Verify & Login →'}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4B5563' }}>
                {timer > 0 ? (
                  <span>Resend OTP in <span style={{ color: '#F59E0B', fontWeight: 600 }}>{timer}s</span></span>
                ) : (
                  <button onClick={handleSendOtp} style={{ background: 'none', border: 'none', color: '#F59E0B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(location.state?.redirect || '/')}
        style={{
          position: 'absolute', top: 24, left: 24,
          background: 'none', border: '1px solid #1F1F1F',
          borderRadius: 8, padding: '7px 14px',
          color: '#4B5563', fontSize: '0.8rem',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#9CA3AF'}
        onMouseLeave={e => e.currentTarget.style.color = '#4B5563'}
      >
        {/* ✅ Event page-ൽ നിന്ന് വന്നാൽ "Back to Event" കാണിക്കുക */}
        ← {location.state?.redirect ? 'Back to Event' : 'Back to Events'}
      </button>
    </div>
  )
}
