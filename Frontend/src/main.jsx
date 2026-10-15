import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import './i18n'
import './index.css'
import App from './App.jsx'
import ListingsPage from './pages/ListingsPage.jsx'
import ListingDetailPage from './pages/ListingDetailPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import InformationPage from './pages/InformationPage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import Seo from './components/Seo.jsx'
import { FavoritesProvider } from './favorites/FavoritesContext.jsx'
import { ToastProvider } from './components/ToastProvider.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider><BrowserRouter>
        <FavoritesProvider><Routes>
          <Route path="/" element={<App />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/favorites" element={<><Seo page="favorites" /><FavoritesPage /></>} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/admin" element={<><Seo page="admin" /><AdminPage /></>} />
          <Route path="/auth" element={<><Seo page="auth" /><AuthPage /></>} />
          <Route path="/profile" element={<><Seo page="profile" /><ProfilePage /></>} />
          <Route path="/about" element={<><Seo page="about" /><InformationPage pageKey="about" /></>} />
          <Route path="/services" element={<><Seo page="services" /><InformationPage pageKey="services" /></>} />
          <Route path="/vision" element={<><Seo page="vision" /><InformationPage pageKey="vision" /></>} />
          <Route path="/opportunities" element={<><Seo page="opportunities" /><InformationPage pageKey="opportunities" /></>} />
        </Routes></FavoritesProvider>
        </BrowserRouter></ToastProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
)
