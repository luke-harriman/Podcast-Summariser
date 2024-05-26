import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/searchbar.module.css';
import creatorRecommendations from '../../data/creators.json'; // path to your JSON file with recommendations


const SearchBar = ({ userEmail }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [creators, setCreators] = useState([]);
    const [removedCreators, setRemovedCreators] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  
    useEffect(() => {
        const fetchCreators = async () => {
          try {
            const response = await axios.get(`/api/creators/${userEmail}`);
            console.log("Fetched creators:", response.data);
            setCreators(response.data || []);
          } catch (error) {
            console.error("Failed to fetch creators", error);
          }
        };
    
        fetchCreators();
      }, [userEmail]);
    
      // This useEffect should NOT be nested inside another.
      useEffect(() => {
        if (searchTerm) {
          const filtered = creatorRecommendations.filter((creator) =>
            creator.toLowerCase().startsWith(searchTerm.toLowerCase())
          ).slice(0, 5); // get first 5 matches
          setFilteredRecommendations(filtered);
        } else {
          setFilteredRecommendations(creatorRecommendations.slice(0, 5)); // show first 5 recommendations by default
        }
      }, [searchTerm]);

  const addCreator = () => {
    if (!searchTerm) return;
    const newCreator = {
      creator_name: searchTerm,
      creator_link: `https://www.youtube.com/@${searchTerm}`,
      isNew: true,  // Mark as new for identification
    };
  
    setCreators(prevCreators => [...prevCreators, newCreator]);
    setSearchTerm('');
  };

  const removeCreator = (creatorToRemove) => {
    setCreators(prevCreators => prevCreators.filter(creator => creator !== creatorToRemove));
    setRemovedCreators(prevRemoved => [...prevRemoved, creatorToRemove]);
  };

  const saveChanges = async () => {
    try {
      await axios.post('/api/creators/update', {
        email: userEmail,
        creatorsToAdd: creators.filter(creator => creator.isNew),
        creatorsToRemove: removedCreators,
      });
      const response = await axios.get(`/api/creators/${userEmail}`);
      setCreators(response.data || []);
      setSearchTerm('');
      setRemovedCreators([]);  // Reset removed creators after update
    } catch (error) {
      console.error('Failed to save changes:', error.response ? error.response.data.error : error.message);
    }
  };

  return (
    <div className={styles.searchBarContainer}>
      <div className={styles.searchAndButtonsContainer}>
        <input
          className={styles.searchInput}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowRecommendations(true)}
          onBlur={() => setTimeout(() => setShowRecommendations(false), 100)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              addCreator();
              e.preventDefault(); // Prevent the default action to avoid form submission
            }
          }}
          placeholder="Search creators..."
        />
        <div className={styles.buttonsContainer}>
          <button className={styles.addButton} onClick={addCreator}>Add</button>
          <button className={styles.saveButton} onClick={saveChanges}>Save Changes</button>
        </div>
        {showRecommendations && (
          <div className={styles.recommendationsContainer}>
            {filteredRecommendations.map((creator, index) => (
              <div
                key={index}
                className={styles.recommendationItem}
                onMouseDown={() => {
                  setSearchTerm(creator);
                  setShowRecommendations(false);
                }}
              >
                {creator}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.divider}></div>
      <div className={styles.creatorsList}>
        {creators.map((creator, index) => (
        <div key={index} className={styles.creatorItem}>
            <span className={styles.creatorName}>{creator.creator_name}</span>
            <a
            href={creator.creator_link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creatorLink}
            >
            {creator.creator_link}
            </a>
            <button className={styles.removeButton} onClick={() => removeCreator(creator)}>
            <span className={styles.removeIcon}>✖</span>
            </button>
        </div>
        ))}
      </div>
    </div>

  );
        };  
export default SearchBar;
