import React, { useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import API from "../../api";
const ReportIssue = () => {
  const [form, setForm] = useState({
    floor: "",
    room: "",
    device: "",
    description: "",
    priority:"",
    createdAt:""
  });
 
const roomsByFloor = [
  {
    floor: "Ground Floor",
    rooms: [,3,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]
  },
  {
    floor: "Floor 1",
    rooms: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129]
  },
  {
    floor: "Floor 2",
    rooms: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210,211,212,213,214,215,216,217,218,219,220,221,222,223,224]
  },
  {
    floor: "Floor 3",
    rooms: [301, 302, 303, 304, 305, 306, 307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,324]
  },
  {
    floor: "Floor 4",
  rooms: [
      401, 402, 403, 404, 405, 406, 407, 408, 409, 410,
      411, 412, 413, 414, 415, 416, 417, 418, 419, 420,
      421, 422, 423, 424, 425, 426
    ]
    },
  {
    floor: "Floor 5",
  rooms: [
      501, 502, 503, 504, 505, 506, 507, 508, 509, 510,
      511, 512, 513, 514, 515, 516, 517, 518, 519, 520,
      521, 522
    ]  }
];

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const issueData = {
    ...form,
    device: form.device === "Other" ? form.customDevice : form.device,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await API.post("/report-issue", issueData);
       setForm({
        floor: "",
        room: "",
        device: "",
        customDevice: "",
        description: "",
        priority: "",
        createdAt: "",
      });
    setSubmitted(true);
    // Show success for 3 seconds, then reset form
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  } catch (err) {
    console.error("Error submitting issue:", err);
    alert(" Failed to submit. Please try again.");
  }
};

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 py-12 px-4">
        <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          <h2 className="text-3xl font-bold text-violet-700 text-center mb-6">📋 Report New Issue</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Floor No</label>
                   <select
                name="floor"
                value={form.floor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              >
               <option value="">Select Floor No</option>
               {roomsByFloor.map(floor =>
              (
              <option key={floor.floor} value={floor.floor}>{floor.floor}</option>
               )
                   )}
                   </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Room No </label>
                    <select
                name="room"
                value={form.room}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              >
             <option value="">Select Room </option>
               {roomsByFloor.find((f) => f.floor === form.floor)?.rooms.map((room) => (
                  <option key={room} value={room}>{room}
                  </option>
                ))}
             
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Device</label>
              <select
                name="device"
                value={form.device}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              >
                <option value="">Select a device</option>
                <option value="Fan">Fan</option>
                <option value="AC">AC</option>
                <option value="Projector">Projector</option>
                <option value="Light">Light</option>
                <option value="Door-Lock">Door-Lock</option>
                <option value="Other">Other</option>
              </select>
            </div>
             {form.device === "Other" && (
            <input
             type="text"
             name="customDevice"
             value={form.customDevice || ""}
             onChange={handleChange}
             placeholder="Enter device name"
             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              )}

            <div>
              <label className="block text-gray-700 font-medium mb-1">Issue Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <div>
          <label className="block text-gray-700 font-medium mb-1">Priority</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
             >
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            </select>
           </div>                
            <button
              type="submit"
              className="w-full bg-violet-600 flex items-center  justify-center gap-2 hover:bg-violet-700 text-white font-semibold py-2 rounded-lg transition-all duration-200"
            >
             Submit Issue<img src="https://cdn-icons-png.flaticon.com/128/17877/17877376.png" className="w-5 h-5" alt="submit-icon" />
            </button>
          {submitted && (
          <div className="w-xs fixed top-1/2 left-1/2 transform -translate-x-1/2 bg-green-100 text-green-800 px-7 py-3 rounded shadow-md z-50">
           Issue submitted successfully!  ✅
           </div>
           )}
          </form>
        </div>
      </div>
    </>
  );
};

export default ReportIssue;
