import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import API from "../../api";

const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);

  const [sortBy, setSortBy] = useState("created_at");
  const [isLoading, setIsLoading] = useState(true);

  const [reporters, setReporters] = useState([]);
  const [selectedReporter, setSelectedReporter] = useState("");

  // Fetch Issues on Sort or Initial Load
  useEffect(() => {
    fetchIssues();
  }, [sortBy]);

  // If reporter selected → filter table
  useEffect(() => {
    if (selectedReporter === "") {
      setFilteredIssues(issues);
    } else {
      setFilteredIssues(
        issues.filter((i) => (i.username || "Unknown") === selectedReporter)
      );
    }
  }, [selectedReporter, issues]);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/issues");
      let sorted = [...res.data.issues];

      // Sorting
      if (sortBy === "floor") {
        sorted.sort((a, b) => {
          if (a.floor === "Ground Floor" && b.floor !== "Ground Floor") return -1;
          if (b.floor === "Ground Floor" && a.floor !== "Ground Floor") return 1;

          const aNum = parseInt(a.floor.replace(/\D/g, "")) || 0;
          const bNum = parseInt(b.floor.replace(/\D/g, "")) || 0;
          return aNum - bNum;
        });
      } else if (sortBy === "status") {
        sorted.sort((a, b) => a.status.localeCompare(b.status));
      } else {
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      setIssues(sorted);
      setFilteredIssues(sorted);

      // Unique Reporter List
      const uniqueNames = Array.from(
        new Set(sorted.map((item) => item.username || "Unknown"))
      );
      setReporters(uniqueNames);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Download ALL issues
  const handleDownloadAll = () => {
    if (!issues.length) return;

    const formatted = issues.map((issue) => ({
      Floor: issue.floor,
      Room: issue.room,
      Device: issue.device,
      Description: issue.description,
      Status: issue.status,
      Remark: issue.remark || "-",
      "Reported By": issue.username,
      Date: new Date(issue.created_at).toLocaleString("en-IN"),
    }));

    const sheet = XLSX.utils.json_to_sheet(formatted);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "All Issues");

    const buffer = XLSX.write(book, { type: "array", bookType: "xlsx" });
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `All_Issues_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Download selected reporter issues
  const handleReporterDownload = () => {
    if (!selectedReporter) return;

    const filtered = issues.filter(
      (i) => (i.username || "Unknown") === selectedReporter
    );

    const formatted = filtered.map((issue) => ({
      Floor: issue.floor,
      Room: issue.room,
      Device: issue.device,
      Description: issue.description,
      Status: issue.status,
      Remark: issue.remark || "-",
      "Reported By": issue.username,
      Date: new Date(issue.created_at).toLocaleString("en-IN"),
    }));

    const sheet = XLSX.utils.json_to_sheet(formatted);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, selectedReporter);

    const buffer = XLSX.write(book, { type: "array", bookType: "xlsx" });

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${selectedReporter}_Issues_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Status Color Badge
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
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

            <div>
              <h2 className="text-2xl font-bold text-gray-800">📋 All Maintenance Issues</h2>
              <p className="text-gray-500 text-sm mt-1">
                Showing <strong>{filteredIssues.length}</strong> issues
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="created_at">Newest First</option>
                <option value="status">Status</option>
                <option value="floor">Floor</option>
              </select>

              {/* Reporter Filter */}
              <select
                value={selectedReporter}
                onChange={(e) => setSelectedReporter(e.target.value)}
                className="border px-3 py-2 rounded-lg text-sm"
              >
                <option value="">All Reporters</option>
                {reporters.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {/* Download Reporter */}
              <button
                onClick={handleReporterDownload}
                disabled={!selectedReporter}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedReporter
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                ⬇️ Reporter Excel
              </button>

              {/* Download ALL */}
              <button
                onClick={handleDownloadAll}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
              >
                ⬇️ All Issues Excel
              </button>

            </div>
          </div>
        </div>

        {/* TABLE */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Location</th>
                  <th className="px-6 py-3 text-left font-semibold">Device</th>
                  <th className="px-6 py-3 text-left font-semibold">Description</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Reported By</th>
                  <th className="px-6 py-3 text-left font-semibold">Remarks</th>
                  <th className="px-6 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{issue.floor}</div>
                      <div className="text-gray-500">Room {issue.room}</div>
                    </td>
                    <td className="px-6 py-4">{issue.device}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{issue.description}</td>
                    <td className="px-6 py-4">{getStatusBadge(issue.status)}</td>
                    <td className="px-6 py-4">{issue.username}</td>
                    <td className="px-6 py-4">{issue.remark || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{new Date(issue.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(issue.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredIssues.length && (
              <div className="p-10 text-center text-gray-500">No issues found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllIssues;
