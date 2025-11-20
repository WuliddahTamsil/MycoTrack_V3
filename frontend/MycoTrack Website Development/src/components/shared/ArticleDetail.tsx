import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
}

interface ArticleDetailProps {
  articleId: string;
  onBack: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleId, onBack }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Gagal memuat artikel');
      }
      const data = await response.json();
      setArticle(data.article);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Gagal memuat artikel. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[#B82601] hover:text-[#8B1C01] hover:bg-[#B82601]/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Memuat artikel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-[#B82601] hover:text-[#8B1C01] hover:bg-[#B82601]/5"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Artikel tidak ditemukan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="text-[#B82601] hover:text-[#8B1C01] hover:bg-[#B82601]/5"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Kembali ke Daftar Artikel
      </Button>

      <Card className="autumn-card border-[#FF7A00]/10 overflow-hidden">
        {/* Article Image */}
        <div className="relative overflow-hidden">
          <ImageWithFallback
            src={article.image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#B82601]/60 to-transparent"></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold border shadow-lg backdrop-blur-sm"
              style={{ 
                backgroundColor: getCategoryColor(article.category).bg,
                color: getCategoryColor(article.category).text,
                borderColor: getCategoryColor(article.category).border
              }}
            >
              {article.category || 'Tidak ada kategori'}
            </span>
          </div>
        </div>

        <CardContent className="p-6 md:p-8">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#B82601] mb-4">
            {article.title}
          </h1>

          {/* Author and Date */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#B82601] flex items-center justify-center text-white font-bold text-lg">
                {article.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#5A4A32]">{article.author}</p>
                <p className="text-sm text-gray-500">Penulis</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#FF7A00] font-semibold">
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
            <div className="mb-6 p-4 bg-gradient-to-r from-[#FFF4D4]/50 to-transparent rounded-lg border-l-4 border-[#FF7A00]">
              <p className="text-lg text-[#5A4A32] font-medium italic">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-[#5A4A32] leading-relaxed whitespace-pre-wrap">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph || '\u00A0'}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

