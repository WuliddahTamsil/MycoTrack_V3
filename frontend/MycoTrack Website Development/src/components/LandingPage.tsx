import React from 'react';
import { ArrowRight, Shell, TrendingUp, Zap, ChevronDown, Mail, Phone, MapPin, Instagram, MessageCircle, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Input } from './ui/input';
import { mockArticles } from './mockData';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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
              onClick={onOpenAuth}
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
              <Card key={article.id} className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
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

      {/* FAQ Section */}
      <section id="faq" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white autumn-shadow mb-6">
              <MessageCircle className="h-4 w-4 text-[#E8A600]" />
              <span className="text-sm text-[#B82601] font-semibold">Pertanyaan Umum</span>
            </div>
            <h2 className="text-4xl mb-4 text-[#B82601] font-bold">FAQ</h2>
            <p className="text-lg text-[#5A4A32] font-medium">
              Pertanyaan yang sering diajukan tentang MycoTrack
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="autumn-card border-[#FF7A00]/10 rounded-2xl px-6">
              <AccordionTrigger className="hover:text-[#FF7A00] text-[#2D2416] font-bold">Apa itu MycoTrack?</AccordionTrigger>
              <AccordionContent className="text-[#5A4A32] font-medium">
                MycoTrack adalah platform ekosistem yang menggabungkan IoT dan AI untuk membantu petani jamur kuping meningkatkan produktivitas dan kualitas panen melalui monitoring real-time dan marketplace terintegrasi.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="autumn-card border-[#FF7A00]/10 rounded-2xl px-6">
              <AccordionTrigger className="hover:text-[#FF7A00] text-[#2D2416] font-bold">Bagaimana cara kerja sistem monitoring IoT?</AccordionTrigger>
              <AccordionContent className="text-[#5A4A32] font-medium">
                Sensor IoT kami dipasang di ruang budidaya untuk mengumpulkan data suhu, kelembaban, dan kondisi lingkungan secara real-time 24/7. Data tersebut dikirim ke cloud dan ditampilkan di dashboard Anda untuk analisis dan pengambilan keputusan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="autumn-card border-[#FF7A00]/10 rounded-2xl px-6">
              <AccordionTrigger className="hover:text-[#FF7A00] text-[#2D2416] font-bold">Apa keunggulan AI di MycoTrack?</AccordionTrigger>
              <AccordionContent className="text-[#5A4A32] font-medium">
                AI kami menganalisis data historis dan kondisi real-time untuk memberikan rekomendasi optimasi budidaya, prediksi hasil panen, deteksi anomali, dan quality control menggunakan computer vision dengan akurasi tinggi.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="autumn-card border-[#FF7A00]/10 rounded-2xl px-6">
              <AccordionTrigger className="hover:text-[#FF7A00] text-[#2D2416] font-bold">Bagaimana sistem pembayaran di marketplace?</AccordionTrigger>
              <AccordionContent className="text-[#5A4A32] font-medium">
                MycoTrack menyediakan sistem pembayaran terintegrasi yang aman. Petani dapat menerima pembayaran langsung ke saldo akun mereka dan melakukan penarikan ke rekening bank kapan saja dengan proses yang cepat dan mudah.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="autumn-card border-[#FF7A00]/10 rounded-2xl px-6">
              <AccordionTrigger className="hover:text-[#FF7A00] text-[#2D2416] font-bold">Berapa biaya menggunakan MycoTrack?</AccordionTrigger>
              <AccordionContent className="text-[#5A4A32] font-medium">
                Kami menawarkan berbagai paket berlangganan mulai dari paket gratis dengan fitur dasar hingga paket premium dengan semua fitur IoT dan AI. Hubungi tim sales kami untuk informasi lebih detail dan penawaran khusus.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
                    <div className="text-[#2D2416] font-bold">+62 812-3456-7890</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 autumn-card p-4 rounded-xl autumn-card-hover">
                  <div className="w-12 h-12 rounded-xl gradient-yellow-gold flex items-center justify-center flex-shrink-0 autumn-shadow">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#5A4A32] font-medium">Alamat</div>
                    <div className="text-[#2D2416] font-bold">Jl. Teknologi No. 123, Bandung</div>
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
                <p className="text-sm text-[#5A4A32] font-medium mt-1">Jl. Teknologi No. 123, Bandung</p>
              </div>
              <div className="relative h-[450px] bg-gradient-to-br from-[#DDE0E3] to-[#FAF5EF]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56211042117!2d107.57311651640625!3d-6.903444399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a1f93d3e815b2!2sBandung%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1635000000000!5m2!1sen!2sid"
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
