import { useEffect } from 'react';
import Navbar from './Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import axios from 'axios';
import API from '../api';

const Help = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role');

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
  return (
    <>
      <Navbar role={role} />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6">🛠 Help & Support</h2>
          <p className="text-gray-700 mb-6">
            Welcome to the Maintenance Management System Help Center. Below are some frequently asked questions and general guidance to help you get started or troubleshoot common issues.
          </p>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-indigo-600">💡 How to report a maintenance issue?</h4>
              <p className="text-gray-600 mt-1">
                Go to the dashboard, click on <strong>"Report Issue"</strong>, select floor and room, choose the device (AC, Fan, etc.), describe the problem, and submit.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-indigo-600">🧰 What if an issue is not resolved?</h4>
              <p className="text-gray-600 mt-1">
                If your issue is still unresolved, you can add a follow-up remark or notify the floor maintainer again. If still pending, contact the admin directly using the <strong>Contact</strong> page.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-indigo-600">🔐 Forgot login credentials?</h4>
              <p className="text-gray-600 mt-1">
                Please reach out to your admin or faculty-in-charge to reset or retrieve your username and password. We currently do not support automatic password reset.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-indigo-600">📄 Can I view previously submitted issues?</h4>
              <p className="text-gray-600 mt-1">
                Yes, go to the <strong>All Issues</strong> tab to view your submitted issues, along with their status, remark, and resolution history.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-indigo-600">📤 How do I download reports?</h4>
              <p className="text-gray-600 mt-1">
                Admins can download Excel reports from the <strong>Admin All Issues</strong>. Look for the "📥 Download Excel" button at the top-right.
              </p>
            </div>
          </div>

          <div className="mt-10 text-sm text-gray-500 border-t pt-4">
            Still need help? Please visit the <span><strong>Contact</strong></span> page or email us at <strong>support@mmscollege.com</strong>.
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;
