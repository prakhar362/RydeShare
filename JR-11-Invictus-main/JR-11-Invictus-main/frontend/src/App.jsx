import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SignupPage from "./pages/user/Signup";
import LoginPage from "./pages/user/Login";
import Splash from "./pages/Splash";
import HomeScreen from "./pages/user/Home";
import Contact from "./pages/user/Contact";
import Payment from "./pages/user/Payment";
import History from "./pages/user/history";
import ProfilePage from "./pages/user/Profile";
import "./App.css";
import SignupDriver from "./pages/driver/SignUp";
import LoginDriver from "./pages/driver/Login";
import ProfileDriver from "./pages/driver/Profile";
import DriverHome from "./pages/driver/Home";
import Driverhistory from "./pages/driver/history";
import ContactDriver from "./pages/driver/Contact";

function App() {
  return (
    <Router>
      <div>
        <Toaster position="top-right" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Splash/>} />
          <Route path="/user/signup" element={<SignupPage />} />
          <Route path="/user/login" element={<LoginPage />} />
          <Route path="/user/home" element={<HomeScreen />} />
          <Route path="/user/contact" element={<Contact />} />
          <Route path="/user/payment" element={<Payment />} />
          <Route path="/user/profile" element={<ProfilePage />} />
          <Route path="/user/ride-history" element={<History />} />

          <Route path="/driver/signup" element={<SignupDriver />} />
          <Route path="/driver/login" element={<LoginDriver />} />
          <Route path="/driver/profile" element={<ProfileDriver />} />
          <Route path="/driver/home" element={< DriverHome/>} />
          <Route path="/driver/contact" element={<ContactDriver />} />
          <Route path="/driver/history" element={<Driverhistory />} />


          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
