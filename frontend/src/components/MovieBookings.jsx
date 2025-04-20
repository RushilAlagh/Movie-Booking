import React, { useState, useEffect } from "react";
import axios from "axios";

const MovieBooking = ({ movieId }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch available seats for the movie
    axios
      .get(`/api/seats/${movieId}`)
      .then((response) => {
        setSeats(response.data.seats);
      })
      .catch((error) => {
        setError("Failed to fetch available seats.");
      });
  }, [movieId]);

  const handleSeatSelect = (seat) => {
    setSelectedSeat(seat);
  };

  const handleBooking = () => {
    if (!selectedSeat || !userName) {
      setError("Please select a seat and enter your name.");
      return;
    }

    // Send booking request to the backend
    axios
      .post("/api/book-seat", {
        movie_id: movieId,
        seat_number: selectedSeat.seat_number,
        user_name: userName,
      })
      .then((response) => {
        alert("Seat booked successfully!");
      })
      .catch((error) => {
        setError(error.response?.data?.error || "Booking failed.");
      });
  };

  return (
    <div>
      <h3>Select a Seat</h3>
      <div>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <div className="seats">
          {seats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => handleSeatSelect(seat)}
              className={selectedSeat?.id === seat.id ? "selected" : ""}
              disabled={seat.status === "booked"}
            >
              {seat.seat_number}
            </button>
          ))}
        </div>
        <button onClick={handleBooking}>Book Seat</button>
      </div>
    </div>
  );
};

export default MovieBooking;
