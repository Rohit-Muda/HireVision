import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video, Zap, Users, BarChart3, ChevronRight, Star, ArrowRight,
  CheckCircle, Briefcase, TrendingUp, Clock, Shield, Search,
  Play, MessageSquare, LayoutDashboard
} from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

const Landing = () => {
  const candidateFeatures = [
    { icon: Video, title: 'Record Video Resume', desc: 'Record a 60-second intro straight from your browser. Show your personality, confidence, and skills — not just text.' },
    { icon: Zap, title: 'Instant AI Analysis', desc: 'Our AI listens, transcribes, extracts skills, and scores your communication quality in seconds.' },
    { icon: Briefcase, title: 'Smart Job Matching', desc: 'Get matched to jobs with an explainable score. Know exactly which skills you have and which you\'re missing.' },
    { icon: TrendingUp, title: 'Track Applications', desc: 'See exactly where you stand — Applied, Screened, Interview, or Hired — in real time.' },
  ];

  const recruiterFeatures = [
    { icon: Search, title: 'AI-Ranked Candidates', desc: 'Candidates are ranked by skill overlap and communication score. See who fits best before the first call.' },
    { icon: LayoutDashboard, title: 'Kanban Pipeline', desc: 'Drag candidates through your hiring stages. Applied → Screened → Interview → Hired — all in one board.' },
    { icon: Play, title: 'Watch Video Resumes', desc: 'Watch candidates present themselves. Hear their voice, see their confidence. Skip the boring PDF.' },
    { icon: MessageSquare, title: 'Explainable Scores', desc: 'Every match score comes with a plain-English explanation of strengths and skill gaps.' },
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma', role: 'Software Engineer, Pune',
      text: 'I got shortlisted in 2 days after uploading my video resume. The AI summary described my skills perfectly.',
      avatar: 'R', color: 'from-brand-500 to-violet-500'
    },
    {
      name: 'Priya Menon', role: 'HR Manager, TechCorp Bangalore',
      text: 'We reviewed 30 candidates in an hour. The ranked list saved us days of resume screening.',
      avatar: 'P', color: 'from-emerald-500 to-cyan-500'
    },
    {
      name: 'Arjun Nair', role: 'Product Designer, Mumbai',
      text: 'The communication score helped me realize I was rambling. Re-recorded and got 8.5 / 10 — worth it.',
      avatar: 'A', color: 'from-rose-500 to-pink-500'
    },
  ];

  const stats = [
    { value: '87%', label: 'Faster Screening', icon: Clock },
    { value: '3×', label: 'Better Match Quality', icon: TrendingUp },
    { value: '60s', label: 'All You Need', icon: Video },
    { value: '100%', label: 'Free to Start', icon: Shield },
  ];

  return (
    <div className="min-h-screen overflow-hidden">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <div className="relative pt-20 pb-32 px-4 bg-mesh">
        {/* Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-300/4 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-semibold mb-8 shadow-sm"
          >
            <Zap className="w-4 h-4 text-brand-600 fill-brand-600" />
            AI-Powered Video Hiring
            <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-xs font-bold ml-1">NEW</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight"
          >
            Your Video.{' '}
            <span className="text-gradient">Your Story.</span>
            <br />Your Next Job.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI-powered video resumes that show who you <em>really</em> are — not just what's on paper.
            Candidates record. AI analyzes. Recruiters hire smarter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register?role=candidate" className="btn-primary text-lg px-8 py-4 gap-3 shadow-glow">
              <Video className="w-5 h-5" />
              I'm a Candidate
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/register?role=recruiter" className="btn-secondary text-lg px-8 py-4 gap-3">
              <Users className="w-5 h-5" />
              I'm a Recruiter
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center justify-center gap-2 mt-10 text-sm text-slate-500"
          >
            <div className="flex -space-x-2">
              {['R','P','A','S','M'].map((l, i) => (
                <div key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${
                  ['from-brand-500 to-violet-500','from-emerald-500 to-cyan-500','from-rose-500 to-pink-500','from-amber-500 to-orange-500','from-indigo-500 to-blue-500'][i]
                }`}>{l}</div>
              ))}
            </div>
            <div className="flex ml-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
            </div>
            <span className="font-medium">Trusted by 1,000+ candidates & recruiters</span>
          </motion.div>
        </div>
      </div>

      {/* ── STATS BAR ──────────────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp} transition={{ duration: 0.5 }}
        className="bg-white border-y border-slate-200 shadow-sm"
      >
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 mb-3 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <div className="text-3xl font-extrabold text-gradient">{value}</div>
              <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold border border-brand-200 mb-4">How it works</span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Hired in <span className="text-gradient">3 steps</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            No PDF screening. No wasted calls. From unknown candidate to hired in under a minute.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Video, step: '01', title: 'Record Your Story', desc: 'Hit record. Talk about yourself for 60 seconds. Show your personality — not just your resume.', color: 'from-blue-500 to-cyan-500' },
            { icon: Zap, step: '02', title: 'AI Analyzes Everything', desc: 'AI transcribes your speech, extracts skills, scores your communication, and builds your profile.', color: 'from-violet-500 to-purple-500' },
            { icon: Users, step: '03', title: 'Get Matched Instantly', desc: 'Your profile is matched to relevant jobs with explainable scores. One click to apply.', color: 'from-rose-500 to-pink-500' },
          ].map(({ icon: Icon, step, title, desc, color }, i) => (
            <motion.div
              key={title} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="card text-center group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 text-6xl font-black text-slate-100 select-none">{step}</div>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
                <Icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FOR CANDIDATES ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-50 to-brand-50/30 py-24 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-bold border border-brand-200 mb-4">For Candidates</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
              Stand out. <span className="text-gradient">Get hired faster.</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">Your skills deserve to be seen — not buried in a PDF.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {candidateFeatures.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="card flex gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-violet-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link to="/register?role=candidate" className="btn-primary text-base px-8 py-3.5 gap-2">
              <Video className="w-5 h-5" /> Start Recording Free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── FOR RECRUITERS ─────────────────────────────────────────────────── */}
      <div className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-bold border border-violet-200 mb-4">For Recruiters</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
              Hire smarter. <span className="text-gradient">Save hours.</span>
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">AI does the heavy lifting. You make the human call.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {recruiterFeatures.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="card flex gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link to="/register?role=recruiter" className="btn-secondary text-base px-8 py-3.5 gap-2">
              <Users className="w-5 h-5" /> Post Jobs & Find Talent
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ── LIVE DEMO MOCK CARD ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-brand-600 via-violet-600 to-purple-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp} className="text-white">
              <h2 className="text-4xl font-extrabold mb-5 leading-tight">
                AI that explains <em>why</em>, not just scores
              </h2>
              <div className="space-y-4">
                {[
                  { icon: '🎯', t: 'Explainable Match Scores', d: '87% — Strong in React & JavaScript. Missing: TypeScript, Docker.' },
                  { icon: '🗣️', t: 'Communication Quality', d: 'Rate clarity, confidence, pacing, and structure from 1–10.' },
                  { icon: '📋', t: 'Kanban Pipeline', d: 'Drag candidates from Applied → Screened → Interview → Hired.' },
                  { icon: '⚡', t: 'Instant AI Analysis', d: 'Skills extracted, profile built, and matched — before you blink.' },
                ].map(({ icon, t, d }) => (
                  <div key={t} className="flex gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <h4 className="font-bold text-white">{t}</h4>
                      <p className="text-white/70 text-sm">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mock candidate card */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="glass-card p-6 text-slate-900">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg">A</div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">Arjun Patel</div>
                  <div className="text-sm text-slate-500">Full-Stack Developer · Mumbai</div>
                </div>
                <div className="relative w-14 h-14">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#10b981" strokeWidth="5"
                      strokeDasharray={`${0.87 * 150.8} 150.8`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">87%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 mb-4">
                <p className="text-xs font-semibold text-brand-700 mb-1">AI Profile</p>
                <p className="text-sm text-slate-700 italic">"Strong full-stack developer with 3 years React experience. Demonstrates excellent problem-solving and clear communication."</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {['React', 'Node.js', 'MongoDB'].map(s => (
                  <span key={s} className="skill-matched text-xs"><CheckCircle className="w-3 h-3" />{s}</span>
                ))}
                {['TypeScript', 'Docker'].map(s => (
                  <span key={s} className="skill-missing text-xs">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  Communication: <strong className="text-brand-600">8/10</strong>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">Top Match</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-24">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">
            What people are <span className="text-gradient">saying</span>
          </h2>
          <p className="text-slate-500">Real results from candidates and recruiters.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, text, avatar, color }, i) => (
            <motion.div
              key={name} {...fadeUp} transition={{ delay: i * 0.12 }}
              whileHover={{ y: -5 }}
              className="card group"
            >
              <div className="flex mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic mb-5">"{text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
                  {avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── CTA BANNER ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <motion.div
          {...fadeUp}
          className="card text-center py-16 bg-gradient-to-br from-brand-50 to-violet-50 border-brand-100"
        >
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
            Ready to transform your hiring?
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Join thousands of candidates and recruiters who've made the switch from PDFs to video.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register?role=candidate" className="btn-primary gap-2 px-8 py-4">
              <Video className="w-5 h-5" /> Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary gap-2 px-8 py-4">
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-extrabold text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              HireVision
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              <Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link>
            </div>
            <p className="text-slate-500 text-sm">© 2025 HireVision. Built for the future of hiring.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
