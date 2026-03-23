import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_BASE = '/api/method/expo_management.expo_management.auth'

// ── API Call helper ───────────────────────────────────────────
async function apiCall(method, body = {}) {
  const res = await fetch(`${API_BASE}.${method}`, {
    method: 'POST',
    headers: {
      'Content-Type':        'application/json',
      'X-Frappe-CSRF-Token': 'fetch',
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

  // ── Session restore on app mount ──────────────────────────
  useEffect(() => {
    fetch('/api/method/expo_management.expo_management.auth.get_current_exhibitor', {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => {
        if (d.message?.logged_in && d.message?.exhibitor) {
          setExhibitor(d.message.exhibitor)
        } else {
          setExhibitor(null)
        }
      })
      .catch(() => setExhibitor(null))
      .finally(() => setLoading(false))
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