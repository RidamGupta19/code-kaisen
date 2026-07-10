import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Edit, Trash2, Shield, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [editingUserId, setEditingUserId] = useState(null);
  const [editRole, setEditRole] = useState('Citizen');
  const [editDept, setEditDept] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Creation states
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createRole, setCreateRole] = useState('Department Officer');
  const [createDept, setCreateDept] = useState('');
  const [createWard, setCreateWard] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchUsers(), fetchDepartments()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user?')) return;

    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        toast.success('User deleted successfully.');
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditRole(user.role);
    setEditDept(user.department?._id || '');
  };

  const handleUpdate = async (id) => {
    setSubmitLoading(true);
    try {
      const res = await axios.put(`/api/admin/users/${id}`, {
        role: editRole,
        department: editRole === 'Department Officer' ? editDept : null,
      });

      if (res.data.success) {
        toast.success('User profile updated.');
        setEditingUserId(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user profile.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!createName || !createEmail || !createPassword || !createPhone) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (createRole === 'Department Officer' && !createDept) {
      toast.error('Please select a department for the officer.');
      return;
    }
    if (createRole === 'Citizen' && !createWard) {
      toast.error('Please select a ward for the citizen.');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await axios.post('/api/admin/users', {
        name: createName,
        email: createEmail,
        password: createPassword,
        phone: createPhone,
        role: createRole,
        department: createRole === 'Department Officer' ? createDept : undefined,
        ward: createRole === 'Citizen' ? createWard : undefined
      });
      if (res.data.success) {
        toast.success('Account created successfully.');
        setCreateName('');
        setCreateEmail('');
        setCreatePassword('');
        setCreatePhone('');
        setCreateDept('');
        setCreateWard('');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create user account.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">System User Management</h2>
        <p className="text-xs text-slate-400 mt-1">Supervise user registrations, adjust department officer access, and audit accounts</p>
      </div>

      {/* Create New User Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-850">
        <h3 className="font-bold text-sm text-slate-200 border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-gov-400" />
          Create System Account
        </h3>
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Full Name</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500"
              placeholder="e.g. Amit Patel"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Email Address</label>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500 font-mono"
              placeholder="e.g. amit@setu.gov.in"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Password</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500"
              placeholder="Min. 6 characters"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Contact Phone</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500"
              placeholder="e.g. 9888888889"
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold">Account Role</label>
            <select
              className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500"
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
            >
              <option value="Department Officer">Department Officer</option>
              <option value="Super Admin">Super Nodal Admin</option>
              <option value="Citizen">Citizen</option>
            </select>
          </div>

          {createRole === 'Department Officer' && (
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Assigned Utility Department</label>
              <select
                className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500"
                value={createDept}
                onChange={(e) => setCreateDept(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          )}

          {createRole === 'Citizen' && (
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Resident Ward</label>
              <select
                className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-slate-200 outline-none focus:border-gov-500"
                value={createWard}
                onChange={(e) => setCreateWard(e.target.value)}
                required
              >
                <option value="">Select Ward</option>
                <option value="Ward 12 (TT Nagar)">Ward 12 (TT Nagar)</option>
                <option value="Ward 45 (MP Nagar)">Ward 45 (MP Nagar)</option>
                <option value="Ward 52 (Habibganj)">Ward 52 (Habibganj)</option>
                <option value="Ward 80 (Kolar)">Ward 80 (Kolar)</option>
              </select>
            </div>
          )}

          <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={createLoading}
              className="px-6 py-2 bg-gov-600 text-slate-950 rounded-xl font-bold hover:bg-gov-500 disabled:opacity-50 transition"
            >
              {createLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel p-5 rounded-2xl border border-slate-850">
        <h3 className="font-bold text-sm text-slate-200 border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">
          <Users className="h-4.5 w-4.5 text-gov-400" />
          Registered Users Catalog
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading user catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 pl-2">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Affiliation / Ward</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {users.map((u) => {
                  const isEditing = editingUserId === u._id;
                  
                  return (
                    <tr key={u._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3.5 pl-2 font-semibold text-slate-200">{u.name}</td>
                      <td className="py-3.5 text-slate-400 font-mono">{u.email}</td>
                      <td className="py-3.5 text-slate-400">{u.phone}</td>
                      <td className="py-3.5">
                        {isEditing ? (
                          <select
                            className="bg-slate-950 border border-slate-700/60 rounded px-2 py-1 text-xs text-slate-200"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          >
                            <option value="Citizen">Citizen</option>
                            <option value="Department Officer">Department Officer</option>
                            <option value="Super Admin">Super Admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                            u.role === 'Department Officer' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5">
                        {isEditing ? (
                          editRole === 'Department Officer' ? (
                            <select
                              className="bg-slate-950 border border-slate-700/60 rounded px-2 py-1 text-xs text-slate-200"
                              value={editDept}
                              onChange={(e) => setEditDept(e.target.value)}
                            >
                              <option value="">Select Department</option>
                              {departments.map((d) => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )
                        ) : (
                          <span className="text-slate-300">
                            {u.role === 'Department Officer' ? u.department?.name || 'Unassigned' : u.ward || 'General'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdate(u._id)}
                              disabled={submitLoading}
                              className="px-2 py-1 bg-gov-600 text-slate-950 rounded font-bold hover:bg-gov-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(u)}
                              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {/* Prevent self deletion */}
                            {u.email !== 'admin@setu.gov.in' && (
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="p-1 rounded bg-slate-900 border border-slate-800 text-rose-500 hover:text-rose-400"
                                title="Delete user"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
