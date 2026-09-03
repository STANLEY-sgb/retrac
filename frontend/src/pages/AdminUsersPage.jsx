import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, ToggleLeft, ToggleRight, RefreshCw, AlertCircle, UserCheck, Building2, Phone } from 'lucide-react';
import api from '../api/client';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { useNotifications } from '../context/NotificationContext';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [caseworkers, setCaseworkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: 'Password123!',
    role: 'caseworker',
    company_name: '',
    location: 'Kampala, Uganda',
    sector: 'Facility Services & Retail',
    organization: 'ReTrac Community Recovery',
    title: 'Recovery Caseworker'
  });
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useNotifications();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.success && res.data) setUsers(res.data.users || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCaseworkers = async () => {
    try {
      const res = await api.get('/admin/caseworkers');
      if (res.success && res.data) setCaseworkers(res.data.caseworkers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchCaseworkers()]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await api.patch(`/admin/users/${userId}`, { is_active: !currentActive });
      addToast('User Updated', `User has been ${!currentActive ? 'activated' : 'deactivated'}.`, 'success');
      loadAll();
    } catch (err) {
      addToast('Error', err.message || 'Failed to update user', 'danger');
    }
  };

  const handleToggleCaseworkerActive = async (cwId, currentActive) => {
    try {
      await api.patch(`/admin/caseworkers/${cwId}/status`, { is_active: !currentActive });
      addToast('Staff Updated', `Caseworker has been ${!currentActive ? 'activated' : 'deactivated'}.`, 'success');
      loadAll();
    } catch (err) {
      addToast('Error', err.message || 'Failed to update caseworker', 'danger');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/admin/users', {
        name: form.full_name,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || '+256700000000',
        password: form.password,
        role: form.role,
        company_name: form.company_name || form.full_name,
        location: form.location,
        sector: form.sector,
        organization: form.organization,
        title: form.title
      });
      if (res.success) {
        addToast('User Created', `${form.full_name} added as ${form.role}.`, 'success');
        setShowModal(false);
        setForm({
          full_name: '',
          email: '',
          phone: '',
          password: 'Password123!',
          role: 'caseworker',
          company_name: '',
          location: 'Kampala, Uganda',
          sector: 'Facility Services & Retail',
          organization: 'ReTrac Community Recovery',
          title: 'Recovery Caseworker'
        });
        loadAll();
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">User & Staff Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage system accounts, caseworker caseloads, and employer partners</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add System User
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-white text-[#082f49] shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          All Accounts ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('caseworkers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'caseworkers' ? 'bg-[#082f49] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-teal-400" />
          Caseworker Staff Roster ({caseworkers.length})
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : activeTab === 'users' ? (
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
                          {(user.name || user.full_name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{user.name || user.full_name}</span>
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
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recent'}
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
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Caseworker Staff</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Organization & Title</th>
                  <th className="py-3.5 px-4 text-center">Active Caseload</th>
                  <th className="py-3.5 px-4 text-center">Open Alerts</th>
                  <th className="py-3.5 px-4 text-center">Interventions</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {caseworkers.map(cw => (
                  <tr key={cw.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#082f49] text-teal-400 font-bold flex items-center justify-center text-xs">
                          {cw.full_name ? cw.full_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{cw.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {cw.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="text-2xs font-mono">{cw.email}</div>
                      <div className="text-2xs text-slate-400">{cw.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{cw.title}</div>
                      <div className="text-2xs text-slate-400">{cw.organization}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg font-bold text-xs bg-sky-50 text-sky-800 border border-sky-200">
                        {cw.active_clients || 0} clients
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs border ${cw.open_alerts > 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {cw.open_alerts || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-700">
                      {cw.total_interventions || 0}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleCaseworkerActive(cw.id, cw.is_active)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ml-auto ${cw.is_active ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}
                      >
                        {cw.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                        {cw.is_active ? 'Deactivate' : 'Activate'}
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New System User">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <input required type="text" value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="e.g. Dr. Juliet Kemigisha"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="user@retrac.ug"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input type="text" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+2567..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
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
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold">
                <option value="caseworker">Caseworker / Counselor</option>
                <option value="admin">System Administrator</option>
                <option value="employer">Employer Partner</option>
              </select>
            </div>
          </div>

          {/* Conditional Role Fields */}
          {form.role === 'employer' && (
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80 space-y-2.5">
              <p className="text-[10px] font-extrabold uppercase text-teal-800 tracking-wider">Employer Profile Details</p>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Company / Business Name</label>
                <input required type="text" value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))}
                  placeholder="e.g. Nile Agriculture & Food Co."
                  className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Sector</label>
                  <input type="text" value={form.sector} onChange={(e) => setForm(f => ({ ...f, sector: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {form.role === 'caseworker' && (
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 space-y-2.5">
              <p className="text-[10px] font-extrabold uppercase text-sky-800 tracking-wider">Caseworker Metadata</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Organization</label>
                  <input type="text" value={form.organization} onChange={(e) => setForm(f => ({ ...f, organization: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-slate-900" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-lg text-slate-900" />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</button>
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
