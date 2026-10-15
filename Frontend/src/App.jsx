import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { fetchListingCategoryCounts, fetchListings } from './api/listings'
import AccountActions from './components/AccountActions'
import SiteFooter from './components/SiteFooter'
import Seo from './components/Seo'
import { useFavorites } from './favorites/FavoritesContext'
import { requireAuthenticatedSession } from './auth/session'
import { formatListingTime, getListingType } from './data/listingType'
import { CONTACT_PHONE, CONTACT_TELEGRAM } from './data/contact'
import './App.css'

const categories = [
  { key: 'cars', tone: 'mint' },
  { key: 'property', tone: 'sand' },
  { key: 'electronics', tone: 'sky' },
  { key: 'phones', tone: 'peach' },
  { key: 'furniture', tone: 'lavender' },
  { key: 'services', tone: 'yellow' },
]

function CategoryIcon({ name }) {
  const paths = {
    cars: <><path d="M3 14.5 5 9.5a2 2 0 0 1 1.8-1.2h10.4A2 2 0 0 1 19 9.5l2 5v3h-2v-2H5v2H3z" /><path d="M5 12h14M7 8.5l1.2 3.5m8.8-3.5-1.2 3.5" /><circle cx="7" cy="16" r="1.5" /><circle cx="17" cy="16" r="1.5" /></>,
    property: <><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
    electronics: <><rect x="3.5" y="4.5" width="17" height="12" rx="1.8" /><path d="M8 20h8m-4-3.5V20" /><path d="M7.5 8.5h9" /></>,
    phones: <><rect x="7" y="2.8" width="10" height="18.4" rx="2" /><path d="M10 5.5h4M11 18.2h2" /></>,
    furniture: <><path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" /><path d="M4 11h16a1 1 0 0 1 1 1v5H3v-5a1 1 0 0 1 1-1Zm1 6v3m14-3v3" /><path d="M5 14h14" /></>,
    services: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" /></>,
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

const listings = [
  {
    id: 1,
    title: 'Toyota RAV4 2020, excellent condition',
    price: '3,450,000',
    location: 'Bole, Addis Ababa',
    time: '2 hours ago',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1568844293986-8d0400d7b2ec?auto=format&fit=crop&w=900&q=80',
    featured: true,
    phone: '+251911223344',
  },
  {
    id: 2,
    title: 'Bright two bedroom apartment for rent',
    price: '38,000',
    location: 'Hayahulet, Addis Ababa',
    time: '5 hours ago',
    category: 'property',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80',
    phone: '+251922334455',
  },
  {
    id: 3,
    title: 'iPhone 15 Pro Max 256GB, brand new',
    price: '118,000',
    location: 'Piazza, Addis Ababa',
    time: 'Yesterday',
    category: 'phones',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80',
    phone: '+251933445566',
  },
  {
    id: 4,
    title: 'Modern sofa set, locally made',
    price: '42,500',
    location: 'CMC, Addis Ababa',
    time: 'Yesterday',
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    phone: '+251944556677',
  },
  {
    id: 5,
    title: 'Mercedes-Benz C-Class 2018, clean import',
    price: '4,950,000',
    location: 'Bole Rwanda, Addis Ababa',
    time: 'Today',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
    featured: true,
    phone: '+251955667788',
  },
  {
    id: 6,
    title: 'Hyundai Tucson 2021, low mileage',
    price: '3,980,000',
    location: 'Megenagna, Addis Ababa',
    time: 'Today',
    category: 'cars',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=900&q=80',
    phone: '+251966778899',
  },
]

function App() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
    const routeLocation = useLocation()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [tradeType, setTradeType] = useState('all')
  const { isFavorite, toggleFavorite: toggleSavedListing } = useFavorites()
    const [city, setCity] = useState('Addis Ababa')
  const [listingView, setListingView] = useState('grid')
  const { data: homeData } = useQuery({ queryKey: ['home-listings', { limit: 24, sort: 'newest' }], queryFn: fetchListings, staleTime: 30_000 })
  const { data: categoryCounts } = useQuery({ queryKey: ['listing-category-counts'], queryFn: fetchListingCategoryCounts, staleTime: 60_000, refetchOnWindowFocus: false })

  const toggleFavorite = (id) => {
    if (!requireAuthenticatedSession(navigate, `${routeLocation.pathname}${routeLocation.search}${routeLocation.hash}`)) return
    toggleSavedListing(id)
  }

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')
  }

  const sourceListings = homeData?.data || listings
  const visibleListings = sourceListings
    .filter((listing) => activeTab === 'all' || listing.category === activeTab)
    .filter((listing) => tradeType === 'all' || getListingType(listing) === tradeType)
    .slice(0, 6)

  const submitSearch = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (activeTab !== 'all') params.set('category', activeTab)
    if (city) params.set('city', city)
    if (tradeType !== 'all') params.set('type', tradeType)
    navigate(`/listings?${params.toString()}`)
  }

  return (
    <div className="marketplace-shell">
      <Seo page="home" />
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#top" aria-label={t('brand') }>
            <span className="brand-mark">ደ</span>
            <span><strong>ደላላ</strong><small>DE LALA</small></span>
          </a>
          <nav className="desktop-nav" aria-label={t('primaryNav')}>
            <a className={`nav-link ${activeTab === 'property' ? 'active' : ''}`} href="#all-listings" onClick={() => setActiveTab('property')}>{t('categories.property')}</a>
            <a className={`nav-link ${activeTab === 'cars' ? 'active' : ''}`} href="#all-listings" onClick={() => setActiveTab('cars')}>{t('categories.cars')}</a>
            <Link className="nav-link" to="/favorites">{t('saved')}</Link>
            <a className="nav-link" href="#how-it-works">{t('howItWorks')}</a>
            <Link className="nav-link" to="/services">{t('servicesNav')}</Link>
            <Link className="nav-link" to="/about">{t('aboutNav')}</Link>
          </nav>
          <div className="header-actions">
            <button className="language-button" onClick={toggleLanguage} type="button">
              {i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}
            </button>
            <AccountActions />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-section ethiopian-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="ethiopia-flag" aria-hidden="true"><i /><i /><i /><b>★</b></span>{t('ethiopiaMarketplace')}</p>
            <h1>{t('homeHeroTitle')}</h1>
            <p className="hero-subtitle">{t('homeHeroSubtitle')}</p>
            <form className="search-panel" onSubmit={submitSearch}>
              <div className="search-field">
                <span className="search-icon">⌕</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('searchPlaceholder')} />
              </div>
              <div className="location-field">
                <span className="pin-icon">⌖</span>
                <select value={city} onChange={(event) => setCity(event.target.value)} aria-label={t('location')}>
                  <option value="Addis Ababa">{t('addisAbaba')}</option>
                  <option value="Adama">{t('adama')}</option>
                </select>
              </div>
              <button className="search-button" type="submit">{t('search')} <span>↗</span></button>
            </form>
            <div className="popular-searches"><span>{t('popular')}:</span> {t('categories.property')} · {t('categories.cars')} · {t('forRent')}</div>
          </div>
          <div className="hero-art ethiopian-hero-art" aria-label={t('heroImageAlt')} role="img">
            <div className="hero-note note-top"><span>✦</span><strong>12k+</strong><small>{t('activeAds')}</small></div>
            <div className="hero-note note-bottom"><span className="avatar-stack">●●●</span><strong>{t('trustedSellers')}</strong></div>
            <div className="sun-disc" />
            <div className="hero-card hero-card-back" />
            <div className="hero-card hero-card-front">
              <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80" alt={t('carImageAlt')} />
              <div className="hero-card-info"><span>{t('featured')}</span><strong>Toyota Corolla</strong><small>1,850,000 ብር</small></div>
            </div>
            <div className="hero-sparkle sparkle-one">✦</div><div className="hero-sparkle sparkle-two">✧</div>
          </div>
          <a className="hero-photo-credit" href="https://ethionegari.com/2025/09/02/cbe-unveils-50-billion-birr-diaspora-loan/" target="_blank" rel="noreferrer">{t('heroImageCredit')}</a>
        </section>

        <section className="service-choices content-section" aria-label={t('waysToTrade')}>
          <div className="service-choice seller-choice"><span className="service-number">01</span><div><p className="section-kicker">{t('sellerPathKicker')}</p><h2>{t('sellerPathTitle')}</h2><p>{t('sellerPathBody')}</p></div><div className="seller-steps"><article className="seller-step"><span className="seller-step-number">01</span><h3>{t('sellerStepOneTitle')}</h3><p>{t('sellerStepOneBody')}</p><a href={CONTACT_TELEGRAM} target="_blank" rel="noreferrer">{t('sendSellerInfoTelegram')} <span>↗</span></a></article><article className="seller-step"><span className="seller-step-number">02</span><h3>{t('sellerStepTwoTitle')}</h3><p>{t('sellerStepTwoBody')}</p><a href={`tel:${CONTACT_PHONE}`}>{t('callSellerSupport')} <span>☎</span></a></article></div></div>
          <div className="service-choice sourcing-choice"><span className="service-number">02</span><div><p className="section-kicker">{t('buyerPathKicker')}</p><h2>{t('buyerPathTitle')}</h2><p>{t('buyerPathBody')}</p></div><Link className="service-choice-link" to="/listings">{t('browsePostedAds')} <span>↗</span></Link></div>
        </section>

        <section className="content-section" id="discover">
          <div className="section-heading"><div><p className="section-kicker">{t('browseBy')}</p><h2>{t('whatAreYouLookingFor')}</h2></div><Link to="/listings" className="text-link">{t('seeAll')} <span>↗</span></Link></div>
          <div className="category-grid">
            {categories.map((category) => <button className={`category-card ${category.tone}`} key={category.key} onClick={() => setActiveTab(category.key)} type="button"><span className="category-icon"><CategoryIcon name={category.key} /></span><span className="category-name">{t(`categories.${category.key}`)}</span><small>{categoryCounts?.data?.[category.key] == null ? '—' : new Intl.NumberFormat(i18n.language === 'am' ? 'am-ET' : 'en-US').format(categoryCounts.data[category.key])} {t('ads')}</small></button>)}
          </div>
        </section>

        <section className="content-section listings-section" id="all-listings">
          <div className="section-heading listings-heading"><div><p className="section-kicker">{t('handpicked')}</p><h2>{t('freshFromMarket')}</h2></div><div className="view-controls" role="group" aria-label={t('listingView')}><button className={`view-button ${listingView === 'grid' ? 'active' : ''}`} type="button" aria-label={t('gridView')} aria-pressed={listingView === 'grid'} onClick={() => setListingView('grid')}>▦</button><button className={`view-button ${listingView === 'list' ? 'active' : ''}`} type="button" aria-label={t('listView')} aria-pressed={listingView === 'list'} onClick={() => setListingView('list')}>☷</button></div></div>
          <div className="filter-tabs trade-tabs" role="tablist" aria-label={t('listingType')}>
            {['all', 'sale', 'rent'].map((type) => <button key={type} className={tradeType === type ? 'filter-tab active' : 'filter-tab'} onClick={() => setTradeType(type)} type="button">{type === 'all' ? t('allListings') : t(type === 'sale' ? 'forSale' : 'forRent')}</button>)}
          </div>
          <div className="filter-tabs category-tabs" role="tablist" aria-label={t('listingFilters')}>
            {['all', 'cars', 'property', 'phones'].map((tab) => <button key={tab} className={activeTab === tab ? 'filter-tab active' : 'filter-tab'} onClick={() => setActiveTab(tab)} type="button">{t(`tabs.${tab}`)}</button>)}
          </div>
          <div className={`listing-grid ${listingView === 'list' ? 'listing-list-view' : ''}`}>
            {visibleListings.map((listing) => <article className="listing-card" key={listing.id}><div className="listing-image-wrap"><img src={listing.image} alt={listing.title} loading="lazy" />{listing.featured && <span className={`featured-label tier-${listing.promotionTier || 'vip'}`}>{t(listing.promotionTier === 'pro' ? 'tierPro' : listing.promotionTier === 'vip' ? 'tierVip' : 'featured')}</span>}<button className={`favorite-button ${isFavorite(listing.id) ? 'saved' : ''}`} onClick={() => toggleFavorite(listing.id)} type="button" aria-label={t('saveListing')} aria-pressed={isFavorite(listing.id)}>{isFavorite(listing.id) ? '♥' : '♡'}</button><span className={`listing-type-badge ${getListingType(listing)}`}>{t(getListingType(listing) === 'rent' ? 'forRent' : 'forSale')}</span></div><div className="listing-card-body"><div className="listing-meta"><span>{t(`categories.${listing.category}`)}</span><span>·</span><span>{formatListingTime(listing.time, i18n.language, t)}</span></div><h3>{listing.title}</h3><strong className="listing-price">{listing.price} <small>ብር</small></strong><p className="listing-location"><span>⌖</span>{listing.location}</p><Link className="details-button" to={`/listing/${listing.id}`}>{t('viewDetails')} <span>↗</span></Link><a className="call-seller-button" href={`tel:${CONTACT_PHONE}`} onClick={(event) => { if (!requireAuthenticatedSession(navigate, `${routeLocation.pathname}${routeLocation.search}${routeLocation.hash}`)) event.preventDefault() }}><span>☎</span>{t('callSeller')}</a></div></article>)}
          </div>
        </section>

        <section className="city-banner" id="how-it-works"><div><p className="section-kicker">{t('exploreEthiopia')}</p><h2>{t('findNearYou')}</h2><p>{t('citySubtitle')}</p></div><div className="city-list">{[{ name: 'Addis Ababa', label: t('addisAbaba') }, { name: 'Adama', label: t('adama') }].map((cityOption, index) => <button type="button" key={cityOption.name} onClick={() => setCity(cityOption.name)}><span>0{index + 1}</span>{cityOption.label}<b>↗</b></button>)}</div></section>
      </main>
      <nav className="mobile-nav" aria-label={t('mobileNav')}><a className="mobile-nav-item active" href="#top"><span>⌂</span>{t('home')}</a><a className="mobile-nav-item" href="#discover"><span>◈</span>{t('categoriesLabel')}</a><a className="mobile-post" href={CONTACT_TELEGRAM} target="_blank" rel="noreferrer" aria-label={t('sendSellerInfoTelegram')}>+</a><Link className="mobile-nav-item" to="/favorites"><span>♡</span>{t('saved')}</Link><Link className="mobile-nav-item" to="/profile"><span>◯</span>{t('profile')}</Link></nav>
      <SiteFooter />
    </div>
  )
}

export default App

