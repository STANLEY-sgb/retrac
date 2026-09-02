import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, ToggleLeft, ToggleRight, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: 'Password123!', role: 'caseworker' });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotifications();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.success && res.data) setUsers(res.data.users || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.patch(`/admin/users/${userId}`, { is_active: !currentActive });
      addToast('User Updated', `User has been ${!currentActive ? 'activated' : 'deactivated'}.`, 'success');
      fetchUsers();
    } catch (err) {
      addToast('Error', err.message || 'Failed to update user', 'danger');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/auth/register', form);
      if (res.success) {
        addToast('User Created', `${form.full_name} added as ${form.role}.`, 'success');
        setShowModal(false);
        setForm({ full_name: '', email: '', password: 'Password123!', role: 'caseworker' });
        fetchUsers();
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to create user', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const roleColor = { admin: 'bg-purple-100 text-purple-900 border-purple-200', caseworker: 'bg-blue-100 text-blue-900 border-blue-200', employer: 'bg-teal-100 text-teal-900 border-teal-200' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Create, activate, and assign roles to system users</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchUsers} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-400 font-bold flex items-center justify-center text-xs">
                          {(user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-2xs">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-lg border text-2xs font-bold capitalize ${roleColor[user.role] || roleColor.caseworker}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-lg text-2xs font-bold border ${user.is_active ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {user.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 text-2xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ml-auto ${user.is_active ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                      >
                        {user.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New User">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input required type="text" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <input required type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                <option value="caseworker">Caseworker</option>
                <option value="admin">Admin</option>
                <option value="employer">Employer</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
