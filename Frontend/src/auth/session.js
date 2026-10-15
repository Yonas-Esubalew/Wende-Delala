const USER_STORAGE_KEY = 'delala-user'

export function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export function saveCurrentUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  sessionStorage.removeItem(USER_STORAGE_KEY)
  sessionStorage.removeItem('delala-authenticated')
  window.dispatchEvent(new Event('delala-auth-changed'))
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_STORAGE_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
  sessionStorage.removeItem('delala-authenticated')
  window.dispatchEvent(new Event('delala-auth-changed'))
}

export function hasAuthenticatedSession() {
  return Boolean(getCurrentUser())
}

export function isAdminSession() {
  return getCurrentUser()?.role === 'admin'
}

export function requireAuthenticatedSession(navigate, returnTo) {
  if (hasAuthenticatedSession()) return true
  try { sessionStorage.setItem('delala-pending-toast', JSON.stringify({ key: 'loginToContinue', type: 'info' })) } catch { /* keep navigation working when storage is unavailable */ }
  navigate('/auth', { state: { from: returnTo } })
  return false
}
