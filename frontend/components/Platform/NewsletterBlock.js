// components/Platform/NewsletterBlock.js
import { useRouter } from 'next/router';

const NewsletterBlock = ({ newsletter }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/platform/${newsletter.videoId}`);
  };

  return (
    <div onClick={handleClick} className="newsletter-block">
      {newsletter.thumbnail ? (
        <img src={newsletter.thumbnail} alt="Newsletter Cover" className="thumbnail" />
      ) : (
        <p>No Image Available</p>
      )}
      <style jsx>{`
        .newsletter-block {
          cursor: pointer;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          overflow: hidden;
          transition: transform 0.2s;
          background: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .newsletter-block:hover {
          transform: translateY(-5px);
        }
        .thumbnail {
          width: 100%;
          height: auto;
          display: block;
        }
        p {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default NewsletterBlock;
