import React from 'react';
import Layout from '../components/Layout/Layout';
import SeoHead from '../components/SeoHead';

const FAQ = () => {
  return (
    <>
      <SeoHead title="FAQ" />
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
          <h1 className="text-5xl font-bold text-center my-8">Frequently Asked Questions</h1>
          <div className="max-w-3xl mx-auto text-left">
            <h2 className="text-2xl font-bold mt-8">What is the Agents Newsletter?</h2>
            <p className="mt-4">
              The Agents Newsletter is a newsletter that allows users to configure an AI agent to summarize YouTube podcasts. These newsletters can then be read on the platform page. 
            </p>

            <h2 className="text-2xl font-bold mt-8">How many podcasts can I include in my newsletter for free?</h2>
            <p className="mt-4">
              You can include summaries for up to 2 youtube podcasts in your newsletter for free.
            </p>

            <h2 className="text-2xl font-bold mt-8">What is the cost if I want newsletters for more than 2 podcasts?</h2>
            <p className="mt-4">
              If you want to get newsletters for an unlimited number of podcasts, it costs $9.99 per month.
            </p>

            <h2 className="text-2xl font-bold mt-8">Can I customize which podcasts are included in my newsletter?</h2>
            <p className="mt-4">
              Yes, you can customize your newsletter by selecting which YouTube podcasts you want the AI agent to summarize. These configuration settings are on the 'Agents' section of platform page.
            </p>

            <h2 className="text-2xl font-bold mt-8">How often are the newsletters sent?</h2>
            <p className="mt-4">
              The newsletters are sent out weekly, summarizing the latest episodes from your selected podcasts.
            </p>

            <h2 className="text-2xl font-bold mt-8">Can I change my podcast selections after signing up?</h2>
            <p className="mt-4">
              Yes, you can change your podcast selections at any time by logging into your account and updating your preferences on the 'Agents' page.
            </p>

            <h2 className="text-2xl font-bold mt-8">How do I cancel my subscription?</h2>
            <p className="mt-4">
              You can cancel your subscription at any time by logging into your account and navigating to the 'Pricing' page. Then, click 'Subscribe' on the free plan.
            </p>

            <h2 className="text-2xl font-bold mt-8">What happens if I cancel my subscription?</h2>
            <p className="mt-4">
              If you cancel your subscription, you will continue to receive newsletters for the remainder of your billing period. After that, your account will revert to the free plan, which includes summaries for up to 2 podcasts.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default FAQ;
