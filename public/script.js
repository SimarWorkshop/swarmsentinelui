const barCtx = document.getElementById("barChart").getContext("2d");
const pieCtx = document.getElementById("pieChart").getContext("2d");

let barChart = new Chart(barCtx, {
  type: "bar",
  data: {
    labels: ["Agent 1", "Agent 2", "Agent 3"],
    datasets: [{
      label: "Risk Level",
      data: [0, 0, 0],
      backgroundColor: ["#8b0000", "#002b5b", "#333333"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: "#bbb" },
        grid: { color: "#222" }
      },
      y: {
        ticks: { color: "#bbb" },
        grid: { color: "#222" }
      }
    }
  }
});

let pieChart = new Chart(pieCtx, {
  type: "pie",
  data: {
    labels: ["Public Buckets", "Unencrypted Buckets", "Compliant Buckets"],
    datasets: [{
      data: [1, 1, 1],
      backgroundColor: ["#6b0f1a", "#112d4e", "#2e2e2e"]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e0e0e0"
        }
      }
    }
  }
});

function updateCharts(data) {
  barChart.data.datasets[0].data = [
    data.agent1.risk_level || 0,
    data.agent2.risk_level || 0,
    data.agent3.risk_level || 0
  ];
  barChart.update();

  pieChart.data.datasets[0].data = [
    data.agent1.public_buckets || 0,
    data.agent1.unencrypted_buckets || 0,
    data.agent1.compliant_buckets || 0
  ];
  pieChart.update();

  ["agent1", "agent2", "agent3"].forEach(agent => {
    const section = document.getElementById(`${agent}-details`);
    if (section) {
      section.innerHTML = `<pre>${JSON.stringify(data[agent], null, 2)}</pre>`;
    }
  });
}

// --- WebSocket connection to backend
const socket = new WebSocket("wss://swarmsentinelui.onrender.com");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateCharts(data);
};

socket.onerror = (err) => {
  console.error("WebSocket error:", err);
};

socket.onclose = () => {
  console.warn("WebSocket disconnected. Attempting reconnection...");
};
