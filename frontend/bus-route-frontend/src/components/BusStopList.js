import React, { useState, useEffect } from "react";

const BusStopList = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bus stops from the backend
  useEffect(() => {
    const fetchStops = async () => {
      try {
        const response = await fetch("http://localhost:5000/stops");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json(); // Parse JSON from response
        setStops(data); // Store stops in state
      } catch (error) {
        console.error("Error fetching stops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {stops.map((stop) => (
        <li key={stop.id}>
          {stop.stop_name} ({stop.latitude}, {stop.longitude})
        </li>
      ))}
    </ul>
  );
};

export default BusStopList;
