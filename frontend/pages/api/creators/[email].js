// pages/api/creators/[email].js
import { PrismaClient } from '@prisma/client';
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const email = req.query.email;
      const creator_lists = await prisma.creator_lists.findMany({
        where: { email: email },
        select: {
          creator_name: true,
          creator_link: true,
        },
      });

      res.status(200).json(creator_lists);
    } catch (error) {
      console.error('Request error', error);
      res.status(500).json({ error: 'Error fetching subscriptions', details: error.message });
    }
  } else {
    // Handle any other HTTP methods
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

