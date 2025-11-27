'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import chatService from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';

export default function ChatDialog({ 
  isOpen, 
  onClose, 
  postId, 
  postTitle,
  ownerName 
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatRoomId, setChatRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat when dialog opens
  useEffect(() => {
    if (isOpen && postId) {
      initializeChat();
    }
  }, [isOpen, postId]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        notification.warning('Please login to start chatting');
        onClose();
        return;
      }
      
      // Get ownerId from post data
      const rentalPostService = await import('@/services/rentalPostService');
      const post = await rentalPostService.default.getPostById(postId);
      
      // Try multiple possible field names for owner ID
      const ownerId = post?.ownerId || post?.OwnerId || post?.authorId || post?.AuthorId;
      
      console.log('🔍 Post data for chat:', { 
        postId, 
        ownerId, 
        authorId: post?.authorId,
        allKeys: Object.keys(post || {})
      });
      
      if (!ownerId) {
        console.error('❌ Post object:', post);
        throw new Error('Cannot get owner information from post. Check console for post data.');
      }
      
      console.log('🔍 Looking for chat room with ownerId:', ownerId);
      
      // Get all existing chat rooms
      const allRoomsResponse = await chatService.getChatRooms();
      const allRooms = allRoomsResponse?.data || allRoomsResponse || [];
      
      // Find existing chat room with this owner
      let chatRoom = allRooms.find(room => {
        const roomOwnerId = room.ownerId || room.OwnerId;
        return roomOwnerId && roomOwnerId.toString() === ownerId.toString();
      });
      
      // If no chat room exists, create one
      if (!chatRoom) {
        console.log('📝 Creating new chat room with ownerId:', ownerId);
        const createResponse = await chatService.createChatRoom(ownerId);
        chatRoom = createResponse.data || createResponse;
      } else {
        console.log('✅ Found existing chat room:', chatRoom.id || chatRoom.Id);
      }
      
      // Extract room ID from response (backend returns different structures)
      const roomId = chatRoom?.id || chatRoom?.Id;
      if (roomId) {
        setChatRoomId(roomId);
        // Load existing messages
        await loadMessages(roomId);
      } else {
        throw new Error('Could not get chat room ID from response');
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      if (error.message?.includes('401')) {
        notification.warning('Please login to start chatting');
        onClose();
      } else {
        notification.error(`Failed to initialize chat: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await chatService.getMessages(roomId);
      // Backend trả về ApiResponse với structure { success: boolean, data: [], message: string }
      const messagesData = response.data || response;
      setMessages(Array.isArray(messagesData) ? messagesData : []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatRoomId || sending) {
      return;
    }

    try {
      setSending(true);
      await chatService.sendMessage(chatRoomId, newMessage.trim());
      
      // Reload messages to get the updated list
      await loadMessages(chatRoomId);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      notification.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Chat with {ownerName || 'Owner'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                About: {postTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                // Determine if message is from current user by comparing sender ID
                const currentUserId = user?.id || user?.userId || user?.Id;
                const messageSenderId = message.senderId || message.SenderId;
                const isOwn = currentUserId && messageSenderId && currentUserId.toString() === messageSenderId.toString();
                
                return (
                  <div
                    key={message.id || index}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content || message.Content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatMessageTime(message.sentAt || message.SentAt || message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={sending || !chatRoomId}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || !chatRoomId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}