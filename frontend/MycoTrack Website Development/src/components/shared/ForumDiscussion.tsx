import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, Search, Filter, Plus, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  likes: number;
}

interface ForumPost {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  time: string;
  likes: number;
  comments: Comment[];
  views: number;
  isLiked: boolean;
}

const mockPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Tips Meningkatkan Hasil Panen Jamur Kuping',
    author: 'Budi Santoso',
    category: 'Tips & Trik',
    content: 'Saya ingin berbagi pengalaman selama 5 tahun budidaya jamur kuping. Kunci utamanya adalah menjaga kelembaban antara 80-90% dan suhu 25-28°C...',
    time: '2 jam yang lalu',
    likes: 24,
    views: 156,
    isLiked: false,
    comments: [
      {
        id: '1',
        author: 'Dewi Lestari',
        content: 'Terima kasih sharingnya! Sangat membantu untuk pemula seperti saya.',
        time: '1 jam yang lalu',
        likes: 5
      },
      {
        id: '2',
        author: 'Ahmad Hidayat',
        content: 'Setuju sekali. Saya juga menerapkan metode ini dan hasil panen meningkat 30%!',
        time: '30 menit yang lalu',
        likes: 3
      }
    ]
  },
  {
    id: '2',
    title: 'Cara Mengatasi Jamur Kuping yang Tidak Tumbuh Optimal',
    author: 'Siti Nurhaliza',
    category: 'Troubleshooting',
    content: 'Baglog saya sudah 3 minggu tapi jamurnya masih kecil-kecil. Ada yang punya saran?',
    time: '5 jam yang lalu',
    likes: 12,
    views: 89,
    isLiked: true,
    comments: [
      {
        id: '3',
        author: 'Eko Prasetyo',
        content: 'Coba cek kelembaban ruangannya. Mungkin terlalu kering.',
        time: '4 jam yang lalu',
        likes: 8
      }
    ]
  },
  {
    id: '3',
    title: 'Pengalaman Menggunakan MycoTrack untuk Monitoring',
    author: 'Rudi Hartono',
    category: 'Teknologi',
    content: 'Sejak pakai MycoTrack, monitoring jadi lebih mudah dan hasil panen meningkat signifikan. Highly recommended!',
    time: '1 hari yang lalu',
    likes: 45,
    views: 234,
    isLiked: false,
    comments: []
  }
];

export const ForumDiscussion: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>(mockPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Tips & Trik',
    content: ''
  });

  const categories = ['Semua', 'Tips & Trik', 'Troubleshooting', 'Teknologi', 'Pasar', 'Lainnya'];

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!newComment[postId] || newComment[postId].trim() === '') return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const comment: Comment = {
          id: Date.now().toString(),
          author: 'Anda',
          content: newComment[postId],
          time: 'Baru saja',
          likes: 0
        };
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));

    setNewComment({ ...newComment, [postId]: '' });
  };

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content) return;

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      author: 'Anda',
      category: newPost.category,
      content: newPost.content,
      time: 'Baru saja',
      likes: 0,
      views: 0,
      isLiked: false,
      comments: []
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', category: 'Tips & Trik', content: '' });
    setIsCreatePostOpen(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6" style={{ color: 'var(--primary-orange)' }} />
              <CardTitle>Forum Diskusi Petani Jamur</CardTitle>
            </div>
            <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Diskusi Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Diskusi Baru</DialogTitle>
                  <DialogDescription>
                    Bagikan pengalaman, tanya jawab, atau diskusi seputar budidaya jamur
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Diskusi</Label>
                    <Input
                      id="title"
                      placeholder="Masukkan judul diskusi..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select 
                      value={newPost.category} 
                      onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== 'Semua').map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="content">Konten</Label>
                    <Textarea
                      id="content"
                      placeholder="Tulis detail diskusi Anda..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <Button 
                    onClick={handleCreatePost}
                    className="w-full bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                  >
                    Posting Diskusi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
              <Input
                placeholder="Cari diskusi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.filter(c => c !== 'Semua').map(cat => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada diskusi ditemukan</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[var(--primary-orange)] text-white">
                          {post.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 
                              className="text-lg mb-1 cursor-pointer hover:opacity-70"
                              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                            >
                              {post.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm opacity-60 mb-3">
                              <span>{post.author}</span>
                              <span>•</span>
                              <span>{post.time}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 border-orange-200">
                            {post.category}
                          </Badge>
                        </div>

                        <p className="text-sm opacity-70 mb-4">
                          {expandedPost === post.id 
                            ? post.content 
                            : post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '')
                          }
                        </p>

                        <div className="flex items-center gap-6 text-sm mb-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center gap-2 hover:opacity-70 transition-opacity ${
                              post.isLiked ? 'text-[var(--primary-orange)]' : ''
                            }`}
                          >
                            <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          <button 
                            className="flex items-center gap-2 hover:opacity-70"
                            onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments.length} Komentar</span>
                          </button>
                          <div className="flex items-center gap-2 opacity-60">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} views</span>
                          </div>
                        </div>

                        {/* Comments Section */}
                        {expandedPost === post.id && (
                          <div className="mt-4 pt-4 border-t space-y-4">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                    {comment.author.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">{comment.author}</span>
                                    <span className="text-xs opacity-50">• {comment.time}</span>
                                  </div>
                                  <p className="text-sm opacity-70">{comment.content}</p>
                                </div>
                              </div>
                            ))}

                            {/* Add Comment */}
                            <div className="flex gap-3 mt-4">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-[var(--primary-orange)] text-white text-xs">
                                  A
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Tulis komentar..."
                                  value={newComment[post.id] || ''}
                                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddComment(post.id);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddComment(post.id)}
                                  className="bg-[var(--primary-orange)] hover:bg-[var(--primary-gold)]"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
