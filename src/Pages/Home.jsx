import Hero from "../components/Hero";
import BookCar from "../components/BookCar";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Hero />
      <BookCar />
      <div className="book-banner">
          <div className="book-banner__overlay"></div>
          <div className="container">
            <div className="text-content">
              <h2>Book a car by getting in touch with us</h2>
              <span>
                <i className="fa-solid fa-phone"></i>
                <h3> 0112 050 050</h3>
              </span>
            </div>
          </div>
        </div>
      <Footer />
    </>
  );
}

export default Home;
