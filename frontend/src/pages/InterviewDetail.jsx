import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { interviewApi } from '../api';

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit transcript state
  const [answers, setAnswers] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getById(id);
      const data = res.data?.data || res.data;
      setInterview(data);
      if (data.status === 'COMPLETED') {
        // If already completed, answers were submitted. However, the feedback field holds the AI report now.
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load mock interview details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewDetails();
  }, [id]);

  const handleSubmitAnswers = async (e) => {
    e.preventDefault();
    if (!answers.trim()) {
      setSubmitError('Please enter your response transcript.');
      return;
    }

    setSubmitError('');
    setSubmitting(true);

    try {
      // Send the answers in the feedback parameter so the backend AI service can grade them
      const payload = {
        title: interview.title,
        type: interview.type,
        status: 'COMPLETED',
        feedback: answers,
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes || 30,
        questions: interview.questions,
      };

      await interviewApi.update(id, payload);
      fetchInterviewDetails();
    } catch (err) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'AI Evaluation failed. Make sure all backend servers are running.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this mock interview session?')) {
      return;
    }

    try {
      await interviewApi.delete(id);
      navigate('/interviews');
    } catch (err) {
      console.error(err);
      setError('Failed to delete interview.');
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'cyan';
    return 'rose';
  };

  const parseQuestions = (qText) => {
    if (!qText) return [];

    // Try to parse as JSON array
    try {
      if (qText.trim().startsWith('[') && qText.trim().endsWith(']')) {
        const parsed = JSON.parse(qText);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}

    // Check if it's bulleted list/newlines
    if (qText.includes('\n')) {
      return qText
        .split('\n')
        .map((line) => line.replace(/^[\s*\-•\d+.]*/, '').trim())
        .filter((line) => line.length > 0);
    }

    // fallback: list by question marks
    if (qText.includes('?')) {
      return qText
        .split(/(?<=\?)/)
        .map((q) => q.trim())
        .filter((q) => q.length > 0);
    }

    return [qText];
  };

  if (loading && !interview) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading interview session...</span>
      </div>
    );
  }

  if (!interview && !loading) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h3>Interview Session Not Found</h3>
        <p>This interview prep session does not exist or has been deleted.</p>
        <Link to="/interviews" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Interviews
        </Link>
      </div>
    );
  }

  const questionsList = parseQuestions(interview.questions);

  return (
    <div className="interview-detail-page fade-in">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/interviews" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
              &larr; Back
            </Link>
            <h1>{interview.title || 'Mock Interview'}</h1>
            <span className={`badge ${interview.status === 'COMPLETED' ? 'badge-emerald' : 'badge-cyan'}`}>
              {interview.status}
            </span>
          </div>
          <p className="text-secondary" style={{ marginTop: '4px' }}>
            Session generated on {new Date(interview.scheduledAt || interview.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete Session
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="responsive-grid">
        {/* Left Side: Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h3>Interview Questions</h3>
            </div>
            <div className="card-body">
              {questionsList.length === 0 ? (
                <p className="text-secondary">No questions generated.</p>
              ) : (
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {questionsList.map((question, index) => (
                    <li key={index} style={{ fontSize: '1.05rem', fontWeight: 500, lineHeight: 1.5 }}>
                      {question}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Scheduled/Setup detail */}
          <div className="card">
            <div className="card-header">
              <h3>Session Properties</h3>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>TYPE</span>
                <p style={{ fontWeight: 600 }}>{interview.type}</p>
              </div>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>DURATION</span>
                <p style={{ fontWeight: 600 }}>{interview.durationMinutes || 30} minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Submission or AI Feedback */}
        <div>
          {interview.status !== 'COMPLETED' ? (
            <div className="card">
              <div className="card-header">
                <h3>Submit Your Responses</h3>
              </div>
              <div className="card-body">
                {submitError && (
                  <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                    <span>{submitError}</span>
                  </div>
                )}
                <p className="text-secondary" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>
                  Review the questions on the left. Type or paste your answers/transcript in the box below to receive AI analysis and grading.
                </p>
                <form onSubmit={handleSubmitAnswers}>
                  <div className="form-group">
                    <label className="form-label">Interview Answer Transcript</label>
                    <textarea
                      className="form-input"
                      placeholder="e.g. Q1: I have 3 years of experience in Java... Q2: For caching, I prefer Redis because..."
                      style={{ minHeight: '280px', resize: 'vertical', fontSize: '0.95rem' }}
                      value={answers}
                      onChange={(e) => setAnswers(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                    {submitting && <span className="spinner spinner-sm" style={{ marginRight: '8px' }} />}
                    {submitting ? 'AI Coach is evaluating...' : 'Submit & Complete Interview'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>AI Performance Evaluation</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
                  <div className={`score-circle ${getScoreClass(interview.performanceScore)}`}>
                    {interview.performanceScore}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Overall Score</h4>
                    <p className="text-secondary">AI evaluation based on response depth and accuracy.</p>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: 'var(--purple-light)', fontWeight: 600, marginBottom: '8px' }}>Constructive Coaching Feedback</h4>
                  <div
                    style={{
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6',
                      padding: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  >
                    {interview.feedback}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
