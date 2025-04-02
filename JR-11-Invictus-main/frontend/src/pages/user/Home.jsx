import React from 'react';
import HomeMap from '../../components/HomeMap';
import BottomNavigation from '../../components/BottomNavigator';
import { LogOut,Search } from 'lucide-react';

function Home() {
  const name=localStorage.getItem("username");
  console.log(name);
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="p-1 bg-white">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Welcome {name},</h1>
          <button
  className="p-2"
  onClick={async () => {
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
        method: "POST", // Use GET if required by your API
        credentials: "include", // Ensures cookies/session are sent
      });

      if (response.ok) {
        window.location.href = "/user/login"; // Redirect on success
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }}
>
  <LogOut />
</button>

        </div>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search/>
          </div>
          <input 
            type="text"
            placeholder="Where do you want to go?"
            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          />
        </div>
      </div>
      
      {/* Map Section with Current Location */}
      <div className="relative flex-1">
        <div className=" rounded-sm relative overflow-hidden">
          <HomeMap />
        </div>
      </div>
      
      
      
      <BottomNavigation/>
    </div>
  );
}

export default Home;