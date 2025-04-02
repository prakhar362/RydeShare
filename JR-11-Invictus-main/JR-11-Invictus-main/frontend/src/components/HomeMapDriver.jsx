import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaUser, FaCheck, FaTimes } from 'react-icons/fa';

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

// Component to handle map changes
function MapController({ driverLocation }) {
  const map = useMap();

  useEffect(() => {
    if (driverLocation) {
      map.setView([driverLocation[0], driverLocation[1]], 13);
    }
  }, [map, driverLocation]);

  return null;
}

function HomeMapDriver() {
  const [driverLocation, setDriverLocation] = useState(null);
  const [users, setUsers] = useState([]);

  // Simulate users requesting rides
  useEffect(() => {
    if (driverLocation) {
      const initialUsers = [
        {
          id: 1,
          name: 'Alice',
          coordinates: generateNearbyCoordinates(driverLocation[0], driverLocation[1], 2) // Within 2 km
        },
        {
          id: 2,
          name: 'Bob',
          coordinates: generateNearbyCoordinates(driverLocation[0], driverLocation[1], 2)
        },
        {
          id: 3,
          name: 'Charlie',
          coordinates: generateNearbyCoordinates(driverLocation[0], driverLocation[1], 2)
        }
      ];
      setUsers(initialUsers);
    }
  }, [driverLocation]);

  // Simulate live user movement
  useEffect(() => {
    if (driverLocation) {
      const interval = setInterval(() => {
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            coordinates: generateNearbyCoordinates(user.coordinates[0], user.coordinates[1], 0.1) // Move within 100 meters
          }))
        );
      }, 5000); // Update every 5 seconds

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [driverLocation]);

  // Get driver's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation([latitude, longitude]);
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const acceptRide = (userId) => {
    alert(`Ride request from user ${userId} accepted!`);
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  const rejectRide = (userId) => {
    alert(`Ride request from user ${userId} rejected.`);
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
  };

  return (
    <div className="driver-app">
      <div className="main-container">
        {/* Map Container */}
        <div className="map-wrapper">
          {driverLocation ? (
            <MapContainer
              center={driverLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Driver's Location Marker */}
              {driverLocation && (
                <Marker
                  position={driverLocation}
                  icon={createCustomIcon('#3388ff')}
                >
                  <Popup>Your location</Popup>
                </Marker>
              )}

              {/* Nearby Users Markers */}
              {users.map((user) => (
                <Marker
                  key={user.id}
                  position={user.coordinates}
                  icon={L.icon({
                    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png', // User icon
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                  })}
                >
                  <Popup>
                    <div>
                      <h3>{user.name}</h3>
                      <p>Requesting a ride</p>
                      <div className="ride-actions">
                        <button onClick={() => acceptRide(user.id)}>
                          <FaCheck /> Accept
                        </button>
                        <button onClick={() => rejectRide(user.id)}>
                          <FaTimes /> Reject
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              <MapController driverLocation={driverLocation} />
            </MapContainer>
          ) : (
            <div className="loading-map">
              <div className="spinner"></div>
              <p>Loading map...</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Global styles */
        .driver-app {
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

        /* Popup styles */
        .ride-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .ride-actions button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        .ride-actions button:first-child {
          background-color: #4caf50;
          color: white;
        }

        .ride-actions button:last-child {
          background-color: #f44336;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default HomeMapDriver;