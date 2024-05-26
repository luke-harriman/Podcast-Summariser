import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const email = req.query.email;


  try {
    const configuration = await prisma.agent_configurations.findUnique({
      where: { email },
    });

    res.status(200).json(configuration || {});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching agent configuration', details: error.message });
  }
}
