import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const isDetail = location.pathname !== '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(245,240,232,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 2rem',
      height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1" fill="var(--orange)" />
            <rect x="13" y="3" width="8" height="8" rx="1" fill="white" opacity="0.6" />
            <rect x="3" y="13" width="8" height="8" rx="1" fill="white" opacity="0.6" />
            <rect x="13" y="13" width="8" height="8" rx="1" fill="white" opacity="0.3" />
          </svg>
        </div>
        <span style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em',
          color: 'var(--ink)',
        }}>
          ExpoMgmt
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isDetail && (
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: 8,
              border: '1px solid var(--border)', background: 'white',
              fontSize: '0.85rem', fontWeight: 500, color: 'var(--ink2)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            ← All Events
          </button>
        )}
        <button style={{
          padding: '0.5rem 1.25rem', borderRadius: 8,
          border: 'none', background: 'var(--ink)', color: 'white',
          fontSize: '0.85rem', fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Exhibitor Login
        </button>
      </div>
    </nav>
  )
}
