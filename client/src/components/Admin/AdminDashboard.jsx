import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";
const AdminDashboard = () => {
  const [stats, setStats] = useState({})

  const [recentIssues, setRecentIssues] = useState([]);

  // Fetch statistics
  useEffect(() => {
    API
      .get("/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Error fetching stats", err));
  }, []);

  // Fetch recent issues
  useEffect(() => {
    API
      .get("/issues")
      .then((res) => setRecentIssues(res.data.issues || []))
      .catch((err) => console.error("Error fetching recent issues", err));
  }, []);

  return (
    <div className="bg-gradient-to-br from-violet-100 to-indigo-100 p-6">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">📊 Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Users" value={stats.totalUsers} color="bg-gray-100" />
        <Card title="Total Issues" value={stats.totalIssues} color="bg-yellow-100" />
        <Card title="Pending Issues" value={stats.pendingIssues} color="bg-red-100" />
        <Card title="Resolved Issues" value={stats.resolvedIssues} color="bg-green-100" />
      </div>

      <div className="mt-15">
        <h2 className="text-xl font-semibold text-gray-800 mb-7">📝 Recent Issues</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto mb-7">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gradient-to-br from-indigo-100 to-blue-700 text-gray-800">
              <tr>
                <th className="p-3 text-left">Device</th>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentIssues.slice(0, 5).map((issue) => (
                <tr key={issue.id} className="border-t">
                  <td className="p-3">{issue.device}</td>
                  <td className="p-3">{issue.room}</td>
                  <td className="p-3">{issue.priority}</td>
                  <td className="p-3 capitalize">{issue.status}</td>
                  <td className="p-3">{new Date(issue.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentIssues.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No recent issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className={`${color} p-5 rounded shadow`}>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

export default AdminDashboard;
