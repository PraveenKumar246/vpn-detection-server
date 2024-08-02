const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const port = 5000;

const IPQUALITYSCORE_API_KEY = 'Nwgfa6UlE0FSjAf4rDr3A0UvZdvmtCzR';
const JWT_SECRET = 'your_jwt_secret'; // Replace with your secret
const USERS = [
    { username: 'user1', password: bcrypt.hashSync('password1', 8) }, // Predefined users for example
    { username: 'user2', password: bcrypt.hashSync('password2', 8) }
];

app.use(cors());
app.use(express.json());

// Authentication endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = USERS.find(user => user.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err){
          console.log(err)
          return res.status(500).json({ error: 'Failed to authenticate token' });
        }
        req.username = decoded.username;
        next();
    });
}

app.get('/api/vpn-status', verifyToken, async (req, res) => {
    const userIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress)?.split(',')[0]?.trim();

    try {
        // Request to IPQualityScore API
        const response = await axios.get(`https://ipqualityscore.com/api/json/ip/${IPQUALITYSCORE_API_KEY}/${userIp}`);
        const data = response.data;

        const isUsingVPN = data.vpn;
        const isProtonVPN = data.ISP && data.ISP.includes('ProtonVPN');

        if (isUsingVPN && isProtonVPN) {
            res.json({ isUsingVPN: true, isProtonVPN: true, username: req.username });
        } else {
            res.status(403).json({ isUsingVPN: false, isProtonVPN: false });
        }
    } catch (error) {
        console.error('Error fetching VPN status:', error);
        res.status(500).json({ error: 'Error fetching VPN status' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
