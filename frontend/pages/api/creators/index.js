// pages/api/creators/index.js
import { PrismaClient } from '@prisma/client';
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
    // Adding simple validation in update.js
    if (!email || !creatorsToAdd || !creatorsToRemove) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
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
