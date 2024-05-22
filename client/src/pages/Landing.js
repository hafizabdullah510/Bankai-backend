import React from "react";
import { Logo } from "../components";
import { Link, Navigate } from "react-router-dom";
import main from "../assets/images/main-alternative.svg";
import { useGlobalContext } from "../context/AppContext";
import Wrapper from "../assets/wrappers/LandingPage";
const Landing = () => {
  const { user } = useGlobalContext();
  return (
    <React.Fragment>
      {user && <Navigate to="/" />}
      <Wrapper>
        <nav>
          <Logo />
        </nav>
        <div className="container page">
          <div className="info">
            <h1>
              job <span>tracking</span> app
            </h1>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut
              assumenda iusto dicta aperiam, quasi labore quam perferendis
              distinctio recusandae. Aperiam unde corporis sint minima numquam
              commodi soluta eligendi, quidem perferendis.
            </p>
            <Link to="/register" className="btn btn-hero">
              Login/Register
            </Link>
          </div>
          <img src={main} alt="job hunt" className="img main-img" />
        </div>
      </Wrapper>
    </React.Fragment>
  );
};

export default Landing;
