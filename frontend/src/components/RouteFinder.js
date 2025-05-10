
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RouteFinder = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');
  const [stops, setStops] = useState([]);
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  useEffect(() => {
    const fetchStops = async () => {
      try {
        const res = await axios.get('bmtcbusroutefinder-production.up.railway.app/stops');
        setStops(res.data.map(stop => stop.stop_name));
      } catch (err) {
        console.error('Failed to fetch stops:', err);
      }
    };
    fetchStops();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setRoutes([]);
    setError('');

    if (!source || !destination) {
      setError('Please enter both source and destination.');
      return; 
    }

    try {
      const response = await axios.get('bmtcbusroutefinder-production.up.railway.app/routes', {
        params: {
          source: source.trim(),
          destination: destination.trim(),
        },
      });

      if (response.data.routes.length === 0) {
        setError('No routes found between the selected stops.U should take multiple stops');
      } else {
        setRoutes(response.data.routes);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred while fetching routes.');
      }
    }
  };

  const handleSourceChange = (e) => {
    const value = e.target.value;
    setSource(value);
    setSourceSuggestions(
      stops.filter(stop => stop.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    setDestSuggestions(
      stops.filter(stop => stop.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleSelectSuggestion = (value, isSource) => {
    if (isSource) {
      setSource(value);
      setSourceSuggestions([]);
    } else {
      setDestination(value);
      setDestSuggestions([]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Find Bus Routes</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <input
            type="text"
            placeholder="Source Stop"
            value={source}
            onChange={handleSourceChange}
            autoComplete="off"
          />
          {sourceSuggestions.length > 0 && (
            <ul style={suggestionStyle}>
              {sourceSuggestions.map((stop, i) => (
                <li key={i} onClick={() => handleSelectSuggestion(stop, true)}   style={{ cursor: 'pointer', padding: '5px' }}>
                  {stop}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div >
          <input
            type="text"
            placeholder="Destination Stop"
            value={destination}
            onChange={handleDestinationChange}
            autoComplete="off"
          />
          {destSuggestions.length > 0 && (
            <ul style={suggestionStyle}>
              {destSuggestions.map((stop, i) => (
                <li key={i} onClick={() => handleSelectSuggestion(stop, false)}   style={{ cursor: 'pointer', padding: '5px' }}> 
                  {stop}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
  type="submit"
  style={{display:'flex',
   justifyContent:'center',
   marginLeft:"40px",
    width: '90px',

  }}
>
  Search
</button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {routes.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Matching Routes:</h3>
          <ul>
            {routes.map((route, idx) => (
              <li key={idx}>{route}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const suggestionStyle = {
  listStyleType: 'none',
  padding: '5px',
  margin: '0',
  border: '1px solid #ccc',
  borderRadius: '4px',
  background: '#fff',
  maxHeight: '100px',
  overflowY: 'auto',
  position: 'absolute',
  zIndex: 10,
};

export default RouteFinder;

