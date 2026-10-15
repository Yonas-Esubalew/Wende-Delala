import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
import { FavoritesProvider } from './favorites/FavoritesContext.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <FavoritesProvider><Routes>
          <Route path="/" element={<App />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<InformationPage pageKey="about" />} />
          <Route path="/services" element={<InformationPage pageKey="services" />} />
          <Route path="/vision" element={<InformationPage pageKey="vision" />} />
          <Route path="/opportunities" element={<InformationPage pageKey="opportunities" />} />
        </Routes></FavoritesProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
