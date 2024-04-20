import Layout from '../../components/Platform/Layout';
import styles from '../../styles/agents.module.css';
import SearchBar from '../../components/Platform/SearchBar';
import creators from '../../data/creators.json'; 
import React, { useState } from 'react';
import searchBarStyles from '../../styles/searchbar.module.css'; // import the CSS module for SearchBar styling

const Agents = () => {
    const userEmail = 'luke.m.h.002@gmail.com';
  
    return (
        <Layout>
          <div className={styles.agentsContainer}>
            <h1 className={styles.heading}>Agent Settings</h1>
            <div className={styles.columnsContainer}>
              <div className={styles.column}>
                  <h2 className={styles.headingLarge}>Creators</h2>
                  <p className={styles.descriptionText}>
                    Manage your list of creators here. Add new creators or remove existing ones to tailor your agent's newsletters. To add new creators, insert the creator's youtube username (e.g joerogan, lexfridman or allin).
                  </p>
                  <SearchBar userEmail={userEmail} />
                  <div className={styles.componentSpacing}></div>
                  <h2 className={styles.headingLarge}>Configuration</h2>
              </div>
            </div>
          </div>
        </Layout>
      );
    };
    
    export default Agents;