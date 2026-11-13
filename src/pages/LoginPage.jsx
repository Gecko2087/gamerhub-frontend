import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import { DEMO_MODE } from '../config/api';
import './login-page.css';

const LoginPage = () => {
  const { user, demoLogin, loading, error } = useAuth();
  const navigate = useNavigate();
  const [preparing, setPreparing] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const handleDemoLogin = async () => {
    setWaiting(false);
    setPreparing(true);
    try {
      await demoLogin();
    } finally {
      setPreparing(false);
    }
  };

  useEffect(() => {
    if (!preparing) return;
    const timer = window.setTimeout(() => setWaiting(true), 6500);
    return () => window.clearTimeout(timer);
  }, [preparing]);

  useEffect(() => {
    if (user) navigate('/profiles', { replace: true });
  }, [user, navigate]);

  return (
    <div className="gh-entry">
      <div className="gh-entry-layout">
        <figure className="gh-entry-art" aria-hidden="true">
          <img src="/covers/gamerhub-handheld.webp" alt="" fetchPriority="high" />
        </figure>
        <div className="gh-entry-content">
          <h1>{DEMO_MODE ? '¿Qué jugamos hoy?' : 'Entra a GamerHub'}</h1>
          {DEMO_MODE && <p>Explora juegos gratuitos de PC y navegador. Guarda los que quieras probar en tu perfil.</p>}
          {!DEMO_MODE && <LoginForm />}
          {DEMO_MODE && (
            <div className="gh-entry-actions">
              <button
                type="button"
                disabled={loading}
                onClick={handleDemoLogin}
                aria-describedby="demo-description"
                className="gh-entry-button"
              >
                {preparing ? 'Preparando sesión demo…' : 'Probar como visitante'}
                {!loading && <span aria-hidden="true">→</span>}
              </button>
              <p id="demo-description">Sin registro · Sesión privada de una hora</p>
              {preparing && (
                <div className="gh-demo-progress">
                  <progress aria-label="Preparación de la sesión demo" />
                  <p role="status">{waiting ? 'El servidor todavía está preparando tu espacio. Puede tardar unos segundos más.' : 'Solicitando un espacio de prueba…'}</p>
                </div>
              )}
            </div>
          )}
          {error && <p role="alert" className="mt-3 rounded-lg bg-red-100 dark:bg-red-950/40 p-3 text-center text-sm text-red-800 dark:text-red-200">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
