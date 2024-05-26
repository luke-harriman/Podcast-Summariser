import React from 'react';

const YouTubeEmbed = ({ videoId }) => {
  return (
    <div className="youtube-embed-container">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen>
      </iframe>
    </div>
  );
};

export default YouTubeEmbed;
