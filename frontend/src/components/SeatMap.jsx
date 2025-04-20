// src/components/SeatMap.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function SeatMap({ screeningId, onBooked }) {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState(new Set());
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`/api/screenings/${screeningId}/seats`)
      .then((res) => setSeats(res.data))
      .catch((err) => setError("Failed to load seats"));
  }, [screeningId]);

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeats((prev) => {
      const next = new Set(prev);
      next.has(seat.id) ? next.delete(seat.id) : next.add(seat.id);
      return next;
    });
  };

  const bookSeats = () => {
    if (selectedSeats.size === 0) {
      alert("Pick at least one seat first!");
      return;
    }

    axios
      .post("/api/bookings", {
        user_id: 1,                 // replace with real user ID
        screening_id: screeningId,
        seat_ids: Array.from(selectedSeats),
      })
      .then((res) => {
        alert("✅ Seats booked successfully!");
        onBooked && onBooked(res.data);  // if parent wants to refresh
      })
      .catch((err) => {
        console.error(err);
        alert("❌ Booking failed: " + (err.response?.data?.error || err.message));
      });
  };

  return (
    <div>
      {error && <p className="text-red-400">{error}</p>}
      <div className="grid grid-cols-10 gap-2">
        {seats.map((seat) => (
          <button
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            disabled={seat.is_booked}
            className={`aspect-square w-8 rounded ${
              seat.is_booked
                ? "bg-red-500 cursor-not-allowed"
                : selectedSeats.has(seat.id)
                ? "bg-green-500"
                : "bg-purple-600 hover:bg-purple-500"
            }`}
          >
            {seat.row}{seat.number}
          </button>
        ))}
      </div>
      <button
        onClick={bookSeats}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Book {selectedSeats.size} Seat{selectedSeats.size > 1 && "s"}
      </button>
    </div>
  );
}
