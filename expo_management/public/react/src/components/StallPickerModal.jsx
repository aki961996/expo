/**
 * StallPickerModal — multi-select per dimension
 * User can pick multiple stalls within the same dimension (e.g. 3 × 3×3 stalls)
 */

import { useState, useEffect } from 'react'
import { useThemeStyles } from '../hooks/useThemeStyles'
import { getAvailableStalls } from '../api/frappe'

const STALL_TYPE_COLOR = {
  Corner:   '#F59E0B',
  Island:   '#A78BFA',
  Premium:  '#60A5FA',
  Standard: '#6B7280',
}

function dimKey(hall, dim) {
  return `${hall.name || hall.hall_code}__${dim.dimension_label}`
}

export default function StallPickerModal({ open, onClose, selectedDims, eventCode, accent, onConfirm }) {
  const t = useThemeStyles()

  const [stalls, setStalls]   = useState({})
  const [loading, setLoading] = useState({})
  // picked[key] = Set of stall.name strings
  const [picked, setPicked]   = useState({})

  useEffect(() => {
    if (!open || !selectedDims?.length) return
    setPicked({})
    setStalls({})
    setLoading({})

    selectedDims.forEach(({ dim, hall }) => {
      const key      = dimKey(hall, dim)
      const hallName = hall.name || hall.hall_code
      setLoading(l => ({ ...l, [key]: true }))
      getAvailableStalls(eventCode, hallName, dim.dimension_label)
        .then(res => setStalls(s => ({ ...s, [key]: res || [] })))
        .catch(() => setStalls(s => ({ ...s, [key]: [] })))
        .finally(() => setLoading(l => ({ ...l, [key]: false })))
    })
  }, [open, selectedDims, eventCode])

  if (!open) return null

  // At least one stall picked in any dimension
  const allPicked = selectedDims.some(({ dim, hall }) => {
    const key = dimKey(hall, dim)
    return picked[key]?.size > 0
  })

  const totalPicked = Object.values(picked).reduce((s, set) => s + (set?.size || 0), 0)

  const toggleStall = (key, stall) => {
    setPicked(prev => {
      const next = new Map(Object.entries(prev))
      const existing = new Set(next.get(key) || [])
      if (existing.has(stall.name)) {
        existing.delete(stall.name)
      } else {
        existing.add(stall.name)
      }
      next.set(key, existing)
      return Object.fromEntries(next)
    })
  }

  const handleConfirm = () => {
    // Expand: for each dim, emit one entry per picked stall
    const result = []
    selectedDims.forEach(({ dim, hall }) => {
      const key       = dimKey(hall, dim)
      const pickedSet = picked[key] || new Set()
      const available = stalls[key] || []
      pickedSet.forEach(stallName => {
        const stall = available.find(s => s.name === stallName)
        if (stall) {
          result.push({
            ...dim,
            hall,
            stall_name:      stall.name,
            stall_number:    stall.stall_number,
            stall_type:      stall.stall_type || 'Standard',
            final_price:     stall.final_price || ((dim.base_price || 0) * (dim.area || 0)),
            effective_price: stall.effective_price || stall.final_price || ((dim.base_price || 0) * (dim.area || 0)),
            premium_percent: stall.premium_percent || 0,
          })
        }
      })
    })
    onConfirm(result)
  }

  const btnLabel = allPicked
    ? `Continue to Booking → (${totalPicked} stall${totalPicked > 1 ? 's' : ''})`
    : 'Select at least 1 stall to continue'

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease both',
      }} />

      <div style={{
        position: 'fixed', zIndex: 1001,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 580,
        maxHeight: '88vh', overflowY: 'auto',
        background: t.bgSurface,
        border: '1px solid ' + accent + '30',
        borderRadius: 20,
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.25s ease both',
      }}>
        <style>{`
          @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
          @keyframes slideUp { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }
          @keyframes spin    { to{transform:rotate(360deg)} }
        `}</style>

        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid ' + t.borderSubtle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: t.textPrimary, margin: '0 0 3px' }}>
              Select Your Stalls
            </h2>
            <p style={{ fontSize: '0.78rem', color: t.textFaint, margin: 0 }}>
              Select one or more stalls per dimension
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid ' + t.borderDefault, background: t.bgElevated, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {selectedDims.map(({ dim, hall }) => {
            const key        = dimKey(hall, dim)
            const available  = stalls[key] || []
            const isLoading  = loading[key]
            const pickedSet  = picked[key] || new Set()
            const stallArea  = dim.area || ((dim.width || 0) * (dim.depth || 0))
            const price      = (dim.base_price || 0) * stallArea
            const pickedHere = pickedSet.size

            return (
              <div key={key}>
                {/* Dimension header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: pickedHere > 0 ? accent : t.borderHover, flexShrink: 0, transition: 'background 0.2s' }} />
                    <div>
                      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: t.textPrimary }}>
                        {dim.dimension_label} m
                      </div>
                      <div style={{ fontSize: '0.72rem', color: t.textFaint }}>
                        {hall.hall_name} · ₹{price.toLocaleString()} · {stallArea} sqm
                      </div>
                    </div>
                  </div>
                  {pickedHere > 0 && (
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, background: accent + '15', padding: '3px 10px', borderRadius: 100 }}>
                      ✓ {pickedHere} selected
                    </div>
                  )}
                </div>

                {/* Tip */}
                <div style={{ fontSize: '0.68rem', color: t.textFaint, marginBottom: 8 }}>
                  Tap to select · Tap again to deselect
                </div>

                {/* Stall grid */}
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: t.textFaint, fontSize: '0.82rem' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid ' + t.borderHover, borderTopColor: accent, animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                    Loading available stalls…
                  </div>
                ) : available.length === 0 ? (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: t.bgElevated, border: '1px solid ' + t.borderSubtle, color: t.textFaint, fontSize: '0.82rem', textAlign: 'center' }}>
                    No stalls available for this dimension
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                    {available.map(stall => {
                      const isSelected = pickedSet.has(stall.name)
                      const typeColor  = STALL_TYPE_COLOR[stall.stall_type] || '#6B7280'
                      return (
                        <button
                          key={stall.name}
                          onClick={() => toggleStall(key, stall)}
                          style={{
                            padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                            background: isSelected ? accent + '18' : t.bgElevated,
                            border: '1.5px solid ' + (isSelected ? accent : t.borderDefault),
                            textAlign: 'center', transition: 'all 0.15s',
                            boxShadow: isSelected ? ('0 0 0 1px ' + accent + '40') : 'none',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = accent + '50' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = t.borderDefault }}
                        >
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: isSelected ? accent : t.textPrimary, marginBottom: 4 }}>
                            {stall.stall_number}
                          </div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: typeColor, padding: '2px 6px', borderRadius: 4, background: typeColor + '15', display: 'inline-block' }}>
                            {stall.stall_type ? stall.stall_type.toUpperCase() : 'STANDARD'}
                          </div>
                          {isSelected && (
                            <div style={{ fontSize: '0.6rem', color: accent, marginTop: 4, fontWeight: 700 }}>✓ SELECTED</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid ' + t.borderSubtle, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, background: 'transparent', border: '1px solid ' + t.borderDefault, color: t.textMuted, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.borderHover}
            onMouseLeave={e => e.currentTarget.style.borderColor = t.borderDefault}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allPicked}
            style={{ flex: 2, padding: '11px', borderRadius: 10, background: allPicked ? ('linear-gradient(135deg, ' + accent + ', ' + accent + 'CC)') : t.bgElevated, border: allPicked ? 'none' : ('1px solid ' + t.borderDefault), color: allPicked ? '#000' : t.textFaint, fontSize: '0.88rem', fontWeight: 800, cursor: allPicked ? 'pointer' : 'not-allowed', fontFamily: 'Bricolage Grotesque, sans-serif', transition: 'all 0.2s', boxShadow: allPicked ? ('0 6px 20px ' + accent + '30') : 'none' }}
            onMouseEnter={e => { if (allPicked) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {btnLabel}
          </button>
        </div>
      </div>
    </>
  )
}