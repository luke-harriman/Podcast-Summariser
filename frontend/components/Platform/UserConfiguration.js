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

    useEffect(() => {
        if (searchTerm) {
            const filtered = creatorRecommendations.filter(creator =>
                creator.toLowerCase().startsWith(searchTerm.toLowerCase())
            ).slice(0, 5); // get first 5 matches
            setFilteredRecommendations(filtered);
        } else {
            setFilteredRecommendations(creatorRecommendations.slice(0, 5)); // show first 5 by default
        }
    }, [searchTerm, creatorRecommendations]);

    const handleFocus = () => {
        setShowRecommendations(true);
    };
    
    const handleBlur = () => {
        // Using a ref to track the focus status could be more reliable
        setTimeout(() => {
            if (!document.hasFocus()) {
                setShowRecommendations(false);
            }
        }, 150); // Adjust timing as necessary
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const configResponse = await axios.get(`/api/user-configurations/${userEmail}`);
                if (configResponse.data) {
                    setKeywords(configResponse.data.key_words || []);
                    setMultiMedia(configResponse.data.multi_media || false);
                    const creatorsArray = configResponse.data.creator_name.map((name, index) => ({
                        creator_name: name,
                        creator_link: configResponse.data.creator_link[index]
                    }));
                    setCreators(creatorsArray);
                }
            } catch (error) {
                console.error("Failed to fetch configuration", error);
            }
        };
        if (userEmail) {
            fetchData();
        }
    }, [userEmail]);

    const addCreator = (name) => {
        const newCreator = {
            creator_name: name,
            creator_link: `https://www.youtube.com/@${name}`
        };
        setCreators(prev => [...prev, newCreator]);
        setSearchTerm('');  // Clear search field after adding
    };

    const handleCreatorInputKeyPress = (e) => {
        if (e.key === 'Enter' && searchTerm) {
            addCreator(searchTerm);
            e.preventDefault(); // Prevent form submission on enter
            setShowRecommendations(false);
        }
    };

    const saveConfiguration = async () => {
        try {
            await axios.post(`/api/user-configurations/update`, {
                email: userEmail,
                key_words: keywords,
                multi_media: multiMedia,
                creator_name: creators.map(creator => creator.creator_name),
                creator_link: creators.map(creator => creator.creator_link),
            });
            console.log("Configuration saved successfully");
        } catch (error) {
            console.error("Failed to save configuration", error);
        }
    };

    return (
        <div className={styles.container}>
            <div>
                <h2>Creators Configuration</h2>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyPress={handleCreatorInputKeyPress}
                    placeholder="Search creators..."
                />
                {showRecommendations && (
                    <div className={styles.recommendationsContainer}>
                        {filteredRecommendations.map((creator, index) => (
                            <div
                                key={index}
                                className={styles.recommendationItem}
                                onMouseDown={() => {
                                    setSearchTerm(creator);
                                    setShowRecommendations(false);
                                    addCreator(creator);
                                }}
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
                <h2>Keywords Configuration</h2>
                <div className={styles.keywordsContainer}>
                    {keywords.map((keyword, index) => (
                        <div key={index} className={styles.keyword}>
                            {keyword}
                            <button onClick={() => setKeywords(keywords.filter(k => k !== keyword))}>&times;</button>
                        </div>
                    ))}
                    <input
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
            </div>
            <div>
                <label>
                    Include Multimedia:
                    <input
                        type="checkbox"
                        checked={multiMedia}
                        onChange={() => setMultiMedia(!multiMedia)}
                    />
                </label>
            </div>
            <button onClick={saveConfiguration}>Save Changes</button>
        </div>
    );
};

export default UserConfiguration;
