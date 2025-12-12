import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthProvider';
import { saveGithubTokenAndDispatch, setupGithubRepoAndDispatch } from '../../service/GithubService';
import { toast } from 'sonner';
import './GithubSetupModal.scss';

export default function GithubSetupModal({ groupId, onClose }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { loading, saveTokenStatus, setupRepoStatus, error } = useSelector((state) => state.github);

  const [step, setStep] = useState(1); // 1: Save Token, 2: Setup Repo
  
  // Step 1: Save Token
  const [githubToken, setGithubToken] = useState('');

  // Step 2: Setup Repo
  const [repoName, setRepoName] = useState('');
  const [collaborator, setCollaborator] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('https://yourapp.com/github/webhook');
  const [secret, setSecret] = useState('my-webhook-secret');

  const handleSaveToken = async (e) => {
    e.preventDefault();
    
    if (!githubToken.trim()) {
      toast.error('Please enter GitHub token');
      return;
    }

    try {
      await saveGithubTokenAndDispatch({
        groupId,
        githubToken: githubToken.trim(),
        token: user?.token,
        dispatch,
      });

      toast.success('GitHub token saved successfully!');
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save token');
    }
  };

  const handleSetupRepo = async (e) => {
    e.preventDefault();

    if (!repoName.trim()) {
      toast.error('Please enter repository name');
      return;
    }

    try {
      await setupGithubRepoAndDispatch({
        groupId,
        repoName: repoName.trim(),
        collaborator: collaborator.trim(),
        callbackUrl: callbackUrl.trim(),
        secret: secret.trim(),
        token: user?.token,
        dispatch,
      });

      toast.success('GitHub repository setup successfully!');
      setTimeout(() => {
        onClose && onClose();
      }, 1500);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to setup repository');
    }
  };

  return (
    <div className="github-setup-modal-overlay" onClick={onClose}>
      <div className="github-setup-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="github-setup-modal-header">
          <h3>GitHub Integration Setup</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="github-setup-modal-body">
          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Save Token</div>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Setup Repository</div>
            </div>
          </div>

          {/* Step 1: Save Token */}
          {step === 1 && (
            <form onSubmit={handleSaveToken} className="github-form">
              <div className="form-group">
                <label htmlFor="githubToken">
                  GitHub Personal Access Token *
                  <span className="label-hint">
                    (Create one at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings</a>)
                  </span>
                </label>
                <input
                  id="githubToken"
                  type="password"
                  className="form-input"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Setup Repo */}
          {step === 2 && (
            <form onSubmit={handleSetupRepo} className="github-form">
              <div className="form-group">
                <label htmlFor="repoName">Repository Name *</label>
                <input
                  id="repoName"
                  type="text"
                  className="form-input"
                  placeholder="test-webhook-12/12/2025"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="collaborator">Collaborator (GitHub Username)</label>
                <input
                  id="collaborator"
                  type="text"
                  className="form-input"
                  placeholder="longle2507, thanhtc003"
                  value={collaborator}
                  onChange={(e) => setCollaborator(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="callbackUrl">Webhook Callback URL</label>
                <input
                  id="callbackUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://yourapp.com/github/webhook"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="secret">Webhook Secret</label>
                <input
                  id="secret"
                  type="password"
                  className="form-input"
                  placeholder="my-webhook-secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>
                  Back
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Setting up...' : 'Setup Repository'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
