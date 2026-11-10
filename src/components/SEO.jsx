import React from 'react';
import { Helmet } from 'react-helmet-async';
import { profile } from '../data/lab';
export default function SEO() {
  const title='Muhammad Abdullah Bhatti | Interactive Project Library';
  const description='Explore Muhammad Abdullah Bhatti’s web, AI and data science projects through an interactive bookshelf, live previews and case studies.';
  const url='https://www.theabdullahdevs.com/';
  return <Helmet><title>{title}</title><meta name="description" content={description}/><meta name="theme-color" content="#17141d"/><link rel="canonical" href={url}/><meta property="og:type" content="website"/><meta property="og:title" content={title}/><meta property="og:description" content={description}/><meta property="og:url" content={url}/><meta property="og:image" content={`${url}og-lab.png`}/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={title}/><meta name="twitter:description" content={description}/><meta name="twitter:image" content={`${url}og-lab.png`}/><script type="application/ld+json">{JSON.stringify({'@context':'https://schema.org','@type':'Person',name:profile.name,url,jobTitle:'AI/ML Developer',description:'Computer science student and machine learning engineer in progress.',sameAs:[profile.github,profile.linkedin],knowsAbout:['Python','Machine Learning','Computer Vision','Software Engineering']})}</script></Helmet>;
}
