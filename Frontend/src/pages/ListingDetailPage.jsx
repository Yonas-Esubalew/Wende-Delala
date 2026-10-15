import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchListingById } from '../api/listingDetail'
import { fetchListings } from '../api/listings'
import { requireAuthenticatedSession } from '../auth/session'
import { formatListingTime, getListingType } from '../data/listingType'
import { CONTACT_PHONE } from '../data/contact'
import AccountActions from '../components/AccountActions'
import SiteFooter from '../components/SiteFooter'
import Seo from '../components/Seo'
import { useFavorites } from '../favorites/FavoritesContext'
import '../App.css'

function ListingDetailPage() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeImage, setActiveImage] = useState(0)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { data: listing, isLoading, isError } = useQuery({ queryKey: ['listing', id], queryFn: fetchListingById })
  const { data: similarData } = useQuery({ queryKey: ['listings', { category: listing?.category || 'all', limit: 3 }], queryFn: fetchListings, enabled: Boolean(listing) })
  const saved = listing ? isFavorite(listing.id) : false

  if (isLoading) return <div className="detail-state">{t('loadingDetails')}</div>
  if (isError || !listing) return <div className="detail-state error"><h1>{t('detailsError')}</h1><Link to="/listings">{t('backToListings')}</Link></div>

  const images = listing.images?.length ? listing.images : [listing.image]
  const similar = (similarData?.data || []).filter((item) => item.id !== listing.id).slice(0, 3)
  const returnTo = `${location.pathname}${location.search}${location.hash}`
  const facts = [
    [t('categoryLabel'), t(`categories.${listing.category}`)],
    [t('condition'), listing.condition === 'new' ? t('newItem') : t('usedItem')],
    [t('location'), listing.location],
    [t('views'), listing.views.toLocaleString()],
  ]

  return (
    <div className="marketplace-shell detail-page">
      <Seo page="listing" listing={listing} />
      <header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link><nav className="desktop-nav" aria-label={t('primaryNav')}><Link className="nav-link active" to="/listings">{t('browse')}</Link><Link className="nav-link" to="/favorites">{t('saved')}</Link><Link className="nav-link" to="/#how-it-works">{t('howItWorks')}</Link></nav><div className="header-actions"><button className="language-button" onClick={() => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')} type="button">{i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}</button><AccountActions /></div></div></header>
      <main className="detail-main">
        <Link className="back-link" to="/listings">← {t('backToListings')}</Link>
        <div className="detail-layout">
          <section className="detail-gallery"><div className="detail-main-image"><img src={images[activeImage]} alt={listing.title} /><span className="gallery-count">{activeImage + 1} / {images.length}</span></div><div className="detail-thumbnails">{images.map((image, index) => <button className={activeImage === index ? 'active' : ''} key={image} onClick={() => setActiveImage(index)} type="button"><img src={image} alt={`${listing.title} ${index + 1}`} /></button>)}</div></section>
          <section className="detail-summary">
            <div className="detail-topline"><span className="detail-category">{t(`categories.${listing.category}`)}</span><span className={`listing-type-badge detail-type ${getListingType(listing)}`}>{t(getListingType(listing) === 'rent' ? 'forRent' : 'forSale')}</span>{listing.featured && <span className={`featured-label tier-${listing.promotionTier || 'vip'}`}>{t(listing.promotionTier === 'pro' ? 'tierPro' : listing.promotionTier === 'vip' ? 'tierVip' : 'featured')}</span>}</div>
            <h1>{listing.title}</h1>
            <div className="detail-location">⌖ {listing.location} <span>•</span> {formatListingTime(listing.time, i18n.language, t)}</div>
            <div className="highlight-card"><div className="highlight-heading"><span>✦</span><div><p>{t('adminHighlights')}</p><strong>{t('keyDetails')}</strong></div></div><div className="highlight-facts">{facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><ul>{listing.highlights?.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></div>
            <div className="detail-price-row"><strong>{listing.price} <small>ብር</small></strong><span>{t('negotiable')}</span></div>
            <div className="detail-actions"><a className="primary-call" href={`tel:${CONTACT_PHONE}`} onClick={(event) => { if (!requireAuthenticatedSession(navigate, returnTo)) event.preventDefault() }}><span>⌕</span>{t('callSeller')}</a><button className={saved ? 'save-detail saved' : 'save-detail'} onClick={() => { if (requireAuthenticatedSession(navigate, returnTo)) toggleFavorite(listing.id) }} type="button" aria-pressed={saved}>{saved ? '♥' : '♡'} {saved ? t('removeFromSaved') : t('saveListingShort')}</button></div>
            <div className="seller-mini"><div className="seller-avatar">ሻ</div><div><strong>{t('verifiedSeller')}</strong><p>{t('sellerResponse')}</p></div><span>✓</span></div>
          </section>
        </div>
        <section className="similar-section"><div className="section-heading"><div><p className="section-kicker">{t('youMayLike')}</p><h2>{t('similarListings')}</h2></div><Link className="text-link" to="/listings">{t('seeAll')} <span>↗</span></Link></div><div className="listing-grid">{similar.map((item) => <article className="listing-card" key={item.id}><div className="listing-image-wrap"><img src={item.image} alt={item.title} loading="lazy" /><button className={`favorite-button ${isFavorite(item.id) ? 'saved' : ''}`} onClick={() => { if (requireAuthenticatedSession(navigate, returnTo)) toggleFavorite(item.id) }} type="button" aria-label={t('saveListing')} aria-pressed={isFavorite(item.id)}>{isFavorite(item.id) ? '♥' : '♡'}</button></div><div className="listing-card-body"><div className="listing-meta"><span>{t(`categories.${item.category}`)}</span><span>•</span><span>{formatListingTime(item.time, i18n.language, t)}</span></div><h3>{item.title}</h3><strong className="listing-price">{item.price} <small>ብር</small></strong><Link className="details-button" to={`/listing/${item.id}`}>{t('viewDetails')} <span>↗</span></Link></div></article>)}</div></section>
      </main>
      <SiteFooter />
      <nav className="mobile-nav" aria-label={t('mobileNav')}><Link className="mobile-nav-item" to="/"><span>⌂</span>{t('home')}</Link><Link className="mobile-nav-item" to="/listings"><span>◈</span>{t('categoriesLabel')}</Link><Link className="mobile-post" to="/">＋</Link><Link className="mobile-nav-item" to="/favorites"><span>♡</span>{t('saved')}</Link><Link className="mobile-nav-item" to="/profile"><span>◯</span>{t('profile')}</Link></nav>
    </div>
  )
}

export default ListingDetailPage
