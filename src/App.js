import Home from "./Pages/Home";
import Navbar from "../src/components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Drivers from "./Pages/Drivers";
import Login from "./Pages/Login";
import AdminPage from "./Pages/Admin";
import AdminVehicles from "./Pages/AdminVehicles";
import AdminDrivers from "./Pages/AdminDrivers";
import BookCar from "./Pages/BookCar";
import DriverRegister from "./Pages/DriverRegister";
import VehicleRegister from "./Pages/VehicleRegister";
import Vehicles from "./Pages/Vehicles";



function App() {
  const location = useLocation();
  // Hide Navbar on admin page
   const hideNavbar = location.pathname === "/Adminpage" || 
                    location.pathname === "/AdminVehicles" ||
                    location.pathname === "/AdminDrivers" ||
                    location.pathname === "/DriverRegister" ||
                    location.pathname === "/VehicleRegister";
  

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="Drivers" element={<Drivers />} />
        <Route path="login" element={<Login />} />
        <Route path="Adminpage" element={<AdminPage />} />
        <Route path="AdminVehicles" element={<AdminVehicles />} />
        <Route path="AdminDrivers" element={<AdminDrivers />} />
        <Route path="bookcar" element={<BookCar />} />
        <Route path="DriverRegister" element={<DriverRegister />} />
        <Route path="VehicleRegister" element={<VehicleRegister />} /> 
        <Route path="vehicles" element={<Vehicles />} /> 
       
      </Routes>
    </>
  );
}

export default App;