import api from '../axios';
import { REACT_API_URL } from '../api/apiConfig';
import {
  saveTokenPending,
  saveTokenFulfilled,
  saveTokenRejected,
  setupRepoPending,
  setupRepoFulfilled,
  setupRepoRejected,
} from '../redux/slice/githubSlice';

/**
 * Save GitHub token for a group
 * POST {{host_dev}}/api/task/github/save-token
 * Body: { groupId: string, githubToken: string }
 */
export const saveGithubToken = async (groupId, githubToken, token, dispatch) => {
  try {
    if (dispatch) dispatch(saveTokenPending());

    // Normalize base URL
    let base = String(REACT_API_URL).trim().replace(/\/+$/, '');
    if (!/\/api(\/|$)/i.test(base)) {
      base = base + '/api';
    }

    const url = `${base}/task/github/save-token`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      groupId,
      githubToken,
    };

    console.log('[GitHub] Saving token:', { url, payload });

    const response = await api.post(url, payload, { headers });

    console.log('[GitHub] Token saved successfully:', response.data);

    if (dispatch) {
      dispatch(saveTokenFulfilled(response.data));
    }

    return response.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to save GitHub token';
    console.error('[GitHub] Save token error:', errorMsg, error);

    if (dispatch) {
      dispatch(saveTokenRejected(errorMsg));
    }

    throw error;
  }
};

/**
 * Setup GitHub repository
 * POST {{host_dev}}/api/task/github/setup-repo
 * Body: { 
 *   groupId: string,
 *   repoName: string,
 *   collaborator: string,
 *   callbackUrl: string,
 *   secret: string
 * }
 */
export const setupGithubRepo = async (
  {
    groupId,
    repoName,
    collaborator,
    callbackUrl,
    secret,
  },
  token,
  dispatch
) => {
  try {
    if (dispatch) dispatch(setupRepoPending());

    // Normalize base URL
    let base = String(REACT_API_URL).trim().replace(/\/+$/, '');
    if (!/\/api(\/|$)/i.test(base)) {
      base = base + '/api';
    }

    const url = `${base}/task/github/setup-repo`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      groupId,
      repoName,
      collaborator,
      callbackUrl,
      secret,
    };

    console.log('[GitHub] Setting up repo:', { url, payload });

    const response = await api.post(url, payload, { headers });

    console.log('[GitHub] Repo setup successfully:', response.data);

    if (dispatch) {
      dispatch(setupRepoFulfilled(response.data));
    }

    return response.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error?.message || 'Failed to setup GitHub repository';
    console.error('[GitHub] Setup repo error:', errorMsg, error);

    if (dispatch) {
      dispatch(setupRepoRejected(errorMsg));
    }

    throw error;
  }
};

/**
 * Save token and dispatch (wrapper for convenience)
 */
export const saveGithubTokenAndDispatch = ({ groupId, githubToken, token, dispatch }) => {
  return saveGithubToken(groupId, githubToken, token, dispatch);
};

/**
 * Setup repo and dispatch (wrapper for convenience)
 */
export const setupGithubRepoAndDispatch = ({ groupId, repoName, collaborator, callbackUrl, secret, token, dispatch }) => {
  return setupGithubRepo({ groupId, repoName, collaborator, callbackUrl, secret }, token, dispatch);
};
