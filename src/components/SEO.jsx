import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEVELOPER_INFO } from '../utils/constants';

const SEO = ({ title, description, url, image }) => {
  const defaultTitle = `${DEVELOPER_INFO.name} | ${DEVELOPER_INFO.role}`;
  const defaultDescription = DEVELOPER_INFO.tagline;
  // TODO: Replace with your actual domain and a real OG image URL
  const defaultImage = "https://yourdomain.com/og-image.jpg"; 
  const defaultUrl = "https://yourdomain.com";

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: image || defaultImage,
    url: url || defaultUrl,
  };

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@yourtwitterhandle" />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
};

export default SEO;
