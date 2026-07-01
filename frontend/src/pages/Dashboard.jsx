import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resumeApi, analysisApi, interviewApi, applicationApi } from '../api';
import { useAuth } from '../App';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resumes: 0,
    analyses: 0,
    applications: 0,
    interviews: 0,
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Execute API calls in parallel
        const [resumesRes, analysesRes, interviewsRes, applicationsRes] = await Promise.all([
          resumeApi.list(),
          analysisApi.list(),
          interviewApi.list(),
          applicationApi.list(),
        ]);

        const resumes = resumesRes.data?.data || resumesRes.data || [];
        const analyses = analysesRes.data?.data || analysesRes.data || [];
        const interviews = interviewsRes.data?.data || interviewsRes.data || [];
        const applications = applicationsRes.data?.data || applicationsRes.data || [];

        setStats({
          resumes: resumes.length,
          analyses: analyses.length,
          interviews: interviews.length,
          applications: applications.length,
        });

        // Get latest 3 analyses and interviews
        const sortedAnalyses = [...analyses].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        const sortedInterviews = [...interviews].sort((a, b) => new Date(b.createdAt || b.scheduledDate || b.date) - new Date(a.createdAt || a.scheduledDate || a.date));

        setRecentAnalyses(sortedAnalyses.slice(0, 3));
        setRecentInterviews(sortedInterviews.slice(0, 3));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getScoreClass = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'cyan';
    return 'rose';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading dashboard metrics...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.firstName || 'User'}! Here is your career coaching overview.</p>
        </div>
        <div className="header-actions">
          <Link to="/resumes" className="btn btn-primary">
            Upload Resume
          </Link>
          <Link to="/interviews" className="btn btn-secondary" style={{ marginLeft: '12px' }}>
            Mock Interview
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-card-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>{stats.resumes}</h3>
            <p>Resumes Uploaded</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-card-icon cyan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>{stats.analyses}</h3>
            <p>AI Resume Analyses</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-card-icon emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>{stats.applications}</h3>
            <p>Job Applications</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-card-icon rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-card-content">
            <h3>{stats.interviews}</h3>
            <p>Mock Interviews</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }} className="responsive-grid">
        {/* Recent Analyses Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Resume Analyses</h3>
            <Link to="/analyses" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="card-body">
            {recentAnalyses.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No resume analyses generated yet.</p>
                <Link to="/resumes" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                  Analyze a Resume
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{analysis.targetRole}</h4>
                      <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                        {new Date(analysis.createdAt || analysis.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`score-circle score-circle-sm ${getScoreClass(analysis.score)}`}>
                      {analysis.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Interviews Card */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Recent Mock Interviews</h3>
            <Link to="/interviews" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="card-body">
            {recentInterviews.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p>No interviews completed yet.</p>
                <Link to="/interviews" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                  Start Mock Interview
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentInterviews.map((interview) => (
                  <div key={interview.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{interview.targetRole || interview.title}</h4>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                        <span className={`badge badge-purple`}>{interview.type}</span>
                        <span className={`badge ${interview.status === 'COMPLETED' ? 'badge-emerald' : 'badge-cyan'}`}>
                          {interview.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      {interview.status === 'COMPLETED' ? (
                        <div className={`score-circle score-circle-sm ${getScoreClass(interview.performanceScore)}`}>
                          {interview.performanceScore}
                        </div>
                      ) : (
                        <Link to={`/interviews/${interview.id}`} className="btn btn-primary btn-sm">
                          Resume
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
