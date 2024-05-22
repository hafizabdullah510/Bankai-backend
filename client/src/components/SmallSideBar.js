import React from "react";
import Wrapper from "../assets/wrappers/SmallSidebar";
import { useGlobalContext } from "../context/AppContext";
import { FaTimes } from "react-icons/fa";
import Logo from "./Logo";
import Navlinks from "./Navlinks";
const SmallSideBar = () => {
  const { showSideBar, toggleSidebar } = useGlobalContext();
  return (
    <Wrapper>
      <div
        className={
          showSideBar ? "sidebar-container show-sidebar" : "sidebar-container"
        }
      >
        <div className="content">
          <button className="close-btn" type="button" onClick={toggleSidebar}>
            <FaTimes />
          </button>
          <header>
            <Logo />
          </header>
          <Navlinks toggleSidebar={toggleSidebar} />
        </div>
      </div>
    </Wrapper>
  );
};

export default SmallSideBar;
