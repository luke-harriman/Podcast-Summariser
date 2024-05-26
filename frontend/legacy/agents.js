import { useSession, getSession } from "next-auth/react";
import Layout from '../../components/Platform/Layout';
import styles from '../../styles/agents.module.css';
import SearchBar from '../../components/Platform/SearchBar';
import AgentConfiguration from '../../components/Platform/AgentConfiguration';
import React, { useEffect, useState } from 'react';
import searchBarStyles from '../../styles/searchbar.module.css';

const Agents = () => {
    const { data: session, status } = useSession();
    const [userEmail, setUserEmail] = useState('');
  
    useEffect(() => {
      if (session) {
        setUserEmail(session.user.email);
      }
    }, [session]);

    useEffect(() => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
      }, [session]);
  
    if (status === "loading") {
      return <p>Loading...</p>;
    }
  
    if (status === "unauthenticated") {
      return <p>You are not authenticated</p>;
    }
  
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
                  {userEmail && <SearchBar userEmail={userEmail} />}
                  <h2 className={styles.headingLarge}>Configuration</h2>
                  {userEmail && <AgentConfiguration userEmail={userEmail} />}
              </div>
            </div>
          </div>
        </Layout>
      );
    };
    
    export default Agents;

    export async function getServerSideProps(context) {
        const session = await getSession(context);
      
        if (!session) {
          return {
            redirect: {
              destination: '/login',
              permanent: false,
            },
          };
        }
      
        return {
          props: { session },
        };
      }