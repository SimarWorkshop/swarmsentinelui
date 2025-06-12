const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const server = app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("WebSocket connected:", clients.length);

  ws.on("close", () => {
    clients = clients.filter((c) => c !== ws);
    console.log("WebSocket disconnected:", clients.length);
  });
});

app.post("/send-alert", (req, res) => {
  const alertData = req.body;

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(alertData));
    }
  });

  res.status(200).json({ status: "Delivered to WebSocket clients" });
});
