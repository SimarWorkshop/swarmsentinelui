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
      data: [0, 0, 0],
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

function normalizeRiskLevel(level) {
  switch ((level || "").toLowerCase()) {
    case "high": return 1;
    case "medium": return 0.5;
    case "low": return 0.25;
    default: return 0;
  }
}

function updateCharts(flatData, sourceAgent) {
  // Default agent data object
  const data = {
    agent1: {
      risk_level: 0,
      public_buckets: 0,
      unencrypted_buckets: 0,
      compliant_buckets: 0
    },
    agent2: {
      risk_level: 0
    },
    agent3: {
      risk_level: 0
    }
  };

  // Inject incoming flat data into appropriate agent
  if (sourceAgent === "agent1") {
    data.agent1 = {
      ...data.agent1,
      ...flatData,
      risk_level: normalizeRiskLevel(flatData.riskLevel)
    };

    // Optionally use public/unencrypted/compliant buckets if present
    if ("public_buckets" in flatData) data.agent1.public_buckets = flatData.public_buckets;
    if ("unencrypted_buckets" in flatData) data.agent1.unencrypted_buckets = flatData.unencrypted_buckets;
    if ("compliant_buckets" in flatData) data.agent1.compliant_buckets = flatData.compliant_buckets;

  } else if (sourceAgent === "agent2") {
    data.agent2 = {
      ...flatData,
      risk_level: normalizeRiskLevel(flatData.riskLevel)
    };
  } else if (sourceAgent === "agent3") {
    data.agent3 = {
      ...flatData,
      risk_level: normalizeRiskLevel(flatData.riskLevel)
    };
  }

  // Update charts
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

  // Update detail sections
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
  const incoming = JSON.parse(event.data);

  // --- Add your detection logic here ---
  let sourceAgent = "agent2"; // ← hardcoded for now, update as needed

  // Example: Detect by payload keys
  if (incoming.hasOwnProperty("public_buckets")) {
    sourceAgent = "agent1";
  } else if (incoming.summary && incoming.suggestions) {
    sourceAgent = "agent2";
  } else if (incoming.hasOwnProperty("bucketAnalysis")) {
    sourceAgent = "agent3";
  }

  updateCharts(incoming, sourceAgent);
};

socket.onerror = (err) => {
  console.error("WebSocket error:", err);
};

socket.onclose = () => {
  console.warn("WebSocket disconnected. Attempting reconnection...");
};
