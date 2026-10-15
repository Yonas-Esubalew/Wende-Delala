import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT_TELEGRAM } from '../data/contact'
import { useToast } from './ToastProvider'
import '../App.css'

const initialForm = { fullName: '', title: '', description: '', price: '', category: 'cars', location: 'Addis Ababa', phone: '', condition: 'used', extra: '', year: '', mileage: '', transmission: 'automatic', fuel: 'petrol', bodyType: 'SUV', listingType: 'sale', propertyType: 'apartment', bedrooms: '', bathrooms: '', area: '' }

export default function PublicListingModal({ open, onClose }) {
  const { t } = useTranslation()
  const showToast = useToast()
  const [form, setForm] = useState(initialForm)
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [sharing, setSharing] = useState(false)
  if (!open) return null

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const handleImages = (event) => {
    const selected = Array.from(event.target.files || []).slice(0, 5)
    previews.forEach((url) => URL.revokeObjectURL(url))
    setImages(selected)
    setPreviews(selected.map((file) => URL.createObjectURL(file)))
  }
  const close = () => {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setForm(initialForm)
    setImages([])
    setPreviews([])
    setSharing(false)
    onClose()
  }
  const submit = async (event) => {
    event.preventDefault()
    if (![form.fullName, form.title, form.description, form.location, form.phone].every((value) => String(value).trim())) {
      showToast(t('completeRequiredFields'), 'error')
      return
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      showToast(t('invalidPrice'), 'error')
      return
    }
    if (!images.length) {
      showToast(t('imagesRequired'), 'error')
      return
    }
    setSharing(true)
    const carDetails = form.category === 'cars'
      ? [[t('listingType'), t(form.listingType === 'rent' ? 'forRent' : 'forSale')], [t('modelYear'), form.year], [t('mileage'), form.mileage ? `${form.mileage} km` : ''], [t('transmission'), t(form.transmission)], [t('fuel'), t(form.fuel)], [t('bodyType'), form.bodyType]].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`)
      : []
    const propertyDetails = form.category === 'property'
      ? [[t('listingType'), t(form.listingType === 'rent' ? 'forRent' : 'forSale')], [t('propertyType'), t(form.propertyType)], [t('bedrooms'), form.bedrooms], [t('bathrooms'), form.bathrooms], [t('area'), form.area]].filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`)
      : []
    const message = [
      `${t('telegramSellerIntro')} → @kiyasma`,
      `${t('fullName')}: ${form.fullName}`,
      `${t('productName')}: ${form.title}`,
      `${t('categoryLabel')}: ${t(`categories.${form.category}`)}`,
      `${t('description')}: ${form.description}`,
      `${t('price')}: ${Number(form.price).toLocaleString()} ETB`,
      `${t('city')}: ${form.location}`,
      `${t('condition')}: ${form.condition === 'new' ? t('newItem') : t('usedItem')}`,
      `${t('phone')}: ${form.phone}`,
      ...carDetails,
      ...propertyDetails,
      form.extra ? `${t('productDetails')}: ${form.extra}` : '',
      t('telegramAttachImages'),
    ].filter(Boolean).join('\n')
    try {
      if (images.length && navigator.share && navigator.canShare?.({ files: images })) {
        await navigator.share({ title: t('sendProductToDelala'), text: message, files: images })
        showToast(t('telegramRequestReady'), 'info')
      } else {
        window.location.assign(`${CONTACT_TELEGRAM}?text=${encodeURIComponent(message)}`)
        showToast(t('telegramRequestReady'), 'info')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        showToast(t('requestFailed'), 'error')
        window.location.assign(`${CONTACT_TELEGRAM}?text=${encodeURIComponent(message)}`)
      }
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <section className="request-modal seller-modal" role="dialog" aria-modal="true" aria-labelledby="seller-request-title">
        <button className="modal-close" onClick={close} type="button" aria-label={t('close')}>×</button>
        <div className="modal-header"><span className="modal-icon seller-modal-icon">↗</span><div><p className="section-kicker">{t('privateRequestKicker')}</p><h2 id="seller-request-title">{t('sendProductToDelala')}</h2><p>{t('telegramSellerSubtitle')}</p></div></div>
        <form className="request-form" onSubmit={submit}>
          <label>{t('fullName')}<input name="fullName" value={form.fullName} onChange={update} required minLength="2" autoComplete="name" placeholder={t('fullNamePlaceholder')} /></label>
          <label>{t('productName')}<input name="title" value={form.title} onChange={update} required placeholder={t('productNamePlaceholder')} /></label>
          <label>{t('description')}<textarea name="description" value={form.description} onChange={update} required rows="4" placeholder={t('descriptionPlaceholder')} /></label>
          <div className="form-row">
            <label>{t('price')}<input name="price" value={form.price} onChange={update} required type="number" min="0" placeholder="0" /></label>
            <label>{t('categoryLabel')}<select name="category" value={form.category} onChange={update}><option value="cars">{t('categories.cars')}</option><option value="property">{t('categories.property')}</option><option value="phones">{t('categories.phones')}</option><option value="electronics">{t('categories.electronics')}</option><option value="furniture">{t('categories.furniture')}</option><option value="services">{t('categories.services')}</option></select></label>
          </div>
          <div className="form-row"><label>{t('city')}<input name="location" value={form.location} onChange={update} required /></label><label>{t('phone')}<input name="phone" value={form.phone} onChange={update} required type="tel" placeholder="09__ ___ ____" /></label></div>
          <label>{t('condition')}<select name="condition" value={form.condition} onChange={update}><option value="new">{t('newItem')}</option><option value="used">{t('usedItem')}</option></select></label>
          {form.category === 'cars' && <div className="attribute-panel"><p className="section-kicker">{t('vehicleDetails')}</p><div className="form-row"><label>{t('listingType')}<select name="listingType" value={form.listingType} onChange={update}><option value="sale">{t('forSale')}</option><option value="rent">{t('forRent')}</option></select></label><label>{t('modelYear')}<input name="year" value={form.year} onChange={update} type="number" min="1950" max="2035" /></label></div><div className="form-row"><label>{t('mileage')}<input name="mileage" value={form.mileage} onChange={update} type="number" min="0" /></label><label>{t('transmission')}<select name="transmission" value={form.transmission} onChange={update}><option value="automatic">{t('automatic')}</option><option value="manual">{t('manual')}</option></select></label></div><div className="form-row"><label>{t('fuel')}<select name="fuel" value={form.fuel} onChange={update}><option value="petrol">{t('petrol')}</option><option value="diesel">{t('diesel')}</option><option value="hybrid">{t('hybrid')}</option><option value="electric">{t('electric')}</option></select></label><label>{t('bodyType')}<select name="bodyType" value={form.bodyType} onChange={update}><option value="SUV">{t('suv')}</option><option value="Sedan">{t('sedan')}</option><option value="Hatchback">{t('hatchback')}</option><option value="Pickup">{t('pickup')}</option><option value="Minibus">{t('minibus')}</option><option value="Truck">{t('truck')}</option></select></label></div></div>}
          {form.category === 'property' && <div className="attribute-panel"><p className="section-kicker">{t('propertyDetails')}</p><div className="form-row"><label>{t('listingType')}<select name="listingType" value={form.listingType} onChange={update}><option value="sale">{t('forSale')}</option><option value="rent">{t('forRent')}</option></select></label><label>{t('propertyType')}<select name="propertyType" value={form.propertyType} onChange={update}><option value="apartment">{t('apartment')}</option><option value="villa">{t('villa')}</option><option value="land">{t('land')}</option><option value="office">{t('office')}</option></select></label></div><div className="form-row"><label>{t('bedrooms')}<input name="bedrooms" value={form.bedrooms} onChange={update} type="number" min="0" /></label><label>{t('bathrooms')}<input name="bathrooms" value={form.bathrooms} onChange={update} type="number" min="0" /></label></div><label>{t('area')}<input name="area" value={form.area} onChange={update} type="number" min="0" /></label></div>}
          <label>{t('productDetails')}<textarea name="extra" value={form.extra} onChange={update} rows="3" placeholder={t('telegramDetailsPlaceholder')} /></label>
          <label className="upload-label">{t('productImages')}<span className="upload-box"><input type="file" accept="image/*" multiple required={images.length === 0} onChange={handleImages} /><strong>+</strong><span>{t('uploadImages')}<small>{t('upToFive')}</small></span></span></label>
          {previews.length > 0 && <div className="upload-previews admin-previews">{previews.map((preview, index) => <img src={preview} alt={`${t('productImages')} ${index + 1}`} key={preview} />)}</div>}
          <div className="private-note"><span>↗</span>{t('telegramAttachImages')}</div>
          <button className="request-submit" type="submit" disabled={sharing}>{sharing ? t('publishing') : t('continueToTelegram')} <span>↗</span></button>
        </form>
      </section>
    </div>
  )
}
