const barCtx = document.getElementById("barChart").getContext("2d");
const pieCtx = document.getElementById("pieChart").getContext("2d");

let agentMessageCounts = {
  agent1: 0,
  agent2: 0,
  agent3: 0
};

let barChart = new Chart(barCtx, {
  type: "bar",
  data: {
    labels: ["Threat Detector", "IAM Analyzer", "S3 Security Analyzer"],
    datasets: [{
      label: "Risk Count",
      data: [0, 0, 0],
      backgroundColor: ["#8b0000", "#002b5b", "#333333"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#bbb" }, grid: { color: "#222" } },
      y: { ticks: { color: "#bbb" }, grid: { color: "#222" } }
    }
  }
});

let pieChart = new Chart(pieCtx, {
  type: "pie",
  data: {
    labels: ["Threat Detector", "IAM Analyzer", "S3 Security Analyzer"],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ["#6b0f1a", "#112d4e", "#2e2e2e"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#e0e0e0" }
      }
    }
  }
});

function detectAgent(flatData) {
  if (flatData.public_buckets !== undefined) return "agent1";
  if (flatData.summary && flatData.suggestions) return "agent2";
  if (flatData.bucketAnalysis) return "agent3";
  return null;
}

function updateCharts(flatData, agent) {
  if (!agent) return;

  // Increment message count
  agentMessageCounts[agent]++;
  const idx = { agent1: 0, agent2: 1, agent3: 2 }[agent];

  // Update bar chart (risk count per agent)
  barChart.data.datasets[0].data[idx] = agentMessageCounts[agent];
  barChart.update();

  // Update pie chart (message count per agent)
  pieChart.data.datasets[0].data = [
    agentMessageCounts.agent1,
    agentMessageCounts.agent2,
    agentMessageCounts.agent3
  ];
  pieChart.update();

  // Append incoming data to the appropriate agent section
  const section = document.getElementById(`${agent}-details`);
  if (section) {
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(flatData, null, 2);
    section.appendChild(pre);
    section.scrollTop = section.scrollHeight;
  }
}

// WebSocket connection
const socket = new WebSocket("wss://swarmsentinelui.onrender.com");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const agent = detectAgent(data);
  updateCharts(data, agent);
};

socket.onerror = (err) => console.error("WebSocket error:", err);
socket.onclose = () => console.warn("WebSocket disconnected.");
