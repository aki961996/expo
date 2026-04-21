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
    // Check session on mount — check both exhibitor and visitor
    fetch('/api/method/expo_management.expo_management.auth.get_current_user', {
      credentials: 'include',
    })
      .then(r => r.json())
      .then(d => {
        const msg = d.message
        if (msg?.logged_in) {
          if (msg.user_type === 'exhibitor' && msg.exhibitor) {
            setExhibitor(msg.exhibitor)
            setUserType('exhibitor')
          } else if (msg.user_type === 'visitor' && msg.visitor) {
            setVisitor(msg.visitor)
            setUserType('visitor')
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
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