import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = 'UtsavAI - Your AI-Powered Event Planning Assistant',
  description = 'Plan your perfect event with UtsavAI. Find the best vendors, get AI-powered recommendations, and make your event planning seamless.',
  keywords = 'event planning, AI assistant, wedding planning, birthday party, corporate events, vendors, event management',
  image = 'https://utsavai.com/og-image.jpg',
  url = 'https://utsavai.com',
  type = 'website'
}) => {
  const siteTitle = title.includes('UtsavAI') ? title : `${title} | UtsavAI`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="UtsavAI" />

      {/* Structured Data / JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "UtsavAI",
          "url": "https://utsavai.com",
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://utsavai.com/marketplace?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO; 