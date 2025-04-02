import React from 'react';
import { LogOut,Search } from 'lucide-react';
import BottomNavigationDriver from '../../components/BottomNavigatorDriver';
import HomeMapDriver from '../../components/HomeMapDriver';

function Home() {
  // Sample data for recent rides
  const recentRides = [
    {
      pickup: '1901 Thornridge Cir, Shiloh',
      destination: '4140 Parker Rd, Allentown',
      date: '16 July 2023',
      time: '10:30 PM',
      driver: 'Jane Cooper',
      seats: 4,
      paymentStatus: 'Paid'
    }
  ];

  const name=localStorage.getItem("username");

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
                const response = await fetch("http://localhost:5000/api/v1/driverAuth/logout", {
                  method: "POST", // Use GET if required by your API
                  credentials: "include", // Ensures cookies/session are sent
                });
          
                if (response.ok) {
                  window.location.href = "/driver/login"; // Redirect on success
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
          <HomeMapDriver />
        </div>
      </div>
      
      {/* Recent Rides Section */}
      <div className="bg-white p-4">
        <h2 className="text-lg font-medium mb-3">Recent Rides</h2>
        {recentRides.map((ride, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-gray-200 rounded-lg p-1 w-8 h-8 flex items-center justify-center">
                P
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-gray-300 rounded-full mr-2"></div>
                  <p className="text-sm">{ride.pickup}</p>
                </div>
                <div className="flex items-center mt-2">
                  <div className="h-3 w-3 bg-gray-500 rounded-full mr-2"></div>
                  <p className="text-sm">{ride.destination}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Date & Time</p>
                <p>{`${ride.date}, ${ride.time}`}</p>
              </div>
              <div>
                <p className="text-gray-500">Driver</p>
                <p>{ride.driver}</p>
              </div>
              <div>
                <p className="text-gray-500">Car seats</p>
                <p>{ride.seats}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Status</p>
                <p className="text-green-500">{ride.paymentStatus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavigationDriver/>
    </div>
  );
}

export default Home;