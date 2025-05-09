import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-6">Página no encontrada</p>
      <Link to="/" className="px-4 py-2 bg-teal-600 rounded hover:bg-teal-700 transition-colors">Volver al inicio</Link>
    </div>
  );
}
