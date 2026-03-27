/**
 * StallPickerModal
 * ─────────────────
 * Shows available stall numbers for each selected dimension.
 * User picks one stall per dimension, then clicks "Continue to Booking".
 *
 * Props:
 *   open          — boolean
 *   onClose       — fn()
 *   selectedDims  — [...{ dim, hall }] from EventDetail selected Map
 *   eventCode     — string
 *   accent        — color string
 *   onConfirm     — fn(pickedStalls) where pickedStalls = [{...dim, hall, stall_name, stall_number}]
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

export default function StallPickerModal({ open, onClose, selectedDims, eventCode, accent, onConfirm }) {
  const t = useThemeStyles()

  // stalls[key] = array of available stalls
  const [stalls, setStalls]   = useState({})
  const [loading, setLoading] = useState({})
  const [picked, setPicked]   = useState({})  // key → stall doc

  // Load stalls for each selected dimension
  useEffect(() => {
    if (!open || !selectedDims?.length) return
    console.log('selectedDims:', selectedDims) 
    setPicked({})
    selectedDims.forEach(({ dim, hall }) => {
      const key = `${hall.name}__${dim.dimension_label}`
      setLoading(l => ({ ...l, [key]: true }))
      getAvailableStalls(eventCode, hall.name, dim.dimension_label)
        .then(res => {
          setStalls(s => ({ ...s, [key]: res || [] }))
        })
        .catch(() => setStalls(s => ({ ...s, [key]: [] })))
        .finally(() => setLoading(l => ({ ...l, [key]: false })))
    })
  }, [open, selectedDims, eventCode])

  if (!open) return null

  const allPicked = selectedDims.every(({ dim, hall }) => {
    const key = `${hall.name}__${dim.dimension_label}`
    return !!picked[key]
  })

  const handleConfirm = () => {
    const pickedStalls = selectedDims.map(({ dim, hall }) => {
      const key = `${hall.name}__${dim.dimension_label}`
      const stall = picked[key]
      return {
        ...dim,
        hall,
        stall_name:   stall?.name        || null,
        stall_number: stall?.stall_number || dim.dimension_label + ' m',
        stall_type:   stall?.stall_type   || 'Standard',
        final_price:  stall?.final_price  || ((dim.base_price || 0) * (dim.area || 0)),
      }
    })
    onConfirm(pickedStalls)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease both' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', zIndex: 1001,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: 560,
        maxHeight: '85vh', overflowY: 'auto',
        background: t.bgSurface,
        border: `1px solid ${accent}30`,
        borderRadius: 20,
        boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${accent}10`,
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
            <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.15rem', color: t.textPrimary, letterSpacing: '-0.02em', margin: 0, marginBottom: 3 }}>
              Select Your Stall
            </h2>
            <p style={{ fontSize: '0.78rem', color: t.textFaint, margin: 0 }}>
              Choose a specific stall number for each dimension
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid ' + t.borderDefault, background: t.bgElevated, color: t.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedDims.map(({ dim, hall }) => {
            const key       = `${hall.name}__${dim.dimension_label}`
            const available = stalls[key] || []
            const isLoading = loading[key]
            const stallArea = dim.area || ((dim.width || 0) * (dim.depth || 0))
            const price     = (dim.base_price || 0) * stallArea

            return (
              <div key={key}>
                {/* Dimension header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: t.textPrimary }}>
                      {dim.dimension_label} m
                    </div>
                    <div style={{ fontSize: '0.72rem', color: t.textFaint }}>
                      {hall.hall_name} · ₹{price.toLocaleString()} · {stallArea} sqm
                    </div>
                  </div>
                </div>

                {/* Stall grid */}
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0', color: t.textFaint, fontSize: '0.82rem' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid ' + t.borderHover, borderTopColor: accent, animation: 'spin 0.7s linear infinite' }} />
                    Loading available stalls…
                  </div>
                ) : available.length === 0 ? (
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: t.bgElevated, border: '1px solid ' + t.borderSubtle, color: t.textFaint, fontSize: '0.82rem', textAlign: 'center' }}>
                    No stalls available for this dimension
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                    {available.map(stall => {
                      const isSelected = picked[key]?.name === stall.name
                      const typeColor  = STALL_TYPE_COLOR[stall.stall_type] || '#6B7280'
                      return (
                        <button
                          key={stall.name}
                          onClick={() => setPicked(p => ({ ...p, [key]: isSelected ? null : stall }))}
                          style={{
                            padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                            background: isSelected ? accent + '18' : t.bgElevated,
                            border: `1.5px solid ${isSelected ? accent : t.borderDefault}`,
                            textAlign: 'center', transition: 'all 0.15s',
                            boxShadow: isSelected ? `0 0 0 1px ${accent}40` : 'none',
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = accent + '50' }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = t.borderDefault }}
                        >
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: isSelected ? accent : t.textPrimary, marginBottom: 4 }}>
                            {stall.stall_number}
                          </div>
                          <div style={{ fontSize: '0.62rem', fontWeight: 700, color: typeColor, padding: '2px 6px', borderRadius: 4, background: typeColor + '15', display: 'inline-block' }}>
                            {stall.stall_type?.toUpperCase()}
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
            style={{ flex: 2, padding: '11px', borderRadius: 10, background: allPicked ? `linear-gradient(135deg, ${accent}, ${accent}CC)` : t.bgElevated, border: allPicked ? 'none' : '1px solid ' + t.borderDefault, color: allPicked ? '#000' : t.textFaint, fontSize: '0.9rem', fontWeight: 800, cursor: allPicked ? 'pointer' : 'not-allowed', fontFamily: 'Bricolage Grotesque, sans-serif', transition: 'all 0.2s', boxShadow: allPicked ? `0 6px 20px ${accent}30` : 'none' }}
            onMouseEnter={e => { if (allPicked) e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {allPicked ? 'Continue to Booking →' : `Select ${selectedDims.length} stall${selectedDims.length > 1 ? 's' : ''} to continue`}
          </button>
        </div>
      </div>
    </>
  )
}