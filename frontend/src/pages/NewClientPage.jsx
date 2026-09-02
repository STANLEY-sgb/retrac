import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, Building, Heart, ArrowLeft, Check, Plus } from 'lucide-react';
import api from '../api/client';
import { useNotifications } from '../context/NotificationContext';

const AVAILABLE_SKILLS = [
  { id: 'skl-01', name: 'Cleaning & Sanitation', cat: 'Facility Maintenance' },
  { id: 'skl-02', name: 'Cooking & Food Prep', cat: 'Hospitality' },
  { id: 'skl-03', name: 'Agriculture & Farming', cat: 'Agriculture' },
  { id: 'skl-04', name: 'Customer Service', cat: 'Retail & Hospitality' },
  { id: 'skl-05', name: 'Stock Handling & Inventory', cat: 'Logistics' },
  { id: 'skl-06', name: 'Car Washing & Auto Detailing', cat: 'Automotive' },
  { id: 'skl-07', name: 'Tailoring & Garments', cat: 'Manufacturing' },
  { id: 'skl-08', name: 'Computer Basics & Data Entry', cat: 'Office Admin' },
  { id: 'skl-09', name: 'Construction Helper', cat: 'Construction' },
  { id: 'skl-10', name: 'Hairdressing & Barbering', cat: 'Personal Care' },
  { id: 'skl-11', name: 'Electrical Maintenance', cat: 'Trades' },
  { id: 'skl-12', name: 'Plumbing Assistance', cat: 'Trades' }
];

export default function NewClientPage() {
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+2567');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('28');
  const [treatmentCentre, setTreatmentCentre] = useState('Butabika National Recovery Hospital');
  const [location, setLocation] = useState('Makindye, Kampala');
  const [preferredCategory, setPreferredCategory] = useState('Logistics & Retail');
  const [caseworkerId, setCaseworkerId] = useState('cw-01');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+2567');
  const [notes, setNotes] = useState('');
  const [selectedSkills, setSelectedSkills] = useState(['skl-04', 'skl-05']);
  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/clients', {
        full_name: fullName,
        phone_number: phone,
        gender,
        age: parseInt(age, 10),
        treatment_centre: treatmentCentre,
        location,
        preferred_job_category: preferredCategory,
        assigned_caseworker_id: caseworkerId,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        notes,
        skill_ids: selectedSkills
      });

      if (res.success) {
        addToast('Patient Enrolled', `${fullName} successfully registered into ReTrac recovery monitoring.`, 'success');
        navigate(`/clients/${res.data.id}`);
      }
    } catch (err) {
      addToast('Error', err.message || 'Failed to enroll client', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/clients"
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Patient Intake & Enrollment
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register recovering patient for automated weekly SMS check-ins and job reintegration
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        {/* Section 1: Demographics */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            1. Patient Demographics & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Okello"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number (SMS Delivery) *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256772111222"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location / Community *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Makindye, Kampala"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Discharging Recovery Centre *
              </label>
              <input
                type="text"
                required
                value={treatmentCentre}
                onChange={(e) => setTreatmentCentre(e.target.value)}
                placeholder="e.g. Butabika National Recovery Hospital"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Care Assignment */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-600" />
            2. Caseworker & Emergency Support
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Caseworker
              </label>
              <select
                value={caseworkerId}
                onChange={(e) => setCaseworkerId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              >
                <option value="cw-01">Bwambale Sulait (Senior Caseworker - Butabika)</option>
                <option value="cw-02">Sarah Namukasa (Community Specialist - Hope Haven)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Reintegration Job Field
              </label>
              <select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              >
                <option value="Logistics & Retail">Logistics & Retail</option>
                <option value="Facility Maintenance">Facility Maintenance & Cleaning</option>
                <option value="Agriculture">Agriculture & Farming</option>
                <option value="Hospitality & Catering">Hospitality & Catering</option>
                <option value="Automotive Services">Automotive Services</option>
                <option value="Manufacturing">Manufacturing & Tailoring</option>
                <option value="Office Administration">Office Administration</option>
                <option value="Trades & Repairs">Trades & Repairs</option>
                <option value="Personal Care">Personal Care & Salon</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Family / Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="e.g. Josephine Okello (Sister)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+256772999001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Skills Selection */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-600" />
            3. Vocational Skills for Job Placement
          </h3>
          <p className="text-3xs text-slate-400 mb-3">Select all skills possessed by candidate for automated matching:</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {AVAILABLE_SKILLS.map(skill => {
              const isSelected = selectedSkills.includes(skill.id);
              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{skill.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clinical Intake Notes */}
        <div>
          <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
            Clinical Intake & Recovery Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document rehabilitation background, key triggers, motivation level..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/clients"
            className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            {submitting ? 'Registering...' : 'Enroll & Initialize Monitoring'}
          </button>
        </div>
      </form>
    </div>
  );
}
