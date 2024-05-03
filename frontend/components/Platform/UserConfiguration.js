import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/UserConfiguration.module.css';
import creatorRecommendations from '../../data/creators.json';

const UserConfiguration = ({ userEmail }) => {
    const [keywords, setKeywords] = useState([]);
    const [multiMedia, setMultiMedia] = useState(false);
    const [creators, setCreators] = useState([]);
    const [inputKeyword, setInputKeyword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [filteredRecommendations, setFilteredRecommendations] = useState([]);
    const [removedCreators, setRemovedCreators] = useState([]);

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
      
      useEffect(() => {
        const fetchData = async () => {
            try {
                const configResponse = await axios.get(`/api/user-configurations/${userEmail}`);
                console.log("Fetched configuration:", configResponse.data);
                if (configResponse.data) {
                    setKeywords(configResponse.data.key_words || []);
                    setMultiMedia(configResponse.data.multi_media || false);
                    const creatorsArray = configResponse.data.creator_name.map((name, index) => ({
                        creator_name: name,
                        creator_link: configResponse.data.creator_link[index]
                    }));
                    setCreators(creatorsArray);
                } else {
                    setCreators([]); // Ensure to reset if no data is found
                }
            } catch (error) {
                console.error("Failed to fetch configuration", error);
                setCreators([]); // Ensure to reset on error
            }
        };
        fetchData();
    }, [userEmail]);
    

    const addCreator = () => {
        if (!searchTerm) return;
        const newCreator = {
            creator_name: searchTerm,
            creator_link: `https://www.youtube.com/@${searchTerm}`
        };
        setCreators(prev => [...prev, newCreator]);
        setSearchTerm('');  // Clear search field after adding
    };

    const removeCreator = (creatorToRemove) => {
        setCreators(prevCreators => prevCreators.filter(creator => creator !== creatorToRemove));
        setRemovedCreators(prevRemoved => [...prevRemoved, creatorToRemove]);
      };

      const saveConfiguration = async () => {
        try {
            await axios.post('/api/user-configurations/update', {
                email: userEmail,
                key_words: keywords,
                multi_media: multiMedia,
                creator_name: creators.map(creator => creator.creator_name),
                creator_link: creators.map(creator => creator.creator_link),
            });
            const response = await axios.get(`/api/user-configurations/${userEmail}`);
            if (response.data && response.data.creator_name) {
                const updatedCreators = response.data.creator_name.map((name, index) => ({
                    creator_name: name,
                    creator_link: response.data.creator_link[index]
                }));
                setCreators(updatedCreators);
            } else {
                setCreators([]); // Safeguard against non-array data
            }
            setRemovedCreators([]);
        } catch (error) {
            console.error('Failed to save changes:', error.response ? error.response.data.error : error.message);
            setCreators([]); // Reset to empty array on error
        }
    };
    

    return (
        <div className={styles.container}>
            <div>
            <h2 className={styles.title}>Creators</h2>
            <h2 className={styles.descrition}>Hello</h2>                
            <input
                    className={styles.searchInput}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowRecommendations(true)}
                    onBlur={() => {
                        // Delay hiding the recommendations to provide enough time for a click event to be processed
                        setTimeout(() => {
                            if (!document.activeElement.classList.contains(styles.recommendationItem)) {
                                setShowRecommendations(false);
                            }
                        }, 150);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchTerm) {
                            addCreator(searchTerm);
                            e.preventDefault();
                            setShowRecommendations(false);
                        }
                    }}
                    placeholder="Search creators..."
                />
                {showRecommendations && (
                <div className={styles.recommendationsContainer}>
                    {filteredRecommendations.map((creator, index) => (
                        <div
                            key={index}
                            className={styles.recommendationItem}
                            onMouseDown={() => recommendationSelected(creator)}
                        >
                            {creator}
                        </div>
                    ))}
                </div>
                )}
            <div className={styles.creatorsList}>
                {creators.map((creator, index) => (
                    <div key={index} className={styles.creatorItem}>
                        <span className={styles.creatorName}>{creator.creator_name}</span>
                        <a href={creator.creator_link} target="_blank" rel="noopener noreferrer" className={styles.creatorLink}>
                            {creator.creator_link}
                        </a>
                        <button onClick={() => setCreators(creators.filter(c => c !== creator))} className={styles.deleteButton}>
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            </div>
            <div>
            <h2 className={styles.title}>Keywords</h2>
            <h2 className={styles.descrition}>Hello</h2> 
                <div className={styles.keywordsContainer}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        value={inputKeyword}
                        onChange={(e) => setInputKeyword(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && inputKeyword) {
                                setKeywords([...keywords, inputKeyword]);
                                setInputKeyword('');
                                e.preventDefault();
                            }
                        }}
                        placeholder="Add a keyword"
                    />
                </div>
                <div className={styles.keywordsContainer}>
                {keywords.map((keyword, index) => (
                        <div key={index} className={styles.keyword}>
                            {keyword}
                            <button onClick={() => setKeywords(keywords.filter(k => k !== keyword))}>&times;</button>
                        </div>
                    ))}
                </div>
            </div>
            <h2 className={styles.title}>Advanced Recon</h2>
            <h2 className={styles.descrition}>Hello</h2> 
            <div className={styles.toggleContainer}>
                <label className={styles.switch}>
                    <input type="checkbox" checked={multiMedia} onChange={() => setMultiMedia(!multiMedia)} />
                    <span className={styles.slider}></span>
                </label>
                <span className={styles.toggleLabel}>007 Mode</span>
            </div>
        <div>
            <button className={styles.saveButton} onClick={saveConfiguration}>Save Changes</button>
        </div>
        </div>
    );
};

export default UserConfiguration;
