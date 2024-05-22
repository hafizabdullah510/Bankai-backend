import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo, FormRow, Alert } from "../components";
import Wrapper from "../assets/wrappers/RegisterPage";
import { useGlobalContext } from "../context/AppContext";
const initialState = {
  name: "",
  email: "",
  password: "",
  isMember: true,
};

const Register = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState(initialState);
  const { user, isLoading, showAlert, displayAlert, loginUser } =
    useGlobalContext();

  const onFormSubmit = (e) => {
    e.preventDefault();
    const { email, password } = values;
    if (!email || !password) {
      displayAlert();
      return;
    }
    const currentUser = { email, password };
    loginUser(currentUser);
  };

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [user]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <Wrapper className="full-page">
      <form className="form" onSubmit={(e) => onFormSubmit(e)}>
        <Logo />
        <h3>Login</h3>
        {showAlert && <Alert />}

        <FormRow
          name="email"
          type="email"
          value={values.email}
          handleChange={(e) => handleChange(e)}
          labelText="email"
        />
        <FormRow
          name="password"
          type="password"
          value={values.password}
          handleChange={(e) => handleChange(e)}
          labelText="password"
        />

        <button type="submit" className="btn btn-block" disabled={isLoading}>
          Submit
        </button>
      </form>
    </Wrapper>
  );
};

export default Register;
