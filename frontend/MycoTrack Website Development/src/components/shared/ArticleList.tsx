import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
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

interface ArticleListProps {
  onArticleClick: (articleId: string) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({ onArticleClick }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const url = searchQuery 
        ? `${API_BASE_URL}/articles?search=${encodeURIComponent(searchQuery)}`
        : `${API_BASE_URL}/articles`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Gagal memuat artikel');
      }
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Gagal memuat artikel. Pastikan backend berjalan.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchArticles();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ color: 'var(--secondary-dark-red)' }}>Info / Artikel</h2>
            <p style={{ color: 'var(--neutral-gray)' }}>
              Baca artikel edukasi tentang budidaya jamur kuping
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Memuat artikel...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ color: 'var(--secondary-dark-red)' }}>Info / Artikel</h2>
          <p style={{ color: 'var(--neutral-gray)' }}>
            Baca artikel edukasi tentang budidaya jamur kuping
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Tidak ada artikel ditemukan.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="autumn-card autumn-card-hover border-[#FF7A00]/10 overflow-hidden group transition-all duration-300 hover:shadow-xl cursor-pointer"
              onClick={() => onArticleClick(article.id)}
            >
              {/* Article Image */}
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#B82601]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span 
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold border shadow-md backdrop-blur-sm"
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

              {/* Article Content */}
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 text-lg text-[#B82601] font-bold mb-2 group-hover:text-[#FF7A00] transition-colors">
                  {article.title}
                </CardTitle>
                {article.excerpt && (
                  <p className="line-clamp-2 text-sm text-[#5A4A32] font-medium">
                    {article.excerpt}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Author and Date */}
                <div className="flex items-center justify-between text-sm mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#B82601] flex items-center justify-center text-white font-bold text-xs">
                      {article.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[#5A4A32]">{article.author}</span>
                  </div>
                  <span className="text-[#FF7A00] font-medium">
                    {new Date(article.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

