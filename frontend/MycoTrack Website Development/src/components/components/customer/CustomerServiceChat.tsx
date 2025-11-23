import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send, MessageCircle, Loader2, User } from 'lucide-react';
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
  adminName?: string;
}

export const CustomerServiceChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or create conversation
  useEffect(() => {
    if (user?.id) {
      fetchConversation();
    }
  }, [user?.id]);

  // Polling for new messages
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      fetchMessages();
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/customer/chats?customerId=${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      
      const data = await response.json();
      
      if (data.conversations && data.conversations.length > 0) {
        // Use existing conversation
        const conv = data.conversations[0];
        setConversationId(conv.conversationId);
        fetchMessages(conv.conversationId);
      } else {
        // Create new conversation when first message is sent
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId?: string) => {
    if (!convId && !conversationId) return;
    
    try {
      const conv = convId || conversationId;
      const response = await fetch(`${API_BASE_URL}/chats/${conv}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // Mark messages as read
      if (data.messages && data.messages.length > 0) {
        markAsRead(conv!);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (convId: string) => {
    try {
      await fetch(`${API_BASE_URL}/chats/${convId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, userRole: 'customer' })
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!user?.id || !user?.name) {
      toast.error('Anda harus login untuk mengirim pesan');
      return;
    }

    try {
      setIsSending(true);
      
      // Create conversation if doesn't exist
      let convId = conversationId;
      if (!convId) {
        convId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setConversationId(convId);
      }

      const response = await fetch(`${API_BASE_URL}/chats/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          customerId: user.id,
          customerName: user.name,
          sender: 'customer',
          message: newMessage.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
      setNewMessage('');
      
      // Fetch updated messages
      setTimeout(() => fetchMessages(convId!), 500);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ color: 'var(--secondary-dark-red)' }}>Customer Service</h2>
        <p style={{ color: 'var(--neutral-gray)' }}>
          Hubungi tim customer service untuk bantuan pembelian produk
        </p>
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col shadow-lg border-2 border-[#FF7A00]/20">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b-2 border-[#FF7A00]/20 bg-gradient-to-r from-[#FF7A00]/10 via-[#FF7A00]/5 to-transparent">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E8A600] flex items-center justify-center text-white shadow-lg">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#2D2416]">Customer Service MycoTrack</h3>
                <p className="text-sm text-gray-600 font-medium">Tim kami siap membantu Anda 24/7</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-gray-50 to-white">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-[#FF7A00] mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Memuat percakapan...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF7A00]/20 to-[#E8A600]/20 flex items-center justify-center mb-4">
                  <MessageCircle className="h-10 w-10 text-[#FF7A00]" />
                </div>
                <h3 className="text-lg font-bold text-[#2D2416] mb-2">Mulai Percakapan</h3>
                <p className="text-gray-500 max-w-md">
                  Kirim pesan kepada customer service untuk mendapatkan bantuan dengan produk atau pertanyaan Anda.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isCustomer = msg.sender === 'customer';
                const showAvatar = index === 0 || messages[index - 1].sender !== msg.sender;
                const showTime = index === messages.length - 1 || 
                  new Date(msg.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000; // 5 minutes
                
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          className={
                            isCustomer
                              ? 'bg-gradient-to-br from-[#FF7A00] to-[#E8A600] text-white font-bold text-xs'
                              : 'bg-gray-300 text-gray-700 font-bold text-xs'
                          }
                        >
                          {isCustomer ? (user?.name?.charAt(0).toUpperCase() || 'C') : 'CS'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8"></div>
                    )}

                    {/* Message Bubble */}
                    <div className={`flex flex-col max-w-[70%] ${isCustomer ? 'items-end' : 'items-start'}`}>
                      {!isCustomer && showAvatar && (
                        <div className="text-xs font-semibold text-gray-600 mb-1 px-1">
                          {msg.adminName || 'Customer Service'}
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isCustomer
                            ? 'bg-[#FF7A00] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                          isCustomer ? 'text-white' : 'text-gray-800'
                        }`}>
                          {msg.message}
                        </p>
                      </div>
                      {showTime && (
                        <p className={`text-xs mt-1 px-1 ${
                          isCustomer ? 'text-gray-500' : 'text-gray-400'
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
              })
            )}
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
                  placeholder="Ketik pesan Anda di sini..."
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
        </CardContent>
      </Card>
    </div>
  );
};
