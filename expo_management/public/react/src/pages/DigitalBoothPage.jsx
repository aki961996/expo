import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API = '/api/method/expo_management.expo_management.doctype.expo_event.expo_event.get_event_detail'

function getYoutubeEmbed(url) {
  if (!url) return null
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\s]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}
function getFrappeImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/private/')) return null
  return path
}

const CAT_ACCENT = {
  'Trade Fair': '#F59E0B', 'Conference': '#60A5FA',
  'Expo': '#00FF87', 'Seminar': '#A78BFA', 'Product Launch': '#FB923C',
}

export default function DigitalBoothPage() {
  const { eventCode, exhibitorId } = useParams()
  const navigate = useNavigate()

  const [exhibitor, setExhibitor] = useState(null)
  const [event, setEvent]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [notFound, setNotFound]   = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    fetch(`${API}?event_code=${eventCode}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const data = d.message
        if (!data) { setNotFound(true); return }
        setEvent(data.event)
        const ex = (data.exhibitors || []).find(e => e.name === exhibitorId)
        if (!ex || !ex.has_digital_booth) { setNotFound(true); return }
        setExhibitor(ex)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [eventCode, exhibitorId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #1F1F1F', borderTopColor: '#F59E0B', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  if (notFound || !exhibitor) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', padding: '2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: 20, opacity: 0.2 }}>🏪</div>
      <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.8rem', color: '#F5F5F5', marginBottom: 8 }}>Booth not found</h2>
      <p style={{ color: '#4B5563', marginBottom: 28 }}>This digital booth doesn't exist or is not active</p>
      <button onClick={() => navigate(`/event/${eventCode}`)} style={{ padding: '10px 24px', borderRadius: 10, background: '#F59E0B', border: 'none', fontWeight: 700, color: '#000', cursor: 'pointer' }}>
        ← Back to Event
      </button>
    </div>
  )

  const accent   = CAT_ACCENT[event?.category] || '#F59E0B'
  const banner   = getFrappeImageUrl(exhibitor.booth_banner)
  const embedUrl = getYoutubeEmbed(exhibitor.booth_video_url)
  const products = exhibitor.booth_products
    ? exhibitor.booth_products.split(',').map(p => p.trim()).filter(Boolean)
    : []

  return (
    <div style={{ minHeight: '100vh', background: '#080808', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;box-shadow:0 0 0 0 ${accent}60} 50%{opacity:0.8;box-shadow:0 0 0 8px transparent} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0F0F0F; }
        ::-webkit-scrollbar-thumb { background: #2F2F2F; border-radius: 3px; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1A1A1A',
      }}>
        <button onClick={() => navigate(`/event/${eventCode}`)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 8,
          border: '1px solid #1F1F1F', background: 'transparent',
          color: '#9CA3AF', fontSize: '0.82rem', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2F2F2F'; e.currentTarget.style.color = '#F5F5F5' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F1F1F'; e.currentTarget.style.color = '#9CA3AF' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Event
        </button>

        {/* Digital Booth badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 100,
          background: accent + '15', border: `1px solid ${accent}30`,
          fontSize: '0.68rem', fontWeight: 700, color: accent, letterSpacing: '0.08em',
        }}>
          🏪 DIGITAL BOOTH
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div style={{ position: 'relative', height: 320, marginTop: 60, overflow: 'hidden' }}>
        {banner ? (
          <img src={banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }}
            onError={e => e.target.style.display = 'none'} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 20% 50%, ${accent}20 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, ${accent}10 0%, transparent 50%)`,
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
            {/* Big company initial watermark */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16rem', fontWeight: 800, color: accent, opacity: 0.03, userSelect: 'none' }}>
              {exhibitor.company_name?.charAt(0)}
            </div>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,8,8,0.2) 0%, rgba(8,8,8,0.5) 60%, rgba(8,8,8,1) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      </div>

      {/* ── COMPANY HEADER ── */}
      <div style={{ maxWidth: 860, margin: '-80px auto 0', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#0F0F0F', border: `1px solid ${accent}20`,
          borderRadius: 20, padding: '28px',
          display: 'flex', alignItems: 'flex-start', gap: 20,
          flexWrap: 'wrap',
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${accent}10`,
          animation: 'fadeUp 0.5s ease both',
        }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 20, flexShrink: 0,
            background: accent + '15', border: `2px solid ${accent}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
            fontSize: '2rem', color: accent,
          }}>
            {exhibitor.company_name?.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.7rem', color: '#F5F5F5', letterSpacing: '-0.03em', margin: 0 }}>
                {exhibitor.company_name}
              </h1>
              <span style={{ padding: '3px 10px', borderRadius: 100, background: accent + '15', border: `1px solid ${accent}30`, fontSize: '0.65rem', fontWeight: 700, color: accent, letterSpacing: '0.06em' }}>
                VERIFIED
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0 0 8px' }}>{exhibitor.industry}</p>
            {exhibitor.booth_tagline && (
              <p style={{ fontSize: '0.95rem', color: '#9CA3AF', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                "{exhibitor.booth_tagline}"
              </p>
            )}
          </div>

          {/* Contact actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'center' }}>
            {exhibitor.booth_website && (
              <a href={exhibitor.booth_website} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 9,
                background: accent, border: 'none',
                fontSize: '0.8rem', fontWeight: 700, color: '#000',
                textDecoration: 'none', cursor: 'pointer',
              }}>
                🌐 Website
              </a>
            )}
            {exhibitor.booth_contact_email && (
              <a href={`mailto:${exhibitor.booth_contact_email}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 9,
                background: '#141414', border: '1px solid #2A2A2A',
                fontSize: '0.8rem', fontWeight: 500, color: '#9CA3AF',
                textDecoration: 'none',
              }}>
                ✉️ Email
              </a>
            )}
            {exhibitor.booth_contact_phone && (
              <a href={`tel:${exhibitor.booth_contact_phone}`} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 9,
                background: '#141414', border: '1px solid #2A2A2A',
                fontSize: '0.8rem', fontWeight: 500, color: '#9CA3AF',
                textDecoration: 'none',
              }}>
                📞 Call
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 2rem 6rem' }}>

        {/* About */}
        {exhibitor.booth_description && (
          <Section title="About the Company" accent={accent}>
            <div
              style={{ color: '#9CA3AF', lineHeight: 1.9, fontSize: '0.92rem' }}
              dangerouslySetInnerHTML={{ __html: exhibitor.booth_description }}
            />
          </Section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <Section title="Products & Services" accent={accent}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {products.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 18px', borderRadius: 10,
                  background: accent + '10', border: `1px solid ${accent}25`,
                  fontSize: '0.85rem', color: '#E5E7EB', fontWeight: 500,
                  animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                  {p}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Video */}
        {embedUrl && (
          <Section title="Product Demo Video" accent={accent}>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${accent}20`, background: '#000' }}>
              <iframe
                src={embedUrl}
                width="100%"
                height="360"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: 'block' }}
              />
            </div>
          </Section>
        )}

        {/* Contact card */}
        <Section title="Get in Touch" accent={accent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {exhibitor.booth_contact_email && (
              <ContactCard icon="✉️" label="Email" value={exhibitor.booth_contact_email} href={`mailto:${exhibitor.booth_contact_email}`} accent={accent} />
            )}
            {exhibitor.booth_contact_phone && (
              <ContactCard icon="📞" label="Phone" value={exhibitor.booth_contact_phone} href={`tel:${exhibitor.booth_contact_phone}`} accent={accent} />
            )}
            {exhibitor.booth_website && (
              <ContactCard icon="🌐" label="Website" value={exhibitor.booth_website.replace(/^https?:\/\//, '')} href={exhibitor.booth_website} accent={accent} external />
            )}
          </div>
        </Section>

        {/* Back CTA */}
        <div style={{ textAlign: 'center', marginTop: 48, padding: '32px', background: '#0F0F0F', border: '1px solid #1A1A1A', borderRadius: 16 }}>
          <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: 16 }}>
            Interested in meeting {exhibitor.company_name} at the event?
          </p>
          <button
            onClick={() => navigate(`/event/${eventCode}`)}
            style={{
              padding: '12px 28px', borderRadius: 10,
              background: accent, border: 'none',
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
              fontSize: '0.95rem', color: '#000', cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            View Event & Book a Stall →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────
function Section({ title, accent, children }) {
  return (
    <div style={{
      background: '#0F0F0F', border: '1px solid #1A1A1A',
      borderRadius: 16, padding: '22px 24px',
      marginBottom: 16, animation: 'fadeIn 0.4s ease both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
        <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#E5E7EB', letterSpacing: '-0.01em', margin: 0 }}>
          {title}
        </h2>
        <div style={{ flex: 1, height: 1, background: '#1A1A1A' }} />
      </div>
      {children}
    </div>
  )
}

// ── Contact card ──────────────────────────────────────────────
function ContactCard({ icon, label, value, href, accent, external }) {
  const [hov, setHov] = useState(false)
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 12, textDecoration: 'none',
        background: hov ? accent + '10' : '#141414',
        border: `1px solid ${hov ? accent + '30' : '#1F1F1F'}`,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: accent + '15', border: `1px solid ${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.68rem', color: '#374151', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 2 }}>{label.toUpperCase()}</div>
        <div style={{ fontSize: '0.8rem', color: hov ? accent : '#9CA3AF', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>
          {value}
        </div>
      </div>
    </a>
  )
}