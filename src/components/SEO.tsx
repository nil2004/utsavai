import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'UtsavAI - Your AI Event Planning Assistant',
  description = 'Plan your perfect event with UtsavAI. Get personalized vendor recommendations, budget planning, and expert event planning assistance powered by AI.',
  image = 'https://utsavai.com/og-image.jpg',
  url = 'https://utsavai.com',
  type = 'website'
}) => {
  const siteName = 'UtsavAI';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="keywords" content="event planning, AI event planner, wedding planning, corporate events, birthday planning, event vendors, event management" />
      <meta name="author" content="UtsavAI" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#7C3AED" />
      
      {/* Language and Locale */}
      <meta property="og:locale" content="en_IN" />
      <html lang="en" />
    </Helmet>
  );
};

export default SEO; 