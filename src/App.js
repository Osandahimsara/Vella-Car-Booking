import Home from "./Pages/Home";
import Navbar from "../src/components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Models from "./Pages/Models";
import Team from "./Pages/Team";
import Login from "./Pages/Login";
import AdminPage from "./Pages/Admin";
import BookCar from "./Pages/BookCar";


function App() {
  const location = useLocation();
  // Hide Navbar on admin page
  const hideNavbar = location.pathname === "/Adminpage";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route index path="/" element={<Home />} />
        <Route path="models" element={<Models />} />
        <Route path="team" element={<Team />} />
        <Route path="login" element={<Login />} />
        <Route path="Adminpage" element={<AdminPage />} />
        <Route path="bookcar" element={<BookCar />} />
      </Routes>
    </>
  );
}

export default App;