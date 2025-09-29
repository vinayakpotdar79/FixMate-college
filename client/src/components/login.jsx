import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from '../api';
const Login = () => {
  const [input, setInput] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: (e.target.value).trim(),
    });
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset any previous error

    try {
      const res = await API.post("/login", {
        username: input.username,
        password: input.password,
        role,
      });

      console.log("Logged in:", res.data);
      navigate(`/${role}`);
    } catch (err) {
      console.log(err)
      console.error("Login failed:", err);
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      setMessage(msg);
    }
  };

  return (
    <div className="bg-[url('/assets/Login.jpg')] min-h-screen w-full bg-cover bg-no-repeat bg-center flex items-center justify-center px-4">
      <div className="bg-white/30 backdrop-brightness-50 p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-1">Username</label>
            <input
              required
              type="text"
              name="username"
              value={input.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-lg bg-white/70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={input.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-lg bg-white/70 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 pr-10"
              />
              <span
                onClick={togglePassword}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-700"
              >
                {showPassword ? <Eye size={25} /> : <EyeOff size={25} />}
              </span>
            </div>
          </div>

          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/80 text-black focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select role</option>
            <option value="maintainer">Maintainer</option>
            <option value="admin">Admin</option>
            <option value="reporter">Reporter</option>
          </select>

          {message && (
            <div className="text-red-500 text-xl font-semibold text-center">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
