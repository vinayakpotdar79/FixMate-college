import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import API from "../../api";
const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await API.get("/myissues");
        console.log(res.data);
        setIssues(res.data.issues || []);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-violet-100 to-indigo-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-violet-800">My Reported Issues</h2>

      {loading ? (
        <p className="text-gray-600">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-gray-600">No issues found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{issue.device}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(issue.priority)}`}>
                  {issue.priority?.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
              <p className="text-sm text-gray-700">
                <strong>Room:</strong> {issue.room}
              </p>

              <div className="flex justify-between items-center mt-4">
                <span className={`text-sm font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status?.replace("_", " ").toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(issue.created_at), "dd MMM yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Tailwind classes for status
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded";
    case "in_progress":
      return "text-blue-700 bg-blue-100 px-2 py-0.5 rounded";
    case "resolved":
      return "text-green-700 bg-green-100 px-2 py-0.5 rounded";
    case "rejected":
      return "text-red-700 bg-red-100 px-2 py-0.5 rounded";
    default:
      return "text-gray-600 bg-gray-100 px-2 py-0.5 rounded";
  }
};

// Tailwind classes for priority
const getPriorityColor = (priority) => {
  priority=priority.toLowerCase();
  switch (priority) {
    case "high":
      return "bg-red-200 text-red-700 font-bold";
    case "medium":
      return "bg-yellow-200 text-yellow-800 font-semibold";
    case "low":
      return "bg-green-200 text-green-800 font-medium";
    default:
      return "bg-gray-200 text-gray-700";
  }
};

export default MyIssues;
