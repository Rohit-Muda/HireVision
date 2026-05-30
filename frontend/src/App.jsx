import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import VideoRecord from './pages/VideoRecord';
import JobBoard from './pages/JobBoard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import JobCandidates from './pages/JobCandidates';
import KanbanPipeline from './pages/KanbanPipeline';
import MyApplications from './pages/MyApplications';
import CandidateSearch from './pages/CandidateSearch';
import PracticeInterview from './pages/PracticeInterview';

// Route guards
const RequireAuth = ({ role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/dashboard'} replace />;
  }
  return <Outlet />;
};

const AppLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },

      // Candidate routes
      {
        element: <RequireAuth role="candidate" />,
        children: [
          { path: 'dashboard', element: <CandidateDashboard /> },
          { path: 'record', element: <VideoRecord /> },
          { path: 'jobs', element: <JobBoard /> },
          { path: 'jobs/:jobId/practice', element: <PracticeInterview /> },
          { path: 'dashboard/applications', element: <MyApplications /> },
        ],
      },

      // Recruiter routes
      {
        element: <RequireAuth role="recruiter" />,
        children: [
          { path: 'recruiter', element: <RecruiterDashboard /> },
          { path: 'recruiter/post-job', element: <PostJob /> },
          { path: 'recruiter/search', element: <CandidateSearch /> },
          { path: 'recruiter/jobs/:id', element: <JobCandidates /> },
          { path: 'recruiter/jobs/:id/pipeline', element: <KanbanPipeline /> },
        ],
      },

      // 404
      {
        path: '*',
        element: (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="text-8xl font-black text-slate-100 mb-4">404</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
            <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        ),
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
