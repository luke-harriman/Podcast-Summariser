import React, { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import getScrollAnimation from '../utils/getScrollAnimation';
import ScrollAnimationWrapper from './Layout/ScrollAnimationWrapper';

const Examples = () => {
  const scrollAnimation = useMemo(() => getScrollAnimation(), []);
  const [newsletters, setNewsletters] = useState({
    startups: null,
    finance: null,
    generalknowledge: null,
  });

  useEffect(() => {
    const fetchNewsletters = async () => {
      try {
        const responseAllIn = await fetch('/api/newsletter_hp/vDr1983LIuo'); // replace with actual videoId
        const responseA16Z = await fetch('/api/newsletter_hp/Fw4p85jSfQc'); // replace with actual videoId
        const responseBG2 = await fetch('/api/newsletter_hp/oHYoSBixdPI'); // replace with actual videoId

        if (!responseAllIn.ok || !responseA16Z.ok || !responseBG2.ok) {
          throw new Error('Failed to fetch one or more newsletters');
        }

        const allInNewsletter = await responseAllIn.json();
        const a16ZNewsletter = await responseA16Z.json();
        const BG2Newsletter = await responseBG2.json();

        setNewsletters({
          allin: allInNewsletter,
          a16z: a16ZNewsletter,
          bg2: BG2Newsletter,
        });
      } catch (error) {
        console.error('Error fetching newsletters:', error);
      }
    };

    fetchNewsletters();
  }, []);

  const getThumbnailUrl = (newsletter) => {
    return newsletter[0]?.thumbnail?.url || 'default-thumbnail-url.jpg'; // Replace with a default thumbnail URL if needed
  };

  return (
    <>
      <div className="text-center my-8" id="examples">
        <ScrollAnimationWrapper>
          <motion.h2
            variants={scrollAnimation}
            className="text-4xl font-bold"
          >
            Customize Your Newsletter
          </motion.h2>
          <motion.p
            variants={scrollAnimation}
            className="text-md mt-4"
          >
            Customize your newsletter with whatever creators you enjoy listening to or just chose from pre-existing ones to suit your interests.
          </motion.p>
        </ScrollAnimationWrapper>
      </div>
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-4 pb-20">
        {Object.keys(newsletters).map((key, index) => {
          const newsletter = newsletters[key];
          if (!newsletter) return null;
          return (
            <ScrollAnimationWrapper key={index}>
              <motion.div variants={scrollAnimation} className="h-full">
                <Link href={`/newsletter/${key}`} legacyBehavior>
                  <a className="block h-full rounded-lg hover:shadow-lg transition-shadow border border-gray-200 shadow-md hover:shadow-xl">
                    <div className="flex flex-col h-full items-center bg-white rounded-lg overflow-hidden">
                      <img
                        src={getThumbnailUrl(newsletter)}
                        alt={`${newsletter[0].videoTitle} Thumbnail`}
                        className="w-full h-auto object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-center text-gray-600">
                          {newsletter[0].videoTitle}
                        </h3>
                      </div>
                    </div>
                  </a>
                </Link>
              </motion.div>
            </ScrollAnimationWrapper>
          );
        })}
      </div>
      <style jsx>{`
        .block {
          transition: transform 0.3s ease-in-out;
        }
        .block:hover {
          transform: scale(1.05);
        }
        .block, .block > div {
          height: 100%;
        }
      `}</style>
    </>
  );
};

export default Examples;
