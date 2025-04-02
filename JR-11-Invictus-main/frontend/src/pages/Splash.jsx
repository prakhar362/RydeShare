import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import autoRickshaw from '../assets/auto-rickshaw.png';
import evAuto from '../assets/ev-auto.png';

// Small rickshaw icons
import rickshaw1 from '../assets/auto-rickshaw.png'; 
import rickshaw2 from '../assets/ev-auto.png';
import rickshaw3 from '../assets/auto-rickshaw.png';
import rickshaw4 from '../assets/ev-auto.png';

// Placeholder Driver Profile Image
const driverProfile = 'https://www.shutterstock.com/image-vector/asian-man-driving-car-clothing-600nw-1052772887.jpg';

const Splash = () => {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onboardingData = [
    {
      title: 'The best ride in your hands with Ryde',
      description: 'Experience the convenience of finding your perfect ride with our Ryde App.',
      image: autoRickshaw,
      buttonText: 'Next',
    },
    {
      title: 'The perfect ride is just a tap away!',
      description: 'Your journey begins with Ryde. Find your local ride effortlessly.',
      image: evAuto,
      buttonText: 'Next',
    },
    {
      title: 'Your ride, your way. Let\'s get started!',
      description: 'Enter your destination in book, and let us take care of the rest.',
      image: evAuto,
      buttonText: 'Get Started',
    },
  ];

  // Smooth transition effect when changing screens
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentScreen]);

  const handleNext = () => {
    if (currentScreen < onboardingData.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      navigate('/user/login'); // Navigate to main app
    }
  };

  const handleSkip = () => {
    navigate('/user/login'); // Navigate to main app
  };

  const renderDots = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {onboardingData.map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            index === currentScreen ? 'bg-blue-500 w-4' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const renderDriverProfile = () => {
    if (currentScreen === 0) {
      return (
        <div className="absolute top-52 left-8 flex items-center bg-white rounded-xl p-3 shadow-md transition-all duration-500">
          <img src={driverProfile} alt="Driver" className="w-10 h-10 rounded-full" />
          <div className="mt-1">
            <div className="font-bold text-sm">Jeet Singh ⭐4.8</div>
            <div className="text-gray-500 text-xs">8 KM • 15min • ₹150</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderMultipleRickshaws = () => {
    if (currentScreen === 1) {
      return (
        <div className="absolute inset-0">
          {[rickshaw1, rickshaw2, rickshaw3, rickshaw4].map((rickshaw, index) => (
            <div
              key={index}
              className={`absolute w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center animate-pulse transition-all duration-500 delay-${index * 100}`}
              style={{
                top: `${30 + index * 10}%`,
                left: `${index % 2 === 0 ? '25%' : '60%'}`,
              }}
            >
              <img src={rickshaw} alt="Rickshaw" className="w-8 h-8" />
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="font-sans flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative w-full max-w-sm h-screen sm:h-[667px] bg-white rounded-lg sm:shadow-lg overflow-hidden">
        
        {/* Skip Button */}
        <div className="absolute top-5 right-5 z-10">
          <button onClick={handleSkip} className="text-gray-500 text-base hover:text-blue-500 transition-colors">
            Skip
          </button>
        </div>

        <div className="flex flex-col items-center justify-center h-full px-6">
          {renderDriverProfile()}
          {renderMultipleRickshaws()}

          {/* Image with Animation */}
          <div className={`w-4/5 h-1/3 flex justify-center items-center mb-8 transition-opacity duration-500 ${isAnimating ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {currentScreen === 2 ? (
              <div className="bg-blue-50 rounded-lg p-5 transform rotate-6 transition-all duration-500 hover:rotate-0">
                <img src={onboardingData[currentScreen].image} alt="Vehicle" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <img src={onboardingData[currentScreen].image} alt="Vehicle" className="max-w-full max-h-full object-contain transition-all duration-500 hover:scale-105" />
            )}
          </div>

          {/* Text Content */}
          <div className={`text-center mb-8 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {onboardingData[currentScreen].title}
            </h2>
            <p className="text-gray-600 px-4">
              {onboardingData[currentScreen].description}
            </p>
          </div>

          {renderDots()}

          {/* Next Button */}
          <button
            className="w-4/5 py-3 rounded-full bg-blue-500 text-white font-bold text-lg mb-6 hover:bg-blue-600 transition-colors transform hover:scale-105 active:scale-95"
            onClick={handleNext}
          >
            {onboardingData[currentScreen].buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Splash;
