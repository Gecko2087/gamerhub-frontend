import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import { DEMO_MODE } from '../config/api';

const LoginPage = () => {
  const { user, demoLogin, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    const success = await demoLogin();
    if (success) navigate('/profiles');
  };

  useEffect(() => {
    if (user) {
      if (user.role === 'owner' || user.role === 'admin') {
        navigate('/profiles');
      } else {
        navigate('/profiles');
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            GamerHub
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tu plataforma para descubrir y gestionar tus juegos favoritos
          </p>
        </div>
        <LoginForm />
        {DEMO_MODE && (
          <section className="mt-6 rounded-xl border border-indigo-400/40 bg-indigo-950/40 p-4" aria-labelledby="demo-title">
            <h2 id="demo-title" className="text-lg font-bold text-white">Recorrido para visitantes</h2>
            <p id="demo-description" className="mt-2 text-sm text-indigo-100">
              Crea una sesión temporal y aislada en la API de GamerHub. Los perfiles y favoritos se guardan en MongoDB durante una hora. Usa únicamente datos ficticios.
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={handleDemoLogin}
              aria-describedby="demo-description"
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? 'Preparando sesión demo…' : 'Abrir demo temporal'}
            </button>
          </section>
        )}
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-950/40 p-3 text-center text-sm text-red-300">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
