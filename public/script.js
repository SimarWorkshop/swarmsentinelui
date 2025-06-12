const barCtx = document.getElementById("barChart").getContext("2d");
const pieCtx = document.getElementById("pieChart").getContext("2d");

let barChart = new Chart(barCtx, {
  type: "bar",
  data: {
    labels: ["Agent 1", "Agent 2", "Agent 3"],
    datasets: [{
      label: "Risk Level",
      data: [0, 0, 0],
      backgroundColor: ["#8b0000", "#002b5b", "#333333"] // Dark red, navy, steel
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
      backgroundColor: ["#6b0f1a", "#112d4e", "#2e2e2e"] // Muted dark red, deep navy, graphite
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

// Real-time data update
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

setInterval(async () => {
  try {
    const res = await fetch("https://your-render-url.com/api/swarm-data"); // Replace with your actual Render URL
    const json = await res.json();
    updateCharts(json);
  } catch (err) {
    console.error("Failed to fetch data", err);
  }
}, 5000);

document.querySelectorAll(".agent-card").forEach(card => {
  card.addEventListener("click", () => {
    const details = card.querySelector(".agent-details");
    if (details) {
      details.style.display = details.style.display === "block" ? "none" : "block";
    }
  });
});
