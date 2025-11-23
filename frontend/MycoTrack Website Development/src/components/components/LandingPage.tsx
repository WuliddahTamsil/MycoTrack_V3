import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shell, TrendingUp, Zap, ChevronDown, Mail, Phone, MapPin, Instagram, MessageCircle, Sparkles, Activity, CheckCircle2, X, ChevronLeft, ChevronRight, HelpCircle, Wifi, Brain, CreditCard, DollarSign, Shield, Smartphone, BarChart3, Users, Clock, Settings, Globe, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Input } from './ui/input';
import { mockArticles, Article } from './mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number | null>(null);
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(new Set());
  const [faqPage, setFaqPage] = useState(0);
  
  const toggleFaq = (faqId: string) => {
    setOpenFaqs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };
  
  const faqsPerPage = 4;
  const totalFaqs = 12;
  const totalPages = Math.ceil(totalFaqs / faqsPerPage);
  
  const handleNextFaq = () => {
    setFaqPage((prev) => (prev + 1) % totalPages);
  };
  
  const handlePrevFaq = () => {
    setFaqPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleArticleClick = (index: number) => {
    setSelectedArticleIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const handleCloseModal = () => {
    setSelectedArticleIndex(null);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };

  const handleNextArticle = () => {
    if (selectedArticleIndex !== null) {
      const nextIndex = (selectedArticleIndex + 1) % mockArticles.length;
      setSelectedArticleIndex(nextIndex);
    }
  };

  const handlePrevArticle = () => {
    if (selectedArticleIndex !== null) {
      const prevIndex = (selectedArticleIndex - 1 + mockArticles.length) % mockArticles.length;
      setSelectedArticleIndex(prevIndex);
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    
    if (categoryLower.includes('tutorial') || categoryLower.includes('panduan') || categoryLower.includes('guide')) {
      return {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FCD34D'
      };
    }
    if (categoryLower.includes('teknologi') || categoryLower.includes('technology') || categoryLower.includes('iot')) {
      return {
        bg: '#DBEAFE',
        text: '#1E40AF',
        border: '#60A5FA'
      };
    }
    if (categoryLower.includes('pemasaran') || categoryLower.includes('marketing') || categoryLower.includes('bisnis')) {
      return {
        bg: '#FCE7F3',
        text: '#9F1239',
        border: '#F472B6'
      };
    }
    if (categoryLower.includes('hama') || categoryLower.includes('penyakit') || categoryLower.includes('masalah')) {
      return {
        bg: '#FEE2E2',
        text: '#991B1B',
        border: '#F87171'
      };
    }
    if (categoryLower.includes('suhu') || categoryLower.includes('kelembaban') || categoryLower.includes('lingkungan')) {
      return {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#34D399'
      };
    }
    
    return {
      bg: '#FED7AA',
      text: '#9A3412',
      border: '#FB923C'
    };
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#FF7A00]/10 autumn-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-autumn-hero flex items-center justify-center autumn-shadow">
                <Shell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gradient-autumn">MycoTrack</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button onClick={() => scrollToSection('hero')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                Beranda
              </button>
              <button onClick={() => scrollToSection('about')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                Tentang
              </button>
              <button onClick={() => scrollToSection('features')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                Fitur
              </button>
              <button onClick={() => scrollToSection('workflow')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                Cara Kerja
              </button>
              <button onClick={() => scrollToSection('articles')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                Artikel
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                FAQ
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm text-[#5A4A32] hover:text-[#B82601] transition-colors font-medium">
                Kontak
              </button>
            </nav>
            
            <Button 
              onClick={() => navigate('/login')}
              className="gradient-autumn-cta text-white hover-glow transition-all font-semibold shadow-lg"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Masuk
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Vibrant Autumn Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-[#FFE4CC] to-[#FFF4D4]"></div>
          <div className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF7A00]/20 to-[#E8A600]/20 blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#B82601]/15 to-[#FF7A00]/15 blur-3xl animate-float"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm autumn-shadow mb-6">
                <div className="w-2 h-2 rounded-full gradient-autumn-cta animate-pulse"></div>
                <span className="text-sm text-[#B82601] font-semibold">Platform Monitoring Jamur Berbasis IoT & AI</span>
              </div>
              
              <h1 className="mb-6 text-5xl md:text-7xl text-gradient-autumn font-bold">
                MycoTrack
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-[#FF7A00] max-w-3xl font-bold">
                Budidaya Jamur Kuping Lebih Cerdas dengan Teknologi Modern
              </p>
              <p className="text-lg mb-10 text-[#5A4A32] max-w-2xl leading-relaxed font-medium">
                Monitoring real-time, analisis AI, dan marketplace terintegrasi untuk meningkatkan produktivitas budidaya jamur Anda hingga 300%
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => scrollToSection('workflow')}
                  size="lg"
                  className="gradient-autumn-hero text-white hover-lift autumn-glow px-8 py-6 text-lg font-bold shadow-2xl"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => scrollToSection('about')}
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#FF7A00] text-[#B82601] hover:bg-[#FF7A00]/10 px-8 py-6 text-lg font-bold hover-lift shadow-lg"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-16 grid grid-cols-3 gap-6">
                <div className="autumn-card rounded-2xl p-4 autumn-card-hover">
                  <div className="text-3xl font-bold text-gradient-fire mb-1">10K+</div>
                  <div className="text-sm text-[#5A4A32] font-medium">Petani Aktif</div>
                </div>
                <div className="autumn-card rounded-2xl p-4 autumn-card-hover">
                  <div className="text-3xl font-bold text-gradient-fire mb-1">95%</div>
                  <div className="text-sm text-[#5A4A32] font-medium">Tingkat Kepuasan</div>
                </div>
                <div className="autumn-card rounded-2xl p-4 autumn-card-hover">
                  <div className="text-3xl font-bold text-gradient-fire mb-1">24/7</div>
                  <div className="text-sm text-[#5A4A32] font-medium">Support & Monitoring</div>
                </div>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="animate-slide-up lg:block hidden" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute -inset-6 gradient-autumn-hero opacity-20 rounded-[3rem] blur-3xl animate-pulse-soft"></div>
                <div className="relative rounded-[2.5rem] overflow-hidden autumn-shadow-lg border-8 border-white/50">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1665632930732-1a4708dbea82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kJTIwZWFyJTIwbXVzaHJvb20lMjBmcmVzaHxlbnwxfHx8fDE3NjIzMzkyNzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Jamur Kuping Segar - MycoTrack" 
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#B82601]/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => scrollToSection('about')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[#FF7A00] animate-bounce"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="relative">
                <div className="absolute -inset-4 gradient-autumn-hero opacity-20 rounded-3xl blur-2xl animate-pulse-soft"></div>
                <div className="relative rounded-3xl overflow-hidden autumn-shadow-lg">
                  <ImageWithFallback 
                    src="https://images.unsplash.com/photo-1735282260417-cb781d757604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNocm9vbSUyMGZhcm1pbmclMjBjdWx0aXZhdGlvbnxlbnwxfHx8fDE3NjIzMzkyODJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Budidaya Jamur Kuping" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white autumn-shadow mb-6">
                <Activity className="h-4 w-4 text-[#E8A600]" />
                <span className="text-sm text-[#B82601] font-semibold">Tentang Platform</span>
              </div>
              <h2 className="mb-6 text-4xl text-[#B82601] font-bold">Ekosistem Terpadu untuk Budidaya Modern</h2>
              <p className="mb-4 text-[#5A4A32] text-lg leading-relaxed font-medium">
                MycoTrack adalah platform ekosistem yang menggabungkan teknologi IoT dan AI untuk membantu petani jamur kuping meningkatkan produktivitas dan kualitas panen.
              </p>
              <p className="mb-6 text-[#5A4A32] text-lg leading-relaxed font-medium">
                Kami menyediakan sistem monitoring real-time, analisis data berbasis AI, computer vision untuk quality control, dan marketplace yang menghubungkan petani langsung dengan pembeli.
              </p>

              <div className="space-y-3">
                {[
                  'Monitoring IoT Real-Time 24/7',
                  'Analisis & Prediksi Berbasis AI',
                  'Computer Vision untuk Quality Control',
                  'Marketplace Terintegrasi'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg gradient-autumn-cta flex items-center justify-center flex-shrink-0 autumn-shadow">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-[#2D2416] font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative gradient-autumn-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white autumn-shadow mb-6">
              <Sparkles className="h-4 w-4 text-[#E8A600]" />
              <span className="text-sm text-[#B82601] font-semibold">Keunggulan Platform</span>
            </div>
            <h2 className="text-4xl mb-4 text-[#B82601] font-bold">Kenapa Memilih MycoTrack?</h2>
            <p className="text-lg text-[#5A4A32] max-w-2xl mx-auto font-medium">
              Solusi lengkap untuk budidaya jamur yang lebih efisien dan menguntungkan
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden animate-slide-up">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl gradient-red-fire flex items-center justify-center mb-4 autumn-glow">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-[#B82601] font-bold">IoT Monitoring Real-Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#5A4A32] leading-relaxed font-medium">Pantau suhu, kelembaban, dan kondisi budidaya secara real-time dengan sensor IoT canggih dan dashboard interaktif yang mudah dipahami</p>
              </CardContent>
            </Card>
            
            <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl gradient-orange-warm flex items-center justify-center mb-4 autumn-glow">
                  <Activity className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-[#B82601] font-bold">AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#5A4A32] leading-relaxed font-medium">Dapatkan rekomendasi dan prediksi berbasis AI untuk mengoptimalkan hasil panen dengan machine learning dan computer vision</p>
              </CardContent>
            </Card>
            
            <Card className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl gradient-yellow-gold flex items-center justify-center mb-4 autumn-glow">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl text-[#B82601] font-bold">Integrated Marketplace</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#5A4A32] leading-relaxed font-medium">Jual produk Anda langsung ke pembeli melalui marketplace terintegrasi dengan sistem pembayaran yang aman dan terpercaya</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white autumn-shadow mb-6">
              <Activity className="h-4 w-4 text-[#9A7400]" />
              <span className="text-sm text-[#B82601] font-semibold">Cara Kerja</span>
            </div>
            <h2 className="text-4xl mb-4 text-[#B82601] font-bold">Alur Kerja MycoTrack</h2>
            <p className="text-lg text-[#5A4A32] max-w-2xl mx-auto font-medium">
              Tiga langkah sederhana untuk budidaya yang lebih optimal
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-2 gradient-autumn-hero transform -translate-y-1/2 hidden md:block opacity-20 rounded-full"></div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="text-center animate-slide-up">
                <div className="w-24 h-24 rounded-3xl gradient-red-fire text-white flex items-center justify-center mx-auto mb-6 text-3xl font-bold relative z-10 autumn-glow-strong">
                  1
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#B82601]">Monitoring</h3>
                <p className="text-[#5A4A32] leading-relaxed font-medium">Sensor IoT mengumpulkan data suhu, kelembaban, dan kondisi lingkungan secara otomatis 24/7 tanpa henti</p>
              </div>
              
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-24 h-24 rounded-3xl gradient-orange-warm text-white flex items-center justify-center mx-auto mb-6 text-3xl font-bold relative z-10 autumn-glow-strong">
                  2
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#FF7A00]">Analisis</h3>
                <p className="text-[#5A4A32] leading-relaxed font-medium">AI menganalisis data dan memberikan rekomendasi untuk optimasi budidaya dan prediksi hasil panen yang akurat</p>
              </div>
              
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-24 h-24 rounded-3xl gradient-yellow-gold text-white flex items-center justify-center mx-auto mb-6 text-3xl font-bold relative z-10 autumn-glow-strong">
                  3
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#E8A600]">Visualisasi</h3>
                <p className="text-[#5A4A32] leading-relaxed font-medium">Dashboard interaktif menampilkan data dan insights dalam format yang mudah dipahami dan actionable</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-24 relative bg-gradient-to-b from-[#FFF4D4]/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white autumn-shadow mb-6">
              <Shell className="h-4 w-4 text-[#9A7400]" />
              <span className="text-sm text-[#B82601] font-semibold">Blog & Artikel</span>
            </div>
            <h2 className="text-4xl mb-4 text-[#B82601] font-bold">Wawasan & Tips Budidaya</h2>
            <p className="text-lg text-[#5A4A32] max-w-2xl mx-auto font-medium">
              Pelajari teknik dan strategi terbaik dari para ahli
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {mockArticles.map((article, idx) => (
              <Card 
                key={article.id} 
                className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden animate-slide-up cursor-pointer" 
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => handleArticleClick(idx)}
              >
                <div className="relative overflow-hidden group">
                  <ImageWithFallback 
                    src={article.image}
                    alt={article.title} 
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 gradient-autumn-hero opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
                <CardHeader>
                  <div className="inline-block px-3 py-1 rounded-full text-xs mb-3 gradient-autumn-cta text-white font-semibold">
                    {article.category}
                  </div>
                  <CardTitle className="line-clamp-2 text-lg text-[#B82601] font-bold">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 mb-4 text-[#5A4A32] font-medium">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-[#FF7A00]">
                    <span className="font-semibold">{article.author}</span>
                    <span className="font-medium">{new Date(article.date).toLocaleDateString('id-ID')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-2 border-[#FF7A00] text-[#B82601] hover:bg-[#FF7A00]/10 hover-lift px-8 font-bold shadow-lg"
            >
              Lihat Semua Artikel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section - Beautiful Aesthetic Design */}
      <section id="faq" className="py-24 relative bg-gradient-to-b from-[#FFF8F0] via-[#FFF4D4]/30 to-[#FFF8F0]">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-[#FF7A00]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-[#E8A600]/5 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm autumn-shadow mb-8 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E8A600] flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-[#B82601]">Pertanyaan Umum</span>
            </div>
            <div className="flex items-center justify-center gap-4 mb-6 animate-slide-up">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#FF7A00] to-[#E8A600] flex items-center justify-center shadow-lg">
                <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h2 className="text-5xl md:text-6xl text-[#B82601] font-bold">
                Pertanyaan yang Sering Diajukan
              </h2>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#E8A600] to-[#9A7400] flex items-center justify-center shadow-lg">
                <HelpCircle className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <p className="text-xl text-[#5A4A32] font-medium max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Temukan jawaban untuk pertanyaan umum tentang MycoTrack
            </p>
          </div>
          
          {/* FAQ Grid - Beautiful Layout */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                id: 'faq-1',
                icon: Shell,
                iconBg: 'from-[#B82601] to-[#FF7A00]',
                question: 'Apa itu MycoTrack?',
                answer: 'MycoTrack adalah platform ekosistem yang menggabungkan IoT dan AI untuk membantu petani jamur kuping meningkatkan produktivitas dan kualitas panen melalui monitoring real-time dan marketplace terintegrasi.'
              },
              {
                id: 'faq-2',
                icon: Wifi,
                iconBg: 'from-[#FF7A00] to-[#E8A600]',
                question: 'Bagaimana cara kerja sistem monitoring IoT?',
                answer: 'Sensor IoT kami dipasang di ruang budidaya untuk mengumpulkan data suhu, kelembaban, dan kondisi lingkungan secara real-time 24/7. Data tersebut dikirim ke cloud dan ditampilkan di dashboard Anda untuk analisis dan pengambilan keputusan.'
              },
              {
                id: 'faq-3',
                icon: Brain,
                iconBg: 'from-[#E8A600] to-[#9A7400]',
                question: 'Apa keunggulan AI di MycoTrack?',
                answer: 'AI kami menganalisis data historis dan kondisi real-time untuk memberikan rekomendasi optimasi budidaya, prediksi hasil panen, deteksi anomali, dan quality control menggunakan computer vision dengan akurasi tinggi.'
              },
              {
                id: 'faq-4',
                icon: CreditCard,
                iconBg: 'from-[#9A7400] to-[#B82601]',
                question: 'Bagaimana sistem pembayaran di marketplace?',
                answer: 'MycoTrack menyediakan sistem pembayaran terintegrasi yang aman. Petani dapat menerima pembayaran langsung ke saldo akun mereka dan melakukan penarikan ke rekening bank kapan saja dengan proses yang cepat dan mudah.'
              },
              {
                id: 'faq-5',
                icon: DollarSign,
                iconBg: 'from-[#B82601] to-[#FF7A00]',
                question: 'Berapa biaya menggunakan MycoTrack?',
                answer: 'Kami menawarkan berbagai paket berlangganan mulai dari paket gratis dengan fitur dasar hingga paket premium dengan semua fitur IoT dan AI. Hubungi tim sales kami untuk informasi lebih detail dan penawaran khusus.'
              },
              {
                id: 'faq-6',
                icon: Shield,
                iconBg: 'from-[#FF7A00] to-[#E8A600]',
                question: 'Apakah data saya aman di MycoTrack?',
                answer: 'Ya, keamanan data adalah prioritas utama kami. Kami menggunakan enkripsi end-to-end, backup otomatis, dan protokol keamanan tingkat enterprise untuk melindungi semua data pengguna dan informasi budidaya Anda.'
              },
              {
                id: 'faq-7',
                icon: Smartphone,
                iconBg: 'from-[#E8A600] to-[#9A7400]',
                question: 'Apakah bisa diakses melalui mobile?',
                answer: 'Tentu saja! MycoTrack tersedia dalam bentuk aplikasi mobile untuk iOS dan Android, serta versi web yang responsif. Anda dapat memantau budidaya, menerima notifikasi, dan mengelola marketplace kapan saja dan di mana saja.'
              },
              {
                id: 'faq-8',
                icon: BarChart3,
                iconBg: 'from-[#9A7400] to-[#B82601]',
                question: 'Bagaimana cara melihat laporan dan analisis?',
                answer: 'Dashboard MycoTrack menyediakan berbagai laporan dan analisis visual yang mudah dipahami. Anda dapat melihat grafik pertumbuhan, prediksi panen, analisis keuangan, dan rekomendasi optimasi dalam format yang interaktif dan informatif.'
              },
              {
                id: 'faq-9',
                icon: Users,
                iconBg: 'from-[#B82601] to-[#FF7A00]',
                question: 'Apakah ada dukungan pelanggan?',
                answer: 'Ya, tim support kami tersedia 24/7 melalui chat, email, dan telepon. Kami juga menyediakan dokumentasi lengkap, video tutorial, dan komunitas petani untuk berbagi pengalaman dan tips budidaya.'
              },
              {
                id: 'faq-10',
                icon: Clock,
                iconBg: 'from-[#FF7A00] to-[#E8A600]',
                question: 'Berapa lama waktu setup sistem?',
                answer: 'Setup sistem MycoTrack sangat cepat dan mudah. Setelah registrasi, tim kami akan membantu instalasi sensor IoT dalam 1-2 hari kerja. Dashboard dan aplikasi mobile dapat langsung digunakan setelah akun aktif.'
              },
              {
                id: 'faq-11',
                icon: Settings,
                iconBg: 'from-[#E8A600] to-[#9A7400]',
                question: 'Apakah sistem bisa dikustomisasi?',
                answer: 'Ya, MycoTrack sangat fleksibel dan dapat dikustomisasi sesuai kebutuhan budidaya Anda. Anda dapat mengatur parameter monitoring, notifikasi, laporan, dan integrasi dengan perangkat lain sesuai preferensi.'
              },
              {
                id: 'faq-12',
                icon: Globe,
                iconBg: 'from-[#9A7400] to-[#B82601]',
                question: 'Apakah MycoTrack tersedia di seluruh Indonesia?',
                answer: 'Saat ini MycoTrack sudah tersedia di pulau Jawa, Sumatera, dan Bali. Kami terus memperluas jangkauan ke seluruh Indonesia. Hubungi kami untuk informasi ketersediaan di daerah Anda.'
              }
            ]
            .slice(faqPage * faqsPerPage, (faqPage + 1) * faqsPerPage)
            .map((faq, idx) => {
              const isOpen = openFaqs.has(faq.id);
              const IconComponent = faq.icon;
              
              return (
                <Card 
                  key={faq.id}
                  className="group relative autumn-card border-2 border-[#FF7A00]/20 rounded-2xl overflow-hidden autumn-card-hover bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Orange Accent Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${faq.iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  
                  <CardHeader 
                    className="cursor-pointer px-6 py-5 pb-4 hover:bg-gradient-to-r hover:from-[#FFF4D4]/40 hover:to-transparent transition-all duration-300 relative z-10"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon with Orange Color */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFF4D4] to-[#FFE4CC] flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative border-2 border-[#FF7A00]/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/10 to-[#E8A600]/10 rounded-2xl blur-sm"></div>
                        <IconComponent className="h-8 w-8 text-[#FF7A00] relative z-10" />
                      </div>
                      
                      {/* Question - Aligned with Answer */}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg md:text-xl text-[#2D2416] font-bold mb-0 group-hover:text-[#FF7A00] transition-colors duration-300 leading-tight">
                          {faq.question}
                        </CardTitle>
                      </div>
                      
                      {/* Chevron */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF7A00]/10 to-[#E8A600]/10 flex items-center justify-center transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-[#FF7A00]/20 group-hover:to-[#E8A600]/20 ${isOpen ? 'rotate-180' : ''}`}>
                          <ChevronDown 
                            className={`h-5 w-5 text-[#FF7A00] transition-all duration-300 group-hover:scale-110 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Answer */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out relative z-10 ${
                    isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <CardContent className="px-6 pb-6 pt-2">
                      <div className="pl-20 relative">
                        {/* Orange Border Left with Gradient */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF7A00] via-[#E8A600] to-[#FF7A00] rounded-full shadow-sm"></div>
                        
                        <div className="pt-1 space-y-3">
                          {/* Split answer into points for better readability */}
                          {faq.answer.split(/[.!?]\s+/).filter(s => s.trim().length > 0).map((point, pointIdx, arr) => (
                            <div key={pointIdx} className="flex items-start gap-3 group/item">
                              {/* Orange Bullet Point with Gradient */}
                              <div className="flex-shrink-0 mt-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#E8A600] shadow-md group-hover/item:scale-125 transition-transform duration-200 relative">
                                  <div className="absolute inset-0 bg-white/30 rounded-full blur-sm"></div>
                                </div>
                              </div>
                              <p className="text-base text-[#5A4A32] leading-relaxed font-medium flex-1 group-hover/item:text-[#2D2416] transition-colors">
                                {point.trim()}{pointIdx < arr.length - 1 ? '.' : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Navigation - Beautiful Design */}
          <div className="flex items-center justify-center gap-6">
            <Button
              onClick={handlePrevFaq}
              variant="outline"
              className="group border-2 border-[#FF7A00] text-[#B82601] hover:bg-gradient-to-r hover:from-[#FF7A00] hover:to-[#E8A600] hover:text-white hover:border-transparent font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Sebelumnya
            </Button>
            
            {/* Page Indicator - Beautiful Dots */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full shadow-md">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFaqPage(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    faqPage === idx 
                      ? 'w-10 h-3 bg-gradient-to-r from-[#FF7A00] to-[#E8A600] shadow-md' 
                      : 'w-3 h-3 bg-[#FF7A00]/30 hover:bg-[#FF7A00]/50 hover:scale-125'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={handleNextFaq}
              variant="outline"
              className="group border-2 border-[#FF7A00] text-[#B82601] hover:bg-gradient-to-r hover:from-[#FF7A00] hover:to-[#E8A600] hover:text-white hover:border-transparent font-bold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Selanjutnya
              <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 relative gradient-autumn-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white autumn-shadow mb-6">
                <Mail className="h-4 w-4 text-[#9A7400]" />
                <span className="text-sm text-[#B82601] font-semibold">Hubungi Kami</span>
              </div>
              <h2 className="mb-6 text-4xl text-[#B82601] font-bold">Siap Memulai?</h2>
              <p className="mb-8 text-[#5A4A32] text-lg leading-relaxed font-medium">
                Tim kami siap membantu Anda meningkatkan produktivitas budidaya jamur dengan teknologi terdepan.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 autumn-card p-4 rounded-xl autumn-card-hover">
                  <div className="w-12 h-12 rounded-xl gradient-red-fire flex items-center justify-center flex-shrink-0 autumn-shadow">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#5A4A32] font-medium">Email</div>
                    <div className="text-[#2D2416] font-bold">info@mycotrack.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 autumn-card p-4 rounded-xl autumn-card-hover">
                  <div className="w-12 h-12 rounded-xl gradient-orange-warm flex items-center justify-center flex-shrink-0 autumn-shadow">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#5A4A32] font-medium">Telepon</div>
                    <div className="text-[#2D2416] font-bold">085294939357</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 autumn-card p-4 rounded-xl autumn-card-hover">
                  <div className="w-12 h-12 rounded-xl gradient-yellow-gold flex items-center justify-center flex-shrink-0 autumn-shadow">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#5A4A32] font-medium">Alamat</div>
                    <div className="text-[#2D2416] font-bold">Jl. Kumbang No.14, RT.02/RW.06, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="autumn-card rounded-3xl overflow-hidden autumn-shadow-lg border-2 border-[#FF7A00]/20">
              <div className="bg-gradient-to-br from-[#B82601]/5 to-[#FF7A00]/5 p-6 border-b-2 border-[#FF7A00]/20">
                <h3 className="text-xl text-[#B82601] font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FF7A00]" />
                  Lokasi Kami
                </h3>
                <p className="text-sm text-[#5A4A32] font-medium mt-1">Jl. Kumbang No.14, RT.02/RW.06, Babakan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16128</p>
              </div>
              <div className="relative h-[450px] bg-gradient-to-br from-[#DDE0E3] to-[#FAF5EF]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.4567890123!2d106.8062!3d-6.5971!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5a5a5a5a5a5%3A0x5a5a5a5a5a5a5a5a!2sJl%20Kumbang%20No.14%2C%20Babakan%2C%20Kec.%20Bogor%20Tengah%2C%20Kota%20Bogor%2C%20Jawa%20Barat%2016128!5e0!3m2!1sen!2sid!4v1635000000000!5m2!1sen!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-b-3xl"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Detail Modal */}
      {selectedArticleIndex !== null && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={handleCloseModal}
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div 
            className="relative bg-white rounded-none sm:rounded-2xl md:rounded-3xl max-w-4xl w-full h-full sm:h-[90vh] sm:my-4 autumn-shadow-lg animate-slide-up flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#B82601]" />
            </button>

            {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
            <button
              onClick={handlePrevArticle}
              className="hidden sm:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-[#B82601]" />
            </button>
            <button
              onClick={handleNextArticle}
              className="hidden sm:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white shadow-lg items-center justify-center transition-all hover:scale-110"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-[#B82601]" />
            </button>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
              {/* Article Content */}
              {(() => {
                const article = mockArticles[selectedArticleIndex];
                const categoryColor = getCategoryColor(article.category);
                
                return (
                  <div className="relative">
                    {/* Article Image */}
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={article.image}
                        alt={article.title}
                        className="w-full h-48 sm:h-64 md:h-96 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#B82601]/60 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                        <span 
                          className="inline-block px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border shadow-lg backdrop-blur-sm"
                          style={{ 
                            backgroundColor: categoryColor.bg,
                            color: categoryColor.text,
                            borderColor: categoryColor.border
                          }}
                        >
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8">
                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#B82601] mb-3 sm:mb-4">
                      {article.title}
                    </h1>

                    {/* Author and Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#B82601] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          {article.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm sm:text-base text-[#5A4A32]">{article.author}</p>
                          <p className="text-xs sm:text-sm text-gray-500">Penulis</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm sm:text-base text-[#FF7A00] font-semibold">
                          {new Date(article.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#FFF4D4]/50 to-transparent rounded-lg border-l-4 border-[#FF7A00]">
                        <p className="text-base sm:text-lg text-[#5A4A32] font-medium italic">
                          {article.excerpt}
                        </p>
                      </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-6 sm:mb-8">
                      <div className="text-sm sm:text-base text-[#5A4A32] leading-relaxed whitespace-pre-wrap">
                        {article.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3 sm:mb-4">
                            {paragraph || '\u00A0'}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Next Article Button - Mobile friendly */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-200">
                      {/* Mobile Navigation Buttons */}
                      <div className="flex sm:hidden justify-between gap-2">
                        <Button
                          onClick={handlePrevArticle}
                          variant="outline"
                          className="flex-1 border-2 border-[#FF7A00] text-[#B82601] hover:bg-[#FF7A00]/10 font-semibold"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Sebelumnya
                        </Button>
                        <Button
                          onClick={handleNextArticle}
                          className="flex-1 gradient-autumn-cta text-white hover-glow transition-all font-semibold shadow-lg"
                        >
                          Selanjutnya
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      {/* Desktop Button */}
                      <Button
                        onClick={handleNextArticle}
                        className="hidden sm:flex gradient-autumn-cta text-white hover-glow transition-all font-semibold shadow-lg px-8"
                      >
                        Lihat Artikel Selanjutnya
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="gradient-autumn-hero text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shell className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">MycoTrack</span>
              </div>
              <p className="text-white/90 text-sm font-medium">Platform monitoring jamur dengan teknologi AI & IoT</p>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-bold text-[#FFF4D4]">Produk</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors font-medium">IoT Monitoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">AI Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Marketplace</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-bold text-[#FFF4D4]">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Karir</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-bold text-[#FFF4D4]">Sosial Media</h4>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover-lift">
                  <Instagram className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all hover-lift">
                  <MessageCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/20 text-center text-sm text-white/90">
            <p className="font-medium">&copy; 2025 MycoTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
