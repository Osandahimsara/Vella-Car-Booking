import Footer from "../components/Footer";
import Person1 from "../images/team/1.png";
import Person2 from "../images/team/2.png";
import Person3 from "../images/team/3.png";
import Person4 from "../images/team/4.png";
import Person5 from "../images/team/5.png";
import Person6 from "../images/team/6.png";
import "../CSS/drivers.css";

function Drivers() {
  const driversPpl = [
    { img: Person1, name: "Luke Miller", job: "Professional Driver" },
    { img: Person2, name: "Michael Diaz", job: "Senior Driver" },
    { img: Person3, name: "Briana Ross", job: "Expert Driver" },
    { img: Person4, name: "Lauren Rivera", job: "Professional Driver" },
    { img: Person5, name: "Martin Rizz", job: "Senior Driver" },
    { img: Person6, name: "Caitlyn Hunt", job: "Expert Driver" },
  ];
  
  return (
    <>
      <section className="drivers-page">
        <div className="container">
          <div className="team-container">
            {driversPpl.map((driver, id) => (
              <div key={id} className="team-container__box">
                <div className="team-container__box__img-div">
                  <img src={driver.img} alt="driver_img" />
                </div>
                <div className="team-container__box__descr">
                  <h3>{driver.name}</h3>
                  <p>{driver.job}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </section>
    </>
  );
}

export default Drivers;