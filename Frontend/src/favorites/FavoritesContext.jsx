import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrentUser } from '../auth/session'
import { useToast } from '../components/ToastProvider'

const FavoritesContext = createContext(null)

function getUserKey(user = getCurrentUser()) {
  return user?.id || user?.email || 'guest'
}

function readFavorites(userKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(`delala-favorites:${userKey}`) || '[]')
    return Array.isArray(saved) ? saved.map(String) : []
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }) {
  const { t } = useTranslation()
  const showToast = useToast()
  const storageWarningShown = useRef(false)
  const [userKey, setUserKey] = useState(getUserKey)
  const [favorites, setFavorites] = useState(() => readFavorites(getUserKey()))
  const storageKey = `delala-favorites:${userKey}`

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites))
    } catch {
      if (!storageWarningShown.current) {
        storageWarningShown.current = true
        showToast(t('storageUnavailable'), 'error')
      }
    }
  }, [favorites, storageKey, showToast, t])

  useEffect(() => {
    const refreshUserFavorites = () => {
      const nextUserKey = getUserKey()
      setUserKey(nextUserKey)
      setFavorites(readFavorites(nextUserKey))
    }
    const syncAcrossTabs = (event) => {
      if (event.key === storageKey) setFavorites(readFavorites(userKey))
      if (event.key === 'delala-user') refreshUserFavorites()
    }
    window.addEventListener('delala-auth-changed', refreshUserFavorites)
    window.addEventListener('storage', syncAcrossTabs)
    return () => {
      window.removeEventListener('delala-auth-changed', refreshUserFavorites)
      window.removeEventListener('storage', syncAcrossTabs)
    }
  }, [storageKey, userKey])

  const value = useMemo(() => ({
    favorites,
    isFavorite: (id) => favorites.includes(String(id)),
    toggleFavorite: (id) => {
      const idKey = String(id)
      const removing = favorites.includes(idKey)
      setFavorites((current) => current.includes(idKey)
        ? current.filter((savedId) => savedId !== idKey)
        : [...current, idKey])
      showToast(t(removing ? 'favoriteRemoved' : 'favoriteAdded'), 'success')
    },
    removeFavorite: (id) => {
      setFavorites((current) => current.filter((savedId) => savedId !== String(id)))
      showToast(t('favoriteRemoved'), 'success')
    },
  }), [favorites, showToast, t])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider')
  return value
}
