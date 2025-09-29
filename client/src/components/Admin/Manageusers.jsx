import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../../api";
const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: "",email: "", password: "",phone:"", role: "reporter" });
  const [error, setError] = useState("");
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    API.get("/users", { withCredentials: true })
      .then((res) => {setUsers(res.data.users)
    console.log(res.data.users)})
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    API.delete(`/users/${id}`)
      .then(() => fetchUsers())
      .catch((err) => console.error(err));
  };

  const handleUpdate = () => {
    API.patch(`/users/${editingUser.id}`, editingUser)
      .then(() => {
        setEditingUser(null);
        fetchUsers();
      });
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.phone) {
      setError("All fields are required");
      return;
    }
    API.post("/users", newUser)
      .then(() => {
        setNewUser({ username: "", email: "", password: "",phone:"", role: "reporter" });
        fetchUsers();
      });
  };

  return (
    <div className="p-6  bg-gradient-to-br from-violet-100 to-indigo-100">
      <h2 className="text-2xl font-bold mb-4">👥 Manage Users</h2>

        {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}   
      
      {/* Add User Form */}
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h3 className="text-lg font-semibold mb-2">➕ Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input type="text" placeholder="Username" value={newUser.username} required
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            className="p-2 border rounded" />
          <input type="email" placeholder="Email" value={newUser.email} required
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="p-2 border rounded" />
          <input type="password" placeholder="Password" value={newUser.password} required
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            className="p-2 border rounded" />
             <input type="number" placeholder="Contact No." value={newUser.phone} required
            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
            className="p-2 border rounded" />
          <select value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="p-2 border rounded">
            <option value="reporter">Reporter</option>
            <option value="maintainer">Maintainer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button onClick={handleAddUser} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full table-auto text-sm">
          <thead className="bg-indigo-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">
                  {editingUser?.id === user.id ? (
                    <input
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                      className="p-1 border rounded w-full " 
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="p-3">
                  {editingUser?.id === user.id ? (
                    <input
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="p-1 border rounded w-full"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="p-3">
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                      className="p-1 border rounded w-full"
                    >
                      <option value="reporter">Reporter</option>
                      <option value="maintainer">Maintainer</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="p-3 space-x-2">
                  {editingUser?.id === user.id ? (
                    <button onClick={handleUpdate} className="px-2 py-1 bg-green-600 text-white rounded">Save</button>
                  ) : (
                    <button onClick={() => setEditingUser(user)} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                  )}
                  <button onClick={() => handleDelete(user.id)} className="px-2 py-1 my-2 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
