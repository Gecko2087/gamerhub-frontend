export default function Footer() {
  return <footer className="mt-auto border-t border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-6 text-center">
    <p className="font-bold text-green-800 dark:text-green-200">GamerHub</p>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Descubre juegos. Arma tu próxima aventura.</p>
    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} GamerHub · Proyecto de demostración</p>
  </footer>;
}
