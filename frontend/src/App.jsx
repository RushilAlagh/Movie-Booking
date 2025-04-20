import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'; // Import useLocation
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';  // assuming you have a Footer component
import Home from './pages/Home.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import Bookings from './pages/Bookings.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 px-4 md:px-8 py-6">
          <AnimatePresence mode="wait">
            {/* Simple in‑App routing without a separate AppRoutes file */}
            <RoutesWrapper />
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function RoutesWrapper() {
  const location = useLocation(); // Hook to get the current location

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <Routes location={location} key={location.pathname}>
      <Route
        path="/"
        element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
            <Home />
          </motion.div>
        }
      />
      <Route
        path="/movies/:id"
        element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
            <MovieDetail />
          </motion.div>
        }
      />
      <Route
        path="/bookings"
        element={
          <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
            <Bookings />
          </motion.div>
        }
      />
    </Routes>
  );
}
