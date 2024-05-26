import { useSession, getSession, signIn } from "next-auth/react";
import Layout from '../../components/Platform/Layout';
import styles from '../../styles/pricing.module.css';
import PricingCard from '../../components/Platform/PricingCard';
import Modal from '../../components/Platform/Modal';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { query } from '../../utils/db';
import { FaPodcast, FaChartLine, FaInfinity, FaHistory } from 'react-icons/fa';
import { IoChatboxEllipses } from 'react-icons/io5';
import { RiDownloadCloudFill } from 'react-icons/ri';

const Pricing = ({ subscriptionStatus, periodEnd }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (session) {
      setUserEmail(session.user.email);
      setUserId(session.user.user_id);
      console.log(session.user);
    }
  }, [session]);

  const handleSubscribe = (priceId) => {
    if (!session) {
      signIn();
      return;
    }

    console.log(session);

    // Redirect to Stripe payment link
    window.location.href = `https://buy.stripe.com/cN23e5eeKb6F09y5kk?client_reference_id=${session.user.user_id}&success_url=${encodeURIComponent(window.location.origin + '/platform/pricing?session_id={CHECKOUT_SESSION_ID}')}&cancel_url=${encodeURIComponent(window.location.origin + '/platform/pricing')}`;
  };

  const handleCancel = async () => {
    if (!session) {
      signIn();
      return;
    }

    setModalOpen(true);
  };

  const confirmCancel = async () => {
    try {
      const response = await fetch('/api/stripe/cancel_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.user_id }),
      });

      if (response.ok) {
        console.log('Subscription cancelled');
        router.reload(); // Reload the page to reflect the updated subscription status
      } else {
        console.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setModalOpen(false);
    }
  };

  const plans = [
    {
      plan: 'Rookie:',
      price: 'Free',
      features: [
        { text: '2 podcasts', icon: <FaPodcast /> },
        { text: 'Pick and choose any podcast', icon: <FaPodcast /> },
        { text: 'Charts', icon: <FaChartLine /> },
        { text: 'Access all your past newsletters', icon: <FaHistory /> },
      ],
      isCurrentPlan: !subscriptionStatus || subscriptionStatus === 'free' || subscriptionStatus === 'cancelled',
      onSubscribe: handleCancel, // Handle cancelation when user clicks on free plan's subscribe button
    },
    {
      plan: 'Agent 007:',
      price: '$10 / month',
      features: [
        { text: 'Unlimited podcasts', icon: <FaInfinity /> },
        { text: 'Video Chat', icon: <IoChatboxEllipses /> },
        { text: 'Pick and choose any podcast', icon: <FaPodcast /> },
        { text: 'Charts, data tables and headlines', icon: <FaChartLine /> },
        { text: 'Access all your past newsletters', icon: <FaHistory /> },
        { text: 'Download as a PDF', icon: <RiDownloadCloudFill /> },
      ],
      isCurrentPlan: subscriptionStatus === 'paid',
      onSubscribe: () => handleSubscribe('price_1JH2Xs2eZvKYlo2CX9Yp9Ew1'), // Replace with actual Stripe price ID
    },
  ];

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You are not authenticated</p>;
  }

  return (
    <Layout>
      <div className={styles.pricingContainer}>
        <h1 className={styles.heading}>Agent Pricing</h1>
        <div className={styles.divider}></div>
        <div className={styles.cardsContainer}>
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan.plan}
              price={plan.price}
              features={plan.features}
              isCurrentPlan={plan.isCurrentPlan}
              onSubscribe={plan.onSubscribe}
            />
          ))}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmCancel}
        periodEnd={new Date(periodEnd).toLocaleDateString()}
      />
    </Layout>
  );
};

export default Pricing;

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
    'SELECT status, TO_TIMESTAMP(period_end) as period_end FROM subscriptions WHERE user_id = $1 AND status = $2',
    [session.user.user_id, 'paid']
  );
  
  const subscriptionData = res.rows[0] || { status: 'free', period_end: null };

  // Convert period_end to a string
  const periodEnd = subscriptionData.period_end ? subscriptionData.period_end.toISOString() : null;

  return {
    props: { subscriptionStatus: subscriptionData.status, periodEnd },
  };
}
