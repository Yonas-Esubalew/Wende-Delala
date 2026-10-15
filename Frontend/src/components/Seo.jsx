import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const SITE_URL = 'https://wende-delala.vercel.app'
const BRAND = 'Wende Delala'
const SOCIAL_IMAGE = `${SITE_URL}/cbe-evening.webp`

const pageCopy = {
  home: {
    en: {
      title: 'Wende Delala (Bet Delala) | Homes & Cars in Ethiopia',
      description: 'Find homes and cars for sale or rent in Addis Ababa and Adama. Browse local property, vehicles and more on Wende Delala, Ethiopia’s marketplace.',
    },
    am: {
      title: 'ወንዴ ደላላ (Bet Delala) | ቤቶችና መኪናዎች በኢትዮጵያ',
      description: 'በአዲስ አበባና በአዳማ ለሽያጭ እና ለኪራይ ቤቶችን፣ መኪናዎችን እና ሌሎች ንብረቶችን በወንዴ ደላላ ያግኙ።',
    },
  },
  listings: {
    en: { title: 'Homes, Cars & Property Listings in Ethiopia | Wende Delala', description: 'Browse homes, cars and local marketplace listings for sale or rent in Addis Ababa, Adama and across Ethiopia.' },
    am: { title: 'የቤት፣ የመኪና እና የንብረት ማስታወቂያዎች | ወንዴ ደላላ', description: 'በአዲስ አበባ፣ በአዳማ እና በመላው ኢትዮጵያ ለሽያጭ ወይም ለኪራይ የቀረቡ ቤቶችን፣ መኪናዎችን እና ንብረቶችን ይመልከቱ።' },
  },
  listing: {
    en: { title: 'Property & Car Listing in Ethiopia | Wende Delala', description: 'View details, photos and seller contact information for this home, vehicle or local marketplace listing in Ethiopia.' },
    am: { title: 'የንብረት እና የመኪና ማስታወቂያ | ወንዴ ደላላ', description: 'በኢትዮጵያ ያለውን የቤት፣ የመኪና ወይም የንብረት ዝርዝር፣ ፎቶዎች እና የሻጭ መገኛ መረጃ ይመልከቱ።' },
  },
  about: {
    en: { title: 'About Wende Delala (Bet Delala) | Ethiopia Marketplace', description: 'Learn about Wende Delala, a local marketplace helping people in Ethiopia discover homes, vehicles and useful services.' },
    am: { title: 'ስለ ወንዴ ደላላ | የኢትዮጵያ የአካባቢ ገበያ', description: 'ወንዴ ደላላ በኢትዮጵያ ቤቶችን፣ መኪናዎችን እና አገልግሎቶችን ለማግኘት የሚያግዝ የአካባቢ ገበያ ነው።' },
  },
  services: {
    en: { title: 'Marketplace Services | Wende Delala Ethiopia', description: 'Explore Wende Delala services for discovering, promoting and connecting around local property and vehicle listings in Ethiopia.' },
    am: { title: 'የገበያ አገልግሎቶች | ወንዴ ደላላ', description: 'በወንዴ ደላላ የአካባቢ ቤቶችንና መኪናዎችን ለማግኘት፣ ለማስተዋወቅ እና ከሻጮች ጋር ለመገናኘት የሚያገለግሉ አማራጮችን ይመልከቱ።' },
  },
  vision: {
    en: { title: 'Our Vision for Ethiopia | Wende Delala', description: 'Read Wende Delala’s vision for a clearer, more accessible local marketplace for homes, cars and services in Ethiopia.' },
    am: { title: 'ራዕያችን | ወንዴ ደላላ', description: 'ለቤቶች፣ ለመኪናዎች እና ለአገልግሎቶች ግልጽና ተደራሽ የኢትዮጵያ የአካባቢ ገበያ ለመፍጠር ያለንን ራዕይ ያንብቡ።' },
  },
  opportunities: {
    en: { title: 'Opportunities | Wende Delala Ethiopia', description: 'Discover opportunities to connect with local buyers, sellers and businesses through Wende Delala in Ethiopia.' },
    am: { title: 'እድሎች | ወንዴ ደላላ ኢትዮጵያ', description: 'በወንዴ ደላላ ከአካባቢ ገዢዎች፣ ሻጮች እና ንግዶች ጋር የሚያገናኙ እድሎችን ያግኙ።' },
  },
  auth: {
    en: { title: 'Sign In or Register | Wende Delala', description: 'Sign in or create an account to save listings and connect with the Wende Delala marketplace.' },
    am: { title: 'ግባ ወይም ይመዝገቡ | ወንዴ ደላላ', description: 'ማስታወቂያዎችን ለማስቀመጥና ከወንዴ ደላላ ገበያ ጋር ለመገናኘት ይግቡ ወይም መለያ ይፍጠሩ።' },
  },
  profile: {
    en: { title: 'Your Account | Wende Delala', description: 'Manage your Wende Delala account.' },
    am: { title: 'መለያዎ | ወንዴ ደላላ', description: 'የወንዴ ደላላ መለያዎን ያስተዳድሩ።' },
  },
  favorites: {
    en: { title: 'Saved Listings | Wende Delala', description: 'Review listings saved to your Wende Delala account.' },
    am: { title: 'የተቀመጡ ማስታወቂያዎች | ወንዴ ደላላ', description: 'በወንዴ ደላላ መለያዎ ያስቀመጧቸውን ማስታወቂያዎች ይመልከቱ።' },
  },
  admin: {
    en: { title: 'Admin Dashboard | Wende Delala', description: 'Manage marketplace listings.' },
    am: { title: 'የአስተዳዳሪ ገጽ | ወንዴ ደላላ', description: 'የገበያ ማስታወቂያዎችን ያስተዳድሩ።' },
  },
}

const privatePages = new Set(['admin', 'auth', 'profile', 'favorites'])

function getSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND,
        alternateName: ['Bet Delala', 'Delala'],
        url: SITE_URL,
        logo: `${SITE_URL}/wende-delala-logo-transparent.png`,
        description: 'An Ethiopian marketplace for homes, cars, property and local services.',
        areaServed: { '@type': 'Country', name: 'Ethiopia' },
        contactPoint: { '@type': 'ContactPoint', telephone: '+251918046641', contactType: 'customer support', areaServed: 'ET' },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND,
        alternateName: ['Bet Delala', 'Delala'],
        url: SITE_URL,
        inLanguage: ['am-ET', 'en'],
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  }
}

export default function Seo({ page = 'home', listing }) {
  const { i18n } = useTranslation()
  const location = useLocation()
  const language = i18n.language?.startsWith('am') ? 'am' : 'en'
  const canonicalPath = listing?.id ? `/listing/${encodeURIComponent(listing.id)}` : location.pathname
  const canonical = new URL(canonicalPath, SITE_URL)
  canonical.searchParams.set('lang', language)
  const canonicalUrl = canonical.toString()
  const englishUrl = new URL(canonicalPath, SITE_URL)
  englishUrl.searchParams.set('lang', 'en')
  const amharicUrl = new URL(canonicalPath, SITE_URL)
  amharicUrl.searchParams.set('lang', 'am')
  const copy = page === 'listing' && listing
    ? {
        title: `${listing.title} | ${language === 'am' ? 'ወንዴ ደላላ' : BRAND}`,
        description: `${listing.title} — ${Number(listing.price).toLocaleString()} ETB, ${listing.location}. ${language === 'am' ? 'በወንዴ ደላላ ዝርዝሩን ይመልከቱ።' : 'View this local listing on Wende Delala, Ethiopia.'}`,
      }
    : (pageCopy[page] || pageCopy.home)[language]
  const title = copy.title
  const description = copy.description
  const image = listing?.image
    ? new URL(listing.image, SITE_URL).toString()
    : SOCIAL_IMAGE
  const noIndex = privatePages.has(page)
  const structuredData = page === 'home' ? getSiteStructuredData() : null
  const locale = language === 'am' ? 'am_ET' : 'en_US'

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={englishUrl.toString()} />
      <link rel="alternate" hrefLang="am-ET" href={amharicUrl.toString()} />
      <link rel="alternate" hrefLang="x-default" href={amharicUrl.toString()} />
      <meta property="og:type" content={page === 'listing' ? 'product' : 'website'} />
      <meta property="og:site_name" content={`${BRAND} | Bet Delala`} />
      <meta property="og:locale" content={locale} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {structuredData && <script type="application/ld+json">{JSON.stringify(structuredData)}</script>}
    </Helmet>
  )
}
