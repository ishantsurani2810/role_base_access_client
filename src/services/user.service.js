import api from './api.js';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data.user;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data.data.user;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get('/users/roles');
  return response.data.data.roles;
};

// Invitation specific tools
export const inviteUser = async (invitationBody) => {
  const response = await api.post('/invitations', invitationBody);
  return response.data;
};

export const getPendingInvitations = async () => {
  const response = await api.get('/invitations/pending');
  return response.data.data.invitations;
};

export const resendInvitation = async (id) => {
  const response = await api.post(`/invitations/${id}/resend`);
  return response.data;
};

export const cancelInvitation = async (id) => {
  const response = await api.delete(`/invitations/${id}`);
  return response.data;
};
