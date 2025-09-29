import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
// import axios from "axios";
import Footer from "../../Footer";
import API from "../../api";
const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
      API.get("/admin")
      .then((res) => {
        console.log(res.data)
      })
      .catch((err) =>
        {   console.error("Not authenticated:", err);
           navigate("/")})
  }, []);

  return (
    <>
      <Navbar role="admin" />
      <Outlet />
      <Footer/>
    </>
  );
};

export default Admin;
