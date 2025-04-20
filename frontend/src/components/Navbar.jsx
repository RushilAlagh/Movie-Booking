import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { isDark, toggle } = useTheme();
  const location = useLocation();

  return (
    <motion.nav initial={{ y: -80 }} animate={{ y: 0 }} className="sticky top-0 z-50 neumorphic shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          CineVerse
        </Link>
        <div className="flex items-center gap-6">
          {['/', '/bookings'].map(path => (
            <Link
              key={path}
              to={path}
              className={`relative group transition-colors ${location.pathname === path ? 'text-purple-400' : 'hover:text-purple-400'}`}
            >
              {path === '/' ? 'Movies' : 'My Bookings'}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-purple-400 transition-all group-hover:w-full" />
            </Link>
          ))}
          <motion.button onClick={toggle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
            {isDark ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-400" />}
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
