import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as authService from '../../services/auth.service.js';
import { UserCheck } from 'lucide-react';

export const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [details, setDetails] = useState(null);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMess, setErrorMess] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validate the invitation token on mount
  useEffect(() => {
    if (!token) {
      setErrorMess('Invitation token parameter is missing.');
      setLoading(false);
      return;
    }

    const checkToken = async () => {
      try {
        const data = await authService.validateInvitationToken(token);
        setDetails(data);
        setValid(true);
      } catch (err) {
        setErrorMess(err.response?.data?.message || 'The verification link has expired or is invalid.');
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMess('Passwords do not match.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMess('Password must meet core requirements: at least 8 characters, include a number, capitalization, and special symbol.');
      return;
    }

    setSubmitting(true);
    setErrorMess('');

    try {
      await authService.acceptInvitation(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorMess(err.response?.data?.message || 'Failed to active user profile.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-wrapper">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignSelf: 'center', backgroundColor: 'var(--primary-light)', padding: '12px', borderRadius: '50%' }}>
            <UserCheck size={32} style={{ color: 'var(--primary)' }} />
          </div>
          <h2>Join Platform</h2>
          {valid && details && (
            <p>Setup password for <b>{details.name}</b> ({details.email})</p>
          )}
        </div>

        {errorMess && (
          <div className="alert alert-danger">
            <span>{errorMess}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>Account activated! Redirecting to login in 3 seconds...</span>
          </div>
        )}

        {valid && !success && (
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '12px', backgroundColor: 'var(--gray-100)', borderRadius: 'var(--border-radius-md)', marginBottom: '20px', fontSize: '13.5px' }}>
              <p>Designated Role: <span className="badge badge-indigo">{details.role?.name || 'Employee'}</span></p>
            </div>

            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ul style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '8px', paddingLeft: '16px' }}>
                <li>Minimum of 8 characters</li>
                <li>One uppercase & one lowercase letter</li>
                <li>One number & one special symbol (@$!%*?&#)</li>
              </ul>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? 'Activating Profile...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {!valid && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>
              Go to Login Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation;
