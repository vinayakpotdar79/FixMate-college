import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Navbar({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const navLinks = {
    reporter: [
      { name: "Dashboard", path: "/reporter/dashboard" },
      { name: "Report Issue", path: "/reporter/report" },
      { name: "My Issues", path: "/reporter/myissues" },
    ],
    maintainer: [
      { name: "Dashboard", path: "/maintainer/dashboard" },
      { name: "Assigned Issues", path: "/maintainer/assigned-issues" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "All Issues", path: "/admin/issues" },
      { name: "Manage Users", path: "/admin/users" },
    ],
  };

  const links = navLinks[role] || [];

  const logoutUser = async () => {
    try {
      await API.post("/logout", {}, { withCredentials: true });
      navigate("/"); // 👈 Redirect to login/home
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left-aligned Hamburger */}
            <div className="flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-800 focus:outline-none md:hidden mr-4"
                aria-label="Toggle Menu"
              >
                ☰
              </button>
              <Link
                to={`/${role}/dashboard`}
                className="text-3xl font-bold text-blue-400"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/18208/18208249.png"
                    alt="Maintenance Icon"
                    className="w-10 h-10"
                  />
                  <span>FixMate</span>
                </div>
              </Link>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex space-x-6">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className=" hover:text-blue-400 transition"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to={`/${role}/profile`}
                className="hover:text-blue-400 transition"
              >
                Profile
              </Link>
              <Link
                to={`/help?role=${role}`}
                className=" hover:text-blue-400 transition"
              >
                Help
              </Link>
              <Link
                to={`/contact?role=${role}`}
                className=" hover:text-blue-400 transition"
              >
                Contact
              </Link>
              <button
                onClick={logoutUser}
                className="text-red-600 font-semibold hover:text-red-400 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Slide-in Menu from Left */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="p-4 border-b bg-gradient-to-r from-violet-600 to-indigo-700 flex  justify-between items-center">
          <h2 className="text-xl  font-bold text-blue-400">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-600 text-xl"
          >
            ✖
          </button>
        </div>
        <nav className="flex flex-col px-4 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-gray-800 text-lg hover:text-blue-600"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to={`/${role}/profile`}
            onClick={() => setIsOpen(false)}
            className="text-gray-800 text-lg hover:text-blue-600"
          >
            Profile
          </Link>
          <Link
            to={`/help?role=${role}`}
            className="text-gray-800 text-lg hover:text-blue-600"
          >
            Help
          </Link>
          <Link
            to={`/contact?role=${role}`}
            className="text-gray-800 text-lg hover:text-blue-600"
          >
            Contact
          </Link>

          <Link
            to="/logout"
            onClick={() => {
              logoutUser();
              setIsOpen(false);
            }}
            className="text-red-600 text-lg font-semibold"
          >
            Logout
          </Link>
        </nav>
      </div>
    </>
  );
}
