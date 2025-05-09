import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { useProfile } from '../context/ProfileContext';
import { MagnifyingGlassIcon, XMarkIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { selectedProfile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Paleta gamer
  const neon = '#39ff14';
  const darkBg = 'rgba(10,15,13,0.92)';
  const lightBg = 'rgba(255,255,255,0.92)';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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
        className="shadow-md transition-colors duration-500 w-full z-50 bg-white dark:bg-[#181c1a] border-b-2 border-[#39ff14]22 dark:border-[#39ff14]44"
        style={{
          minHeight: 64,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span
                  className="font-extrabold text-4xl tracking-widest glitch-navbar neon-glow-navbar"
                  data-text="GamerHub"
                  style={{ color: neon }}
                >
                  GamerHub
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 neon-glow-navbar"
                style={{ color: neon }}
                aria-label="Cambiar tema"
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
                    className="flex items-center gap-2 p-2 rounded-lg transition-colors neon-btn-navbar hover:bg-gray-200 dark:hover:bg-gray-800"
                    style={{ color: neon }}
                  >
                    <span>{user.name}</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181c1a] border border-[#39ff14]22 dark:border-[#39ff14]44 rounded-lg shadow-lg py-1 z-50 flex flex-col transition-colors">
                      {hasRole('admin') && (
                        <>
                          <Link
                            to="/admin/users"
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-[#39ff14] neon-btn-navbar transition-colors"
                          >
                            Admin Users
                          </Link>
                          <Link
                            to="/admin/games"
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-[#39ff14] neon-btn-navbar transition-colors"
                          >
                            Admin Juegos
                          </Link>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const res = await fetch(`${import.meta.env.VITE_API_URL}/profiles/export/watchlist-report`, {
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
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-[#39ff14] neon-btn-navbar transition-colors"
                          >
                            Descargar reporte de uso (CSV)
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleProfileChange}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-[#39ff14] neon-btn-navbar transition-colors"
                      >
                        Cambiar perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-[#e0ffe0] dark:hover:bg-[#232323] text-[#39ff14] neon-btn-navbar transition-colors"
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
      
      {/* Barra de Watchlist */}
      {selectedProfile && 
        location.pathname.includes('/catalog') &&
        !location.pathname.includes('/profiles') && 
        !location.pathname.includes('/watchlist') && 
        !location.pathname.includes('/login') && 
        !location.pathname.includes('/register') && 
        !location.pathname.includes('/admin') && (
        <div className="w-full bg-slate-800 border-b border-slate-700 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end">
              <Link
                to={`/watchlist/${selectedProfile._id}`}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Ver mi Watchlist
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Animaciones y efectos personalizados */}
      <style>{`
        .glitch-navbar {
          position: relative;
        }
        .glitch-navbar:before, .glitch-navbar:after {
          content: attr(data-text);
          position: absolute;
          left: 0; width: 100%;
          overflow: hidden;
          color: #fff;
          opacity: 0.7;
          z-index: 1;
        }
        .glitch-navbar:before {
          text-shadow: 2px 0 #00fff7;
          animation: glitch-anim-navbar 2s infinite linear alternate-reverse;
          top: 1px;
        }
        .glitch-navbar:after {
          text-shadow: -2px 0 #ff00ea;
          animation: glitch-anim2-navbar 2.2s infinite linear alternate-reverse;
          top: -1px;
        }
        @keyframes glitch-anim-navbar {
          0% { clip-path: inset(0 0 80% 0); }
          20% { clip-path: inset(0 0 60% 0); }
          40% { clip-path: inset(0 0 40% 0); }
          60% { clip-path: inset(0 0 20% 0); }
          80% { clip-path: inset(0 0 60% 0); }
          100% { clip-path: inset(0 0 80% 0); }
        }
        @keyframes glitch-anim2-navbar {
          0% { clip-path: inset(80% 0 0 0); }
          20% { clip-path: inset(60% 0 0 0); }
          40% { clip-path: inset(40% 0 0 0); }
          60% { clip-path: inset(20% 0 0 0); }
          80% { clip-path: inset(60% 0 0 0); }
          100% { clip-path: inset(80% 0 0 0); }
        }
        .neon-glow-navbar {
          filter: drop-shadow(0 0 8px #39ff14) drop-shadow(0 0 16px #39ff14);
        }
        .neon-btn-navbar {
          transition: color 0.2s, background 0.2s;
        }
        .neon-btn-navbar:hover {
          color: #181c1a !important;
          background: #39ff14 !important;
        }
      `}</style>
    </>
  );
}