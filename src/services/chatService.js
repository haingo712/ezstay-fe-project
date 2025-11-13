/**
 * Chat service for handling chat functionality
 * Integrates with the API Gateway and Chat API endpoints
 */

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://localhost:7000';

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
   * Create a chat room for a specific owner
   * @param {string} ownerId - The owner's account ID
   * @returns {Promise} Chat room creation response
   */
  async createChatRoom(ownerId) {
    try {
      console.log('Creating chat room for ownerId:', ownerId);
      const headers = this.getHeaders();
      console.log('Request headers:', headers);

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
   * Send a message to a chat room
   * @param {string} chatRoomId - The chat room ID
   * @param {string} message - The message content
   * @returns {Promise} Message send response
   */
  async sendMessage(chatRoomId, message) {
    try {
      const formData = new FormData();
      formData.append('Content', message);
      // Don't append Image field - let it be null in backend

      const token = this.getAuthToken();
      console.log('Sending message to:', `${API_GATEWAY_URL}/api/Chat/message/${chatRoomId}`);
      console.log('FormData Content:', message);

      const response = await fetch(`${API_GATEWAY_URL}/api/Chat/message/${chatRoomId}`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send message failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send a message with image to a chat room
   * @param {string} chatRoomId - The chat room ID
   * @param {string} message - The message content
   * @param {File} imageFile - The image file to send
   * @returns {Promise} Message send response
   */
  async sendMessageWithImage(chatRoomId, message, imageFile) {
    try {
      const formData = new FormData();
      formData.append('Content', message);
      formData.append('Image', imageFile);

      const token = this.getAuthToken();
      console.log('Sending message with image to:', `${API_GATEWAY_URL}/api/Chat/message/${chatRoomId}`);

      const response = await fetch(`${API_GATEWAY_URL}/api/Chat/message/${chatRoomId}`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Send message with image failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Message with image sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending message with image:', error);
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
   * Get chat room by owner ID
   * @param {string} ownerId - The owner ID
   * @returns {Promise} Chat room data
   */
  async getChatRoomByOwnerId(ownerId) {
    try {
      // Backend doesn't have this endpoint yet, so we'll return null
      // and let createChatRoom handle creation
      console.warn('getChatRoomByOwnerId endpoint not implemented, will create new room');
      return null;
    } catch (error) {
      console.error('Error getting chat room by owner ID:', error);
      return null;
    }
  }
}

const chatService = new ChatService();
export default chatService;