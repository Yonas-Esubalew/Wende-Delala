import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { logoutUser } from '../api/auth'
import { clearCurrentUser, getCurrentUser } from '../auth/session'
import SiteFooter from '../components/SiteFooter'
import '../App.css'

function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const user = getCurrentUser()

  const signOut = async () => {
    try { await logoutUser() } catch (requestError) { setError(requestError.response?.data?.error?.message || t('authError')) }
    clearCurrentUser()
    navigate('/', { replace: true })
  }

  if (!user) return <div className="marketplace-shell"><main className="profile-main"><section className="profile-card"><h1>{t('loginRequired')}</h1><Link className="auth-submit profile-login" to="/auth">{t('login')}</Link></section></main><SiteFooter /></div>

  const initial = user.fullName?.trim().split(/\s+/)[0]?.charAt(0).toLocaleUpperCase() || (user.role === 'admin' ? 'Y' : 'U')
  return <div className="marketplace-shell"><header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link><Link className="login-button" to="/listings">{t('viewMarketplace')}</Link></div></header><main className="profile-main"><section className="profile-card"><div className={`profile-avatar ${user.role === 'admin' ? 'admin-avatar' : ''}`}>{initial}</div><p className="section-kicker">{user.role === 'admin' ? t('adminAccount') : t('buyerAccount')}</p><h1>{user.fullName}</h1><p className="profile-email">{user.email}</p>{error && <div className="auth-error">{error}</div>}{user.role === 'admin' && <Link className="admin-dashboard-link profile-admin-link" to="/admin">{t('adminDashboard')} →</Link>}<button className="profile-logout" onClick={signOut} type="button">{t('logout')}</button></section></main><SiteFooter /></div>
}

export default ProfilePage
