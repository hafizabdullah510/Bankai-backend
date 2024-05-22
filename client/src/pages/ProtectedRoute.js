import React from "react";
import { useGlobalContext } from "../context/AppContext";
import { Navigate } from "react-router-dom";
import { Loading } from "../components/index";
const ProtectedRoute = ({ children }) => {
  // children will be shared layout
  const { user, userLoading } = useGlobalContext();
  if (userLoading) return <Loading />;
  if (!user) {
    return <Navigate to="/landing" />;
  }
  return children;
};

export default ProtectedRoute;
