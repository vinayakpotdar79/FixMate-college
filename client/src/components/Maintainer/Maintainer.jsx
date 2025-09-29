import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../../Footer";
import API from "../../api";
const Maintainer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/maintainer")
      .then((res) => console.log(res.data))
      .catch((err) => {
        console.error("Not authenticated:", err);
        navigate("/");
      });
  }, []);

  return (
    <>
      <Navbar role="maintainer" /> {/* ✅ Only here */}
        <Outlet />
        <Footer/>
    </>
  );
};

export default Maintainer;
