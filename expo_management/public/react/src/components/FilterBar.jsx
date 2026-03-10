const STATUSES   = ['All', 'Upcoming', 'Ongoing', 'Completed']
const CATEGORIES = ['All', 'Trade Fair', 'Expo', 'Conference']

export default function FilterBar({ search, setSearch, status, setStatus, category, setCategory, total }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <svg style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink4)', pointerEvents: 'none' }}
          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search events, cities, organizers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius)', background: 'white',
            fontSize: '0.95rem', color: 'var(--ink)',
            outline: 'none', transition: 'border-color 0.2s',
            fontFamily: 'Instrument Sans, sans-serif',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--ink)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Chips row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {/* Status chips */}
          {STATUSES.map(s => (
            <Chip key={s} label={s} active={status === s} color={statusColor(s)} onClick={() => setStatus(s)} />
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 0.3rem' }} />
          {/* Category chips */}
          {CATEGORIES.map(c => (
            <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
        {total != null && (
          <span style={{ fontSize: '0.82rem', color: 'var(--ink3)', whiteSpace: 'nowrap' }}>
            {total} event{total !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  )
}

function Chip({ label, active, color, onClick }) {
  const activeStyle = color
    ? { background: color.bg, color: color.text, borderColor: color.border }
    : { background: 'var(--ink)', color: 'white', borderColor: 'var(--ink)' }

  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.9rem', borderRadius: 100,
        border: '1.5px solid var(--border)',
        background: active ? activeStyle.background : 'white',
        color: active ? activeStyle.color : 'var(--ink2)',
        borderColor: active ? activeStyle.borderColor : 'var(--border)',
        fontSize: '0.8rem', fontWeight: 600,
        transition: 'all 0.18s', cursor: 'pointer',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--ink3)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {active && color && <span style={{ marginRight: '0.3rem' }}>●</span>}
      {label}
    </button>
  )
}

function statusColor(s) {
  if (s === 'Ongoing')   return { bg: 'var(--green-bg)',  text: 'var(--green)',  border: '#A8D8BF' }
  if (s === 'Upcoming')  return { bg: 'var(--blue-bg)',   text: 'var(--blue)',   border: '#A8C0E0' }
  if (s === 'Completed') return { bg: 'var(--cream2)',    text: 'var(--ink3)',   border: 'var(--border)' }
  return null
}
