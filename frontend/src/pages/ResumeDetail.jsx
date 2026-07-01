import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resumeApi, analysisApi } from '../api';

export default function ResumeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Analysis Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchResumeDetails = async () => {
    try {
      setLoading(true);
      const resumeRes = await resumeApi.getById(id);
      const resumeData = resumeRes.data?.data || resumeRes.data;
      setResume(resumeData);

      const analysesRes = await analysisApi.listByResume(id);
      const analysesData = analysesRes.data?.data || analysesRes.data || [];
      // Sort analyses by date descending
      const sorted = [...analysesData].sort(
        (a, b) => new Date(b.createdAt || b.analyzedAt) - new Date(a.createdAt || a.analyzedAt)
      );
      setAnalyses(sorted);
    } catch (err) {
      console.error(err);
      setError('Failed to load resume details or analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeDetails();
  }, [id]);

  const handleOpenModal = () => {
    setTargetRole('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setModalError('Target role is required.');
      return;
    }

    setModalError('');
    setAnalyzing(true);

    try {
      await analysisApi.analyze({
        resumeId: Number(id),
        targetRole: targetRole.trim(),
      });
      setIsModalOpen(false);
      fetchResumeDetails();
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'AI analysis failed. Please ensure the backend is running and AI provider configuration is correct.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete this resume? All associated analysis reports will be permanently deleted.')) {
      return;
    }

    try {
      await resumeApi.delete(id);
      navigate('/resumes');
    } catch (err) {
      console.error(err);
      setError('Failed to delete resume.');
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'cyan';
    return 'rose';
  };

  const renderListOrText = (text) => {
    if (!text) return <p className="text-muted">None specified.</p>;

    // Try to parse as JSON array
    try {
      if (text.trim().startsWith('[') && text.trim().endsWith(']')) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return (
            <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
              {parsed.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
              ))}
            </ul>
          );
        }
      }
    } catch (e) {
      // Not a JSON array
    }

    // Check if it contains markdown bullets or newlines
    if (text.includes('\n') || text.includes('- ') || text.includes('* ')) {
      const lines = text
        .split('\n')
        .map((line) => line.replace(/^[\s*\-•]+/, '').trim())
        .filter((line) => line.length > 0);
      return (
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          {lines.map((line, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{line}</li>
          ))}
        </ul>
      );
    }

    // Check if it's comma-separated
    if (text.includes(',')) {
      const parts = text.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
      return (
        <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
          {parts.map((part, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{part}</li>
          ))}
        </ul>
      );
    }

    return <p style={{ margin: '8px 0' }}>{text}</p>;
  };

  if (loading && !resume) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading resume details...</span>
      </div>
    );
  }

  if (!resume && !loading) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3>Resume Not Found</h3>
        <p>The resume you are looking for does not exist or has been deleted.</p>
        <Link to="/resumes" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Resumes
        </Link>
      </div>
    );
  }

  return (
    <div className="resume-detail-page fade-in">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/resumes" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
              &larr; Back
            </Link>
            <h1>{resume.title}</h1>
            {resume.isPrimary && <span className="badge badge-emerald">Primary</span>}
          </div>
          <p className="text-secondary" style={{ marginTop: '4px' }}>
            Uploaded on {new Date(resume.createdAt || resume.date || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleDeleteResume} className="btn btn-danger">
            Delete Resume
          </button>
          <button onClick={handleOpenModal} className="btn btn-primary">
            Analyze Resume
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Resume Details Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Professional Profile</h3>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Summary</h4>
            <p style={{ fontSize: '1.05rem', whiteSpace: 'pre-line' }}>{resume.summary}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Skills & Technologies</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {resume.skills && (typeof resume.skills === 'string' ? resume.skills.split(',').map((skill, index) => (
                <span key={index} className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  {skill.trim()}
                </span>
              )) : resume.skills.map((skill, index) => (
                <span key={index} className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  {skill}
                </span>
              )))}
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Document Reference</h4>
            <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-link" style={{ wordBreak: 'break-all' }}>
              {resume.fileUrl} &UpperRightArrow;
            </a>
          </div>
        </div>
      </div>

      {/* Past Analyses History */}
      <div className="card">
        <div className="card-header">
          <h3>AI Analysis Reports ({analyses.length})</h3>
        </div>
        <div className="card-body">
          {analyses.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '32px 16px' }}>
              <p>No analysis reports found for this resume.</p>
              <button onClick={handleOpenModal} className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Run AI Resume Coach
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="card"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '20px' }}>
                    {/* Score Circle */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className={`score-circle ${getScoreClass(analysis.score)}`}>
                        {analysis.score}
                      </div>
                      <span className="text-secondary" style={{ fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' }}>
                        Match Score
                      </span>
                    </div>

                    {/* Report Content */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Target Role: {analysis.targetRole}</h4>
                        <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                          Analyzed: {new Date(analysis.createdAt || analysis.analyzedAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <h5 style={{ fontWeight: 600, color: 'var(--purple-light)', marginBottom: '4px' }}>Coaching Feedback</h5>
                        <p style={{ whiteSpace: 'pre-line' }}>{analysis.feedback}</p>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="responsive-grid">
                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                          <h5 style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}><polyline points="20 6 9 17 4 12" /></svg>
                            Key Strengths
                          </h5>
                          {renderListOrText(analysis.strengths)}
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                          <h5 style={{ color: 'var(--accent-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            Areas for Improvement
                          </h5>
                          {renderListOrText(analysis.weaknesses)}
                        </div>
                      </div>

                      {analysis.aiModel && (
                        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                          Model: {analysis.aiModel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Target Role Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '450px', width: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Analyze Resume</h3>
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
              <form onSubmit={handleRunAnalysis}>
                <div className="form-group">
                  <label className="form-label">Target Job Role / Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Fullstack Developer, Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '6px', display: 'block' }}>
                    The AI will score your resume and provide recommendations tailored to this specific job title.
                  </small>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={analyzing}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={analyzing}>
                    {analyzing && <span className="spinner spinner-sm" style={{ marginRight: '8px' }} />}
                    {analyzing ? 'AI Coach is analyzing...' : 'Run AI Coach'}
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
