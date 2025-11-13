'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import chatService from '@/services/chatService';
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
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';

export default function OwnerChatsPage() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (selectedChatRoom) {
      loadMessages(selectedChatRoom.id);
      // Auto-refresh messages every 5 seconds when a chat is selected
      const interval = setInterval(() => {
        loadMessages(selectedChatRoom.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getOwnerChatRooms();
      console.log('Loaded chat rooms:', rooms);
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

    if ((!newMessage.trim() && !selectedImage) || !selectedChatRoom || sending) {
      return;
    }

    try {
      setSending(true);

      // If there's an image, send it along with the message
      if (selectedImage) {
        await chatService.sendMessageWithImage(
          selectedChatRoom.id,
          newMessage.trim(), // Can be empty when sending image
          selectedImage
        );
      } else {
        await chatService.sendMessage(selectedChatRoom.id, newMessage.trim());
      }

      setNewMessage('');
      setSelectedImage(null);

      // Reload messages
      await loadMessages(selectedChatRoom.id);

      // Update chat room list to reflect new message
      await loadChatRooms();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectChatRoom = (room) => {
    setSelectedChatRoom(room);
    setMessages([]);
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
            Messages
          </h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
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
                No conversations yet
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

                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title={selectedChatRoom.user?.phone || selectedChatRoom.user?.Phone || 'No phone'}
                  >
                    <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <Video className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
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
                      No messages yet. Start the conversation!
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

                    return (
                      <div
                        key={message.id || index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwn && (
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}

                          <div
                            className={`px-4 py-2 rounded-2xl ${isOwn
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                              }`}
                          >
                            {/* Display images if available */}
                            {message.image && message.image.length > 0 && (
                              <div className="mb-2 space-y-2">
                                {message.image.map((imageUrl, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={imageUrl}
                                    alt="Sent image"
                                    className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Display message content only if not empty/whitespace */}
                            {(message.content || message.Content) && (message.content || message.Content).trim() && (
                              <p className="text-sm">{message.content || message.Content}</p>
                            )}

                            <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                              }`}>
                              {formatMessageTime(message.sentAt || message.SentAt)}
                            </p>
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
              {/* Image Preview */}
              {selectedImage && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
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
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
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
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:ring-2 focus:ring-blue-500 dark:text-white"
                  disabled={sending}
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || sending}
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
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}