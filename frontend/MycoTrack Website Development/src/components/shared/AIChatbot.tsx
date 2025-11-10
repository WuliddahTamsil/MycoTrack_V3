import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  time: string;
  suggestions?: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    sender: 'ai',
    content: 'Halo! Saya MycoBot, asisten AI untuk budidaya jamur kuping. Saya siap membantu Anda dengan berbagai pertanyaan seputar budidaya jamur. Ada yang bisa saya bantu?',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Bagaimana cara menjaga kelembaban optimal?',
      'Apa penyebab jamur tidak tumbuh?',
      'Tips meningkatkan hasil panen',
      'Cara mengatasi hama dan penyakit'
    ]
  }
];

// Mock AI responses based on keywords
const getAIResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('kelembaban') || msg.includes('humidity')) {
    return 'Kelembaban optimal untuk budidaya jamur kuping adalah 80-90%. Beberapa tips menjaga kelembaban:\n\n1. Semprot air 2-3 kali sehari\n2. Gunakan humidifier jika perlu\n3. Tutup ventilasi saat kelembaban rendah\n4. Gunakan sensor IoT untuk monitoring real-time\n5. Pasang tirai plastik di pintu untuk mengurangi penguapan\n\nDengan MycoTrack, Anda bisa monitor kelembaban secara real-time dan mendapat notifikasi otomatis!';
  }
  
  if (msg.includes('suhu') || msg.includes('temperature')) {
    return 'Suhu ideal untuk pertumbuhan jamur kuping adalah 25-28°C. Tips pengaturan suhu:\n\n1. Hindari sinar matahari langsung\n2. Gunakan exhaust fan untuk sirkulasi udara\n3. Pasang thermometer digital\n4. Siram lantai jika terlalu panas\n5. Gunakan heater jika terlalu dingin\n\nSensor suhu MycoTrack akan memberi peringatan otomatis jika suhu tidak optimal!';
  }
  
  if (msg.includes('panen') || msg.includes('harvest')) {
    return 'Tips meningkatkan hasil panen jamur kuping:\n\n1. Jaga kelembaban 80-90% dan suhu 25-28°C\n2. Beri pencahayaan tidak langsung 8-10 jam/hari\n3. Semprot air secara teratur\n4. Panen saat diameter 8-10 cm\n5. Gunakan baglog berkualitas\n6. Sterilisasi ruangan secara berkala\n\nDengan monitoring IoT yang tepat, hasil panen bisa meningkat 30-40%!';
  }
  
  if (msg.includes('hama') || msg.includes('penyakit') || msg.includes('pest')) {
    return 'Penanganan hama dan penyakit jamur:\n\n1. **Pencegahan:**\n   - Sterilisasi ruang budidaya\n   - Jaga kebersihan alat\n   - Kontrol kelembaban dan suhu\n\n2. **Hama Umum:**\n   - Lalat: Pasang perangkap dan screen\n   - Tungau: Semprot air bersih\n   - Bekicot: Bersihkan manual\n\n3. **Penyakit:**\n   - Jamur kompetitor: Buang baglog terinfeksi\n   - Bakteri: Tingkatkan sirkulasi udara\n\nMonitoring rutin dengan MycoTrack membantu deteksi dini!';
  }
  
  if (msg.includes('tidak tumbuh') || msg.includes('gagal')) {
    return 'Penyebab jamur tidak tumbuh optimal:\n\n1. **Kelembaban terlalu rendah** (<80%)\n2. **Suhu tidak sesuai** (di luar 25-28°C)\n3. **Baglog berkualitas rendah**\n4. **Kurang pencahayaan**\n5. **Kontaminasi bakteri/jamur lain**\n6. **Ventilasi buruk**\n\nSolusi:\n- Cek dan sesuaikan kondisi lingkungan\n- Gunakan baglog dari supplier terpercaya\n- Tingkatkan kebersihan\n- Monitor dengan sensor IoT untuk data akurat';
  }
  
  if (msg.includes('baglog')) {
    return 'Tips memilih dan merawat baglog:\n\n1. **Pilih baglog berkualitas:**\n   - Miselium putih merata\n   - Tidak ada bau busuk\n   - Tekstur padat\n\n2. **Perawatan:**\n   - Buka plastik dengan hati-hati\n   - Semprot 2-3x sehari\n   - Jaga kelembaban 80-90%\n   - Suhu ideal 25-28°C\n\n3. **Masa produktif:** 2-3 bulan\n4. **Panen pertama:** 10-14 hari setelah pembukaan\n\nGunakan fitur galeri MycoTrack untuk dokumentasi pertumbuhan!';
  }
  
  if (msg.includes('mycotrack') || msg.includes('fitur')) {
    return 'Fitur-fitur MycoTrack yang membantu budidaya Anda:\n\n1. **Monitoring IoT Real-time:**\n   - Sensor suhu & kelembaban\n   - Grafik historis\n   - Notifikasi otomatis\n\n2. **Computer Vision:**\n   - Deteksi kualitas jamur\n   - Estimasi hasil panen\n\n3. **Marketplace Terintegrasi:**\n   - Jual langsung ke customer\n   - Manajemen pesanan\n   - Sistem pembayaran\n\n4. **Forum & AI Assistant:**\n   - Diskusi dengan petani lain\n   - Bantuan AI 24/7\n\nSemua dalam satu platform!';
  }
  
  // Default response
  return 'Terima kasih atas pertanyaannya! Saya bisa membantu Anda dengan:\n\n• Cara menjaga kelembaban dan suhu optimal\n• Tips meningkatkan hasil panen\n• Mengatasi hama dan penyakit\n• Pemilihan dan perawatan baglog\n• Troubleshooting masalah budidaya\n• Penggunaan fitur MycoTrack\n\nSilakan tanyakan lebih detail tentang topik yang ingin Anda ketahui!';
};

export const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: messageToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: getAIResponse(messageToSend),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="space-y-6">
      <Card className="h-[calc(100vh-12rem)]">
        <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-gold)] text-white">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                MycoBot AI Assistant
                <Badge className="bg-[var(--primary-orange)] text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              </CardTitle>
              <p className="text-sm opacity-60 mt-1">Asisten pintar untuk budidaya jamur Anda</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-[calc(100%-120px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback
                      className={
                        message.sender === 'ai'
                          ? 'bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-gold)] text-white'
                          : 'bg-gray-200'
                      }
                    >
                      {message.sender === 'ai' ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        'U'
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`flex flex-col max-w-[80%] ${
                      message.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-[var(--primary-orange)] text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                    <span className="text-xs opacity-50 mt-1">{message.time}</span>
                  </div>
                </div>

                {/* Suggestions */}
                {message.suggestions && (
                  <div className="mt-3 ml-11 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs hover:bg-orange-50 hover:border-orange-200"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-[var(--primary-orange)] to-[var(--primary-gold)] text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm ml-2">MycoBot sedang mengetik...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex gap-2">
              <Input
                placeholder="Ketik pertanyaan Anda..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-white"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs opacity-50 mt-2 text-center">
              MycoBot menggunakan AI untuk memberikan saran budidaya jamur
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
