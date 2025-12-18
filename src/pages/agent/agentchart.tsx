// src/screens/chat/ChatScreen.tsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Send, Menu, Search, MoreVertical, Check, CheckCheck, ArrowLeft, Paperclip, Image } from 'lucide-react';
import Sidebar from '../../components/agentsidebar';
import { loadAuthFromStorage } from '../../features/auth/authService';
import UserService from '../../Services/charts_service';

const SOCKET_URL = import.meta.env?.VITE_SOCKET_URL || 'http://13.61.185.238:5050';

interface User {
  name?: string;
  _id: string;
  full_name: string;
  email?: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  roles?: string[];
}

interface Conversation {
  id: string;
  user: User;
  avatarColor: string;
  unreadCount: number;
  lastMessage?: { content: string; createdAt: Date };
  status: 'online' | 'offline' | 'away';
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  sender: { _id: string };
  read: boolean;
}

// Generate consistent color based on user ID
const getAvatarColor = (userId: string): string => {
  const colors = [
    'from-blue-400 to-purple-500',
    'from-pink-400 to-rose-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-teal-400 to-cyan-500',
    'from-yellow-400 to-orange-500',
    'from-red-400 to-pink-500',
    'from-blue-400 to-cyan-500',
  ];
  const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export default function AgentChatScreen() {
  // State
  const [inputText, setInputText] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [selfTyping, setSelfTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await UserService.getAllUsers();

        let users: User[] = [];
        if (response?.data?.users && Array.isArray(response.data.users)) {
          users = response.data.users;
        } else {
          const responseObj = response as any;
          for (const key in responseObj) {
            if (Array.isArray(responseObj[key])) {
              users = responseObj[key];
              break;
            }
          }
          if (!Array.isArray(users) || users.length === 0) {
            throw new Error('Invalid response format: users data not found');
          }
        }

        const userConversations: Conversation[] = users.map((user: User) => {
          if (!user._id) user._id = `temp_${Math.random().toString(36).substr(2, 9)}`;
          if (!user.full_name) user.full_name = user.email ? user.email.split('@')[0] : 'Unknown User';

          const roleString = user.roles && user.roles.length > 0 ? ` (${user.roles.join(', ')})` : '';

          return {
            id: user._id,
            user: {
              _id: user._id,
              full_name: `${user.full_name}${roleString}`,
              name: `${user.full_name}${roleString}`,
              email: user.email || 'unknown@example.com',
              avatar: user.avatar,
              isOnline: user.isOnline || false,
              lastSeen: user.lastSeen ? new Date(user.lastSeen) : new Date()
            },
            avatarColor: getAvatarColor(user._id),
            unreadCount: 0,
            status: user.isOnline ? 'online' : 'offline',
            lastMessage: {
              content: 'Start a conversation...',
              createdAt: new Date()
            }
          };
        });

        setConversations(userConversations);

        const initialMessages: Record<string, Message[]> = {};
        userConversations.forEach(conv => {
          initialMessages[conv.id] = [];
        });
        setMessages(initialMessages);

      } catch (err: any) {
        setError(err.message || 'Failed to load users');
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Responsive handling
  useEffect(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile) setShowChat(true);
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setShowChat(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Click outside for attach menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  const { token: authToken, user: userInfo } = loadAuthFromStorage() || { token: null, user: null };

  // Socket setup
  useEffect(() => {
    if (!authToken) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: `Bearer ${authToken}` },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (selectedConversation?.id) {
        socket.emit('chat:join_conversation', { conversationId: selectedConversation.id });
      }
    });

    socket.on('disconnect', () => console.log('Socket disconnected'));

    socket.on('chat:message_created', ({ message }: any) => {
      if (message.conversation_id === selectedConversation?.id || message.conversationId === selectedConversation?.id) {
        const newMessage: Message = {
          id: message._id || Date.now().toString(),
          content: message.content || '',
          createdAt: new Date(message.createdAt || Date.now()),
          sender: message.sender || { _id: 'other' },
          read: false
        };
        if (selectedConversation?.id) {
          setMessages(prev => ({
            ...prev,
            [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage]
          }));
        }
      }
    });

    socket.on('typing:started', ({ conversationId, userId }: any) => {
      if (conversationId === selectedConversation?.id && userId !== userInfo?._id) setTyping(true);
    });

    socket.on('typing:stopped', ({ conversationId, userId }: any) => {
      if (conversationId === selectedConversation?.id && userId !== userInfo?._id) setTyping(false);
    });

    socket.on('error', (error: any) => console.error('Socket error:', error));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [authToken, selectedConversation?.id, userInfo]);

  // Typing indicator
  useEffect(() => {
    if (!socketRef.current || !selectedConversation?.id) return;

    if (inputText.trim() && !selfTyping) {
      setSelfTyping(true);
      socketRef.current.emit('typing:start', { conversationId: selectedConversation.id });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selfTyping) {
        socketRef.current.emit('typing:stop', { conversationId: selectedConversation.id });
        setSelfTyping(false);
      }
    }, 1000);

    return () => clearTimeout(typingTimeoutRef.current);
  }, [inputText, selectedConversation?.id, selfTyping]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    if (isMobile) setShowChat(true);
    setSelectedConversation(conversation);
    setTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isMobile]);

  const handleBackToContacts = useCallback(() => {
    if (isMobile) {
      setShowChat(false);
      setSelectedConversation(null);
    }
  }, [isMobile]);

  const handleSend = () => {
    if (!inputText.trim() || !selectedConversation) return;

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:send_message', {
        conversation_id: selectedConversation.id,
        content: inputText.trim(),
        attachments: [],
      });
      if (selfTyping) {
        socketRef.current.emit('typing:stop', { conversationId: selectedConversation.id });
        setSelfTyping(false);
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      createdAt: new Date(),
      sender: { _id: 'user' },
      read: false
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage]
    }));

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: { content: `You: ${inputText.trim()}`, createdAt: new Date() }, unreadCount: 0 }
        : conv
    ));

    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isMyMessage = (message: Message) => message.sender._id === 'user';
  const getStatusColor = (status: string) => status === 'online' ? 'bg-green-500' : status === 'away' ? 'bg-yellow-500' : 'bg-gray-400';
  const filteredConversations = conversations.filter(conv =>
    conv.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayMessages = selectedConversation ? messages[selectedConversation.id] || [] : [];

  return (
    <div className="h-screen bg-white flex relative overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Chat Layout */}
      <div className="flex flex-1 lg:ml-72 h-screen">
        {/* Conversations List */}
        <div className={`${isMobile ? (showChat ? 'hidden' : 'flex w-full') : 'flex w-80'} lg:flex flex-col bg-white border-r border-gray-200`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {isMobile && <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="w-5 h-5 text-gray-700" /></button>}
              <h1 className="text-xl font-semibold text-gray-800">Chats</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical className="w-5 h-5 text-gray-600" /></button>
          </div>

          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 text-sm text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                <p className="mt-4 text-sm text-gray-500">Loading users...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-12 h-12 mb-2 opacity-50">⚠️</div>
                <p className="text-sm text-red-500">{error}</p>
                <p className="text-xs text-gray-500 mt-2">Failed to load contacts</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600"
                >
                  Retry
                </button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Search className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
                <p className="text-xs mt-2">Try searching with a different term</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div 
                  key={conv.id} 
                  onClick={() => handleSelectConversation(conv)}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${selectedConversation?.id === conv.id ? 'bg-teal-50' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${conv.avatarColor} flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">{conv.user.full_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(conv.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{conv.user.full_name}</h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {conv.lastMessage ? formatDate(conv.lastMessage.createdAt) : 'New'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-600 truncate">{conv.lastMessage?.content}</p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-teal-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${isMobile ? (showChat ? 'flex w-full' : 'hidden') : 'flex'} lg:flex`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button onClick={handleBackToContacts} className="lg:hidden mr-1">
                      <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedConversation.avatarColor} flex items-center justify-center`}>
                      <span className="text-white font-semibold text-sm">
                        {selectedConversation.user.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(selectedConversation.status)} rounded-full border-2 border-white`}></div>
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm text-gray-900">{selectedConversation.user.full_name || 'Unknown'}</h2>
                    {typing ? (
                      <p className="text-xs text-teal-600 animate-pulse">typing...</p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {selectedConversation.status === 'online' ? 'Active now' : 
                         selectedConversation.status === 'away' ? 'Away' : 'Last seen recently'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 p-4">
                <div className="max-w-3xl mx-auto space-y-3">
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">Today</span>
                  </div>

                  {displayMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Send className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start the conversation with {selectedConversation.user.full_name}</p>
                    </div>
                  ) : (
                    displayMessages.map((msg) => {
                      const isMine = isMyMessage(msg);
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[70%]">
                            <div className={`rounded-2xl px-4 py-2.5 ${isMine ? 'bg-teal-500 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'}`}>
                              <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                              {isMine && (
                                <span>
                                  {msg.read ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                        <div className="flex gap-1">
                          {[0, 0.2, 0.4].map((delay) => (
                            <span key={delay} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: `${delay}s`}}></span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-3">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={attachMenuRef}>
                      <button 
                        onClick={() => setShowAttachMenu(!showAttachMenu)} 
                        className="p-2.5 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"
                      >
                        <Paperclip className="w-5 h-5 transform rotate-45" />
                      </button>
                      {showAttachMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-48 z-50">
                          <button 
                            onClick={() => setShowAttachMenu(false)} 
                            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Image className="w-4 h-4 text-blue-600" />
                            </div>
                            <span>Photos & Videos</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 relative">
                      <input 
                        ref={inputRef}
                        type="text" 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        onKeyDown={handleKeyPress} 
                        placeholder={`Message ${selectedConversation.user.full_name}`}
                        className="w-full pl-4 pr-12 py-2.5 bg-gray-100 text-sm text-gray-900 placeholder-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white" 
                      />
                    </div>
                    
                    <button 
                      onClick={handleSend} 
                      disabled={!inputText.trim()} 
                      className={`p-2.5 rounded-full transition-all duration-200 ${inputText.trim() ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
              <div className="text-center px-4">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center shadow-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                    <Send className="w-8 h-8 text-white transform -rotate-45" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a contact</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md">
                  {loading ? 'Loading contacts...' : 
                   error ? 'Failed to load contacts' : 
                   conversations.length === 0 ? 'No contacts available' : 
                   'Choose a contact from the list to start messaging'}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  {['online', 'offline', 'away'].map((status) => (
                    <div key={status} className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${getStatusColor(status)} rounded-full`}></div>
                      <span className="capitalize">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
