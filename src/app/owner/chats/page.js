'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import chatService from '@/services/chatService';
import notification from '@/utils/notification';
import {
  Search,
  Send,
  User,
  MessageSquare,
  Clock,
  Phone,
  Video,
  MoreVertical,
  Mail,
  Smile,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Trash2,
  X
} from 'lucide-react';

export default function OwnerChatsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, messageId: null });
  const [revokingMessageId, setRevokingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedChatRoom) {
      // Get the correct room ID
      const roomId = selectedChatRoom.id || selectedChatRoom.chatRoomId || selectedChatRoom.Id || selectedChatRoom.ChatRoomId;
      
      // Only load messages if we have a valid GUID roomId (not a number like "1")
      if (roomId && typeof roomId === 'string' && roomId.includes('-')) {
        loadMessages(roomId);
        // Auto-refresh messages every 5 seconds when a chat is selected
        const interval = setInterval(() => {
          loadMessages(roomId);
        }, 5000);
        return () => clearInterval(interval);
      } else {
        console.warn('Invalid chat room ID:', roomId, 'Full room data:', selectedChatRoom);
      }
    }
  }, [selectedChatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getOwnerChatRooms();
      console.log('Raw chat rooms from API:', rooms);
      
      if (rooms?.[0]) {
        console.log('First room ALL KEYS:', Object.keys(rooms[0]));
        console.log('First room FULL OBJECT:', JSON.stringify(rooms[0], null, 2));
      }
      
      // Normalize room data - ensure each room has an 'id' field (GUID format)
      const normalizedRooms = (rooms || []).map((room, index) => {
        // Find the correct ID field (should be a GUID) - check all possible field names
        const possibleIds = {
          chatRoomId: room.chatRoomId,
          ChatRoomId: room.ChatRoomId,
          roomId: room.roomId,
          RoomId: room.RoomId,
          id: room.id,
          Id: room.Id,
        };
        console.log(`Room ${index} - All possible IDs:`, possibleIds);
        
        // Find the first GUID-like ID (contains hyphens)
        let roomId = null;
        for (const [key, value] of Object.entries(possibleIds)) {
          if (value && typeof value === 'string' && value.includes('-')) {
            console.log(`Room ${index} - Using ${key}:`, value);
            roomId = value;
            break;
          }
        }
        
        // If no GUID found, use whatever ID is available
        if (!roomId) {
          roomId = room.chatRoomId || room.ChatRoomId || room.roomId || room.RoomId || room.id || room.Id;
          console.warn(`Room ${index} - No GUID found, using:`, roomId);
        }
        
        return {
          ...room,
          id: roomId
        };
      });
      console.log('Normalized chat rooms:', normalizedRooms);
      
      setChatRooms(normalizedRooms);

      // Auto-select first room if available and has valid ID
      if (normalizedRooms && normalizedRooms.length > 0 && !selectedChatRoom) {
        const firstRoom = normalizedRooms[0];
        if (firstRoom.id && typeof firstRoom.id === 'string' && firstRoom.id.includes('-')) {
          setSelectedChatRoom(firstRoom);
        } else {
          console.warn('First room does not have valid GUID ID:', firstRoom.id);
        }
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId) => {
    try {
      const response = await chatService.getMessages(chatRoomId);
      const messagesData = response.data || response;
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage.trim() && selectedImages.length === 0) || !selectedChatRoom || sending) {
      return;
    }

    try {
      setSending(true);
      const roomId = selectedChatRoom.id || selectedChatRoom.chatRoomId || selectedChatRoom.Id || selectedChatRoom.ChatRoomId;
      await chatService.sendMessage(roomId, newMessage.trim(), selectedImages);
      setNewMessage('');

      // Clear selected images
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);

      // Reload messages
      await loadMessages(roomId);

      // Update chat room list to reflect new message
      await loadChatRooms();
    } catch (error) {
      console.error('Error sending message:', error);
      notification.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        notification.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Add new files
    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Remove selected image
  const removeSelectedImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle message right-click context menu
  const handleMessageContextMenu = (e, messageId, isOwn) => {
    if (!isOwn) return; // Only allow context menu for own messages
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      messageId: messageId
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, messageId: null });
  };

  // Handle revoke message
  const handleRevokeMessage = async (messageId) => {
    closeContextMenu();

    const confirmed = await notification.confirm(
      'Are you sure you want to revoke this message? This action cannot be undone.',
      'Revoke Message'
    );

    if (!confirmed) return;

    try {
      setRevokingMessageId(messageId);
      await chatService.revokeMessage(messageId);
      notification.success('Message revoked successfully');

      // Reload messages
      await loadMessages(selectedChatRoom.id);
    } catch (error) {
      console.error('Error revoking message:', error);
      notification.error('Failed to revoke message. Please try again.');
    } finally {
      setRevokingMessageId(null);
    }
  };

  const handleSelectChatRoom = async (room) => {
    // Get the correct room ID
    const roomId = room.id || room.chatRoomId || room.Id || room.ChatRoomId;
    const currentRoomId = selectedChatRoom?.id || selectedChatRoom?.chatRoomId;
    
    // Don't reload if same room is selected
    if (currentRoomId === roomId) return;

    setSelectedChatRoom({ ...room, id: roomId });
    // Load messages for the selected room
    try {
      console.log('Loading messages for room:', roomId);
      const response = await chatService.getMessages(roomId);
      const messagesData = response.data || response;
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredChatRooms = chatRooms.filter(room => {
    const userName = room.user?.fullName || room.user?.FullName || '';
    const userEmail = room.user?.email || room.user?.Email || '';
    const userPhone = room.user?.phone || room.user?.Phone || '';
    const searchLower = searchTerm.toLowerCase();

    return userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower) ||
      userPhone.toLowerCase().includes(searchLower);
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-gray-900">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {t('chat.messages')}
          </h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('chat.searchConversations')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredChatRooms.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('chat.noConversations')}
              </p>
            </div>
          ) : (
            filteredChatRooms.map((room) => {
              const isSelected = selectedChatRoom?.id === room.id;
              // Get user info from backend response
              const userName = room.user?.fullName || room.user?.FullName || 'User';
              const userEmail = room.user?.email || room.user?.Email || '';
              const userPhone = room.user?.phone || room.user?.Phone || '';
              const lastMessageTime = room.lastMessageAt || room.LastMessageAt;

              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectChatRoom(room)}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {userName}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatLastMessageTime(lastMessageTime)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                        {userEmail}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userPhone}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatRoom ? (
          <>
            {/* Chat Header with User Info */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedChatRoom.user?.fullName || selectedChatRoom.user?.FullName || 'User'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info Bar */}
              <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{selectedChatRoom.user?.email || selectedChatRoom.user?.Email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{selectedChatRoom.user?.phone || selectedChatRoom.user?.Phone || 'No phone'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('chat.noMessages')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const currentUserId = user?.id || user?.userId || user?.Id;
                    const messageSenderId = message.senderId || message.SenderId;
                    const isOwn = currentUserId && messageSenderId &&
                      currentUserId.toString() === messageSenderId.toString();
                    const isRead = message.isRead || message.IsRead;
                    const messageImages = message.image || message.Image || [];
                    const isRevoking = revokingMessageId === (message.id || message.Id);

                    return (
                      <div
                        key={message.id || message.Id || index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
                          onContextMenu={(e) => handleMessageContextMenu(e, message.id || message.Id, isOwn)}
                        >
                          {!isOwn && (
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}

                          <div
                            className={`relative px-4 py-2 rounded-2xl ${isOwn
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                              } ${isRevoking ? 'opacity-50' : ''}`}
                          >
                            {/* Message Images */}
                            {messageImages.length > 0 && (
                              <div className={`mb-2 ${messageImages.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                                {messageImages.map((img, imgIdx) => (
                                  <img
                                    key={imgIdx}
                                    src={img}
                                    alt={`Image ${imgIdx + 1}`}
                                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(img, '_blank')}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Message Content */}
                            {(message.content || message.Content) && (
                              <p className="text-sm">{message.content || message.Content}</p>
                            )}

                            {/* Time and Read Status */}
                            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                {formatMessageTime(message.sentAt || message.SentAt)}
                              </p>
                              {/* Read Status for own messages */}
                              {isOwn && (
                                <span className="ml-1">
                                  {isRead ? (
                                    <CheckCheck className="h-3.5 w-3.5 text-blue-200" title="Read" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 text-blue-200" title="Sent" />
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Revoke button on hover (for own messages) */}
                            {isOwn && !isRevoking && (
                              <button
                                onClick={() => handleRevokeMessage(message.id || message.Id)}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title="Revoke message"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {isRevoking && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input with Icons */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-16 w-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {/* <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Add emoji"
                  >
                    <Smile className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button> */}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Send image"
                  >
                    <ImageIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Message Input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('chat.typeMessage')}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 dark:text-white"
                  disabled={sending}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && selectedImages.length === 0) || sending}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('chat.selectConversation')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {t('chat.startConversation')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu for Message Actions */}
      {contextMenu.visible && (
        <div
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => handleRevokeMessage(contextMenu.messageId)}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 className="h-4 w-4" />
            {t('chat.revokeMessage')}
          </button>
        </div>
      )}
    </div>
  );
}