import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../styles/userconfiguration.module.css';
import creatorRecommendations from '../../data/creators.json';

const UserConfiguration = ({ userEmail, subscriptionStatus }) => {
    const [keywords, setKeywords] = useState([]);
    const [multiMedia, setMultiMedia] = useState(false);
    const [creators, setCreators] = useState([]);
    const [inputKeyword, setInputKeyword] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [filteredRecommendations, setFilteredRecommendations] = useState([]);
    const [removedCreators, setRemovedCreators] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [success, setSuccess] = useState(false); // Success message state

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

    const addCreator = (creatorName) => {
        if (!creatorName) return;

        // Check if the user is on the free tier and has more than 2 creators
        if (subscriptionStatus === 'free' && creators.length >= 2) {
            setError('Subscribe to premium to add unlimited creators');
            return;
        }

        if (creators.some(creator => creator.creator_name.toLowerCase() === creatorName.toLowerCase())) {
            setError('Creator already added');
            return;
        }
        const newCreator = {
            creator_name: creatorName,
            creator_link: `https://www.youtube.com/@${creatorName}`
        };
        setCreators(prev => [...prev, newCreator]);
        setSearchTerm('');  // Clear search field after adding
        setError('');  // Clear error after successful add
    };

    const removeCreator = (creatorToRemove) => {
        setCreators(prevCreators => prevCreators.filter(creator => creator !== creatorToRemove));
        setRemovedCreators(prevRemoved => [...prevRemoved, creatorToRemove]);
    };

    const saveConfiguration = async () => {
        setLoading(true); // Show loading animation
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
            setSuccess(true); // Show success message
            setTimeout(() => setSuccess(false), 4000); // Hide success message after 4 seconds
        } catch (error) {
            console.error('Failed to save changes:', error.response ? error.response.data.error : error.message);
            setCreators([]); // Reset to empty array on error
        } finally {
            setLoading(false); // Hide loading animation
        }
    };

    return (
        <div className={styles.container}>
            {loading && <div className={styles.loadingOverlay}>Saving...</div>}
            {success && <div className={styles.successMessage}>Saved</div>}
            <div>
                <h2 className={styles.title}>Creators</h2>
                <h2 className={styles.description}>Manage your list of creators here. Add new creators or remove existing ones to tailor your agent's newsletters. To add new creators, insert the creator's youtube username (e.g joerogan, lexfridman or allin).</h2>
                <div className={styles.divider}></div>
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
                                addCreator(searchTerm);
                                e.preventDefault(); // Prevent the default action to avoid form submission
                            }
                        }}
                        placeholder="Search creators..."
                    />
                    {error && <div className={styles.error}>{error}</div>}
                    {showRecommendations && (
                        <div className={styles.recommendationsContainer}>
                            {filteredRecommendations.map((creator, index) => (
                                <div
                                    key={index}
                                    className={styles.recommendationItem}
                                    onMouseDown={() => {
                                        addCreator(creator);
                                        setShowRecommendations(false);
                                    }}
                                >
                                    {creator}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.creatorsList}>
                    {creators.map((creator, index) => (
                        <div key={index} className={styles.creatorItem}>
                            <span className={styles.creatorName}>{creator.creator_name}</span>
                            <a href={creator.creator_link} target="_blank" rel="noopener noreferrer" className={styles.creatorLink}>
                                {creator.creator_link}
                            </a>
                            <button onClick={() => removeCreator(creator)} className={styles.deleteButton}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h2 className={styles.title}>Keywords</h2>
                <h2 className={styles.description}>Only include episodes with specific words in the title (e.g., AI, Start-Ups, Health, Plants, etc)</h2>
                <div className={styles.divider}></div>
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
            <h2 className={styles.description}>Include images, data tables, and key headlines (e.g., Charts).</h2>
            <div className={styles.toggleContainer}>
                <label className={styles.switch}>
                    <input type="checkbox" checked={multiMedia} onChange={() => setMultiMedia(!multiMedia)} />
                    <span className={styles.slider}></span>
                </label>
                <span className={styles.toggleLabel}>007 Mode</span>
            </div>
            <div>
                <button className={styles.saveButton} onClick={saveConfiguration} disabled={loading}>Save Changes</button>
            </div>
        </div>
    );
};

export default UserConfiguration;
