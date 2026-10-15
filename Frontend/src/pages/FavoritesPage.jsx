import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchListings } from '../api/listings'
import { requireAuthenticatedSession } from '../auth/session'
import { formatListingTime, getListingType } from '../data/listingType'
import { CONTACT_PHONE } from '../data/contact'
import { useFavorites } from '../favorites/FavoritesContext'
import AccountActions from '../components/AccountActions'
import SiteFooter from '../components/SiteFooter'
import '../App.css'

function FavoritesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [tradeType, setTradeType] = useState('all')
  const searchFilters = { category: 'all', limit: 60, sort: 'newest' }
  const { data, isLoading, isError, refetch, isFetching } = useQuery({ queryKey: ['listings', searchFilters], queryFn: fetchListings, staleTime: 30_000, retry: 2 })
  const savedListings = (data?.data || []).filter((item) => isFavorite(item.id))
  const visibleListings = savedListings.filter((item) => {
    const matchesText = `${item.title} ${item.location}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesText && (category === 'all' || item.category === category) && (tradeType === 'all' || getListingType(item) === tradeType)
  })
  const returnTo = `${location.pathname}${location.search}${location.hash}`

  const toggleSaved = (id) => {
    if (requireAuthenticatedSession(navigate, returnTo)) toggleFavorite(id)
  }

  return <div className="marketplace-shell favorites-page">
    <header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link><nav className="desktop-nav" aria-label={t('primaryNav')}><Link className="nav-link" to="/listings">{t('browse')}</Link><Link className="nav-link active" to="/favorites">{t('saved')}</Link><Link className="nav-link" to="/about">{t('aboutNav')}</Link></nav><div className="header-actions"><button className="language-button" onClick={() => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')} type="button">{i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}</button><AccountActions /></div></div></header>
    <main className="favorites-main"><div className="favorites-heading"><div><p className="section-kicker">{t('savedCollection')}</p><h1>{t('savedListingsTitle')}</h1><p>{t('savedListingsSubtitle')}</p></div><div className="favorites-count"><strong>{favorites.length}</strong><span>{t('saved')}</span></div></div>
      <div className="favorites-toolbar"><label className="catalog-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('savedSearchPlaceholder')} aria-label={t('savedSearchPlaceholder')} /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label={t('categoryLabel')}><option value="all">{t('allCategories')}</option><option value="cars">{t('categories.cars')}</option><option value="property">{t('categories.property')}</option><option value="phones">{t('categories.phones')}</option><option value="electronics">{t('categories.electronics')}</option><option value="furniture">{t('categories.furniture')}</option><option value="services">{t('categories.services')}</option></select></div>
      <div className="filter-tabs trade-tabs favorites-trade-tabs" role="tablist" aria-label={t('listingType')}>{['all', 'sale', 'rent'].map((type) => <button key={type} className={tradeType === type ? 'filter-tab active' : 'filter-tab'} onClick={() => setTradeType(type)} type="button">{type === 'all' ? t('allListings') : t(type === 'sale' ? 'forSale' : 'forRent')}</button>)}</div>
      {isLoading && <div className="catalog-status">{t('loadingListings')}</div>}
      {isError && <div className="catalog-status error" role="alert"><strong>{t('adminListingsUnavailable')}</strong><p>{t('adminListingsUnavailableBody')}</p><button className="catalog-retry-button" type="button" onClick={() => refetch()} disabled={isFetching}>{isFetching ? t('loadingListings') : t('retryListings')}</button></div>}
      {!isLoading && !isError && visibleListings.length > 0 && <div className="listing-grid favorites-grid">{visibleListings.map((item) => <article className="listing-card" key={item.id}><div className="listing-image-wrap"><img src={item.image} alt={item.title} loading="lazy" /><button className="favorite-button saved" onClick={() => toggleSaved(item.id)} type="button" aria-label={t('removeFromSaved')} aria-pressed="true">♥</button><span className={`listing-type-badge ${getListingType(item)}`}>{t(getListingType(item) === 'rent' ? 'forRent' : 'forSale')}</span></div><div className="listing-card-body"><div className="listing-meta"><span>{t(`categories.${item.category}`)}</span><span>·</span><span>{formatListingTime(item.time, i18n.language, t)}</span></div><h2>{item.title}</h2><strong className="listing-price">{item.price} <small>ብር</small></strong><p className="listing-location"><span>⌖</span>{item.location}</p><Link className="details-button" to={`/listing/${item.id}`}>{t('viewDetails')} <span>↗</span></Link><a className="call-seller-button" href={`tel:${CONTACT_PHONE}`} onClick={(event) => { if (!requireAuthenticatedSession(navigate, returnTo)) event.preventDefault() }}><span>☎</span>{t('callSeller')}</a></div></article>)}</div>}
      {!isLoading && !isError && visibleListings.length === 0 && <section className="catalog-empty favorites-empty"><span>♡</span><h2>{favorites.length ? t('noSavedMatches') : t('noSavedListings')}</h2><p>{favorites.length ? t('noSavedMatchesBody') : t('noSavedListingsBody')}</p><Link className="details-button" to="/listings">{t('browseProducts')} <span>↗</span></Link></section>}
    </main>
    <SiteFooter />
    <nav className="mobile-nav" aria-label={t('mobileNav')}><Link className="mobile-nav-item" to="/"><span>⌂</span>{t('home')}</Link><Link className="mobile-nav-item" to="/listings"><span>◈</span>{t('categoriesLabel')}</Link><Link className="mobile-post" to="/">+</Link><Link className="mobile-nav-item active" to="/favorites"><span>♥</span>{t('saved')}</Link><Link className="mobile-nav-item" to="/profile"><span>◯</span>{t('profile')}</Link></nav>
  </div>
}

export default FavoritesPage
