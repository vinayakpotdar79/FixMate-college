import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    API.get("/profile")
      .then((res) => {
        setUser(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-600">
        Failed to load profile. Please try again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white/30"
                />
                <span className="absolute bottom-0 right-0 bg-white text-violet-600 text-xs font-bold px-2 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <p className="text-violet-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard 
                icon="📱"
                title="Phone"
                value={user.phone || "Not provided"}
              />
              <InfoCard
                icon="📅"
                title="Member Since"
                value={new Date(user.joined_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="text-violet-600">ℹ️</span> Account Information
              </h3>
              <div className="space-y-3">
                <InfoRow label="Username" value={user.username} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Role" value={user.role} />
              </div>
            </div>
          </div>        
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, title, value }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-medium text-gray-500">{title}</h3>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

export default Profile;