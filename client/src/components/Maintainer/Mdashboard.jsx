import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import API from "../../api";
const Mdashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    highPriority: [],
    recent: [],
  });

  useEffect(() => {
    API
      .get("/issues")
      .then((res) => {
        const allIssues = res.data.issues || [];
        const resolved = allIssues.filter((i) => i.status === "resolved").length;
        const pending = allIssues.filter((i) => i.status !== "resolved").length;
        const highPriority = allIssues.filter((i) => i.priority === "High");
        const recent = [...allIssues]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setStats({
          total: allIssues.length,
          resolved,
          pending,
          highPriority,
          recent,
        });
      })
      .catch((err) => {
        console.error("Error fetching maintainer issues:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-8 text-center">
        🔧 Maintainer Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        <SummaryCard title="Total Issues" value={stats.total} color="bg-gray-200" text="text-gray-800" icon="📋" />
        <SummaryCard title="Resolved" value={stats.resolved} color="bg-green-100" text="text-green-700" icon="✅" />
        <SummaryCard title="Pending" value={stats.pending} color="bg-yellow-100" text="text-yellow-800" icon="⏳" />
      </div>

      {/* High Priority Issues */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-red-700 mb-3">🚨 High Priority Issues</h3>
        {stats.highPriority.length === 0 ? (
          <p className="text-gray-600 italic">No high priority issues.</p>
        ) : (
          <ul className="space-y-3">
            {stats.highPriority.map((issue) => (
              <li key={issue.id} className="bg-red-50 border border-red-200 rounded-lg p-4 shadow">
                <p><strong>{issue.device}</strong> in <strong>{issue.room}</strong></p>
                <p className="text-sm text-gray-700">{issue.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h3 className="text-2xl font-semibold mb-4 text-indigo-700">🕒 Recent Issues</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm text-left border border-gray-200 rounded">
            <thead className="bg-indigo-100 text-indigo-800 font-semibold">
              <tr>
                <th className="px-4 py-2">Device</th>
                <th className="px-4 py-2">Room</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50 transition border-t">
                  <td className="px-4 py-2">{issue.device}</td>
                  <td className="px-4 py-2">{issue.room}</td>
                  <td className="px-4 py-2 capitalize text-gray-700">{issue.status}</td>
                  <td className="px-4 py-2 text-gray-500">{format(new Date(issue.created_at), "d/M/yyyy")}</td>
                </tr>
              ))}
              {stats.recent.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500 italic">
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

const SummaryCard = ({ title, value, color, text, icon }) => (
  <div className={`p-5 rounded-xl shadow-lg ${color} ${text} text-center`}>
    <div className="text-4xl mb-2">{icon}</div>
    <p className="text-md font-medium">{title}</p>
    <h3 className="text-3xl font-bold">{value}</h3>
  </div>
);

export default Mdashboard;
