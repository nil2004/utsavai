import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';

const NotFoundPage = () => {
  return (
    <>
      <SEO 
        title="Page Not Found | UtsavAI"
        description="The page you're looking for cannot be found. Return to UtsavAI's homepage to continue planning your perfect event."
        type="website"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-violet-50/50 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to planning your perfect event.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/">Return Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">Browse Vendors</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage; 