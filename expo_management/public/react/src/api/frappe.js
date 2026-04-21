// ─── Frappe API Helper ────────────────────────────────────────
// All backend calls go through here.
// During dev: Vite proxy forwards /api → Frappe (ex.local:8000)
// In production: same origin, no proxy needed.
//akhilesh vadakkekkara

const BASE = '/api/method'

async function frappeCall(method, args = {}) {
  const res = await fetch(`${BASE}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Frappe-CSRF-Token': getCsrf(),
    },
    body: JSON.stringify(args),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.exception || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.message
}

function getCsrf() {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : 'none'
}

// ─── Event APIs ───────────────────────────────────────────────

export async function getPublishedEvents({ status, category, search, limit = 12, offset = 0 } = {}) {
  return frappeCall(
    'expo_management.expo_management.doctype.expo_event.expo_event.get_published_events',
    { status, category, search, limit, offset }
  )
}

export async function getEventDetail(eventCode) {
  return frappeCall(
    'expo_management.expo_management.doctype.expo_event.expo_event.get_event_detail',
    { event_code: eventCode }
  )
}

// ── GET AVAILABLE STALLS ─────────────────────────────────────
export async function getAvailableStalls(expo_event, expo_hall, dimension_label) {
  /**
   * Returns available stalls for a specific hall + dimension.
   * expo_hall = hall.name (Frappe doc name, e.g. "BCON2026-HALL-1")
   * dimension_label = "3×3", "6×6" etc.
   */
  return frappeCall(
    'expo_management.expo_management.doctype.expo_event.expo_event.get_available_stalls',
    { expo_event, expo_hall, dimension_label }
  )
}

// ── CREATE BOOKING ───────────────────────────────────────────
export async function createBooking(payload) {
  /**
   * payload = {
   *   expo_event,
   *   selected_dims:     [...],   // array of { dimension_label, hall, area, base_price, total_price, stall_name, stall_number }
   *   selected_services: [...],   // array of { service, price }
   *   stall_amount,
   *   service_amount,
   *   tax_amount,
   *   total_amount,
   *   deposit_paid,
   *   balance_due,
   * }
   */
  return frappeCall(
    'expo_management.expo_management.doctype.expo_event.expo_event.create_booking',
    {
      expo_event:        payload.expo_event,
      selected_dims:     JSON.stringify(payload.selected_dims),
      selected_services: JSON.stringify(payload.selected_services),
      stall_amount:      payload.stall_amount,
      service_amount:    payload.service_amount,
      tax_amount:        payload.tax_amount,
      total_amount:      payload.total_amount,
      deposit_paid:      payload.deposit_paid,
      balance_due:       payload.balance_due,
    }
  )
}

// ── GET MY BOOKINGS ──────────────────────────────────────────
export async function getMyBookings(expo_event = null) {
  return frappeCall(
    'expo_management.expo_management.doctype.expo_event.expo_event.get_my_bookings',
    expo_event ? { expo_event } : {}
  )
}

// ── Add this function to your existing api/frappe.js file ──

export async function getContactInfo() {
  const res = await frappeGet(
    'expo_management.expo_management.doctype.expo_event.expo_event.get_contact_info'
  )
  return res
}

// ─────────────────────────────────────────────────────────────
// NOTE: frappeGet is whatever your existing fetch wrapper is.
// If you use direct fetch, use this instead:
//
// export async function getContactInfo() {
//   const res = await fetch(
//     `${BASE_URL}/api/method/expo_management.expo_management.doctype.expo_event.expo_event.get_contact_info`,
//     { credentials: 'include' }
//   )
//   const data = await res.json()
//   return data.message
// }