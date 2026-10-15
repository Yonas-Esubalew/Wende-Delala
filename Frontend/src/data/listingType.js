export function getListingType(listing) {
  const explicitType = listing?.attributes?.listingType || listing?.listingType
  if (explicitType === 'rent' || explicitType === 'sale') return explicitType

  const listingText = `${listing?.title || ''} ${listing?.description || ''}`
  return /\b(rent|rental|lease|hire)\b/i.test(listingText) ? 'rent' : 'sale'
}

export function formatListingTime(value, language, t) {
  if (!value || language !== 'am') return value || ''
  if (value === 'Today') return t('today')
  if (value === 'Yesterday') return t('yesterday')

  const hours = value.match(/^(\d+) hours? ago$/i)
  if (hours) return t('hoursAgo', { count: Number(hours[1]) })

  const days = value.match(/^(\d+) days? ago$/i)
  if (days) return t('daysAgo', { count: Number(days[1]) })

  return value
}
