import { useState } from "react";

function Schedule({ availableDates }) {
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="schedule">
      <h2>Schedule</h2>
      <div className="date-buttons">
        {availableDates.map((date, index) => (
          <button
            key={index}
            className={selectedDate === date ? "active" : ""}
            onClick={() => setSelectedDate(date)}
          >
            {date}
          </button>
        ))}
      </div>

      <p>Selected: {selectedDate || "Belum memilih tanggal"}</p>
    </div>
  );
}

export default Schedule;