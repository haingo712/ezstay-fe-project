import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const userService = {
  // Get all users (for selecting tenant when creating contract)
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/Accounts`);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/Accounts/${id}`);
    return response.data;
  },
  
  // Search users by email, name, phone
  search: async (searchTerm) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/Accounts`);
      const users = response.data;
      
      // Filter users based on search term
      const filtered = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.toLowerCase().includes(searchLower)
        );
      });
      
      return filtered;
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }
};

export default userService;