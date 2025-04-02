import axios from "axios";

export const getCoordinates = async (address) => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
      params: {
        q: address,  // User-entered location name
        format: "json",
        limit: 1,    // Get only the first relevant result
      },
    });

    if (response.data.length === 0) {
      throw new Error("Location not found");
    }

    const location = response.data[0]; // First result
    return { latitude: parseFloat(location.lat), longitude: parseFloat(location.lon) };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    throw new Error("Failed to get location coordinates.");
  }
};
