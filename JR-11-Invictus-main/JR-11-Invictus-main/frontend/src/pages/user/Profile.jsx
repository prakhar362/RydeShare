import { useEffect, useState } from "react";
import BottomNavigation from "../../components/BottomNavigator";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  const userId = localStorage.getItem("token") // Replace with actual ID or get from URL/localStorage

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/auth/profile/${userId}`);

        const data = await response.json();
        console.log(data);
        if (response.ok) {
          setUser(data.user);
        } else {
          console.error("Failed to fetch profile:", data.message);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <>
      <div className="p-1 bg-white">
        <h1 className="text-xl font-semibold text-center">Profile Page</h1>

        <div className="flex flex-col items-center p-5 bg-gray-100 min-h-screen">
          {/* Profile Picture */}
          <div className="relative">
            <img
              src={user?.profilePicture || "https://static-00.iconduck.com/assets.00/profile-icon-512x512-w0uaq4yr.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-gray-700"
            />
          </div>

          {/* Profile Details */}
          <div className="mt-5 w-full max-w-md bg-white p-4 rounded-xl shadow-lg">
            {user ? (
              <>
                {[
                  
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email },
                  { label: "Phone number", value: user.phoneNumber },
                ].map((item, index) => (
                  <div key={index} className="mb-3">
                    <p className="text-gray-500 text-sm">{item.label}</p>
                    <div className="flex justify-between items-center border p-2 rounded-lg bg-gray-50">
                      <p className="text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p>Loading user profile...</p>
            )}
          </div>
        </div>
      </div>
      <BottomNavigation/>
    </>
  );
};

export default ProfilePage;
