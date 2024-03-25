import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const blogPosts = [
  { title: 'Blog Post 1', banner: '/assets/blog-startup-banner.png', href: '/blog/post-1' },
  { title: 'Blog Post 2', banner: '/assets/blog-finance-banner.png', href: '/blog/post-2' },
  { title: 'Blog Post 3', banner: '/assets/blog-ai-tech-banner.png', href: '/blog/post-3' },
];

const Examples = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {blogPosts.map((post, index) => (
        <Link key={index} href={post.href} passHref>
          <a className="block p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <div className="aspect-w-16 aspect-h-9 mb-3">
              <Image src={post.banner} alt={post.title} layout="fill" objectFit="cover" />
            </div>
            <h3 className="text-lg font-semibold">{post.title}</h3>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default Examples;