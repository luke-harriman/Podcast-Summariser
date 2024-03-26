import React from 'react';
import Layout from '../../components/Layout/Layout';
import CtaButton from '../../components/misc/CtaButton';
import SeoHead from '../../components/SeoHead';
import YouTubeEmbed from '../../components/misc/YouTubeEmbed';

const GeneralNewsletter = () => {
  return (
    <>
      <SeoHead title="General Knowledge Newsletter" />
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
            <CtaButton text="Free forever for 2 podcasts!" href="https://github.com/luke-harriman/podcast-summariser" />
          <h1 className="text-3xl font-bold text-center my-4">
            General Knowledge Newsletter: Lex Freidman, The Joe Rogan Experience & Jordan Peterson.
          </h1>
          <div className="flex justify-around gap-4">
            <YouTubeEmbed videoId="k7aQEqDbuf8" />
            <YouTubeEmbed videoId="NnKcquMobHQ" />
            <YouTubeEmbed videoId="ycDUU1n2iEE" />
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mt-8">
              Lex Friedman: Dana White: UFC, Fighting, Khabib, Conor, Tyson, Ali, Rogan, Elon & Zuck | Lex Fridman Podcast #421
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

export default GeneralNewsletter;