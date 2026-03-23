import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_BASE = '/api/method/expo_management.expo_management.auth'

// ── CSRF Token — Frappe 16 correct method ─────────────────────
async function fetchCsrfToken() {
  try {
    // Frappe 16: use frappe.client.get_value or read from cookie
    const res  = await fetch('/api/method/frappe.client.get_value', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'doctype=System Settings&fieldname=language',
      credentials: 'include',
    })
    // After this request, frappe sets csrf_token cookie
    // Read it from cookie
    const cookie = document.cookie
      .split('; ')
      .find(r => r.startsWith('csrf_token='))
    if (cookie) {
      window.csrf_token = decodeURIComponent(cookie.split('=')[1])
    }
  } catch (_) {}
}

// ── Get CSRF from cookie (Frappe sets it automatically) ───────
function getCsrfFromCookie() {
  const cookie = document.cookie
    .split('; ')
    .find(r => r.startsWith('csrf_token='))
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : 'fetch'
}

// ── API Call helper ───────────────────────────────────────────
async function apiCall(method, body = {}) {
  const csrf = getCsrfFromCookie() || window.csrf_token || 'fetch'

  const res = await fetch(`${API_BASE}.${method}`, {
    method: 'POST',
    headers: {
      'Content-Type':        'application/json',
      'X-Frappe-CSRF-Token': csrf,
    },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  const data = await res.json()
  if (data.exc) throw new Error(data.exc)
  return data.message
}

// ── Auth Provider ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [exhibitor, setExhibitor] = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const init = async () => {
      // Warm up session — this sets csrf_token cookie
      await fetchCsrfToken()

      try {
        const res  = await fetch(
          '/api/method/expo_management.expo_management.auth.get_current_exhibitor',
          { credentials: 'include' }
        )
        const data = await res.json()
        if (data.message?.logged_in && data.message?.exhibitor) {
          setExhibitor(data.message.exhibitor)
        } else {
          setExhibitor(null)
        }
      } catch (_) {
        setExhibitor(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // ── Send OTP ───────────────────────────────────────────────
  const sendOtp = (mobile) => apiCall('send_otp', { mobile })

  // ── Verify OTP + login ─────────────────────────────────────
  const verifyOtp = async (mobile, otp) => {
    const res = await apiCall('verify_otp', { mobile, otp })
    if (res?.success && res?.exhibitor) {
      setExhibitor(res.exhibitor)
    }
    return res
  }

  // ── Register ───────────────────────────────────────────────
  const register = (data) => apiCall('register_exhibitor', data)

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    try {
      await apiCall('logout')
    } catch (_) {}
    finally {
      setExhibitor(null)
      window.csrf_token = null
      window.location.href = '/expo'
    }
  }

  return (
    <AuthContext.Provider value={{ exhibitor, loading, sendOtp, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)