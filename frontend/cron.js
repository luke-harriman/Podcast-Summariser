// cron.js
const cron = require('node-cron');
const fetch = require('node-fetch');

cron.schedule('* * * * *', async () => { // Runs every Sunday at midnight
  await fetch('http://localhost:3000/api/send-newsletters', {
    method: 'POST'
  });
});
