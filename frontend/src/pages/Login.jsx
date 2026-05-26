import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Video, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'recruiter' ? '/recruiter' : '/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e, overrideForm) => {
    if (e) e.preventDefault();
    const data = overrideForm || form;
    setLoading(true);
    try {
      const userData = await login(data.email, data.password);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(userData.role === 'recruiter' ? '/recruiter' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 1-click demo login
  const demoLogin = async (email) => {
    const data = { email, password: 'HireVision@123' };
    setForm(data);
    await handleSubmit(null, data);
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient">HireVision</span>
          </Link>
          <p className="text-slate-500 mt-2">Sign in to your account</p>
        </div>

        <div className="card">
          {/* Demo quick login */}
          <div className="mb-6 p-4 rounded-xl bg-brand-50 border border-brand-100">
            <p className="text-xs font-bold text-brand-700 mb-2 uppercase tracking-wide">⚡ 1-Click Demo Access</p>
            <div className="flex gap-2">
              {[
                { email: 'arjun@test.com', label: '🧑‍💻 Demo Candidate' },
                { email: 'priya@techcorp.in', label: '🏢 Demo Recruiter' },
              ].map(({ email, label }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => demoLogin(email)}
                  disabled={loading}
                  className="flex-1 text-xs bg-white border border-brand-200 text-brand-700 font-semibold py-2 px-3 rounded-lg hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all disabled:opacity-60"
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-brand-500 mt-2 text-center">Clicks once and logs in immediately</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="w-full">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to HireVision?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
