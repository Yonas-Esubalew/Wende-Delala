import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '../api/listings'
import { requireAuthenticatedSession } from '../auth/session'
import { formatListingTime, getListingType } from '../data/listingType'
import { CONTACT_PHONE } from '../data/contact'
import AccountActions from '../components/AccountActions'
import SiteFooter from '../components/SiteFooter'
import Seo from '../components/Seo'
import { useFavorites } from '../favorites/FavoritesContext'
import '../App.css'

const filters = ['all', 'cars', 'property', 'phones', 'electronics', 'furniture', 'services']

function ListingsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const initialParams = new URLSearchParams(location.search)
  const [activeFilter, setActiveFilter] = useState(initialParams.get('category') || 'property')
  const [tradeType, setTradeType] = useState(initialParams.get('type') || 'all')
  const [query, setQuery] = useState(initialParams.get('q') || '')
  const [city, setCity] = useState(initialParams.get('city') || '')
  const [condition, setCondition] = useState('all')
  const [sort, setSort] = useState('newest')
  const { favorites, isFavorite, toggleFavorite: toggleSavedListing } = useFavorites()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const searchFilters = { q: query, category: activeFilter, city, condition, sort, limit: 60 }
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['listings', searchFilters],
    queryFn: fetchListings,
    staleTime: 30_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1_000 * (attempt + 1), 3_000),
  })
  const listings = (data?.data || []).filter((listing) => (tradeType === 'all' || getListingType(listing) === tradeType) && (!showFavoritesOnly || isFavorite(listing.id)))
  const returnTo = `${location.pathname}${location.search}${location.hash}`

  const toggleFavorite = (id) => {
    if (!requireAuthenticatedSession(navigate, returnTo)) return
    toggleSavedListing(id)
  }

  const clearFilters = () => {
    setQuery('')
    setCity('')
    setCondition('all')
    setActiveFilter('all')
    setTradeType('all')
    setSort('newest')
    setShowFavoritesOnly(false)
  }

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')

  return (
    <div className="marketplace-shell listings-page">
      <Seo page="listings" />
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link>
          <nav className="desktop-nav" aria-label={t('primaryNav')}><Link className={`nav-link ${activeFilter === 'property' ? 'active' : ''}`} to="/listings?category=property">{t('categories.property')}</Link><Link className={`nav-link ${activeFilter === 'cars' ? 'active' : ''}`} to="/listings?category=cars">{t('categories.cars')}</Link><Link className="nav-link" to="/favorites">{t('saved')}</Link><Link className="nav-link" to="/#how-it-works">{t('howItWorks')}</Link></nav>
          <div className="header-actions"><button className="language-button" onClick={toggleLanguage} type="button">{i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}</button><AccountActions /></div>
        </div>
      </header>
      <section className="catalog-hero ethiopian-page-hero"><div><p className="section-kicker"><span className="ethiopia-flag" aria-hidden="true"><i /><i /><i /><b>★</b></span>{t('ethiopiaMarketplace')}</p><h1>{t('allListingsTitle')}</h1><p>{t('allListingsSubtitle')}</p></div><a className="page-photo-credit" href="https://ethionegari.com/2025/09/02/cbe-unveils-50-billion-birr-diaspora-loan/" target="_blank" rel="noreferrer">{t('heroImageCredit')}</a></section>
      <main className="catalog-main">
        <div className="catalog-top"><div><Link className="back-link" to="/">← {t('backHome')}</Link><p className="section-kicker">{t('allListingsKicker')}</p><h1>{t('allListingsTitle')}</h1><p>{t('allListingsSubtitle')}</p></div><div className="catalog-count"><strong>{listings.length}</strong><span>{t('results')}</span></div></div>
        <div className="catalog-toolbar"><div className="catalog-search"><span>☎</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('catalogSearch')} aria-label={t('catalogSearch')} /></div><select aria-label={t('sortBy')} value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">{t('newest')}</option><option value="low">{t('priceLow')}</option><option value="high">{t('priceHigh')}</option></select></div>
        <div className="filter-tabs trade-tabs" role="tablist" aria-label={t('listingType')}>{['all', 'sale', 'rent'].map((type) => <button key={type} className={tradeType === type ? 'filter-tab active' : 'filter-tab'} onClick={() => setTradeType(type)} type="button">{type === 'all' ? t('allListings') : t(type === 'sale' ? 'forSale' : 'forRent')}</button>)}<button className={`filter-tab saved-only-tab ${showFavoritesOnly ? 'active' : ''}`} onClick={() => setShowFavoritesOnly((value) => !value)} type="button" aria-pressed={showFavoritesOnly}>♡ {t('savedOnly')}</button></div>
        <div className="catalog-layout">
          <aside className="filter-rail"><div className="filter-title-row"><div><p className="section-kicker">{t('filterBy')}</p><h2>{t('categoriesLabel')}</h2></div><button className="clear-filters" onClick={clearFilters} type="button">{t('clearFilters')}</button></div>
            {filters.map((filter) => <button className={activeFilter === filter ? 'catalog-filter active' : 'catalog-filter'} key={filter} onClick={() => setActiveFilter(filter)} type="button">{t(`tabs.${filter}`, { defaultValue: t(`categories.${filter}`, { defaultValue: filter }) })}<span>→</span></button>)}
            <div className="filter-divider" />
            <label className="filter-field">{t('city')}<select value={city} onChange={(event) => setCity(event.target.value)}><option value="">{t('allCities')}</option><option value="Addis Ababa">{t('addisAbaba')}</option><option value="Adama">{t('adama')}</option></select></label>
            <label className="filter-field">{t('condition')}<select value={condition} onChange={(event) => setCondition(event.target.value)}><option value="all">{t('allConditions')}</option><option value="new">{t('newItem')}</option><option value="used">{t('usedItem')}</option></select></label>
            <div className="filter-note"><span>⌖</span><p>{t('callTip')}</p></div>
          </aside>
          <section className="catalog-results" aria-label={t('allListingsTitle')}>
            <div className="catalog-mobile-filter"><span>{t('results')}: {listings.length}</span>{filters.slice(0, 4).map((filter) => <button className={activeFilter === filter ? 'active' : ''} key={filter} onClick={() => setActiveFilter(filter)} type="button">{t(`tabs.${filter}`)}</button>)}</div>
            {isLoading && <div className="catalog-status">{t('loadingListings')}</div>}
            {isError && <div className="catalog-status error" role="alert"><strong>{t('listingsUnavailableTitle', { defaultValue: t('listingsError') })}</strong><p>{t('listingsUnavailableBody', { defaultValue: t('listingsError') })}</p><button className="catalog-retry-button" type="button" onClick={() => refetch()} disabled={isFetching}>{isFetching ? t('loadingListings') : t('retryListings', { defaultValue: 'Try again' })}</button></div>}
            {!isLoading && !isError && <><div className="listing-grid">{listings.map((listing) => <article className="listing-card" key={listing.id}><div className="listing-image-wrap"><img src={listing.image} alt={listing.title} loading="lazy" />{listing.featured && <span className={`featured-label tier-${listing.promotionTier || 'vip'}`}>{t(listing.promotionTier === 'pro' ? 'tierPro' : listing.promotionTier === 'vip' ? 'tierVip' : 'featured')}</span>}<button className={`favorite-button ${isFavorite(listing.id) ? 'saved' : ''}`} onClick={() => toggleFavorite(listing.id)} type="button" aria-label={t('saveListing')} aria-pressed={isFavorite(listing.id)}>{isFavorite(listing.id) ? '♥' : '♡'}</button><span className={`listing-type-badge ${getListingType(listing)}`}>{t(getListingType(listing) === 'rent' ? 'forRent' : 'forSale')}</span></div><div className="listing-card-body"><div className="listing-meta"><span>{t(`categories.${listing.category}`)}</span><span>·</span><span>{formatListingTime(listing.time, i18n.language, t)}</span></div><h3>{listing.title}</h3><strong className="listing-price">{listing.price} <small>ብር</small></strong><p className="listing-location"><span>⌖</span>{listing.location}</p><Link className="details-button" to={`/listing/${listing.id}`}>{t('viewDetails')} <span>↗</span></Link><a className="call-seller-button" href={`tel:${CONTACT_PHONE}`} onClick={(event) => { if (!requireAuthenticatedSession(navigate, returnTo)) event.preventDefault() }}><span>☎</span>{t('callSeller')}</a></div></article>)}</div>{listings.length === 0 && <div className="catalog-empty"><span>⌕</span><h2>{showFavoritesOnly && favorites.length === 0 ? t('noSavedListings') : t('noResults')}</h2><p>{showFavoritesOnly && favorites.length === 0 ? t('noSavedListingsBody') : t('noResultsBody')}</p>{showFavoritesOnly && <Link className="details-button empty-favorites-link" to="/favorites">{t('openSavedListings')} <span>↗</span></Link>}</div>}</>}
          </section>
        </div>
      </main>
      <SiteFooter />
      <nav className="mobile-nav" aria-label={t('mobileNav')}><Link className="mobile-nav-item" to="/"><span>⌂</span>{t('home')}</Link><Link className="mobile-nav-item active" to="/listings"><span>◈</span>{t('categoriesLabel')}</Link><Link className="mobile-post" to="/">+</Link><Link className="mobile-nav-item" to="/favorites"><span>♡</span>{t('saved')}</Link><Link className="mobile-nav-item" to="/profile"><span>◯</span>{t('profile')}</Link></nav>
    </div>
  )
}

export default ListingsPage

