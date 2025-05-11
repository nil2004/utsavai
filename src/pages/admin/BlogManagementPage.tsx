import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

const categories = [
  "Wedding Planning",
  "Corporate Events",
  "Birthday Parties",
  "Vendor Tips",
  "Event Technology",
  "Budget Planning"
];

// SEO Suggestions helper
function seoSuggestions({ title, excerpt, content, image_url }) {
  const suggestions = [];
  if (!title || title.length < 30) suggestions.push("Title should be at least 30 characters.");
  if (!excerpt || excerpt.length < 50) suggestions.push("Meta description (excerpt) should be at least 50 characters.");
  if (!content || content.split(/\s+/).length < 300) suggestions.push("Content should be at least 300 words.");
  if (!image_url) suggestions.push("Add a featured image.");
  if (!/<img[^>]+alt=/.test(content)) suggestions.push("Add alt text to all images in your content.");
  if (!/<h1>/.test(content)) suggestions.push("Use an <h1> heading for your main title.");
  return suggestions;
}

// Advanced SEO Suggestions helper
function advancedSeoSuggestions({ title, excerpt, content, image_url, slug, keyword }) {
  const suggestions = [];
  if (!keyword) suggestions.push("Set a primary keyword for this post.");
  if (keyword && !title.toLowerCase().includes(keyword.toLowerCase()))
    suggestions.push("Include the primary keyword in the title.");
  if (keyword && !excerpt.toLowerCase().includes(keyword.toLowerCase()))
    suggestions.push("Include the primary keyword in the meta description.");
  if (keyword && !content.toLowerCase().includes(keyword.toLowerCase()))
    suggestions.push("Include the primary keyword in the content.");
  if (keyword) {
    const subheadingRegex = new RegExp(`<h[2-6][^>]*>[^<]*${keyword}[^<]*<\\/h[2-6]>`, 'i');
    if (!subheadingRegex.test(content))
      suggestions.push("Include the primary keyword in at least one subheading.");
  }
  if (keyword) {
    const count = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), "g")) || []).length;
    const words = content.split(/\s+/).length;
    const density = (count / words) * 100;
    if (density < 0.5) suggestions.push("Keyword density is low. Try to use your keyword a bit more.");
    if (density > 2.5) suggestions.push("Keyword density is high. Avoid keyword stuffing.");
  }
  if (content.split('.').length / (content.split(/\s+/).length / 100) < 1)
    suggestions.push("Use shorter sentences for better readability.");
  if (content.split('\n').some(p => p.length > 300))
    suggestions.push("Break up long paragraphs for easier reading.");
  if (!content.includes('<ul>') && !content.includes('<ol>'))
    suggestions.push("Use bullet points or numbered lists for clarity.");
  if (!/href=\"https?:\/\//.test(content))
    suggestions.push("Add at least one external link to a reputable source.");
  if (!/href=\"\/.+?\"/.test(content))
    suggestions.push("Add at least one internal link to another page on your site.");
  if (keyword) {
    const altRegex = new RegExp(`<img[^>]+alt=\"[^\"]*${keyword}[^\"]*\"`);
    if (!altRegex.test(content))
      suggestions.push("Include the primary keyword in at least one image alt text.");
  }
  if (!slug || slug.length > 60 || !slug.match(/^[a-z0-9-]+$/))
    suggestions.push("Use a short, descriptive, lowercase slug (letters, numbers, hyphens only).");
  if (!/<h2>/.test(content)) suggestions.push("Use <h2> subheadings to structure your content.");
  if (!image_url) suggestions.push("Set a featured image for social sharing (Open Graph).");
  return suggestions;
}

// Flesch Reading Ease calculation
function fleschReadingEase(text) {
  if (!text) return 0;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const syllables = text.split(/\s+/).reduce((acc, word) => acc + countSyllables(word), 0);
  if (sentences === 0 || words === 0) return 0;
  // Flesch Reading Ease formula
  return Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words));
}
function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Google Snippet Preview
function GoogleSnippetPreview({ title, slug, excerpt, keyword }) {
  const baseUrl = 'https://yourdomain.com/blog/';
  const url = slug ? baseUrl + slug : baseUrl + 'your-post-slug';
  return (
    <div className="border rounded p-4 bg-gray-50 mb-4">
      <div className="text-xs text-gray-500 mb-1">Google Preview</div>
      <div className="text-blue-800 text-sm leading-tight truncate">{url}</div>
      <div className="text-lg font-semibold text-gray-900 leading-tight">
        {title || 'Your Blog Post Title'}
      </div>
      <div className="text-gray-700 text-sm mt-1">
        {excerpt || 'Your meta description will appear here.'}
      </div>
      {keyword && (
        <div className="mt-2 text-xs text-green-700">Primary keyword: <span className="font-bold">{keyword}</span></div>
      )}
    </div>
  );
}

const BlogManagementPage = () => {
  const [posts, setPosts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    image_url: '',
    featured: false,
    tags: '',
    slug: '',
    keyword: ''
  });
  const { toast } = useToast();

  // Fetch posts from Supabase
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        ...post,
        tags: post.tags.join(', '),
        slug: post.slug,
        keyword: post.keyword
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        author: '',
        image_url: '',
        featured: false,
        tags: '',
        slug: '',
        keyword: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        slug: formData.slug.replace(/[^a-z0-9-]/g, '').toLowerCase(),
        keyword: formData.keyword
      };

      if (editingPost) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({
          title: "Post Updated",
          description: "The blog post has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([postData]);

        if (error) throw error;
        toast({
          title: "Post Created",
          description: "New blog post has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      fetchPosts(); // Refresh the posts list
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save the blog post.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        
        toast({
          title: "Post Deleted",
          description: "The blog post has been deleted successfully.",
        });
        fetchPosts(); // Refresh the posts list
      } catch (error) {
        console.error('Error deleting post:', error);
        toast({
          title: "Error",
          description: "Failed to delete the blog post.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  className="min-h-[200px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., Wedding, Planning, Tips"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SEO Slug (URL)</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.replace(/[^a-z0-9-]/g, '').toLowerCase() })}
                  placeholder="e.g., 10-tips-for-wedding-success"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Keyword</label>
                <Input
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="e.g., wedding planning"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="featured" className="text-sm font-medium">
                  Featured Post
                </label>
              </div>
              <div>
                <h3 className="font-semibold mb-2">SEO Suggestions</h3>
                <ul className="list-disc pl-5 text-sm text-yellow-700">
                  {seoSuggestions(formData).length === 0 ? (
                    <li className="text-green-700">Great job! Your post looks SEO-friendly.</li>
                  ) : (
                    seoSuggestions(formData).map((s, i) => <li key={i}>{s}</li>)
                  )}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Advanced SEO Suggestions</h3>
                <ul className="list-disc pl-5 text-sm text-yellow-700">
                  {advancedSeoSuggestions(formData).length === 0 ? (
                    <li className="text-green-700">Great job! Your post looks SEO-friendly.</li>
                  ) : (
                    advancedSeoSuggestions(formData).map((s, i) => <li key={i}>{s}</li>)
                  )}
                </ul>
              </div>
              <GoogleSnippetPreview
                title={formData.title}
                slug={formData.slug}
                excerpt={formData.excerpt}
                keyword={formData.keyword}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Flesch Reading Ease</label>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      fleschReadingEase(formData.content) >= 60
                        ? 'text-green-700 font-bold'
                        : fleschReadingEase(formData.content) >= 30
                        ? 'text-yellow-700 font-bold'
                        : 'text-red-700 font-bold'
                    }
                  >
                    {fleschReadingEase(formData.content)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {fleschReadingEase(formData.content) >= 60
                      ? 'Easy to read'
                      : fleschReadingEase(formData.content) >= 30
                      ? 'Fairly difficult'
                      : 'Very difficult'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {post.featured && (
                    <Badge variant="secondary">Featured</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a href={`/blog/${post.id}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BlogManagementPage; 