import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { darkMode } = useTheme();
  const neon = '#39ff14';
  return (
    <footer className="w-full flex flex-col items-center py-4 z-20 bg-[#e0ffe0] dark:bg-[#181c1a] border-t-2 border-[#39ff14]22 dark:border-[#39ff14]44 transition-colors duration-500"
      style={{
        boxShadow: darkMode ? `0 -2px 24px ${neon}33` : `0 -2px 24px ${neon}11`,
        margin: 0,
        padding: 0
      }}>
      <div className="flex flex-col items-center gap-2">
        <span className="font-bold text-lg" style={{ color: neon }}>GamerHub</span>
        <span className="text-xs text-[#181c1a] dark:text-[#e0ffe0] transition-colors duration-500">
          © {new Date().getFullYear()} GamerHub. Todos los derechos reservados.
        </span>
        <span className="text-xs opacity-70" style={{ color: neon }}>Diseño gamer por pasión 🎮</span>
      </div>
    </footer>
  );
}
