import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Building } from 'lucide-react';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

const AVAILABLE_SKILLS = [
  { id: 'skl-01', name: 'Cleaning & Sanitation' },
  { id: 'skl-02', name: 'Cooking & Food Prep' },
  { id: 'skl-03', name: 'Agriculture & Farming' },
  { id: 'skl-04', name: 'Customer Service' },
  { id: 'skl-05', name: 'Stock Handling & Inventory' },
  { id: 'skl-06', name: 'Car Washing & Auto Detailing' },
  { id: 'skl-07', name: 'Tailoring & Garments' },
  { id: 'skl-08', name: 'Computer Basics & Data Entry' },
  { id: 'skl-09', name: 'Construction Helper' },
  { id: 'skl-10', name: 'Hairdressing & Barbering' },
  { id: 'skl-11', name: 'Electrical Maintenance' },
  { id: 'skl-12', name: 'Plumbing Assistance' }
];

export default function NewJobPage() {
  const navigate = useNavigate();
  const { addToast } = useNotifications();
  const [employers, setEmployers] = useState([]);
  const [form, setForm] = useState({
    employer_id: '',
    title: '',
    location: 'Kampala',
    category: 'Logistics & Retail',
    pay_amount: '25000',
    pay_frequency: 'daily',
    description: '',
    required_skills: []
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/employers').then(res => {
      if (res.success) setEmployers(res.data.employers || res.data);
    }).catch(console.error);
  }, []);

  const toggleSkill = (skillId) => {
    setForm(f => ({
      ...f,
      required_skills: f.required_skills.includes(skillId)
        ? f.required_skills.filter(id => id !== skillId)
        : [...f.required_skills, skillId]
    }));
  };

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/jobs', form);
      if (res.success) {
        addToast('Job Posted', `"${form.title}" has been added to the reintegration jobs board.`, 'success');
        navigate(`/jobs/${res.data.id}`);
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to post job', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/jobs" className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Post New Reintegration Job</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create a vetted employment opportunity for recovering clients</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setField('title', e.target.value)}
              placeholder="e.g. General Labourer – Produce Market"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Employer *</label>
            <select required value={form.employer_id} onChange={(e) => setField('employer_id', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
              <option value="">— Select Employer —</option>
              {employers.map(emp => <option key={emp.id} value={emp.id}>{emp.company_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Location / Area *</label>
            <input type="text" required value={form.location} onChange={(e) => setField('location', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Category</label>
            <select value={form.category} onChange={(e) => setField('category', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
              {['Logistics & Retail','Facility Maintenance','Agriculture','Hospitality & Catering','Automotive Services','Manufacturing','Office Administration','Trades & Repairs','Personal Care'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pay Amount (UGX) *</label>
              <input type="number" required value={form.pay_amount} onChange={(e) => setField('pay_amount', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Pay Frequency</label>
              <select value={form.pay_frequency} onChange={(e) => setField('pay_frequency', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="per_job">Per Job</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Job Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)}
              placeholder="Describe the duties, hours, physical requirements..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Required / Preferred Skills (for AI matching)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {AVAILABLE_SKILLS.map(skill => {
              const selected = form.required_skills.includes(skill.id);
              return (
                <button type="button" key={skill.id} onClick={() => toggleSkill(skill.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 ${selected ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  <span className="truncate text-2xs">{skill.name}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/jobs" className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold">Cancel</Link>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md disabled:opacity-50">
            {submitting ? 'Posting...' : 'Post Reintegration Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
