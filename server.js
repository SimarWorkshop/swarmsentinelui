const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

let swarmData = {
  agent1: {},
  agent2: {},
  agent3: {}
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint for frontend polling
app.get('/api/swarm-data', (_req, res) => {
  res.json(swarmData);
});

// Endpoint for Lambda or Postman to push updates
app.post('/api/swarm-data', (req, res) => {
  const newData = req.body;
  if (newData.agent1 && newData.agent2 && newData.agent3) {
    swarmData = newData;
    res.json({ message: "Data received successfully" });
  } else {
    res.status(400).json({ error: "Missing agent data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
