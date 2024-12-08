import "./homepage.scss";

const Homepage = () => {
  return (
    <div className="homepage">
      <div className="textContainer">
        <div className="wrapper">
          <h1 className="title">
            AI-Powered Circuit Debugging and Optimization
          </h1>
          <p>
            CircuitFixer makes circuit debugging easy and intuitive! With AI suggestions for quick fixes and improvements, you can design smarter circuits faster—saving time, reducing errors, and boosting your project’s success.
          </p>

          <div className="boxes">
            <div className="box">
              <h1>99.99%</h1>
              <h2>With Accuracy and Precision</h2>
            </div>
            <div className="box">
              <h1>4.5+</h1>
              <h2>Ratings</h2>
            </div>
            <div className="box">
              <h1>1 Million </h1>
              <h2>users</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="imgContainer">
        <img src="/32999.jpg" alt="bg" />
      </div>
    </div>
  );
};

export default Homepage;
