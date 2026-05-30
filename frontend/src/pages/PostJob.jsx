import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlusCircle, X, Briefcase, MapPin, DollarSign, Tag, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    company: user?.companyName || '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    skillsRequired: [],
    salaryRange: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim();
      if (!form.skillsRequired.includes(skill)) {
        setForm(f => ({ ...f, skillsRequired: [...f.skillsRequired, skill] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setForm(f => ({ ...f, skillsRequired: f.skillsRequired.filter(x => x !== s) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.company) {
      return toast.error('Title, description, and company are required');
    }
    if (form.description.length < 50) {
      return toast.error('Description should be at least 50 characters');
    }
    setLoading(true);
    try {
      const res = await api.post('/jobs', form);
      toast.success('Job posted! Matching candidates...');
      navigate(`/recruiter/jobs/${res.data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <motion.div {...fadeUp} className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Post a <span className="text-slate-900">New Job</span>
        </h1>
        <p className="text-slate-500">Our system will automatically match your job to the best candidates.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card space-y-6"
      >
        <Input
          label="Job Title"
          icon={Briefcase}
          placeholder="e.g. Senior React Developer"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />

        <Input
          label="Company Name"
          icon={Tag}
          placeholder="Your company"
          value={form.company}
          onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location"
            icon={MapPin}
            placeholder="Bangalore / Remote"
            value={form.location}
            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
          />
          <Input
            label="Salary Range"
            icon={DollarSign}
            placeholder="₹12-20 LPA"
            value={form.salaryRange}
            onChange={e => setForm(f => ({ ...f, salaryRange: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Type</label>
            <select
              className="input-field"
              value={form.jobType}
              onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}
            >
              {['full-time', 'part-time', 'contract', 'internship'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('-', '-')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience Level</label>
            <select
              className="input-field"
              value={form.experienceLevel}
              onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))}
            >
              {['entry', 'mid', 'senior', 'lead'].map(l => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Job Description
            <span className={`ml-2 text-xs ${form.description.length < 100 ? 'text-slate-400' : 'text-emerald-500'}`}>
              {form.description.length} chars {form.description.length < 200 ? '(aim for 200+)' : '✓'}
            </span>
          </label>
          <textarea
            className="input-field h-36 resize-none"
            placeholder="Describe the role, responsibilities, and what makes it exciting..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        {/* Skills tag input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Required Skills
            <span className="ml-2 text-xs text-slate-400">Press Enter to add</span>
          </label>
          <div className="input-field min-h-[48px] flex flex-wrap gap-2 cursor-text" onClick={() => document.getElementById('skill-input')?.focus()}>
            {form.skillsRequired.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              id="skill-input"
              type="text"
              placeholder={form.skillsRequired.length === 0 ? 'React, TypeScript, Node.js...' : ''}
              className="outline-none bg-transparent text-sm text-slate-700 flex-1 min-w-[120px]"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
            />
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
          <PlusCircle className="w-5 h-5" />
          {loading ? 'Posting & matching candidates...' : 'Post Job'}
        </Button>
      </motion.form>
    </div>
  );
};

export default PostJob;
