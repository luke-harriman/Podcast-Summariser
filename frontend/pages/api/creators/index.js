// pages/api/creators/index.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { email, creator_name, creator_link } = req.body;
      const newSubscription = await prisma.creator_lists.create({
        data: {
          email: email,
          creator_name,
          creator_link,
        },
      });

      res.status(200).json(newSubscription);
    } catch (error) {
      console.error('Request error', error);
      res.status(500).json({ error: 'Error adding subscription', details: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
