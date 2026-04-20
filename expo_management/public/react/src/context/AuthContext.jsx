import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API_BASE = '/api/method/expo_management.expo_management.auth'

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

export function AuthProvider({ children }) {
  const [exhibitor, setExhibitor] = useState(null)
  const [loading, setLoading]     = useState(true)  // stays true until session check done

  useEffect(() => {
    // Check session on mount — loading stays true until this resolves
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
      .finally(() => setLoading(false))  // only NOW is loading false
  }, [])

  const sendOtp  = (mobile)       => apiCall('send_otp',           { mobile })
  const verifyOtp = async (mobile, otp) => {
    const res = await apiCall('verify_otp', { mobile, otp })
    if (res?.success && res?.exhibitor) setExhibitor(res.exhibitor)
    return res
  }
  const register = (data) => apiCall('register_exhibitor', data)
  const logout = async () => {
    try { await apiCall('logout') } catch (_) {}
    finally { setExhibitor(null); window.location.href = '/expo' }
  }

  // ── Block render until auth is resolved ──────────────────
  // This prevents ANY component from rendering with wrong auth state.
  // EventDetail, BookingPage etc will never see exhibitor=null wrongly.
  if (loading) return null

  return (
    <AuthContext.Provider value={{ exhibitor, loading, sendOtp, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)