import React from 'react';

const YouTubeEmbed = ({ videoId }) => {
    return (
      <div className="w-full sm:w-1/3 px-2 mb-4">
        {/* Assuming you are using iframe to embed YouTube videos */}
        <iframe 
          width="100%"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allowFullScreen>
        </iframe>
      </div>
    );
  };
  
  export default YouTubeEmbed;