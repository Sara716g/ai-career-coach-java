import { useState, useEffect } from 'react';
import { applicationApi, resumeApi } from '../api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [form, setForm] = useState({
    companyName: '',
    jobTitle: '',
    status: 'APPLIED',
    appliedDate: new Date().toISOString().split('T')[0],
    jobUrl: '',
    notes: '',
    resumeId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.list();
      const data = res.data?.data || res.data || [];
      setApplications(data);

      const resumesRes = await resumeApi.list();
      const resumesData = resumesRes.data?.data || resumesRes.data || [];
      setResumes(resumesData);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch job applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setForm({
      companyName: '',
      jobTitle: '',
      status: 'APPLIED',
      appliedDate: new Date().toISOString().split('T')[0],
      jobUrl: '',
      notes: '',
      resumeId: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApplication(app);
    setForm({
      companyName: app.companyName || '',
      jobTitle: app.jobTitle || '',
      status: app.status || 'APPLIED',
      appliedDate: app.appliedDate || '',
      jobUrl: app.jobUrl || '',
      notes: app.notes || '',
      resumeId: app.resumeId || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim() || !form.jobTitle.trim()) {
      setModalError('Company name and Job title are required.');
      return;
    }

    setModalError('');
    setSubmitting(true);

    try {
      const payload = {
        companyName: form.companyName.trim(),
        jobTitle: form.jobTitle.trim(),
        status: form.status,
        appliedDate: form.appliedDate || null,
        jobUrl: form.jobUrl.trim() || null,
        notes: form.notes.trim() || null,
        resumeId: form.resumeId ? Number(form.resumeId) : null,
      };

      if (editingApplication) {
        await applicationApi.update(editingApplication.id, payload);
      } else {
        await applicationApi.create(payload);
      }

      setIsModalOpen(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save job application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) {
      return;
    }

    try {
      await applicationApi.delete(id);
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError('Failed to delete job application.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'OFFER':
        return 'badge-emerald';
      case 'INTERVIEW':
      case 'SCREENING':
        return 'badge-cyan';
      case 'APPLIED':
        return 'badge-purple';
      case 'REJECTED':
        return 'badge-rose';
      case 'WITHDRAWN':
      default:
        return 'badge-secondary';
    }
  };

  const filteredApplications = selectedStatusTab === 'ALL'
    ? applications
    : applications.filter((app) => app.status === selectedStatusTab);

  const statusTabs = ['ALL', 'SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];

  if (loading && applications.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner spinner-lg" />
        <span>Loading job applications...</span>
      </div>
    );
  }

  return (
    <div className="applications-page fade-in">
      <div className="page-header">
        <div>
          <h1>Job Applications</h1>
          <p>Track job opportunities, interview statuses, and application details.</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          Add Application
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatusTab(tab)}
            className={`btn ${selectedStatusTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 12px', fontSize: '0.85rem', textTransform: 'capitalize', whiteSpace: 'nowrap' }}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', color: 'var(--text-secondary)' }}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <h3 style={{ margin: '16px 0 8px' }}>No Applications Found</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>
              {selectedStatusTab === 'ALL'
                ? 'Keep track of all your applications and offers in one place.'
                : `No applications currently in the "${selectedStatusTab.toLowerCase()}" stage.`}
            </p>
            {selectedStatusTab === 'ALL' && (
              <button onClick={handleOpenAddModal} className="btn btn-primary">
                Add Application
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredApplications.map((app) => (
            <div key={app.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{app.jobTitle}</h3>
                  <span className={`badge ${getStatusBadgeClass(app.status)}`}>{app.status}</span>
                </div>
                <h4 style={{ color: 'var(--purple-light)', fontSize: '1rem', fontWeight: 500, marginBottom: '12px' }}>
                  {app.companyName}
                </h4>
                {app.jobUrl && (
                  <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="btn-link" style={{ fontSize: '0.85rem', display: 'block', marginBottom: '12px', wordBreak: 'break-all' }}>
                    View Job Posting &UpperRightArrow;
                  </a>
                )}
                {app.notes && (
                  <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {app.notes}
                  </p>
                )}
                {app.resumeId && (
                  <span className="text-secondary" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '12px' }}>
                    Linked Resume: {resumes.find((r) => r.id === app.resumeId)?.title || `ID #${app.resumeId}`}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>
                  Applied: {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'N/A'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleOpenEditModal(app)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(app.id)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal card" style={{ maxWidth: '500px', width: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>{editingApplication ? 'Edit Job Application' : 'Add Job Application'}</h3>
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
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Google, Stripe"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Software Engineer II"
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Application Status</label>
                    <select
                      className="form-input"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      required
                    >
                      <option value="SAVED">Saved</option>
                      <option value="APPLIED">Applied</option>
                      <option value="SCREENING">Screening</option>
                      <option value="INTERVIEW">Interviewing</option>
                      <option value="OFFER">Offer Received</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Applied Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={form.appliedDate}
                      onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Posting URL</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="e.g. https://careers.google.com/jobs/results/..."
                    value={form.jobUrl}
                    onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Linked Resume</label>
                  <select
                    className="form-input"
                    value={form.resumeId}
                    onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
                  >
                    <option value="">-- Select Resume --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title} {r.isPrimary ? '(Primary)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes & Comments</label>
                  <textarea
                    className="form-input"
                    placeholder="Salary range, referrals, interview notes..."
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary" disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting && <span className="spinner spinner-sm" style={{ marginRight: '8px' }} />}
                    {editingApplication ? 'Update Application' : 'Save Application'}
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
