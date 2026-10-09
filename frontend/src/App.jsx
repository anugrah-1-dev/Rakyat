import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import PublicAspirationPage from './pages/PublicAspirationPage';
import AspirationDetailPage from './pages/AspirationDetailPage';
import AboutPage from './pages/AboutPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAspirationPage from './pages/AdminAspirationPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/aspirasi" element={<PublicAspirationPage />} />
        <Route path="/aspirasi/:id" element={<AspirationDetailPage />} />
        <Route path="/tentang" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="aspirasi" element={<AdminAspirationPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
