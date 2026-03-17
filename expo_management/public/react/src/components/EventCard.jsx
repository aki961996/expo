import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Status config ─────────────────────────────────────────────
const STATUS = {
  Ongoing:   { label: 'LIVE NOW', color: '#00FF87', pulse: true },
  Upcoming:  { label: 'UPCOMING', color: '#60A5FA', pulse: false },
  Completed: { label: 'ENDED',    color: '#6B7280', pulse: false },
  Cancelled: { label: 'CANCELLED',color: '#F87171', pulse: false },
}

// ── Category accent colors ────────────────────────────────────
const CAT_ACCENT = {
  'Trade Fair':     '#F59E0B',
  'Conference':     '#60A5FA',
  'Expo':           '#00FF87',
  'Seminar':        '#A78BFA',
  'Product Launch': '#FB923C',
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function getFrappeImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/private/')) return null
  return path
}

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function EventCard({ event, index }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const st     = STATUS[event.status]     || STATUS.Upcoming
  const accent = CAT_ACCENT[event.category] || '#F59E0B'
  const banner = getFrappeImageUrl(event.banner)
  const logo   = getFrappeImageUrl(event.logo)

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .expo-card-${index}:hover .card-shine {
          animation: shimmer 0.6s ease forwards;
        }
      `}</style>

      <article
        className={`expo-card-${index}`}
        onClick={() => navigate(`/event/${event.name}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          background: '#0F0F0F',
          border: `1px solid ${hovered ? accent + '60' : '#1F1F1F'}`,
          borderRadius: 20,
          overflow: 'hidden',
          cursor: 'pointer',
          animation: `fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both`,
          animationDelay: `${index * 0.07}s`,
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.05)`
            : '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, border-color 0.35s ease',
        }}
      >
        {/* ── TOP accent line ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 10,
        }} />

        {/* ── BANNER / VISUAL AREA ── */}
        <div style={{
          height: 200,
          position: 'relative',
          overflow: 'hidden',
          background: '#0A0A0A',
        }}>
          {/* Banner image or generated background */}
          {banner ? (
            <img
              src={banner}
              alt=""
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                opacity: hovered ? 0.7 : 0.5,
                transition: 'opacity 0.4s ease, transform 0.6s ease',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
              }}
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            // Generated visual background
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(ellipse at 20% 50%, ${accent}18 0%, transparent 55%),
                radial-gradient(ellipse at 80% 20%, ${accent}10 0%, transparent 50%),
                radial-gradient(ellipse at 50% 100%, #ffffff08 0%, transparent 60%)
              `,
            }}>
              {/* Grid pattern */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                  linear-gradient(${accent}08 1px, transparent 1px),
                  linear-gradient(90deg, ${accent}08 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }} />
              {/* Big code text */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Bebas Neue", "Bricolage Grotesque", sans-serif',
                fontSize: '7rem', fontWeight: 900,
                color: accent, opacity: 0.04,
                letterSpacing: '-0.04em', userSelect: 'none',
              }}>
                {event.event_short_code}
              </div>
            </div>
          )}

          {/* Gradient overlay — bottom fade to card bg */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(15,15,15,0.2) 0%, rgba(15,15,15,0.0) 40%, rgba(15,15,15,0.95) 100%)',
          }} />

          {/* Shine effect on hover */}
          <div className="card-shine" style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
            transform: 'translateX(-100%)',
          }} />

          {/* ── STATUS badge ── */}
          <div style={{
            position: 'absolute', top: 14, right: 14,
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${st.color}40`,
            borderRadius: 100,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: st.color, flexShrink: 0,
              animation: st.pulse ? 'livePulse 1.5s infinite' : 'none',
              boxShadow: st.pulse ? `0 0 8px ${st.color}` : 'none',
            }} />
            <span style={{
              fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.1em', color: st.color,
            }}>
              {st.label}
            </span>
          </div>

          {/* ── CATEGORY badge ── */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            padding: '4px 10px',
            background: accent + '20',
            border: `1px solid ${accent}50`,
            borderRadius: 6,
            fontSize: '0.65rem', fontWeight: 700,
            letterSpacing: '0.08em',
            color: accent,
            backdropFilter: 'blur(8px)',
          }}>
            {event.category?.toUpperCase()}
          </div>

          {/* ── LOGO ── */}
          <div style={{
            position: 'absolute', bottom: 14, left: 14,
            width: 42, height: 42,
            borderRadius: 10,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {logo ? (
              <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
                onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <span style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '0.9rem', color: accent,
              }}>
                {getInitials(event.event_name)}
              </span>
            )}
          </div>
        </div>

        {/* ── CARD BODY ── */}
        <div style={{ padding: '20px 20px 18px' }}>

          {/* Event name */}
          <h3 style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 800, fontSize: '1.15rem',
            letterSpacing: '-0.03em', lineHeight: 1.2,
            color: '#F5F5F5',
            marginBottom: 4,
            transition: 'color 0.2s',
            ...(hovered ? { color: '#FFFFFF' } : {}),
          }}>
            {event.event_name}
          </h3>

          <p style={{
            fontSize: '0.75rem', color: '#6B7280',
            marginBottom: 16, fontWeight: 500,
          }}>
            {event.organizer_name}
          </p>

          {/* Info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <InfoRow
              icon={<CalIcon color={accent} />}
              text={`${fmtDate(event.start_date)} — ${fmtDate(event.end_date)}`}
            />
            <InfoRow
              icon={<PinIcon color={accent} />}
              text={`${event.venue_name}, ${event.city}`}
            />
            <InfoRow
              icon={<TagIcon color={accent} />}
              text={event.business_type}
            />
          </div>

          {/* Facility pills */}
          {(event.has_wifi || event.has_ac || event.has_food_court || event.has_atm || event.has_first_aid) && (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
    {!!event.has_wifi       && <Pill label="Wi-Fi"   accent={accent} />}
    {!!event.has_ac         && <Pill label="AC"       accent={accent} />}
    {!!event.has_food_court && <Pill label="Food"     accent={accent} />}
    {!!event.has_atm        && <Pill label="ATM"      accent={accent} />}
    {!!event.has_first_aid  && <Pill label="Medical"  accent={accent} />}
    {!!event.has_security   && <Pill label="Security" accent={accent} />}
    {!!event.has_drinking_water && <Pill label="Water" accent={accent} />}
    {!!event.has_prayer_room && <Pill label="Prayer"  accent={accent} />}
  </div>
)}

          {/* Footer — stats + CTA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 14,
            borderTop: '1px solid #1F1F1F',
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              <StatBox
                value={event.visitor_capacity?.toLocaleString() || '—'}
                label="Visitors"
                accent={accent}
              />
              <StatBox
                value={event.exhibitor_capacity || '—'}
                label="Exhibitors"
                accent={accent}
              />
            </div>

            {/* CTA arrow */}
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: hovered ? accent : 'transparent',
              border: `1.5px solid ${hovered ? accent : '#2F2F2F'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.25s ease',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={hovered ? '#000' : '#555'} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transition: 'stroke 0.25s ease' }}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ flexShrink: 0, opacity: 0.7 }}>{icon}</span>
      <span style={{
        fontSize: '0.8rem', color: '#9CA3AF',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {text}
      </span>
    </div>
  )
}

function Pill({ label, accent }) {
  return (
    <span style={{
      padding: '3px 9px',
      borderRadius: 100,
      background: accent + '12',
      border: `1px solid ${accent}25`,
      fontSize: '0.67rem', fontWeight: 600,
      color: accent + 'CC',
      letterSpacing: '0.04em',
    }}>
      {label}
    </span>
  )
}

function StatBox({ value, label, accent }) {
  return (
    <div>
      <div style={{
        fontFamily: '"Bricolage Grotesque", sans-serif',
        fontWeight: 800, fontSize: '1.05rem',
        color: '#E5E7EB', letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.65rem', color: '#4B5563', marginTop: 1, letterSpacing: '0.06em' }}>
        {label.toUpperCase()}
      </div>
    </div>
  )
}

// ── Minimal SVG icons ─────────────────────────────────────────
function CalIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function PinIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function TagIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}