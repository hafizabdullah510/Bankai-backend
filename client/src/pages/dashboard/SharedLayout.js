import React from "react";
import { Outlet } from "react-router-dom";
import { BigSideBar, SmallSideBar, NavBar } from "../../components";
import Wrapper from "../../assets/wrappers/SharedLayout";
const SharedLayout = () => {
  return (
    <Wrapper>
      <main className="dashboard">
        <SmallSideBar />
        <BigSideBar />

        <div>
          <NavBar />
          <div className="dashboard-page">
            <Outlet />
          </div>
        </div>
      </main>
    </Wrapper>
  );
};

export default SharedLayout;
