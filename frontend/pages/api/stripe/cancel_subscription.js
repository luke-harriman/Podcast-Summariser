import { query } from '../../../utils/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  try {
    const result = await query('SELECT stripe_subscription_id FROM subscriptions WHERE user_id = $1 AND status = $2', [userId, 'paid']);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const stripeSubscriptionId = result.rows[0].stripe_subscription_id;

    await stripe.subscriptions.cancel(stripeSubscriptionId);

    await query('UPDATE subscriptions SET status = $1 WHERE user_id = $2', ['cancelled', userId]);

    // Fetch the current user configuration
    const userConfig = await query('SELECT * FROM user_configurations WHERE email = (SELECT distinct email FROM users WHERE user_id = $1)', [userId]);

    if (userConfig.rows.length) {
      const currentConfig = userConfig.rows[0];
      const limitedCreators = currentConfig.creator_name.slice(0, 2);
      const limitedLinks = currentConfig.creator_link.slice(0, 2);

      await query(
        'UPDATE user_configurations SET creator_name = $1, creator_link = $2 WHERE email = $3',
        [limitedCreators, limitedLinks, currentConfig.email]
      );
    }

    return res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

