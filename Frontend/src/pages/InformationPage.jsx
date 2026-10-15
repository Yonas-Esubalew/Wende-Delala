import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AccountActions from '../components/AccountActions'
import SiteFooter from '../components/SiteFooter'
import '../App.css'

const pageConfig = {
  about: { eyebrow: 'aboutEyebrow', title: 'aboutTitle', intro: 'aboutIntro', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1100&q=85', features: ['aboutFeatureOne', 'aboutFeatureTwo', 'aboutFeatureThree'] },
  services: { eyebrow: 'servicesEyebrow', title: 'servicesTitle', intro: 'servicesIntro', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1100&q=85', features: ['serviceFeatureOne', 'serviceFeatureTwo', 'serviceFeatureThree'] },
  vision: { eyebrow: 'visionEyebrow', title: 'visionTitle', intro: 'visionIntro', image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1100&q=85', features: ['visionFeatureOne', 'visionFeatureTwo', 'visionFeatureThree'] },
  opportunities: { eyebrow: 'opportunitiesEyebrow', title: 'opportunitiesTitle', intro: 'opportunitiesIntro', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85', features: ['opportunityFeatureOne', 'opportunityFeatureTwo', 'opportunityFeatureThree'] },
}

function InformationPage({ pageKey }) {
  const { t, i18n } = useTranslation()
  const content = pageConfig[pageKey] || pageConfig.about
  const features = content.features
  const icons = ['✦', '⌖', '✓']

  return <div className="marketplace-shell information-page"><header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link><nav className="desktop-nav" aria-label={t('primaryNav')}><Link className="nav-link" to="/listings">{t('browse')}</Link><Link className="nav-link" to="/services">{t('servicesNav')}</Link><Link className="nav-link" to="/about">{t('aboutNav')}</Link><Link className="nav-link" to="/opportunities">{t('opportunitiesNav')}</Link></nav><div className="header-actions"><button className="language-button" onClick={() => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')} type="button">{i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}</button><AccountActions /></div></div></header><main className="info-main"><Link className="back-link" to="/">← {t('backHome')}</Link><section className="info-hero"><div className="info-copy"><p className="section-kicker">{t(content.eyebrow)}</p><h1>{t(content.title)}</h1><p>{t(content.intro)}</p><div className="info-actions"><Link className="post-button" to="/listings">{t('browseProducts')} <span>↗</span></Link><a className="info-telegram" href={CONTACT_TELEGRAM} target="_blank" rel="noreferrer">@kiyasma ↗</a></div></div><div className="info-image"><img src={content.image} alt={t(content.title)} loading="lazy" /><span>{t('ethiopiaMarketplace')}</span></div></section><section className="info-features"><div className="info-section-heading"><p className="section-kicker">{t('whyDelala')}</p><h2>{t('infoSectionTitle')}</h2></div><div className="info-feature-grid">{features.map((key, index) => <article className="info-feature" key={key}><span>{icons[index]}</span><h3>{t(`${key}Title`)}</h3><p>{t(`${key}Body`)}</p></article>)}</div></section><section className="info-contact"><div><p className="section-kicker">{t('haveQuestion')}</p><h2>{t('talkToDelala')}</h2><p>{t('talkToDelalaBody')}</p></div><a href={CONTACT_TELEGRAM} target="_blank" rel="noreferrer">@kiyasma · +251 918 046 641 ↗</a></section></main><SiteFooter /></div>
}

export default InformationPage
import { CONTACT_TELEGRAM } from '../data/contact'
