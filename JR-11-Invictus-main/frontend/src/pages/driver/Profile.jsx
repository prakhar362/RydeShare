import { useEffect, useState } from "react";
import { Pencil, CheckCircle } from "lucide-react";
import BottomNavigationDriver from "../../components/BottomNavigatorDriver";

const ProfileDriver = () => {
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Get driverId from localStorage

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/v1/driverAuth/profile/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setDriver(data.user);
        } else {
          console.error("Failed to fetch profile:", data.message);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <>
      <div>
        <div className="p-1 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-center">Profile Page</h1>
          </div>

          <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src="https://static-00.iconduck.com/assets.00/profile-icon-512x512-w0uaq4yr.png"
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-gray-700"
              />
              <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md">
                <CheckCircle className="text-green-500 w-5 h-5" />
              </div>
            </div>

            {/* Profile Fields */}
            <div className="mt-5 w-full max-w-md bg-white p-4 rounded-xl shadow-lg">
              {driver ? (
                [
                  { label: "First name", value: driver.username },
                  { label: "Email", value: driver.email },
                  { label: "Phone number", value: driver.phone },
                  { label: "Vehicle Type", value: driver.vehicleType },
                  { label: "Vehicle Number", value: driver.vehicleNumber },
                  { label: "Vehicle Name", value: driver.vehicleName },
                  { label: "Licence Number", value: driver.licenceNumber },
                ].map((item, index) => (
                  <div key={index} className="mb-3">
                    <p className="text-gray-500 text-sm">{item.label}</p>
                    <div className="flex justify-between items-center border p-2 rounded-lg bg-gray-50">
                      <p className="text-gray-800">{item.value}</p>
                      <Pencil className="text-gray-400 w-5 h-5 cursor-pointer" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Loading profile...</p>
              )}

              {/* Email Status */}
              {driver && (
                <div className="mb-3">
                  <p className="text-gray-500 text-sm">Email status</p>
                  <div className="flex items-center border p-2 rounded-lg bg-gray-50">
                    <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
                    <p className="text-green-600">Verified</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNavigationDriver />
      </div>
    </>
  );
};

export default ProfileDriver;
