import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import { ProfileProvider } from './context/ProfileContext';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Profiles from './pages/Profiles';
import Watchlist from './components/Watchlist';
import { DEMO_MODE } from './config/api';
import { FavoritesProvider } from './context/FavoritesContext';

const GameCatalog = lazy(() => import('./components/GameCatalog'));
const GameDetailsPage = lazy(() => import('./pages/GameDetailsPage'));
const UserSettingsPage = lazy(() => import('./pages/UserSettingsPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminGamesPage = lazy(() => import('./pages/AdminGamesPage'));

function DemoNotice() {
  const { expiresAt } = useAuth();
  const expiry = expiresAt ? new Date(expiresAt) : null;
  return (
    <p className="bg-[#203225] px-4 py-3 text-center text-sm text-[#eef6e6]" role="status">
      Demo pública · usa datos ficticios.
      {expiry && Number.isFinite(expiry.getTime())
        ? <> Tu sesión termina a las <time dateTime={expiresAt}>{expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>.</>
        : ' Cada sesión dura una hora.'}
    </p>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
        <Router>
          <FavoritesProvider>
          <a href="#main-content" className="skip-link">Saltar al contenido</a>
          <Navbar />
          {DEMO_MODE && <DemoNotice />}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss pauseOnHover theme="colored" />
          <main id="main-content" tabIndex={-1} className="flex-1 w-full min-w-0 flex flex-col p-0 m-0">
            <Suspense fallback={<p role="status" className="p-8 text-center">Cargando sección…</p>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={DEMO_MODE ? <Navigate to="/login" replace /> : <RegisterPage />} />
              <Route
                path="/catalog"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <GameCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/games/:id"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <GameDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist/:profileId"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <Watchlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profiles"
                element={
                  <ProtectedRoute>
                    <Profiles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/catalog/:profileId"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <GameCatalog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/settings"
                element={
                  <ProtectedRoute requiredRole="profile">
                    <UserSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/games"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminGamesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
          </FavoritesProvider>
        </Router>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
