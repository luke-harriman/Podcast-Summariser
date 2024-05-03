import { useSession, getSession } from "next-auth/react";
import Layout from '../../components/Platform/Layout';
import styles from '../../styles/agents.module.css';
import UserConfiguration from '../../components/Platform/UserConfiguration'; // Import the new combined component
import React, { useEffect, useState } from 'react';

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
            <h1 className={styles.heading}>User Settings</h1> 
            <div className={styles.columnsContainer}>
              <div className={styles.column}>
                  <h2 className={styles.headingLarge}>Configuration</h2>
                  <p className={styles.descriptionText}>
                    Manage all your settings here. Update your keywords, multimedia preferences, and creators in one place.
                  </p>
                  {userEmail && <UserConfiguration userEmail={userEmail} />} 
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
