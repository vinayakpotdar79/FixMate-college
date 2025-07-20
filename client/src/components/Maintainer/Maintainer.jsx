import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../../Footer";
const Maintainer = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get("http://localhost:3000/maintainer")
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
