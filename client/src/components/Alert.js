import React from "react";
import { useGlobalContext } from "../context/AppContext";
const Alert = () => {
  const { alertType, alertText } = useGlobalContext();
  return <div className={`alert alert-${alertType}`}>{alertText}</div>;
};

export default Alert;
