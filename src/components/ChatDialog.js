'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import chatService from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';

export default function ChatDialog({
  isOpen,
  onClose,
  ownerId,  // Changed from postId to ownerId
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
    if (isOpen && ownerId) {
      initializeChat();
    }
  }, [isOpen, ownerId]);

  const initializeChat = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!user) {
        console.warn('User not authenticated');
        onClose();
        return;
      }

      // ownerId is passed directly as prop from parent component
      if (!ownerId) {
        console.error('❌ ownerId is missing from props');
        throw new Error('Cannot get owner information. Owner ID is missing.');
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
        console.warn('Please login to start chatting');
        onClose();
      } else {
        console.error(`Failed to initialize chat: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      console.log('Loading messages for roomId:', roomId);
      const response = await chatService.getMessages(roomId);
      console.log('Get messages response:', response);

      // Backend trả về ApiResponse với structure { success: boolean, data: [], message: string }
      const messagesData = response.data || response;
      console.log('Messages data:', messagesData);
      console.log('Is array?', Array.isArray(messagesData));

      setMessages(Array.isArray(messagesData) ? messagesData : []);
      console.log('Messages set successfully, count:', Array.isArray(messagesData) ? messagesData.length : 0);
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
      console.log('Sending message to chatRoomId:', chatRoomId);
      console.log('Message content:', newMessage.trim());

      const response = await chatService.sendMessage(chatRoomId, newMessage.trim());
      console.log('Send message response:', response);

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
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[380px] h-[500px] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                Chat with {ownerName || 'Owner'}
              </h3>
              <p className="text-sm text-blue-100 truncate max-w-[200px]">
                About: {postTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">
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
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${isOwn
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-100 dark:border-gray-600'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content || message.Content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'
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
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              disabled={sending || !chatRoomId}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || !chatRoomId}
              className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}