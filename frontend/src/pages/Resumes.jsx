import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeApi } from '../api';

export default function Resumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    fileUrl: '',
    skills: '',
    isPrimary: false,
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await resumeApi.list();
      const data = res.data?.data || res.data || [];
      setResumes(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch resumes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleOpenModal = () => {
    setForm({
      title: '',
      summary: '',
      fileUrl: '',
      skills: '',
      isPrimary: false,
    });
    setFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      let fileUrl = form.fileUrl;

      // Upload file if selected
      if (file) {
        setUploading(true);
        try {
          const uploadRes = await resumeApi.uploadFile(file);
          fileUrl = uploadRes.data?.data?.url || uploadRes.data?.url || '';
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr);
          setFormError('Failed to upload file. Please try again.');
          setSubmitting(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Skills as comma-separated string (backend expects String, not Array)
      const skillsString = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .join(', ');

      const payload = {
        title: form.title,
        summary: form.summary,
        fileUrl: fileUrl,
        skills: skillsString,
        isPrimary: form.isPrimary,
      };

      await resumeApi.create(payload);
      setIsModalOpen(false);
      fetchResumes();
    } catch (err) {
      console.error(err);
      setFormError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save resume. Make sure all fields are valid.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent navigation
    if (!window.confirm('Are you sure you want to delete this resume? All associated analyses will be lost.')) {
      return;
    }

    try {
      await resumeApi.delete(id);
      fetchResumes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete resume.');
    }
  };

  if (loading && resumes.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading resumes...</span>
      </div>
    );
  }

  return (
    <div className="resumes-page fade-in">
      <div className="page-header">
        <div>
          <h1>My Resumes</h1>
          <p>Manage and analyze your professional resumes.</p>
        </div>
        <button onClick={handleOpenModal} className="btn btn-primary">
          Add Resume
        </button>
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

      {resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', color: 'var(--text-secondary)' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h3 style={{ margin: '16px 0 8px' }}>No Resumes Found</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Upload your first resume to receive AI coaching and evaluation scores.</p>
            <button onClick={handleOpenModal} className="btn btn-primary">
              Upload Resume
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {resumes.map((resume) => (
            <div
              key={resume.id}
              onClick={() => navigate(`/resumes/${resume.id}`)}
              className="card"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{resume.title}</h3>
                  {resume.isPrimary && (
                    <span className="badge badge-emerald">Primary</span>
                  )}
                </div>
                <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {resume.summary || 'No summary provided.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {resume.skills && (typeof resume.skills === 'string' ? resume.skills.split(',').map((skill, index) => (
                    <span key={index} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      {skill.trim()}
                    </span>
                  )) : resume.skills.map((skill, index) => (
                    <span key={index} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                      {skill}
                    </span>
                  )))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Created: {new Date(resume.createdAt || resume.date || Date.now()).toLocaleDateString()}
                </span>
                <button
                  onClick={(e) => handleDelete(resume.id, e)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 8px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resume Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>Add New Resume</h3>
              <button onClick={handleCloseModal} className="btn-close" style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>
                &times;
              </button>
            </div>
            <div className="card-body">
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <span>{formError}</span>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Resume Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Software Engineer Resume"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Professional Summary</label>
                  <textarea
                    className="form-input"
                    placeholder="Briefly describe your professional profile and goals..."
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={form.summary}
                    onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Resume File</label>
                  <input
                    type="file"
                    className="form-input"
                    accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        if (selectedFile.size > 10 * 1024 * 1024) {
                          setFormError('File size must be less than 10MB');
                          e.target.value = '';
                          return;
                        }
                        setFile(selectedFile);
                        setForm({ ...form, fileUrl: '' });
                        setFormError('');
                      }
                    }}
                    style={{ padding: '8px', cursor: 'pointer' }}
                  />
                  {file && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Supported: PDF, DOC, DOCX, TXT, RTF, ODT (Max 10MB)
                  </p>
                </div>
                <div className="form-group">
                  <label className="form-label">Or Enter File URL (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. https://drive.google.com/your-resume-pdf"
                    value={form.fileUrl}
                    onChange={(e) => {
                      setForm({ ...form, fileUrl: e.target.value });
                      if (e.target.value) setFile(null);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Java, Spring Boot, React, SQL"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={form.isPrimary}
                    onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isPrimary" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                    Set as Primary Resume
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                    {(submitting || uploading) && <span className="spinner spinner-sm" style={{ marginRight: '8px' }} />}
                    {uploading ? 'Uploading...' : 'Save Resume'}
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
