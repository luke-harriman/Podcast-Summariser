// pages/platform/[newsletterId].js
import Layout from '../../components/Platform/Layout';
import ImageGallery from '../../components/Platform/ImageGallery';
import { fetchDataById } from '../../lib/api';
import { parseText } from '../../lib/utils'; // Import the new utility function
import styles from '../../styles/newsletter.module.css'; // Import the new CSS module
import { useSession, getSession } from 'next-auth/react';

const NewsletterDetail = ({ newsletter }) => {
    if (!newsletter || newsletter.length === 0) {
        return <Layout><h1>No Newsletter Found</h1></Layout>;
    }

    return (
        <Layout>
            <div className={styles.container}>
                <h1 className={styles.title}>{newsletter[0].videoTitle}</h1>
                <div className={styles.infoContainer}>
                    <h2 className={styles.date}>
                        {new Date(newsletter[0].releaseDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h2>
                    <a 
                        href={`https://www.youtube.com/watch?v=${newsletter[0].videoId}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={styles.uploader}
                    >
                        Uploaded by {newsletter[0].uploaderName}
                    </a>
                </div>
                <div className={styles.chaptersContainer}>
                    {newsletter.sort((a, b) => a.startTime - b.startTime)
                        .map((chapter, index) => (
                            <div key={index} className={styles.chapter}>
                                <h2 className={styles.chapterTitle}>{chapter.chapterTitle}</h2>
                                <div className={styles.imageGalleryWrapper}>
                                    <ImageGallery images={chapter.graphs || []} />
                                </div>
                                {chapter.textBody.split('\n\n').slice(1).map((paragraph, idx) => (
                                    <p key={idx} className={styles.chapterText}>{parseText(paragraph)}</p>
                                ))}
                            </div>
                        ))}
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps(context) {
    const { params } = context;
    const session = await getSession(context);

    const cleanData = (data) => {
        return data.map(item => {
            const cleanedItem = {};
            Object.keys(item).forEach(key => {
                cleanedItem[key] = item[key] === undefined ? null : item[key];
            });
            return cleanedItem;
        });
    };

    const newsletterData = await fetchDataById(params.newsletterId, session.user.user_id);
    const newsletter = cleanData(newsletterData || []);
    return { props: { newsletter: newsletter } };
}

export default NewsletterDetail;
