async function updateStatus() {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id"); // ?id=aegis-xxxxx

  if (!id) return;

  try {
    const res = await fetch(`https://aegis-backend-gwu4.onrender.com/status?id=${id}`);
    const data = await res.json();

    const el = document.getElementById("status");

    if (data.status === "connected") {
      el.innerHTML = "🟢 Connected";
      el.style.color = "#4CAF50";
    } else {
      el.innerHTML = "🔴 Disconnected";
      el.style.color = "#F44336";
    }

  } catch (err) {
    console.error(err);
  }
}

setInterval(updateStatus, 5000);
updateStatus();