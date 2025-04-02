import { useEffect, useRef, useState } from "react";

const useWebSocket = (url) => {
  const socketRef = useRef(null);
  const [drivers, setDrivers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "driverLocationUpdated") {
        // Update driver locations
        setDrivers((prevDrivers) => {
          const updatedDrivers = prevDrivers.filter(
            (driver) => driver.driverId !== data.driverId
          );
          return [...updatedDrivers, data];
        });
      }

      if (data.type === "userLocationUpdated") {
        // Update user location
        setUserLocation(data.location);
      }
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url]);

  // Function to send user location updates
  const sendUserLocation = (userId, location) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "updateUserLocation",
          userId,
          location,
        })
      );
    }
  };

  // Function to send driver location updates
  const sendDriverLocation = (driverId, location) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "updateDriverLocation",
          driverId,
          location,
        })
      );
    }
  };

  return { drivers, userLocation, sendUserLocation, sendDriverLocation };
};

export default useWebSocket;