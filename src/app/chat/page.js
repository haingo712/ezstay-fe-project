'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import chatService from '@/services/chatService';
import notification from '@/utils/notification';
import {
  MessageSquare,
  Search,
  User,
  Clock,
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Mail,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Trash2,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function UserChatsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      loadMessages(selectedChatRoom.id);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages(selectedChatRoom.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChatRoom]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getChatRooms();
      console.log('Loaded user chat rooms:', rooms);
      setChatRooms(rooms || []);

      // Auto-select first room if available
      if (rooms && rooms.length > 0 && !selectedChatRoom) {
        setSelectedChatRoom(rooms[0]);
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
      await chatService.sendMessage(selectedChatRoom.id, newMessage.trim(), selectedImages);
      setNewMessage('');

      // Clear selected images
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);

      // Reload messages
      await loadMessages(selectedChatRoom.id);

      // Update chat room list
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

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  const handleSelectChatRoom = async (room) => {
    // Don't reload if same room is selected
    if (selectedChatRoom?.id === room.id) return;

    setSelectedChatRoom(room);
    // Load messages for the selected room
    try {
      const response = await chatService.getMessages(room.id);
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
    const ownerName = room.owner?.fullName || room.owner?.FullName || '';
    const ownerEmail = room.owner?.email || room.owner?.Email || '';
    const ownerPhone = room.owner?.phone || room.owner?.Phone || '';
    const searchLower = searchTerm.toLowerCase();

    return ownerName.toLowerCase().includes(searchLower) ||
      ownerEmail.toLowerCase().includes(searchLower) ||
      ownerPhone.toLowerCase().includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {t('common.back')}
          </button>
        </div>

        {/* Two Column Layout - Similar to Messenger */}
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Left Sidebar - Conversations List */}
          <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {t('chat.title')}
              </h2>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('chat.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredChatRooms.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {t('chat.noChats')}
                  </p>
                </div>
              ) : (
                filteredChatRooms.map((room) => {
                  const isSelected = selectedChatRoom?.id === room.id;
                  // Get owner info from backend response
                  const ownerName = room.owner?.fullName || room.owner?.FullName || 'Owner';
                  const ownerEmail = room.owner?.email || room.owner?.Email || '';
                  const ownerPhone = room.owner?.phone || room.owner?.Phone || '';
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
                        <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {ownerName}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatLastMessageTime(lastMessageTime)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                            {ownerEmail}
                          </p>

                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {ownerPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChatRoom ? (
              <>
                {/* Chat Header with User Info */}
                <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="h-16 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedChatRoom.owner?.fullName || selectedChatRoom.owner?.FullName || 'Owner'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t('chat.online')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Bar */}
                  <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{selectedChatRoom.owner?.email || selectedChatRoom.owner?.Email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{selectedChatRoom.owner?.phone || selectedChatRoom.owner?.Phone || 'No phone'}</span>
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
                                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
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
                      <button
                        type="button"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        title="Add emoji"
                      >
                        <Smile className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </button>
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
        </div>
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
            Revoke Message
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}