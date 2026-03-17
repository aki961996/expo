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
  // Frappe injects csrf_token as a cookie
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
