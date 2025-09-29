import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import API from "../../api";
const AssignedIssues = () => {
  const [issues, setIssues] = useState([]);
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = () => {
      API.get("/assigned-issues")
      .then((res) => {
        setIssues(res.data.issues || []);
      })
      .catch((err) => {
        console.error("Error fetching assigned issues:", err);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-l-4 border-yellow-500";
      case "resolved":
        return "bg-green-50 border-l-4 border-green-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleResolve = async (issueId) => {
    try {
      await API.patch(
        `/issues/${issueId}`,
        { status: "resolved", remark },
        { withCredentials: true }
      );
      fetchIssues();
      setExpandedIssue(null);
      setRemark("");
    } catch (err) {
      console.error("Error resolving issue:", err);
    }
  };

  const toggleExpandIssue = (issueId) => {
    if (expandedIssue === issueId) {
      setExpandedIssue(null);
    } else {
      setExpandedIssue(issueId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-blue-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            🛠️ Assigned Maintenance Tasks
          </h2>
        </div>

        {issues.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm max-w-md mx-auto">
            <p className="text-gray-600 text-lg">
              No maintenance tasks assigned to you yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${getStatusColor(issue.status)}`}
                onClick={() => toggleExpandIssue(issue.id)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {issue.device || "Maintenance Request"}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          issue.status === "resolved" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {issue.status === "resolved" ? "Resolved" : "Pending"}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{issue.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {format(new Date(issue.created_at), "MMM d, yyyy")}
                      </p>
                      <p className={`text-sm font-medium mt-1 ${getPriorityColor(issue.priority)}`}>
                        {issue.priority} Priority
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Location:</span> Floor {issue.floor} | Room {issue.room}
                    </p>
                  </div>

                  {expandedIssue === issue.id && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Assigned To</p>
                          <p className="font-medium">{issue.assigned_to || "You"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Reported On</p>
                          <p className="font-medium">
                            {format(new Date(issue.created_at), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>

                      {/* Remarks Section */}
                      {issue.status !== "resolved" && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resolution Notes
                          </label>
                          <textarea
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Describe the solution you implemented..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                          />
                        </div>
                      )}

                      {issue.remark && (
                        <div className={`mt-3 p-3 rounded-md ${
                          issue.status === "resolved" 
                            ? "bg-green-100" 
                            : "bg-yellow-100"
                        }`}>
                          <p className="text-sm font-medium text-gray-700">Previous Note:</p>
                          <p className="text-sm text-gray-600 mt-1">{issue.remark}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {issue.status !== "resolved" && (
                        <div className="mt-4 flex justify-end space-x-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedIssue(null);
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(issue.id);
                            }}
                            disabled={remark.trim() === ""}
                            className={`px-4 py-2 rounded-md text-white font-medium ${
                              remark.trim() === ""
                                ? "bg-emerald-300 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            Mark as Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedIssues;