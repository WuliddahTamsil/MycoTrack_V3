import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, MessageCircle, Loader2, Users, Badge, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../ui/avatar';

const API_BASE_URL = 'http://localhost:3000/api';

interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'admin';
  message: string;
  timestamp: string;
  read: boolean;
  customerName?: string;
  adminName?: string;
}

interface Conversation {
  conversationId: string;
  customerId: string;
  customerName: string;
  adminId: string | null;
  adminName: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  createdAt: string;
}

export const AdminCustomerService: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Polling for new conversations and messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.conversationId);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/chats`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data.conversations || []);
      setIsLoading(false);

      // Auto-select first conversation if none selected
      if (!selectedConversation && data.conversations && data.conversations.length > 0) {
        setSelectedConversation(data.conversations[0]);
        fetchMessages(data.conversations[0].conversationId);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chats/${conversationId}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Mark messages as read
      if (data.messages && data.messages.length > 0) {
        markAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await fetch(`${API_BASE_URL}/chats/${conversationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, userRole: 'admin' })
      });
      // Refresh conversations to update unread count
      fetchConversations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversationId);
    markAsRead(conversation.conversationId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedConversation) {
      toast.error('Pilih percakapan terlebih dahulu');
      return;
    }
    if (!user?.id || !user?.name) {
      toast.error('Anda harus login sebagai admin');
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch(`${API_BASE_URL}/chats/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.conversationId,
          customerId: selectedConversation.customerId,
          customerName: selectedConversation.customerName,
          adminId: user.id,
          adminName: user.name,
          sender: 'admin',
          message: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      
      // Refresh conversations and messages
      setTimeout(() => {
        fetchConversations();
        fetchMessages(selectedConversation.conversationId);
      }, 500);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Gagal mengirim pesan. Pastikan backend berjalan.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ color: 'var(--secondary-dark-red)' }}>Customer Service</h2>
        <p style={{ color: 'var(--neutral-gray)' }}>
          Kelola percakapan dan bantu customer dengan pertanyaan mereka
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col shadow-lg border-2 border-[#FF7A00]/20">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="px-5 py-4 border-b-2 border-[#FF7A00]/20 bg-gradient-to-r from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E8A600] flex items-center justify-center text-white shadow-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg text-[#2D2416]">Percakapan</h3>
                </div>
                {totalUnread > 0 && (
                  <Badge className="bg-[#FF7A00] text-white font-bold px-3 py-1 shadow-md">
                    {totalUnread}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FF7A00] mx-auto mb-3" />
                    <p className="text-gray-500 text-sm font-medium">Memuat percakapan...</p>
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF7A00]/20 to-[#E8A600]/20 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-[#FF7A00]" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Belum ada percakapan</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conv) => (
                    <button
                      key={conv.conversationId}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-4 hover:bg-white transition-all ${
                        selectedConversation?.conversationId === conv.conversationId
                          ? 'bg-white border-l-4 border-[#FF7A00] shadow-sm'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#E8A600] text-white font-bold text-lg">
                            {conv.customerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-[#2D2416] truncate text-sm">
                              {conv.customerName}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-[#FF7A00] text-white text-xs px-2 py-0.5 font-bold">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate font-medium mb-1">
                            {conv.lastMessage}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">
                            {new Date(conv.lastMessageTime).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col shadow-lg border-2 border-[#FF7A00]/20">
          <CardContent className="flex-1 flex flex-col p-0">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b-2 border-[#FF7A00]/20 bg-gradient-to-r from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-[#FF7A00] to-[#E8A600] text-white font-bold text-lg">
                        {selectedConversation.customerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#2D2416]">
                        {selectedConversation.customerName}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">Customer</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((msg, index) => {
                    const isAdmin = msg.sender === 'admin';
                    const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
                    const showTime = index === messages.length - 1 || 
                      new Date(msg.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000; // 5 minutes
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        {showAvatar ? (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback
                              className={
                                isAdmin
                                  ? 'bg-gradient-to-br from-[#FF7A00] to-[#E8A600] text-white font-bold text-xs'
                                  : 'bg-gray-300 text-gray-700 font-bold text-xs'
                              }
                            >
                              {isAdmin ? (user?.name?.charAt(0).toUpperCase() || 'A') : (msg.customerName?.charAt(0).toUpperCase() || 'C')}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8"></div>
                        )}

                        {/* Message Bubble */}
                        <div className={`flex flex-col max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                          {!isAdmin && showAvatar && (
                            <div className="text-xs font-semibold text-gray-600 mb-1 px-1">
                              {msg.customerName || 'Customer'}
                            </div>
                          )}
                          <div
                            className={`rounded-lg px-3 py-2 ${
                              isAdmin
                                ? 'bg-[#FF7A00] text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                              isAdmin ? 'text-white' : 'text-gray-800'
                            }`}>
                              {msg.message}
                            </p>
                          </div>
                          {showTime && (
                            <p className={`text-xs mt-1 px-1 ${
                              isAdmin ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-6 py-4 border-t-2 border-[#FF7A00]/20 bg-white">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ketik balasan Anda di sini..."
                        className="w-full border-2 border-gray-200 focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 rounded-xl px-4 py-3 font-medium"
                        disabled={isSending}
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || isSending}
                      className="gradient-autumn-cta text-white hover-lift autumn-glow shadow-lg px-6 py-3 rounded-xl font-bold h-auto"
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Kirim
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Tekan <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Enter</kbd> untuk mengirim pesan
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF7A00]/20 to-[#E8A600]/20 flex items-center justify-center mb-6">
                  <MessageCircle className="h-12 w-12 text-[#FF7A00]" />
                </div>
                <h3 className="text-xl font-bold text-[#2D2416] mb-2">Pilih Percakapan</h3>
                <p className="text-gray-500 max-w-md">
                  Pilih percakapan dari daftar di sebelah kiri untuk mulai membalas pesan customer
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
