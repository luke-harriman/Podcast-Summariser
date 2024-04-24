// AgentConfiguration.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import styles from '../../styles/AgentConfiguration.module.css'; // Ensure you have the corresponding CSS file

const AgentConfiguration = ({ userEmail }) => {
    // Initialize state
    const [keywords, setKeywords] = useState([]);
    const [multiMedia, setMultiMedia] = useState(false);
    const [inputKeyword, setInputKeyword] = useState(''); // Initialize inputKeyword state

    // Fetch agent configuration on component mount
    useEffect(() => {
      const fetchAgentConfiguration = async () => {
        try {
          const response = await axios.get(`/api/agent-configurations/${userEmail}`);
          const config = response.data;
          setKeywords(config.key_words || []);
          setMultiMedia(config.multi_media || false);
        } catch (error) {
          console.error("Failed to fetch agent configuration", error);
        }
      };
  
      if (userEmail) {
        fetchAgentConfiguration();
      }
    }, [userEmail]);
  
    // Function to save the current state to the database
    const saveConfiguration = async () => {
      try {
        await axios.post(`/api/agent-configurations/update`, {
          email: userEmail,
          key_words: keywords,
          multi_media: multiMedia,
        });
        console.log("Configuration saved successfully");
      } catch (error) {
        console.error("Failed to save configuration", error);
      }
    };
  
  // Add keyword handler
  const addKeyword = () => {
    if (inputKeyword && !keywords.includes(inputKeyword)) {
      setKeywords([...keywords, inputKeyword]);
      setInputKeyword(''); // Clear the input field
    }
  };

  const handleKeywordSubmission = (event) => {
    if (event.key === 'Enter') {
      addKeyword(inputKeyword);
      setInputKeyword(''); // Reset input field
      event.preventDefault();
    }
  };

  // Remove keyword handler
  const removeKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  // Toggle multimedia handler
  const toggleMultiMedia = () => {
    setMultiMedia(!multiMedia);
  };

  // Handler for the input field
  const handleKeywordChange = (event) => setInputKeyword(event.target.value);

  // Handler for the add keyword button
  const handleAddKeyword = (event) => {
    event.preventDefault();
    addKeyword();
  };

  // Function to handle keyword addition on Enter key press
  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter' && inputKeyword.trim()) {
      addKeyword(inputKeyword.trim());
      setInputKeyword(''); // Clear the input after adding the keyword
      e.preventDefault(); // Prevent form submission
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Key word search</h2>
      <p className={styles.description}>
        Only include episodes with specific words in the title (e.g., AI, Start-Ups, Health, Plants, etc)
      </p>
      <div className={styles.keywordsContainer}>
        {keywords.map((keyword, index) => (
          <div key={index} className={styles.keyword}>
            {keyword}
            <button onClick={() => removeKeyword(keyword)} className={styles.removeButton}>&times;</button>
          </div>
        ))}
      </div>
      <div className={styles.inputContainer}>
        <input
          className={styles.keywordsInput}
          type="text"
          value={inputKeyword}
          onChange={handleKeywordChange}
          onKeyPress={handleKeywordKeyPress} // This function handles the enter key press to add a keyword
          placeholder="Add a keyword"
        />
      </div>
      <div className={styles.advancedRecon}>
        <h2 className={styles.title}>Advanced Recon</h2>
        <p className={styles.description}>
          Include images, data tables, and key headlines (e.g., Charts).
        </p>
        <div className={styles.toggleContainer}>
          <label className={styles.switch}>
            <input type="checkbox" checked={multiMedia} onChange={toggleMultiMedia} />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.toggleLabel}>007 Mode</span>
        </div>
      </div>
      <button className={styles.saveButton} onClick={saveConfiguration}>
        Save Changes
      </button>
    </div>
  );
  
          };

export default AgentConfiguration;
