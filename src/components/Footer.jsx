import "../CSS/footer.css"

function Footer() {
  return (
    <>
      <footer>
        <div className="container">
          <div className="footer-content">
            <ul className="footer-content__1">
              <li>
                <span>CAR</span> Rental
              </li>
              <li>
                We offers a big range of vehicles for all your driving needs. We
                have the perfect car to meet your needs.
              </li>
              

           
            </ul>

            <ul className="footer-content__2">
              <li>Company</li>
              <li>
                <a href="#home">Vella</a>
              </li>
              <li>
                <a href="#home">98 Acers</a>
              </li>
              <li>
                <a href="#home">Ravana pool club</a>
              </li>
              <li>
                <a href="#home">98 Adventures</a>
              </li>
              <li>
                <a href="#home">Hulpe Tea</a>
              </li>
            </ul>

            <ul className="footer-content__2">
              <li>Working Hours</li>
              <li>Mon - Fri: 9:00AM - 9:00PM</li>
              <li>Sat: 9:00AM - 19:00PM</li>
              <li>Sun: Closed</li>
            </ul>

            <ul className="footer-content__2">
            <li>
                <span>Contact</span> 
              </li>
              
              <li>
                <a href="tel:123456789">
                  <i className="fa-solid fa-phone"></i> &nbsp; 0112 050 050
                </a>
              </li>

              <li>
                <a
                  href="mailto: 
                carrental@gmail.com"
                >
                  <i className="fa-solid fa-envelope"></i>
                  &nbsp; Vellaglobal.com
                </a>
              </li>
              </ul>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;
