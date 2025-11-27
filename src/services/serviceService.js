import api from '@/utils/api';

const serviceService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/Service/all');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },

  getById: async (id) => {
    const response = await api.get(`/api/Service/${id}`);
    return response.data || response;
  },

  create: async (data) => {
    const response = await api.post('/api/Service/add', data);
    return response.data || response;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/Service/update/${id}`, data);
    return response.data || response;
  },

  remove: async (id) => {
    const response = await api.delete(`/api/Service/delete/${id}`);
    return response.data || response;
  }
};

export default serviceService;
