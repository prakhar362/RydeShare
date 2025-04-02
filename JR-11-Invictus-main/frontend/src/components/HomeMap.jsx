import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaLocationArrow, FaTaxi, FaRoute, FaUsers } from 'react-icons/fa';

// Fix for Leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Function to generate random coordinates near a given location
const generateNearbyCoordinates = (lat, lon, radiusInKm) => {
  const radiusInDegrees = radiusInKm / 111.32; // Convert km to degrees
  const randomOffset = (Math.random() - 0.5) * 2 * radiusInDegrees; // Random offset within radius
  return [lat + randomOffset, lon + randomOffset];
};

// Function to generate users along the route
const generateUsersAlongRoute = (start, end, count) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    // Generate a random point along the route
    const fraction = Math.random(); // Random fraction between 0 and 1
    const lat = start[0] + fraction * (end[0] - start[0]);
    const lon = start[1] + fraction * (end[1] - start[1]);
    users.push({
      id: i + 1,
      name: `User ${i + 1}`,
      coordinates: generateNearbyCoordinates(lat, lon, 0.5) // Within 0.5 km of the route
    });
  }
  return users;
};

// Component to handle map changes
function MapController({ currentLocation, destinationCoords }) {
  const map = useMap();

  useEffect(() => {
    if (currentLocation && destinationCoords) {
      const bounds = L.latLngBounds([
        [currentLocation[0], currentLocation[1]],
        [destinationCoords[0], destinationCoords[1]]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (currentLocation) {
      map.setView([currentLocation[0], currentLocation[1]], 13);
    }
  }, [map, currentLocation, destinationCoords]);

  // Draw route when both points exist
  useEffect(() => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline && !(layer instanceof L.Marker)) {
        map.removeLayer(layer);
      }
    });

    if (currentLocation && destinationCoords) {
      const polyline = L.polyline([
        [currentLocation[0], currentLocation[1]],
        [destinationCoords[0], destinationCoords[1]]
      ], {
        color: '#3388ff',
        weight: 5,
        opacity: 0.7,
        dashArray: '10, 10',
        lineJoin: 'round'
      }).addTo(map);
    }
  }, [map, currentLocation, destinationCoords]);

  return null;
}

function HomeMap() {
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [price, setPrice] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [rideType, setRideType] = useState('solo'); // 'solo' or 'shared'
  const [nearbyUsers, setNearbyUsers] = useState([]); // Nearby users for shared rides

  // Base rate for ride calculation
  const BASE_RATE = 0.20; // $0.20 per km

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);

          // Initialize drivers near the user's location
          const initialDrivers = [
            {
              id: 1,
              name: 'Lallan Kumar',
              vehicle: 'Maruti',
              eta: '3 min',
              coordinates: generateNearbyCoordinates(latitude, longitude, 1) // Within 2 km
            },
            {
              id: 2,
              name: 'Ramu',
              vehicle: 'Bajaj Auto',
              eta: '5 min',
              coordinates: generateNearbyCoordinates(latitude, longitude, 1)
            },
            {
              id: 3,
              name: 'Madan Singh',
              vehicle: 'Bajaj',
              eta: '3 min',
              coordinates: generateNearbyCoordinates(latitude, longitude, 1)
            },
            {
              id: 4,
              name: 'Launda Punjabi',
              vehicle: 'Bajaj',
              eta: '2 min',
              coordinates: generateNearbyCoordinates(latitude, longitude, 2.5)
            },
            {
              id: 5,
              name: 'Hridhay Jadhu',
              vehicle: 'Bajaj',
              eta: '2 min',
              coordinates: generateNearbyCoordinates(latitude, longitude, 2)
            }
          ];
          setDrivers(initialDrivers);
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Simulate live driver movement
  useEffect(() => {
    if (currentLocation) {
      const interval = setInterval(() => {
        setDrivers((prevDrivers) =>
          prevDrivers.map((driver) => ({
            ...driver,
            coordinates: generateNearbyCoordinates(driver.coordinates[0], driver.coordinates[1], 0.1) // Move within 100 meters
          }))
        );
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [currentLocation]);

  const searchDestination = (query) => {
    setDestination(query);

    if (query.length > 3) {
      setLoading(true);

      // Using OpenStreetMap Nominatim API for geocoding
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          setLoading(false);
          setSearchResults(
            data
              .map((item, index) => ({
                id: index.toString(),
                place_name: item.display_name,
                center: [parseFloat(item.lat), parseFloat(item.lon)]
              }))
              .slice(0, 5) // Limit to 5 results
          );
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
          setLoading(false);

          // Fallback to mock data if API fails
          setSearchResults([
            { id: '1', place_name: 'Central Park, New York', center: [40.7829, -73.9654] },
            { id: '2', place_name: 'Times Square, New York', center: [40.758, -73.9855] },
            { id: '3', place_name: 'Empire State Building, New York', center: [40.7484, -73.9857] }
          ]);
        });
    } else {
      setSearchResults([]);
    }
  };

  const selectDestination = (result) => {
    setDestination(result.place_name);
    setDestinationCoords(result.center);
    setSearchResults([]);

    // Calculate distance
    if (currentLocation) {
      const distanceInKm = calculateDistance(
        currentLocation[0],
        currentLocation[1],
        result.center[0],
        result.center[1]
      );

      setDistance(distanceInKm);

      // Calculate price based on distance and ride type
      const estimatedPrice = calculatePrice(distanceInKm, rideType);
      setPrice(estimatedPrice);

      // Generate nearby users along the route
      const users = generateUsersAlongRoute(currentLocation, result.center, 3); // 3 users along the route
      setNearbyUsers(users);
    }
  };

  // Distance calculation using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return parseFloat(distance.toFixed(2));
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const calculatePrice = (distanceInKm, rideType) => {
    const basePrice = distanceInKm * BASE_RATE;
    let totalPrice = Math.max(5, basePrice); // Minimum fare

    if (rideType === 'shared') {
      totalPrice = totalPrice / 3; // Split fare among 3 passengers
    }

    return parseFloat(totalPrice.toFixed(2));
  };

  const bookRide = () => {
    if (!destination || !distance || !price) {
      alert('Please select a destination first');
      return;
    }

    const confirmed = window.confirm(
      `Confirm booking a ${rideType} ride to ${destination} for $${price}?`
    );

    if (confirmed) {
      alert(`Your ${rideType} ride has been booked! A driver will pick you up shortly.`);
      // In a real app, you would handle booking confirmation and navigate to ride tracking
    }
  };

  return (
    <div className="cab-booking-app">
      <div className="main-container">
        {/* Map Container */}
        <div className="map-wrapper">
          {currentLocation ? (
            <MapContainer
              center={currentLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Current Location Marker */}
              {currentLocation && (
                <Marker
                  position={currentLocation}
                  icon={createCustomIcon('#3388ff')}
                >
                  <Popup>Your current location</Popup>
                </Marker>
              )}

              {/* Destination Marker */}
              {destinationCoords && (
                <Marker
                  position={destinationCoords}
                  icon={createCustomIcon('#FF385C')}
                >
                  <Popup>{destination}</Popup>
                </Marker>
              )}

              {/* Live Drivers Markers */}
              {drivers.map((driver) => (
                <Marker
                  key={driver.id}
                  position={driver.coordinates}
                  icon={L.icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4786/4786827.png', // Cab icon
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                  })}
                >
                  <Popup>
                    <div>
                      <h3>{driver.name}</h3>
                      <p>Vehicle: {driver.vehicle}</p>
                      <p>ETA: {driver.eta}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Nearby Users Markers (for shared rides) */}
              {rideType === 'shared' &&
                nearbyUsers.map((user) => (
                  <Marker
                    key={user.id}
                    position={user.coordinates}
                    icon={L.icon({
                      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png', // User icon
                      iconSize: [30, 30],
                      iconAnchor: [15, 30],
                      className: 'orange-icon' // Add a class for orange color
                    })}
                  >
                    <Popup>
                      <div>
                        <h3>{user.name}</h3>
                        <p>Looking for a shared ride</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

              <MapController
                currentLocation={currentLocation}
                destinationCoords={destinationCoords}
              />
            </MapContainer>
          ) : (
            <div className="loading-map">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
        </div>

        {/* Booking Panel */}
        <div className="booking-panel">
          <h2>
            <FaRoute style={{ marginRight: '10px' }} /> Book a Ride
          </h2>

          <div className="location-inputs">
            <div className="input-group">
              <div className="input-icon">
                <FaLocationArrow />
              </div>
              <input
                type="text"
                value="Current Location"
                readOnly
                className="location-input"
              />
            </div>

            <div className="input-group destination">
              <div className="input-icon destination-icon">
                <FaMapMarkerAlt />
              </div>
              <input
                type="text"
                placeholder="Where to?"
                value={destination}
                onChange={(e) => searchDestination(e.target.value)}
                className="location-input"
              />
              {destination && (
                <button
                  className="clear-button"
                  onClick={() => {
                    setDestination('');
                    setDestinationCoords(null);
                    setDistance(null);
                    setPrice(null);
                    setSearchResults([]);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {loading ? (
                <div className="loading">
                  <div className="spinner-small"></div>
                  <span>Finding locations...</span>
                </div>
              ) : (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="result-item"
                    onClick={() => selectDestination(result)}
                  >
                    <FaMapMarkerAlt className="result-icon" />
                    <span>{result.place_name}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Ride Type Selection */}
          <div className="ride-type">
            <h3>Choose Ride Type:</h3>
            <div className="ride-type-options">
              <button
                className={`ride-type-button ${rideType === 'solo' ? 'active' : ''}`}
                onClick={() => setRideType('solo')}
              >
                <FaTaxi /> Solo
              </button>
              <button
                className={`ride-type-button ${rideType === 'shared' ? 'active' : ''}`}
                onClick={() => setRideType('shared')}
              >
                <FaUsers /> Shared
              </button>
            </div>
          </div>

          {/* Price and Distance Information */}
          {distance && price && (
            <div className="ride-info">
              <div className="info-row">
                <span className="info-label">Distance:</span>
                <span className="info-value">{distance} km</span>
              </div>
              <div className="info-row">
                <span className="info-label">Estimated Price:</span>
                <span className="info-value">${price}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Estimated Arrival:</span>
                <span className="info-value">{Math.ceil((distance / 30) * 60)} min</span>
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            className={`book-button ${!destination || !distance ? 'disabled' : ''}`}
            onClick={bookRide}
            disabled={!destination || !distance}
          >
            <FaTaxi className="button-icon" />
            <span>Book Ride Now</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        /* Global styles */
        .cab-booking-app {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .main-container {
          display: flex;
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        /* Map styles */
        .map-wrapper {
          flex: 1;
          height: 100%;
        }

        .loading-map {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f5f5f5;
          color: #666;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top-color: #1a73e8;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Booking panel styles */
        .booking-panel {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 380px;
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
          padding: 1.5rem;
          z-index: 1000;
          max-height: calc(100vh - 120px);
          overflow-y: auto;
        }

        .booking-panel h2 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #333;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
        }

        .location-inputs {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          background-color: #f8f8f8;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          position: relative;
        }

        .input-icon {
          color: #666;
          margin-right: 0.75rem;
        }

        .destination-icon {
          color: #ff385c;
        }

        .location-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 1rem;
          color: #333;
          outline: none;
          padding: 0.5rem 0;
        }

        .clear-button {
          background: none;
          border: none;
          color: #666;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          margin-left: 0.5rem;
        }

        /* Search results styles */
        .search-results {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .result-item {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
        }

        .result-item:hover {
          background-color: #f8f8f8;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-icon {
          color: #666;
          margin-right: 0.75rem;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .loading {
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        /* Ride type styles */
        .ride-type {
          margin-bottom: 1.5rem;
        }

        .ride-type-options {
          display: flex;
          gap: 10px;
        }

        .ride-type-button {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f8f8f8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .ride-type-button.active {
          background-color: #1a73e8;
          color: white;
          border-color: #1a73e8;
        }

        /* Orange icon for nearby users */
        .orange-icon {
          filter: hue-rotate(40deg) saturate(150%); /* Make the icon orange */
        }

        /* Ride information styles */
        .ride-info {
          background-color: #f8f8f8;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .info-row:last-child {
          margin-bottom: 0;
        }

        .info-label {
          color: #666;
        }

        .info-value {
          font-weight: 600;
          color: #333;
        }

        /* Book button styles */
        .book-button {
          background-color: #1a73e8;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.875rem;
          font-size: 1rem;
          font-weight: 600;
          width: 100%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .book-button:hover {
          background-color: #1565c0;
        }

        .book-button.disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .button-icon {
          margin-right: 0.5rem;
        }

        /* Make it responsive */
        @media (max-width: 768px) {
          .booking-panel {
            width: 100%;
            top: auto;
            right: 0;
            left: 0;
            bottom: 0;
            border-radius: 20px 20px 0 0;
            padding: 1.5rem;
            max-height: 60vh;
          }
        }
      `}</style>
    </div>
  );
}

export default HomeMap;