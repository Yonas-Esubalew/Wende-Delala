import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loginUser, registerUser } from '../api/auth'
import { saveCurrentUser } from '../auth/session'
import { friendlyErrorMessage } from '../api/friendlyError'
import { useToast } from '../components/ToastProvider'
import '../App.css'

function AuthPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const showToast = useToast()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const [robotChecked, setRobotChecked] = useState(false)
  const toast = ''
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const pending = JSON.parse(sessionStorage.getItem('delala-pending-toast') || 'null')
      sessionStorage.removeItem('delala-pending-toast')
      if (pending?.key) showToast(t(pending.key), pending.type || 'info')
    } catch { sessionStorage.removeItem('delala-pending-toast') }
  }, [showToast, t])
  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
  }
  const changeMode = (nextMode) => {
    setMode(nextMode)
    setFieldErrors({})
    setRobotChecked(false)
    setPasswordVisible(false)
    setConfirmPasswordVisible(false)
    setForm((current) => ({ ...current, confirmPassword: '' }))
  }
  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    const email = form.email.trim()
    if (!email) nextErrors.email = t('emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t('emailInvalid')
    if (!form.password) nextErrors.password = t('passwordRequired')
    else if (form.password.length < 8) nextErrors.password = t('passwordTooShort')
    else if (form.password.length > 100) nextErrors.password = t('passwordTooLong')
    if (mode === 'register' && form.fullName.trim().length < 2) nextErrors.fullName = t('nameTooShort')
    else if (mode === 'register' && form.fullName.trim().length > 100) nextErrors.fullName = t('nameTooLong')
    if (mode === 'register' && form.password !== form.confirmPassword) nextErrors.confirmPassword = t('passwordMismatch')
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      showToast(t('authValidationError'), 'error')
      return
    }
    if (!robotChecked) {
      showToast(t('robotRequired'), 'error')
      return
    }
    setLoading(true)
    try {
      const payload = { fullName: form.fullName.trim(), email, password: form.password }
      const user = await (mode === 'login' ? loginUser({ email, password: form.password }) : registerUser(payload))
      saveCurrentUser(user)
      showToast(t(mode === 'login' ? 'authLoginSuccess' : 'authRegisterSuccess'), 'success')
      const requestedPage = location.state?.from
      navigate(user.role === 'admin' ? '/admin' : (requestedPage === '/admin' ? '/profile' : (requestedPage || '/')), { replace: true })
    }
    catch (requestError) { showToast(friendlyErrorMessage(requestError, t, 'authError', 'auth'), 'error') }
    finally { setLoading(false) }
  }
  return <div className="auth-page marketplace-shell">{toast && <div className="auth-toast" role="alert" aria-live="assertive"><span aria-hidden="true">!</span>{toast}</div>}<header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link><button className="language-button" onClick={() => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')} type="button">{i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}</button></div></header><main className="auth-main"><section className="auth-panel"><div className="auth-brand-mark">ደ</div><p className="section-kicker">{t('authKicker')}</p><h1>{mode === 'login' ? t('loginTitle') : t('registerTitle')}</h1><p className="auth-subtitle">{mode === 'login' ? t('loginSubtitle') : t('registerSubtitle')}</p><div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')} type="button">{t('login')}</button><button className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')} type="button">{t('register')}</button></div><form className="auth-form" onSubmit={submit} noValidate>{mode === 'register' && <label>{t('fullName')}<input name="fullName" value={form.fullName} onChange={update} required maxLength="100" autoComplete="name" aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined} placeholder={t('fullNamePlaceholder')} />{fieldErrors.fullName && <span className="auth-field-error" id="fullName-error">{fieldErrors.fullName}</span>}</label>}<label>{t('email')}<input name="email" value={form.email} onChange={update} required type="email" autoComplete="email" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined} placeholder="name@example.com" />{fieldErrors.email && <span className="auth-field-error" id="email-error">{fieldErrors.email}</span>}</label><label>{t('password')}<span className="auth-password-wrap"><input name="password" value={form.password} onChange={update} required minLength="8" maxLength="100" type={passwordVisible ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : undefined} placeholder={t('passwordPlaceholder')} /><button className="password-visibility" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={t(passwordVisible ? 'hidePassword' : 'showPassword')} title={t(passwordVisible ? 'hidePassword' : 'showPassword')}><PasswordToggleIcon visible={passwordVisible} /></button></span>{fieldErrors.password && <span className="auth-field-error" id="password-error">{fieldErrors.password}</span>}</label>{mode === 'register' && <label>{t('confirmPassword')}<span className="auth-password-wrap"><input name="confirmPassword" value={form.confirmPassword} onChange={update} required type={confirmPasswordVisible ? 'text' : 'password'} autoComplete="new-password" aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined} placeholder={t('confirmPasswordPlaceholder')} /><button className="password-visibility" type="button" onClick={() => setConfirmPasswordVisible((visible) => !visible)} aria-label={t(confirmPasswordVisible ? 'hidePassword' : 'showPassword')} title={t(confirmPasswordVisible ? 'hidePassword' : 'showPassword')}><PasswordToggleIcon visible={confirmPasswordVisible} /></button></span>{fieldErrors.confirmPassword && <span className="auth-field-error" id="confirmPassword-error">{fieldErrors.confirmPassword}</span>}</label>}<label className={robotChecked ? 'human-check verified' : 'human-check'}><input type="checkbox" checked={robotChecked} onChange={(event) => setRobotChecked(event.target.checked)} /><span className="human-check-box" aria-hidden="true">{robotChecked ? '✓' : ''}</span><span className="human-check-copy">{t('imNotRobot')}</span><span className="human-check-mark" aria-hidden="true">◉<small>DE LALA</small></span></label><button className="auth-submit" disabled={loading} type="submit">{loading ? t('pleaseWait') : mode === 'login' ? t('login') : t('createAccount')} <span>↗</span></button></form><p className="auth-note">{t('authNoGoogle')}</p></section><aside className="auth-aside"><p className="section-kicker">{t('authAsideKicker')}</p><h2>{t('authAsideTitle')}</h2><p>{t('authAsideBody')}</p><div className="auth-points"><span>✓</span>{t('authPointOne')}<span>✓</span>{t('authPointTwo')}</div></aside></main><footer className="site-footer auth-footer"><span>© 2026 Delala</span><nav className="footer-links" aria-label={t('primaryNav')}><Link to="/listings">{t('browse')}</Link><Link to="/about">{t('aboutNav')}</Link><Link to="/services">{t('servicesNav')}</Link><Link to="/vision">{t('visionNav')}</Link></nav><span>{t('footerLine')}</span></footer></div>
}

export default AuthPage

function PasswordToggleIcon({ visible }) {
  return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.8" />{!visible && <path d="m4 4 16 16" />}</svg>
}
