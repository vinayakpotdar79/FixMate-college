import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, // needed for sessions/cookies
});

export default API;
