import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const blogPosts = [
  {
    title: 'Start-Ups Newsletter',
    description: 'This Week In Start Ups, All-In Podcast & The Tim Feris Show.',
    href: '/newsletter/start-ups'
  },
  {
    title: 'Finance Newsletter',
    description: 'We Study Billionaires, All-In Podcast & Real Vision.',
    href: '/newsletter/finance'
  },
  {
    title: 'General Knowledge Newsletter',
    description: 'Lex Freidman, The Joe Rogan Experience & Jordan Peterson.',
    href: '/newsletter/general-knowledge'
  },
];

const Examples = () => {
  return (
    <>
      <div className="text-center my-8">
        <h2 className="text-4xl font-bold">Customize Your Newsletter</h2>
        <p className="text-md mt-4">Customize your newsletter with whatever creators you enjoy listening to or just chose from pre-existing ones to suit your interests.</p>
      </div>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pb-20">
        {blogPosts.map((post, index) => (
          <div key={index} className="border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
            <Link href={post.href} legacyBehavior>
              <a className="block rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center rounded-t-lg bg-orange-500" style={{ height: '200px' }}>
                  <h3 className="text-xl font-bold text-white">{post.title}</h3>
                </div>
              </a>
            </Link>
            <div className="p-4">
              <p>{post.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Examples;