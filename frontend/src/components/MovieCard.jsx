import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function MovieCard({ movie, index }) {
  const [imageSrc, setImageSrc] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get base path from environment variables
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || '/assets/movie-posters/';

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (!movie.poster_url) {
          throw new Error('No poster URL provided');
        }

        // Sanitize and validate filename
        const sanitizedFilename = movie.poster_url
          .replace(/[^a-z0-9\-._]/gi, '') // Remove special chars
          .replace(/\s+/g, '-') // Replace spaces with dashes
          .toLowerCase();

        // Validate file extension
        const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const extension = sanitizedFilename.split('.').pop();
        
        if (!validExtensions.includes(extension)) {
          throw new Error(`Invalid file extension: ${extension}`);
        }

        // Construct full image path
        const imagePath = `${imageBaseUrl}${sanitizedFilename}`;
        
        // Test image loading
        const img = new Image();
        img.src = imagePath;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Image not found'));
        });

        setImageSrc(imagePath);
      } catch (error) {
        console.error('Image load error:', error.message);
        setImageSrc('/placeholder-movie.png');
      } finally {
        setImageLoaded(true);
      }
    };

    loadImage();
  }, [movie.poster_url, imageBaseUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
      className="group relative overflow-hidden rounded-2xl neumorphic hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Container */}
      <div className="relative h-80 bg-gray-800/50">
        {!imageLoaded ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-700 w-full h-full rounded-lg" />
          </div>
        ) : (
          <motion.img
            src={imageSrc}
            alt={`${movie.title} movie poster`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              if (!e.target.src.includes('placeholder-movie.png')) {
                console.warn('Falling back to placeholder image');
                e.target.src = '/placeholder-movie.png';
              }
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Movie Info */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <motion.div
          animate={isHovered ? { y: -10 } : { y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <h3 className="text-xl font-bold mb-1 line-clamp-1">{movie.title}</h3>
          <div className="flex items-center gap-2 text-purple-300 text-sm mb-3">
            <span>{movie.release_year}</span>
            {movie.duration_minutes && (
              <>
                <span className="text-white/30">•</span>
                <span>
                  {Math.floor(movie.duration_minutes / 60)}h{' '}
                  {movie.duration_minutes % 60}m
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Details Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isHovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="mt-2"
        >
          <Link
            to={`/movies/${movie.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 rounded-full text-white transition-all shadow-lg"
          >
            View Details
            <motion.span
              animate={isHovered ? { x: 3 } : { x: 0 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>
      </div>

      {/* Rating Badge */}
      {movie.rating && (
        <div className="absolute top-4 right-4 bg-yellow-400/90 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
          ★ {movie.rating.toFixed(1)}
        </div>
      )}
    </motion.div>
  );
}