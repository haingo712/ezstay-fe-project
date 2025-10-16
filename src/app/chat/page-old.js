'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import chatService from '@/services/chatService';
import { 
  MessageSquare, 
  Search,
  User,
  Clock,
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    
    if (!newMessage.trim() || !selectedChatRoom || sending) {
      return;
    }

    try {
      setSending(true);
      await chatService.sendMessage(selectedChatRoom.id, newMessage.trim());
      setNewMessage('');
      
      // Reload messages
      await loadMessages(selectedChatRoom.id);
      
      // Update chat room list
      await loadChatRooms();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
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
    const ownerName = room.ownerName || room.OwnerName || room.participantName || '';
    const postTitle = room.postTitle || room.PostTitle || '';
    return ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           postTitle.toLowerCase().includes(searchTerm.toLowerCase());
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
            Back
          </button>
        </div>

        {/* Two Column Layout */}
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          {/* Left Sidebar - Chat List */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                My Chats
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
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start chatting with property owners to see your conversations here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredChatRooms.map((chatRoom) => (
                <div
                  key={chatRoom.id}
                  onClick={() => handleOpenChat(chatRoom)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chatRoom.participantName || 'Property Owner'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatLastMessageTime(chatRoom.lastMessageAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mb-1">
                        {chatRoom.postTitle || 'Property Discussion'}
                      </p>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {chatRoom.lastMessage || 'No messages yet'}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {chatRoom.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {chatRoom.unreadCount > 9 ? '9+' : chatRoom.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Chat Dialog */}
      {selectedChat && (
        <ChatDialog 
          isOpen={showChatDialog}
          onClose={() => {
            setShowChatDialog(false);
            setSelectedChat(null);
            // Reload chat rooms to update last message
            loadChatRooms();
          }}
          postId={selectedChat.postId}
          postTitle={selectedChat.postTitle}
          ownerName={selectedChat.participantName}
        />
      )}
    </div>
  );
}