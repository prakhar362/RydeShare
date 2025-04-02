import React, { useState } from 'react';

const SignupDriver = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleName: '',
    licenceNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/v1/driverAuth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful!");
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <h1 className="text-4xl font-bold p-8">Create Your Account as Driver</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {['username', 'email', 'vehicleType', 'vehicleNumber', 'vehicleName', 'licenceNumber'].map((field) => (
          <div key={field}>
            <label htmlFor={field} className="block text-2xl font-medium text-gray-700 mb-2">
              {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="text"
              name={field}
              id={field}
              placeholder={`Enter ${field}`}
              value={formData[field]}
              onChange={handleChange}
              className="bg-gray-100 p-4 block w-full rounded-full text-gray-500"
            />
          </div>
        ))}

        <div>
          <label htmlFor="password" className="block text-2xl font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="bg-gray-100 p-4 block w-full rounded-full text-gray-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-4 w-full rounded-full text-xl font-medium mt-8">
          Sign Up
        </button>
        {/* Login link */}
        <div className="text-center text-lg text-gray-500 mt-8">
          Already have an account? 
          <a href="/driver/login" className="text-blue-500 ml-2">Log in</a>
        </div>

        <div className="text-center text-lg text-gray-500 mt-8">
          Are u a Passenger??
          <a href="/user/signup" className="text-blue-500 ml-2">Register Now</a>
        </div>
      </form>
      
    </div>
  );
};

export default SignupDriver;
