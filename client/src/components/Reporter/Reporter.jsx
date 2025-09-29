import React, { useEffect, useState } from "react";
import axios from "axios";
import {Routes,Link,Outlet,Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Footer from "../../Footer";
import API from "../../api";
 const Reporter = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/reporter")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error("Not authenticated:", err);
        navigate("/");  // Redirect to login if unauthorized
      });
  }, []);

  return (
    <>
    <Navbar role="reporter"/>
      <Outlet />
      <Footer/>
  </>);
};

export default Reporter;
