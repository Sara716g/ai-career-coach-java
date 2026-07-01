import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi, resumeApi } from '../api';

export default function Analyses() {
  const [analyses, setAnalyses] = useState([]);
  const [resumes, setResumes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal details state
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    async function loadAnalyses() {
      try {
        setLoading(true);
        // Fetch all analyses
        const analysesRes = await analysisApi.list();
        const analysesData = analysesRes.data?.data || analysesRes.data || [];
        
        // Fetch resumes to display resume names
        const resumesRes = await resumeApi.list();
        const resumesData = resumesRes.data?.data || resumesRes.data || [];
        
        // Map resumes by ID
        const resumeMap = {};
        resumesData.forEach((r) => {
          resumeMap[r.id] = r;
        });

        // Sort analyses by date descending
        const sorted = [...analysesData].sort(
          (a, b) => new Date(b.createdAt || b.analyzedAt) - new Date(a.createdAt || a.analyzedAt)
        );

        setAnalyses(sorted);
        setResumes(resumeMap);
      } catch (err) {
        console.error(err);
        setError('Failed to load resume analysis reports.');
      } finally {
        setLoading(false);
      }
    }

    loadAnalyses();
  }, []);

  const getScoreClass = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'cyan';
    return 'rose';
  };

  const handleCardClick = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  const handleCloseModal = () => {
    setSelectedAnalysis(null);
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
    } catch (e) {}

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading AI analysis reports...</span>
      </div>
    );
  }

  return (
    <div className="analyses-page fade-in">
      <div className="page-header">
        <div>
          <h1>AI Resume Analyses</h1>
          <p>Review comprehensive feedback and evaluation reports from the AI Career Coach.</p>
        </div>
        <Link to="/resumes" className="btn btn-primary">
          Analyze a Resume
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', color: 'var(--text-secondary)' }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <h3 style={{ margin: '16px 0 8px' }}>No Analyses Found</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Analyze one of your resumes to get detailed feedback, strengths, and match scores.</p>
            <Link to="/resumes" className="btn btn-primary">
              Go to Resumes
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {analyses.map((analysis) => {
            const linkedResume = resumes[analysis.resumeId];
            return (
              <div
                key={analysis.id}
                onClick={() => handleCardClick(analysis)}
                className="card"
                style={{ cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}
              >
                <div className={`score-circle score-circle-sm ${getScoreClass(analysis.score)}`} style={{ flexShrink: 0 }}>
                  {analysis.score}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {analysis.targetRole}
                  </h3>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '8px' }}>
                    Resume: {linkedResume ? linkedResume.title : `ID #${analysis.resumeId}`}
                  </p>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {analysis.feedback}
                  </p>
                  <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(analysis.createdAt || analysis.analyzedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analysis Detailed Report Modal */}
      {selectedAnalysis && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal card" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Resume Analysis Report</h3>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                  Target Role: {selectedAnalysis.targetRole}
                </span>
              </div>
              <button onClick={handleCloseModal} className="btn-close" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>
                &times;
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'center' }}>
                <div className={`score-circle ${getScoreClass(selectedAnalysis.score)}`}>
                  {selectedAnalysis.score}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Evaluation Match Score</h4>
                  <p className="text-secondary">
                    Based on resume compatibility with target role: <strong>{selectedAnalysis.targetRole}</strong>
                  </p>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                    Resume used: {resumes[selectedAnalysis.resumeId]?.title || `ID #${selectedAnalysis.resumeId}`}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--purple-light)', fontWeight: 600, marginBottom: '6px' }}>Coaching Feedback</h4>
                <p style={{ whiteSpace: 'pre-line', fontSize: '1.02rem', lineHeight: '1.6' }}>{selectedAnalysis.feedback}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }} className="responsive-grid">
                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <h4 style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}><polyline points="20 6 9 17 4 12" /></svg>
                    Key Strengths
                  </h4>
                  {renderListOrText(selectedAnalysis.strengths)}
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                  <h4 style={{ color: 'var(--accent-rose)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    Areas for Improvement
                  </h4>
                  {renderListOrText(selectedAnalysis.weaknesses)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Analyzed on: {new Date(selectedAnalysis.createdAt || selectedAnalysis.analyzedAt).toLocaleString()}</span>
                {selectedAnalysis.aiModel && <span>Engine: {selectedAnalysis.aiModel}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button onClick={handleCloseModal} className="btn btn-secondary">
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
