import { useState, useEffect } from 'react';
import styles from '../../styles/imagegallery.module.css';

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextClick();
      } else if (e.key === 'ArrowLeft') {
        handlePrevClick();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={styles.gallery}>
      <button className={styles.arrow} onClick={handlePrevClick}>&lt;</button>
      <div className={styles.imageContainer}>
        <img 
          src={images[currentIndex].url} 
          alt={`Image ${currentIndex + 1}`} 
          className={styles.image}
          onClick={() => handleImageClick(images[currentIndex].url)}
        />
        {images[currentIndex].caption && <div className={styles.caption}>{images[currentIndex].caption}</div>}
      </div>
      <button className={styles.arrow} onClick={handleNextClick}>&gt;</button>
      
      {selectedImage && (
        <div className={styles.lightbox} onClick={handleClose}>
          <img src={selectedImage} alt="Selected" className={styles.lightboxImage} />
        </div>
      )}
      <div className={styles.indicators}>
        {images.map((_, index) => (
          <span key={index} className={`${styles.dot} ${currentIndex === index ? styles.active : ''}`} />
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
