import Home from "./Pages/Home";
import Navbar from "../src/components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Models from "./Pages/Models";
import Drivers from "./Pages/Drivers";
import Login from "./Pages/Login";
import AdminPage from "./Pages/Admin";
import BookCar from "./Pages/BookCar";
import DriverRegister from "./Pages/DriverRegister";


function App() {
  const location = useLocation();
  // Hide Navbar on admin page
   const hideNavbar = location.pathname === "/Adminpage" || location.pathname === "/DriverRegister";
  
  

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="models" element={<Models />} />
        <Route path="Drivers" element={<Drivers />} />
        <Route path="login" element={<Login />} />
        <Route path="Adminpage" element={<AdminPage />} />
        <Route path="bookcar" element={<BookCar />} />
        <Route path="DriverRegister" element={<DriverRegister />} />
      </Routes>
    </>
  );
}

export default App;