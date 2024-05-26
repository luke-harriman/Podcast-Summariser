// pages/api/testDatoCMS.js
import { buildClient } from '@datocms/cma-client-node';
import fetch from 'node-fetch';


export default async function handler(req, res) {
    const response = await fetch('https://graphql.datocms.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DATOCMS_API_KEY}`,  // Ensure your API token is securely stored
      },
      body: JSON.stringify({
        query: `
        {
            allArticles {
              id
              dateUploaded
              uploaderId
              uploaderName
              channelId
              videoId
              videoTitle
              chapterTitle
              graphs {
                id
                url
              }
              chapterTitle
              textBody
              _firstPublishedAt
            }
          }
        `
      }),
    });
  
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
  
    const data = await response.json(); // Correctly handle JSON parsing with await
    console.log(data);  // Now logging the actual data
    console.log(data.data.allArticles)
    
    // Send a response back to client (or you can do other server-side logic)
    res.status(200).json(data);
}