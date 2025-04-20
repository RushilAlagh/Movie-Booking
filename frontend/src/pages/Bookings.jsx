// src/pages/Bookings.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  const loadBookings = () => {
    axios
      .get("/api/bookings")    // assume you have GET /api/bookings
      .then((res) => setBookings(res.data))
      .catch((err) => setError("Failed to load bookings"));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    axios
      .post(`/api/bookings/${id}/cancel`)
      .then(() => {
        alert("Booking cancelled");
        loadBookings();
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to cancel");
      });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      {error && <p className="text-red-400">{error}</p>}
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="p-4 bg-background/50 neumorphic flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{b.movie_title}</p>
                <p>Screening: {new Date(b.show_time).toLocaleString()}</p>
                <p>
                  Seats:{" "}
                  {b.seat_numbers.map((n) => (
                    <span key={n} className="mr-1">{n}</span>
                  ))}
                </p>
                <p>Status: {b.status}</p>
              </div>
              <button
                onClick={() => cancelBooking(b.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
