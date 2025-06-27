import { Link } from "react-router-dom";
import Logo from "../images/logo/logo.png";
import { useState } from "react";

function Navbar() {
  const [nav, setNav] = useState(false);

  const openNav = () => {
    setNav(!nav);
  };

  return (
    <>
      <nav>
        {/* mobile */}
        {/* mobile menu sidebar */}
<div className={`mobile-navbar ${nav ? "open-nav" : ""}`}>
  <div onClick={openNav} className="mobile-navbar__close">
    <i className="fa-solid fa-xmark"></i>
  </div>
  <ul className="mobile-navbar__links">
    <li><Link onClick={openNav} to="/">Home</Link></li>
    <li><Link onClick={openNav} to="/about">About</Link></li>
    <li><Link onClick={openNav} to="/Models">Vehicle Models</Link></li>
    <li><Link onClick={openNav} to="/Team">Our Drivers</Link></li>
    <li><Link onClick={openNav} to="/contact">Contact</Link></li>
  </ul>
</div>

        {/* desktop */}

        <div className="navbar">
          <div className="navbar__img">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img src={Logo} alt="logo-img" />
            </Link>
          </div>
          <ul className="navbar__links">
            <li>
              <Link className="home-link" to="/">
                Home
              </Link>
            </li>
            <li>
              {" "}
              <Link className="about-link" to="/about">
                About
              </Link>
            </li>
            <li>
              {" "}
              <Link className="models-link" to="/Models">
                Vehicle Models
              </Link>
            </li>
            <li>
              {" "}
              <Link className="team-link" to="/Team">
              Our Drivers
              </Link>
            </li>
            <li>
              {" "}
              <Link className="contact-link" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
          
<div className="mobile-hamb" onClick={openNav}>
  <i className="fa-solid fa-bars"></i> {/* 3-line icon */}
</div>

          
        </div>
      </nav>
    </>
  );
}

export default Navbar;
