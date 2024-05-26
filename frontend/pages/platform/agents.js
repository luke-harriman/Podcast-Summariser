import { useSession, getSession } from "next-auth/react";
import Layout from '../../components/Platform/Layout';
import styles from '../../styles/agents.module.css';
import UserConfiguration from '../../components/Platform/UserConfiguration'; // Import the new combined component
import React, { useEffect, useState } from 'react';
import { query } from '../../utils/db';

const Agents = ({ subscriptionStatus }) => {
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
            <div className={styles.divider}></div>
            <div className={styles.columnsContainer}>
                  {userEmail && <UserConfiguration userEmail={userEmail} subscriptionStatus={subscriptionStatus} />} 
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

        const res = await query(
          'SELECT status FROM subscriptions WHERE user_id = $1 AND status = $2',
          [session.user.user_id, 'paid']
        );
      
        const subscriptionStatus = res.rows[0] ? 'paid' : 'free';
      
        return {
          props: { session, subscriptionStatus },
        };
      }
