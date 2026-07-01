import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../api';

export default function Interviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    targetRole: '',
    type: 'MOCK',
    focusAreas: '',
  });
  const [generating, setGenerating] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.list();
      const data = res.data?.data || res.data || [];
      setInterviews(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch interviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleOpenModal = () => {
    setForm({
      targetRole: '',
      type: 'MOCK',
      focusAreas: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.targetRole.trim()) {
      setModalError('Target role is required.');
      return;
    }

    setModalError('');
    setGenerating(true);

    try {
      const payload = {
        targetRole: form.targetRole.trim(),
        type: form.type,
        focusAreas: form.focusAreas.trim(),
      };

      const res = await interviewApi.generateMock(payload);
      const createdSession = res.data?.data || res.data;
      setIsModalOpen(false);
      
      // Redirect to the newly created interview detail page
      if (createdSession && createdSession.id) {
        navigate(`/interviews/${createdSession.id}`);
      } else {
        fetchInterviews();
      }
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'AI failed to generate interview questions. Please verify backend state.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'cyan';
    return 'rose';
  };

  if (loading && interviews.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading interview list...</span>
      </div>
    );
  }

  return (
    <div className="interviews-page fade-in">
      <div className="page-header">
        <div>
          <h1>Mock Interviews</h1>
          <p>Practice for job interviews with customized AI-driven coaching.</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          Generate Mock Interview
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {interviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', color: 'var(--text-secondary)' }}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 style={{ margin: '16px 0 8px' }}>No Interviews Started</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Start an AI mock interview session tailored to your target job position.</p>
            <button onClick={handleOpenModal} className="btn btn-primary">
              Generate Mock Interview
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {interviews.map((interview) => (
            <div
              key={interview.id}
              onClick={() => navigate(`/interviews/${interview.id}`)}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{interview.title || 'Mock Interview'}</h3>
                  <span className={`badge ${interview.status === 'COMPLETED' ? 'badge-emerald' : 'badge-cyan'}`}>
                    {interview.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge badge-purple">{interview.type}</span>
                  {interview.durationMinutes && (
                    <span className="badge badge-rose">{interview.durationMinutes} min</span>
                  )}
                </div>
                {interview.questions && (
                  <p className="text-secondary" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {interview.questions}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '16px' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Scheduled: {new Date(interview.scheduledAt || interview.createdAt).toLocaleDateString()}
                </span>
                {interview.status === 'COMPLETED' ? (
                  <div className={`score-circle score-circle-sm ${getScoreClass(interview.performanceScore)}`}>
                    {interview.performanceScore}
                  </div>
                ) : (
                  <span className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                    Start &rarr;
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Mock Interview Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Generate AI Mock Interview</h3>
              <button onClick={handleCloseModal} className="btn-close" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>
                &times;
              </button>
            </div>
            <div className="card-body">
              {modalError && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <span>{modalError}</span>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Target Job Role / Position</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Frontend Engineer, Data Analyst"
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Interview Type</label>
                  <select
                    className="form-input"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="MOCK">General Mock</option>
                    <option value="TECHNICAL">Technical Interview</option>
                    <option value="BEHAVIORAL">Behavioral Interview</option>
                    <option value="PHONE">Phone Screen</option>
                    <option value="VIDEO">Video Interview</option>
                    <option value="ONSITE">Onsite Panel</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Focus Areas / Specific Topics (Optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="e.g. React hooks, system design, leadership qualities, JavaScript closures..."
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={form.focusAreas}
                    onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={generating}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={generating}>
                    {generating && <span className="spinner spinner-sm" style={{ marginRight: '8px' }} />}
                    {generating ? 'Generating questions...' : 'Generate Interview'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
