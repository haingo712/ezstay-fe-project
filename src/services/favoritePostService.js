// src/services/favoritePostService.js
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/FavoritePosts`;

class FavoritePostService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAuthHeader() {
    if (typeof window === 'undefined') {
      return {};
    }

    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('ezstay_token') ||
      localStorage.getItem('token');

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async addFavorite(postId) {
    const response = await axios.post(
      this.baseUrl,
      { postId },
      {
        headers: this.getAuthHeader(),
      }
    );
    console.log('📥 Raw add favorite response:', response.data);
    
    // Normalize to camelCase - Keep original GUID format for id
    const normalized = {
      id: response.data.id || response.data.Id || response.data._id, // Keep original format
      accountId: response.data.accountId || response.data.AccountId,
      postId: (response.data.postId || response.data.PostId)?.toString().toLowerCase(), // Only lowercase postId for comparison
      createdAt: response.data.createdAt || response.data.CreatedAt
    };
    
    console.log('📥 Normalized favorite:', normalized);
    return normalized;
  }

  async getMyFavorites() {
    const response = await axios.get(
      `${this.baseUrl}/me`,
      {
        headers: this.getAuthHeader(),
      }
    );
    console.log('📥 Raw favorites response:', response.data);
    
    // Normalize to camelCase if backend returns PascalCase
    // IMPORTANT: Keep original GUID format for deletion to work correctly
    const normalized = Array.isArray(response.data) 
      ? response.data.map(item => {
          const favorite = {
            id: (item.id || item.Id || item._id)?.toString(), // Keep original format
            accountId: (item.accountId || item.AccountId)?.toString(),
            postId: (item.postId || item.PostId)?.toString().toLowerCase(), // Only lowercase postId for comparison
            createdAt: item.createdAt || item.CreatedAt
          };
          console.log('📥 Individual favorite item:', { raw: item, normalized: favorite });
          return favorite;
        })
      : response.data;
    
    console.log('📥 All Normalized favorites:', normalized);
    return normalized;
  }

  async removeFavorite(favoriteId) {
    await axios.delete(
      `${this.baseUrl}/${favoriteId}`,
      {
        headers: this.getAuthHeader(),
      }
    );
  }

  isFavorited(postId, favorites) {
    if (!Array.isArray(favorites)) return false;
    return favorites.some((favorite) => favorite.postId === postId);
  }
}

export default new FavoritePostService();
