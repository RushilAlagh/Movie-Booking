import { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCard from '../components/MovieCard.jsx';

export default function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    axios.get('/api/movies').then(res => setMovies(res.data)).catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
    </div>
  );
}
