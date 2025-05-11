import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data (in a real app, this would come from an API)
const blogPosts = [
  {
    id: 1,
    title: "10 Tips for Planning the Perfect Wedding",
    content: `
      <p>Planning a wedding can be both exciting and overwhelming. Here are 10 essential tips to help you create the perfect celebration:</p>
      
      <h2>1. Start Early</h2>
      <p>Begin planning at least 12-18 months in advance to secure your preferred vendors and venue.</p>
      
      <h2>2. Set a Budget</h2>
      <p>Determine your total budget and allocate funds to different aspects of the wedding.</p>
      
      <h2>3. Choose Your Venue</h2>
      <p>Select a venue that matches your style and can accommodate your guest list.</p>
      
      <h2>4. Book Key Vendors</h2>
      <p>Secure your photographer, caterer, and entertainment early.</p>
      
      <h2>5. Create a Timeline</h2>
      <p>Develop a detailed schedule for the wedding day.</p>
      
      <h2>6. Plan Your Menu</h2>
      <p>Work with your caterer to create a menu that suits your style and dietary needs.</p>
      
      <h2>7. Choose Your Attire</h2>
      <p>Start shopping for wedding attire 8-12 months before the big day.</p>
      
      <h2>8. Send Invitations</h2>
      <p>Mail invitations 6-8 weeks before the wedding.</p>
      
      <h2>9. Plan the Ceremony</h2>
      <p>Work with your officiant to create a meaningful ceremony.</p>
      
      <h2>10. Enjoy the Process</h2>
      <p>Remember to enjoy the planning process and celebrate your love story.</p>
    `,
    category: "Wedding Planning",
    date: "2024-03-15",
    author: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552",
    tags: ["Wedding", "Planning", "Tips"]
  },
  // Add more blog posts here
];

const BlogPostPage = () => {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-4">The blog post you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-8"
        asChild
      >
        <Link to="/blog" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {/* Hero Image */}
      <div className="aspect-video relative mb-8 rounded-lg overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Article Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>{post.category}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <p className="text-gray-600 mb-6">By {post.author}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Share Button */}
        <Button
          variant="outline"
          className="mb-8"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Article
        </Button>

        {/* Article Content */}
        <article 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Related Posts Section */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts
            .filter(p => p.id !== post.id)
            .slice(0, 2)
            .map((relatedPost) => (
              <div key={relatedPost.id} className="border rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{relatedPost.title}</h3>
                  <Button asChild variant="link" className="p-0">
                    <Link to={`/blog/${relatedPost.id}`}>Read More →</Link>
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage; 