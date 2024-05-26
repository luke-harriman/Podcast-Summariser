import { fetchDataById } from '../../../lib/api';

export default async function handler(req, res) {
  const { videoId } = req.query;

  console.log('videoId:', videoId);
  
  try {
    const newsletter = await fetchDataById(videoId, 1);
    res.status(200).json(newsletter);
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ error: 'Failed to fetch newsletter' });
  }
}
