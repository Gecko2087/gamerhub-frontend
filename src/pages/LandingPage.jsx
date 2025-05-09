import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Paleta gamer
  const neon = '#39ff14';
  const darkBg = '#0a0f0d';
  const cardBg = darkMode ? 'rgba(20,24,22,0.98)' : '#181c1aee';
  const cardBgLight = '#fff';
  const textColor = darkMode ? '#e0ffe0' : '#181c1a';
  const borderColor = neon;

  useEffect(() => {
    if (user) {
      navigate('/profiles');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden transition-colors duration-500" style={{ background: darkMode ? `radial-gradient(ellipse at 50% 30%, #1a1f1d 60%, #0a0f0d 100%)` : `radial-gradient(ellipse at 50% 30%, #e0ffe0 60%, #baffba 100%)` }}>
      {/* Fondo partículas */}
      <div className="absolute inset-0 z-0 pointer-events-none max-h-screen overflow-hidden">
        <svg width="100%" height="100%" className="w-full h-full max-h-screen">
          <circle cx="10%" cy="90%" r="2.5" fill={neon} opacity="0.3">
            <animate attributeName="cy" values="90%;10%;90%" dur="7s" repeatCount="indefinite" />
          </circle>
          <circle cx="80%" cy="20%" r="3" fill="#00fff7" opacity="0.2">
            <animate attributeName="cy" values="20%;80%;20%" dur="9s" repeatCount="indefinite" />
          </circle>
          <circle cx="50%" cy="50%" r="1.5" fill="#ff00ea" opacity="0.15">
            <animate attributeName="cy" values="50%;60%;50%" dur="6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      {/* Circuitos SVG decorativos */}
      <div className="absolute left-0 top-0 z-0 opacity-20 hidden md:block max-h-screen overflow-hidden">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <polyline points="10,10 60,10 60,60 110,60 110,110 210,110" stroke={neon} strokeWidth="2" fill="none" />
        </svg>
      </div>
      <div className="absolute right-0 bottom-0 z-0 opacity-20 hidden md:block max-h-screen overflow-hidden">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <polyline points="210,210 160,210 160,160 110,160 110,110 10,110" stroke={neon} strokeWidth="2" fill="none" />
        </svg>
      </div>
      {/* Tarjeta central */}
      <main className="flex-1 flex flex-col justify-center items-center w-full p-0 m-0">
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center p-4 md:p-10 rounded-3xl shadow-2xl animate-border-glow transition-colors duration-500"
          style={{
            background: darkMode ? cardBg : cardBgLight,
            border: `3px solid ${borderColor}`,
            boxShadow: `0 0 32px ${neon}55, 0 0 8px ${neon}33`,
            color: textColor
          }}>
          {/* Logo glitch */}
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-center glitch neon-glow" data-text="GamerHub" style={{ color: neon }}>
            GamerHub
          </h1>
          <p className="text-lg md:text-xl mb-8 z-10 text-center transition-colors duration-500" style={{ color: textColor }}>
            Tu plataforma social de videojuegos
          </p>
          <div className="flex gap-4 mb-8 z-10">
        {!user ? (
          <>
                <Link
                  to="/login"
                  className="px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39ff14] focus:ring-offset-2 neon-btn bg-[#39ff14] text-[#0a0f0d] hover:bg-[#39ff14] hover:text-black dark:bg-[#39ff14] dark:text-[#0a0f0d]"
                  style={{ boxShadow: `0 0 16px ${neon}` }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#39ff14] focus:ring-offset-2 neon-btn-alt bg-white text-[#39ff14] border-2 border-[#39ff14] hover:bg-[#e0ffe0] dark:bg-[#181c1a] dark:text-[#39ff14] dark:border-[#39ff14] dark:hover:bg-[#232323]"
                >
                  Registrarse
                </Link>
          </>
        ) : (
              <Link to="/profiles" className="px-6 py-3 rounded-lg font-semibold transition-colors z-10 neon-btn bg-[#39ff14] text-[#0a0f0d] hover:bg-[#39ff14] hover:text-black dark:bg-[#39ff14] dark:text-[#0a0f0d]"
                style={{ boxShadow: `0 0 16px ${neon}` }}>
                Ir a Perfiles
              </Link>
        )}
      </div>
          <div className="mt-8 text-center z-10 transition-colors duration-500" style={{ color: textColor }}>
            <p className="text-base md:text-lg">
              Explora, filtra y guarda tus juegos favoritos.<br />
              Crea perfiles para toda la familia y controla el acceso según la edad.<br />
              <span className="inline-block mt-4 text-xs opacity-60" style={{ color: neon }}>
                Inspirado en la pasión gamer <span role="img" aria-label="gamepad">🎮</span>
              </span>
            </p>
          </div>
        </div>
      </main>
      {/* Animaciones y efectos personalizados */}
      <style>{`
        .glitch {
          position: relative;
        }
        .glitch:before, .glitch:after {
          content: attr(data-text);
          position: absolute;
          left: 0; width: 100%;
          overflow: hidden;
          color: #fff;
          opacity: 0.7;
          z-index: 1;
        }
        .glitch:before {
          text-shadow: 2px 0 #00fff7;
          animation: glitch-anim 2s infinite linear alternate-reverse;
          top: 2px;
        }
        .glitch:after {
          text-shadow: -2px 0 #ff00ea;
          animation: glitch-anim2 2.2s infinite linear alternate-reverse;
          top: -2px;
        }
        @keyframes glitch-anim {
          0% { clip-path: inset(0 0 80% 0); }
          20% { clip-path: inset(0 0 60% 0); }
          40% { clip-path: inset(0 0 40% 0); }
          60% { clip-path: inset(0 0 20% 0); }
          80% { clip-path: inset(0 0 60% 0); }
          100% { clip-path: inset(0 0 80% 0); }
        }
        @keyframes glitch-anim2 {
          0% { clip-path: inset(80% 0 0 0); }
          20% { clip-path: inset(60% 0 0 0); }
          40% { clip-path: inset(40% 0 0 0); }
          60% { clip-path: inset(20% 0 0 0); }
          80% { clip-path: inset(60% 0 0 0); }
          100% { clip-path: inset(80% 0 0 0); }
        }
        .neon-glow {
          filter: drop-shadow(0 0 16px #39ff14) drop-shadow(0 0 32px #39ff14);
        }
        .neon-btn {
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .neon-btn:hover {
          box-shadow: 0 0 32px #39ff14, 0 0 8px #fff;
          filter: brightness(1.1);
        }
        .neon-btn-alt {
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, background 0.2s;
        }
        .neon-btn-alt:hover {
          background: #232323;
          color: #39ff14;
          box-shadow: 0 0 24px #39ff14;
        }
        .animate-border-glow {
          animation: border-glow 2.5s infinite alternate;
        }
        @keyframes border-glow {
          0% { box-shadow: 0 0 0px #39ff14, 0 0 0px #00fff7; }
          100% { box-shadow: 0 0 32px #39ff14, 0 0 16px #00fff7; }
        }
      `}</style>
    </div>
  );
}