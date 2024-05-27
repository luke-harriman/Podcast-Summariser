import { buffer } from 'micro';
import Stripe from 'stripe';
import { query } from '../../../utils/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export const config = {
  api: {
    bodyParser: false, // Disabling the default body parser to handle raw body
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async (req, res) => {
  console.log('Webhook called. Reading body...');
  const buf = await buffer(req); // Read the raw body
  const sig = req.headers['stripe-signature'];

  let event;
  console.log('Constructing event...');

  try {
    // Verify the event using the raw body and signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    console.log('Webhook verified successfully:', event);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session);

        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;
        const paymentStatus = session.payment_status;
        const createdAt = session.created;
        const email = session.customer_details.email;
        const paymentLink = session.payment_link;
        const invoiceId = session.invoice;
        const customerId = session.customer;
        const amount = session.amount_total;
        const currency = session.currency;

        try {
          await query(
            `INSERT INTO subscriptions (user_id, email, amount_total, currency, stripe_subscription_id, status, payment_link, invoice_id, customer_id, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (stripe_subscription_id)
             DO UPDATE SET 
                user_id = EXCLUDED.user_id,
                email = EXCLUDED.email,
                amount_total = EXCLUDED.amount_total,
                currency = EXCLUDED.currency,
                status = EXCLUDED.status,
                payment_link = EXCLUDED.payment_link,
                invoice_id = EXCLUDED.invoice_id,
                customer_id = EXCLUDED.customer_id,
                created_at = EXCLUDED.created_at`,
            [userId, email, amount, currency, subscriptionId, paymentStatus, paymentLink, invoiceId, customerId, createdAt]
          );
          console.log('Database updated successfully for checkout.session.completed');
        } catch (error) {
          console.error('Error updating database:', error);
          return res.status(500).send('Internal Server Error');
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log('Invoice payment succeeded:', invoice);

        const userId2 = 0;
        const invoiceSubscriptionId = invoice.subscription;
        const periodStart = invoice.period_start;
        const periodEnd = invoice.period_end;
        const status = invoice.status;

        try {
          await query(
            `INSERT INTO subscriptions (user_id, stripe_subscription_id, status, period_start, period_end)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (stripe_subscription_id)
             DO UPDATE SET 
                status = EXCLUDED.status,
                period_start = EXCLUDED.period_start,
                period_end = EXCLUDED.period_end`,
            [userId2, invoiceSubscriptionId, status, periodStart, periodEnd]
          );
          console.log('Database updated successfully for invoice.payment_succeeded');
        } catch (error) {
          console.error('Error updating database:', error);
          return res.status(500).send('Internal Server Error');
        }
        break;

        // Period Start and Period End aren't aren't updated in the database
        // Getting the following error: Error updating database: error: null value in column "user_id" of relation "subscriptions" violates not-null constraint

      // Handle other event types if necessary
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    res.status(500).send('Internal Server Error');
  }
};
