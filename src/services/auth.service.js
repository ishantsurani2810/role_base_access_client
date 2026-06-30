import api, { setAccessToken } from './api.js';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { accessToken, user } = response.data.data;
  setAccessToken(accessToken);
  return { user, accessToken };
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    setAccessToken('');
  }
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

export const tryAutoLogin = async () => {
  try {
    const response = await api.post('/auth/refresh');
    const { accessToken, user } = response.data.data;
    setAccessToken(accessToken);
    return user;
  } catch (error) {
    return null;
  }
};

export const validateInvitationToken = async (token) => {
  const response = await api.get(`/invitations/validate?token=${token}`);
  return response.data.data;
};

export const acceptInvitation = async (token, password) => {
  const response = await api.post('/invitations/accept', { token, password });
  return response.data.data.user;
};
