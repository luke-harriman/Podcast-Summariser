// pages/api/send-newsletters.js
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import { fetchData } from '../../lib/api';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const sendNewsletterEmail = async (userEmail, newsletters) => {
  const dataExample = {
    newsletters: newsletters.map(newsletter => ({
      videoTitle: newsletter.videoTitle,
      releaseDate: new Date(newsletter.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      videoId: newsletter.videoId,
      thumbnail: newsletter.thumbnail,
      chapterTitle: newsletter.chapterTitle,
      graphs: newsletter.graphs ? newsletter.graphs.map(graph => ({ url: graph.url })) : [],
      textBody: newsletter.textBody
    }))
  };

  const filePath = path.join(process.cwd(), 'pages', 'api', 'test.json');
  fs.writeFileSync(filePath, JSON.stringify(dataExample, null, 2), 'utf8');

  console.log(dataExample);
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: { email: 'luke.m.h.002@gmail.com' },
      personalizations: [
        {
          to: [{ email: userEmail }],
          dynamic_template_data: {
            newsletters: newsletters.map(newsletter => ({
              videoTitle: newsletter.videoTitle,
              releaseDate: new Date(newsletter.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              videoId: newsletter.videoId,
              thumbnail: newsletter.thumbnail,
              chapterTitle: newsletter.chapterTitle,
              graphs: newsletter.graphs ? newsletter.graphs.map(graph => ({ url: graph.url })) : [],
              textBody: newsletter.textBody
            }))
          }
        }
      ],
      template_id: 'd-bd1c2ae96e82457fbdcace12dfbd222a' // Replace with your actual SendGrid template ID
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send email: ' + response.statusText);
  }
};

const getNewslettersForUser = async (userId) => {
  return await fetchData(userId);
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
          gte: new Date(new Date().setDate(new Date().getDate() - 20))
        }
      }
    });

    console.log(`Found ${snapshots.length} snapshots.`);
    for (const snapshot of snapshots) {
      console.log(`Processing snapshot for user ${snapshot.user_id}`);
      const newsletters = await getNewslettersForUser(snapshot.user_id);
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
