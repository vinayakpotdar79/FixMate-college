import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API from "../../api";
const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [sortBy, setSortBy] = useState("created_at");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [sortBy]);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/issues");

      let sorted = [...res.data.issues];
      
      if (sortBy === "floor") {
        sorted.sort((a, b) => {
          // Handle Ground Floor sorting
          if (a.floor === "Ground Floor" && b.floor !== "Ground Floor") return -1;
          if (b.floor === "Ground Floor" && a.floor !== "Ground Floor") return 1;
          if (a.floor === "Ground Floor" && b.floor === "Ground Floor") return 0;
          
          // Extract numbers from floor strings (e.g., "Floor 1" -> 1)
          const aNum = parseInt(a.floor.replace(/\D/g, '')) || 0;
          const bNum = parseInt(b.floor.replace(/\D/g, '')) || 0;
          
          return aNum - bNum;
        });
      } else if (sortBy === "status") {
        sorted.sort((a, b) => a.status.localeCompare(b.status));
      } else if (sortBy === "created_at") {
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setIssues(sorted);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!issues.length) return;

    const formattedData = issues.map((issue) => ({
      Floor: issue.floor,
      Room: issue.room,
      Device: issue.device,
      Description: issue.description,
      Status: issue.status,
      "Reported By": issue.username,
      Remark: issue.remark || "-",
      Date: new Date(issue.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Issues");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `All_Issues_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-100 bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">📋 All Maintenance Issues</h2>
              <p className="text-gray-500 text-sm mt-1">
                {issues.length} issues • Sorted by <strong>{sortBy.replace("_", " ")}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="created_at">Newest First</option>
                <option value="status">Status</option>
                <option value="floor">Floor</option>
              </select>

              <button
                onClick={handleDownload}
                disabled={!issues.length}
                className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium ${
                  issues.length
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                ⬇️ Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Location</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Device</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Description</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Reported By</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Remarks</th>
                  <th className="px-6 py-3 text-left text-gray-500 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{issue.floor}</div>
                      <div className="text-gray-500">Room {issue.room}</div>
                    </td>
                    <td className="px-6 py-4">{issue.device}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{issue.description}</td>
                    <td className="px-6 py-4">{getStatusBadge(issue.status)}</td>
                    <td className="px-6 py-4">{issue.username}</td>
                    <td className="px-6 py-4 max-w-xs">
                      {issue.remark ? (
                        <div className="text-gray-700 text-sm">
                          {issue.remark}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{new Date(issue.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {issues.length === 0 && (
              <div className="p-8 text-center text-gray-500">No issues found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIssues;