import api from './api.js';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data.data.product;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data.data.product;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data.data.product;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
