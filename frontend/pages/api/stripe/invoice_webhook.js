import { buffer } from 'micro';
import stripe from '../../../utils/stripe';
import { query } from '../../../utils/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async (req, res) => {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;

    const subscriptionId = invoice.subscription;

    try {
      await query(
        'UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2',
        ['successful', subscriptionId]
      );
    } catch (error) {
      console.error('Error updating database:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.status(200).json({ received: true });
};
