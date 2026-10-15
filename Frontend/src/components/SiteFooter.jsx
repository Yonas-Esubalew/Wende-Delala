import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer site-footer-shared">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link className="brand" to="/" aria-label={t('brand')}>
            <span className="brand-mark" aria-hidden="true" />
            <span><strong>ወንዴ ደላላ</strong><small>WENDE DELALA</small></span>
          </Link>
          <p>{t('footerLine')}</p>
        </div>
        <nav className="site-footer-links" aria-label={t('primaryNav')}>
          <Link to="/listings">{t('browse')}</Link>
          <Link to="/favorites">{t('saved')}</Link>
          <Link to="/about">{t('aboutNav')}</Link>
          <Link to="/services">{t('servicesNav')}</Link>
          <Link to="/vision">{t('visionNav')}</Link>
          <Link to="/opportunities">{t('opportunitiesNav')}</Link>
        </nav>
        <div className="site-footer-contact">
          <a href={CONTACT_TELEGRAM} target="_blank" rel="noreferrer">@kiyasma <span aria-hidden="true">↗</span></a>
          <a href={`tel:${CONTACT_PHONE}`}>{t('callDelala')} +251 918 046 641 <span aria-hidden="true">☎</span></a>
        </div>
      </div>
      <div className="site-footer-bottom"><span>© {new Date().getFullYear()} Wende Delala</span><span>{t('ethiopiaMarketplace')}</span></div>
    </footer>
  )
}

export default SiteFooter
import { CONTACT_PHONE, CONTACT_TELEGRAM } from '../data/contact'
