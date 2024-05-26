import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import CtaButton from '../../components/misc/CtaButton';
import SeoHead from '../../components/SeoHead';
import styles from '../../styles/newsletter.module.css'; // Import the CSS module
import ImageGallery from '../../components/Platform/ImageGallery'; // Import ImageGallery component

const StartUpsNewsletter = () => {
  const [newsletter, setNewsletter] = useState(null);
  const [videoId, setVideoId] = useState('vDr1983LIuo');

  useEffect(() => {
    const fetchNewsletter = async () => {
      try {
        const response = await fetch('/api/newsletter_hp/vDr1983LIuo'); // replace with actual videoId

        const fetchedNewsletter = await response.json();
        setNewsletter(fetchedNewsletter);
      } catch (error) {
        console.error('Error fetching start-ups newsletter:', error);
      }
    };

    fetchNewsletter();
  }, []);

  if (!newsletter) {
    return <Layout>Loading...</Layout>;
  }

  return (
    <>
      <SeoHead title="Start-Ups Newsletter" />
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="my-8">
            <CtaButton text="Free forever for 2 podcasts!" href="/signup" />
          </div>
          <h1 className="text-5xl font-bold text-center my-8">
            {newsletter[0].videoTitle}
          </h1>
          <div className={`max-w-3xl mx-auto text-center ${styles.chaptersContainer}`}>
            {newsletter.map((item, index) => (
              <div key={index} className={styles.chapter}>
                <h2 className={`text-2xl font-bold mt-8 ${styles.chapterTitle}`}>
                  {item.chapterTitle}
                </h2>
                <div className={styles.imageGalleryWrapper}>
                  <ImageGallery images={item.graphs || []} />
                </div>
                {item.textBody.split('\n\n').slice(1).map((paragraph, idx) => (
                  <p key={idx} className={styles.chapterText}>{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default StartUpsNewsletter;
