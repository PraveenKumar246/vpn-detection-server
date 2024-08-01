const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

const IPQUALITYSCORE_API_KEY = 'Nwgfa6UlE0FSjAf4rDr3A0UvZdvmtCzR'; 

app.use(cors()); 

app.get('/api/vpn-status', async (req, res) => {
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const API_URL = `https://ipqualityscore.com/api/json/ip/${IPQUALITYSCORE_API_KEY}/${userIp}`;

  console.log(`Fetching data from: ${API_URL}`);

  try {
    const response = await axios.get(API_URL);
    console.log('API Response:', response.data);  // Log the API response
    const data = response.data;
    const isUsingVPN = data.proxy;
    res.json({ isUsingVPN });
  } catch (error) {
    console.error('Error fetching VPN status:', error.response ? error.response.data : error.message);
    res.status(500).json({ isUsingVPN: false });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
