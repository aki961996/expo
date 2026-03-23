import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_BASE = '/api/method/expo_management.expo_management.auth'

// ── CSRF Token fetch ──────────────────────────────────────────
async function fetchCsrfToken() {
  try {
    const res  = await fetch('/api/method/frappe.auth.get_csrf_token', {
      credentials: 'include',
    })
    const data = await res.json()
    if (data.message) {
      window.csrf_token = data.message
    }
  } catch (_) {
    window.csrf_token = 'fetch'
  }
}

// ── API Call helper ───────────────────────────────────────────
async function apiCall(method, body = {}) {
  // Refresh CSRF token before every POST
  await fetchCsrfToken()

  const res = await fetch(`${API_BASE}.${method}`, {
    method: 'POST',
    headers: {
      'Content-Type':        'application/json',
      'X-Frappe-CSRF-Token': window.csrf_token || 'fetch',
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

  // ── On mount: fetch CSRF + restore session ─────────────────
  useEffect(() => {
    const init = async () => {
      // 1. Get CSRF token first
      await fetchCsrfToken()

      // 2. Check existing session
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
      // Refresh CSRF after login (session changes)
      await fetchCsrfToken()
    }
    return res
  }

  // ── Register ───────────────────────────────────────────────
  const register = (data) => apiCall('register_exhibitor', data)

  // ── Logout ─────────────────────────────────────────────────
  const logout = async () => {
    try {
      await apiCall('logout')
    } catch (_) {
      // ignore
    } finally {
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