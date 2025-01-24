const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); // Import axios for making HTTP requests

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Optional: Parse JSON bodies
app.use(express.static(path.join(__dirname))); // Serve static files

// Proxy route for Yahoo Finance API
app.get('/api/finance/:symbol', async (req, res) => {
    const symbol = req.params.symbol; // Get the stock symbol from the request parameters
    try {
        const response = await axios.get(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}`);
        res.json(response.data); // Send the response data back to the client
    } catch (error) {
        console.error('Error fetching data from Yahoo Finance API:', error);
        res.status(500).send('Error fetching data from Yahoo Finance API');
    }
});

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html'); // Adjusted to serve index.html correctly
    res.sendFile(indexPath);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
