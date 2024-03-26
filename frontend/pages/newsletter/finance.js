import React from 'react';
import Layout from '../../components/Layout/Layout';
import CtaButton from '../../components/misc/CtaButton';
import SeoHead from '../../components/SeoHead';
import YouTubeEmbed from '../../components/misc/YouTubeEmbed';

const FinanceNewsletter = () => {
  return (
    <>
      <SeoHead title="Start-Ups Newsletter" />
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
            <CtaButton text="Free forever for 2 podcasts!" href="https://github.com/luke-harriman/podcast-summariser" />
          <h1 className="text-3xl font-bold text-center my-4">
            Finance Newsletter: We Study Billionaires, All-In Podcast & Real Vision.
          </h1>
          <div className="flex justify-around gap-4">
            <YouTubeEmbed videoId="VF56c5jyGy4" />
            <YouTubeEmbed videoId="uMajFsCkzxY" />
            <YouTubeEmbed videoId="M52Om74u6VQ" />
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mt-8">
              We Study Billionaires: A Sea Change Is Happening: What Worked Then, Won’t Work Now w/ Howard Marks (TIP545)
            </h2>
            <p>
              Video summaries or text content goes here...
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default FinanceNewsletter;