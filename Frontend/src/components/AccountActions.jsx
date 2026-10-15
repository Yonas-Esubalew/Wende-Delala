import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { logoutUser } from '../api/auth'
import { clearCurrentUser, getCurrentUser } from '../auth/session'
import { useToast } from './ToastProvider'

export default function AccountActions() {
  const { t } = useTranslation()
  const showToast = useToast()
  const navigate = useNavigate()
  const [user, setUser] = useState(getCurrentUser)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const refreshUser = () => setUser(getCurrentUser())
    window.addEventListener('storage', refreshUser)
    window.addEventListener('delala-auth-changed', refreshUser)
    return () => {
      window.removeEventListener('storage', refreshUser)
      window.removeEventListener('delala-auth-changed', refreshUser)
    }
  }, [])

  useEffect(() => {
    const closeOutside = (event) => { if (!menuRef.current?.contains(event.target)) setOpen(false) }
    const closeEscape = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeEscape)
    }
  }, [])

  if (!user) return <Link className="guest-auth-link" to="/auth"><span>{t('login')}</span><span aria-hidden="true">·</span><span>{t('register')}</span></Link>

  const isAdmin = user.role === 'admin'
  const initial = user.fullName?.trim().split(/\s+/)[0]?.charAt(0).toLocaleUpperCase() || (isAdmin ? 'Y' : 'U')
  const signOut = async () => {
    let serverLogout = true
    try { await logoutUser() } catch { serverLogout = false }
    clearCurrentUser()
    setUser(null)
    setOpen(false)
    showToast(t(serverLogout ? 'logoutSuccess' : 'logoutLocalSuccess'), 'success')
    navigate('/', { replace: true })
  }

  return <div className="profile-menu-wrap" ref={menuRef}>
    <button className={`account-avatar ${isAdmin ? 'admin-avatar' : 'user-avatar'}`} type="button" aria-label={t('myProfile')} aria-expanded={open} onClick={() => setOpen((current) => !current)}>{initial}</button>
    {open && <div className="profile-menu" role="menu"><div className="profile-menu-user"><strong>{user.fullName}</strong><span>{user.email}</span><small className={isAdmin ? 'profile-role-admin' : ''}>{isAdmin ? t('adminAccount') : t('buyerAccount')}</small></div>{isAdmin && <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>{t('adminDashboard')}</Link>}<Link role="menuitem" to="/profile" onClick={() => setOpen(false)}>{t('myProfile')}</Link><button role="menuitem" onClick={signOut} type="button">{t('logout')}</button></div>}
  </div>
}
