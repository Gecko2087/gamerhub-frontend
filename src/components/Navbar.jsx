import { useFavorites } from '../context/FavoritesContext';
import { API_URL } from '../config/api.js';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

const sectionLink = ({ isActive }) =>
  `inline-flex min-h-11 items-center gap-1.5 border-b-2 px-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-green-600 ${isActive
    ? 'border-green-600 text-green-900 dark:border-lime-300 dark:text-lime-200'
    : 'border-transparent text-slate-700 hover:text-green-800 dark:text-slate-200 dark:hover:text-lime-200'}`;

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { selectedProfile } = useProfile();
  const navigate = useNavigate();
  const { games, ready } = useFavorites();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Paleta gamer
  const neon = darkMode ? '#86efac' : '#166534';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileChange = () => {
    setProfileMenuOpen(false);
    navigate('/profiles');
  };

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="shadow-md transition-colors duration-500 w-full z-50 bg-white dark:bg-[#181c1a] border-b border-green-200 dark:border-green-900"
        onClick={event => { if (event.target.closest('a')) setProfileMenuOpen(false); }}
        style={{
          minHeight: 64,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex min-w-0 items-center gap-2">
              <Link to="/" aria-label="GamerHub — inicio" className="flex-shrink-0 flex items-center">
                <span
                  className="font-extrabold text-xl sm:text-3xl tracking-wide "
                  aria-hidden="true"
                  style={{ color: neon }}
                >
                  GamerHub
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: neon }}
                aria-label={darkMode ? "Activar tema claro" : "Activar tema oscuro"}
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
              {user && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    aria-expanded={profileMenuOpen}
                    aria-controls="account-links"
                    onKeyDown={event => { if (event.key === 'Escape') setProfileMenuOpen(false); }}
                    className="flex min-w-0 items-center gap-2 p-2 rounded-lg transition-colors neon-btn-navbar hover:bg-gray-200 dark:hover:bg-gray-800"
                    style={{ color: neon }}
                  >
                    <span className="max-w-16 sm:max-w-40 truncate">{user.name}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileMenuOpen && (
                    <div id="account-links" onKeyDown={event => { if (event.key === 'Escape') { setProfileMenuOpen(false); menuRef.current.querySelector('button').focus(); } }} className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#181c1a] border border-green-200 dark:border-green-900 rounded-lg shadow-lg py-1 z-50 flex flex-col transition-colors">
                      {hasRole('admin') && (
                        <>
                          <Link
                            to="/admin/users"
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-green-800 dark:text-green-200 neon-btn-navbar transition-colors"
                          >
                            Administrar usuarios
                          </Link>
                          <Link
                            to="/admin/games"
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-green-800 dark:text-green-200 neon-btn-navbar transition-colors"
                          >
                            Administrar juegos
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`${API_URL}/profiles/export/watchlist-report`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                if (!res.ok) throw new Error('No autorizado o error al exportar');
                                const blob = await res.blob();
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'reporte_watchlist.csv';
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                alert('No se pudo descargar el reporte: ' + (err.message || 'Error desconocido'));
                              }
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-green-800 dark:text-green-200 neon-btn-navbar transition-colors"
                          >
                            Descargar reporte de uso (CSV)
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleProfileChange}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-green-800 dark:text-green-200 neon-btn-navbar transition-colors"
                      >
                        Cambiar perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-green-800 dark:text-green-200 neon-btn-navbar transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {user && (
        <nav aria-label="Secciones de GamerHub" className="border-b border-green-200 bg-white dark:border-green-900 dark:bg-[#181c1a]">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-4 px-4 sm:px-6">
            <NavLink className={sectionLink} to="/profiles">Perfiles</NavLink>
            {selectedProfile && <>
              <NavLink className={sectionLink} to={`/catalog/${selectedProfile._id}`}>Catálogo</NavLink>
              <NavLink className={sectionLink} to={`/watchlist/${selectedProfile._id}`}>
                Favoritos {ready && <span className="rounded bg-green-200 px-1.5 text-xs tabular-nums text-green-950">{games.length}</span>}
              </NavLink>
            </>}
          </div>
        </nav>
      )}
    </>
  );
}
