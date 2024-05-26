import { useState } from 'react';
import PricingCard from './PricingCard';
import { signIn, useSession } from 'next-auth/react';

const PricingPage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId) => {
    if (!session) {
      signIn();
      return;
    }

    setLoading(true);

    const res = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  const plans = [
    {
      plan: 'Agent Rookie: Free',
      price: '$0',
      features: ['2 podcasts', 'Pick and choose any podcast', 'Relevant charts', 'Access all your past newsletters'],
      isCurrentPlan: true,
    },
    {
      plan: 'Agent Rookie: $10/m',
      price: '$10',
      features: ['Unlimited podcasts', 'Video Chat', 'Pick and choose any podcast', 'Relevant charts, data tables and article headlines', 'Access all your past newsletters', 'Download as a PDF'],
      isCurrentPlan: false,
    },
  ];

  return (
    <div className="pricing-page">
      {plans.map((plan, index) => (
        <PricingCard
          key={index}
          plan={plan.plan}
          price={plan.price}
          features={plan.features}
          isCurrentPlan={plan.isCurrentPlan}
          onSubscribe={() => handleSubscribe(plan.priceId)}
        />
      ))}
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default PricingPage;
