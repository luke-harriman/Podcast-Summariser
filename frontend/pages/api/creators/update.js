// pages/api/creators/update.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, creatorsToAdd, creatorsToRemove } = req.body;
    try {
      // Handle removals
      await Promise.all(creatorsToRemove.map(creator =>
        prisma.creator_lists.deleteMany({
          where: {
            email: email,
            creator_name: creator.creator_name,
          }
        })
      ));

      // Handle additions
      await Promise.all(creatorsToAdd.map(creator =>
        prisma.creator_lists.create({
          data: {
            email: email,
            creator_name: creator.creator_name,
            creator_link: creator.creator_link,
          }
        })
      ));

      res.status(200).json({ message: 'Updates successfully processed' });
    } catch (error) {
      console.error('Request error', error);
      res.status(500).json({ error: 'Error updating subscriptions', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
