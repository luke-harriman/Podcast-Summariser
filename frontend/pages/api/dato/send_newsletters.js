import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { fetchData, fetchDataNewsletter } from '../../../lib/api';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

const prisma = new PrismaClient();

const sendNewsletterEmail = async (userEmail, newsletters) => {
  const jsonData = { newsletters: newsletters };
  fs.writeFileSync('/Users/lukeh/Desktop/python_projects/youtube_scraper/frontend/pages/api/test.json', JSON.stringify(jsonData, null, 2), 'utf8');

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: 'luke.m.h.002@gmail.com' },
      subject: 'It`s Sunday! Your Agent`s Newsletter is here.',
      personalizations: [
        {
          to: [{ email: userEmail }],
          dynamic_template_data: jsonData,
        },
      ],
      template_id: 'd-ab8e646682d44d5fa7a1c5d601bc70bb', // Replace with your actual SendGrid template ID
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email: ' + response.statusText);
  }
  const responseBody = await response.text();
  console.log(responseBody);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Fetching snapshots...');
    const snapshots = await prisma.weekly_user_configuration_snapshot.findMany({
      where: {
        snapshot_time: {
          gte: '2024-01-01T00:00:00Z',
        },
      },
    });

    for (const snapshot of snapshots) {
      console.log(`Processing snapshot for user ${snapshot.user_id}, ${snapshot.creator_name}, ${snapshot.key_words}, ${snapshot.snapshot_time} ${snapshot.multi_media}`);

      const newsletters = await fetchData(snapshot.user_id);
      console.log(newsletters)
      console.log(`Fetched ${newsletters.length} newsletters for user ${snapshot.email}`);
      await sendNewsletterEmail(snapshot.email, newsletters);
      console.log(`Email sent to ${snapshot.email}`);
    }

    res.status(200).json({ message: 'Newsletters sent successfully' });
  } catch (error) {
    console.error('Error sending newsletters:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}