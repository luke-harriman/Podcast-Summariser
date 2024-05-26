import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, key_words, multi_media } = req.body;


  try {
    // Using raw SQL to execute a MERGE statement in PostgreSQL 15
    const mergeResult = await prisma.$executeRawUnsafe(`
      MERGE INTO agent_configurations AS a
      USING (SELECT $1::text AS email, $2::text[] AS key_words, $3::boolean AS multi_media) AS b
      ON a.email = b.email
      WHEN MATCHED THEN
        UPDATE SET 
          key_words = b.key_words,
          multi_media = b.multi_media
      WHEN NOT MATCHED THEN
        INSERT (email, key_words, multi_media)
        VALUES (b.email, b.key_words, b.multi_media);
    `, email, key_words, multi_media); // Ensure the data types match your schema

    if (mergeResult) {
      res.status(200).json({ message: 'Configuration updated' });
    } else {
      throw new Error('Merge operation did not succeed.');
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating agent configuration', details: error.message });
  }
}
