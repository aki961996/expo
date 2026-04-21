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
  const [visitor, setVisitor]     = useState(null)
  const [userType, setUserType]   = useState(null)   // 'exhibitor' | 'visitor' | null
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    // Check session on mount — try get_current_user first, fallback to get_current_exhibitor
    const checkSession = async () => {
      try {
        // First try new unified endpoint
        const r1 = await fetch('/api/method/expo_management.expo_management.auth.get_current_user', {
          credentials: 'include',
        })
        const d1 = await r1.json()
        const msg = d1.message

        if (msg?.logged_in) {
          if (msg.user_type === 'exhibitor' && msg.exhibitor) {
            setExhibitor(msg.exhibitor)
            setUserType('exhibitor')
            return
          } else if (msg.user_type === 'visitor' && msg.visitor) {
            setVisitor(msg.visitor)
            setUserType('visitor')
            return
          }
        }

        // Fallback: try old exhibitor endpoint (backward compat)
        const r2 = await fetch('/api/method/expo_management.expo_management.auth.get_current_exhibitor', {
          credentials: 'include',
        })
        const d2 = await r2.json()
        if (d2.message?.logged_in && d2.message?.exhibitor) {
          setExhibitor(d2.message.exhibitor)
          setUserType('exhibitor')
        }
      } catch (_) {
        // Session check failed — user stays logged out
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  // sendOtp — pass user_type to backend
  const sendOtp = (mobile, type = 'exhibitor') =>
    apiCall('send_otp', { mobile, user_type: type })

  // verifyOtp — backend returns either exhibitor or visitor profile
  const verifyOtp = async (mobile, otp, type = 'exhibitor') => {
    const res = await apiCall('verify_otp', { mobile, otp, user_type: type })
    if (res?.success) {
      if (type === 'visitor' && res.visitor) {
        setVisitor(res.visitor)
        setExhibitor(null)
        setUserType('visitor')
      } else if (type === 'exhibitor' && res.exhibitor) {
        setExhibitor(res.exhibitor)
        setVisitor(null)
        setUserType('exhibitor')
      }
    }
    return res
  }

  const register        = (data) => apiCall('register_exhibitor', data)
  const registerVisitor = (data) => apiCall('register_visitor',   data)

  const logout = async () => {
    try { await apiCall('logout') } catch (_) {}
    finally {
      setExhibitor(null)
      setVisitor(null)
      setUserType(null)
      window.location.href = '/expo'
    }
  }

  // Block render until auth resolved
  if (loading) return null

  return (
    <AuthContext.Provider value={{
      // profiles
      exhibitor,
      visitor,
      // active user type flag
      userType,
      isExhibitor: userType === 'exhibitor',
      isVisitor:   userType === 'visitor',
      // convenience: current logged-in profile (whoever is active)
      currentUser: userType === 'exhibitor' ? exhibitor : userType === 'visitor' ? visitor : null,
      // actions
      loading,
      sendOtp,
      verifyOtp,
      register,
      registerVisitor,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)