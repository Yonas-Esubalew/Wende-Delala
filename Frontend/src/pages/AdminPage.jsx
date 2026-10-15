import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createAdminListing, deleteAdminListing, fetchAdminListings, setAdminListingStatus, updateAdminListing, uploadAdminImages } from '../api/admin'
import { friendlyErrorMessage } from '../api/friendlyError'
import { isAdminSession } from '../auth/session'
import AccountActions from '../components/AccountActions'
import { useToast } from '../components/ToastProvider'
import SiteFooter from '../components/SiteFooter'
import '../App.css'

const initialForm = { title: '', description: '', price: '', category: 'cars', location: 'Bole, Addis Ababa', phone: '', condition: 'used', promotionTier: 'standard', priority: '0', year: '', mileage: '', transmission: 'automatic', fuel: 'petrol', bodyType: 'SUV', listingType: 'sale', propertyType: 'apartment', bedrooms: '', bathrooms: '', area: '', brand: '', model: '', storage: '', warranty: '', material: '', dimensions: '', serviceArea: '', availability: '' }

function AdminPage() {
  const { t, i18n } = useTranslation()
  const showToast = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initialForm)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [editing, setEditing] = useState(null)
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryCategory, setInventoryCategory] = useState('all')
  const [inventoryStatus, setInventoryStatus] = useState('all')
  const [inventoryTier, setInventoryTier] = useState('all')
  const [inventorySort, setInventorySort] = useState('priority')
  const [status, setStatus] = useState('idle')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const isAdmin = isAdminSession()
  const { data: listings = [], isLoading, isError, isFetching, error: listingsError, refetch } = useQuery({
    queryKey: ['admin-listings'],
    queryFn: fetchAdminListings,
    enabled: isAdmin,
    retry: (failureCount, requestError) => ![401, 403].includes(requestError.response?.status) && failureCount < 2,
    retryDelay: (attempt) => Math.min(1_000 * (attempt + 1), 3_000),
  })
  const visibleListings = [...listings].filter((listing) => {
    const search = inventorySearch.trim().toLowerCase()
    return (!search || `${listing.title} ${listing.location} ${listing.phone}`.toLowerCase().includes(search))
      && (inventoryCategory === 'all' || listing.category === inventoryCategory)
      && (inventoryStatus === 'all' || listing.status === inventoryStatus)
      && (inventoryTier === 'all' || (listing.promotionTier || (listing.featured ? 'vip' : 'standard')) === inventoryTier)
  }).sort((left, right) => inventorySort === 'price-low' ? left.price - right.price
    : inventorySort === 'price-high' ? right.price - left.price
      : inventorySort === 'oldest' ? new Date(left.createdAt) - new Date(right.createdAt)
        : (right.priority || 0) - (left.priority || 0) || new Date(right.createdAt) - new Date(left.createdAt))

  useEffect(() => {
    const updateScrollState = () => setShowScrollTop(window.scrollY > 420)
    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  if (!isAdmin) return <Navigate to="/auth" replace state={{ from: '/admin' }} />

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const handleImages = (event) => { const selected = Array.from(event.target.files || []).slice(0, 5); setImages(selected); setPreviews(selected.map((file) => URL.createObjectURL(file))) }
  const resetForm = () => { setEditing(null); setForm(initialForm); setImages([]); setPreviews([]); setStatus('idle') }

  const editListing = (listing) => {
    const attributes = listing.attributes || {}
    setEditing(listing)
    setForm({ ...initialForm, title: listing.title, description: listing.description, price: String(listing.price), category: listing.category, location: listing.location, phone: listing.phone, condition: listing.condition || 'used', promotionTier: listing.promotionTier || (listing.featured ? 'vip' : 'standard'), priority: String(listing.priority || 0), ...attributes })
    setImages([])
    setPreviews(listing.images?.length ? listing.images : [listing.image])
    setStatus('idle')
    document.querySelector('#admin-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const changeStatus = async (listingId, nextStatus) => {
    try {
      await setAdminListingStatus(listingId, nextStatus)
      await queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({ queryKey: ['home-listings'] })
      showToast(t('adminStatusUpdated'), 'success')
    } catch (requestError) { showToast(friendlyErrorMessage(requestError, t, 'adminPublishError'), 'error') }
  }

  const removeListing = async (listingId) => {
    try {
      await deleteAdminListing(listingId)
      setConfirmDeleteId(null)
      await queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
      await queryClient.invalidateQueries({ queryKey: ['listings'] })
      await queryClient.invalidateQueries({ queryKey: ['home-listings'] })
      showToast(t('adminListingDeleted'), 'success')
    } catch (requestError) { showToast(friendlyErrorMessage(requestError, t, 'adminPublishError'), 'error') }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (![form.title, form.description, form.location, form.phone].every((value) => String(value).trim())) {
      showToast(t('completeRequiredFields'), 'error')
      return
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      showToast(t('invalidPrice'), 'error')
      return
    }
    setStatus('loading')
    try {
      let imagesForListing = editing?.images?.length ? editing.images : (editing?.image ? [editing.image] : [])
      if (images.length) imagesForListing = await uploadAdminImages(images)
      if (!imagesForListing.length) throw new Error(t('imagesRequired'))
      const attributes = form.category === 'cars'
        ? { year: form.year, mileage: form.mileage, transmission: form.transmission, fuel: form.fuel, bodyType: form.bodyType, listingType: form.listingType }
        : form.category === 'property'
          ? { listingType: form.listingType, propertyType: form.propertyType, bedrooms: form.bedrooms, bathrooms: form.bathrooms, area: form.area }
          : form.category === 'phones'
            ? { brand: form.brand, model: form.model, storage: form.storage, warranty: form.warranty }
            : form.category === 'electronics'
              ? { brand: form.brand, model: form.model, warranty: form.warranty }
              : form.category === 'furniture'
                ? { material: form.material, dimensions: form.dimensions }
                : form.category === 'services'
                  ? { serviceArea: form.serviceArea, availability: form.availability }
                  : {}
      const bulletLines = form.description.split('\n').map((line) => line.replace(/^\s*\d+[.)-]?\s*/, '').trim()).filter(Boolean)
      const attributeLines = form.category === 'cars'
        ? [[t('modelYear'), form.year], [t('mileage'), form.mileage ? `${form.mileage} km` : ''], [t('transmission'), t(form.transmission)], [t('fuel'), t(form.fuel)], [t('bodyType'), form.bodyType]]
        : form.category === 'property'
          ? [[t('propertyType'), t(form.propertyType)], [t('bedrooms'), form.bedrooms], [t('bathrooms'), form.bathrooms], [t('area'), form.area ? `${form.area} m²` : ''], [t('listingType'), t(form.listingType === 'rent' ? 'forRent' : 'forSale')]]
          : form.category === 'phones' || form.category === 'electronics'
            ? [[t('brand'), form.brand], [t('model'), form.model], [t('storage'), form.storage], [t('warranty'), form.warranty]]
            : form.category === 'furniture'
              ? [[t('material'), form.material], [t('dimensions'), form.dimensions]]
              : form.category === 'services'
                ? [[t('serviceArea'), form.serviceArea], [t('availability'), form.availability]]
                : []
      const highlights = [...attributeLines.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`), ...bulletLines].slice(0, 8)
      const payload = { ...form, price: Number(form.price), priority: Number(form.priority), image: imagesForListing[0], images: imagesForListing, attributes, highlights }
      if (editing) await updateAdminListing(editing.id, payload)
      else await createAdminListing(payload)
      resetForm()
      setStatus('success')
      showToast(t(editing ? 'adminListingUpdated' : 'adminListingCreated'), 'success')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['home-listings'] }),
      ])
    } catch (requestError) {
      setStatus('error')
      showToast(requestError.message === t('imagesRequired') ? t('imagesRequired') : friendlyErrorMessage(requestError, t, 'adminPublishError'), 'error')
    }
  }

  return <div className="marketplace-shell admin-page"><header className="site-header"><div className="header-inner"><Link className="brand" to="/" aria-label={t('brand')}><span className="brand-mark">ደ</span><span><strong>ደላላ</strong><small>DE LALA</small></span></Link><Link className="admin-back-home" to="/" aria-label={t('backHome')} title={t('backHome')}>← <span>{t('backHome')}</span></Link><div className="header-actions"><button className="language-button" onClick={() => i18n.changeLanguage(i18n.language === 'am' ? 'en' : 'am')} type="button">{i18n.language === 'am' ? 'አማ | EN' : 'EN | አማ'}</button><AccountActions /></div></div></header>
    <main className="admin-main"><div className="admin-heading"><div><p className="section-kicker">{t('adminKicker')}</p><h1>{t('adminTitle')}</h1><p>{t('adminSubtitle')}</p></div><span className="admin-status"><i /> {t('adminLive')}</span></div>
      <section className="admin-dashboard-panel"><div className="admin-dashboard-heading"><div><p className="section-kicker">{t('adminInventory')}</p><h2>{t('manageListings')}</h2></div><div className="admin-stats"><strong>{listings.length}</strong><span>{t('totalListings')}</span></div><div className="admin-stats"><strong>{listings.filter((listing) => listing.status === 'active').length}</strong><span>{t('statusActive')}</span></div><div className="admin-stats"><strong>{listings.filter((listing) => listing.status === 'sold').length}</strong><span>{t('statusSold')}</span></div><button className="admin-new-button" onClick={() => { resetForm(); document.querySelector('#admin-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }} type="button">+ {t('postAd')}</button></div>
        <div className="inventory-toolbar"><input value={inventorySearch} onChange={(event) => setInventorySearch(event.target.value)} placeholder={t('adminSearchListings')} aria-label={t('adminSearchListings')} /><select value={inventoryCategory} onChange={(event) => setInventoryCategory(event.target.value)} aria-label={t('categoryLabel')}><option value="all">{t('allCategories')}</option><option value="cars">{t('categories.cars')}</option><option value="property">{t('categories.property')}</option><option value="phones">{t('categories.phones')}</option><option value="electronics">{t('categories.electronics')}</option><option value="furniture">{t('categories.furniture')}</option><option value="services">{t('categories.services')}</option></select><select value={inventoryStatus} onChange={(event) => setInventoryStatus(event.target.value)} aria-label={t('status')}><option value="all">{t('allStatuses')}</option><option value="active">{t('statusActive')}</option><option value="sold">{t('statusSold')}</option><option value="pending">{t('statusPending')}</option><option value="rejected">{t('statusRejected')}</option></select><select value={inventoryTier} onChange={(event) => setInventoryTier(event.target.value)} aria-label={t('promotionTier')}><option value="all">{t('allTiers')}</option><option value="standard">{t('tierStandard')}</option><option value="vip">{t('tierVip')}</option><option value="pro">{t('tierPro')}</option></select><select value={inventorySort} onChange={(event) => setInventorySort(event.target.value)} aria-label={t('sortBy')}><option value="priority">{t('sortPriority')}</option><option value="newest">{t('newest')}</option><option value="oldest">{t('oldest')}</option><option value="price-low">{t('priceLow')}</option><option value="price-high">{t('priceHigh')}</option></select></div>
        {isLoading && <div className="catalog-status">{t('loadingListings')}</div>}{isError && <div className="catalog-status error admin-load-error" role="alert"><strong>{t(listingsError?.response?.status === 401 ? 'adminSessionExpired' : listingsError?.response?.status === 403 ? 'adminAccessDenied' : 'adminListingsUnavailable', { defaultValue: t('listingsError') })}</strong><p>{t(listingsError?.response?.status === 401 ? 'adminSessionExpiredBody' : listingsError?.response?.status === 403 ? 'adminAccessDeniedBody' : 'adminListingsUnavailableBody', { defaultValue: t('listingsError') })}</p>{listingsError?.response?.status === 401 ? <Link className="catalog-retry-button" to="/auth" state={{ from: '/admin' }}>{t('login')}</Link> : <button className="catalog-retry-button" type="button" onClick={() => refetch()} disabled={isFetching}>{isFetching ? t('loadingListings') : t('retryListings', { defaultValue: 'Try again' })}</button>}</div>}
        {!isLoading && !isError && <><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{t('productName')}</th><th>{t('categoryLabel')}</th><th>{t('price')}</th><th>{t('city')}</th><th>{t('postedAt')}</th><th>{t('promotionTier')}</th><th>{t('status')}</th><th>{t('actions')}</th></tr></thead><tbody>{visibleListings.map((listing) => <tr key={listing.id}><td><div className="admin-product-cell"><img src={listing.image} alt="" /><div><strong>{listing.title}</strong><small>{listing.phone}</small></div></div></td><td>{t(`categories.${listing.category}`)}</td><td>{Number(listing.price).toLocaleString()} ብር</td><td>{listing.location}</td><td>{listing.createdAt ? new Date(listing.createdAt).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-GB') : '—'}</td><td><span className={`tier-chip tier-${listing.promotionTier || (listing.featured ? 'vip' : 'standard')}`}>{t(listing.promotionTier === 'pro' ? 'tierPro' : listing.promotionTier === 'vip' || listing.featured ? 'tierVip' : 'tierStandard')}</span><small className="priority-value">{t('priority')}: {listing.priority || 0}</small></td><td><select className={`status-select status-${listing.status}`} value={listing.status} onChange={(event) => changeStatus(listing.id, event.target.value)} aria-label={`${t('status')}: ${listing.title}`}><option value="active">{t('statusActive')}</option><option value="sold">{t('statusSold')}</option><option value="pending">{t('statusPending')}</option><option value="rejected">{t('statusRejected')}</option></select></td><td><div className="table-actions"><button onClick={() => editListing(listing)} type="button">{t('edit')}</button><button className="delete-action" onClick={() => setConfirmDeleteId(listing.id)} type="button">{t('delete')}</button></div></td></tr>)}</tbody></table></div><div className="admin-mobile-list">{visibleListings.map((listing) => <article className="admin-mobile-card" key={listing.id}><div className="admin-mobile-product"><img src={listing.image} alt="" /><div><strong>{listing.title}</strong><span>{t(`categories.${listing.category}`)} · {listing.location}</span><span>{Number(listing.price).toLocaleString()} ብር · {listing.phone}</span></div></div><div className="admin-mobile-meta"><span className={`tier-chip tier-${listing.promotionTier || (listing.featured ? 'vip' : 'standard')}`}>{t(listing.promotionTier === 'pro' ? 'tierPro' : listing.promotionTier === 'vip' || listing.featured ? 'tierVip' : 'tierStandard')}</span><small>{t('priority')}: {listing.priority || 0}</small>{listing.createdAt && <small>{new Date(listing.createdAt).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-GB')}</small>}</div><div className="admin-mobile-actions"><select className={`status-select status-${listing.status}`} value={listing.status} onChange={(event) => changeStatus(listing.id, event.target.value)} aria-label={`${t('status')}: ${listing.title}`}><option value="active">{t('statusActive')}</option><option value="sold">{t('statusSold')}</option><option value="pending">{t('statusPending')}</option><option value="rejected">{t('statusRejected')}</option></select><button onClick={() => editListing(listing)} type="button">{t('edit')}</button><button className="delete-action" onClick={() => setConfirmDeleteId(listing.id)} type="button">{t('delete')}</button></div></article>)}</div>{visibleListings.length === 0 && <p className="inventory-empty">{t('noInventoryResults')}</p>}</>}
      </section>
      <div className="admin-layout" id="admin-editor"><form className="admin-form" noValidate onSubmit={submit}><div className="admin-form-head"><span>✦</span><div><strong>{editing ? t('editListing') : t('adminNewListing')}</strong><p>{t('adminNewListingNote')}</p></div>{editing && <button className="clear-filters" onClick={resetForm} type="button">{t('cancelEdit')}</button>}</div>
        <Field label={t('productName')}><input name="title" value={form.title} onChange={update} required placeholder={t('productNamePlaceholder')} /></Field><Field label={t('description')}><textarea name="description" value={form.description} onChange={update} required rows="5" placeholder={t('adminDescriptionPlaceholder')} /></Field>
        <div className="admin-form-grid"><Field label={t('price')}><input name="price" value={form.price} onChange={update} required type="number" min="0" placeholder="0" /></Field><Field label={t('categoryLabel')}><select name="category" value={form.category} onChange={update}><option value="cars">{t('categories.cars')}</option><option value="property">{t('categories.property')}</option><option value="phones">{t('categories.phones')}</option><option value="electronics">{t('categories.electronics')}</option><option value="furniture">{t('categories.furniture')}</option><option value="services">{t('categories.services')}</option></select></Field><Field label={t('city')}><input name="location" value={form.location} onChange={update} required /></Field><Field label={t('condition')}><select name="condition" value={form.condition} onChange={update}><option value="new">{t('newItem')}</option><option value="used">{t('usedItem')}</option></select></Field></div>
        <div className="promotion-controls"><Field label={t('promotionTier')}><select name="promotionTier" value={form.promotionTier} onChange={update}><option value="standard">{t('tierStandard')}</option><option value="vip">{t('tierVip')}</option><option value="pro">{t('tierPro')}</option></select></Field><Field label={t('priority')}><input name="priority" value={form.priority} onChange={update} type="number" min="0" max="1000" /></Field><p>{t('promotionHelp')}</p></div>
        {form.category === 'cars' && <div className="attribute-panel"><p className="section-kicker">{t('vehicleDetails')}</p><div className="admin-form-grid"><Field label={t('listingType')}><select name="listingType" value={form.listingType || 'sale'} onChange={update}><option value="sale">{t('forSale')}</option><option value="rent">{t('forRent')}</option></select></Field><Field label={t('modelYear')}><input name="year" value={form.year || ''} onChange={update} type="number" min="1950" max="2030" /></Field><Field label={t('mileage')}><input name="mileage" value={form.mileage || ''} onChange={update} type="number" min="0" /></Field><Field label={t('transmission')}><select name="transmission" value={form.transmission || 'automatic'} onChange={update}><option value="automatic">{t('automatic')}</option><option value="manual">{t('manual')}</option></select></Field><Field label={t('fuel')}><select name="fuel" value={form.fuel || 'petrol'} onChange={update}><option value="petrol">{t('petrol')}</option><option value="diesel">{t('diesel')}</option><option value="hybrid">{t('hybrid')}</option><option value="electric">{t('electric')}</option></select></Field><Field label={t('bodyType')}><select name="bodyType" value={form.bodyType || 'SUV'} onChange={update}><option value="SUV">{t('suv')}</option><option value="Sedan">{t('sedan')}</option><option value="Hatchback">{t('hatchback')}</option><option value="Pickup">{t('pickup')}</option><option value="Minibus">{t('minibus')}</option><option value="Truck">{t('truck')}</option></select></Field></div></div>}
        {form.category === 'property' && <div className="attribute-panel"><p className="section-kicker">{t('propertyDetails')}</p><div className="admin-form-grid"><Field label={t('listingType')}><select name="listingType" value={form.listingType || 'sale'} onChange={update}><option value="sale">{t('forSale')}</option><option value="rent">{t('forRent')}</option></select></Field><Field label={t('propertyType')}><select name="propertyType" value={form.propertyType || 'apartment'} onChange={update}><option value="apartment">{t('apartment')}</option><option value="villa">{t('villa')}</option><option value="land">{t('land')}</option><option value="office">{t('office')}</option></select></Field><Field label={t('bedrooms')}><input name="bedrooms" value={form.bedrooms || ''} onChange={update} type="number" min="0" /></Field><Field label={t('bathrooms')}><input name="bathrooms" value={form.bathrooms || ''} onChange={update} type="number" min="0" /></Field><Field label={t('area')}><input name="area" value={form.area || ''} onChange={update} type="number" min="0" /></Field></div></div>}
        {(form.category === 'phones' || form.category === 'electronics' || form.category === 'furniture' || form.category === 'services') && <div className="attribute-panel"><p className="section-kicker">{t('productSpecifications')}</p><div className="admin-form-grid">{(form.category === 'phones' ? ['brand', 'model', 'storage', 'warranty'] : form.category === 'electronics' ? ['brand', 'model', 'warranty'] : form.category === 'furniture' ? ['material', 'dimensions'] : ['serviceArea', 'availability']).map((name) => <Field key={name} label={t(name)}><input name={name} value={form[name] || ''} onChange={update} /></Field>)}</div></div>}<div className="admin-form-grid"><Field label={t('phone')}><input name="phone" value={form.phone} onChange={update} required placeholder="09__ ___ ____" /></Field><label className="upload-label">{t('productImages')}<span className="upload-box"><input type="file" accept="image/*" multiple onChange={handleImages} /><strong>+</strong><span>{t('uploadImages')}<small>{t('upToFive')}</small></span></span></label></div>{previews.length > 0 && <div className="upload-previews admin-previews">{previews.map((preview) => <img src={preview} alt={t('productImages')} key={preview} />)}</div>}
        <button className="admin-submit" disabled={status === 'loading'} type="submit">{status === 'loading' ? t('publishing') : editing ? t('saveChanges') : t('publishFeatured')} <span>↗</span></button>
      </form><aside className="admin-side"><div className="admin-preview"><p className="section-kicker">{t('adminWorkflow')}</p><h2>{t('adminWorkflowTitle')}</h2><ol><li>{t('adminStepOne')}</li><li>{t('adminStepTwo')}</li><li>{t('adminStepThree')}</li></ol></div></aside></div>
    </main>{confirmDeleteId && <div className="toast-confirm-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setConfirmDeleteId(null)}><section className="toast-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title"><h2 id="confirm-delete-title">{t('confirmDeleteTitle')}</h2><p>{t('confirmDeleteListing')}</p><div className="toast-confirm-actions"><button type="button" onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</button><button className="delete-action" type="button" onClick={() => removeListing(confirmDeleteId)}>{t('delete')}</button></div></section></div>}<SiteFooter />{showScrollTop && <button className="admin-scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} type="button" aria-label={t('scrollToTop')} title={t('scrollToTop')}><span aria-hidden="true">↑</span><span>{t('scrollToTop')}</span></button>}</div>
}

function Field({ label, children }) { return <div className="admin-field"><label>{label}{children}</label></div> }
export default AdminPage

