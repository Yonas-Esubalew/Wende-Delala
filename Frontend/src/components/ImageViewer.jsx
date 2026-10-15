import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const ImageViewerContext = createContext(null)

export function ImageViewerProvider({ children }) {
  const { t } = useTranslation()
  const [viewer, setViewer] = useState(null)
  const [zoom, setZoom] = useState(1)

  const openViewer = useCallback((images, initialIndex = 0, alt = '') => {
    const validImages = (Array.isArray(images) ? images : [images]).filter(Boolean)
    if (!validImages.length) return
    setZoom(1)
    setViewer({ images: validImages, index: Math.min(Math.max(initialIndex, 0), validImages.length - 1), alt })
  }, [])
  const closeViewer = useCallback(() => setViewer(null), [])
  const moveViewer = useCallback((direction) => setViewer((current) => current && ({
    ...current,
    index: (current.index + direction + current.images.length) % current.images.length,
  })), [])

  useEffect(() => {
    if (!viewer) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeViewer()
      if (event.key === 'ArrowLeft') moveViewer(-1)
      if (event.key === 'ArrowRight') moveViewer(1)
      if (event.key === '+' || event.key === '=') setZoom((value) => Math.min(3.5, value + 0.25))
      if (event.key === '-') setZoom((value) => Math.max(1, value - 0.25))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [viewer, closeViewer, moveViewer])

  const value = useMemo(() => ({ openViewer }), [openViewer])
  return (
    <ImageViewerContext.Provider value={value}>
      {children}
      {viewer && <div className="image-viewer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeViewer()}>
        <section className="image-viewer" role="dialog" aria-modal="true" aria-label={t('photoViewer')}>
          <header className="image-viewer-toolbar">
            <span>{viewer.index + 1} / {viewer.images.length}</span>
            <div className="image-viewer-controls">
              <button type="button" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} aria-label={t('zoomOut')} disabled={zoom <= 1}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(3.5, value + 0.25))} aria-label={t('zoomIn')} disabled={zoom >= 3.5}>+</button>
              <button type="button" onClick={() => setZoom(1)} aria-label={t('resetZoom')}>{t('resetZoom')}</button>
              <button className="image-viewer-close" type="button" onClick={closeViewer} aria-label={t('close')}>×</button>
            </div>
          </header>
          <div className="image-viewer-stage" onWheel={(event) => {
            event.preventDefault()
            setZoom((value) => Math.min(3.5, Math.max(1, value + (event.deltaY < 0 ? 0.15 : -0.15))))
          }}>
            <img src={viewer.images[viewer.index]} alt={viewer.alt} draggable="false" style={{ transform: `scale(${zoom})` }} />
            {viewer.images.length > 1 && <>
              <button className="image-viewer-arrow previous" type="button" onClick={() => moveViewer(-1)} aria-label={t('previousPhoto')}>‹</button>
              <button className="image-viewer-arrow next" type="button" onClick={() => moveViewer(1)} aria-label={t('nextPhoto')}>›</button>
            </>}
          </div>
          {viewer.images.length > 1 && <div className="image-viewer-thumbnails">{viewer.images.map((image, index) => <button className={index === viewer.index ? 'active' : ''} type="button" key={`${image}-${index}`} onClick={() => { setViewer((current) => ({ ...current, index })); setZoom(1) }} aria-label={`${t('photo')} ${index + 1}`}><img src={image} alt="" /></button>)}</div>}
        </section>
      </div>}
    </ImageViewerContext.Provider>
  )
}

export function ImageZoomTrigger({ src, images, alt, className = '', loading }) {
  const context = useContext(ImageViewerContext)
  const { t } = useTranslation()
  if (!context) throw new Error('ImageZoomTrigger must be used inside ImageViewerProvider')
  const photos = images?.length ? images : [src]
  const initialIndex = Math.max(0, photos.indexOf(src))
  return <button className={`image-zoom-trigger ${className}`} type="button" onClick={() => context.openViewer(photos, initialIndex, alt)} aria-label={`${t('zoomPhoto')}: ${alt}`}><img src={src} alt={alt} loading={loading} /><span className="image-zoom-hint" aria-hidden="true">⌕</span></button>
}
