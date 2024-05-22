import React from "react";
import { Link } from "react-router-dom";
import Wrapper from "../assets/wrappers/ErrorPage";
import Notfound from "../assets/images/not-found.svg";
const Error = () => {
  return (
    <Wrapper className="full-page">
      <div>
        <img src={Notfound} alt="notFound" />
        <h3>OOPS! Page Not Found</h3>
        <p>We cannot find page you are looking for</p>
        <Link to="/">Back Home</Link>
      </div>
    </Wrapper>
  );
};

export default Error;
