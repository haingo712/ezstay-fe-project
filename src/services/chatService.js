/**
 * Chat service for handling chat functionality
 * Integrates with the API Gateway and Chat API endpoints
 */

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

class ChatService {
  /**
   * Get the authorization token from localStorage
   */
  getAuthToken() {
    if (typeof window !== 'undefined') {
      // Try different token keys used by the app
      return localStorage.getItem('authToken') || 
             localStorage.getItem('ezstay_token') || 
             localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    const token = this.getAuthToken();
    console.log('Chat Service - Token found:', token ? 'Yes' : 'No');
    if (token) {
      console.log('Chat Service - Token prefix:', token.substring(0, 20) + '...');
    }
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Create a chat room with the owner
   * @param {string} ownerId - The owner's user ID (not postId!)
   * @returns {Promise} Chat room creation response
   */
  async createChatRoom(ownerId) {
    try {
      console.log('Creating chat room with ownerId:', ownerId);
      const headers = this.getHeaders();
      console.log('Request headers:', headers);
      
      // Backend endpoint: POST /api/Chat/{ownerId}
      // [HttpPost("{ownerId}")]
      // [Authorize(Roles = "User")]
      // public async Task<IActionResult> CreateChatRoom(Guid ownerId)
      const response = await fetch(`${API_GATEWAY_URL}/api/Chat/${ownerId}`, {
        method: 'POST',
        headers: headers,
      });

      console.log('Chat room creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat room creation failed:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat room created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  /**
   * Send a message to a chat room (with optional images)
   * @param {string} chatRoomId - The chat room ID
   * @param {string} message - The message content
   * @param {File[]} images - Optional array of image files
   * @returns {Promise} Message send response
   */
  async sendMessage(chatRoomId, message, images = []) {
    try {
      // Backend endpoint: POST /api/Chat/message/{chatRoomId}
      // [HttpPost("message/{chatRoomId}")]
      // public async Task<IActionResult> SendMessage(Guid chatRoomId, [FromForm] CreateChatMessage request)
      
      const formData = new FormData();
      formData.append('Content', message);
      
      // Append images if provided
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('Image', image);
        });
      }
      
      const headers = this.getHeaders();
      // Remove Content-Type to let browser set it with boundary for FormData
      delete headers['Content-Type'];
      
      const response = await fetch(`${API_GATEWAY_URL}/api/Chat/message/${chatRoomId}`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Revoke/Delete a message
   * @param {string} chatMessageId - The message ID to revoke
   * @returns {Promise} Delete response
   */
  async revokeMessage(chatMessageId) {
    try {
      console.log('Revoking message:', chatMessageId);
      const response = await fetch(`${API_GATEWAY_URL}/api/Chat/${chatMessageId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Message revoked successfully:', data);
      return data;
    } catch (error) {
      console.error('Error revoking message:', error);
      throw error;
    }
  }

  /**
   * Get messages from a chat room
   * @param {string} chatRoomId - The chat room ID
   * @returns {Promise} Messages array
   */
  async getMessages(chatRoomId) {
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/Chat/messages/${chatRoomId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Get chat rooms for the current user
   * Uses the same endpoint as owner: GET /api/Chat
   * Backend returns chat rooms where user is either owner or tenant
   * @returns {Promise} Chat rooms array
   */
  async getChatRooms() {
    try {
      console.log('Fetching user chat rooms...');
      const response = await fetch(`${API_GATEWAY_URL}/api/Chat`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('User chat rooms response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('No chat rooms found');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('User chat rooms data:', data);
      return data?.data || data || [];
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      return [];
    }
  }

  /**
   * Get all chat rooms for owner
   * @returns {Promise} Chat rooms array
   */
  async getOwnerChatRooms() {
    try {
      console.log('Fetching owner chat rooms...');
      const response = await fetch(`${API_GATEWAY_URL}/api/Chat`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('Owner chat rooms response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('No chat rooms found for owner');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Owner chat rooms data:', data);
      return data?.data || data || [];
    } catch (error) {
      console.error('Error getting owner chat rooms:', error);
      return [];
    }
  }

  /**
   * Get chat room by post ID
   * @param {string} postId - The rental post ID
   * @returns {Promise} Chat room data
   */
  async getChatRoomByPostId(postId) {
    try {
      // Backend doesn't have this endpoint yet, so we'll return null
      // and let createChatRoom handle creation
      console.warn('getChatRoomByPostId endpoint not implemented, will create new room');
      return null;
    } catch (error) {
      console.error('Error getting chat room by post ID:', error);
      return null;
    }
  }
}

const chatService = new ChatService();
export default chatService;