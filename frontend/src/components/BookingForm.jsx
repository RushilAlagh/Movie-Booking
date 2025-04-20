import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function BookingForm({ movieId }) {
  const [screenings, setScreenings] = useState([]);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load screenings when movie changes
  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/movies/${movieId}/screenings`);
        setScreenings(response.data);
      } catch (err) {
        setError('Failed to load screenings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (movieId) {
      fetchScreenings();
    }
  }, [movieId]);

  // Load seats when screening changes
  const loadSeats = async (screeningId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/screenings/${screeningId}/seats`);
      setSeats(response.data);
      setSelectedSeats([]);
    } catch (err) {
      setError('Failed to load seats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle seat selection
  const toggleSeat = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  // Book selected seats
  const handleBookSeats = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        user_id: 1, // Replace with real user ID from context if available
        screening_id: selectedScreening,
        seat_ids: selectedSeats
      });

      alert(`Successfully booked ${selectedSeats.length} seat(s)!`);
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedScreening) {
    return <div className="loading">Loading screenings...</div>;
  }

  return (
    <div className="booking-container">
      <h2>Book Tickets</h2>
      
      {error && <div className="error-message">{error}</div>}

      {/* Screening Selection */}
      <div className="screenings-section">
        <h3>Select Showtime:</h3>
        <div className="screenings-list">
          {screenings.map(screening => (
            <button
              key={screening.id}
              className={`screening-btn ${selectedScreening === screening.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedScreening(screening.id);
                loadSeats(screening.id);
              }}
              disabled={loading}
            >
              {new Date(screening.show_time).toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              <br />
              Screen {screening.screen_number}
            </button>
          ))}
        </div>
      </div>

      {/* Seat Selection */}
      {selectedScreening && (
        <div className="seats-section">
          {loading ? (
            <div className="loading">Loading seats...</div>
          ) : (
            <>
              <h3>Select Seats:</h3>
              <div className="screen-label">SCREEN</div>
              
              <div className="seat-map">
                {Array.from(new Set(seats.map(s => s.row))).sort().map(row => (
                  <div key={row} className="seat-row">
                    <div className="row-label">{row}</div>
                    <div className="seats-in-row">
                      {seats
                        .filter(seat => seat.row === row)
                        .sort((a, b) => a.number - b.number)
                        .map(seat => (
                          <button
                            key={seat.id}
                            className={`seat ${seat.is_booked ? 'booked' : ''} ${
                              selectedSeats.includes(seat.id) ? 'selected' : ''
                            }`}
                            onClick={() => !seat.is_booked && toggleSeat(seat.id)}
                            disabled={seat.is_booked}
                            title={`${row}${seat.number}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="booking-summary">
                <div>
                  Selected: {selectedSeats.length} seat(s)
                </div>
                <button 
                  onClick={handleBookSeats}
                  disabled={selectedSeats.length === 0 || loading}
                  className="book-btn"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
