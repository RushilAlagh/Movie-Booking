// src/pages/MovieDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SeatMap from '../components/SeatMap';

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [error, setError] = useState('');

  // Fetch movie details
  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch movie');
        return res.json();
      })
      .then(setMovie)
      .catch(err => {
        console.error('Error fetching movie:', err);
        setError('Could not load movie details.');
      });
  }, [id]);

  // Fetch screenings when movie loads
  useEffect(() => {
    if (!movie) return;
    fetch(`/api/movies/${id}/screenings`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch screenings');
        return res.json();
      })
      .then(setScreenings)
      .catch(err => {
        console.error('Error fetching screenings:', err);
        setError('Could not load screenings.');
      });
  }, [id, movie]);

  if (error) {
    return <p className="text-red-400 text-center mt-8">{error}</p>;
  }

  if (!movie) {
    return <p className="text-center mt-8">Loading…</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Movie Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3">
          <img
            src={`/assets/movie-posters/${movie.poster_url}`}
            alt={movie.title}
            className="w-full h-auto rounded-2xl neumorphic"
            onError={(e) => {
              e.target.src = '/assets/movie-posters/placeholder-movie.png';
            }}
          />
        </div>
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <div className="flex gap-4 mb-6">
            <span className="bg-yellow-400/90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
              ★ {movie.rating?.toFixed(1)}
            </span>
            <span className="text-purple-300">{movie.release_year}</span>
          </div>
          <p className="text-lg mb-8">{movie.description}</p>

          {/* Screenings Selector */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Select Screening</h2>
            {screenings.length === 0 ? (
              <p className="text-gray-400">No upcoming screenings.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {screenings.map((scr) => (
                  <button
                    key={scr.id}
                    onClick={() => setSelectedScreening(scr.id)}
                    className={`p-4 rounded-lg neumorphic transition ${
                      selectedScreening === scr.id
                        ? 'bg-purple-600/20'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="font-bold">
                      {new Date(scr.show_time).toLocaleString()}
                    </div>
                    {scr.room_name && (
                      <div className="text-sm text-purple-300">
                        {scr.room_name}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat Map */}
      {selectedScreening && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Select Seats</h2>
          <SeatMap
            screeningId={selectedScreening}
            onBooked={() => {
              alert('Seats booked! Redirecting to My Bookings…');
              navigate('/bookings');
            }}
          />
        </div>
      )}
    </div>
  );
}
