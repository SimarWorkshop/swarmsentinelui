const express = require('express');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes (you can customize origin if needed)
app.use(cors());

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for all non-API routes (e.g., React routing)
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
