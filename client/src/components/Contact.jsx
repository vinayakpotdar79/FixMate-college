import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Navbar from './Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import axios from 'axios';
import API from '../api';

const Contact = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    API.get("/auth/check")
      .then((res) => {
        console.log(res.data.authenticated);
      })
      .catch((err) => {
        console.error("Not authenticated:", err);
        navigate("/");  // Redirect to login if unauthorized
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send form data to your backend
      await API.post("/contact", formData);
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <>
      <Navbar role={role}/>
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center py-10 px-4">
        {/* Success Popup */}
        {showSuccess && (
          <div className="fixed top-15 left-3 bg-green-700 text-white px-7 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
         ✅ Thank you for your message! We'll get back to you soon.
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Left Info Panel */}
          <div className="bg-indigo-600 text-white p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-6">📬 Contact Us</h2>
              <p className="text-indigo-100 mb-6">
                Have questions or need help? Reach out to us anytime. We're happy to help and will get back to you as soon as possible.
              </p>

              <div className="space-y-4 text-indigo-100 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" /> support@mmscollege.com
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" /> +91 98765 43210
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" /> Vidyavardhini Campus, Mumbai, India
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-indigo-200">
              📍 Our Office is located inside the main college building, 1st Floor.
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-8 bg-white">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Send us a message</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Message</label>
                <textarea
                  rows="4"
                  name="message"
                  placeholder="Type your message..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit" 
                className="bg-indigo-600 text-white w-full py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;